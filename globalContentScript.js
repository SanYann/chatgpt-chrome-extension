(function injectChip() {
    // Check if the chip is already injected to avoid duplicates
    if (document.querySelector('#chatgpt-chip')) return;

    // Create the chip
    const chip = document.createElement('div');
    chip.id = 'chatgpt-chip';
    chip.style.position = 'fixed';
    chip.style.bottom = '20px';
    chip.style.right = '20px';
    chip.style.zIndex = '10000';
    chip.style.backgroundColor = '#007bff';
    chip.style.color = '#fff';
    chip.style.padding = '10px';
    chip.style.borderRadius = '50%';
    chip.style.cursor = 'grab';
    chip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    chip.textContent = '🤖';

    // Append the chip to the body
    document.body.appendChild(chip);

    // Make the chip draggable and handle click separately
    makeChipDraggableAndClickable(chip);
})();

function formatOpenAIResponse(response) {
    return response
        .replace(/(?:\r\n|\r|\n)/g, '\n')               // Normalize line breaks
        .replace(/\*\*(.*?)\*\*/g, '[$1]')             // Replace **bold** with [bold] for readability
        .replace(/^- (.*?)(?=\n|$)/gm, '- $1')         // Keep bullet points
        .replace(/# (.*?)(?=\n|$)/g, '\n\n$1\n\n')     // Convert "# Heading" to a blank line before and after
        .replace(/## (.*?)(?=\n|$)/g, '\n$1\n');       // Convert "## Subheading" to a single blank line before
}

function simulateTypingEffect(text, responseTextElement, responseContainer) {
    let index = 0;
    responseTextElement.textContent = "";

    function typeCharacter() {
        if (index < text.length) {
            responseTextElement.textContent += text[index];
            index++;
            responseContainer.scrollTop = responseContainer.scrollHeight;

            setTimeout(typeCharacter, 10);
        }
    }

    typeCharacter();
}

function makeChipDraggableAndClickable(chip) {
    let isDragging = false;
    let startX, startY;

    chip.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
        isDragging = false;
        chip.style.cursor = 'grabbing';
        document.addEventListener('mousemove', moveChip);
    });

    chip.addEventListener('mouseup', (e) => {
        document.removeEventListener('mousemove', moveChip);
        chip.style.cursor = 'grab';

        // Calculate the distance the mouse has moved
        const deltaX = Math.abs(e.clientX - startX);
        const deltaY = Math.abs(e.clientY - startY);

        // Open the modal only if it wasn't dragged significantly (e.g., within 5px threshold)
        if (deltaX < 5 && deltaY < 5) {
            e.stopPropagation();  // Stop the click event from bubbling up to the document-level listener
            openChatGPTModal();
        }
    });

    function moveChip(e) {
        isDragging = true;
        chip.style.left = `${e.clientX - chip.offsetWidth / 2}px`;
        chip.style.top = `${e.clientY - chip.offsetHeight / 2}px`;
        chip.style.bottom = 'auto'; // Disable bottom to allow dragging vertically
        chip.style.right = 'auto';  // Disable right to allow dragging horizontally
    }
}

function openChatGPTModal() {
    // Check if the modal already exists
    if (document.querySelector('#chatgpt-modal')) return;

    // Create the modal container
    const modal = document.createElement('div');
    modal.id = 'chatgpt-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.width = '600px';
    modal.style.backgroundColor = '#fff';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    modal.style.padding = '20px';
    modal.style.zIndex = '10001';

    // Modal content (input and button)
    modal.innerHTML = `
         <h3 style="margin: 0 0 15px; font-size: 18px; text-align: center; color: #333;">Chat with ChatGPT</h3>
        <textarea id="chatgpt-input" rows="4" placeholder="Write your prompt here..." style="width: 100%;"></textarea>
        <button id="chatgpt-submit" style="margin-top: 10px; padding: 8px 16px;">Ask ChatGPT</button>
        <div id="chatgpt-response" style="margin-top: 20px; background: #f9f9f9; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; display: none;">
            <p id="chatgpt-response-text" style="margin: 0;font-size: 14px;color: #333;user-select: text;white-space: pre-wrap;cursor: auto;line-height: 1.5;">Loading...</p>
        </div>
    `;

    // Append the modal to the body
    document.body.appendChild(modal);

    // Stop propagation when clicking inside the modal to prevent it from closing
    modal.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('keydown', closeModalOnEscape);

    // Handle the submission
    document.getElementById('chatgpt-submit').addEventListener('click', submitChatGPTQuery);
}


