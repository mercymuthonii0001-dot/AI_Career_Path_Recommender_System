const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const subjects = [
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

const interests = [
  "Technology",
  "Business",
  "Healthcare",
  "Education",
  "Engineering",
  "Arts",
  "Agriculture",
  "Finance",
];

const skills = [
  "Problem Solving",
  "Communication",
  "Creativity",
  "Leadership",
  "Programming",
  "Analysis",
  "Teamwork",
];

const app = document.getElementById("app");

function getToken() {
  return localStorage.getItem("accessToken");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function isAuthenticated() {
  return Boolean(getToken());
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

function getDisplayName(profile = null) {
  const currentUser = getCurrentUser();
  return profile?.full_name || profile?.username || currentUser?.username || currentUser?.email || "your account";
}

function saveSession(data) {
  localStorage.setItem("accessToken", data.tokens.access);
  localStorage.setItem("refreshToken", data.tokens.refresh);
  localStorage.setItem("currentUser", JSON.stringify(data.user));
}

const ASSESSMENT_STATE_KEY = "assessmentState";
const ONBOARDING_STATE_KEY = "onboardingState";
const SAVED_ASSESSMENT_KEY = "savedAssessment";
const PENDING_RECOMMENDATION_KEY = "pendingRecommendation";

function getSavedAssessmentState() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_ASSESSMENT_KEY));
  } catch {
    return null;
  }
}

