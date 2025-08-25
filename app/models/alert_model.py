from pydantic import BaseModel

class Alert(BaseModel):
    type: str
    timestamp: str
    video_path: str