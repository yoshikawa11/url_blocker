/// <reference types="chrome" />

const input = document.getElementById("url-input") as HTMLInputElement;
const button = document.getElementById("add-button") as HTMLButtonElement;
const list = document.getElementById("url-list") as HTMLUListElement;

async function getBlockedUrls(): Promise<string[]> {
  const result = await chrome.storage.local.get("blockedUrls");
  return result.blockedUrls || [];
}

function renderList(domains: string[]) {
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
