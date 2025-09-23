# CCTV Threat Detection

A computer-vision system for **real-time CCTV threat detection** using YOLOv8.  
Detects suspicious objects/activities (weapons, fights, intrusions, falls, etc.), provides simple pose estimation support, and exposes a lightweight web dashboard for live monitoring.

---

## Table of contents
- [Features](#features)  
- [Demo](#demo)  
- [Requirements](#requirements)
> [!NOTE]
> This project is in development phase hence **Installation _and_ Quick-Start** is not available at the moment.
- [Project structure](#project-structure) 
- [Development notes](#development-notes)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  
- [Roadmap](#roadmap)

---

## Features :trollface:	
- Real-time object detection using YOLOv8.
- Optional pose estimation pipeline for behavior analysis.
- Live MJPEG stream served via a small Flask app.
- Modular layout: backend inference, frontend dashboard, helper scripts.
- Simple event logging hooks for saving short clips on detections.

---

## Demo
[> Add screenshots or a short GIF here after you run the inference and record example outputs.](https://github.com/user-attachments/assets/931f36d3-1147-40ff-a7de-d72f2318ccb8)

---

## Requirements
- Python 3.9+ (3.10/3.11 recommended)
- `pip`  
- GPU (optional) — recommended for real-time performance on high-resolution streams. If running CPU-only, performance will be lower.

Primary dependencies (also provided in `requirements.txt`):
- ultralytics
- torch
- opencv-python
- numpy
- flask


---

## Project Structure
+ cctv-threat-detection/
+ ├─ app.py                       # Flask app entrypoint (simple dashboard/stream)
+ ├─ backend/
+ │  ├─ test_infer.py             # Inference script for testing
+ │  ├─ infer.py                  # (optional) modular inference utilities
+ │  └─ tracker.py                # (optional) tracking utilities
+ ├─ frontend/
+ │  └─ Html/                     # HTML/JS/CSS dashboard files
+ ├─ scripts/
+ │  └─ download_weights.py       # Download helper for model weights
+ ├─ samples/                     # small sample images/videos for testing
+ ├─ weights/                     # runtime-downloaded weights (ignored in Git)
+ ├─ requirements.txt
+ └─ README.md


---

## Development notes

* Keep inference code modular: separate model loading, pre/post-processing, drawing utilities, and logging.

* Add a config.yaml or config.json to store: class mapping, confidence thresholds, model paths, and saving behavior.

* If using GPU, ensure your torch build matches CUDA version on the target machine.

---

## Contributing

+ Contributions are welcome. Please:

+ Fork the repository

+ Create a feature branch

+ Open a PR with a clear description and test cases

> [!IMPORTANT]
> Add CONTRIBUTING.md if you plan to accept external contributions.






