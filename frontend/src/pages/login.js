import { nav, setMessage, apiRequest, saveSession, navigate } from "../app.js";

export function loginPage() {
  return `
    ${nav()}
    <main class="auth-shell">
      <form class="card form" id="loginForm">
        <h1>Welcome Back</h1>
        <p class="muted">Login to continue your career guidance session.</p>
        <label>Username or Email<input required name="username" type="text" placeholder="Username or email"></label>
        <label>Password
          <div class="password-field">
            <input required name="password" type="password">
            <button type="button" class="password-toggle" aria-label="Toggle password visibility">👁️</button>
          </div>
        </label>
        <button class="btn" type="submit">Login</button>
        <p id="message" class="message"></p>
        <p class="muted">New student? <a href="/register" data-link>Create an account</a>.</p>
      </form>
    </main>
  `;
}

export function bindLogin() {
  const form = document.getElementById("loginForm");
  form?.querySelectorAll(".password-toggle").forEach((button) => {
    const passwordInput = button.closest(".password-field")?.querySelector("input");
    if (!passwordInput) return;

    button.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      button.textContent = isHidden ? "🙈" : "👁️";
      button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.username = payload.username?.toString().trim();
    try {
      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      saveSession(data);
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  });
}
