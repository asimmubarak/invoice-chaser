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

def should_send_reminder(invoice_id: str, days: int) -> bool:
    # Only remind at day 3, 10, 20 and every 10 days after
    trigger_days = [3, 10, 20]
    if days > 20 and days % 10 == 0:
        trigger_days.append(days)

    if days not in trigger_days:
        return False

    # Check if reminder already sent for this day
    existing = supabase.table("reminders")\
        .select("id")\
        .eq("invoice_id", invoice_id)\
        .eq("reminder_day", days)\
        .execute()

    return len(existing.data) == 0

def generate_reminders():
    invoices = get_overdue_invoices()
    created = 0

    for invoice in invoices:
        days = days_overdue(invoice["due_date"])
        if should_send_reminder(invoice["id"], days):
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