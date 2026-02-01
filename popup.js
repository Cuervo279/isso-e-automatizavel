document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  // URL
  const hostname = new URL(tab.url).hostname.replace("www.", "");
  document.getElementById("currentUrl").textContent = hostname;

  // Diagnóstico
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: searchContent
  });

  document.getElementById("currentPage").textContent =
    `${result.diagnostico} (${result.score}%)`;

  // BOTÃO PICKER
  document
    .getElementById("btnAnalisarElemento")
    .addEventListener("click", async () => {

      // 1️⃣ INJETA o selectorpick.js
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["selectorpick.js"]
      });

      // 2️⃣ ATIVA o picker
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.__RPA_PICKER__?.startElementPicker()
      });

      // 3️⃣ fecha popup (agora sim)
      window.close();
    });
});
