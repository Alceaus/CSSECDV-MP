let visitorCounts = [];
let isOverview = 1;
let users = [];
let partnerApplications = [];
let volunteerApplications = [];
let getInTouchMessages = [];

document.addEventListener("DOMContentLoaded", function() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function() {
            this.querySelector('.dropdown-content').classList.toggle('show');
        });
    });

    loadContent('overview');
    loadVisitorCount();
});

function loadContent(content) {
    document.querySelectorAll('.dashboard-panels > .panel').forEach(panel => {
        panel.style.display = 'none';
    });

    document.getElementById(`panel-${content}`).style.display = 'block';

    var sectionTitle = content.replace(/([A-Z])/g, ' $1').trim();
    sectionTitle = sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1);
    document.querySelector('.dashboard-header h1').innerText = sectionTitle;

    if (content != 'overview') {
        isOverview = 0;
    }
    if (content === 'overview') {
        isOverview = 1;
        loadUsers();
        loadVolunteers();
        loadPartners();
    } else if (content === 'users') {
        loadUsers();
    } else if (content === 'volunteerApplication') {
        loadVolunteers();
    } else if (content === 'partnerApplication') {
        loadPartners();
    } else if (content === 'getInTouch') { 
        loadGetInTouch();
    }
}

function loadVisitorCount() {
    fetch('/getVisitorCount')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch visitor count');
            }
            return response.json();
        })
        .then(data => {
            visitorCounts = data.data;
            displayVisitorCount();
        })
        .catch(error => {
            console.error('Error loading visitor count:', error);
        });
}

function loadUsers() {
    fetch('/allUsers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return response.json();
        })
        .then(data => {
            users = data.data;
            displayUserList();
        })
        .catch(error => {
            console.error('Error loading users:', error);
        });
}

function loadVolunteers() {
    fetch('/allVolunteers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch volunteers');
            }
            return response.json();
        })
        .then(data => {
            volunteerApplications = data.data;
            displayVolunteerApplications();
        })
        .catch(error => {
            console.error('Error loading volunteers:', error);
        });
}

function loadPartners() {
    fetch('/allPartners')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch partners');
            }
            return response.json();
        })
        .then(data => {
            partnerApplications = data.data;
            displayPartnerApplications();
        })
        .catch(error => {
            console.error('Error loading partners:', error);
        });
}

function loadGetInTouch() {
    fetch('/allGetInTouch')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch get in touch');
            }
            return response.json();
        })
        .then(data => {
            getInTouchMessages = data.data;
            displayGetInTouchMessages();
        })
        .catch(error => {
            console.error('Error loading get in touch:', error);
        });
}

function displayVisitorCount() {
    const websiteVisits = document.getElementById('website-visits');
    websiteVisits.innerHTML = '';

    visitorCounts.forEach(function(visitorCount) {
        const visitCount = document.createElement('td');
        visitCount.textContent = visitorCount.Count;
        websiteVisits.appendChild(visitCount);
    });
}

function displayUserList() {
    if (isOverview == 0) {
        var userList = document.getElementById('user-list');
    } else if (isOverview == 1) {
        var userList = document.getElementById('users-summary-graph');
    }
    userList.innerHTML = '';

    users.forEach(function(user) {
        const listItem = document.createElement('tr');
        listItem.classList.add('user-item');

        const nameCell = document.createElement('td');
        nameCell.textContent = user.FirstName + ' ' + user.LastName;
        listItem.appendChild(nameCell);

        if (isOverview == 0) {
            const idNumberCell = document.createElement('td');
            idNumberCell.textContent = user.UserID;
            listItem.appendChild(idNumberCell);

            const emailCell = document.createElement('td');
            emailCell.textContent = user.Email;
            listItem.appendChild(emailCell);

            const phoneCell = document.createElement('td');
            phoneCell.textContent = user.Phone;
            listItem.appendChild(phoneCell);

            const addressCell = document.createElement('td');
            addressCell.textContent = user.Address;
            listItem.appendChild(addressCell);

            const roleCell = document.createElement('td');
            roleCell.textContent = user.Role;
            listItem.appendChild(roleCell);

            const statusCell = document.createElement('td');
            const statusSpan = document.createElement('span');
            statusSpan.classList.add(user.Status ? 'online' : 'offline');
            statusSpan.textContent = user.Status ? 'Online' : 'Offline';
            statusCell.appendChild(statusSpan);
            listItem.appendChild(statusCell);
        }
        userList.appendChild(listItem);
    });
}

