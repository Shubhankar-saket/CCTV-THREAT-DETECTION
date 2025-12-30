# pose_intent_threat_detector_v5.py
from ultralytics import YOLO
import cv2
import numpy as np
from datetime import datetime
import time
from collections import deque
from utils.email_alert import send_twilio_alert


def point_in_bbox(pt, bbox_xyxy):
    x, y = pt
    x1, y1, x2, y2 = bbox_xyxy
    return (x1 <= x <= x2) and (y1 <= y <= y2)

# Calculate center of a bounding box
def center_of_bbox(b):
    x1, y1, x2, y2 = b
    return np.array([(x1 + x2) / 2.0, (y1 + y2) / 2.0], dtype=np.float32)


def vector_angle_deg(a, b, c):
    ba = np.array(a, dtype=np.float32) - np.array(b, dtype=np.float32)
    bc = np.array(c, dtype=np.float32) - np.array(b, dtype=np.float32)
    na = np.linalg.norm(ba)
    nc = np.linalg.norm(bc)
    if na < 1e-6 or nc < 1e-6:
        return 180.0
    cosang = np.dot(ba, bc) / (na * nc)
    cosang = np.clip(cosang, -1.0, 1.0)
    return float(np.degrees(np.arccos(cosang)))


def line_towards_target_score(p_from, p_dir, target_center):
    v1 = np.array(p_dir, dtype=np.float32) - np.array(p_from, dtype=np.float32)
    v2 = np.array(target_center, dtype=np.float32) - np.array(p_from, dtype=np.float32)
    n1 = np.linalg.norm(v1)
    n2 = np.linalg.norm(v2)
    if n1 < 1e-6 or n2 < 1e-6:
        return -1.0
    return float(np.dot(v1, v2) / (n1 * n2))


