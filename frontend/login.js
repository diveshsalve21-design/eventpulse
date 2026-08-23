redirectIfAuthenticated();

async function fetchUsers() {
  const response = await fetch(`${API}/users/`);
  if (!response.ok) {
    throw new Error("Unable to reach the EventPulse API.");
  }
  return response.json();
}

async function createUser(payload) {
  const response = await fetch(`${API}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Unable to create account.");
  }

  return response.json();
}

function showStatus(message, type) {
  const status = document.querySelector("#login-status");
  status.textContent = message;
  status.className = `form-status ${type || ""}`.trim();
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const name = document.querySelector("#name").value.trim();
  if (!email) {
    showStatus("Enter your campus email to continue.", "error");
    return;
  }

  showStatus("Checking your account…");

  try {
    const users = await fetchUsers();
    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      setCurrentUser(existingUser);
      window.location.href = "index.html";
      return;
    }

    if (!name) {
      showStatus("Enter your full name to create a new student account.", "error");
      return;
    }

    const newUser = await createUser({ email, name, role: "student" });
    setCurrentUser(newUser);
    window.location.href = "index.html";
  } catch (error) {
    showStatus(error.message, "error");
  }
}

document.querySelector("#login-form").addEventListener("submit", handleLogin);
