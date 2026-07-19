import { nav, apiRequest } from "../app.js";

export function historyPage() {
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

export async function loadHistory() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;
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
