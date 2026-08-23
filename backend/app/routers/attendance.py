from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.registration import Registration
from app.schemas.common import AttendanceResponse, CheckInRequest

router = APIRouter(prefix="/attendance", tags=["attendance"])


def attendance_response(registration: Registration) -> AttendanceResponse:
    minutes = 0
    if registration.checked_in_at and registration.check_out_at:
        minutes = int((registration.check_out_at - registration.checked_in_at).total_seconds() / 60)
    return AttendanceResponse(registration_id=registration.id, student_name=registration.student.name, status=registration.status, checked_in_at=registration.checked_in_at, check_out_at=registration.check_out_at, certificate_eligible=minutes >= registration.event.certificate_minimum_minutes)


@router.post("/check-in", response_model=AttendanceResponse)
def check_in(payload: CheckInRequest, db: Session = Depends(get_db)):
    registration = db.query(Registration).filter_by(qr_token=payload.qr_token).first()
    if not registration or registration.status not in {"registered", "checked_in"}:
        raise HTTPException(status_code=404, detail="Valid registration not found")
    if not registration.checked_in_at:
        registration.checked_in_at, registration.status = datetime.now(timezone.utc), "checked_in"
        db.commit()
    db.refresh(registration)
    return attendance_response(registration)


@router.post("/check-out", response_model=AttendanceResponse)
def check_out(payload: CheckInRequest, db: Session = Depends(get_db)):
    registration = db.query(Registration).filter_by(qr_token=payload.qr_token).first()
    if not registration or registration.status != "checked_in":
        raise HTTPException(status_code=400, detail="Student has not checked in")
    registration.check_out_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(registration)
    return attendance_response(registration)
