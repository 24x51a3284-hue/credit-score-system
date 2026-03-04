import random
import time
from app.core.config import settings

# Store OTPs in memory {phone: {otp, expires_at}}
otp_store = {}


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def send_otp(phone: str) -> dict:
    otp = generate_otp()
    expires_at = time.time() + 300  # 5 minutes

    # Store OTP
    otp_store[phone] = {"otp": otp, "expires_at": expires_at}

    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"Your CreditIQ verification code is: {otp}. Valid for 5 minutes.",
            from_=settings.TWILIO_PHONE,
            to=f"+91{phone}"
        )
        print(f"OTP sent to +91{phone} — SID: {message.sid}")
        return {"success": True, "message": "OTP sent successfully"}
    except Exception as e:
        print(f"Twilio error: {e}")
        return {"success": False, "message": str(e)}


def verify_otp(phone: str, otp: str) -> bool:
    record = otp_store.get(phone)
    if not record:
        return False
    if time.time() > record["expires_at"]:
        del otp_store[phone]
        return False
    if record["otp"] != otp:
        return False
    del otp_store[phone]
    return True