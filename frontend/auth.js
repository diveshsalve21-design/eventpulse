window.API = window.EVENTPULSE_API_URL || localStorage.getItem("EVENTPULSE_API_URL") || (
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://ninety-ducks-doubt.loca.lt"
);
var API = window.API;

const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  options = options || {};
  options.headers = options.headers || {};
  if (typeof url === 'string' && url.includes('loca.lt')) {
    if (options.headers instanceof Headers) {
      options.headers.set('bypass-tunnel-reminder', 'true');
    } else {
      options.headers['bypass-tunnel-reminder'] = 'true';
    }
  }
  return originalFetch(url, options);
};

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
