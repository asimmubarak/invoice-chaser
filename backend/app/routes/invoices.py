from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import supabase
from app.services.email import send_reminder_email
from datetime import date
from typing import Optional

router = APIRouter()

class InvoiceCreate(BaseModel):
    client_id: str
    invoice_number: str
    amount: float
    currency: str = "USD"
    due_date: date
    notes: Optional[str] = None

@router.get("/")
def get_invoices(user_id: str):
    result = supabase.table("invoices").select("*, clients(name, email)").eq("user_id", user_id).execute()
    return result.data

@router.post("/")
def create_invoice(invoice: InvoiceCreate, user_id: str):
    data = invoice.model_dump()
    data["user_id"] = user_id
    data["due_date"] = str(data["due_date"])
    result = supabase.table("invoices").insert(data).execute()
    return result.data

@router.patch("/{invoice_id}/mark-paid")
def mark_paid(invoice_id: str):
    result = supabase.table("invoices").update({"status": "paid"}).eq("id", invoice_id).execute()
    return result.data

@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: str):
    result = supabase.table("invoices").delete().eq("id", invoice_id).execute()
    return {"message": "Invoice deleted"}

@router.get("/reminders")
def get_reminders(user_id: str):
    result = supabase.table("reminders")\
        .select("*, invoices(invoice_number, amount, currency, due_date, clients(name, email))")\
        .eq("user_id", user_id)\
        .eq("status", "pending")\
        .execute()
    return result.data

@router.patch("/reminders/{reminder_id}/approve")
def approve_reminder(reminder_id: str):
    result = supabase.table("reminders")\
        .update({"status": "approved"})\
        .eq("id", reminder_id)\
        .execute()
    return result.data

@router.patch("/reminders/{reminder_id}/cancel")
def cancel_reminder(reminder_id: str):
    result = supabase.table("reminders")\
        .update({"status": "cancelled"})\
        .eq("id", reminder_id)\
        .execute()
    return result.data

@router.post("/reminders/{reminder_id}/send")
def send_reminder(reminder_id: str):
    result = supabase.table("reminders")\
        .select("*, invoices(invoice_number, clients(name, email))")\
        .eq("id", reminder_id)\
        .eq("status", "approved")\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Reminder not found or not approved")

    reminder = result.data[0]
    client = reminder["invoices"]["clients"]
    invoice_number = reminder["invoices"]["invoice_number"]

    success = send_reminder_email(
        to_email=client["email"],
        to_name=client["name"],
        message=reminder["message"],
        invoice_number=invoice_number
    )

    if success:
        supabase.table("reminders")\
            .update({"status": "sent", "sent_at": str(date.today())})\
            .eq("id", reminder_id)\
            .execute()
        return {"message": "Reminder sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")