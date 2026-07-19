import { nav, normalizeRecommendationResult, showRecommendationModal } from "../app.js";

export function recommendationPage() {
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
