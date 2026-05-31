from app.config import supabase
from datetime import date

def get_overdue_invoices():
    today = str(date.today())
    result = supabase.table("invoices")\
        .select("*, clients(name, email)")\
        .eq("status", "unpaid")\
        .lt("due_date", today)\
        .execute()
    return result.data

def days_overdue(due_date_str: str) -> int:
    due = date.fromisoformat(due_date_str)
    return (date.today() - due).days

def draft_reminder_message(invoice: dict, days: int) -> str:
    client_name = invoice["clients"]["name"]
    amount = invoice["amount"]
    currency = invoice["currency"]
    invoice_number = invoice["invoice_number"]

    if days <= 7:
        return (
            f"Hi {client_name},\n\n"
            f"Just a friendly reminder that invoice {invoice_number} "
            f"for {currency} {amount:,.0f} was due {days} day(s) ago.\n\n"
            f"Please let us know if you have any questions.\n\n"
            f"Thanks!"
        )
    elif days <= 21:
        return (
            f"Hi {client_name},\n\n"
            f"This is a follow-up regarding invoice {invoice_number} "
            f"for {currency} {amount:,.0f}, which is now {days} days overdue.\n\n"
            f"Could you please arrange payment at your earliest convenience?\n\n"
            f"Thanks!"
        )
    else:
        return (
            f"Hi {client_name},\n\n"
            f"Invoice {invoice_number} for {currency} {amount:,.0f} "
            f"is now {days} days overdue. This requires immediate attention.\n\n"
            f"Please make payment today or contact us to discuss.\n\n"
            f"Regards"
        )

def already_reminded_recently(invoice_id: str) -> bool:
    """Check if a reminder was created in the last 10 days."""
    result = supabase.table("reminders")\
        .select("id, created_at")\
        .eq("invoice_id", invoice_id)\
        .order("created_at", desc=True)\
        .limit(1)\
        .execute()

    if not result.data:
        return False

    last = result.data[0]["created_at"]
    last_date = date.fromisoformat(last[:10])
    days_since = (date.today() - last_date).days
    return days_since < 10

def generate_reminders():
    invoices = get_overdue_invoices()
    created = 0

    for invoice in invoices:
        days = days_overdue(invoice["due_date"])

        # Skip if reminded in last 10 days
        if already_reminded_recently(invoice["id"]):
            continue

        message = draft_reminder_message(invoice, days)
        supabase.table("reminders").insert({
            "invoice_id": invoice["id"],
            "user_id": invoice["user_id"],
            "reminder_day": days,
            "message": message,
            "status": "pending"
        }).execute()
        created += 1

    return {"reminders_created": created}