from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import supabase
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