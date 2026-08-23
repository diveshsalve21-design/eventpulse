var API = window.API || "http://127.0.0.1:8000";

let currentDate = new Date(2026, 7, 1); // August 2026
let allEvents = [];
let userRegMap = new Map();

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getPillClass(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("seminar")) return "pill-seminar";
  if (cat.includes("hackathon")) return "pill-hackathon";
  if (cat.includes("workshop")) return "pill-workshop";
  if (cat.includes("webinar")) return "pill-webinar";
  return "pill-default";
}

async function fetchCalendarData() {
  const currentUser = getCurrentUser();
  const [eventsRes, userRegs] = await Promise.all([
    fetch(`${API}/events/?upcoming_only=false`).then(res => res.json()).catch(() => []),
    currentUser ? getUserRegistrations(currentUser.id) : Promise.resolve([])
  ]);

  allEvents = eventsRes;
  userRegMap.clear();
  userRegs.forEach(r => userRegMap.set(r.event_id, r));

  renderCalendar();
}

function renderCalendar() {
  const monthYearHeader = document.querySelector("#calendar-month-year");
  const grid = document.querySelector("#calendar-grid");
  if (!grid || !monthYearHeader) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYearHeader.textContent = `${monthNames[month]} ${year}`;

  grid.innerHTML = "";

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayHeaders.forEach(day => {
    const headerCell = document.createElement("div");
    headerCell.className = "calendar-day-header";
    headerCell.textContent = day;
    grid.appendChild(headerCell);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell other-month";
    cell.innerHTML = `<span class="calendar-date-number">${prevMonthTotalDays - i}</span>`;
    grid.appendChild(cell);
  }

  const today = new Date();

  // Current month days
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === dayNum;
    if (isToday) cell.classList.add("today");

    const dateHeader = document.createElement("span");
    dateHeader.className = "calendar-date-number";
    dateHeader.textContent = dayNum;
    cell.appendChild(dateHeader);

    // Filter events for this day
    const dayEvents = allEvents.filter(ev => {
      const evDate = new Date(ev.starts_at);
      return evDate.getFullYear() === year && evDate.getMonth() === month && evDate.getDate() === dayNum;
    });

    dayEvents.forEach(ev => {
      const reg = userRegMap.get(ev.id);
      const pill = document.createElement("div");
      pill.className = `calendar-event-pill ${getPillClass(ev.category)}`;
      pill.title = `${ev.title} (${ev.category})\nVenue: ${ev.venue}`;
      pill.textContent = `${reg ? '✅ ' : ''}${ev.title}`;

      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        if (reg) {
          showTicketModal(reg, ev.title);
        } else {
          handleEventRegistration(ev.id, ev.title);
        }
      });

      cell.appendChild(pill);
    });

    grid.appendChild(cell);
  }

  // Next month leading days to complete full grid
  const currentTotalCells = firstDay + totalDays;
  const remainingCells = (7 - (currentTotalCells % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell other-month";
    cell.innerHTML = `<span class="calendar-date-number">${i}</span>`;
    grid.appendChild(cell);
  }
}

document.querySelector("#prev-month")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.querySelector("#next-month")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

document.querySelector("#today-month")?.addEventListener("click", () => {
  currentDate = new Date();
  renderCalendar();
});

initAuthUi();
fetchCalendarData();
