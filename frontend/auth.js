window.API = window.EVENTPULSE_API_URL || (
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://eventpulse-api.onrender.com"
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
