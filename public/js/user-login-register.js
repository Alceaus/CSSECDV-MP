document.addEventListener('DOMContentLoaded', function () {
    // Elements for toggling forms
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const slider = document.querySelector(".slider");

    // Show login form and hide registration form by default
    loginBtn.classList.add("active-btn");
    registerBtn.classList.add("inactive-btn");
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    
    // Toggle to login form
    loginBtn.addEventListener("click", function() {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        loginBtn.classList.add("active-btn");
        loginBtn.classList.remove("inactive-btn");
        registerBtn.classList.remove("active-btn");
        registerBtn.classList.add("inactive-btn");
        slider.style.transform = "translateX(0)";
    });

    // Toggle to registration form
    registerBtn.addEventListener("click", function() {
        registerForm.style.display = "block";
        loginForm.style.display = "none";
        registerBtn.classList.add("active-btn");
        registerBtn.classList.remove("inactive-btn");
        loginBtn.classList.remove("active-btn");
        loginBtn.classList.add("inactive-btn");
        slider.style.transform = "translateX(100%)";
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        fetch('/login', {
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
            console.log(data);
            window.location.href = "User.html";
            loginForm.reset();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });

    // Handle registration form submission
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = {
            firstName: document.getElementById('firstName').value,
            mi: document.getElementById('mi').value,
            lastName: document.getElementById('lastName').value,
            suffix: document.getElementById('suffix').value,
            email: document.getElementById('emailRegister').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            createPassword: document.getElementById('createPassword').value,
            reenterPassword: document.getElementById('reenterPassword').value
        };

        fetch('/register', {
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
            console.log(data);
            registerForm.reset();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });
});
