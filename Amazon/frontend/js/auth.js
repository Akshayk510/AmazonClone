// Authentication JavaScript file for AmaClone

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication functionality
    initAuth();
});

// Initialize authentication
function initAuth() {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Register form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
    
    // Check if user is logged in
    checkAuthStatus();
}

// Handle login form submission
function handleLogin() {
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate form
    if (!email || !password) {
        showAuthError('Please enter both email and password');
        return;
    }
    
    // In a real application, this would make an API call to the backend
    // For this demo, we'll simulate a successful login
    
    // Simulate API call with timeout
    showLoading();
    
    setTimeout(() => {
        // Store user data in localStorage (in a real app, you'd store a JWT token)
        const userData = {
            id: 1,
            name: 'Demo User',
            email: email,
            isLoggedIn: true
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect to home page
        window.location.href = 'index.html';
    }, 1500);
}

// Handle register form submission
function handleRegister() {
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    
    // Validate form
    if (!name || !email || !password || !passwordConfirm) {
        showAuthError('Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }
    
    if (password !== passwordConfirm) {
        showAuthError('Passwords do not match');
        return;
    }
    
    // In a real application, this would make an API call to the backend
    // For this demo, we'll simulate a successful registration
    
    // Simulate API call with timeout
    showLoading();
    
    setTimeout(() => {
        // Store user data in localStorage (in a real app, you'd store a JWT token)
        const userData = {
            id: 1,
            name: name,
            email: email,
            isLoggedIn: true
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect to home page
        window.location.href = 'index.html';
    }, 1500);
}

// Check authentication status
function checkAuthStatus() {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    
    // Update UI based on auth status
    if (userData && userData.isLoggedIn) {
        // User is logged in
        updateUIForLoggedInUser(userData);
    } else {
        // User is not logged in
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(userData) {
    // Update account container in header if it exists
    const accountContainer = document.querySelector('.account-container .account-text');
    if (accountContainer) {
        accountContainer.innerHTML = `
            <span>Hello, ${userData.name}</span>
            <span class="account-dropdown">Account & Lists <i class="fas fa-caret-down"></i></span>
        `;
    }
    
    // Update dropdown content if it exists
    const dropdownTop = document.querySelector('.account-dropdown-content .dropdown-top');
    if (dropdownTop) {
        dropdownTop.innerHTML = `
            <p>Signed in as <strong>${userData.name}</strong></p>
            <button id="sign-out-button" class="sign-out-button">Sign Out</button>
        `;
        
        // Add event listener to sign out button
        const signOutButton = document.getElementById('sign-out-button');
        if (signOutButton) {
            signOutButton.addEventListener('click', handleSignOut);
        }
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    // No need to update anything for logged out users on the login/register pages
    // This would be used to update the header on other pages
}

// Handle sign out
function handleSignOut() {
    // Remove user data from localStorage
    localStorage.removeItem('user');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Show authentication error
function showAuthError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    
    // Add to form
    const form = document.querySelector('.auth-form');
    if (form) {
        form.insertBefore(errorElement, form.firstChild);
    }
}

// Show loading state
function showLoading() {
    // Disable submit button and show loading state
    const submitButton = document.querySelector('.auth-button');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Loading...';
    }
}

// Reset loading state
function resetLoading() {
    // Enable submit button and reset text
    const submitButton = document.querySelector('.auth-button');
    if (submitButton) {
        submitButton.disabled = false;
        
        // Set appropriate text based on form type
        if (document.getElementById('login-form')) {
            submitButton.innerHTML = 'Sign-In';
        } else if (document.getElementById('register-form')) {
            submitButton.innerHTML = 'Create your AmaClone account';
        }
    }
}