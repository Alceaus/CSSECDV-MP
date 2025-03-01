let slideIndex = 0;
showSlides();

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

function showSlides() {
    let slides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}    
    slides[slideIndex-1].style.display = "block";  
    setTimeout(showSlides, 5000); 
}

function plusSlides(n) {
    slideIndex += n;
    let slides = document.getElementsByClassName("mySlides");
    if (slideIndex > slides.length) {slideIndex = 1}
    if (slideIndex < 1) {slideIndex = slides.length}
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    slides[slideIndex-1].style.display = "block"; 
}

document.addEventListener("DOMContentLoaded", function() {
    async function checkLoginStatus() {
        try {
            const response = await fetch('/auth/checkLogin');
            const data = await response.json();
            return data.isLoggedIn;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }

    async function updateNavigation() {
        const isLoggedIn = await checkLoginStatus();

        if (isLoggedIn) {
            const logoutButton = document.querySelector('.logout');
            if (logoutButton) {
                logoutButton.addEventListener('click', async function() {
                    await fetch('/auth/logout');
                    sessionStorage.removeItem('isLoggedIn');
                    window.location.href = 'login_admin.html';
                });
            } else {
                console.error("Logout button not found!");
            }
        }
    }
    updateNavigation();
});

document.addEventListener("DOMContentLoaded", function() {
    const dropdownItems = document.querySelectorAll("nav ul li");
    dropdownItems.forEach(item => {
        item.addEventListener("click", function() {
            this.classList.toggle("active");
        });
    });
});


