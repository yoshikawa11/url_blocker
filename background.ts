/// <reference types="chrome" />

let blockedUrls: string[] = [];

// 初期読み込み
chrome.storage.local.get("blockedUrls").then((result) => {
  blockedUrls = result.blockedUrls || [];
});

// 変更を監視してキャッシュ更新
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.blockedUrls) {
    blockedUrls = changes.blockedUrls.newValue || [];
  }
});

// 同期的なリクエストフィルター
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    if (blockedUrls.some((domain) => url.includes(domain))) {
      return { cancel: true };
    }
    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
  