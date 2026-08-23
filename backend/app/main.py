from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # Registers every SQLAlchemy table before create_all.
from app.database import Base, engine
from app.routers import attendance, dashboard, events, registrations, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EventPulse API", version="1.0.0", description="Conflict-aware campus event management with QR attendance and smart waitlists.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

app.include_router(users.router)
app.include_router(events.router)
app.include_router(registrations.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "EventPulse API is running", "docs": "/docs"}
