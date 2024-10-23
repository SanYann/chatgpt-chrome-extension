// Inject additional CSS for new elements
function injectAdditionalCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .edit-toggle {
            margin-top: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
        }

        .bulk-checkbox {
            display: none; /* Hide by default, shown only in edit mode */
        }

        .red-trash {
            display: none; /* Hide by default, shown when checkboxes are checked */
            color: red;
            cursor: pointer;
        }

        .modal {
            display: none; /* Hidden by default */
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            background: white;
            border: 1px solid black;
            padding: 20px;
            text-align: center;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }

        .modal .buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
        }

        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }
    `;
    document.head.appendChild(style);
}

// Toggle edit mode and add checkbox behavior
function toggleEditMode() {
    const isEditMode = JSON.parse(localStorage.getItem('editMode')) || false;
    const newEditMode = !isEditMode;
    localStorage.setItem('editMode', newEditMode);
    document.querySelectorAll('.bulk-checkbox').forEach(cb => {
        cb.style.display = newEditMode ? 'block' : 'none';
    });
    document.querySelectorAll('.favorite-star').forEach(star => {
        star.style.display = newEditMode ? 'none' : 'block';
    });

    // Update red-trash icon visibility based on mode
    const trashIcon = document.querySelector('.red-trash');
    if (trashIcon) {
        trashIcon.style.display = newEditMode ? 'block' : 'none';
    }
}

// Function to add the toggle switch for Edit Mode
function addEditModeToggle() {
    const exploreSection = document.querySelector('.explore-gpts'); // Adjust this selector to the correct position under "Explore GPTs"
    if (exploreSection) {
        const toggleWrapper = document.createElement('div');
        toggleWrapper.className = 'edit-toggle';

        const label = document.createElement('label');
        label.innerText = 'Edit Mode';

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.addEventListener('change', () => {
            toggleEditMode();
        });

        toggleWrapper.appendChild(toggle);
        toggleWrapper.appendChild(label);
        exploreSection.appendChild(toggleWrapper);
    }
}

// Function to handle displaying the trash icon and showing modal
function handleTrashIcon() {
    const selected = document.querySelectorAll('.bulk-checkbox:checked');
    const trashIcon = document.querySelector('.red-trash');
    if (selected.length > 0) {
        trashIcon.style.display = 'block';
    } else {
        trashIcon.style.display = 'none';
    }
}

// Function to add checkboxes or stars depending on Edit Mode
function addCheckboxesAndStars() {
    const isEditMode = JSON.parse(localStorage.getItem('editMode')) || false;
    const historyItems = document.querySelectorAll('li');

    historyItems.forEach((item) => {
        const textLink = item.querySelector('a');
        if (textLink) {
            const href = textLink.getAttribute('href');
            const draggableDiv = item.querySelector('.no-draggable');
            if (draggableDiv) {
                draggableDiv.style.display = 'flex';

                let flexContainer = draggableDiv.querySelector('.flex-container');
                if (!flexContainer) {
                    flexContainer = document.createElement('div');
                    flexContainer.className = 'flex-container';
                    flexContainer.style.display = 'flex';
                    flexContainer.style.alignItems = 'center';
                    flexContainer.style.gap = '10px';
                    draggableDiv.insertBefore(flexContainer, draggableDiv.firstChild);
                }

                if (isEditMode) {
                    if (!flexContainer.querySelector('.bulk-checkbox')) {
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'bulk-checkbox';
                        checkbox.style.display = 'block';
                        checkbox.addEventListener('change', handleTrashIcon);
                        flexContainer.appendChild(checkbox);
                    }
                } else {
                    if (!flexContainer.querySelector('.favorite-star')) {
                        const star = document.createElement('span');
                        star.className = 'favorite-star';
                        star.style.cursor = 'pointer';
                        star.innerHTML = isFavorite(href) ? '⭐' : '☆';
                        star.title = isFavorite(href) ? 'Remove from favorites' : 'Add to favorites';

                        star.addEventListener('click', () => toggleFavorite(href, star, item));
                        flexContainer.appendChild(star);
                    }
                }
            }
        }
    });
}

// Modal creation and event listeners for Archive/Delete actions
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <p>Are you sure you want to archive or delete the selected items?</p>
        <div class="buttons">
            <button id="archive-btn">Archive</button>
            <button id="delete-btn">Delete</button>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Show modal
    const trashIcon = document.querySelector('.red-trash');
    if (trashIcon) {
        trashIcon.addEventListener('click', () => {
            modal.style.display = 'block';
            overlay.style.display = 'block';
        });
    }

    // Hide modal
    overlay.addEventListener('click', () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });

    // Event listeners for Archive and Delete
    document.getElementById('archive-btn').addEventListener('click', () => {
        // Handle archive action
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });

    document.getElementById('delete-btn').addEventListener('click', () => {
        // Handle delete action
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });
}

// Wait for sidebar and initialize the edit mode and components
function waitForSidebar() {
    const observer = new MutationObserver(() => {
        const sidebar = document.querySelector('.explore-gpts');
        if (sidebar) {
            addEditModeToggle();
            addCheckboxesAndStars();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', () => {
    injectAdditionalCSS();
    waitForSidebar();
    createModal();
});
