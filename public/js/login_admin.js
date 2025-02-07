document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        fetch('/admin/login', {
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
            window.location.href = "home_admin.html";
            loginForm.reset();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });
});
