import smtplib

import requests
import os

# Use environment variables or hardcode for testing
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "7986120319:AAGQogy5kI6-BlqUM0NxS3qZnL1nqMkMXh4")  # replace with real token
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "1199854974")  # your personal chat ID

def send_telegram_alert(threat_type, timestamp, image_path=None):
    message = f"🚨 *Threat Detected!*\n\n🧠 *Type:* `{threat_type}`\n🕒 *Time:* `{timestamp}`"

    # Send text alert
    send_text_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    requests.post(send_text_url, data={
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    })

    # Optional: Send image if available
    if image_path and os.path.exists(image_path):
        send_photo_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"
        with open(image_path, "rb") as img:
            requests.post(send_photo_url, files={"photo": img}, data={"chat_id": CHAT_ID})
