// ===================================================================
//  CONFIGURATION
// ===================================================================
// Replace these with your actual n8n Production Webhook URLs
const N8N_SAVE_WEBHOOK_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook-test/0c23f8d8-f86a-4853-953c-a721069317e0';
const N8N_SEARCH_WEBHOOK_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook-test/2aac4ace-d26d-48e1-8cb9-59729b961fbb';
// This URL will now be for a POST workflow
const N8N_GET_TAGS_WEBHOOK_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook/e35c9895-aa2f-456b-9824-f0921a2818ca';


// ===================================================================
//  GET HTML ELEMENTS
// ===================================================================
const linkForm = document.getElementById('linkForm');
const responseDiv = document.getElementById('response');
const searchForm = document.getElementById('searchForm');
const searchQueryInput = document.getElementById('searchQuery');
const searchResultsDiv = document.getElementById('searchResults');
const showTagsButton = document.getElementById('show-tags-btn');
const tagContainer = document.getElementById('tag-container');


// ===================================================================
//  FEATURE 1: SAVING A NEW LINK
// ===================================================================
linkForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const url = document.getElementById('url').value;
    const description = document.getElementById('description').value;
    responseDiv.innerHTML = 'Saving...';
    responseDiv.className = '';

    try {
        const response = await fetch(N8N_SAVE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, description, timestamp: new Date().toISOString() })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'An unknown error occurred.');
        responseDiv.innerHTML = result.htmlResponse;
        linkForm.reset();
    } catch (error) {
        responseDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
});


// ===================================================================
//  FEATURE 2: SEARCHING FOR LINKS
// ===================================================================
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = searchQueryInput.value.trim();
    if (!query) {
        searchResultsDiv.innerHTML = '<p>Please enter a search term.</p>';
        return;
    }
    searchResultsDiv.innerHTML = '<p>Searching...</p>';

    try {
        const response = await fetch(N8N_SEARCH_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Search failed.');
        searchResultsDiv.innerHTML = result.htmlResponse;
    } catch (error) {
        searchResultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
});


// ===================================================================
//  FEATURE 3: FETCHING AND DISPLAYING TAGS (NEW METHOD)
// ===================================================================
/**
 * Sends a command to n8n to get pre-built HTML for tags.
 */
async function fetchAndDisplayTags() {
    showTagsButton.textContent = 'Loading Tags...';
    showTagsButton.disabled = true;
    tagContainer.innerHTML = ''; // Clear previous content

    try {
        // Send a POST request with the specific message
        const response = await fetch(N8N_GET_TAGS_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'see tag message' })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Could not fetch tags.');
        }

        // Directly inject the pre-built HTML from n8n
        tagContainer.innerHTML = result.htmlResponse;

        // Show the tags and hide the "See Tags" button
        tagContainer.classList.remove('hidden');
        showTagsButton.style.display = 'none';

    } catch (error) {
        console.error('Error displaying tags:', error);
        showTagsButton.textContent = 'See Tags';
        showTagsButton.disabled = false;
        tagContainer.innerHTML = `<p class="error">Failed to load tags. Please try again.</p>`;
        tagContainer.classList.remove('hidden');
    }
}

// Attach the function to the button's click event
showTagsButton.addEventListener('click', fetchAndDisplayTags);