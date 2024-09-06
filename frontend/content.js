chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageText") {
    // Send back the entire page text
    sendResponse({ text: document.body.innerText });
  }
});
