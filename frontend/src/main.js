import { attachRenderer, clearSession, getToken, isAuthenticated, navigate, apiRequest, closeRecommendationModal, consumePendingRecommendation, logout, showRecommendationModal } from "./app.js";
import { homePage } from "./pages/home.js";
import { loginPage, bindLogin } from "./pages/login.js";
import { registerPage, bindRegister } from "./pages/register.js";
import { dashboardPage, loadDashboard } from "./pages/dashboard.js";
import { assessmentPage, bindAssessment } from "./pages/assessment.js";
import { onboardingPromptPage, bindOnboarding } from "./pages/onboarding.js";
import { recommendationPage } from "./pages/recommendation.js";
import { careersPage, loadCareers } from "./pages/careers.js";
import { historyPage, loadHistory } from "./pages/history.js";

const app = document.getElementById("app");

function protectedPage(page, extraData = {}) {
  if (!isAuthenticated()) {
    history.replaceState({}, "", "/login");
    return loginPage();
  }
  return page(extraData || {});
}

function notFoundPage() {
  return `
    ${homePage()}
    <main class="page narrow">
      <section class="card">
        <h1>Page Not Found</h1>
        <p class="muted">The page you requested does not exist.</p>
        <a class="btn" href="/" data-link>Go Home</a>
      </section>
    </main>
  `;
}

function bindPageEvents(path) {
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.getAttribute("href"));
    });
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  if (path === "/register") bindRegister();
  if (path === "/login") bindLogin();
  if (path === "/dashboard") loadDashboard();
  if (path === "/assessment") bindAssessment();
  if (path === "/history") loadHistory();
  if (path === "/careers") loadCareers();
  if (path === "/onboarding") bindOnboarding();
}

async function render() {
  const path = window.location.pathname;
  closeRecommendationModal();

  if (isAuthenticated() && (path === "/login" || path === "/register")) {
    history.replaceState({}, "", "/dashboard");
    return render();
  }

  const routes = {
    "/": homePage,
    "/register": registerPage,
    "/login": loginPage,
    "/dashboard": () => protectedPage(dashboardPage),
    "/assessment": () => protectedPage(assessmentPage),
    "/recommendation": () => protectedPage(recommendationPage),
    "/history": () => protectedPage(historyPage),
    "/careers": careersPage,
    "/onboarding": () => protectedPage(onboardingPromptPage),
  };

  app.innerHTML = (routes[path] || notFoundPage)();
  bindPageEvents(path);

  if (path === "/dashboard") {
    const pendingRecommendation = consumePendingRecommendation();
    if (pendingRecommendation) {
      showRecommendationModal(pendingRecommendation);
    }
  }
}

attachRenderer(render);

window.addEventListener("popstate", render);
render();