function displayVolunteerApplications() {
    if (isOverview == 0) {
        var volunteerTable = document.getElementById('volunteer-applications');
    } else if (isOverview == 1) {
        var volunteerTable = document.getElementById('volunteer-applications-summary-graph');
    }
    volunteerTable.innerHTML = '';

    volunteerApplications.forEach(application => {
        const row = document.createElement('tr');
        
        const fullNameCell = document.createElement('td');
        fullNameCell.textContent = application.FullName;
        row.appendChild(fullNameCell);

        if (isOverview == 0) {
            const emailCell = document.createElement('td');
            emailCell.textContent = application.Email;
            row.appendChild(emailCell);

            const phoneCell = document.createElement('td');
            phoneCell.textContent = application.Phone;
            row.appendChild(phoneCell);

            const skillsCell = document.createElement('td');
            skillsCell.textContent = application.Skills;
            row.appendChild(skillsCell);

            const eventDate = new Date(application.Availability);
            const options = { month: 'long', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            const formattedDate = eventDate.toLocaleString('en-US', options);

            const availabilityCell = document.createElement('td');
            availabilityCell.textContent = formattedDate;
            row.appendChild(availabilityCell);

            const previousExperienceCell = document.createElement('td');
            previousExperienceCell.textContent = application.PreviousExperience;
            row.appendChild(previousExperienceCell);

            const whyVolunteerCell = document.createElement('td');
            whyVolunteerCell.textContent = application.WhyVolunteer;
            row.appendChild(whyVolunteerCell);

            const actionsCell = document.createElement('td');
            
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';
            approveButton.onclick = () => approveVolunteer(application.VolunteerID, row, application.Email);
            actionsCell.appendChild(approveButton);

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.onclick = () => rejectVolunteer(application.VolunteerID, row, application.Email);
            actionsCell.appendChild(rejectButton);

            row.appendChild(actionsCell);
        }
        volunteerTable.appendChild(row);
    });
}

function displayPartnerApplications() {
    if (isOverview == 0) {
        var partnerTable = document.getElementById('partner-applications');
    } else if (isOverview == 1) {
        var partnerTable = document.getElementById('partner-applications-summary-graph');
    }
    partnerTable.innerHTML = ''; 

    partnerApplications.forEach(application => {
        const row = document.createElement('tr');
        
        const orgNameCell = document.createElement('td');
        orgNameCell.textContent = application.OrgName;
        row.appendChild(orgNameCell);

        if (isOverview == 0) {
            const contactPersonCell = document.createElement('td');
            contactPersonCell.textContent = application.ContactPerson;
            row.appendChild(contactPersonCell);

            const emailCell = document.createElement('td');
            emailCell.textContent = application.Email;
            row.appendChild(emailCell);

            const phoneCell = document.createElement('td');
            phoneCell.textContent = application.Phone;
            row.appendChild(phoneCell);

            const projectCell = document.createElement('td');
            projectCell.textContent = application.Project;
            row.appendChild(projectCell);

            const orgDescriptionCell = document.createElement('td');
            orgDescriptionCell.textContent = application.OrgDescription;
            row.appendChild(orgDescriptionCell);

            const actionsCell = document.createElement('td');
            
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';
            approveButton.onclick = () => approvePartner(application.PartnerID, row, application.Email);
            actionsCell.appendChild(approveButton);

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.onclick = () => rejectPartner(application.PartnerID, row, application.Email);
            actionsCell.appendChild(rejectButton);

            row.appendChild(actionsCell);
        }
        partnerTable.appendChild(row);
    });
}

function displayGetInTouchMessages() {
    const messagesTable = document.getElementById('get-in-touch-messages');
    messagesTable.innerHTML = '';

    getInTouchMessages.forEach(message => {
        const row = document.createElement('tr');
        
        const fullNameCell = document.createElement('td');
        fullNameCell.textContent = message.FullName;
        row.appendChild(fullNameCell);

        const emailCell = document.createElement('td');
        emailCell.textContent = message.Email;
        row.appendChild(emailCell);

        const phoneCell = document.createElement('td');
        phoneCell.textContent = message.Phone;
        row.appendChild(phoneCell);

        const subjectCell = document.createElement('td');
        subjectCell.textContent = message.Subject;
        row.appendChild(subjectCell);

        const messageCell = document.createElement('td');
        messageCell.textContent = message.Message;
        row.appendChild(messageCell);

        messagesTable.appendChild(row);
    });
}

function approveVolunteer(volunteerId, row, email) {
    fetch(`/approveVolunteer/${volunteerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to approve volunteer');
        }
        return response.json();
    })
    .then(data => {
        row.remove();
        console.log(`Volunteer application for ${email} approved.`);
    })
    .catch(error => {
        console.error('Error approving volunteer:', error);
    });
}

function rejectVolunteer(volunteerId, row, email) {
    fetch(`/deleteVolunteer/${volunteerId}`, {
        method: 'DELETE',
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete volunteer');
        }
        return response.json();
    })
    .then(data => {
        row.remove();
        console.log(`Volunteer application for ${email} rejected.`);
    })
    .catch(error => {
        console.error('Error deleting volunteer:', error);
    });
}

function approvePartner(volunteerId, row, email) {
    fetch(`/approvePartner/${volunteerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to approve partner');
        }
        return response.json();
    })
    .then(data => {
        row.remove();
        console.log(`Partner application for ${email} approved.`);
    })
    .catch(error => {
        console.error('Error approving partner:', error);
    });
}

function rejectPartner(partnerId, row, email) {
    fetch(`/deletePartner/${partnerId}`, {
        method: 'DELETE',
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete partner');
        }
        return response.json();
    })
    .then(data => {
        row.remove();
        console.log(`Partner application for ${email} rejected.`);
    })
    .catch(error => {
        console.error('Error deleting partner:', error);
    });
}
