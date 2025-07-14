document.addEventListener('DOMContentLoaded', () => {
    const mealForm = document.getElementById('meal-form');
    const statusMessage = document.getElementById('status-message');
    
    // Your n8n Webhook URL
    const webhookUrl = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook-test/8e38a1d9-a5f8-43a0-bb33-0c408787124f';

    mealForm.addEventListener('submit', async (event) => {
        // 1. Prevent the default form submission (which reloads the page)
        event.preventDefault();

        // 2. Get the values from the form fields
        const mealName = document.getElementById('meal-name').value.trim();
        const userName = document.getElementById('user-name').value.trim();

        // Basic validation
        if (!mealName || !userName) {
            statusMessage.textContent = 'Please fill out both fields.';
            statusMessage.className = 'error';
            return;
        }

        // 3. Show a "sending" message to the user
        statusMessage.textContent = 'Sending data...';
        statusMessage.className = '';

        // 4. Create the data payload object
        const data = {
            mealName: mealName,
            userName: userName,
        };

        // 5. Send the data using the fetch API
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                mode: 'cors' // Necessary for cross-origin requests
            });

            if (response.ok) {
                // If the webhook responds with a success status (e.g., 200)
                statusMessage.textContent = 'Report generated successfully!';
                statusMessage.className = 'success';
                mealForm.reset(); // Clear the form fields
            } else {
                // If the server responds with an error status (e.g., 400, 500)
                statusMessage.textContent = `Error: ${response.statusText}`;
                statusMessage.className = 'error';
            }
        } catch (error) {
            // If there's a network error (e.g., webhook URL is down)
            console.error('Fetch Error:', error);
            statusMessage.textContent = 'Failed to connect. Please check your connection.';
            statusMessage.className = 'error';
        }
    });
});