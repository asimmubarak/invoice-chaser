from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import invoices, clients, auth

app = FastAPI(title="Invoice Chaser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(clients.router, prefix="/clients", tags=["clients"])
app.include_router(invoices.router, prefix="/invoices", tags=["invoices"])

@app.get("/")
def root():
    return {"message": "Invoice Chaser API is running"}