import os
import requests
from pathlib import Path

def download_yolov8n(model_dir="app/models", filename="yolov8n.pt"):
    os.makedirs(model_dir, exist_ok=True)
    model_path = Path(model_dir) / filename

    if model_path.exists():
        print(f"✅ YOLOv8 model already exists at: {model_path}")
        return model_path

    print("⬇️  Downloading yolov11n.pt...")
    url = "https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov11n.pt"
    
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(model_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print(f"✅ Download complete: {model_path}")
    else:
        raise RuntimeError(f"Failed to download yolov8n.pt. Status code: {response.status_code}")

    return model_path
