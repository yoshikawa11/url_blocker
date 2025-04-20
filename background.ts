function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function isWithinAnyTimeRange(timeRanges: { startTime: string; endTime: string }[]): boolean {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  return timeRanges.some(range => {
    const start = parseTime(range.startTime);
    const end = parseTime(range.endTime);
    return current >= start && current <= end;
  });
}

function updateBlockRules(domains: string[], timeRanges: { startTime: string; endTime: string }[]) {
  const RULE_ID_OFFSET = 1000;
  const rules: chrome.declarativeNetRequest.Rule[] = domains.map((domain, i) => ({
    id: RULE_ID_OFFSET + i,
    priority: 1,
    action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
    condition: {
      urlFilter: domain,
      resourceTypes: ["main_frame"] as chrome.declarativeNetRequest.ResourceType[]
    }
  }));

  const ruleIds = rules.map(rule => rule.id);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: Array.from({ length: 1000 }, (_, i) => i + 1000), // 既存のルールを削除
    addRules: rules
  });
}

function syncRulesFromStorage() {
  chrome.storage.local.get(["blockedUrls", "blockTimeRanges", "isBlocked"], (res) => {
    const urls: string[] = res.blockedUrls || [];
    const timeRanges: { startTime: string; endTime: string }[] = res.blockTimeRanges || [];
    const isBlocked: boolean = res.isBlocked ?? false;

    if (isBlocked) {
      console.log("Blocking enabled. Updating rules...");
      updateBlockRules(urls, timeRanges);
    } else {
      console.log("Blocking disabled. Removing all rules...");
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: Array.from({ length: 1000 }, (_, i) => i + 1000) // ルールIDを削除
      });
    }
  });
}
chrome.runtime.onInstalled.addListener(syncRulesFromStorage);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.blockedUrls || changes.blockTimeRanges)) {
    syncRulesFromStorage();
  }
});

setInterval(syncRulesFromStorage, 1 * 1000);