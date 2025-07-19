document.addEventListener('DOMContentLoaded', () => {
    const landingScreen = document.getElementById('landing-screen');
    const registerScreen = document.getElementById('register-screen');
    const joinUsBtn = document.getElementById('join-us-btn');
    const loginBtn = document.getElementById('login-btn');
    const backBtn = document.getElementById('back-btn');
    const newUserForm = document.getElementById('new-user-form');
    const registerStatus = document.getElementById('register-status');
    const N8N_REGISTER_USER_URL = 'https://capital-monkfish-wrongly.ngrok-free.app/webhook-test/3d613183-9c5b-4135-a80d-78c12ca29759';

    const showRegisterScreen = () => {
        landingScreen.classList.add('fade-out');
        setTimeout(() => {
            landingScreen.classList.add('hidden');
            landingScreen.classList.remove('fade-out');
            registerScreen.classList.remove('hidden');
            registerScreen.classList.add('fade-in');
        }, 500);
    };

    const showLandingScreen = () => {
        registerScreen.classList.add('fade-out');
        setTimeout(() => {
            registerScreen.classList.add('hidden');
            registerScreen.classList.remove('fade-out');
            landingScreen.classList.remove('hidden');
            landingScreen.classList.add('fade-in');
        }, 500);
    };
    
    // Both "Already Joined" and successful registration go to app.html
    const navigateToApp = () => {
        window.location.href = 'app.html'; // Use relative path
    };

    joinUsBtn.addEventListener('click', showRegisterScreen);
    backBtn.addEventListener('click', showLandingScreen);
    loginBtn.addEventListener('click', navigateToApp);

    newUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = {
            name: document.getElementById('new-user-name').value,
            age: parseInt(document.getElementById('new-user-age').value),
            gender: document.getElementById('new-user-gender').value,
            height: parseFloat(document.getElementById('new-user-height').value),
            weight: parseFloat(document.getElementById('new-user-weight').value),
            activityLevel: parseFloat(document.getElementById('new-user-activity').value)
        };
        registerStatus.textContent = 'Creating profile...';
        registerStatus.className = 'status-message';
        try {
            const response = await fetch(N8N_REGISTER_USER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify(data),
                mode: 'cors'
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            registerStatus.textContent = 'Registration Successful!';
            registerStatus.className = 'status-message success';
            setTimeout(navigateToApp, 1500);
        } catch (error) {
            console.error('Registration Error:', error);
            registerStatus.textContent = 'Registration Failed. Please try again.';
            registerStatus.className = 'status-message error';
        }
    });

    if (window.matchMedia('(min-width: 1024px)').matches && !window.matchMedia('(pointer: coarse)').matches) {
        document.body.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const x = Math.round((clientX / window.innerWidth) * 100);
            const y = Math.round((clientY / window.innerHeight) * 100);
            document.body.style.setProperty('--glow-x', `${x}%`);
            document.body.style.setProperty('--glow-y', `${y}%`);
        });
    }
});