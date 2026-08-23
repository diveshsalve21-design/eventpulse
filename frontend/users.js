const API = "http://127.0.0.1:8000";

async function loadUsers() {
  const response = await fetch(`${API}/users/`);
  const users = await response.json();
  const target = document.querySelector("#users");
  if (!users.length) {
    target.innerHTML = '<p class="empty">No users found.</p>';
    return;
  }
  target.innerHTML = users.map((user) => `
    <article class="event user-card">
      <h3>${user.name}</h3>
      <p>${user.email}</p>
      <p>${user.role.toUpperCase()} · ${user.department || "No department"}</p>
    </article>
  `).join("");
}

document.querySelector("#refresh").addEventListener("click", loadUsers);
initAuthUi();
loadUsers().catch(() => { document.querySelector("#users").innerHTML = '<p class="empty">Start the FastAPI server to load users.</p>'; });
