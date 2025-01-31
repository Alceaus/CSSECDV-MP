let websiteVisits = 0;

document.addEventListener("DOMContentLoaded", function() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function() {
            this.querySelector('.dropdown-content').classList.toggle('show');
        });
    });

    loadContent('overview');
    loadUserList();
    loadPendingApplications(); 
    loadGetInTouchMessages();
});

function loadContent(content) {
    document.querySelectorAll('.dashboard-panels > .panel').forEach(panel => {
        panel.style.display = 'none';
    });

    document.getElementById(`panel-${content}`).style.display = 'block';

    var sectionTitle = content.replace(/([A-Z])/g, ' $1').trim();
    sectionTitle = sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1);
    document.querySelector('.dashboard-header h1').innerText = sectionTitle;

    if (content === 'volunteerApplication') {
        loadVolunteerApplications();
    } else if (content === 'partnerApplication') {
        loadPartnerApplications();
    } else if (content === 'getInTouch') { 
        loadGetInTouchMessages();
    }
}

function loadUserList() {
    var users = [ // sample
        { name: "Juan Dela Cruz", idNumber: "12345", email: "juan@example.com", phone: "1234567890", address: "Real St, Manila", role: "Volunteer", online: true },
        { name: "Pepito Manaloto", idNumber: "54321", email: "pepito@example.com", phone: "0987654321", address: "Sampaguita St, Manila", role: "Donor", online: false }

    ];
    var userList = document.getElementById('user-list');
    var totalUsers = document.getElementById('total-users');
    userList.innerHTML = '';

    var onlineCount = 0;

    users.forEach(function(user) {
        var listItem = document.createElement('tr');
        listItem.classList.add('user-item');
        listItem.innerHTML = `
            <td>${user.name}</td>
            <td>${user.idNumber}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.address}</td>
            <td>${user.role}</td>
            <td><span class="${user.online ? 'online' : 'offline'}">${user.online ? 'Online' : 'Offline'}</span></td>
        `;
        userList.appendChild(listItem);

        if (user.online) {
            onlineCount++;
        }
    });

    totalUsers.textContent = users.length;
}

function loadVolunteerApplications() {
    const volunteerTable = document.getElementById('volunteer-applications');
    volunteerTable.innerHTML = ''; 
    volunteerApplications.forEach(application => {
        const row = `
            <tr>
                <td>${application.name}</td>
                <td>${application.email}</td>
                <td>${application.phone}</td>
                <td>${application.skills}</td>
                <td>${application.availability}</td>
                <td>${application.previousExperience}</td>
                <td>${application.whyVolunteer}</td>
                <td>
                    <button onclick="approveVolunteer('${application.email}')">Approve</button>
                    <button onclick="rejectVolunteer('${application.email}')">Reject</button>
                </td>
            </tr>
        `;
        volunteerTable.insertAdjacentHTML('beforeend', row);
    });
}

function loadPartnerApplications() {
    const partnerTable = document.getElementById('partner-applications');
    partnerTable.innerHTML = ''; 

    partnerApplications.forEach(application => {
        const row = `
            <tr>
                <td>${application.organizationName}</td>
                <td>${application.contactPerson}</td>
                <td>${application.email}</td>
                <td>${application.phone}</td>
                <td>${application.projectCollaboration}</td>
                <td>${application.organizationDescription}</td>
                <td>
                    <button onclick="approvePartner('${application.email}')">Approve</button>
                    <button onclick="rejectPartner('${application.email}')">Reject</button>
                </td>
            </tr>
        `;
        partnerTable.insertAdjacentHTML('beforeend', row);
    });
}

function approveVolunteer(email) {
    console.log(`Volunteer application for ${email} approved.`);
}

function rejectVolunteer(email) {
    console.log(`Volunteer application for ${email} rejected.`);
}

function approvePartner(email) {
    console.log(`Partner application for ${email} approved.`);
}

function rejectPartner(email) {
    console.log(`Partner application for ${email} rejected.`);
}

// Sample volunteer applications
const volunteerApplications = [
    {
        name: "Juan Dela Cruz",
        email: "juan@example.com",
        phone: "0912345",
        skills: "Web Development, Marketing",
        availability: "10/24/2024 11:00AM",
        previousExperience: "Volunteered at local community center",
        whyVolunteer: "I want to contribute to society and make a positive impact."
    },
    {
        name: "Alice Guo",
        email: "alice@example.com",
        phone: "0912345",
        skills: "Teaching, Event Planning",
        availability: "04/13/2024 9:00AM",
        previousExperience: "Tutored high school students",
        whyVolunteer: "I love teaching and want to help underprivileged children."
    }
];

// Sample partner applications
const partnerApplications = [
    {
        organizationName: "ABC Organization",
        contactPerson: "Christian Dior",
        email: "dior@example.com",
        phone: "09173648",
        projectCollaboration: "Education, Health",
        organizationDescription: "ABC Organization is dedicated to providing educational opportunities for children in need."
    },
    {
        organizationName: "XYZ Foundation",
        contactPerson: "Luke Kah",
        email: "luke@example.com",
        phone: "096969",
        projectCollaboration: "Environmental Sustainability",
        organizationDescription: "XYZ Foundation focuses on environmental conservation and sustainability projects."
    }
];

function loadGetInTouchMessages() {
    const messagesTable = document.getElementById('get-in-touch-messages');
    messagesTable.innerHTML = ''; 

    const getInTouchMessages = [
        {
            fullName: "James Blue",
            email: "james@example.com",
            contactNumber: "123456789",
            subject: "Inquiry",
            message: "I would like to know more about your programs."
        },
        {
            fullName: "Hannah Montana",
            email: "hannah@example.com",
            contactNumber: "987654321",
            subject: "Support",
            message: "How can I support your organization?"
        }

    ];

    getInTouchMessages.forEach(message => {
        const row = `
            <tr>
                <td>${message.fullName}</td>
                <td>${message.email}</td>
                <td>${message.contactNumber}</td>
                <td>${message.subject}</td>
                <td>${message.message}</td>
            </tr>
        `;
        messagesTable.insertAdjacentHTML('beforeend', row);
    });
}
