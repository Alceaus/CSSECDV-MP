document.addEventListener("DOMContentLoaded", function() {

    // Only update date and time if the datetime element exists
    const datetimeElement = document.getElementById('datetime');
    if (datetimeElement) {
        function updateDateTime() {
            const now = new Date();
            const options = { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            };
            const formattedDateTime = now.toLocaleDateString('en-US', options);
            datetimeElement.innerHTML = formattedDateTime;
        }
        
        setInterval(updateDateTime, 1000);
        updateDateTime();
    }

    const dropdownItems = document.querySelectorAll("nav ul li");
    dropdownItems.forEach(item => {
        item.addEventListener("click", function() {
            this.classList.toggle("active");
        });
    });

    const userSwitch = document.getElementById('userSwitch');
    const adminSwitch = document.getElementById('adminSwitch');

    userSwitch.addEventListener('click', () => {
        userSwitch.classList.add('active');
        adminSwitch.classList.remove('active');
    });

    adminSwitch.addEventListener('click', () => {
        adminSwitch.classList.add('active');
        userSwitch.classList.remove('active');
    });

    const modal = document.getElementById('myModal');
    const passkeyDigits = document.querySelectorAll('.passkey-digit');
    const lockIcon = document.getElementById('lockIcon');
    const span = document.getElementsByClassName('close')[0];

    adminSwitch.addEventListener('click', function() {
        modal.style.display = 'block';
        passkeyDigits[0].focus();
    });

    span.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    passkeyDigits.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (input.value.length === 1 && index < passkeyDigits.length - 1) {
                passkeyDigits[index + 1].focus();
            }
        });
    });

    document.getElementById('passkeySubmit').addEventListener('click', function() {
        const passkey = Array.from(passkeyDigits).map(input => input.value).join('');
        if (passkey === '1234') {
            lockIcon.src = '../UI/images/pin_unlocked.png';
            showLoadingAndRedirect('index.html');
        } else {
            lockIcon.src = '../UI/images/pin_lock.png';
            passkeyDigits.forEach(input => input.value = '');
            passkeyDigits[0].focus();
            alert('Incorrect pin. Please try again.');
        }
    });

    function showLoadingAndRedirect(url) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="loadingContainer" class="loading-container">
                <div class="loading-animation"></div>
            </div>
        `);
        setTimeout(() => {
            window.location.href = url;
        }, 3000); 
    }
});

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

function addGetInTouch() {
    const name = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('contact-number').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    const getInTouch = {
        name: name,
        email: email,
        phone: phone,
        subject: subject,
        message: message
    };

    fetch('/addGetInTouch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(getInTouch)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add get in touch');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('contact-form').reset();
    })
    .catch(error => {
        console.error('Error saving get in touch:', error);
    });
}
