document.addEventListener('DOMContentLoaded', () => {
    const N8N_MEAL_ANALYSIS_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook-test/8e38a1d9-a5f8-43a0-bb33-0c408787124f';
    const N8N_REGISTER_USER_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook-test/3d613183-9c5b-4135-a80d-78c12ca29759';
    const N8N_COOKING_MANUAL_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook-test/cooking-manual';
    const N8N_ORDER_NOW_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook-test/order-now'; 

    const resultContent = document.getElementById('result-content');
    const actionsContainer = document.getElementById('results-actions-container');
    const placeholderHTML = resultContent.innerHTML;
    const notificationBanner = document.getElementById('notification-banner');
    let notificationTimeout;
    let currentResultsData = null;
    const mealForm = document.getElementById('meal-form');
    const mealNameInput = document.getElementById('meal-name');
    const userNameInput = document.getElementById('user-name');
    const registerUserBtn = document.getElementById('register-user-btn');
    const registerModalOverlay = document.getElementById('register-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const newUserForm = document.getElementById('new-user-form');
    const registerStatus = document.getElementById('register-status');
    
    registerUserBtn.addEventListener('click', () => { registerModalOverlay.style.display = 'flex'; });
    closeModalBtn.addEventListener('click', () => { registerModalOverlay.style.display = 'none'; });
    registerModalOverlay.addEventListener('click', (e) => { if (e.target === registerModalOverlay) registerModalOverlay.style.display = 'none'; });
    
    newUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = { name: document.getElementById('new-user-name').value, age: parseInt(document.getElementById('new-user-age').value), gender: document.getElementById('new-user-gender').value, height: parseFloat(document.getElementById('new-user-height').value), weight: parseFloat(document.getElementById('new-user-weight').value), activityLevel: parseFloat(document.getElementById('new-user-activity').value) };
        registerStatus.textContent = 'Registering...';
        registerStatus.className = 'status-message';
        try {
            const response = await fetch(N8N_REGISTER_USER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), mode: 'cors' });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            registerStatus.textContent = 'Registration Successful!';
            registerStatus.className = 'status-message success';
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

    mealForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const mealName = mealNameInput.value.trim();
        const userName = userNameInput.value.trim();
        if (!mealName || !userName) {
            displayError('Please fill in both required fields.');
            return;
        }
        await sendMealDataToN8n({ mealName, userName });
    });

    actionsContainer.addEventListener('click', function(event) {
        const button = event.target.closest('button');
        if (!button) return;
        const action = button.dataset.action;
        if (action === 'get-manual') {
            handlePostAnalysisRequest(N8N_COOKING_MANUAL_URL, currentResultsData, button, 'Get Cooking Manual', 'Manual Ready!');
        } else if (action === 'order-now') {
            handlePostAnalysisRequest(N8N_ORDER_NOW_URL, currentResultsData, button, 'Order Now', 'Order Placed!');
        }
    });

    function showNotification(message, type = 'success', duration = 5000) {
        clearTimeout(notificationTimeout);
        notificationBanner.innerHTML = `<span class="notification-message">${message}</span><button class="notification-close-btn">×</button>`;
        notificationBanner.className = 'notification-banner';
        notificationBanner.classList.add(type);
        setTimeout(() => { notificationBanner.classList.add('show'); }, 10);
        notificationTimeout = setTimeout(() => { notificationBanner.classList.remove('show'); }, duration);
        notificationBanner.querySelector('.notification-close-btn').addEventListener('click', () => {
             notificationBanner.classList.remove('show');
             clearTimeout(notificationTimeout);
        });
    }

    async function sendMealDataToN8n(data) {
        showLoadingState();
        try {
            const response = await fetch(N8N_MEAL_ANALYSIS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify(data), mode: 'cors' });
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            const resultData = await response.json();
            currentResultsData = resultData;
            displayResult(resultData);
        } catch (error) {
            console.error('Error processing request:', error);
            displayError('Could not process response. Ensure data is valid JSON.');
        }
    }
    
    function showLoadingState() {
        resultContent.innerHTML = `<p class="loading">Generating AI analysis...</p>`;
        actionsContainer.innerHTML = '';
        currentResultsData = null;
    }
    
    function displayError(message) {
        resultContent.innerHTML = placeholderHTML;
        actionsContainer.innerHTML = '';
        currentResultsData = null;
        showNotification(message, 'error');
    }

    function displayResult(data) {
        resultContent.innerHTML = ''; 
        let contentHTML = `<div class="results-grid"><div class="nutrition-summary-widget">`;
        contentHTML += `<div class="metric calories"><div class="label">Total Calories</div><div class="value">${parseFloat(data.nutritionSummary.totalCalories).toFixed(0)}</div></div>`;
        contentHTML += `<div class="metric"><div class="label">Protein</div><div class="value">${parseFloat(data.nutritionSummary.totalProtein).toFixed(1)}g</div></div>`;
        contentHTML += `<div class="metric"><div class="label">Carbs</div><div class="value">${parseFloat(data.nutritionSummary.totalCarbs).toFixed(1)}g</div></div>`;
        contentHTML += `<div class="metric"><div class="label">Fats</div><div class="value">${parseFloat(data.nutritionSummary.totalFats).toFixed(1)}g</div></div></div>`;
        
        let ingredientsHTML = `<div class="ingredients-widget"><h3 class="widget-title">Ingredients Breakdown</h3>`; 
        data.itemizedReceipt.forEach(item => { ingredientsHTML += `<div class="list-item"><span class="name">${item.ingredient}</span><span class="value">${item.qty}</span></div>`; }); 
        ingredientsHTML += `<div class="total-price"><span class="label">Est. Cost</span><span class="value">${data.totalPrice}</span></div></div>`;
        
        let customerInfoHTML = `<div class="customer-info-widget"><h3 class="widget-title">Analysis Info</h3>`;
        customerInfoHTML += `<div class="list-item"><span class="name">User</span><span class="value">${data.customerInfo.user}</span></div>`;
        customerInfoHTML += `<div class="list-item"><span class="name">Meal Name</span><span class="value">${data.customerInfo.meal}</span></div>`;
        customerInfoHTML += `<div class="list-item"><span class="name">Health Goal</span><span class="value">${data.customerInfo.goal}</span></div></div>`;
        
        contentHTML += ingredientsHTML + customerInfoHTML + '</div>';
        resultContent.innerHTML = contentHTML;
        actionsContainer.innerHTML = `<button class="action-button" data-action="get-manual">Get Cooking Manual</button><button class="action-button primary" data-action="order-now">Order Now</button>`;
    }

    async function handlePostAnalysisRequest(url, data, buttonElement, originalText, successText) {
        if (!data || url.includes('YOUR_WEBHOOK_URL_HERE')) {
            showNotification('Error: The webhook URL is not configured.', 'error');
            return;
        }
        buttonElement.disabled = true;
        buttonElement.textContent = 'Processing...';

        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify(data), mode: 'cors' });
            if (!response.ok) throw new Error(`Webhook responded with status ${response.status}`);
            const responseData = await response.json();

            if (buttonElement.dataset.action === 'get-manual') {
                sessionStorage.setItem('eatasRecipeData', JSON.stringify(responseData));
                window.open('recipe.html', '_blank');
                buttonElement.textContent = successText;
                showNotification('Your cooking manual is ready in a new tab!', 'success');
            } else {
                showNotification(responseData.message || 'Request completed successfully!', 'success');
                buttonElement.textContent = successText;
            }

        } catch (error) {
            console.error('Error in post-analysis request:', error);
            showNotification(`Error: ${error.message}`, 'error');
            buttonElement.textContent = 'Error - Try Again';
        } finally {
            setTimeout(() => {
                if (buttonElement) {
                   buttonElement.disabled = false;
                   buttonElement.textContent = originalText;
                }
            }, 3000);
        }
    }
});