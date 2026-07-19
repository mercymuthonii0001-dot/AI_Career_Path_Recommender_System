import { nav, isAuthenticated } from "../app.js";

export function homePage() {
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
