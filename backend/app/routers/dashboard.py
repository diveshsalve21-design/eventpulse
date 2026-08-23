from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.models.registration import Registration

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    return {
        "total_events": db.query(func.count(Event.id)).scalar(),
        "total_registrations": db.query(func.count(Registration.id)).scalar(),
        "waitlisted_students": db.query(func.count(Registration.id)).filter(Registration.status == "waitlisted").scalar(),
        "checked_in_students": db.query(func.count(Registration.id)).filter(Registration.status == "checked_in").scalar(),
    }
