from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from app.services.yolo_inference import run_detection
import os
from uuid import uuid4
import time

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
alerts = []

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    filename = f"{uuid4().hex}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(await file.read())

    detected_alerts = run_detection(filepath)
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    for det in detected_alerts:
        alerts.append({"type": det, "timestamp": timestamp, "video_path": filepath})

    return JSONResponse(content={"message": "Uploaded and processed", "alerts": detected_alerts})

@router.get("/alerts")
def get_alerts():
    return JSONResponse(content=alerts)