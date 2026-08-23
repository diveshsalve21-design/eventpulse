from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Message(BaseModel):
    message: str


class CheckInRequest(BaseModel):
    qr_token: str


class AttendanceResponse(BaseModel):
    registration_id: UUID
    student_name: str
    status: str
    checked_in_at: datetime | None
    check_out_at: datetime | None
    certificate_eligible: bool
