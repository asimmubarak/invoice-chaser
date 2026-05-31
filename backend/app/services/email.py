import resend
from app.config import RESEND_API_KEY

resend.api_key = RESEND_API_KEY

def send_reminder_email(to_email: str, to_name: str, message: str, invoice_number: str) -> bool:
    try:
        params = {
            "from": "Invoice Chaser <onboarding@resend.dev>",
            "to": [to_email],
            "subject": f"Payment Reminder — Invoice {invoice_number}",
            "text": message,
        }
        email = resend.Emails.send(params)
        print(f"Email sent successfully: {email}")
        return True
    except Exception as e:
        print(f"Email error details: {str(e)}")
        raise Exception(str(e))