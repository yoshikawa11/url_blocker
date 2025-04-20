"use strict";
function parseTime(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
}
function isWithinAnyTimeRange(timeRanges) {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    return timeRanges.some(range => {
        const start = parseTime(range.startTime);
        const end = parseTime(range.endTime);
        return current >= start && current <= end;
    });
}
function updateBlockRules(domains, timeRanges) {
    const RULE_ID_OFFSET = 1000;
    const rules = domains.map((domain, i) => ({
        id: RULE_ID_OFFSET + i,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: domain,
            resourceTypes: ["main_frame"]
        }
    }));
    const ruleIds = rules.map(rule => rule.id);
    if (isWithinAnyTimeRange(timeRanges)) {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ruleIds,
            addRules: rules
        });
    }
    else {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ruleIds
        });
    }
}
function syncRulesFromStorage() {
    chrome.storage.local.get(["blockedUrls", "blockTimeRanges"], (res) => {
        const urls = res.blockedUrls || [];
        const timeRanges = res.blockTimeRanges || [];
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
