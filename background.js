let watchTime = 0;
let focusTabId = null;
let isTracking = false;  // Tracks whether YouTube is currently being watched

// Track YouTube tab when a new tab is activated or updated
function checkYouTubeTabs() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;

        let activeTab = tabs[0];

        if (activeTab.url && activeTab.url.includes("youtube.com/watch")) {
            // If switching back to YouTube, resume tracking
            if (!isTracking) {
                console.log("Switched back to YouTube, resuming watch time tracking.");
                isTracking = true;
                chrome.alarms.create("trackWatchTime", { periodInMinutes: 5 });
            }

            focusTabId = activeTab.id;
        } else {
            // If switching away from YouTube, pause tracking
            if (isTracking) {
                console.log("Switched away from YouTube, pausing tracking.");
                isTracking = false;
                chrome.alarms.clear("trackWatchTime");
            }
        }
    });
}

// When an alarm triggers, increase watch time and show a notification
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "trackWatchTime" && isTracking) {
        watchTime += 5;
        console.log(`You have watched YouTube for ${watchTime} minutes.`);

        // Send a notification every 5 minutes
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Focus Timer Update",
            message: `You've successfully watched YouTube for ${watchTime} minutes!`
        });

        // Continue checking YouTube tab status
        checkYouTubeTabs();
    }
});

// Detect when the user switches tabs
chrome.tabs.onActivated.addListener(() => {
    checkYouTubeTabs();
});

// Detect when a tab is updated (e.g., switching videos)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        checkYouTubeTabs();
    }
});

// Detect when a YouTube tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === focusTabId) {
        console.log("YouTube tab closed, resetting timer.");
        chrome.alarms.clear("trackWatchTime");
        watchTime = 0;
        isTracking = false;
    }
});

// Initialize tracking when the extension is loaded
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed, checking YouTube tabs.");
    checkYouTubeTabs();
});
