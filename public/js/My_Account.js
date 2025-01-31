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
        document.getElementById("contact-number").removeAttribute("readonly");
        document.getElementById("email-address").removeAttribute("readonly");
        document.getElementById("birthday").removeAttribute("readonly");
        document.getElementById("address").removeAttribute("readonly");
        document.getElementById("career").removeAttribute("readonly");
        document.getElementById("passions").removeAttribute("readonly");
        document.getElementById("skills").removeAttribute("readonly");
    } else {
        document.getElementById("contact-number").setAttribute("readonly", true);
        document.getElementById("email-address").setAttribute("readonly", true);
        document.getElementById("birthday").setAttribute("readonly", true);
        document.getElementById("address").setAttribute("readonly", true);
        document.getElementById("career").setAttribute("readonly", true);
        document.getElementById("passions").setAttribute("readonly", true);
        document.getElementById("skills").setAttribute("readonly", true);
    }
}

// Ensure the PERSONAL tab is highlighted by default
document.getElementById("personal-tab").click();
