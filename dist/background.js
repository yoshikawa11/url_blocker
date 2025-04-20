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
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: Array.from({ length: 1000 }, (_, i) => i + 1000), // 既存のルールを削除
        addRules: rules
    });
}
function syncRulesFromStorage() {
    chrome.storage.local.get(["blockedUrls", "blockTimeRanges", "isBlocked"], (res) => {
        const urls = res.blockedUrls || [];
        const timeRanges = res.blockTimeRanges || [];
        const isBlocked = res.isBlocked ?? false;
        if (isBlocked) {
            console.log("Blocking enabled. Updating rules...");
            updateBlockRules(urls, timeRanges);
        }
        else {
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
