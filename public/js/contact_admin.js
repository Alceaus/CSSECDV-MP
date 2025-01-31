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

function previewPhoto(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const photo = document.getElementById('uploaded-photo');
        photo.src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}

const saveButton = document.querySelector('.save-button');

saveButton.addEventListener('click', function() {
    
    const addressValue = document.getElementById('address').value.trim();
    const businessHoursValue = document.getElementById('business-hours').value.trim();
    const contactNumberValue = document.getElementById('contact-number').value.trim();
    const emailValue = document.getElementById('email').value.trim();

    if (addressValue || businessHoursValue || contactNumberValue || emailValue) {
        alert('Changes saved successfully!');
    } else {
        alert('No changes made.');
    }
});
