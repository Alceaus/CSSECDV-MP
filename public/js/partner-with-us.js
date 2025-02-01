document.addEventListener('DOMContentLoaded', function() {
    const form1 = document.getElementById("partner-form");

    form1.addEventListener("submit", function(event) {
    // document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        var orgName = document.getElementById('organization-name').value;
        var contactPerson = document.getElementById('contact-person').value;
        var email = document.getElementById('email').value;
        var phone = document.getElementById('phone').value;
        var website = document.getElementById('website').value;
        var project = document.getElementById('project').value;
        var description = document.getElementById('organization-description').value;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'process_form.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status === 200) {
                alert(xhr.responseText);
            } else {
                alert('There was an error submitting your form. Please try again.');
            }
        };
        xhr.onerror = function() {
            alert('There was an error submitting your form. Please try again.');
        };
        xhr.send('organization-name=' + encodeURIComponent(orgName) +
                 '&contact-person=' + encodeURIComponent(contactPerson) +
                 '&email=' + encodeURIComponent(email) +
                 '&phone=' + encodeURIComponent(phone) +
                 '&website=' + encodeURIComponent(website) +
                 '&project=' + encodeURIComponent(project) +
                 '&organization-description=' + encodeURIComponent(description));
    });

    const form2 = document.getElementById("volunteer-form");
  
    form2.addEventListener("submit", function(event) {
        event.preventDefault();
        
        var full_name = document.getElementById('full-name').value;
        var volunteer_email = document.getElementById('volunteer-email').value;
        var volunteer_phone = document.getElementById('volunteer-phone').value;
        var volunteer_skills = document.getElementById('volunteer-skills').value;
        var availability = document.getElementById('availability').value;
        var previous_experience = document.getElementById('previous-experience').value;
        var why_volunteer = document.getElementById('why-volunteer').value;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'process_form.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status === 200) {
                alert(xhr.responseText);
            } else {
                alert('There was an error submitting your form. Please try again.');
            }
        };
        xhr.onerror = function() {
            alert('There was an error submitting your form. Please try again.');
        };
        xhr.send('full-name=' + encodeURIComponent(full_name) +
                 '&volunteer-email=' + encodeURIComponent(volunteer_email) +
                 '&volunteer-phone=' + encodeURIComponent(volunteer_phone) +
                 '&volunteer-skills=' + encodeURIComponent(volunteer_skills) +
                 '&availability=' + encodeURIComponent(availability) +
                 '&previous-experience=' + encodeURIComponent(previous_experience) +
                 '&why-volunteer=' + encodeURIComponent(why_volunteer));
    });
});

function goBack() {
    window.history.back();
}

function redirectToUserJS() {
    window.location.href = 'User.html';
}

function addPartner() {
    const name = document.getElementById('organization-name').value;
    const contact = document.getElementById('contact-person').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const website = document.getElementById('website').value;
    const project = document.getElementById('project').value;
    const description = document.getElementById('organization-description').value;

    const partner = {
        name: name,
        contact: contact,
        email: email,
        phone: phone,
        website: website,
        project: project,
        description: description
    };

    fetch('/addPartner', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(partner)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add partner');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('partner-form').reset();
    })
    .catch(error => {
        console.error('Error saving partner:', error);
    });
}

function addVolunteer() {
    const name = document.getElementById('full-name').value;
    const email = document.getElementById('volunteer-email').value;
    const phone = document.getElementById('volunteer-phone').value;
    const skills = document.getElementById('volunteer-skills').value;
    const availability = document.getElementById('availability').value;
    const experience = document.getElementById('previous-experience').value;
    const reason = document.getElementById('why-volunteer').value;

    const volunteer = {
        name: name,
        email: email,
        phone: phone,
        skills: skills,
        availability: availability,
        experience: experience,
        reason: reason
    };

    fetch('/addVolunteer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(volunteer)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add volunteer');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('volunteer-form').reset();
    })
    .catch(error => {
        console.error('Error saving volunteer:', error);
    });
}
