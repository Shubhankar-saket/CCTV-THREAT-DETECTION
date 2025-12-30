from twilio.rest import Client
import os

SID = os.getenv("TWILIO_SID")
AUTH_TOKEN = os.getenv("TWILIO_TOKEN")
FROM_NUMBER = os.getenv("TWILIO_FROM")
TO_NUMBER = os.getenv("USER_PHONE")

def send_twilio_alert(threat_type, timestamp):
    client = Client(SID, AUTH_TOKEN)

    message = f"🚨 VIGILENS ALERT: {threat_type} detected at {timestamp}. Check dashboard immediately."

    client.messages.create(
        body=message,
        from_=FROM_NUMBER,
        to=TO_NUMBER
    )