const API = "http://127.0.0.1:8000";

const formatDate = (value) => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

async function loadDashboard() {
  const [dashboard, events] = await Promise.all([
    fetch(`${API}/dashboard/overview`).then((response) => response.json()),
    fetch(`${API}/events/`).then((response) => response.json()),
  ]);
  const values = [dashboard.total_events, dashboard.total_registrations, dashboard.waitlisted_students, dashboard.checked_in_students];
  document.querySelectorAll(".stats strong").forEach((item, index) => item.textContent = values[index]);
  document.querySelector("#events").innerHTML = events.length ? events.map((event) => `
    <article class="event"><p class="tag">${event.category.toUpperCase()}</p><h3>${event.title}</h3>
    <p class="meta">${formatDate(event.starts_at)}<br>${event.venue}</p>
    <p>${event.registered_count}/${event.capacity} confirmed · ${event.waitlisted_count} waitlisted</p></article>`).join("") : '<p class="empty">No upcoming events yet. Create one from the API docs.</p>';
}

document.querySelector("#refresh").addEventListener("click", loadDashboard);
initAuthUi();
loadDashboard().catch(() => { document.querySelector("#events").innerHTML = '<p class="empty">Start the FastAPI server to load live EventPulse data.</p>'; });
