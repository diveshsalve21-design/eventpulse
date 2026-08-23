# EventPulse — Smart College Event Management

EventPulse is a college event platform that goes beyond simple registrations. It prevents student timetable conflicts, automatically promotes the waitlist when seats open, issues secure QR tokens for attendance, and calculates certificate eligibility from time spent at an event.

## Main modules

| Module | Purpose |
| --- | --- |
| `models/` | SQLAlchemy table definitions: User, Event, Registration |
| `schemas/` | Pydantic request/response validation |
| `routers/` | REST APIs for users, events, registrations, attendance and dashboard |
| `supabase.sql` | Supabase PostgreSQL tables, constraints and indexes |

## Unique features

- Conflict-aware registration: a student cannot join overlapping events.
- Smart waitlist: cancelling a confirmed seat promotes the first waitlisted student.
- QR-token attendance: secure check-in and check-out endpoints.
- Certificate eligibility: calculated from actual attendance time.
- Organizer dashboard: live counts for events, registrations, waitlist and attendance.

## Run it

1. Create a Supabase project and run `supabase.sql` in its SQL Editor.
2. Copy `.env.example` to `.env` and add the database URL.
3. In `backend`:

```powershell
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

4. Open `http://127.0.0.1:8000/docs` for API testing. Serve `frontend` using `python -m http.server 8080` and open `http://127.0.0.1:8080`.

## Suggested demo flow

Create an organizer user, create two events, register a student, fill an event to show the waitlist, cancel one registration to show promotion, then use the returned `qr_token` to check the student in and out.
