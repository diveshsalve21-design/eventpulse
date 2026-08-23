-- Run this once in Supabase SQL Editor.
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  email varchar(150) unique not null,
  department varchar(100),
  role varchar(20) not null default 'student' check (role in ('student', 'organizer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references users(id) on delete cascade,
  title varchar(160) not null,
  description text not null,
  category varchar(50) not null,
  venue varchar(150) not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  registration_deadline timestamptz not null check (registration_deadline < starts_at),
  capacity integer not null check (capacity between 5 and 2000),
  certificate_minimum_minutes integer not null default 45 check (certificate_minimum_minutes >= 0),
  created_at timestamptz not null default now()
);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  student_id uuid not null references users(id) on delete cascade,
  status varchar(20) not null default 'registered' check (status in ('registered', 'waitlisted', 'checked_in', 'cancelled')),
  waitlist_position integer,
  qr_token varchar(64) unique not null,
  checked_in_at timestamptz,
  check_out_at timestamptz,
  created_at timestamptz not null default now(),
  unique(event_id, student_id)
);

create index if not exists idx_events_starts_at on events(starts_at);
create index if not exists idx_registrations_event_status on registrations(event_id, status);
create index if not exists idx_registrations_student on registrations(student_id);
