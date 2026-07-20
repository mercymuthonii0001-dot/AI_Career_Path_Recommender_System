import { nav, setMessage, apiRequest, saveSession, navigate, API_BASE_URL } from "../app.js";

export function registerPage() {
  return `
    ${nav()}
    <main class="auth-shell">
      <form class="card form" id="registerForm">
        <h1>Create Account</h1>
        <p class="muted">Create your account first. Then the system will guide you through a personalized onboarding experience with support for first-time applicants, continuing students, and high school learners.</p>
        <label>Full Name<input required name="full_name" type="text"></label>
        <label>Username<input required name="username" type="text"></label>
        <label>Email<input required name="email" type="email"></label>
        <label>Password
          <div class="password-field">
            <input required name="password" type="password" minlength="8">
            <button type="button" class="password-toggle" aria-label="Toggle password visibility">👁️</button>
          </div>
        </label>
        <button class="btn" type="submit">Create Account</button>
        <p id="message" class="message"></p>
        <p class="muted">Already registered? <a href="/login" data-link>Login here</a>.</p>
      </form>
    </main>
  `;
}

export function bindRegister() {
  const form = document.getElementById("registerForm");
  const usernameInput = form?.querySelector('input[name="username"]');

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.username = payload.username?.toString().trim();
    payload.email = payload.email?.toString().trim().toLowerCase();
    payload.full_name = payload.full_name?.toString().trim();

    if (!payload.username) {
      setMessage("Please choose a username.");
      return;
    }

    try {
      const data = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      saveSession(data);
      navigate("/onboarding");
    } catch (error) {
      if (typeof error.message === "string" && error.message.includes("Status=500")) {
        const healthUrl = `${API_BASE_URL.replace(/\/$/, "")}/health`;
        setMessage(
          `Server error (500) from backend. Check Render logs and verify backend health: ${healthUrl}`
        );
      } else {
        setMessage(error.message);
      }
    }
  });
}
