
let slideIndex = 0;
showSlides();

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
    fetch('/addVisitorCount', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Visitor count incremented.');
    })
    .catch(error => {
        console.error('Error incrementing visitor count:', error);
    });
    
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
            lockIcon.src = '../public/images/pin_unlocked.png';
            showLoadingAndRedirect('../public/index_admin.html');
        } else {
            lockIcon.src = '../public/images/pin_lock.png';
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


let testimonialIndex = 0;
let currentSlideDirection = "right";

function plusTestimonials(n) {
    currentSlideDirection = n > 0 ? "right" : "left";
    showTestimonial(testimonialIndex += n, currentSlideDirection);
}

function showTestimonial(n, direction) {
    const testimonials = document.getElementsByClassName("testimonial");
    if (n >= testimonials.length) {
        testimonialIndex = 0;
    }
    if (n < 0) {
        testimonialIndex = testimonials.length - 1;
    }
    for (let i = 0; i < testimonials.length; i++) {
        testimonials[i].classList.remove("slide-in-left", "slide-in-right", "slide-out-left", "slide-out-right");
        testimonials[i].style.display = "none";
    }

    if (direction === "right") {
        testimonials[testimonialIndex].style.display = "flex";
        testimonials[testimonialIndex].classList.add("slide-in-right");
    } else {
        testimonials[testimonialIndex].style.display = "flex";
        testimonials[testimonialIndex].classList.add("slide-in-left");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    showTestimonial(testimonialIndex, currentSlideDirection);
});







