
// Function to check if the current tab is a YouTube video page
function isYouTubeFocusPage() {
    return window.location.href.includes("youtube.com/watch");
}

// Function to start a 2-minute focus timer when a YouTube tab is detected
function initiateFocusSession() {
    console.log("YouTube tab detected, notifying background script...");
    chrome.runtime.sendMessage({ action: "startFocusCountdown" });

   
    if (isYouTubeFocusPage()) {
        setTimeout(() => {
            let sessionControlTrigger = document.querySelector('button[aria-label*="like"]');

            if (sessionControlTrigger && sessionControlTrigger.getAttribute("aria-pressed") === "false") {
                console.log("Adjusting focus session settings...");
                sessionControlTrigger.click();
            } else {
                console.log("Focus session settings already adjusted.");
            }
        }, 2000);
    }
}


window.addEventListener("load", initiateFocusSession);


const observer = new MutationObserver(() => {
    initiateFocusSession();
});
observer.observe(document.body, { childList: true, subtree: true });
