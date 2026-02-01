// engine.js
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnAnalisarPagina");
  const resultsDiv = document.getElementById("results");

  if (!btn || !resultsDiv) return;

  btn.addEventListener("click", async () => {
    resultsDiv.innerHTML = "🔍 Analisando página...";

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: searchContent
    });

    renderResults(result, resultsDiv);
  });
});

// =========================
// Renderização do relatório<strong>${diagnostico}</strong>    <span>${score}%</span>
// =========================
function renderResults(result, container) {
  const { score, diagnostico, riscos } = result;

  let html = `
    <div class="result-header">
      <span>Riscos detectados: </span>
    </div>
  `;

  if (!riscos.length) {
    html += `<p class="ok">🟢 Nenhum risco relevante encontrado</p>`;
  } else {
    html += `<ul class="risks">`;
    riscos.forEach(r => {
      html += `<li>${r}</li>`;
    });
    html += `</ul>`;
  }

  container.innerHTML = html;
}