function closeModalOnEscape(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

function closeModal() {
    const modal = document.getElementById('chatgpt-modal');
    if (modal) {
        modal.remove();
        document.removeEventListener('click', closeModalOnClickOutside);
        document.removeEventListener('keydown', closeModalOnEscape);
    }
}

function extractPageText(element) {
    if (!element) return "";

    // Collect all text nodes in a flat array
    const textNodes = [];

    // Recursive function to traverse DOM
    function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Add text content, trimming extra spaces
            const text = node.textContent.trim();
            if (text) textNodes.push(text);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Handle "visually-hidden" or "aria-hidden" content
            const isHidden = node.getAttribute("aria-hidden") === "true" ||
                node.classList.contains("visually-hidden");

            if (!isHidden) {
                // Recurse into children if the element is not hidden
                node.childNodes.forEach(traverse);
            }
        }
    }

    // Start traversal
    traverse(element);

    // Join all text nodes with line breaks
    return textNodes.join("\n");
}
function extractAndStripText(element) {
    if (!element) return "";

    // Recursively traverse all nodes
    function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Return text nodes as-is
            return node.nodeValue.trim();
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Recurse into child nodes
            return Array.from(node.childNodes).map(traverse).join(" ");
        }
        return "";
    }

    // Start from the root element
    return traverse(element).replace(/\s+/g, " "); // Normalize whitespace
}

function extractAndStripTextExcludingScripts(element) {
    if (!element) return "";

    // Recursive function to traverse nodes
    function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Return text nodes
            return node.nodeValue.trim();
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Exclude specific tags
            const tagName = node.tagName.toLowerCase();
            if (["script", "style", "code"].includes(tagName)) return "";

            // Recurse into child nodes
            return Array.from(node.childNodes).map(traverse).join(" ");
        }
        return "";
    }

    // Start traversal
    return traverse(element).replace(/\s+/g, " "); // Normalize whitespace
}


function stripHTMLTags(htmlString) {
    // Create a temporary DOM element
    const tempDiv = document.createElement("div");

    // Set the HTML content
    tempDiv.innerHTML = htmlString;

    // Use `textContent` to retrieve the plain text
    return tempDiv.textContent || tempDiv.innerText || "";
}

function submitChatGPTQuery() {
    const query = document.getElementById('chatgpt-input').value;
    const responseContainer = document.getElementById('chatgpt-response');
    const responseText = document.getElementById('chatgpt-response-text');
    if (!query) {
        alert('Please enter a valid prompt.')
        return
    }
    // Show the response container with a loading message
    responseContainer.style.display = 'block';
    responseText.textContent = 'Loading...';

    console.log(extractAndStripTextExcludingScripts(document.body))
    chrome.runtime.sendMessage({ type: "extractText", content: extractAndStripTextExcludingScripts(document.body), instruction: query }, (response) => {
        if (response.success) {
            if (response.data.choices && response.data.choices.length > 0) {
                const formattedResponse = formatOpenAIResponse(response.data.choices[0].message.content.trim())
                simulateTypingEffect(formattedResponse, responseText, responseContainer);
            } else {
                responseText.textContent = 'No response received from ChatGPT.';
            }
        } else {
            responseText.textContent = 'Error fetching response from ChatGPT.';
        }
    });
}
