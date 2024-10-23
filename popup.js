document.getElementById("saveButton").addEventListener("click", () => {
    const apiKey = document.getElementById("apiKeyInput").value.trim();
    if (apiKey) {
        chrome.storage.local.set({ openai_api_key: apiKey }, () => {
            alert("API Key saved successfully!");
            window.close(); // Close the popup
        });
    } else {
        alert("Please enter a valid API Key.");
    }
});

document.getElementById("cancelButton").addEventListener("click", () => {
    window.close(); // Close the popup without saving
});
