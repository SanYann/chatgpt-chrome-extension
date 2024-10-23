chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendPatchRequest") {
        // Call the async function to handle the request chain
        handlePatchRequest(message.ids)
            .then(response => sendResponse({ success: true, data: response }))
            .catch(error => sendResponse({ success: false, error }));

        // Return true to keep the message channel open for asynchronous sendResponse
        return true;
    }
    if (message.type === "extractText") {
        chrome.storage.local.get("openai_api_key", (result) => {
            const apiKey = result.openai_api_key;
            if (!apiKey) {
                console.error("No OpenAI API Key found");
                return;
            }

            sendToOpenAI(apiKey, message.content, message.instruction, sendResponse);
        });
        return true;
    }
});

function sendToOpenAI(apiKey, content, instruction, sendResponse) {

    fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini-2024-07-18",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful scrapping tool"
                },
                {
                    role: 'user',
                    content: `${instruction}:\n\n${content?.slice(0, 127000)}`
                }
            ],
            temperature: 0.2,
            n: 1
        })
    })
        .then((response) => response.json())
        .then((data) => {
            sendResponse({ success: true, data })
        })
        .catch((error) => {
            sendResponse({ success: false, error })
        });
}

// Async function to handle the request chain
async function handlePatchRequest(ids) {
    // Step 1: Get cookies
    const cookies = await getCookies('chatgpt.com');
    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    // Step 2: Get access token from local storage
    const { accessToken } = await getLocalStorageValue('accessToken');
    // Step 3: Perform a PATCH request for each ID
    const results = [];
    for (const id of ids) {
        const response = await fetch(`https://chatgpt.com/backend-api/conversation/${id}`, {
            method: 'PATCH',
            headers: {
                'accept': '*/*',
                'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                'authorization': `${accessToken}`,
                'content-type': 'application/json',
                'cookie': cookieString,
                'oai-device-id': 'afc26746-9e56-4bfe-aad2-b39ce40f78ea',
                'oai-language': 'fr-FR',
                'origin': 'https://chatgpt.com',
                'priority': 'u=1, i',
                'referer': `https://chatgpt.com/c/${id}`,
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({ is_visible: false })
        });

        const data = await response.json();
        results.push({ id, data });
    }

    return results; // Return the results for all IDs
}

// Helper function to get cookies as a promise
function getCookies(domain) {
    return new Promise((resolve, reject) => {
        chrome.cookies.getAll({ domain }, (cookies) => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(cookies);
        });
    });
}

// Helper function to get values from local storage as a promise
function getLocalStorageValue(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(result);
        });
    });
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        const authHeader = details.requestHeaders?.find(r => r.name === "Authorization");
        if (authHeader) {
            const accessToken = authHeader.value;
            console.log('Captured Bearer Token:', accessToken);
            chrome.storage.local.set({ accessToken });
        }
    },
    { urls: ["https://chatgpt.com/*"] },
    ["requestHeaders"]
);