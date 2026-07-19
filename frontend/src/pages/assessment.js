import { nav, subjects, interests, skills, getAssessmentState, setAssessmentState, setMessage, resetAssessmentState, setAssessmentNotice, apiRequest, normalizeRecommendationResult, navigate } from "../app.js";

export function assessmentPage() {
  const state = getAssessmentState();
  const subjectOptions = subjects
    .map((value) => `<option value="${value}" ${value === state.favourite_subject ? "selected" : ""}>${value}</option>`)
    .join("");
  const interestOptions = interests
    .map((value) => `<option value="${value}" ${value === state.interest_area ? "selected" : ""}>${value}</option>`)
    .join("");
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

export function bindAssessment() {
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
      navigate("/assessment");
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
      navigate("/assessment");
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
        localStorage.setItem("pendingRecommendation", JSON.stringify(normalizedResult));
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
        navigate("/assessment");
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
