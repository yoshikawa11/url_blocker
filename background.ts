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

  if (isWithinAnyTimeRange(timeRanges)) {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIds,
      addRules: rules
    });
  } else {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIds
    });
  }
}

function syncRulesFromStorage() {
  chrome.storage.local.get(["blockedUrls", "blockTimeRanges"], (res) => {
    const urls: string[] = res.blockedUrls || [];
    const timeRanges: { startTime: string; endTime: string }[] = res.blockTimeRanges || [];
    updateBlockRules(urls, timeRanges);
  });
}

chrome.runtime.onInstalled.addListener(syncRulesFromStorage);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.blockedUrls || changes.blockTimeRanges)) {
    syncRulesFromStorage();
  }
});

setInterval(syncRulesFromStorage, 60 * 1000);