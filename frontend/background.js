chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);

  if (request.action === "summarize") {
    console.log("Sending fetch request to backend proxy server...");

    fetch("http://127.0.0.1:8080/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: request.text,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        if (data.summary) {
          sendResponse({ summary: data.summary });
        } else {
          sendResponse({ error: "No summary found in the response" });
        }
      })
      .catch((error) => {
        console.error("Error details:", error);
        if (error.message.includes("Failed to fetch")) {
          sendResponse({
            error: "Failed to connect to the server. Is it running?",
          });
        } else {
          sendResponse({ error: `Failed to fetch summary: ${error.message}` });
        }
      });

    return true; // Keeps the message channel open for asynchronous response
  }
});
