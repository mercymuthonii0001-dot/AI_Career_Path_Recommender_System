export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const subjects = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History",
  "Business Studies",
  "Computer Studies",
];

export const interests = [
  "Technology",
  "Business",
  "Healthcare",
  "Education",
  "Engineering",
  "Arts",
  "Agriculture",
  "Finance",
];

export const skills = [
  "Problem Solving",
  "Communication",
  "Creativity",
  "Leadership",
  "Programming",
  "Analysis",
  "Teamwork",
];

export const ASSESSMENT_STATE_KEY = "assessmentState";
export const ONBOARDING_STATE_KEY = "onboardingState";
export const SAVED_ASSESSMENT_KEY = "savedAssessment";
export const PENDING_RECOMMENDATION_KEY = "pendingRecommendation";

export function getToken() {
  return localStorage.getItem("accessToken");
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

export function getDisplayName(profile = null) {
  const currentUser = getCurrentUser();
  return (
    profile?.full_name ||
    profile?.username ||
    currentUser?.username ||
    currentUser?.email ||
    "your account"
  );
}

export function saveSession(data) {
  localStorage.setItem("accessToken", data.tokens.access);
  localStorage.setItem("refreshToken", data.tokens.refresh);
  localStorage.setItem("currentUser", JSON.stringify(data.user));
}

export function getSavedAssessmentState() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_ASSESSMENT_KEY));
  } catch {
    return null;
  }
}

export function consumePendingRecommendation() {
  const pending = localStorage.getItem(PENDING_RECOMMENDATION_KEY);
  if (!pending) return null;
  try {
    const result = JSON.parse(pending);
    localStorage.removeItem(PENDING_RECOMMENDATION_KEY);
    return result;
  } catch {
    localStorage.removeItem(PENDING_RECOMMENDATION_KEY);
    return null;
  }
}

export function saveAssessmentProgress(state) {
  localStorage.setItem(SAVED_ASSESSMENT_KEY, JSON.stringify(state));
}

export function clearSavedAssessmentProgress() {
  localStorage.removeItem(SAVED_ASSESSMENT_KEY);
}

export function setAssessmentNotice(message) {
  if (!message) {
    localStorage.removeItem("assessmentNotice");
    return;
  }
  localStorage.setItem("assessmentNotice", message);
}

export function getAssessmentState() {
  const sessionState = sessionStorage.getItem(ASSESSMENT_STATE_KEY);
  if (sessionState) {
    try {
      return JSON.parse(sessionState);
    } catch {
      // fall through to saved snapshot
    }
  }

  const savedState = getSavedAssessmentState();
  if (savedState) {
    return savedState;
  }

  return {
    step: 1,
    favourite_subject: "",
    interest_area: "",
    skills: [],
  };
}

export function setAssessmentState(state) {
  sessionStorage.setItem(ASSESSMENT_STATE_KEY, JSON.stringify(state));
  saveAssessmentProgress(state);
}

export function resetAssessmentState() {
  sessionStorage.removeItem(ASSESSMENT_STATE_KEY);
  clearSavedAssessmentProgress();
  setAssessmentState({
    step: 1,
    favourite_subject: "",
    interest_area: "",
    skills: [],
  });
}

export function getOnboardingState() {
  try {
    return (
      JSON.parse(sessionStorage.getItem(ONBOARDING_STATE_KEY)) || {
        step: 1,
        study_status: "",
        course: "",
        year_of_study: "",
      }
    );
  } catch {
    return {
      step: 1,
      study_status: "",
      course: "",
      year_of_study: "",
    };
  }
}

export function setOnboardingState(state) {
  sessionStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
}

export function resetOnboardingState() {
  setOnboardingState({
    step: 1,
    study_status: "",
    course: "",
    year_of_study: "",
  });
}

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("latestRecommendation");
  clearSavedAssessmentProgress();
}

export function navigate(path) {
  history.pushState({}, "", path);
  renderApp();
}

export async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message =
      data.detail ||
      data.message ||
      Object.values(data).flat().join(" ") ||
      "Request failed.";
    throw new Error(message);
  }
  return data;
}

export function setMessage(text, success = false) {
  const message = document.getElementById("message");
  if (!message) return;
  message.textContent = text;
  message.classList.toggle("success", success);
}

export function normalizeProfile(profile) {
  return profile || {};
}

export function normalizeRecommendationResult(result) {
  if (!result) return null;

  const normalizeList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === "string") {
      return value
        .split(/[|,]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  return {
    ...result,
    required_skills: normalizeList(result.required_skills),
    learning_resources: normalizeList(result.learning_resources),
    recommended_courses: normalizeList(result.recommended_courses),
  };
}

export function closeRecommendationModal() {
  document.getElementById("recommendationModal")?.remove();
}

export function showRecommendationModal(result) {
  closeRecommendationModal();
  const overlay = document.createElement("div");
  overlay.id = "recommendationModal";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-card success-state" role="dialog" aria-modal="true" aria-labelledby="recommendationModalTitle">
      <div class="success-badge">✓</div>
      <p class="eyebrow">AI Recommendation Ready</p>
      <h2 id="recommendationModalTitle">${result.predicted_career}</h2>
      <p class="score">Confidence: ${result.confidence_score}%</p>
      <p>${result.career_description}</p>
      <div class="modal-highlights">
        <div><strong>Skills</strong><p>${(result.required_skills || []).slice(0, 4).join(", ")}</p></div>
        <div><strong>Suggested Courses</strong><p>${(result.recommended_courses || []).slice(0, 3).join(", ")}</p></div>
      </div>
      <div class="actions">
        <button class="btn" id="viewRecommendationBtn" type="button">View full result</button>
        <button class="btn btn-secondary" id="closeRecommendationModalBtn" type="button">Close</button>
      </div>
    </div>
  `;

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeRecommendationModal();
  });

  document.body.appendChild(overlay);

  const viewButton = document.getElementById("viewRecommendationBtn");
  if (viewButton) {
    viewButton.addEventListener("click", () => {
      closeRecommendationModal();
      navigate("/recommendation");
    });
  }

  const closeButton = document.getElementById("closeRecommendationModalBtn");
  if (closeButton) {
    closeButton.addEventListener("click", closeRecommendationModal);
  }
}

export function nav() {
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();
  const userLabel = currentUser?.username || currentUser?.email || "your account";
  return `
    <nav class="nav">
      <a class="brand" href="/" data-link>AI Career Path</a>
      <div class="nav-links">
        <a href="/careers" data-link>Careers</a>
        ${authenticated
          ? `
              <span class="nav-user">Logged in as ${userLabel}</span>
              <a href="/dashboard" data-link>Dashboard</a>
              <a href="/assessment" data-link>Assessment</a>
              <a href="/history" data-link>History</a>
              <button class="link-button" id="logoutBtn">Logout</button>
            `
          : `
              <a href="/login" data-link>Login</a>
              <a class="btn btn-small" href="/register" data-link>Register</a>
            `}
      </div>
    </nav>
  `;
}

export async function logout() {
  try {
    await apiRequest("/logout", {
      method: "POST",
      body: JSON.stringify({ refresh: getRefreshToken() }),
    });
  } catch (error) {
    console.warn(error.message);
  }
  clearSession();
  navigate("/login");
}

export let renderApp = () => {};

export function attachRenderer(renderer) {
  renderApp = renderer;
}
