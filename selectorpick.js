// ===============================
// selectorpick.js
// ===============================

// let pickingMode = false;
// let lastHighlighted = null;

var pickingMode = pickingMode || false;
var lastHighlighted = lastHighlighted || null;


// ===============================
// API PÚBLICA
// ===============================
function startElementPicker() {
  if (pickingMode) return;
  pickingMode = true;

  document.body.style.cursor = "crosshair";

  document.addEventListener("mousemove", highlightOnHover, true);
  document.addEventListener("click", pickElement, true);
}

function stopElementPicker() {
  pickingMode = false;

  document.body.style.cursor = "";
  removeHighlight();

  document.removeEventListener("mousemove", highlightOnHover, true);
  document.removeEventListener("click", pickElement, true);
}

// ===============================
// HOVER
// ===============================
function highlightOnHover(e) {
  if (!pickingMode) return;

  e.preventDefault();
  e.stopPropagation();

  const el = e.target;
  if (el === lastHighlighted) return;

  removeHighlight();
  applyHighlight(el);
  lastHighlighted = el;
}

// ===============================
// CLICK
// ===============================
function pickElement(e) {
  if (!pickingMode) return;

  e.preventDefault();
  e.stopPropagation();

  const el = e.target;
  const selector = bestSelector(el);

  navigator.clipboard.writeText(selector);
  console.log("Selector copiado:", selector);

  stopElementPicker();
}

// ===============================
// HIGHLIGHT
// ===============================
function applyHighlight(el) {
  el.dataset.__picker = "true";
  el.style.outline = "3px solid #ff6a00";
  el.style.backgroundColor = "rgba(255,106,0,0.15)";
  el.style.transition = "background-color 0.2s, outline 0.2s";
}

function removeHighlight() {
  document
    .querySelectorAll('[data-__picker="true"]')
    .forEach(el => {
      el.style.outline = "";
      el.style.backgroundColor = "";
      el.removeAttribute("data-__picker");
    });

  lastHighlighted = null;
}

// ===============================
// SELECTOR
// ===============================
function bestSelector(el) {
  if (!el || el === document.body) return "body";

  if (el.id) return `#${el.id}`;
  if (el.name) return `${el.tagName.toLowerCase()}[name="${el.name}"]`;
  if (el.getAttribute("aria-label")) return `${el.tagName.toLowerCase()}[aria-label="${el.getAttribute("aria-label")}"]`;

  const dataSel = dataAttributesSelector(el);
  if (dataSel) {
    const parent = el.parentElement;
    const parentDataSel = parent ? dataAttributesSelector(parent) : null;
    if (parentDataSel) return `${parentDataSel} > ${dataSel}`;
    return dataSel;
  }

  if (el.className && typeof el.className === "string") {
    const cls = el.className.split(" ").filter(Boolean)[0];
    if (cls) return `${el.tagName.toLowerCase()}.${cls}`;
  }
   console.log('teste')
  return el.tagName.toLowerCase();
}



// ===============================
// CONTEXT MENU
// ===============================
document.addEventListener("contextmenu", e => {
  window.__lastRightClickElement = e.target;
}, true);

function copySelectorFromContextMenu() {
  const el = window.__lastRightClickElement;
  if (!el) return;

  const selector = bestSelector(el);
  navigator.clipboard.writeText(selector);
  console.log("Selector copiado (menu):", selector);
}


// ===============================
// EXPOSIÇÃO
// ===============================
window.__RPA_PICKER__ = {
  startElementPicker,
  stopElementPicker,
  copySelectorFromContextMenu
};

function dataAttributesSelector(el) {
  if (!el.attributes) return null;

  const dataAttrs = Array.from(el.attributes)
    .filter(attr => attr.name.startsWith("data-") && attr.value.length < 30)
    .slice(0, 3); // limitar no máximo 3

  if (!dataAttrs.length) return null;

  const attrs = dataAttrs.map(attr => `[${attr.name}="${attr.value}"]`).join("");
  return `${el.tagName.toLowerCase()}${attrs}`;
}

