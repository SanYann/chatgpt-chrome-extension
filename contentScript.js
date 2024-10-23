function injectCustomCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .text-content, .favorite-star {
            transition-delay: 0s; /* Remove any delay */
            transition: opacity 0.1s ease-in-out; /* Adjust appearance speed */
        }
        .favorite-star {
            cursor: pointer;
            font-size: 18px;
        }

        .bulk-checkbox {
            margin-left: 10px;
        }

        .sidebar-section h3 {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        li {
            list-style-type: none;
        }
             .switch {
        position: relative;
        display: inline-block;
        width: 34px;
        height: 20px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 34px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 12px;
        width: 12px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #2196F3; /* Adjust toggle color */
    }

    input:checked + .slider:before {
        transform: translateX(14px);
    }
    `;
    document.head.appendChild(style);
}

function waitForSidebar(callback) {
    const observer = new MutationObserver((mutations, obs) => {
        const sidebar = document.querySelector('.flex.flex-col.gap-2.pb-2.text-token-text-primary.text-sm.false.mt-5');
        if (sidebar) {
            obs.disconnect();
            injectCustomCSS();
            callback(sidebar);
        }
    });


    observer.observe(document.body, { childList: true, subtree: true });
}

function populateFavoritesOnLoad() {
    let favorites = JSON.parse(localStorage.getItem('favoritePrompts')) || [];
    let validFavorites = [];

    favorites.forEach(href => {
        const link = document.querySelector(`a[href="${href}"]`);
        if (link) {
            const item = link.closest('li');
            if (item) {
                moveItemToFavorites(item);
                validFavorites.push(href);
            }
        } else {
            console.warn(`No matching link found for href: ${href}, clearing from storage.`);
        }
    });

    localStorage.setItem('favoritePrompts', JSON.stringify(validFavorites));
}

function toggleEditMode(isEditMode) {
    const elements = document.querySelectorAll(
        "li.relative[data-testid^='history-item-'] .no-draggable.group.relative.rounded-lg"
    );

    elements.forEach((element) => {
        // Locate the `flex-container` where the star is placed
        const flexContainer = element.querySelector(".flex-container");
        const star = flexContainer ? flexContainer.querySelector(".favorite-star") : null;
        let checkbox = flexContainer ? flexContainer.querySelector(".icon-checkbox") : null;

        if (isEditMode) {
            // If edit mode is enabled and no checkbox is present, create and add it
            if (!checkbox) {
                checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.classList.add("icon-checkbox");
                checkbox.style.cursor = 'pointer';
                checkbox.style.marginLeft = '10px';

                // Insert the checkbox into the flex container
                if (star) {
                    flexContainer.insertBefore(checkbox, star); // Insert checkbox before the star
                    star.style.display = 'none'; // Hide the star
                } else {
                    flexContainer.appendChild(checkbox); // Otherwise, append the checkbox
                }
            }
        } else {
            // If edit mode is disabled, remove the checkbox and show the star
            if (checkbox) {
                checkbox.remove(); // Remove the checkbox
            }

            if (star) {
                star.style.display = 'inline'; // Show the star
            }
        }
    });
}



function initializeFavoritesSection(sidebar) {
    let favoritesSection = document.querySelector('#favorites-section');
    if (!favoritesSection) {
        const favoritesWrapper = document.createElement('div');
        favoritesWrapper.className = 'relative mt-5 first:mt-0 last:mb-5';

        const stickyHeader = document.createElement('div');
        stickyHeader.className = 'sticky bg-token-sidebar-surface-primary top-0 z-20';

        const headerSpan = document.createElement('span');
        headerSpan.className = 'flex h-9 items-center justify-between'; // Adjusted for toggle alignment

        // Add the toggle switch
        const toggleContainer = document.createElement('label');
        toggleContainer.className = 'switch';
        toggleContainer.style.cursor = 'pointer';

        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = false; // Default to non-edit mode
        toggleInput.addEventListener('change', (e) => toggleEditMode(e.target.checked));

        const toggleSlider = document.createElement('span');
        toggleSlider.className = 'slider round';

        toggleContainer.appendChild(toggleInput);
        toggleContainer.appendChild(toggleSlider);

        const favoritesHeader = document.createElement('h3');
        favoritesHeader.className = 'px-2 text-xs font-semibold text-ellipsis overflow-hidden break-all pt-3 pb-2 text-token-text-primary';
        favoritesHeader.innerText = 'Favorites';

        headerSpan.appendChild(favoritesHeader);
        headerSpan.appendChild(toggleContainer); // Attach toggle to header
        stickyHeader.appendChild(headerSpan);
        favoritesWrapper.appendChild(stickyHeader);

        favoritesSection = document.createElement('ul');
        favoritesSection.id = 'favorites-section';
        favoritesSection.className = 'sidebar-section';
        favoritesWrapper.appendChild(favoritesSection);

        sidebar.prepend(favoritesWrapper);
        populateFavoritesOnLoad();
    }
}


function addCheckboxesAndStars() {
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


                if (!flexContainer.querySelector('.favorite-star')) {
                    const star = document.createElement('span');
                    star.className = 'favorite-star';
                    star.style.cursor = 'pointer';
                    star.innerHTML = isFavorite(href) ? '⭐' : '☆';
                    star.title = isFavorite(href) ? 'Remove from favorites' : 'Add to favorites';

                    star.addEventListener('click', () => toggleFavorite(href, star, item));
                    flexContainer.appendChild(star);
                }

                /* TODO
                                if (!flexContainer.querySelector('.bulk-checkbox')) {
                                    const checkbox = document.createElement('input');
                                    checkbox.type = 'checkbox';
                                    checkbox.className = 'bulk-checkbox';
                                    flexContainer.appendChild(checkbox);
                                }
                */

                const textDiv = textLink.querySelector('div.relative');
                const maxTextWidth = '200px';
                if (textDiv) {
                    textDiv.classList.add('text-content');
                    textDiv.style.maxWidth = maxTextWidth;
                    textDiv.style.minWidth = maxTextWidth;
                    textDiv.style.overflow = 'hidden';
                    textDiv.style.whiteSpace = 'nowrap';
                    textDiv.style.textOverflow = 'ellipsis';
                    textDiv.title = textDiv.textContent;
                }
                textLink.style.maxWidth = maxTextWidth;
                textLink.style.minWidth = maxTextWidth;
                textLink.style.overflow = 'hidden';
                textLink.style.textOverflow = 'ellipsis';
                textLink.title = textDiv.textContent;
            }
        }
    });
}


function isFavorite(promptId) {
    const favorites = JSON.parse(localStorage.getItem('favoritePrompts')) || [];
    return favorites.includes(promptId);
}


function toggleFavorite(promptId, starElement, itemElement) {
    let favorites = JSON.parse(localStorage.getItem('favoritePrompts')) || [];

    if (favorites.includes(promptId)) {

        favorites = favorites.filter(id => id !== promptId);
        starElement.innerHTML = '☆';
        starElement.title = 'Add to favorites';
        moveItemOutOfFavorites(itemElement);

    } else {

        favorites.push(promptId);
        starElement.innerHTML = '⭐';
        starElement.title = 'Remove from favorites';
        moveItemToFavorites(itemElement);
    }


    localStorage.setItem('favoritePrompts', JSON.stringify(favorites));
}


function moveItemToFavorites(itemElement) {
    const favoritesSection = document.querySelector('#favorites-section');
    if (favoritesSection && !favoritesSection.contains(itemElement)) {
        favoritesSection.appendChild(itemElement);
    }
}

function moveItemOutOfFavorites(itemElement) {
    const originalSection = document.querySelector('ol');
    if (originalSection && !originalSection.contains(itemElement)) {
        originalSection.appendChild(itemElement);
    }
}


waitForSidebar((sidebar) => {
    initializeFavoritesSection(sidebar);
    addCheckboxesAndStars();

    const observer = new MutationObserver(addCheckboxesAndStars);
    observer.observe(document.body, { childList: true, subtree: true });
});
