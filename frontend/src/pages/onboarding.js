import { nav, normalizeProfile, getOnboardingState, setOnboardingState, resetOnboardingState, apiRequest, setMessage, navigate } from "../app.js";

export function onboardingPromptPage(profile = {}) {
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

export function bindOnboarding() {
  const form = document.getElementById("onboardingForm");
  if (!form) return;

  const backStep = document.getElementById("backStepOnboarding");
  if (backStep) {
    backStep.addEventListener("click", () => {
      const state = getOnboardingState();
      if (state.step > 1) {
        setOnboardingState({ ...state, step: state.step - 1 });
        navigate("/onboarding");
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
      navigate("/onboarding");
      return;
    }

    if (state.step === 2) {
      const course = formData.get("course")?.toString().trim();
      const year_of_study = formData.get("year_of_study")?.toString().trim();
      setMessage("");
      setOnboardingState({ ...state, step: 3, course, year_of_study });
      navigate("/onboarding");
      return;
    }

    const payload = {
      study_status: state.study_status,
      course: state.course,
      year_of_study: state.year_of_study,
      onboarding_completed: true,
    };

    try {
      await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      resetOnboardingState();
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  });
}
