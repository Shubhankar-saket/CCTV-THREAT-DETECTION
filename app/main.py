from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from uuid import uuid4
import os
import time

# --- Local Imports ---
import models
import auth
import schemas
from database import engine, get_db

# --- Real Detector Import ---
# Ensure your services/yolo_inference.py file exists in the backend directory
from services.yolo_inference import YOLOv8ThreatDetector as run_detection

# Create DB Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="VigiLens API", version="1.0.0")

# Allow Frontend Access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Initialize Real Detector
detector = run_detection()

# In-memory storage for alerts (You can move this to Postgres later if needed)
alerts = []
video_outputs = {} 

# ==========================================
# AUTHENTICATION ROUTES (Postgres)
# ==========================================

@app.post("/register", response_model=dict)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Creates a new user in the Postgres database."""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@app.post("/login", response_model=dict)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Verifies credentials and issues a JWT token."""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================
# DETECTION ROUTES (Real Logic)
# ==========================================

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """
    Uploads a video, runs the real YOLOv8 detection, 
    and returns aggregated threat alerts.
    """
    # 1. Save the uploaded file
    filename = f"{uuid4().hex}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(await file.read())

    # 2. Generate output path
    output_filename = f"processed_{filename}"
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    
    # 3. Run Real Detection
    try:
        # This calls your actual YOLO inference service
        result = detector.detect_threats(filepath, output_path=output_path)
    except Exception as e:
        print(f"Detection Error: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    
    # 4. Store mappings and alerts
    video_outputs[filename] = output_filename
    
    for threat_type, count in result["alerts"].items():
        alerts.append({
            "type": threat_type,
            "count": count,
            "timestamp": timestamp,
            "video_path": filepath
        })

    # 5. Return JSON response
    return JSONResponse(content={
        "message": "Uploaded and processed",
        "alerts": result["alerts"],
        "total_threats": result["total_threats"],
        "output_video": output_filename
    })

@app.post("/process-frame")
async def process_frame(file: UploadFile = File(...)):
    """
    Process a single frame from live camera feed.
    Returns annotated frame and detected threats.
    """
    import cv2
    import numpy as np
    import base64
    
    try:
        # Read the uploaded frame
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Process the frame
        result = detector.detect_threats_frame(frame)
        
        # Encode the annotated frame as base64
        _, buffer = cv2.imencode('.jpg', result["annotated_frame"])
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return JSONResponse(content={
            "annotated_frame": frame_base64,
            "alerts": result["alerts"],
            "total_threats": result["total_threats"]
        })
        
    except Exception as e:
        print(f"Frame processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Frame processing failed: {str(e)}")

@app.get("/alerts")
def get_alerts():
    """Returns the history of all detected alerts."""
    return JSONResponse(content=alerts)

@app.get("/video/{filename}")
def get_video(filename: str):
    """Serves the processed video files."""
    video_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(video_path):
        return FileResponse(video_path, media_type="video/mp4")
    return JSONResponse(content={"error": "Video not found"}, status_code=404)