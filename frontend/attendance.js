const API = "http://127.0.0.1:8000";

function showAttendanceStatus(message, type) {
  const status = document.querySelector("#attendance-status");
  status.textContent = message;
  status.className = `form-status ${type || ""}`.trim();
}

function showAttendanceResult(result) {
  const log = document.querySelector("#attendance-result");
  if (!result) {
    log.innerHTML = "";
    return;
  }
  log.innerHTML = `
    <p><strong>Student:</strong> ${result.student_name}</p>
    <p><strong>Status:</strong> ${result.status}</p>
    <p><strong>Checked in:</strong> ${result.checked_in_at ? new Date(result.checked_in_at).toLocaleString() : "—"}</p>
    <p><strong>Checked out:</strong> ${result.check_out_at ? new Date(result.check_out_at).toLocaleString() : "—"}</p>
    <p><strong>Certificate eligible:</strong> ${result.certificate_eligible ? "Yes" : "No"}</p>
  `;
}

async function postAttendance(endpoint, token) {
  const response = await fetch(`${API}/attendance/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qr_token: token }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Attendance action failed.");
  }
  return response.json();
}

async function handleAttendanceAction(endpoint) {
  const token = document.querySelector("#qr-token").value.trim();
  if (!token) {
    showAttendanceStatus("Enter a registration QR token.", "error");
    return;
  }

  showAttendanceStatus(`${endpoint === "check-in" ? "Checking in" : "Checking out"}…`);

  try {
    const result = await postAttendance(endpoint, token);
    showAttendanceStatus("Attendance updated.", "success");
    showAttendanceResult(result);
  } catch (error) {
    showAttendanceStatus(error.message, "error");
    showAttendanceResult(null);
  }
}

document.querySelector("#check-in").addEventListener("click", () => handleAttendanceAction("check-in"));
document.querySelector("#check-out").addEventListener("click", () => handleAttendanceAction("check-out"));

document.querySelector("#qr-token").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleAttendanceAction("check-in");
  }
});
initAuthUi();
