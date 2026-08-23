var API = window.API || "http://127.0.0.1:8000";

const formatDate = (value) => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

async function loadEvents(category = "") {
  const currentUser = getCurrentUser();
  const params = new URLSearchParams();
  if (category) params.set("category", category);

  const [events, userRegistrations] = await Promise.all([
    fetch(`${API}/events/?${params.toString()}`).then((res) => res.json()),
    currentUser ? getUserRegistrations(currentUser.id) : Promise.resolve([]),
  ]);

  const regMap = new Map();
  userRegistrations.forEach((r) => regMap.set(r.event_id, r));

  const target = document.querySelector("#events");
  if (!events.length) {
    target.innerHTML = '<p class="empty">No events match this filter.</p>';
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
          <p class="meta">${formatDate(event.starts_at)} · ${formatDate(event.ends_at)}<br>${event.venue}</p>
          <p class="meta">${event.registered_count}/${event.capacity} confirmed · ${event.waitlisted_count} waitlisted</p>
        </div>
        <div class="event-footer">
          ${actionButtons}
        </div>
      </article>
    `;
  }).join("");
}

function toISO(value) {
  return new Date(value).toISOString();
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateTimeISO(dateString, timeString = "09:00") {
  const parsed = new Date(`${dateString}T${timeString}:00`);
  return parsed.toISOString();
}

async function populateOrganizers() {
  const select = document.querySelector("#organizer_id");
  if (!select) return;
  try {
    const response = await fetch(`${API}/users/`);
    const users = await response.json();
    const organizers = users.filter((u) => u.role === "organizer" || u.role === "admin");
    if (!organizers.length) {
      select.innerHTML = '<option value="">No organizer accounts found</option>';
      return;
    }
    select.innerHTML = organizers.map((u) => `<option value="${u.id}">${u.name} (${u.role})</option>`).join("");
  } catch (err) {
    select.innerHTML = '<option value="">Failed to load organizers</option>';
  }
}

function setupDatePickers() {
  const startInput = document.querySelector("#starts_at");
  const endInput = document.querySelector("#ends_at");
  const deadlineInput = document.querySelector("#registration_deadline");

  if (!startInput || !endInput || !deadlineInput) return;

  const now = new Date();
  const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  const deadlineDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);

  startInput.value = toDateInputValue(startDate);
  endInput.value = toDateInputValue(endDate);
  deadlineInput.value = toDateInputValue(deadlineDate);

  [startInput, endInput, deadlineInput].forEach((input) => {
    input.addEventListener("focus", () => {
      if (typeof input.showPicker === "function") input.showPicker();
    });
  });
}

async function createEvent(payload) {
  const response = await fetch(`${API}/events/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Unable to create event.");
  }
  return response.json();
}

async function handleCreate(event) {
  event.preventDefault();
  const status = document.querySelector("#form-status");
  status.textContent = "Creating event…";
  status.className = "form-status";

  const organizerSelect = document.querySelector("#organizer_id");
  const organizer_id = organizerSelect ? organizerSelect.value.trim() : "";
  if (!organizer_id) {
    status.textContent = "Select a valid organizer account.";
    status.className = "form-status error";
    return;
  }

  const startsVal = document.querySelector("#starts_at").value;
  const endsVal = document.querySelector("#ends_at").value;
  const deadlineVal = document.querySelector("#registration_deadline").value;

  if (!startsVal || !endsVal || !deadlineVal) {
    status.textContent = "Please select valid dates for event start, end, and deadline.";
    status.className = "form-status error";
    return;
  }

  try {
    const payload = {
      organizer_id,
      title: document.querySelector("#title").value.trim(),
      description: document.querySelector("#description").value.trim(),
      category: document.querySelector("#category_input").value.trim(),
      venue: document.querySelector("#venue").value.trim(),
      starts_at: toDateTimeISO(startsVal, "09:00"),
      ends_at: toDateTimeISO(endsVal, "12:00"),
      registration_deadline: toDateTimeISO(deadlineVal, "17:00"),
      capacity: Number(document.querySelector("#capacity").value),
      certificate_minimum_minutes: Number(document.querySelector("#certificate_minimum_minutes").value),
    };

    await createEvent(payload);
    event.target.reset();
    setupDatePickers();
    populateOrganizers();
    status.textContent = "Event created successfully.";
    status.className = "form-status success";
    loadEvents(document.querySelector("#category").value);
  } catch (error) {
    status.textContent = error.message;
    status.className = "form-status error";
  }
}

