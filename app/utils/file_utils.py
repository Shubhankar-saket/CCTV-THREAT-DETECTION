import os
from uuid import uuid4

def save_upload_file(upload_file, destination_folder):
    filename = f"{uuid4().hex}_{upload_file.filename}"
    filepath = os.path.join(destination_folder, filename)
    with open(filepath, "wb") as f:
        f.write(upload_file.file.read())
    return filepath