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
