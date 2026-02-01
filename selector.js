// =========================
// selector.js
// =========================

// 🔹 BOOTSTRAP DO POPUP
document.addEventListener("DOMContentLoaded", () => {
  console.log("selector.js carregado");

  const container = document.getElementById("selector");
  if (!container) return;

  loadSelectors(container);
});

// =========================
// EXECUTA NA ABA ATIVA
// =========================
async function loadSelectors(container) {
  container.innerHTML = "🔎 Mapeando elementos da página...";

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: mapSelectors
  });

  renderSelectors(result, container);
}

// =========================
// RODA DENTRO DA PÁGINA
// =========================
function mapSelectors() {

  function bestSelector(el) {
    if (el.id) return `#${el.id}`;

    if (el.name)
      return `${el.tagName.toLowerCase()}[name="${el.name}"]`;

    if (el.getAttribute("aria-label"))
      return `${el.tagName.toLowerCase()}[aria-label="${el.getAttribute("aria-label")}"]`;

    // label associado
    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label)
        return `label:contains("${label.innerText.trim()}") + ${el.tagName.toLowerCase()}`;
    }

    // texto próximo (heurística RPA)
    const parentText = el.closest("label, div, td");
    if (parentText) {
      const txt = parentText.innerText.trim();
      if (txt && txt.length < 40)
        return `${el.tagName.toLowerCase()} >> text="${txt}"`;
    }

    // fallback
    if (el.className && typeof el.className === "string") {
      const cls = el.className.split(" ").filter(Boolean)[0];
      if (cls)
        return `${el.tagName.toLowerCase()}.${cls}`;
    }

    return el.tagName.toLowerCase();
  }

  const elements = [];

  document.querySelectorAll("input, button, select, textarea").forEach(el => {
    if (el.type === "hidden" || el.disabled) return;

    elements.push({
      type: el.tagName.toLowerCase(),
      name:
        el.placeholder ||
        el.value ||
        el.getAttribute("aria-label") ||
        el.name ||
        "(sem nome)",
      selector: bestSelector(el)
    });
  });

  return elements;
}

// =========================
// RENDER NO POPUP
// =========================
function renderSelectors(list, container) {
  if (!list.length) {
    container.innerHTML = "⚠️ Nenhum elemento relevante encontrado.";
    return;
  }

  let html = `<ul class="selector-list">`;

  list.forEach((el, i) => {
    html += `
      <li data-i="${i}">
        <strong>${el.type}</strong> — ${el.name}<br>
        <code>${el.selector}</code>
        <button class="copy-btn">Copiar</button>
      </li>
    `;
  });

  html += `</ul>`;
  container.innerHTML = html;

  console.log("Elementos mapeados:", list);

  // 🔹 COPIAR SELECTOR
  container.querySelectorAll(".copy-btn").forEach((btn, i) => {
    btn.onclick = () => {
      navigator.clipboard.writeText(list[i].selector);
      btn.innerText = "✔️";
      setTimeout(() => (btn.innerText = "Copiar"), 1000);
    };
  });

  // 🔹 HIGHLIGHT
  container.querySelectorAll("li").forEach(li => {
    const index = li.dataset.i;

    li.onmouseenter = () =>
      highlightOnPage(list[index].selector);

    li.onmouseleave = () =>
      removeHighlightOnPage();
  });
}

// =========================
// HIGHLIGHT (POPUP → PÁGINA)
// =========================
async function highlightOnPage(selector) {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: highlightElement,
    args: [selector]
  });
}

async function removeHighlightOnPage() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: removeHighlight
  });
}

// =========================
// RODA NA PÁGINA
// =========================
function highlightElement(selector) {
  removeHighlight();

  let el;
  try {
    el = document.querySelector(selector);
  } catch {
    return;
  }

  if (!el) return;

  el.dataset.__rpa_highlight = "true";
  el.style.outline = "3px solid #00ff99";
  el.style.backgroundColor = "rgba(0,255,153,0.15)";
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}

function removeHighlight() {
  const el = document.querySelector('[data-__rpa_highlight="true"]');
  if (!el) return;

  el.style.outline = "";
  el.style.backgroundColor = "";
  el.removeAttribute("data-__rpa_highlight");
}
