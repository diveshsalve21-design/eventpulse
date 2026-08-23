import secrets
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User
from app.schemas.registration import RegistrationCreate, RegistrationResponse

router = APIRouter(prefix="/events", tags=["registrations"])


@router.post("/{event_id}/registrations/", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_for_event(event_id: UUID, payload: RegistrationCreate, db: Session = Depends(get_db)):
    event = db.get(Event, event_id)
    student = db.get(User, payload.student_id)
    if not event or not student:
        raise HTTPException(status_code=404, detail="Event or student not found")
    if event.registration_deadline < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Registration deadline has passed")
    if db.query(Registration).filter_by(event_id=event_id, student_id=payload.student_id).first():
        raise HTTPException(status_code=409, detail="Student is already registered for this event")

    # Conflict-aware registration prevents overlapping personal schedules.
    overlapping = db.query(Registration).join(Event).filter(
        Registration.student_id == payload.student_id,
        Registration.status.in_(["registered", "checked_in"]),
        Event.starts_at < event.ends_at,
        Event.ends_at > event.starts_at,
    ).first()
    if overlapping:
        raise HTTPException(status_code=409, detail="This event overlaps with another registered event")

    registered = db.query(func.count(Registration.id)).filter_by(event_id=event_id, status="registered").scalar() or 0
    status_value = "registered" if registered < event.capacity else "waitlisted"
    waitlist_position = None
    if status_value == "waitlisted":
        waitlist_position = (db.query(func.count(Registration.id)).filter_by(event_id=event_id, status="waitlisted").scalar() or 0) + 1
    registration = Registration(event_id=event_id, student_id=payload.student_id, status=status_value, waitlist_position=waitlist_position, qr_token=secrets.token_urlsafe(24))
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


@router.get("/{event_id}/registrations/", response_model=list[RegistrationResponse])
def get_event_registrations(event_id: UUID, db: Session = Depends(get_db)):
    return db.query(Registration).filter_by(event_id=event_id).all()


@router.get("/student/{student_id}/registrations", response_model=list[RegistrationResponse])
def get_student_registrations(student_id: UUID, db: Session = Depends(get_db)):
    return db.query(Registration).filter_by(student_id=student_id).all()


@router.delete("/{event_id}/registrations/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_registration(event_id: UUID, registration_id: UUID, db: Session = Depends(get_db)):
    registration = db.get(Registration, registration_id)
    if not registration or registration.event_id != event_id:
        raise HTTPException(status_code=404, detail="Registration not found")
    was_registered = registration.status == "registered"
    db.delete(registration)
    db.flush()

    if was_registered:
        next_student = db.query(Registration).filter_by(event_id=event_id, status="waitlisted").order_by(Registration.waitlist_position).first()
        if next_student:
            next_student.status, next_student.waitlist_position = "registered", None
            db.flush()

    # Re-index remaining waitlisted students to ensure contiguous 1, 2, 3... positioning
    waitlisted_students = db.query(Registration).filter_by(event_id=event_id, status="waitlisted").order_by(Registration.waitlist_position, Registration.created_at).all()
    for idx, reg in enumerate(waitlisted_students, start=1):
        reg.waitlist_position = idx

    db.commit()
    return None
