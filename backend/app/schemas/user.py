from datetime import datetime
from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.common import ORMModel


class UserCreate(ORMModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    department: str | None = Field(default=None, max_length=100)
    role: str = Field(default="student", pattern="^(student|organizer|admin)$")


class UserResponse(UserCreate):
    id: UUID
    created_at: datetime
