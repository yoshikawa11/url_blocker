const RULE_ID_OFFSET = 1000; // 固定のID範囲（被らないように）

async function updateBlockRules(domains: string[]) {
  const rules = domains.map((domain, index) => ({
    id: RULE_ID_OFFSET + index,
    priority: 1,
    action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
    condition: {
      urlFilter: domain,
      resourceTypes: ["main_frame"] as chrome.declarativeNetRequest.ResourceType[]
    }
  }));

  // 既存ルールをすべて削除して再登録
  const existingRuleIds = domains.map((_, i) => RULE_ID_OFFSET + i);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: rules
  });
}

// 初期読み込み
chrome.storage.local.get("blockedUrls").then((result) => {
  const urls = result.blockedUrls || [];
});

// 変更監視
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.blockedUrls) {
    updateBlockRules(changes.blockedUrls.newValue || []);
  }
});

  