document.addEventListener("DOMContentLoaded", function() {
    async function checkLoginStatus() {
        try {
            const response = await fetch('/checkLogin');
            const data = await response.json();
            return data.isLoggedIn;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }

    async function updateNavigation() {
        const isLoggedIn = await checkLoginStatus();
        const accountLink = document.getElementById('account-link');

        if (isLoggedIn) {
            accountLink.className = 'dropdown logout';
            accountLink.innerHTML = `
                <a href="#logout" data-arrow>MY ACCOUNT</a>
                <div class="dropdown-content logout-dropdown">
                    <a href="My_Account.html">ACCOUNT SETTINGS</a>
                    <a href="home-default.html" id="logout-link">LOGOUT</a>
                </div>
            `;

            document.getElementById('logout-link').addEventListener('click', async function() {
                await fetch('/logout');
                sessionStorage.removeItem('isLoggedIn');
                window.location.href = 'home-default.html';
            });
        } else {
            accountLink.className = 'dropdown login';
            accountLink.innerHTML = `
                <a href="user-login-register.html" data-arrow>LOGIN / REGISTER</a>
            `;
        }
    }

    async function openBothPopups() {
        const isLoggedIn = await checkLoginStatus();
        if (isLoggedIn) {
            document.getElementById('feedbackPopup').style.display = 'block';
        } else {
            document.getElementById('loginPopup').style.display = 'block';
        }
    }

    function closeFeedbackPopup() {
        document.getElementById('feedbackPopup').style.display = 'none';
    }

    function closeLoginPopup() {
        document.getElementById('loginPopup').style.display = 'none';
    }

    window.onclick = function(event) {
        var feedbackModal = document.getElementById('feedbackPopup');
        var loginModal = document.getElementById('loginPopup');
        if (event.target == feedbackModal) {
            feedbackModal.style.display = 'none';
        }
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
    }

    updateNavigation();
    document.querySelector(".feedback-btn").onclick = openBothPopups;
    document.querySelector('#feedbackPopup .close-btn').onclick = closeFeedbackPopup; // Ensure this line is included
    document.querySelector('#loginPopup .close-btn').onclick = closeLoginPopup; // Ensure this line is included
});
