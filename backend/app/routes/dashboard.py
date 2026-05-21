from fastapi import APIRouter
from app.config import supabase

router = APIRouter()

@router.get("/")
def get_dashboard(user_id: str):
    # Get all invoices for this user
    invoices = supabase.table("invoices")\
        .select("*, clients(name)")\
        .eq("user_id", user_id)\
        .execute().data

    total_owed = 0
    total_overdue = 0
    total_paid = 0
    overdue_invoices = []
    recent_paid = []

    from datetime import date
    today = date.today()

    for inv in invoices:
        amount = inv["amount"]
        status = inv["status"]
        due = date.fromisoformat(inv["due_date"])

        if status == "paid":
            total_paid += amount
            recent_paid.append({
                "invoice_number": inv["invoice_number"],
                "client": inv["clients"]["name"],
                "amount": amount,
                "currency": inv["currency"]
            })
        elif status == "unpaid":
            total_owed += amount
            days = (today - due).days
            if days > 0:
                total_overdue += amount
                overdue_invoices.append({
                    "invoice_number": inv["invoice_number"],
                    "client": inv["clients"]["name"],
                    "amount": amount,
                    "currency": inv["currency"],
                    "days_overdue": days
                })

    # Get pending reminders count
    reminders = supabase.table("reminders")\
        .select("id")\
        .eq("user_id", user_id)\
        .eq("status", "pending")\
        .execute().data

    return {
        "summary": {
            "total_owed": total_owed,
            "total_overdue": total_overdue,
            "total_paid": total_paid,
            "pending_reminders": len(reminders)
        },
        "overdue_invoices": sorted(overdue_invoices, key=lambda x: x["days_overdue"], reverse=True),
        "recent_paid": recent_paid
    }