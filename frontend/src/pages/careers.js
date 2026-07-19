import { nav, apiRequest } from "../app.js";

export function careersPage() {
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

export async function loadCareers() {
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
