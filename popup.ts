document.addEventListener("DOMContentLoaded", () => {
  const urlForm = document.getElementById("url-form") as HTMLFormElement;
  const urlInput = document.getElementById("url-input") as HTMLInputElement;
  const urlList = document.getElementById("url-list") as HTMLUListElement;

  const timeForm = document.getElementById("time-form") as HTMLFormElement;
  const startTimeInput = document.getElementById("start-time") as HTMLInputElement;
  const endTimeInput = document.getElementById("end-time") as HTMLInputElement;
  const timeList = document.getElementById("time-list") as HTMLUListElement;

  const blockToggle = document.getElementById("block-toggle") as HTMLInputElement;

  // 初期状態を取得してトグルに反映
  chrome.storage.local.get("isBlocked", (res) => {
    blockToggle.checked = res.isBlocked ?? false;
  });

  // トグルの変更を監視して状態を保存
  blockToggle.addEventListener("change", () => {
    const isBlocked = blockToggle.checked;
    chrome.storage.local.set({ isBlocked }, () => {
      console.log(`ブロック状態が ${isBlocked ? "有効" : "無効"} に設定されました`);
      chrome.storage.local.get("isBlocked", (res) => {
        console.log("現在のストレージ状態:", res.isBlocked);
      });
    });
  });

function renderUrlList(urls: string[]) {
    urlList.innerHTML = "";
    urls.forEach((url, index) => {
      const li = document.createElement("li");
      li.textContent = url;
      const del = document.createElement("button");
      del.textContent = "削除";
      del.onclick = () => {
        const newUrls = urls.filter((_, i) => i !== index);
        chrome.storage.local.set({ blockedUrls: newUrls });
        renderUrlList(newUrls);
      };
      li.appendChild(del);
      urlList.appendChild(li);
    });
  }

  function renderTimeList(times: { startTime: string; endTime: string }[]) {
    timeList.innerHTML = "";
    times.forEach((t, index) => {
      const li = document.createElement("li");
      li.textContent = `${t.startTime} - ${t.endTime}`;
      const del = document.createElement("button");
      del.textContent = "削除";
      del.onclick = () => {
        const newTimes = times.filter((_, i) => i !== index);
        chrome.storage.local.set({ blockTimeRanges: newTimes });
        renderTimeList(newTimes);
      };
      li.appendChild(del);
      timeList.appendChild(li);
    });
  }

  chrome.storage.local.get(["blockedUrls", "blockTimeRanges"], (res) => {
    renderUrlList(res.blockedUrls || []);
    renderTimeList(res.blockTimeRanges || []);
  });

  urlForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    chrome.storage.local.get("blockedUrls", (res) => {
      const urls = res.blockedUrls || [];
      urls.push(url);
      chrome.storage.local.set({ blockedUrls: urls }, () => {
        renderUrlList(urls);
        urlInput.value = "";
      });
    });
  });

  timeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const start = startTimeInput.value;
    const end = endTimeInput.value;
    if (!start || !end) return;

    chrome.storage.local.get("blockTimeRanges", (res) => {
      const ranges = res.blockTimeRanges || [];
      ranges.push({ startTime: start, endTime: end });
      chrome.storage.local.set({ blockTimeRanges: ranges }, () => {
        renderTimeList(ranges);
        startTimeInput.value = "";
        endTimeInput.value = "";
      });
    });
  });
});
