from datetime import datetime
from uuid import UUID

from pydantic import Field, model_validator

from app.schemas.common import ORMModel


class EventCreate(ORMModel):
    organizer_id: UUID
    title: str = Field(min_length=4, max_length=160)
    description: str = Field(min_length=20, max_length=3000)
    category: str = Field(max_length=50)
    venue: str = Field(max_length=150)
    starts_at: datetime
    ends_at: datetime
    registration_deadline: datetime
    capacity: int = Field(ge=5, le=2000)
    certificate_minimum_minutes: int = Field(default=45, ge=0)

    @model_validator(mode="after")
    def validate_schedule(self):
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        if self.registration_deadline >= self.starts_at:
            raise ValueError("registration_deadline must be before starts_at")
        return self


class EventResponse(EventCreate):
    id: UUID
    created_at: datetime
    registered_count: int = 0
    waitlisted_count: int = 0
