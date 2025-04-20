"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const urlForm = document.getElementById("url-form");
    const urlInput = document.getElementById("url-input");
    const urlList = document.getElementById("url-list");
    const timeForm = document.getElementById("time-form");
    const startTimeInput = document.getElementById("start-time");
    const endTimeInput = document.getElementById("end-time");
    const timeList = document.getElementById("time-list");
    function renderUrlList(urls) {
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
    function renderTimeList(times) {
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
        if (!url)
            return;
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
        if (!start || !end)
            return;
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
