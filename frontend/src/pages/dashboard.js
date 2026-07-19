import { nav, getDisplayName, normalizeProfile, apiRequest } from "../app.js";

export function dashboardPage(profile = {}) {
  const safeProfile = normalizeProfile(profile);
  const needsOnboarding = !safeProfile.onboarding_completed;
  const displayName = getDisplayName(safeProfile);
  const latestRecommendation = (() => {
    try {
      return JSON.parse(localStorage.getItem("latestRecommendation") || "null");
    } catch {
      return null;
    }
  })();

  const recommendationCard = latestRecommendation
    ? `
      <article class="card-soft saved-progress-card">
        <h3>Your latest recommendation is ready</h3>
        <p>${latestRecommendation.predicted_career} is ready to view with your full career details.</p>
        <a class="btn btn-small" href="/recommendation" data-link>View result</a>
      </article>
    `
    : "";

  const savedNotice = localStorage.getItem("assessmentNotice");
  if (savedNotice) {
    localStorage.removeItem("assessmentNotice");
  }

  const savedAssessment = (() => {
    try {
      return JSON.parse(localStorage.getItem("savedAssessment") || "null");
    } catch {
      return null;
    }
  })();

  const resumeCard = savedAssessment
    ? `
      <article class="card-soft saved-progress-card">
        <h3>Resume your assessment</h3>
        <p>We saved your progress. Jump back in whenever you are ready.</p>
        <a class="btn btn-small" href="/assessment" data-link>Resume</a>
      </article>
    `
    : "";

  return `
    ${nav()}
    <main class="page">
      <section class="dashboard-head">
        <div>
          <p class="eyebrow">Student Dashboard</p>
          <h1 id="welcome">Welcome</h1>
          <p class="dashboard-user-pill">Logged in as ${displayName}</p>
          <p class="muted">${needsOnboarding ? "Finish a short onboarding step so the system can guide you better." : "Complete an assessment to receive an AI-powered career recommendation."}</p>
        </div>
        <div class="actions">
          ${needsOnboarding ? `<a class="btn" href="/onboarding" data-link>Complete Setup</a>` : `<a class="btn" href="/assessment" data-link>Start Assessment</a>`}
        </div>
      </section>
      ${savedNotice ? `<div class="notice-card">${savedNotice}</div>` : ""}
      ${recommendationCard}
      ${resumeCard}
      <section class="feature-grid">
        <article class="card-soft">
          <h3>Career Assessment</h3>
          <p>Answer questions about subjects, interests, and skills.</p>
          <a href="/assessment" data-link>Begin now</a>
        </article>
        <article class="card-soft">
          <h3>Recommendation History</h3>
          <p>Review your previous AI career recommendations.</p>
          <a href="/history" data-link>View history</a>
        </article>
        <article class="card-soft">
          <h3>Career Guidance</h3>
          <p>Explore career resources and keep your profile updated as you grow.</p>
          <a href="/onboarding" data-link>Update profile</a>
        </article>
      </section>
    </main>
  `;
}

export async function loadDashboard() {
  const welcome = document.getElementById("welcome");
  if (!welcome) return;
  try {
    const profile = await apiRequest("/profile");
    welcome.textContent = `Welcome, ${profile.full_name}`;
  } catch {
    welcome.textContent = "Welcome";
  }
}
