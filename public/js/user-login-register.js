document.addEventListener('DOMContentLoaded', function () {
    // Elements for toggling forms
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const slider = document.querySelector(".slider");
    const loginErrorMessage = document.getElementById('login-error');
    const photo = document.getElementById('photo');
    const photoErrorMessage = document.getElementById('photo-error');

    // Registration form fields
    const emailRegister = document.getElementById('emailRegister');
    const phone = document.getElementById('phone');
    const createPassword = document.getElementById('createPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    // Error message elements
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');

    // Disable all fields except the first one
    phone.disabled = true;
    createPassword.disabled = true;
    confirmPassword.disabled = true;

    // Toggle login form
    loginBtn.addEventListener("click", function() {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        loginBtn.classList.add("active-btn");
        loginBtn.classList.remove("inactive-btn");
        registerBtn.classList.remove("active-btn");
        registerBtn.classList.add("inactive-btn");
        slider.style.transform = "translateX(0)";
    });

    // Toggle registration form
    registerBtn.addEventListener("click", function() {
        registerForm.style.display = "block";
        loginForm.style.display = "none";
        registerBtn.classList.add("active-btn");
        registerBtn.classList.remove("inactive-btn");
        loginBtn.classList.remove("active-btn");
        loginBtn.classList.add("inactive-btn");
        slider.style.transform = "translateX(100%)";
    });

    // Email validation
    emailRegister.addEventListener('input', function () {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(emailRegister.value)) {
            emailError.textContent = 'Invalid email format.';
            emailError.style.color = 'red';
            phone.disabled = true;
        } else {
            emailError.textContent = '';
            phone.disabled = false;
        }
    });

    // Phone number validation
    phone.addEventListener('input', function () {
        const phonePattern = /^[0-9]{10,15}$/; // Allows 10 to 15 digits only
        if (!phonePattern.test(phone.value)) {
            phoneError.textContent = 'Enter a valid phone number (10-15 digits).';
            phoneError.style.color = 'red';
            createPassword.disabled = true;
        } else {
            phoneError.textContent = '';
            createPassword.disabled = false;
        }
    });

    // Password validation
    createPassword.addEventListener('input', function () {
        const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordPattern.test(createPassword.value)) {
            passwordError.textContent = 'Password must be at least 8 characters, include one uppercase, one number, and one special character.';
            passwordError.style.color = 'red';
            confirmPassword.disabled = true;
        } else {
            passwordError.textContent = '';
            confirmPassword.disabled = false;
        }
    });

    // Confirm password validation (real-time)
    confirmPassword.addEventListener('input', function () {
        validateConfirmPassword();
    });

    function validateConfirmPassword() {
        if (confirmPassword.value !== createPassword.value) {  
            confirmPasswordError.textContent = 'Passwords do not match.';
            confirmPasswordError.style.color = 'red';
        } else {
            confirmPasswordError.textContent = '';  
        }
    }

    // Image upload validation
    photo.addEventListener('change', async function(event) {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload/uploadFile', {
                method: 'POST',
                body: formData,
            });
            const result = await response.text();

            if (!response.ok) {
                photoErrorMessage.textContent = result;
                photoErrorMessage.style.color = 'red';
                photo.value = '';
            } else {
                photoErrorMessage.textContent = '';
            }
        } catch (error) {
            photoErrorMessage.textContent = 'Upload failed. Please try again.';
            photoErrorMessage.style.color = 'red';
        }
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const recaptchaToken = grecaptcha.getResponse();
        if (!recaptchaToken) {
            loginErrorMessage.textContent = 'Please complete the reCAPTCHA verification.';
            loginErrorMessage.style.color = 'red';
            return;
        }

        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            recaptchaToken: recaptchaToken
        };

        fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(async response => {
            if (response.status === 429) {
                const rateLimitData = await response.json();
                throw new Error(rateLimitData.message);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                if (data.role === 'Admin') {
                    window.location.href = "home_admin.html";
                } else {
                    window.location.href = "User.html";
                }
                loginForm.reset();
            } else {
                loginErrorMessage.textContent = 'Username or password is incorrect.';
                loginErrorMessage.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loginErrorMessage.textContent = error.message;
            loginErrorMessage.style.color = 'red';
        });
    });

    // Handle registration form submission
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const recaptchaToken = grecaptcha.getResponse();
        if (!recaptchaToken) {
            loginErrorMessage.textContent = 'Please complete the reCAPTCHA verification.';
            loginErrorMessage.style.color = 'red';
            return;
        }

        const formData = {
            firstName: document.getElementById('firstName').value,
            mi: document.getElementById('mi').value,
            lastName: document.getElementById('lastName').value,
            suffix: document.getElementById('suffix').value,
            email: document.getElementById('emailRegister').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            createPassword: document.getElementById('createPassword').value,
            recaptchaToken: recaptchaToken
        };

        fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            alert("Registration successful!");
            registerForm.reset();
        })
        .catch(error => {
            alert("Registration failed. Please try again.");
            console.error('There was a problem with the fetch operation:', error);
        });
    });
});
