from datetime import datetime
from uuid import UUID

from app.schemas.common import ORMModel


class RegistrationCreate(ORMModel):
    student_id: UUID


class RegistrationResponse(ORMModel):
    id: UUID
    event_id: UUID
    student_id: UUID
    status: str
    waitlist_position: int | None
    qr_token: str
    checked_in_at: datetime | None
    check_out_at: datetime | None
    created_at: datetime
