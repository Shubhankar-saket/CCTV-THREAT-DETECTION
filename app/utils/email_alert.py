from twilio.rest import Client
import os

SID = os.getenv("TWILIO_SID",  "AC4f7dd918bc6a747fc1df95efc0646c95")
AUTH_TOKEN = os.getenv("TWILIO_TOKEN", "a04daa74191545b1f5072ed8fd2dce0f")
FROM_NUMBER = os.getenv("TWILIO_FROM", "+16592225065") # e.g., +1234567890
TO_NUMBER = os.getenv("USER_PHONE", "+916205582857")

def send_twilio_alert(threat_type, timestamp):
    client = Client(SID, AUTH_TOKEN)

    message = f"🚨 VIGILENS ALERT: {threat_type} detected at {timestamp}. Check dashboard immediately."

    client.messages.create(
        body=message,
        from_=FROM_NUMBER,
        to=TO_NUMBER
    )