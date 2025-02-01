function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    document.getElementById('datetime').innerHTML = formattedDateTime;
}

setInterval(updateDateTime, 1000);
updateDateTime();
document.addEventListener("DOMContentLoaded", function() {
    const dropdownItems = document.querySelectorAll("nav ul li.dropdown.login");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const switchSlider = document.querySelector(".switch .slider");
    let timeoutId;

    dropdownItems.forEach(item => {
        item.addEventListener("mouseover", function() {
            clearTimeout(timeoutId);
            this.querySelector(".dropdown-content").style.display = "block";
        });

        item.addEventListener("mouseout", function() {
            timeoutId = setTimeout(() => {
                this.querySelector(".dropdown-content").style.display = "none";
            }, 300); // Adjust delay as needed
        });
    });

    const switchButtons = document.querySelectorAll(".switch button");

    switchButtons.forEach(button => {
        button.addEventListener("click", function() {
            switchButtons.forEach(btn => btn.classList.remove("active-btn"));
            this.classList.add("active-btn");
            if (this.id.includes("loginBtn")) {
                loginForm.classList.add("active-form");
                registerForm.classList.remove("active-form");
                switchSlider.style.transform = "translateX(0)";
            } else {
                loginForm.classList.remove("active-form");
                registerForm.classList.add("active-form");
                switchSlider.style.transform = "translateX(100%)";
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/resources')
        .then(response => response.json())
        .then(data => {
            const resourcesContainer = document.getElementById('resources-container');
            data.forEach(resource => {
                const resourceElement = document.createElement('div');
                resourceElement.classList.add('event-card');
                const creationDate = new Date(resource.creationDate);
                const formattedDate = creationDate.toLocaleString('default', { month: 'short', day: 'numeric' });

                resourceElement.innerHTML = `
                    <img src="${resource.image}" alt="Resource">
                    <div class="event-date">${formattedDate}</div>
                    <h3>${resource.title}</h3>
                    <p>${resource.description}</p>
                    <button onclick="location.href='/resource/${resource.id}'">See More</button>
                `;
                resourcesContainer.appendChild(resourceElement);
            });
        });
});