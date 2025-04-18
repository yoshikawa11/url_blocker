"use strict";
(() => {
  // background.ts
  var RULE_ID_OFFSET = 1e3;
  async function updateBlockRules(domains) {
    const rules = domains.map((domain, index) => ({
      id: RULE_ID_OFFSET + index,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: domain,
        resourceTypes: ["main_frame"]
      }
    }));
    const existingRuleIds = domains.map((_, i) => RULE_ID_OFFSET + i);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: rules
    });
  }
  chrome.storage.local.get("blockedUrls").then((result) => {
    const urls = result.blockedUrls || [];
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.blockedUrls) {
      updateBlockRules(changes.blockedUrls.newValue || []);
    }
  });
})();