class YOLOv8ThreatDetector:
    KP_LEFT_SHOULDER = 5
    KP_RIGHT_SHOULDER = 6
    KP_LEFT_ELBOW = 7
    KP_RIGHT_ELBOW = 8
    KP_LEFT_WRIST = 9
    KP_RIGHT_WRIST = 10

    def __init__(
        self,
        weapon_model_path="C:\\Users\\shubh\\runs\\detect\\train19\\weights\\best.pt",
        pose_model_name="C:\\Users\\shubh\\CCTV_THREAT_DETECTION\\yolov8n-pose.pt",
        conf_thr=0.4,
        device=None,
    ):
        self.weapon_model = YOLO(str(weapon_model_path))
        self.pose_model = YOLO(str(pose_model_name))
        self.conf_thr = conf_thr
        self.device = device

        self.last_alert_time = 0
        self.cooldown_seconds = 5

        # updated threat classes from your model
        self.THREAT_CLASSES = {"handgun", "short_rifle", "knife"}
        self.PERSON_CLASS = "person"

        self.consistency_frames = 3
        self.recent_high_flags = deque(maxlen=self.consistency_frames)

    def _class_label(self, cls_id, names):
        return names[int(cls_id)].lower()

    def _extract_pose_persons(self, pose_result):
        persons = []
        boxes = pose_result.boxes.xyxy.cpu().numpy() if pose_result.boxes is not None else []
        kps = pose_result.keypoints.xy.cpu().numpy() if pose_result.keypoints is not None else []

        for i in range(len(boxes)):
            kp_xy = kps[i] if i < len(kps) else None
            if kp_xy is None:
                continue
            persons.append({
                "bbox": boxes[i].astype(np.float32),
                "kps": kp_xy.astype(np.float32)
            })
        return persons

    def _extract_weapons_and_people(self, det_result, names):
        weapons, persons = [], []
        if det_result.boxes is None:
            return weapons, persons

        for b in det_result.boxes:
            if b.conf is None or b.cls is None or b.xyxy is None:
                continue
            conf = float(b.conf[0])
            if conf < self.conf_thr:
                continue
            lbl = self._class_label(b.cls[0], names)
            box = b.xyxy[0].cpu().numpy().astype(np.float32)

            if lbl == self.PERSON_CLASS:
                persons.append({"bbox": box})
            elif lbl in self.THREAT_CLASSES:
                weapons.append({"bbox": box, "label": lbl, "conf": conf})
        return weapons, persons

    def _weapon_in_hand_and_intent(self, weapon_box, pose_person, other_people_centers,
                                   arm_straight_angle_deg=35.0, pointing_cos_sim=0.65):
        kps = pose_person["kps"]
        lw, rw = kps[self.KP_LEFT_WRIST], kps[self.KP_RIGHT_WRIST]
        le, re = kps[self.KP_LEFT_ELBOW], kps[self.KP_RIGHT_ELBOW]
        ls, rs = kps[self.KP_LEFT_SHOULDER], kps[self.KP_RIGHT_SHOULDER]

        wrists = [("L", lw), ("R", rw)]
        in_hand = any(point_in_bbox(w[1], weapon_box) for w in wrists)

        if not in_hand:
            return False, None

        intents = []
        for side, wrist in wrists:
            if side == "L":
                elbow, shoulder = le, ls
            else:
                elbow, shoulder = re, rs

            elbow_angle = vector_angle_deg(shoulder, elbow, wrist)
            arm_extended = elbow_angle < arm_straight_angle_deg

            pointing = False
            if arm_extended and other_people_centers:
                for c in other_people_centers:
                    cos_sim = line_towards_target_score(elbow, wrist, c)
                    if cos_sim >= pointing_cos_sim:
                        pointing = True
                        break

            if pointing:
                intents.append("pointing")
            elif arm_extended:
                intents.append("extended")
            else:
                intents.append("carrying")

        if "pointing" in intents:
            return True, "pointing"
        if "extended" in intents:
            return True, "extended"
        return True, "carrying"

    def detect_threats(self, video_path, output_path="output_with_pose.mp4"):
        results = self.weapon_model(video_path, conf=self.conf_thr)
        cap = cv2.VideoCapture(video_path)
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_path, fourcc, cap.get(cv2.CAP_PROP_FPS),
                              (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))))

        frame_idx = 0
        detected_classes = []

        for frame_res in results:
            frame = frame_res.orig_img.copy()

            # Pose detection
            pose_res = self.pose_model(frame, conf=0.25, device=self.device)[0]
            pose_persons = self._extract_pose_persons(pose_res)
            pose_centers = [center_of_bbox(p["bbox"]) for p in pose_persons]
            person_intents = ["None"] * len(pose_persons)

            # Weapon detection
            weapons, _ = self._extract_weapons_and_people(frame_res, self.weapon_model.names)

            high_threat_in_frame = False
            medium_threat_in_frame = False

            # Analyze weapons & intent
            for w in weapons:
                wbox = w["bbox"]
                closest_idx, closest_dist = -1, float("inf")
                w_center = center_of_bbox(wbox)
                for i, p in enumerate(pose_persons):
                    d = np.linalg.norm(center_of_bbox(p["bbox"]) - w_center)
                    if d < closest_dist:
                        closest_dist = d
                        closest_idx = i

                in_hand, intent = False, None
                other_centers = [c for j, c in enumerate(pose_centers) if j != closest_idx]

                if closest_idx != -1:
                    in_hand, intent = self._weapon_in_hand_and_intent(
                        wbox, pose_persons[closest_idx], other_centers
                    )
                    person_intents[closest_idx] = intent if intent else "carrying"

                if in_hand and intent == "pointing":
                    high_threat_in_frame = True
                elif in_hand:
                    medium_threat_in_frame = True

                detected_classes.append(w["label"])

                # Draw weapon boxes
                x1, y1, x2, y2 = map(int, wbox)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, f"{w['label']}", (x1, y1 - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,255), 1)

            # Draw poses and threat levels
            if pose_res.keypoints is not None:
                for i, kps in enumerate(pose_res.keypoints.xy.cpu().numpy()):
                    for x, y in kps:
                        cv2.circle(frame, (int(x), int(y)), 4, (0, 255, 0), -1)
                    # Draw bounding box & threat level
                    bbox = pose_persons[i]["bbox"]
                    x1, y1, x2, y2 = map(int, bbox)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, person_intents[i].upper(), (x1, y1-10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 1)

            # Send alerts
            current_time = time.time()
            if high_threat_in_frame and (current_time - self.last_alert_time > self.cooldown_seconds):
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                send_twilio_alert("HIGH threat detected", timestamp)
                self.last_alert_time = current_time
            elif medium_threat_in_frame and (current_time - self.last_alert_time > self.cooldown_seconds):
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                send_twilio_alert("MEDIUM threat detected", timestamp)
                self.last_alert_time = current_time

            out.write(frame)
            frame_idx += 1

        cap.release()
        out.release()
        
        # Aggregate alerts by counting occurrences of each threat type
        alert_counts = {}
        for threat_class in detected_classes:
            alert_counts[threat_class] = alert_counts.get(threat_class, 0) + 1
        
        return {
            "alerts": alert_counts,
            "output_path": output_path,
            "total_threats": len(detected_classes)
        }

    def detect_threats_frame(self, frame):
        """
        Process a single frame for threat detection (for live camera feed).
        
        Args:
            frame: numpy array (BGR image from cv2 or similar)
            
        Returns:
            dict with:
                - annotated_frame: numpy array with drawings
                - alerts: dict of threat types and counts
                - total_threats: int
        """
        # Run weapon detection on the frame
        weapon_results = self.weapon_model(frame, conf=self.conf_thr)[0]
        
        # Run pose detection
        pose_res = self.pose_model(frame, conf=0.25, device=self.device)[0]
        pose_persons = self._extract_pose_persons(pose_res)
        pose_centers = [center_of_bbox(p["bbox"]) for p in pose_persons]
        person_intents = ["None"] * len(pose_persons)
        
        # Extract weapons
        weapons, _ = self._extract_weapons_and_people(weapon_results, self.weapon_model.names)
        
        detected_threats = []
        
        # Analyze weapons & intent
        for w in weapons:
            wbox = w["bbox"]
            closest_idx, closest_dist = -1, float("inf")
            w_center = center_of_bbox(wbox)
            for i, p in enumerate(pose_persons):
                d = np.linalg.norm(center_of_bbox(p["bbox"]) - w_center)
                if d < closest_dist:
                    closest_dist = d
                    closest_idx = i
            
            in_hand, intent = False, None
            other_centers = [c for j, c in enumerate(pose_centers) if j != closest_idx]
            
            if closest_idx != -1:
                in_hand, intent = self._weapon_in_hand_and_intent(
                    wbox, pose_persons[closest_idx], other_centers
                )
                person_intents[closest_idx] = intent if intent else "carrying"
            
            detected_threats.append(w["label"])
            
            # Draw weapon boxes
            x1, y1, x2, y2 = map(int, wbox)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(frame, f"{w['label']}", (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
        
        # Draw poses
        if pose_res.keypoints is not None and len(pose_persons) > 0:
            for i, kps in enumerate(pose_res.keypoints.xy.cpu().numpy()):
                for x, y in kps:
                    if x > 0 and y > 0:  # Only draw valid keypoints
                        cv2.circle(frame, (int(x), int(y)), 4, (0, 255, 0), -1)
                # Draw bounding box & threat level
                if i < len(pose_persons):
                    bbox = pose_persons[i]["bbox"]
                    x1, y1, x2, y2 = map(int, bbox)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, person_intents[i].upper(), (x1, y1-10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Aggregate alerts
        alert_counts = {}
        for threat_class in detected_threats:
            alert_counts[threat_class] = alert_counts.get(threat_class, 0) + 1
        
        return {
            "annotated_frame": frame,
            "alerts": alert_counts,
            "total_threats": len(detected_threats)
        }
