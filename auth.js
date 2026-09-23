const DEFAULT_ONLINE_API = "https://lovely-numbers-strive.loca.lt";

// --- In-Browser DB Engine for Offline & Static Host Support ---
const MOCK_STORAGE_KEY = "eventpulse_mock_db";

function getMockDb() {
  try {
    const data = localStorage.getItem(MOCK_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return initMockDb();
}

function saveMockDb(db) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {}
}

function initMockDb() {
  const now = new Date();
  const db = {
    users: [
      { id: "u-org-1", name: "Dr. Sarah Connor", email: "organizer@campus.edu", role: "organizer", department: "Computer Science & Engineering" },
      { id: "u-org-2", name: "Prof. Alan Turing", email: "turing@campus.edu", role: "admin", department: "Information Technology" },
      { id: "u-1", name: "Alex Smith", email: "alex.smith@campus.edu", role: "student", department: "Computer Science" },
      { id: "u-2", name: "Priya Patel", email: "priya.patel@campus.edu", role: "student", department: "Information Technology" },
      { id: "u-3", name: "Jordan Lee", email: "jordan.lee@campus.edu", role: "student", department: "Electronics" },
      { id: "u-4", name: "Sam Wilson", email: "sam.wilson@campus.edu", role: "student", department: "Mechanical" },
      { id: "u-5", name: "Maya Lin", email: "maya.lin@campus.edu", role: "student", department: "Data Science" }
    ],
    events: [
      {
        id: "ev-1",
        organizer_id: "u-org-1",
        title: "AI & Robotics National Summit",
        description: "Explore cutting-edge advances in neural networks, autonomous robotics, and computer vision with industry experts.",
        category: "Seminar",
        venue: "Main Auditorium",
        starts_at: new Date(now.getTime() + 2 * 86400000 + 36000000).toISOString(),
        ends_at: new Date(now.getTime() + 2 * 86400000 + 50400000).toISOString(),
        registration_deadline: new Date(now.getTime() + 1 * 86400000 + 64800000).toISOString(),
        capacity: 150,
        certificate_minimum_minutes: 60,
        registered_count: 14,
        waitlisted_count: 0
      },
      {
        id: "ev-2",
        organizer_id: "u-org-1",
        title: "Campus 24-Hour Hackathon",
        description: "Intensive coding challenge where student teams build innovative full-stack solutions to real campus problems.",
        category: "Hackathon",
        venue: "Innovation Lab 302",
        starts_at: new Date(now.getTime() + 4 * 86400000 + 32400000).toISOString(),
        ends_at: new Date(now.getTime() + 4 * 86400000 + 61200000).toISOString(),
        registration_deadline: new Date(now.getTime() + 3 * 86400000 + 43200000).toISOString(),
        capacity: 10,
        certificate_minimum_minutes: 120,
        registered_count: 10,
        waitlisted_count: 3
      },
      {
        id: "ev-3",
        organizer_id: "u-org-1",
        title: "Design Thinking & UX Workshop",
        description: "Hands-on workshop covering user research, prototyping in Figma, and usability testing for web applications.",
        category: "Workshop",
        venue: "Design Studio B",
        starts_at: new Date(now.getTime() + 6 * 86400000 + 39600000).toISOString(),
        ends_at: new Date(now.getTime() + 6 * 86400000 + 50400000).toISOString(),
        registration_deadline: new Date(now.getTime() + 5 * 86400000 + 54000000).toISOString(),
        capacity: 40,
        certificate_minimum_minutes: 45,
        registered_count: 8,
        waitlisted_count: 0
      },
      {
        id: "ev-4",
        organizer_id: "u-org-2",
        title: "Leadership & Career Seminar",
        description: "Learn interview strategies, personal branding, and project management skills from top campus alumni.",
        category: "Seminar",
        venue: "Lecture Hall A",
        starts_at: new Date(now.getTime() + 8 * 86400000 + 50400000).toISOString(),
        ends_at: new Date(now.getTime() + 8 * 86400000 + 61200000).toISOString(),
        registration_deadline: new Date(now.getTime() + 7 * 86400000 + 64800000).toISOString(),
        capacity: 60,
        certificate_minimum_minutes: 45,
        registered_count: 16,
        waitlisted_count: 0
      },
      {
        id: "ev-5",
        organizer_id: "u-org-2",
        title: "Cloud Computing & DevOps Webinar",
        description: "Live interactive webinar detailing Docker, Kubernetes, AWS infrastructure, and modern CI/CD pipelines.",
        category: "Webinar",
        venue: "Virtual Conference Room",
        starts_at: new Date(now.getTime() + 10 * 86400000 + 57600000).toISOString(),
        ends_at: new Date(now.getTime() + 10 * 86400000 + 64800000).toISOString(),
        registration_deadline: new Date(now.getTime() + 9 * 86400000 + 72000000).toISOString(),
        capacity: 100,
        certificate_minimum_minutes: 30,
        registered_count: 18,
        waitlisted_count: 0
      }
    ],
    registrations: [
      { id: "reg-1", event_id: "ev-1", student_id: "u-1", status: "registered", waitlist_position: null, qr_token: "qr_token_alex_summit", checked_in_at: new Date(now.getTime() - 7200000).toISOString(), check_out_at: new Date(now.getTime() - 1800000).toISOString() },
      { id: "reg-2", event_id: "ev-2", student_id: "u-1", status: "registered", waitlist_position: null, qr_token: "qr_token_alex_hackathon", checked_in_at: null, check_out_at: null }
    ]
  };
  saveMockDb(db);
  return db;
}

function handleMockRequest(url, method, bodyData) {
  const db = getMockDb();
  const parsedUrl = new URL(url, window.location.origin);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  // Overview
  if (pathname.includes("/dashboard/overview")) {
    const total_events = db.events.length;
    let total_registrations = 0;
    let waitlisted_students = 0;
    let checked_in_students = 0;

    db.registrations.forEach(r => {
      total_registrations++;
      if (r.status === "waitlisted") waitlisted_students++;
      if (r.status === "checked_in") checked_in_students++;
    });

    return { total_events, total_registrations, waitlisted_students, checked_in_students };
  }

  // Seed demo data
  if (pathname.includes("/dashboard/seed-demo-data")) {
    initMockDb();
    return { message: "Database seeded successfully." };
  }

  // Users List & Create
  if (pathname.endsWith("/users/") || pathname.endsWith("/users")) {
    if (method === "POST") {
      const newUser = {
        id: "u-" + Date.now(),
        name: bodyData.name,
        email: bodyData.email,
        role: bodyData.role || "student",
        department: bodyData.department || ""
      };
      db.users.push(newUser);
      saveMockDb(db);
      return newUser;
    }
    return db.users;
  }

  // Events List & Create
  if (pathname.endsWith("/events/") || pathname.endsWith("/events")) {
    if (method === "POST") {
      const newEvent = {
        id: "ev-" + Date.now(),
        organizer_id: bodyData.organizer_id,
        title: bodyData.title,
        description: bodyData.description,
        category: bodyData.category,
        venue: bodyData.venue,
        starts_at: bodyData.starts_at,
        ends_at: bodyData.ends_at,
        registration_deadline: bodyData.registration_deadline,
        capacity: Number(bodyData.capacity),
        certificate_minimum_minutes: Number(bodyData.certificate_minimum_minutes),
        registered_count: 0,
        waitlisted_count: 0
      };
      db.events.push(newEvent);
      saveMockDb(db);
      return newEvent;
    }

    const category = searchParams.get("category");
    let results = db.events;
    if (category) {
      results = results.filter(e => e.category.toLowerCase().includes(category.toLowerCase()));
    }
    return results.map(e => {
      const regCount = db.registrations.filter(r => r.event_id === e.id && r.status === "registered").length;
      const waitCount = db.registrations.filter(r => r.event_id === e.id && r.status === "waitlisted").length;
      return { ...e, registered_count: regCount, waitlisted_count: waitCount };
    });
  }

  // Student Registrations
  const studentRegMatch = pathname.match(/\/events\/student\/([^\/]+)\/registrations/);
  if (studentRegMatch) {
    const studentId = studentRegMatch[1];
    return db.registrations.filter(r => r.student_id === studentId);
  }

  // Register for Event
  const regCreateMatch = pathname.match(/\/events\/([^\/]+)\/registrations\/$/) || pathname.match(/\/events\/([^\/]+)\/registrations$/);
  if (regCreateMatch && method === "POST") {
    const eventId = regCreateMatch[1];
    const studentId = bodyData.student_id;
    const targetEvent = db.events.find(e => e.id === eventId);

    const existing = db.registrations.find(r => r.event_id === eventId && r.student_id === studentId);
    if (existing) return existing;

    const confirmedRegs = db.registrations.filter(r => r.event_id === eventId && r.status === "registered");
    const isFull = confirmedRegs.length >= (targetEvent ? targetEvent.capacity : 50);
    const status = isFull ? "waitlisted" : "registered";
    const waitlist_position = isFull ? (db.registrations.filter(r => r.event_id === eventId && r.status === "waitlisted").length + 1) : null;
    const qr_token = "qr_" + Math.random().toString(36).substring(2, 10);

    const newReg = {
      id: "reg-" + Date.now(),
      event_id: eventId,
      student_id: studentId,
      status: status,
      waitlist_position: waitlist_position,
      qr_token: qr_token,
      checked_in_at: null,
      check_out_at: null
    };

    db.registrations.push(newReg);
    saveMockDb(db);
    return newReg;
  }

  // Cancel Registration
  const regCancelMatch = pathname.match(/\/events\/([^\/]+)\/registrations\/([^\/]+)/);
  if (regCancelMatch && method === "DELETE") {
    const eventId = regCancelMatch[1];
    const regId = regCancelMatch[2];
    const idx = db.registrations.findIndex(r => r.id === regId);
    if (idx !== -1) {
      const wasRegistered = db.registrations[idx].status === "registered";
      db.registrations.splice(idx, 1);

      if (wasRegistered) {
        const nextWaitlisted = db.registrations.filter(r => r.event_id === eventId && r.status === "waitlisted").sort((a,b) => (a.waitlist_position || 0) - (b.waitlist_position || 0))[0];
        if (nextWaitlisted) {
          nextWaitlisted.status = "registered";
          nextWaitlisted.waitlist_position = null;
        }
      }
      saveMockDb(db);
    }
    return { success: true };
  }

  // Attendance Check-in & Check-out
  if (pathname.includes("/attendance/check-in")) {
    const token = bodyData ? bodyData.qr_token : "";
    const reg = db.registrations.find(r => r.qr_token === token);
    if (!reg) throw new Error("Valid registration token not found");
    if (!reg.checked_in_at) {
      reg.checked_in_at = new Date().toISOString();
      reg.status = "checked_in";
      saveMockDb(db);
    }
    const student = db.users.find(u => u.id === reg.student_id);
    return {
      registration_id: reg.id,
      student_name: student ? student.name : "Student",
      status: reg.status,
      checked_in_at: reg.checked_in_at,
      check_out_at: reg.check_out_at,
      certificate_eligible: false
    };
  }

  if (pathname.includes("/attendance/check-out")) {
    const token = bodyData ? bodyData.qr_token : "";
    const reg = db.registrations.find(r => r.qr_token === token);
    if (!reg) throw new Error("Valid registration token not found");
    reg.check_out_at = new Date().toISOString();
    saveMockDb(db);

    const student = db.users.find(u => u.id === reg.student_id);
    let cert = false;
    if (reg.checked_in_at && reg.check_out_at) {
      const mins = (new Date(reg.check_out_at) - new Date(reg.checked_in_at)) / 60000;
      cert = mins >= 30;
    }
    return {
      registration_id: reg.id,
      student_name: student ? student.name : "Student",
      status: reg.status,
      checked_in_at: reg.checked_in_at,
      check_out_at: reg.check_out_at,
      certificate_eligible: cert
    };
  }

  return [];
}

const originalFetch = window.fetch;
window.fetch = async function(input, init) {
  init = init || {};
  const url = typeof input === "string" ? input : (input && input.url ? input.url : "");
  const method = (init.method || "GET").toUpperCase();
  let bodyData = null;
  if (init.body) {
    try { bodyData = JSON.parse(init.body); } catch(e) {}
  }

  if (url && url.includes("loca.lt")) {
    init.headers = init.headers || {};
    if (init.headers instanceof Headers) {
      init.headers.set("bypass-tunnel-reminder", "true");
    } else {
      init.headers["bypass-tunnel-reminder"] = "true";
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await originalFetch.call(this, input, { ...init, signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) return response;
  } catch (err) {
    clearTimeout(timeoutId);
  }

  // Fallback to in-browser storage engine if backend network request is unreachable
  try {
    const mockResult = handleMockRequest(url, method, bodyData);
    return new Response(JSON.stringify(mockResult), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (mockErr) {
    return new Response(JSON.stringify({ detail: mockErr.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
};

window.API = window.EVENTPULSE_API_URL || localStorage.getItem("EVENTPULSE_API_URL") || (
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : (window.location.hostname.includes("github.io") ? DEFAULT_ONLINE_API : window.location.origin)
);
var API = window.API;

const AUTH_STORAGE_KEY = "eventpulse_user";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch (error) {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.href = "login.html";
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.replace("login.html");
    return null;
  }
  return user;
}

function redirectIfAuthenticated() {
  if (getCurrentUser()) {
    window.location.replace("index.html");
  }
}

function initAuthUi() {
  const user = getCurrentUser();
  const userBadge = document.querySelector("#user-badge");
  const loginLink = document.querySelector("#login-link");

  if (user) {
    if (userBadge) {
      userBadge.style.display = "inline-flex";
      userBadge.innerHTML = `
        <span>${user.name || user.email}</span>
        <span class="role-tag">${user.role || "student"}</span>
        <a href="#" id="logout-link" class="btn-logout">Logout</a>
      `;
      const logoutBtn = userBadge.querySelector("#logout-link");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
          e.preventDefault();
          logout();
        });
      }
    }
    if (loginLink) loginLink.style.display = "none";
  } else {
    if (userBadge) userBadge.style.display = "none";
    if (loginLink) loginLink.style.display = "inline";
  }
}

function showNotification(message, type = "info") {
  let banner = document.querySelector("#notification-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "notification-banner";
    const main = document.querySelector("main");
    if (main && main.firstChild) main.insertBefore(banner, main.firstChild);
  }
  banner.className = `notification-banner ${type}`;
  banner.innerHTML = `
    <span>${message}</span>
    <button style="background:transparent; color:inherit; padding:0 8px; font-size:1.2rem; cursor:pointer;" onclick="this.parentElement.remove()">✕</button>
  `;
  setTimeout(() => { if (banner && banner.parentElement) banner.remove(); }, 6000);
}

async function getUserRegistrations(studentId) {
  if (!studentId) return [];
  try {
    const res = await fetch(`${API}/events/student/${studentId}/registrations`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch registrations", err);
    return [];
  }
}

async function handleEventRegistration(eventId, eventTitle) {
  const user = getCurrentUser();
  if (!user) {
    showNotification("Please sign in or enter your email to register for events.", "error");
    setTimeout(() => { window.location.href = "login.html"; }, 1500);
    return;
  }

  try {
    const response = await fetch(`${API}/events/${eventId}/registrations/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: user.id }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to register for event.");
    }

    const reg = await response.json();
    if (reg.status === "registered") {
      showNotification(`🎉 Successfully registered for "${eventTitle}"!`, "success");
    } else {
      showNotification(`⏳ You've been placed on the waitlist (Position #${reg.waitlist_position}) for "${eventTitle}".`, "info");
    }

    showTicketModal(reg, eventTitle);
    if (typeof loadDashboard === "function") loadDashboard();
    if (typeof loadEvents === "function") loadEvents();
  } catch (error) {
    showNotification(error.message, "error");
  }
}

async function handleCancelRegistration(eventId, registrationId, eventTitle) {
  if (!confirm(`Are you sure you want to cancel your registration for "${eventTitle}"?`)) return;

  try {
    const response = await fetch(`${API}/events/${eventId}/registrations/${registrationId}`, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 204) {
      throw new Error("Unable to cancel registration.");
    }

    showNotification(`Cancelled registration for "${eventTitle}".`, "info");
    if (typeof loadDashboard === "function") loadDashboard();
    if (typeof loadEvents === "function") loadEvents();
  } catch (error) {
    showNotification(error.message, "error");
  }
}

function showTicketModal(registration, eventTitle) {
  const existing = document.querySelector("#ticket-modal");
  if (existing) existing.remove();

  const isWaitlist = registration.status === "waitlisted";
  const modal = document.createElement("div");
  modal.id = "ticket-modal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="ticket-card">
      <div class="ticket-header">
        <div>
          <span class="${isWaitlist ? 'badge-waitlisted' : 'badge-registered'}">${isWaitlist ? `WAITLISTED #${registration.waitlist_position}` : 'CONFIRMED TICKET'}</span>
          <h3 style="margin-top:8px;">${eventTitle || 'Event Ticket'}</h3>
        </div>
        <button onclick="document.querySelector('#ticket-modal').remove()" style="background:none; border:none; color:#bcb5cf; font-size:1.5rem; cursor:pointer;">✕</button>
      </div>
      <div class="ticket-qr-section">
        <p style="margin:0; font-size:0.88rem; color:#bcb5cf;">Your QR Check-in Token:</p>
        <div class="qr-code-box" id="ticket-qr-text">${registration.qr_token}</div>
        <div style="display:flex; gap:10px; justify-center; margin-top:12px;">
          <button class="btn-secondary" style="flex:1;" onclick="navigator.clipboard.writeText('${registration.qr_token}'); alert('QR Token copied to clipboard!');">📋 Copy Token</button>
          <button class="btn-ticket" style="flex:1;" onclick="window.location.href='attendance.html?token=${registration.qr_token}'">🎟 Check-in Now</button>
        </div>
      </div>
      <p style="font-size:0.8rem; color:#8f85b8; text-align:center; margin:0;">Present this token at the event venue to log attendance and qualify for certificates.</p>
    </div>
  `;
  document.body.appendChild(modal);
}
