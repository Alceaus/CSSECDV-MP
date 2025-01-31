document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('form').addEventListener('submit', function(event) {
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
});
