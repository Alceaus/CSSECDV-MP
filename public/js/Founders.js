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

    updateNavigation();
});


document.addEventListener('DOMContentLoaded', function () {
    const descriptionContainers = document.querySelectorAll('.founder-description-container');

    function checkOverflow() {
        descriptionContainers.forEach(container => {
            const description = container.querySelector('.founder-description');
            const showMore = container.querySelector('.show-more');
            const isExpanded = description.style.maxHeight === 'none';
            
            if (description.scrollHeight > description.clientHeight || isExpanded) {
                showMore.style.display = 'block';
            } else {
                showMore.style.display = 'none';
            }
        });
    }

    checkOverflow();

    window.addEventListener('resize', checkOverflow);
});

function toggleDescription(element) {
    const description = element.previousElementSibling;
    const isExpanded = description.style.maxHeight === 'none';
    
    if (isExpanded) {
        description.style.maxHeight = description.scrollHeight + 'px';
        setTimeout(() => {
            description.style.maxHeight = '200px';
        }, 10);
        element.innerHTML = '&#x25B2;';
        element.classList.add('rotate');
    } else {
        description.style.maxHeight = description.scrollHeight + 'px';
        setTimeout(() => {
            description.style.maxHeight = 'none';
        }, 500); // This should match the transition duration
        element.innerHTML = '&#x25BC;';
        element.classList.add('rotate');
    }
}











