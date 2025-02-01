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

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function highlightTab(evt) {
    var i, menuItems;
    menuItems = document.getElementsByClassName("menu-item");
    for (i = 0; i < menuItems.length; i++) {
        menuItems[i].className = menuItems[i].className.replace(" active", "");
    }
    evt.currentTarget.className += " active";

    if (evt.currentTarget.id === "edit-profile-tab") {
        document.getElementById("profile-name").setAttribute("contenteditable", "true");
        document.getElementById("profile-role").setAttribute("contenteditable", "true");
        document.getElementById("profile-statement").setAttribute("contenteditable", "true");
        document.getElementById("edit-buttons-profile").style.display = "block";
    } else {
        document.getElementById("profile-name").setAttribute("contenteditable", "false");
        document.getElementById("profile-role").setAttribute("contenteditable", "false");
        document.getElementById("profile-statement").setAttribute("contenteditable", "false");
        document.getElementById("edit-buttons-profile").style.display = "none";
    }

    // Other existing code for readonly attributes and edit-buttons visibility
    if (evt.currentTarget.id === "edit-profile-tab") {
        document.getElementById("contact-number").removeAttribute("readonly");
        document.getElementById("email-address").removeAttribute("readonly");
        document.getElementById("birthday").removeAttribute("readonly");
        document.getElementById("address").removeAttribute("readonly");
        document.getElementById("career").removeAttribute("readonly");
        document.getElementById("passions").removeAttribute("readonly");
        document.getElementById("skills").removeAttribute("readonly");

        document.getElementById("edit-buttons-volunteer").style.display = "block";
        document.getElementById("edit-buttons-details").style.display = "block";
        document.getElementById("edit-buttons-contact").style.display = "block";
        document.getElementById("profile-pic-upload").style.display = "block"; // Show profile pic upload button
        document.getElementById("add-skill-btn").style.display = "inline"; 
    } else {
        document.getElementById("contact-number").setAttribute("readonly", true);
        document.getElementById("email-address").setAttribute("readonly", true);
        document.getElementById("birthday").setAttribute("readonly", true);
        document.getElementById("address").setAttribute("readonly", true);
        document.getElementById("career").setAttribute("readonly", true);
        document.getElementById("passions").setAttribute("readonly", true);
        document.getElementById("skills").setAttribute("readonly", true);

        document.getElementById("edit-buttons-volunteer").style.display = "none";
        document.getElementById("edit-buttons-details").style.display = "none";
        document.getElementById("edit-buttons-contact").style.display = "none";
        document.getElementById("profile-pic-upload").style.display = "none"; // Hide profile pic upload button
        document.getElementById("add-skill-btn").style.display = "none"; 
    }
}



function addSkill() {
    var skillsContainer = document.getElementById("skills-container");
    var newSkillInput = document.createElement("input");
    newSkillInput.type = "text";
    newSkillInput.placeholder = "Add another skill";
    skillsContainer.appendChild(newSkillInput);
    skillsContainer.appendChild(document.getElementById("add-skill-btn"));
}


// Ensure the PERSONAL tab is highlighted by default
document.getElementById("personal-tab").click();
