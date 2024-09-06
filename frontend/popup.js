document.addEventListener("DOMContentLoaded", () => {
  const originalTextArea = document.getElementById("originalText");
  const summaryArea = document.getElementById("summary");
  const summarizeButton = document.getElementById("summarize");
  const clearButton = document.getElementById("clear");

  clearButton.addEventListener("click", function () {
    originalText.value = "";
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getPageText" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Could not establish connection:",
              chrome.runtime.lastError.message
            );
            originalTextArea.value =
              "Failed to get text from page. Ensure content script is loaded.";
          } else if (response && response.text) {
            originalTextArea.value = response.text;
          } else {
            console.error("No response received");
            originalTextArea.value = "No text found on the page.";
          }
        }
      );
    } else {
      console.error("No active tabs found");
      originalTextArea.value = "Unable to access the current tab.";
    }
  });

  summarizeButton.addEventListener("click", () => {
    const text = originalTextArea.value.trim();
    const MAX_LENGTH = 10000; // Adjust as needed

    if (!text) {
      alert("Please enter some text to summarize");
      return;
    }

    if (text.length > MAX_LENGTH) {
      alert(`Text is too long. Please limit to ${MAX_LENGTH} characters.`);
      return;
    }

    summarizeButton.disabled = true;
    summaryArea.value = "Summarizing...";

    chrome.runtime.sendMessage(
      {
        action: "summarize",
        text: text,
      },
      (response) => {
        summarizeButton.disabled = false;
        if (response && response.summary) {
          summaryArea.value = response.summary;
        } else if (response && response.error) {
          summaryArea.value = `Error: ${response.error}`;
          console.error("Summarization error:", response.error);
        } else {
          summaryArea.value = "An unexpected error occurred. Please try again.";
          console.error("Unexpected response:", response);
        }
      }
    );
  });
});
