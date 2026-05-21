from fastapi import APIRouter
from pydantic import BaseModel
from app.config import supabase
from typing import Optional

router = APIRouter()

class ClientCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None

@router.get("/")
def get_clients(user_id: str):
    result = supabase.table("clients").select("*").eq("user_id", user_id).execute()
    return result.data

@router.post("/")
def create_client(client: ClientCreate, user_id: str):
    data = client.model_dump()
    data["user_id"] = user_id
    result = supabase.table("clients").insert(data).execute()
    return result.data

@router.delete("/{client_id}")
def delete_client(client_id: str):
    result = supabase.table("clients").delete().eq("id", client_id).execute()
    return {"message": "Client deleted"}