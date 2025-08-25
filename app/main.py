from fastapi import APIRouter, UploadFile, File, FastAPI
from fastapi.responses import JSONResponse
from app.services.yolo_inference import YOLOv8ThreatDetector as run_detection
import os
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware
import time
app=FastAPI(title="CCTV Threat Detection API", version="1.0.0")
router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
alerts = []
detector = run_detection()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for all origins (not recommended for prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    filename = f"{uuid4().hex}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(await file.read())

    detected_alerts = detector.detect_threats(filepath)
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    for det in detected_alerts:
        alerts.append({"type": det, "timestamp": timestamp, "video_path": filepath})

    return JSONResponse(content={"message": "Uploaded and processed", "alerts": detected_alerts})

@router.get("/alerts")
def get_alerts():
    return JSONResponse(content=alerts)

app.include_router(router)