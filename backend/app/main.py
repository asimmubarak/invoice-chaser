from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import invoices, clients, auth, dashboard
from app.services.reminder import generate_reminders
from apscheduler.schedulers.background import BackgroundScheduler

app = FastAPI(title="Invoice Chaser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(clients.router, prefix="/clients", tags=["clients"])
app.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

scheduler = BackgroundScheduler()
scheduler.add_job(generate_reminders, "cron", hour=9, minute=0)
scheduler.start()

@app.get("/")
def root():
    return {"message": "Invoice Chaser API is running"}

@app.post("/run-reminders")
def run_reminders():
    result = generate_reminders()
    return result