const url = 'http://localhost:8080/auth/login';
// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const submitBtn = document.getElementById('submitBtn');
const notification = document.getElementById('notification');

togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});

function validateForm() {
    let isValid = true;
    
    usernameError.textContent = '';
    passwordError.textContent = '';
    
    const username = usernameInput.value.trim();
    if (!username) {
        usernameError.textContent = 'Username is required';
        usernameInput.style.borderColor = '#e74c3c';
        isValid = false;
    } else if (username.length < 3) {
        usernameError.textContent = 'Username must be at least 3 characters';
        usernameInput.style.borderColor = '#e74c3c';
        isValid = false;
    } else {
        usernameInput.style.borderColor = '#ddd';
    }
    
    const password = passwordInput.value.trim();
    if (!password) {
        passwordError.textContent = 'Password is required';
        passwordInput.style.borderColor = '#e74c3c';
        isValid = false;
    } else if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        passwordInput.style.borderColor = '#e74c3c';
        isValid = false;
    } else {
        passwordInput.style.borderColor = '#ddd';
    }
    
    return isValid;
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'success') {
        notification.style.backgroundColor = '#2ecc71';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e74c3c';
    } else {
        notification.style.backgroundColor = '#3498db';
    }
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Signing In...</span><i class="fas fa-spinner fa-spin"></i>';
    submitBtn.style.opacity = '0.8';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Backend returns { "token": "..." }
        } else {
            throw new Error('Invalid username or password');
        }
    })
    .then(data => {
        const token = data.token;
        localStorage.setItem('jwt', token);

        showNotification(`Welcome back, ${username}! Login successful.`);
        setTimeout(() => {
            window.location.href = '/src/admin/pages/dashboard.html';
        }, 1500);
    })
    .catch(error => {
        showNotification('Invalid username or password, ' + error, 'error');

        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In'; // Restore original text
        submitBtn.style.opacity = '1';
    });
});

usernameInput.addEventListener('input', function() {
    const username = this.value.trim();
    
    if (username && username.length >= 3) {
        usernameError.textContent = '';
        this.style.borderColor = '#2ecc71';
    } else if (username) {
        this.style.borderColor = '#f39c12';
    } else {
        this.style.borderColor = '#ddd';
    }
});
passwordInput.addEventListener('input', function() {
    const password = this.value.trim();
    
    if (password && password.length >= 6) {
        passwordError.textContent = '';
        this.style.borderColor = '#2ecc71';
    } else if (password) {
        this.style.borderColor = '#f39c12';
    } else {
        this.style.borderColor = '#ddd';
    }
});