const sampleEvents = [
  {
    title: "Campus Hackathon",
    description: "A fast-paced hackathon where student teams build solutions in one day.",
    category: "Hackathon",
    venue: "Innovation Hall",
    capacity: 120,
    certificate_minimum_minutes: 60,
  },
  {
    title: "Productivity Workshop",
    description: "A practical workshop on time management, team workflows, and event planning.",
    category: "Workshop",
    venue: "Room 302",
    capacity: 80,
    certificate_minimum_minutes: 45,
  },
  {
    title: "Leadership Seminar",
    description: "A seminar on leadership skills for student organizers and club members.",
    category: "Seminar",
    venue: "Lecture Theatre A",
    capacity: 150,
    certificate_minimum_minutes: 45,
  },
  {
    title: "Campus Webinar",
    description: "A live webinar featuring guest speakers on campus innovation and careers.",
    category: "Webinar",
    venue: "Virtual Room",
    capacity: 300,
    certificate_minimum_minutes: 30,
  },
  {
    title: "Coding Competition",
    description: "A timed coding competition to showcase algorithm and problem-solving skills.",
    category: "Coding Competition",
    venue: "Computer Lab",
    capacity: 100,
    certificate_minimum_minutes: 45,
  },
];

function createSamplePayloads(organizer_id) {
  const now = new Date();
  return sampleEvents.map((event, index) => {
    const starts = new Date(now);
    starts.setDate(starts.getDate() + 2 + index);
    starts.setHours(10, 0, 0, 0);
    const ends = new Date(starts);
    ends.setHours(ends.getHours() + 3 + index % 3);
    const deadline = new Date(starts);
    deadline.setDate(deadline.getDate() - 1);
    return {
      organizer_id,
      title: event.title,
      description: event.description,
      category: event.category,
      venue: event.venue,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      registration_deadline: deadline.toISOString(),
      capacity: event.capacity,
      certificate_minimum_minutes: event.certificate_minimum_minutes,
    };
  });
}

async function getOrganizerId() {
  const response = await fetch(`${API}/users/`);
  const users = await response.json();
  let organizer = users.find((user) => user.role === "organizer" || user.role === "admin");
  if (!organizer) {
    const createRes = await fetch(`${API}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Demo Organizer", email: "organizer@campus.edu", role: "organizer", department: "Computer Science" }),
    });
    if (createRes.ok) {
      organizer = await createRes.json();
      await populateOrganizers();
    } else {
      throw new Error("Create at least one organizer or admin user first.");
    }
  }
  return organizer.id;
}

async function seedSampleEvents() {
  const status = document.querySelector("#form-status");
  status.textContent = "Seeding sample events…";
  status.className = "form-status";
  try {
    const organizerId = await getOrganizerId();
    const payloads = createSamplePayloads(organizerId);
    for (const payload of payloads) {
      await createEvent(payload);
    }
    status.textContent = "Sample events created successfully.";
    status.className = "form-status success";
    loadEvents(document.querySelector("#category").value);
  } catch (error) {
    status.textContent = error.message;
    status.className = "form-status error";
  }
}

document.querySelector("#refresh").addEventListener("click", () => loadEvents(document.querySelector("#category").value));
document.querySelector("#filter").addEventListener("click", () => loadEvents(document.querySelector("#category").value));
document.querySelector("#seed-samples").addEventListener("click", seedSampleEvents);
document.querySelector("#event-form").addEventListener("submit", handleCreate);
setupDatePickers();
populateOrganizers();
initAuthUi();

loadEvents().catch(() => {
  document.querySelector("#events").innerHTML = '<p class="empty">Start the FastAPI server to load events.</p>';
});
