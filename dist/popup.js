"use strict";
(() => {
  // popup.ts
  var input = document.getElementById("url-input");
  var button = document.getElementById("add-button");
  var list = document.getElementById("url-list");
  async function getBlockedUrls() {
    const result = await chrome.storage.local.get("blockedUrls");
    return result.blockedUrls || [];
  }
  function renderList(domains) {
    list.innerHTML = "";
    domains.forEach((domain) => {
      const li = document.createElement("li");
      li.textContent = domain;
      list.appendChild(li);
    });
  }
  button.onclick = async () => {
    const newUrl = input.value.trim();
    if (!newUrl) return;
    const urls = await getBlockedUrls();
    if (!urls.includes(newUrl)) {
      const updated = [...urls, newUrl];
      await chrome.storage.local.set({ blockedUrls: updated });
      renderList(updated);
    }
    input.value = "";
  };
  getBlockedUrls().then(renderList);
})();
