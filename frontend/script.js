var API = window.API || "http://127.0.0.1:8000";

const formatDate = (value) => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

async function loadDashboard() {
  const currentUser = getCurrentUser();
  const [dashboard, events, userRegistrations] = await Promise.all([
    fetch(`${API}/dashboard/overview`).then((response) => response.json()),
    fetch(`${API}/events/`).then((response) => response.json()),
    currentUser ? getUserRegistrations(currentUser.id) : Promise.resolve([]),
  ]);

  const regMap = new Map();
  userRegistrations.forEach((r) => regMap.set(r.event_id, r));

  const values = [dashboard.total_events, dashboard.total_registrations, dashboard.waitlisted_students, dashboard.checked_in_students];
  document.querySelectorAll(".stats strong").forEach((item, index) => item.textContent = values[index]);

  const target = document.querySelector("#events");
  if (!events.length) {
    target.innerHTML = '<p class="empty">No upcoming events yet.</p>';
    return;
  }

  target.innerHTML = events.map((event) => {
    const reg = regMap.get(event.id);
    const isFull = event.registered_count >= event.capacity;
    
    let actionButtons = "";
    if (reg) {
      const isWaitlist = reg.status === "waitlisted";
      const statusBadge = isWaitlist 
        ? `<span class="badge-waitlisted">WAITLISTED #${reg.waitlist_position}</span>`
        : `<span class="badge-registered">✅ REGISTERED</span>`;

      actionButtons = `
        <div style="margin-bottom:8px;">${statusBadge}</div>
        <div class="event-actions">
          <button class="btn-ticket" onclick='showTicketModal(${JSON.stringify(reg).replace(/'/g, "&apos;")}, "${event.title.replace(/"/g, "&quot;")}")'>🎟 Ticket & QR</button>
          <button class="btn-cancel" onclick='handleCancelRegistration("${event.id}", "${reg.id}", "${event.title.replace(/"/g, "&quot;")}")'>Cancel</button>
        </div>
      `;
    } else {
      actionButtons = `
        <div class="event-actions">
          <button class="${isFull ? 'btn-waitlist' : 'btn-register'}" onclick='handleEventRegistration("${event.id}", "${event.title.replace(/"/g, "&quot;")}")'>
            ${isFull ? '⏳ Join Waitlist' : '⚡ Register Now'}
          </button>
        </div>
      `;
    }

    return `
      <article class="event">
        <div>
          <p class="tag">${event.category.toUpperCase()}</p>
          <h3>${event.title}</h3>
          <p class="meta">${formatDate(event.starts_at)}<br>${event.venue}</p>
          <p class="meta">${event.registered_count}/${event.capacity} confirmed · ${event.waitlisted_count} waitlisted</p>
        </div>
        <div class="event-footer">
          ${actionButtons}
        </div>
      </article>
    `;
  }).join("");
}

document.querySelector("#refresh").addEventListener("click", loadDashboard);
initAuthUi();
loadDashboard().catch(() => { document.querySelector("#events").innerHTML = '<p class="empty">Start the FastAPI server to load live EventPulse data.</p>'; });
