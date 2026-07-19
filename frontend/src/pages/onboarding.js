import { nav, normalizeProfile, getOnboardingState, setOnboardingState, resetOnboardingState, apiRequest, setMessage, navigate } from "../app.js";

function getAdvice(state) {
  if (state.student_type === "continuing_student") {
    return "You are already building momentum. Keep your current course as the anchor and add one practical skill at a time so your next step feels possible.";
  }

  if (state.student_type === "high_school_student") {
    return "You do not need to have everything figured out. Explore subjects you enjoy, keep your options open, and choose one next step that feels exciting.";
  }

  return "You do not need a perfect plan. Start with one strength, one goal, and one small action that moves you forward.";
}

function getStepTitle(state) {
  if (state.student_type === "continuing_student") {
    return "Continue your academic momentum";
  }
  if (state.student_type === "high_school_student") {
    return "Shape your future with confidence";
  }
  return "Start your next chapter";
}

export function onboardingPromptPage(profile = {}) {
  const safeProfile = normalizeProfile(profile);
  const state = getOnboardingState();
  const mergedState = {
    ...state,
    study_status: state.study_status || safeProfile.study_status || "",
    student_type: state.student_type || safeProfile.student_type || "",
    education_level: state.education_level || safeProfile.education_level || "",
    course: state.course || safeProfile.course || "",
    year_of_study: state.year_of_study || safeProfile.year_of_study || "",
    career_goal: state.career_goal || safeProfile.career_goal || "",
    support_note: state.support_note || safeProfile.support_note || "",
  };
  const isNew = mergedState.study_status === "new" || !safeProfile.onboarding_completed;
  const heading = isNew ? "Welcome, let us personalize your guidance" : "Continue your career journey";
  const description = isNew
    ? "This short guide helps us tailor recommendations for first-time applicants, continuing students, and high school learners."
    : "You can update your profile at any time before starting a new assessment.";

  const stepIndicator = `
    <div class="stepper">
      <span class="step ${mergedState.step === 1 ? "active" : mergedState.step > 1 ? "completed" : ""}">1</span>
      <span class="step-divider"></span>
      <span class="step ${mergedState.step === 2 ? "active" : mergedState.step > 2 ? "completed" : ""}">2</span>
      <span class="step-divider"></span>
      <span class="step ${mergedState.step === 3 ? "active" : mergedState.step > 3 ? "completed" : ""}">3</span>
      <span class="step-divider"></span>
      <span class="step ${mergedState.step === 4 ? "active" : ""}">4</span>
    </div>
  `;

  const adviceCard = `<div class="summary-card"><strong>Guidance for you</strong><p class="muted">${getAdvice(mergedState)}</p></div>`;

  const stepContent =
    mergedState.step === 1
      ? `
        <label>How would you describe your journey?
          <select name="student_type">
            <option value="">Select one</option>
            <option value="first_time_applicant" ${mergedState.student_type === "first_time_applicant" ? "selected" : ""}>First-time applicant</option>
            <option value="continuing_student" ${mergedState.student_type === "continuing_student" ? "selected" : ""}>Continuing student</option>
            <option value="high_school_student" ${mergedState.student_type === "high_school_student" ? "selected" : ""}>High school student</option>
          </select>
        </label>
        <label>Are you new to the system or continuing your studies?
          <select name="study_status">
            <option value="">Select one</option>
            <option value="new" ${mergedState.study_status === "new" ? "selected" : ""}>New to the system</option>
            <option value="continuing" ${mergedState.study_status === "continuing" ? "selected" : ""}>Continuing student</option>
          </select>
        </label>
        ${adviceCard}
        <div class="actions">
          <button class="btn btn-secondary" type="button" id="skipOnboarding">Skip for now</button>
          <button class="btn" type="submit">Next</button>
        </div>
      `
      : mergedState.step === 2
      ? `
        ${mergedState.student_type === "continuing_student"
          ? `
            <label>Course or current study focus
              <input name="course" type="text" value="${mergedState.course}" placeholder="e.g. Computer Science"></label>
            <label>Year of Study
              <select name="year_of_study">
                <option value="">Select year</option>
                <option value="1" ${mergedState.year_of_study === "1" ? "selected" : ""}>Year 1</option>
                <option value="2" ${mergedState.year_of_study === "2" ? "selected" : ""}>Year 2</option>
                <option value="3" ${mergedState.year_of_study === "3" ? "selected" : ""}>Year 3</option>
                <option value="4" ${mergedState.year_of_study === "4" ? "selected" : ""}>Year 4</option>
              </select>
            </label>
          `
          : mergedState.student_type === "high_school_student"
          ? `
            <label>Current education level
              <select name="education_level">
                <option value="">Select level</option>
                <option value="high_school" ${mergedState.education_level === "high_school" ? "selected" : ""}>High school</option>
                <option value="college" ${mergedState.education_level === "college" ? "selected" : ""}>College</option>
                <option value="vocational" ${mergedState.education_level === "vocational" ? "selected" : ""}>Vocational / technical</option>
                <option value="other" ${mergedState.education_level === "other" ? "selected" : ""}>Other</option>
              </select>
            </label>
            <label>What career or study path are you exploring?
              <input name="career_goal" type="text" value="${mergedState.career_goal}" placeholder="e.g. Software engineering"></label>
          `
          : `
            <label>What career or study path are you exploring?
              <input name="career_goal" type="text" value="${mergedState.career_goal}" placeholder="e.g. Data analyst"></label>
          `}
        ${adviceCard}
        <div class="actions">
          <button type="button" class="btn btn-secondary" id="backStepOnboarding">Back</button>
          <button class="btn btn-secondary" type="button" id="skipOnboarding">Skip for now</button>
          <button class="btn" type="submit">Next</button>
        </div>
      `
      : mergedState.step === 3
      ? `
        <label>What is your main career goal? (optional)
          <input name="career_goal" type="text" value="${mergedState.career_goal}" placeholder="e.g. Become a UX designer"></label>
        <label>What support would help you keep going? (optional)
          <textarea name="support_note" rows="4" placeholder="Share a challenge, a question, or the kind of support you need">${mergedState.support_note}</textarea></label>
        ${adviceCard}
        <div class="actions">
          <button type="button" class="btn btn-secondary" id="backStepOnboarding">Back</button>
          <button class="btn btn-secondary" type="button" id="skipOnboarding">Skip for now</button>
          <button class="btn" type="submit">Review</button>
        </div>
      `
      : `
        <section class="summary-card">
          <h2>Review your onboarding details</h2>
          <p class="muted">We will use this information to tailor your guidance and recommend relevant resources.</p>
          <div class="summary-grid">
            <div class="summary-item">
              <strong>Journey</strong>
              <p>${mergedState.student_type === "first_time_applicant" ? "First-time applicant" : mergedState.student_type === "continuing_student" ? "Continuing student" : mergedState.student_type === "high_school_student" ? "High school student" : "Not selected"}</p>
            </div>
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
            <div class="summary-item">
              <strong>Education Level</strong>
              <p>${mergedState.education_level ? mergedState.education_level.replace(/_/g, " ") : "Not provided"}</p>
            </div>
            <div class="summary-item">
              <strong>Career Goal</strong>
              <p>${mergedState.career_goal || "Not provided"}</p>
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
          <h2>${getStepTitle(mergedState)}</h2>
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
        await apiRequest("/profile", {
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
      const student_type = formData.get("student_type")?.toString().trim();
      if (!study_status || !student_type) {
        setMessage("Please tell us what kind of student you are and whether you are new or continuing.");
        return;
      }
      setMessage("");
      setOnboardingState({ ...state, step: 2, study_status, student_type });
      navigate("/onboarding");
      return;
    }

    if (state.step === 2) {
      const course = formData.get("course")?.toString().trim();
      const year_of_study = formData.get("year_of_study")?.toString().trim();
      const education_level = formData.get("education_level")?.toString().trim();
      const career_goal = formData.get("career_goal")?.toString().trim();
      setMessage("");
      setOnboardingState({ ...state, step: 3, course, year_of_study, education_level, career_goal });
      navigate("/onboarding");
      return;
    }

    if (state.step === 3) {
      const career_goal = formData.get("career_goal")?.toString().trim();
      const support_note = formData.get("support_note")?.toString().trim();
      setMessage("");
      setOnboardingState({ ...state, step: 4, career_goal, support_note });
      navigate("/onboarding");
      return;
    }

    const payload = {
      study_status: state.study_status,
      student_type: state.student_type,
      education_level: state.education_level,
      course: state.course,
      year_of_study: state.year_of_study,
      career_goal: state.career_goal,
      support_note: state.support_note,
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
