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
    loadContact();
});

function convertTo12HourFormat(time) {
    let [hour, minute] = time.split(':');
    let period = 'AM';

    hour = parseInt(hour);
    if (hour >= 12) {
        period = 'PM';
        if (hour > 12) hour -= 12;
    } else if (hour === 0) {
        hour = 12;
    }
    return `${hour}:${minute} ${period}`;
}

function loadContact() {
    fetch('/getContact')
        .then(response => response.json())
        .then(data => {
            if (data.contact) {
                document.getElementById('address').textContent= data.contact.Address;
                document.getElementById('email-address').textContent = data.contact.Email;
                const phoneElement = document.getElementById('contact-number');
                const phone = data.contact.Phone;
                const network = data.contact.Network.charAt(0).toUpperCase() + data.contact.Network.slice(1);
                const phoneText = `${network}: ${phone}`;
                const p = document.createElement('p');
                p.textContent = phoneText;
                phoneElement.appendChild(p);
                const businessHoursElement = document.getElementById('business-hours');
                const businessHours = data.businessHours;
                businessHours.forEach(businessHour => {
                    const day = businessHour.Day.charAt(0).toUpperCase() + businessHour.Day.slice(1);
                    const startTime = convertTo12HourFormat(businessHour.StartTime.substring(0, 5));
                    const endTime = convertTo12HourFormat(businessHour.EndTime.substring(0, 5));
                    const businessHourText = `${day}: ${startTime} - ${endTime}`;
                    const p = document.createElement('p');
                    p.textContent = businessHourText;
                    businessHoursElement.appendChild(p);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching contact:', error);
        });
}
