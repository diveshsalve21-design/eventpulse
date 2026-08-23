from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User
from app.schemas.event import EventCreate, EventResponse

router = APIRouter(prefix="/events", tags=["events"])


def event_response(event: Event, db: Session) -> EventResponse:
    counts = dict(db.query(Registration.status, func.count(Registration.id)).filter(Registration.event_id == event.id).group_by(Registration.status).all())
    return EventResponse(**{column.name: getattr(event, column.name) for column in Event.__table__.columns}, registered_count=counts.get("registered", 0), waitlisted_count=counts.get("waitlisted", 0))


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    organizer = db.get(User, payload.organizer_id)
    if not organizer or organizer.role not in {"organizer", "admin"}:
        raise HTTPException(status_code=403, detail="A valid organizer account is required")
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event_response(event, db)


@router.get("/", response_model=list[EventResponse])
def list_events(category: str | None = None, upcoming_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(Event)
    if category:
        query = query.filter(Event.category.ilike(f"%{category}%"))
    if upcoming_only:
        query = query.filter(Event.starts_at >= datetime.now(timezone.utc))
    return [event_response(event, db) for event in query.order_by(Event.starts_at).all()]


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: UUID, db: Session = Depends(get_db)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event_response(event, db)
