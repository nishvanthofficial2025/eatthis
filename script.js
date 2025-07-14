document.addEventListener('DOMContentLoaded', () => {

    // --- N8N WEBHOOK URLS ---
    const N8N_MEAL_ANALYSIS_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook/8e38a1d9-a5f8-43a0-bb33-0c408787124f';
    // NEW: Add a separate webhook URL for user registration
    const N8N_REGISTER_USER_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook/3d613183-9c5b-4135-a80d-78c12ca29759'; // <-- IMPORTANT: REPLACE THIS

    // --- DOM ELEMENT REFERENCES ---
    // Meal Analysis Form
    const mealForm = document.getElementById('meal-form');
    const mealNameInput = document.getElementById('meal-name');
    const userNameInput = document.getElementById('user-name');
    const resultContent = document.getElementById('result-content');
    const suggestionCards = document.querySelectorAll('.suggestion-card');

    // NEW: User Registration Modal
    const registerUserBtn = document.getElementById('register-user-btn');
    const registerModalOverlay = document.getElementById('register-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const newUserForm = document.getElementById('new-user-form');
    const registerStatus = document.getElementById('register-status');

    // --- EVENT LISTENERS ---

    // 1. Open and Close the Registration Modal
    registerUserBtn.addEventListener('click', () => {
        registerModalOverlay.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
        registerModalOverlay.style.display = 'none';
    });

    registerModalOverlay.addEventListener('click', (event) => {
        // Close modal if user clicks on the dark overlay background
        if (event.target === registerModalOverlay) {
            registerModalOverlay.style.display = 'none';
        }
    });

    // 2. Handle New User Registration Form Submission
    newUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get data from the modal form
        const data = {
            name: document.getElementById('new-user-name').value,
            age: parseInt(document.getElementById('new-user-age').value),
            gender: document.getElementById('new-user-gender').value,
            height: parseFloat(document.getElementById('new-user-height').value),
            weight: parseFloat(document.getElementById('new-user-weight').value),
            activityLevel: parseFloat(document.getElementById('new-user-activity').value)
        };

        // Send data to the new registration webhook
        registerStatus.textContent = 'Registering...';
        registerStatus.className = 'status-message';

        try {
            const response = await fetch(N8N_REGISTER_USER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            registerStatus.textContent = 'Registration Successful!';
            registerStatus.className = 'status-message success';

            // Close modal after a short delay
            setTimeout(() => {
                registerModalOverlay.style.display = 'none';
                newUserForm.reset();
                registerStatus.textContent = '';
            }, 2000);

        } catch (error) {
            console.error('Registration Error:', error);
            registerStatus.textContent = 'Registration Failed. Please try again.';
            registerStatus.className = 'status-message error';
        }
    });

    // 3. Handle Meal Analysis Form Submission (Existing Logic)
    mealForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const mealName = mealNameInput.value.trim();
        const userName = userNameInput.value.trim();
        if (!mealName || !userName) {
            displayError('Please fill in both meal and user name.');
            return;
        }
        await sendMealDataToN8n({ mealName, userName });
    });

    // 4. Handle Clicks on Suggestion Cards (Existing Logic)
    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            mealNameInput.value = card.textContent.trim();
            mealNameInput.focus();
        });
    });

    // --- ASYNC FUNCTION FOR MEAL ANALYSIS ---
    async function sendMealDataToN8n(data) {
        showLoadingState();
        try {
            const response = await fetch(N8N_MEAL_ANALYSIS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(data),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            const htmlResult = await response.text();
            displayResult(htmlResult);

        } catch (error) {
            console.error('Error sending meal data to n8n:', error);
            displayError('Could not get result. Please try again later.');
        }
    }

    // --- UI UPDATE FUNCTIONS ---
    function showLoadingState() {
        resultContent.innerHTML = `<p class="loading">Analyzing your meal...</p>`;
    }

    function displayError(message) {
        resultContent.innerHTML = `<p class="error">${message}</p>`;
    }

    function displayResult(htmlString) {
        resultContent.innerHTML = '';
        if (htmlString) {
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '850px';
            iframe.style.border = 'none';
            iframe.srcdoc = htmlString;
            resultContent.appendChild(iframe);
        } else {
            displayError('Received an empty response from the server.');
        }
    }
});