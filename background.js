chrome.contextMenus.create({
  id: "copy-selector",
  title: "Copiar selector",
  contexts: ["all"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copy-selector") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.__RPA_PICKER__?.copySelectorFromContextMenu()
    });
  }
});
