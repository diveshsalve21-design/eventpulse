import secrets
from datetime import datetime, timedelta, timezone
from app.database import SessionLocal, engine
from app.models.user import User
from app.models.event import Event
from app.models.registration import Registration
from sqlalchemy import text

def seed_database():
    db = SessionLocal()
    try:
        print("Cleaning up old data...")
        db.execute(text("TRUNCATE TABLE registrations, events, users CASCADE;"))
        db.commit()

        print("Creating organizer user...")
        organizer = User(
            name="Dr. Sarah Connor",
            email="organizer@campus.edu",
            department="Computer Science & Engineering",
            role="organizer"
        )
        db.add(organizer)
        db.commit()
        db.refresh(organizer)

        print("Creating 20 student users...")
        student_data = [
            ("Alex Smith", "alex.smith@campus.edu", "Computer Science"),
            ("Priya Patel", "priya.patel@campus.edu", "Information Technology"),
            ("Jordan Lee", "jordan.lee@campus.edu", "Electronics"),
            ("Sam Wilson", "sam.wilson@campus.edu", "Mechanical"),
            ("Maya Lin", "maya.lin@campus.edu", "Data Science"),
            ("David Kumar", "david.kumar@campus.edu", "Computer Science"),
            ("Emily Davis", "emily.davis@campus.edu", "Cybersecurity"),
            ("Lucas Rossi", "lucas.rossi@campus.edu", "AI & ML"),
            ("Nisha Sharma", "nisha.sharma@campus.edu", "Information Technology"),
            ("Ryan Clark", "ryan.clark@campus.edu", "Electrical"),
            ("Chloe Bennett", "chloe.bennett@campus.edu", "Civil"),
            ("Ethan Hunt", "ethan.hunt@campus.edu", "Computer Science"),
            ("Sophia Martinez", "sophia.martinez@campus.edu", "Software Engineering"),
            ("Daniel Kim", "daniel.kim@campus.edu", "Robotics"),
            ("Olivia Taylor", "olivia.taylor@campus.edu", "Data Science"),
            ("Liam Johnson", "liam.johnson@campus.edu", "Artificial Intelligence"),
            ("Ava Brown", "ava.brown@campus.edu", "Computer Science"),
            ("Noah Garcia", "noah.garcia@campus.edu", "Cybersecurity"),
            ("Isabella White", "isabella.white@campus.edu", "Electrical"),
            ("Mason Harris", "mason.harris@campus.edu", "Software Engineering")
        ]

        students = []
        for name, email, dept in student_data:
            s = User(name=name, email=email, department=dept, role="student")
            db.add(s)
            students.append(s)
        db.commit()
        for s in students:
            db.refresh(s)

        now = datetime.now(timezone.utc)

        print("Creating 5 main campus events with distinct schedules...")
        events = [
            Event(
                organizer_id=organizer.id,
                title="AI & Robotics National Summit",
                description="Explore cutting-edge advances in neural networks, autonomous robotics, and computer vision with industry experts.",
                category="Seminar",
                venue="Main Auditorium",
                starts_at=now + timedelta(days=2, hours=10),
                ends_at=now + timedelta(days=2, hours=14),
                registration_deadline=now + timedelta(days=1, hours=18),
                capacity=150,
                certificate_minimum_minutes=60
            ),
            Event(
                organizer_id=organizer.id,
                title="Campus 24-Hour Hackathon",
                description="Intensive coding challenge where student teams build innovative full-stack solutions to real campus problems.",
                category="Hackathon",
                venue="Innovation Lab 302",
                starts_at=now + timedelta(days=4, hours=9),
                ends_at=now + timedelta(days=4, hours=17),
                registration_deadline=now + timedelta(days=3, hours=12),
                capacity=10,  # Small capacity to demonstrate WAITLIST!
                certificate_minimum_minutes=120
            ),
            Event(
                organizer_id=organizer.id,
                title="Design Thinking & UX Workshop",
                description="Hands-on workshop covering user research, prototyping in Figma, and usability testing for web applications.",
                category="Workshop",
                venue="Design Studio B",
                starts_at=now + timedelta(days=6, hours=11),
                ends_at=now + timedelta(days=6, hours=14),
                registration_deadline=now + timedelta(days=5, hours=15),
                capacity=40,
                certificate_minimum_minutes=45
            ),
            Event(
                organizer_id=organizer.id,
                title="Leadership & Career Seminar",
                description="Learn interview strategies, personal branding, and project management skills from top campus alumni.",
                category="Seminar",
                venue="Lecture Hall A",
                starts_at=now + timedelta(days=8, hours=14),
                ends_at=now + timedelta(days=8, hours=17),
                registration_deadline=now + timedelta(days=7, hours=18),
                capacity=60,
                certificate_minimum_minutes=45
            ),
            Event(
                organizer_id=organizer.id,
                title="Cloud Computing & DevOps Webinar",
                description="Live interactive webinar detailing Docker, Kubernetes, AWS infrastructure, and modern CI/CD pipelines.",
                category="Webinar",
                venue="Virtual Conference Room",
                starts_at=now + timedelta(days=10, hours=16),
                ends_at=now + timedelta(days=10, hours=18),
                registration_deadline=now + timedelta(days=9, hours=20),
                capacity=100,
                certificate_minimum_minutes=30
            ),
        ]

        for e in events:
            db.add(e)
        db.commit()
        for e in events:
            db.refresh(e)

        print("Registering students for events...")
        # Event 0: AI Summit -> Register 14 students
        for i in range(14):
            reg = Registration(
                event_id=events[0].id,
                student_id=students[i].id,
                status="registered",
                qr_token=secrets.token_urlsafe(24)
            )
            db.add(reg)

        # Event 1: Hackathon (Cap 10) -> Register 13 students (10 confirmed, 3 waitlisted!)
        for i in range(13):
            is_waitlist = i >= 10
            reg = Registration(
                event_id=events[1].id,
                student_id=students[i].id,
                status="waitlisted" if is_waitlist else "registered",
                waitlist_position=(i - 9) if is_waitlist else None,
                qr_token=secrets.token_urlsafe(24)
            )
            db.add(reg)

        # Event 2: UX Workshop -> Register 8 students
        for i in range(5, 13):
            reg = Registration(
                event_id=events[2].id,
                student_id=students[i].id,
                status="registered",
                qr_token=secrets.token_urlsafe(24)
            )
            db.add(reg)

        # Event 3: Leadership Seminar -> Register 16 students
        for i in range(2, 18):
            reg = Registration(
                event_id=events[3].id,
                student_id=students[i].id,
                status="registered",
                qr_token=secrets.token_urlsafe(24)
            )
            db.add(reg)

        # Event 4: DevOps Webinar -> Register 18 students
        for i in range(18):
            reg = Registration(
                event_id=events[4].id,
                student_id=students[i].id,
                status="registered",
                qr_token=secrets.token_urlsafe(24)
            )
            db.add(reg)

        db.commit()

        # Add attendance records for some registered students to show live attendance
        print("Adding sample attendance records...")
        first_event_regs = db.query(Registration).filter_by(event_id=events[0].id, status="registered").all()
        for idx, reg in enumerate(first_event_regs[:5]):
            reg.checked_in_at = now - timedelta(hours=2)
            if idx < 3: # 3 students checked out after 90 mins -> eligible for certificate!
                reg.check_out_at = now - timedelta(minutes=30)
                reg.status = "checked_in"
            else:
                reg.status = "checked_in"

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print("Error seeding database:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
