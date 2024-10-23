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
    modal.style.width = '400px';
    modal.style.backgroundColor = '#fff';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    modal.style.padding = '20px';
    modal.style.zIndex = '10001';

    // Modal content (input and button)
    modal.innerHTML = `
        <h3>Chat with ChatGPT</h3>
        <textarea id="chatgpt-input" rows="4" style="width: 100%;"></textarea>
        <button id="chatgpt-submit" style="margin-top: 10px; padding: 8px 16px;">Ask ChatGPT</button>
        <div id="chatgpt-response" style="margin-top: 20px;"></div>
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

function submitChatGPTQuery() {
    const query = document.getElementById('chatgpt-input').value;
    const responseContainer = document.getElementById('chatgpt-response');

    // Make a request to ChatGPT API (replace YOUR_API_KEY with your actual key)
    fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer YOUR_API_KEY`  // Add your OpenAI API key here
        },
        body: JSON.stringify({
            prompt: query,
            max_tokens: 150
        })
    })
        .then(response => response.json())
        .then(data => {
            // Display the response from ChatGPT in the modal
            responseContainer.textContent = data.choices[0].text;
        })
        .catch(error => {
            responseContainer.textContent = 'Error fetching response from ChatGPT.';
            console.error('Error:', error);
        });
}