function consumePendingRecommendation() {
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

function saveAssessmentProgress(state) {
  localStorage.setItem(SAVED_ASSESSMENT_KEY, JSON.stringify(state));
}

function clearSavedAssessmentProgress() {
  localStorage.removeItem(SAVED_ASSESSMENT_KEY);
}

function setAssessmentNotice(message) {
  if (!message) {
    localStorage.removeItem("assessmentNotice");
    return;
  }
  localStorage.setItem("assessmentNotice", message);
}

function getAssessmentState() {
  const sessionState = sessionStorage.getItem(ASSESSMENT_STATE_KEY);
  if (sessionState) {
    try {
      return JSON.parse(sessionState);
    } catch {
      // fall back to the saved snapshot below
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

function setAssessmentState(state) {
  sessionStorage.setItem(ASSESSMENT_STATE_KEY, JSON.stringify(state));
  saveAssessmentProgress(state);
}

function resetAssessmentState() {
  sessionStorage.removeItem(ASSESSMENT_STATE_KEY);
  clearSavedAssessmentProgress();
  setAssessmentState({
    step: 1,
    favourite_subject: "",
    interest_area: "",
    skills: [],
  });
}

function getOnboardingState() {
  try {
    return JSON.parse(sessionStorage.getItem(ONBOARDING_STATE_KEY)) || {
      step: 1,
      study_status: "",
      course: "",
      year_of_study: "",
    };
  } catch {
    return {
      step: 1,
      study_status: "",
      course: "",
      year_of_study: "",
    };
  }
}

function setOnboardingState(state) {
  sessionStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
}

function resetOnboardingState() {
  setOnboardingState({
    step: 1,
    study_status: "",
    course: "",
    year_of_study: "",
  });
}

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("latestRecommendation");
  clearSavedAssessmentProgress();
}

function navigate(path) {
  history.pushState({}, "", path);
  render();
}

async function apiRequest(path, options = {}) {
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

async function logout() {
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

function nav() {
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();
  const userLabel = currentUser?.username || currentUser?.email || "your account";
  return `
    <nav class="nav">
      <a class="brand" href="/" data-link>AI Career Path</a>
      <div class="nav-links">
        <a href="/careers" data-link>Careers</a>
        ${
          authenticated
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
            `
        }
      </div>
    </nav>
  `;
}

function homePage() {
  const heroActions = isAuthenticated()
    ? `<a class="btn" href="/dashboard" data-link>Go to Dashboard</a>`
    : `
        <a class="btn" href="/register" data-link>Create Account</a>
        <a class="btn btn-secondary" href="/login" data-link>Login</a>
      `;

  return `
    ${nav()}
    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Zetech University Project</p>
          <h1>AI Career Path Recommender System</h1>
          <p>
            Discover suitable careers based on your favourite subjects, interests,
            skills, and preferences using a Decision Tree machine learning model.
          </p>
          <div class="actions">
            ${heroActions}
          </div>
        </div>
        <div class="hero-panel">
          <div class="signal-card">
            <span>Recommended path</span>
            <strong>Software Engineer</strong>
            <small>Confidence: 94%</small>
          </div>
          <div class="mini-grid">
            <span>Technology</span>
            <span>Programming</span>
            <span>Analysis</span>
            <span>Problem Solving</span>
          </div>
        </div>
      </section>
      <section class="section">
        <h2>About the System</h2>
        <div class="feature-grid">
          <article>
            <h3>Student Assessment</h3>
            <p>Collects academic interests, favourite subjects, and skills through a simple questionnaire.</p>
          </article>
          <article>
            <h3>AI Prediction</h3>
            <p>Uses Scikit-learn DecisionTreeClassifier to recommend a suitable career path.</p>
          </article>
          <article>
            <h3>Career Guidance</h3>
            <p>Displays career descriptions, required skills, learning resources, and recommendation history.</p>
          </article>
        </div>
      </section>
    </main>
  `;
}

function registerPage() {
  return `
    ${nav()}
    <main class="auth-shell">
      <form class="card form" id="registerForm">
        <h1>Create Account</h1>
        <p class="muted">Create your account first. Then the system will guide you through your profile setup after login.</p>
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

function loginPage() {
  return `
    ${nav()}
    <main class="auth-shell">
      <form class="card form" id="loginForm">
        <h1>Welcome Back</h1>
        <p class="muted">Login to continue your career guidance session.</p>
        <label>Username<input required name="username" type="text"></label>
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

function normalizeProfile(profile) {
  return profile || {};
}

function onboardingPromptPage(profile = {}) {
  const safeProfile = normalizeProfile(profile);
  const state = getOnboardingState();
  const mergedState = {
    ...state,
    study_status: state.study_status || safeProfile.study_status || "",
    course: state.course || safeProfile.course || "",
    year_of_study: state.year_of_study || safeProfile.year_of_study || "",
  };
  const isNew = mergedState.study_status === "new" || !safeProfile.onboarding_completed;
  const heading = isNew ? "Welcome, let us personalize your guidance" : "Continue your career journey";
  const description = isNew
    ? "This short guide helps us tailor recommendations for both first-time users and continuing students."
    : "You can update your profile at any time before starting a new assessment.";

  const stepIndicator = `
    <div class="stepper">
      <span class="step ${mergedState.step === 1 ? "active" : mergedState.step > 1 ? "completed" : ""}">1</span>
      <span class="step-divider"></span>
      <span class="step ${mergedState.step === 2 ? "active" : mergedState.step > 2 ? "completed" : ""}">2</span>
      <span class="step-divider"></span>
      <span class="step ${mergedState.step === 3 ? "active" : ""}">3</span>
    </div>
  `;

  const stepContent =
    mergedState.step === 1
      ? `
        <div class="option-grid">
          <label class="option-card ${mergedState.study_status === "new" ? "selected" : ""}">
            <input type="radio" name="study_status" value="new" ${mergedState.study_status === "new" ? "checked" : ""}>
            <span>New to the system</span>
          </label>
          <label class="option-card ${mergedState.study_status === "continuing" ? "selected" : ""}">
            <input type="radio" name="study_status" value="continuing" ${mergedState.study_status === "continuing" ? "checked" : ""}>
            <span>Continuing student</span>
          </label>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" type="button" id="skipOnboarding">Skip for now</button>
          <button class="btn" type="submit">Next</button>
        </div>
      `
      : mergedState.step === 2
      ? `
        <label>Course or study focus (optional)
          <input name="course" type="text" value="${mergedState.course}" placeholder="e.g. Computer Science"></label>
        <label>Year of Study (optional)
          <select name="year_of_study">
            <option value="">Select year</option>
            <option value="1" ${mergedState.year_of_study === "1" ? "selected" : ""}>Year 1</option>
            <option value="2" ${mergedState.year_of_study === "2" ? "selected" : ""}>Year 2</option>
            <option value="3" ${mergedState.year_of_study === "3" ? "selected" : ""}>Year 3</option>
            <option value="4" ${mergedState.year_of_study === "4" ? "selected" : ""}>Year 4</option>
          </select>
        </label>
        <div class="actions">
          <button type="button" class="btn btn-secondary" id="backStepOnboarding">Back</button>
          <button class="btn btn-secondary" type="button" id="skipOnboarding">Skip for now</button>
          <button class="btn" type="submit">Next</button>
        </div>
      `
      : `
        <section class="summary-card">
          <h2>Review your onboarding details</h2>
          <p class="muted">We will use this information to tailor your guidance and recommend relevant resources.</p>
          <div class="summary-grid">
            <div class="summary-item">
              <strong>Study Status</strong>
              <p>${mergedState.study_status === "new" ? "New to the system" : mergedState.study_status === "continuing" ? "Continuing student" : "Not selected"}</p>
            </div>
            <div class="summary-item">
              <strong>Course</strong>
              <p>${mergedState.course || "Not provided"}</p>
            </div>
            <div class="summary-item">
              <strong>Year of Study</strong>
              <p>${mergedState.year_of_study ? `Year ${mergedState.year_of_study}` : "Not provided"}</p>
            </div>
          </div>
        </section>
        <div class="actions">
          <button type="button" class="btn btn-secondary" id="backStepOnboarding">Back</button>
          <button class="btn btn-secondary" type="button" id="skipOnboarding">Skip for now</button>
          <button class="btn" type="submit">Complete setup</button>
        </div>
      `;

  return `
    ${nav()}
    <main class="page narrow">
      <section class="card form onboarding-card">
        <div class="welcome-banner">
          <p class="eyebrow">Personalized onboarding</p>
          <h1>${heading}</h1>
          <p class="muted">${description}</p>
        </div>
        ${stepIndicator}
        <form id="onboardingForm">
          ${stepContent}
          <p id="message" class="message"></p>
        </form>
      </section>
    </main>
  `;
}

function dashboardPage(profile = {}) {
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
  const savedAssessment = getSavedAssessmentState();
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

function assessmentPage() {
  const state = getAssessmentState();
  const subjectOptions = subjects.map(
    (value) => `<option value="${value}" ${value === state.favourite_subject ? "selected" : ""}>${value}</option>`
  ).join("");
  const interestOptions = interests.map(
    (value) => `<option value="${value}" ${value === state.interest_area ? "selected" : ""}>${value}</option>`
  ).join("");
  const skillOptions = skills
    .map(
      (skill) => `
        <label>
          <input type="checkbox" name="skills" value="${skill}" ${state.skills.includes(skill) ? "checked" : ""}>
          ${skill}
        </label>`
    )
    .join("");

  const progressPercent = state.step === 1 ? 33 : state.step === 2 ? 66 : 100;
  const stepIndicator = `
    <div class="progress-block">
      <div class="progress-meta">
        <span>Step ${state.step} of 3</span>
        <span>${progressPercent}% complete</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${progressPercent}%"></div>
      </div>
    </div>
    <div class="stepper">
      <span class="step ${state.step === 1 ? "active" : "completed"}">1</span>
      <span class="step-divider"></span>
      <span class="step ${state.step === 2 ? "active" : state.step > 2 ? "completed" : ""}">2</span>
      <span class="step-divider"></span>
      <span class="step ${state.step === 3 ? "active" : ""}">3</span>
    </div>
  `;

  const stepContent =
    state.step === 1
      ? `
        <label>Favourite Subject
          <select required name="favourite_subject">
            <option value="">Select subject</option>
            ${subjectOptions}
          </select>
        </label>
        <label>Interest Area
          <select required name="interest_area">
            <option value="">Select interest</option>
            ${interestOptions}
          </select>
        </label>
        <div class="actions">
          <button class="btn btn-secondary" type="button" id="saveLaterBtn">Continue later</button>
          <button class="btn" type="submit">Next</button>
        </div>
      `
      : state.step === 2
      ? `
        <fieldset>
          <legend>What are your strongest skills?</legend>
          <div class="check-grid">${skillOptions}</div>
        </fieldset>
        <div class="actions">
          <button type="button" class="btn btn-secondary" id="backStep">Back</button>
          <button class="btn btn-secondary" type="button" id="saveLaterBtn">Continue later</button>
          <button class="btn" type="submit">Next</button>
        </div>
      `
      : `
        <section class="summary-card">
          <h2>Review your career profile</h2>
          <p class="muted">Confirm your answers before we suggest a career path and course plan.</p>
          <div class="summary-grid">
            <div>
              <strong>Favourite Subject</strong>
              <p>${state.favourite_subject || "-"}</p>
            </div>
            <div>
              <strong>Interest Area</strong>
              <p>${state.interest_area || "-"}</p>
            </div>
            <div>
              <strong>Skills</strong>
              <p>${state.skills.length ? state.skills.join(", ") : "-"}</p>
            </div>
          </div>
        </section>
        <div class="actions">
          <button type="button" class="btn btn-secondary" id="backStep">Back</button>
          <button class="btn btn-secondary" type="button" id="saveLaterBtn">Continue later</button>
          <button class="btn" type="submit">Get Recommendation</button>
        </div>
      `;

  return `
    ${nav()}
    <main class="page narrow">
      <form class="card form" id="assessmentForm">
        <h1>Guided Career Discovery</h1>
        <p class="muted">Answer a few questions and we will suggest your best career path and matching courses.</p>
        ${stepIndicator}
        ${stepContent}
        <p id="message" class="message"></p>
      </form>
    </main>
  `;
}

function normalizeRecommendationResult(result) {
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

function closeRecommendationModal() {
  document.getElementById("recommendationModal")?.remove();
}

function showRecommendationModal(result) {
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

function recommendationPage() {
  const storedResult = JSON.parse(localStorage.getItem("latestRecommendation") || "null");
  const result = normalizeRecommendationResult(storedResult);
  if (result) {
    requestAnimationFrame(() => showRecommendationModal(result));
  }
  if (!result) {
    return `
      ${nav()}
      <main class="page narrow">
        <section class="card">
          <h1>No Recommendation Yet</h1>
          <p class="muted">Complete an assessment first.</p>
          <a class="btn" href="/assessment" data-link>Start Assessment</a>
        </section>
      </main>
    `;
  }

  const skillList = result.required_skills.map((skill) => `<li>${skill}</li>`).join("");
  const resourceList = result.learning_resources
    .map((resource) => {
      const parts = resource.split(" - ");
      return parts.length === 2
        ? `<li><a href="${parts[1]}" target="_blank" rel="noopener">${parts[0]}</a></li>`
        : `<li>${resource}</li>`;
    })
    .join("");

  const courseList = (result.recommended_courses || [])
    .map((course) => `<li>${course}</li>`)
    .join("");
  return `
    ${nav()}
    <main class="page narrow">
      <section class="card result-card success-state">
        <div class="success-badge">✓</div>
        <p class="eyebrow">AI Recommendation Ready</p>
        <h1>${result.predicted_career}</h1>
        <p class="score">Confidence: ${result.confidence_score}%</p>
        <p>${result.career_description}</p>
        <h2>Required Skills</h2>
        <ul>${skillList}</ul>
        <h2>Recommended Courses</h2>
        <ul>${courseList}</ul>
        <h2>Learning Resources</h2>
        <ul>${resourceList}</ul>
        <div class="actions">
          <a class="btn" href="/assessment" data-link>Retake Assessment</a>
          <a class="btn btn-secondary" href="/history" data-link>View History</a>
        </div>
      </section>
    </main>
  `;
}

function careersPage() {
  return `
    ${nav()}
    <main class="page">
      <section class="dashboard-head">
        <div>
          <p class="eyebrow">Career Library</p>
          <h1>Explore career options</h1>
          <p class="muted">Browse career descriptions, skills, and learning resources powered by the recommendation backend.</p>
        </div>
      </section>
      <section class="career-grid" id="careerList">
        <p class="muted">Loading career options...</p>
      </section>
    </main>
  `;
}

function historyPage() {
  return `
    ${nav()}
    <main class="page">
      <section class="dashboard-head">
        <div>
          <p class="eyebrow">Recommendation History</p>
          <h1>Your Previous Results</h1>
        </div>
        <a class="btn" href="/assessment" data-link>New Assessment</a>
      </section>
      <section class="history-list" id="historyList"></section>
    </main>
  `;
}

function notFoundPage() {
  return `
    ${nav()}
    <main class="page narrow">
      <section class="card">
        <h1>Page Not Found</h1>
        <p class="muted">The page you requested does not exist.</p>
        <a class="btn" href="/" data-link>Go Home</a>
      </section>
    </main>
  `;
}

function protectedPage(page, extraData = {}) {
  if (!isAuthenticated()) {
    history.replaceState({}, "", "/login");
    return loginPage();
  }
  return page(extraData || {});
}

let currentProfile = null;

async function loadProfile() {
  if (!getToken()) return null;
  try {
    const profile = await apiRequest("/profile");
    currentProfile = profile;
    return profile;
  } catch (error) {
    currentProfile = null;
    return null;
  }
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
    "/dashboard": () => protectedPage(dashboardPage, currentProfile),
    "/assessment": () => protectedPage(assessmentPage),
    "/recommendation": () => protectedPage(recommendationPage),
    "/history": () => protectedPage(historyPage),
    "/careers": careersPage,
    "/onboarding": () => protectedPage(onboardingPromptPage, currentProfile),
  };
  app.innerHTML = (routes[path] || notFoundPage)();
  bindPageEvents(path);

  if (path === "/dashboard" || path === "/onboarding") {
    const profile = await loadProfile();
    if (path === "/dashboard") {
      app.innerHTML = dashboardPage(profile || currentProfile || {});
    } else if (path === "/onboarding") {
      app.innerHTML = onboardingPromptPage(profile || currentProfile || {});
    }
    bindPageEvents(path);
  }

  if (path === "/dashboard") {
    const pendingRecommendation = consumePendingRecommendation();
    if (pendingRecommendation) {
      showRecommendationModal(pendingRecommendation);
    }
  }
}

function setMessage(text, success = false) {
  const message = document.getElementById("message");
  if (!message) return;
  message.textContent = text;
  message.classList.toggle("success", success);
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

  if (path === "/register" || path === "/login") bindPasswordToggles();
  if (path === "/register") bindRegister();
  if (path === "/login") bindLogin();
  if (path === "/dashboard") loadDashboard();
  if (path === "/assessment") bindAssessment();
  if (path === "/history") loadHistory();
  if (path === "/careers") loadCareers();
  if (path === "/onboarding") bindOnboarding();
}

function bindRegister() {
  document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const data = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      saveSession(data);
      navigate("/onboarding");
    } catch (error) {
      setMessage(error.message);
    }
  });
}

function bindLogin() {
  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
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

function bindPasswordToggles() {
  document.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const container = button.closest(".password-field");
      if (!container) return;
      const input = container.querySelector("input");
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "🙈" : "👁️";
    });
  });
}

function bindOnboarding() {
  const form = document.getElementById("onboardingForm");
  if (!form) return;

  const backStep = document.getElementById("backStepOnboarding");
  if (backStep) {
    backStep.addEventListener("click", () => {
      const state = getOnboardingState();
      if (state.step > 1) {
        setOnboardingState({ ...state, step: state.step - 1 });
        render();
      }
    });
  }

  const skipButtons = document.querySelectorAll("#skipOnboarding");
  skipButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const profile = await apiRequest("/profile", {
          method: "PUT",
          body: JSON.stringify({ onboarding_completed: true }),
        });
        currentProfile = profile;
        resetOnboardingState();
        navigate("/dashboard");
      } catch (error) {
        setMessage(error.message);
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const state = getOnboardingState();
    const formData = new FormData(form);

    if (state.step === 1) {
      const study_status = formData.get("study_status")?.toString().trim();
      if (!study_status) {
        setMessage("Please tell us whether you are new or continuing.");
        return;
      }
      setMessage("");
      setOnboardingState({ ...state, step: 2, study_status });
      render();
      return;
    }

    if (state.step === 2) {
      const course = formData.get("course")?.toString().trim();
      const year_of_study = formData.get("year_of_study")?.toString().trim();
      setMessage("");
      setOnboardingState({ ...state, step: 3, course, year_of_study });
      render();
      return;
    }

    const payload = {
      study_status: state.study_status,
      course: state.course,
      year_of_study: state.year_of_study,
      onboarding_completed: true,
    };

    try {
      const profile = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      currentProfile = profile;
      resetOnboardingState();
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  });
}

async function loadDashboard() {
  const welcome = document.getElementById("welcome");
  try {
    const profile = await apiRequest("/profile");
    welcome.textContent = `Welcome, ${profile.full_name}`;
  } catch (error) {
    welcome.textContent = "Welcome";
  }
}

function bindAssessment() {
  const form = document.getElementById("assessmentForm");
  if (!form) return;

  let isSubmitting = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const state = getAssessmentState();
    const formData = new FormData(form);

    if (state.step === 1) {
      const favourite_subject = formData.get("favourite_subject")?.toString().trim();
      const interest_area = formData.get("interest_area")?.toString().trim();
      if (!favourite_subject || !interest_area) {
        setMessage("Please choose both a subject and an interest area.");
        return;
      }
      setMessage("");
      setAssessmentState({ ...state, step: 2, favourite_subject, interest_area });
      render();
      return;
    }

    if (state.step === 2) {
      const selectedSkills = [...form.querySelectorAll("input[name='skills']:checked")].map((input) => input.value);
      if (!selectedSkills.length) {
        setMessage("Select at least one skill.");
        return;
      }
      setMessage("");
      setAssessmentState({ ...state, step: 3, skills: selectedSkills });
      render();
      return;
    }

    if (state.step === 3) {
      if (isSubmitting) return;
      isSubmitting = true;

      const payload = {
        favourite_subject: state.favourite_subject,
        interest_area: state.interest_area,
        skills: state.skills,
      };
      try {
        setMessage("Generating recommendation...", true);
        const result = await apiRequest("/recommend", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const normalizedResult = normalizeRecommendationResult(result);
        localStorage.setItem("latestRecommendation", JSON.stringify(normalizedResult));
        localStorage.setItem(PENDING_RECOMMENDATION_KEY, JSON.stringify(normalizedResult));
        resetAssessmentState();
        navigate("/dashboard");
      } catch (error) {
        isSubmitting = false;
        setMessage(error.message);
      }
    }
  });

  const backStep = document.getElementById("backStep");
  if (backStep) {
    backStep.addEventListener("click", () => {
      const state = getAssessmentState();
      if (state.step > 1) {
        setAssessmentState({ ...state, step: state.step - 1 });
        render();
      }
    });
  }

  const saveLaterButton = document.getElementById("saveLaterBtn");
  if (saveLaterButton) {
    saveLaterButton.addEventListener("click", () => {
      const state = getAssessmentState();
      setAssessmentState(state);
      setAssessmentNotice("Your assessment progress has been saved. You can resume it anytime.");
      navigate("/dashboard");
    });
  }
}

async function loadHistory() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = '<p class="muted">Loading recommendations...</p>';
  try {
    const historyItems = await apiRequest("/history");
    if (!historyItems.length) {
      historyList.innerHTML = `
        <article class="history-item">
          <h2>No recommendations yet</h2>
          <p class="muted">Start an assessment to generate your first result.</p>
        </article>
      `;
      return;
    }
    historyList.innerHTML = historyItems
      .map((item) => {
        const date = new Date(item.created_at).toLocaleString();
        const tags = [item.favourite_subject, item.interest_area, ...item.skills]
          .map((tag) => `<span class="tag">${tag}</span>`)
          .join("");
        return `
          <article class="history-item">
            <p class="eyebrow">${date}</p>
            <h2>${item.predicted_career}</h2>
            <p class="score">Confidence: ${item.confidence_score}%</p>
            <p>${item.career_description}</p>
            <div class="tag-row">${tags}</div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    historyList.innerHTML = `
      <article class="history-item">
        <h2>Unable to load history</h2>
        <p class="muted">${error.message}</p>
      </article>
    `;
  }
}

async function loadCareers() {
  const careerList = document.getElementById("careerList");
  if (!careerList) return;
  careerList.innerHTML = '<p class="muted">Loading career options...</p>';

  try {
    const careers = await apiRequest("/careers");
    if (!careers.length) {
      careerList.innerHTML = `
        <article class="card">
          <h2>No careers available</h2>
          <p class="muted">There are no career options to display at this time.</p>
        </article>
      `;
      return;
    }

    careerList.innerHTML = careers
      .map((career) => {
        const skills = career.required_skills.map((skill) => `<li>${skill}</li>`).join("");
        const courses = (career.recommended_courses || []).map((course) => `<li>${course}</li>`).join("");
        const resources = career.learning_resources
          .map((resource) => {
            const parts = resource.split(" - ");
            return parts.length === 2
              ? `<li><a href="${parts[1]}" target="_blank" rel="noopener">${parts[0]}</a></li>`
              : `<li>${resource}</li>`;
          })
          .join("");
        return `
          <article class="card career-item">
            <h2>${career.name}</h2>
            <p>${career.description}</p>
            <div class="career-meta">
              <div>
                <h3>Skills</h3>
                <ul>${skills}</ul>
              </div>
              <div>
                <h3>Recommended Courses</h3>
                <ul>${courses}</ul>
              </div>
            </div>
            <div class="career-meta career-resources">
              <div>
                <h3>Resources</h3>
                <ul>${resources}</ul>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    careerList.innerHTML = `
      <article class="card">
        <h2>Unable to load career options</h2>
        <p class="muted">${error.message}</p>
      </article>
    `;
  }
}

window.addEventListener("popstate", render);
render();
