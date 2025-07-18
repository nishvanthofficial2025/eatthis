document.addEventListener('DOMContentLoaded', () => {

    // --- N8N WEBHOOK URLS ---
    const N8N_MEAL_ANALYSIS_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook-test/8e38a1d9-a5f8-43a0-bb33-0c408787124f';
    const N8N_REGISTER_USER_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook-test/3d613183-9c5b-4135-a80d-78c12ca29759';

    // --- DOM ELEMENT REFERENCES ---
    const mealForm = document.getElementById('meal-form');
    const mealNameInput = document.getElementById('meal-name');
    const userNameInput = document.getElementById('user-name');
    const resultContent = document.getElementById('result-content');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    const placeholderHTML = resultContent.innerHTML; // Store initial placeholder

    // Modal elements
    const registerUserBtn = document.getElementById('register-user-btn');
    const registerModalOverlay = document.getElementById('register-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const newUserForm = document.getElementById('new-user-form');
    const registerStatus = document.getElementById('register-status');

    // --- EVENT LISTENERS (No changes here) ---
    // ... [ The existing event listeners for the modal and form are perfect ] ...
    
    // --- EVENT LISTENERS ---
    registerUserBtn.addEventListener('click', () => { registerModalOverlay.style.display = 'flex'; });
    closeModalBtn.addEventListener('click', () => { registerModalOverlay.style.display = 'none'; });
    registerModalOverlay.addEventListener('click', (e) => { if (e.target === registerModalOverlay) registerModalOverlay.style.display = 'none'; });

    newUserForm.addEventListener('submit', async (event) => {
        event.preventDefault(); /* ... a ... */
        const data = { name: document.getElementById('new-user-name').value, age: parseInt(document.getElementById('new-user-age').value), gender: document.getElementById('new-user-gender').value, height: parseFloat(document.getElementById('new-user-height').value), weight: parseFloat(document.getElementById('new-user-weight').value), activityLevel: parseFloat(document.getElementById('new-user-activity').value) };
        registerStatus.textContent = 'Registering...'; registerStatus.className = 'status-message';
        try { const response = await fetch(N8N_REGISTER_USER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), mode: 'cors' }); if (!response.ok) throw new Error(`Server responded with status: ${response.status}`); registerStatus.textContent = 'Registration Successful!'; registerStatus.className = 'status-message success'; setTimeout(() => { registerModalOverlay.style.display = 'none'; newUserForm.reset(); registerStatus.textContent = ''; }, 2000); } catch (error) { console.error('Registration Error:', error); registerStatus.textContent = 'Registration Failed. Please try again.'; registerStatus.className = 'status-message error'; }
    });

    mealForm.addEventListener('submit', async (event) => {
        event.preventDefault(); /* ... b ... */
        const mealName = mealNameInput.value.trim(); const userName = userNameInput.value.trim();
        if (!mealName || !userName) { displayError('Please fill in both required fields.'); return; }
        await sendMealDataToN8n({ mealName, userName });
    });

    suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => { mealNameInput.value = tag.textContent.trim(); mealNameInput.focus(); });
    });

    // --- ASYNC & UI FUNCTIONS (HEAVILY MODIFIED) ---
    async function sendMealDataToN8n(data) {
        showLoadingState();
        try {
            const response = await fetch(N8N_MEAL_ANALYSIS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify(data),
                mode: 'cors'
            });
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            
            // *** CRITICAL CHANGE: Expect and parse JSON, not text/html ***
            const resultData = await response.json();
            displayResult(resultData);

        } catch (error) {
            console.error('Error processing request:', error);
            displayError('Could not process response. Ensure data is valid JSON.');
        }
    }

    function showLoadingState() {
        resultContent.innerHTML = `<p class="loading">Generating AI analysis...</p>`;
    }

    function displayError(message) {
        resultContent.innerHTML = `<p class="error">${message}</p>`;
        setTimeout(() => { resultContent.innerHTML = placeholderHTML; }, 3000);
    }

    // --- NEW: Function to build the results UI from JSON data ---
    function displayResult(data) {
        resultContent.innerHTML = ''; // Clear previous results
        
        // --- 1. Nutrition Summary (Top Metrics) ---
        const nutritionSummary = data.nutritionSummary;
        let metricGridHTML = `<div class="results-section-title">Nutrition Summary</div><div class="metric-grid">`;
        metricGridHTML += createMetricCard('Total Calories', nutritionSummary.totalCalories, true);
        metricGridHTML += createMetricCard('Total Protein', nutritionSummary.totalProtein);
        metricGridHTML += createMetricCard('Total Carbs', nutritionSummary.totalCarbs);
        metricGridHTML += createMetricCard('Total Fats', nutritionSummary.totalFats);
        metricGridHTML += `</div>`;

        // --- 2. Itemized Ingredients ---
        let itemizedHTML = `<div class="results-section-title">Itemized Ingredients</div><div class="ingredient-list">`;
        itemizedHTML += `<div class="ingredient-header">
                            <div>INGREDIENT</div>
                            <div class="align-right">QUANTITY</div>
                            <div class="align-right">CALORIES</div>
                         </div>`;
        data.itemizedReceipt.forEach(item => {
            itemizedHTML += `<div class="ingredient-row">
                                <div class="ingredient-name">${item.ingredient}</div>
                                <div class="align-right">${item.qty}</div>
                                <div class="align-right">${parseFloat(item.calories).toFixed(0)}</div>
                             </div>`;
        });
        itemizedHTML += `</div>`;
        
        // --- 3. Footer with User Info & Price ---
        const customerInfo = data.customerInfo;
        let footerHTML = `<div class="results-footer">
            <div class="customer-info-list">
                <div class="info-item">User: <span>${customerInfo.user}</span></div>
                <div class="info-item">Meal: <span>${customerInfo.meal}</span></div>
                <div class="info-item">Goal: <span>${customerInfo.goal}</span></div>
            </div>
            <div class="total-price">
                <div class="label">TOTAL PRICE</div>
                <div class="value">${data.totalPrice}</div>
            </div>
        </div>`;


        // --- Assemble all parts ---
        resultContent.innerHTML = metricGridHTML + itemizedHTML + footerHTML;
    }
    
    // Helper function to create metric cards
    function createMetricCard(label, value, isPrimary = false) {
        return `
            <div class="metric-card">
                <div class="label">${label}</div>
                <div class="value ${isPrimary ? 'calories' : ''}">${value}</div>
            </div>
        `;
    }
});