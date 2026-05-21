from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import supabase

router = APIRouter()

class SignUpRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(data: SignUpRequest):
    try:
        result = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {"full_name": data.full_name}
            }
        })
        user = result.user
        if not user:
            raise HTTPException(status_code=400, detail="Signup failed")

        supabase.table("profiles").insert({
            "id": str(user.id),
            "email": data.email,
            "full_name": data.full_name
        }).execute()

        return {"message": "Account created successfully", "user_id": str(user.id)}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(data: LoginRequest):
    try:
        result = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        user = result.user
        session = result.session

        return {
            "user_id": str(user.id),
            "email": user.email,
            "access_token": session.access_token
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")

@router.get("/health")
def auth_health():
    return {"status": "auth route working"}