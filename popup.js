// =========================
// popup.js
// =========================
//Desenvolvido por Leonardo Cuervo

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

  document
    .getElementById("btnAnalisarElemento")
    .addEventListener("click", async () => {


      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["selectorpick.js"]
      });


      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.__RPA_PICKER__?.startElementPicker()
      });

      window.close();
    });
});
