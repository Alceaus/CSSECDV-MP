let visitorCounts = [];
let isOverview = 1;
let users = [];
let admin = [];
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
        loadAdmins();
        loadVolunteers();
        loadPartners();
    } else if (content === 'users') {
        loadUsers();
    } else if (content === 'admin') {
        loadAdmins();
    } else if (content === 'volunteerApplication') {
        loadVolunteers();
    } else if (content === 'partnerApplication') {
        loadPartners();
    } else if (content === 'getInTouch') { 
        loadGetInTouch();
    }
}

function loadVisitorCount() {
    fetch('/visitorCount/getVisitorCount')
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
    fetch('/users/allUsers')
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

function loadAdmins() {
    fetch('/users/allAdmin')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch admin');
            }
            return response.json();
        })
        .then(data => {
            admin = data.data;
            displayAdminList();
        })
        .catch(error => {
            console.error('Error loading admin:', error);
        });
}

function loadVolunteers() {
    fetch('/volunteers/allVolunteers')
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
    fetch('/partners/allPartners')
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
    fetch('/getInTouch/allGetInTouch')
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

            const actionsCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete Account';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => deleteUser(user.UserID, listItem));
            actionsCell.appendChild(deleteButton);
            listItem.appendChild(actionsCell);
        }
        userList.appendChild(listItem);
    });
}

function deleteUser(userId, listItem) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    fetch(`/users/deleteUser/${userId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('User deleted successfully');
                listItem.remove();
            } else {
                alert('Failed to delete user: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error deleting user: ' + error.message);
        });
}

function displayAdminList() {
    if (isOverview == 0) {
        var adminList = document.getElementById('admin-list');
    } else if (isOverview == 1) {
        var adminList = document.getElementById('admin-summary-graph');
    }
    adminList.innerHTML = '';

    admin.forEach(function(admin) {
        const listItem = document.createElement('tr');
        listItem.classList.add('admin-item');

        const emailCell = document.createElement('td');
        emailCell.textContent = admin.Email;
        listItem.appendChild(emailCell);

        if (isOverview == 0) {
            const idNumberCell = document.createElement('td');
            idNumberCell.textContent = admin.UserID;
            listItem.appendChild(idNumberCell);
        }
        adminList.appendChild(listItem);
    });
}

function displayVolunteerApplications() {
    const volunteerTable = document.getElementById('volunteer-applications');
    const approvedTable = document.getElementById('approved-volunteers');
    
    // Clear the current content
    volunteerTable.innerHTML = '';
    approvedTable.innerHTML = '';
    
    // Separate volunteers by status
    const pendingVolunteers = volunteerApplications.filter(app => app.Status !== 'Approved');
    const approvedVolunteers = volunteerApplications.filter(app => app.Status === 'Approved');
    
    // Display pending volunteers
    if (pendingVolunteers.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.textContent = 'No pending volunteer applications';
        emptyCell.colSpan = 8;
        emptyRow.appendChild(emptyCell);
        volunteerTable.appendChild(emptyRow);
    } else {
        pendingVolunteers.forEach(application => {
            const row = document.createElement('tr');
            
            const fullNameCell = document.createElement('td');
            fullNameCell.textContent = application.FullName;
            row.appendChild(fullNameCell);

            const emailCell = document.createElement('td');
            emailCell.textContent = application.Email;
            row.appendChild(emailCell);

            const phoneCell = document.createElement('td');
            phoneCell.textContent = application.Phone;
            row.appendChild(phoneCell);

            const skillsCell = document.createElement('td');
            skillsCell.textContent = application.Skills;
            row.appendChild(skillsCell);

            // Handle potential null availability
            let formattedDate = 'Not specified';
            if (application.Availability) {
                try {
                    const eventDate = new Date(application.Availability);
                    const options = { month: 'long', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
                    formattedDate = eventDate.toLocaleString('en-US', options);
                } catch (e) {
                    console.error('Error formatting date:', e);
                }
            }

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
            approveButton.classList.add('approve-btn');
            approveButton.onclick = () => approveVolunteer(application.VolunteerID, row, application.Email);
            actionsCell.appendChild(approveButton);

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.classList.add('reject-btn');
            rejectButton.onclick = () => rejectVolunteer(application.VolunteerID, row, application.Email);
            actionsCell.appendChild(rejectButton);

            row.appendChild(actionsCell);
            volunteerTable.appendChild(row);
        });
    }
    
    // Display approved volunteers
    if (approvedVolunteers.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.textContent = 'No approved volunteers';
        emptyCell.colSpan = 7;
        emptyRow.appendChild(emptyCell);
        approvedTable.appendChild(emptyRow);
    } else {
        approvedVolunteers.forEach(application => {
            const row = document.createElement('tr');
            
            const fullNameCell = document.createElement('td');
            fullNameCell.textContent = application.FullName;
            row.appendChild(fullNameCell);

            const emailCell = document.createElement('td');
            emailCell.textContent = application.Email;
            row.appendChild(emailCell);

            const phoneCell = document.createElement('td');
            phoneCell.textContent = application.Phone;
            row.appendChild(phoneCell);

            const skillsCell = document.createElement('td');
            skillsCell.textContent = application.Skills;
            row.appendChild(skillsCell);

            // Handle potential null availability
            let formattedDate = 'Not specified';
            if (application.Availability) {
                try {
                    const eventDate = new Date(application.Availability);
                    const options = { month: 'long', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
                    formattedDate = eventDate.toLocaleString('en-US', options);
                } catch (e) {
                    console.error('Error formatting date:', e);
                }
            }

            const availabilityCell = document.createElement('td');
            availabilityCell.textContent = formattedDate;
            row.appendChild(availabilityCell);

            const previousExperienceCell = document.createElement('td');
            previousExperienceCell.textContent = application.PreviousExperience;
            row.appendChild(previousExperienceCell);

            const whyVolunteerCell = document.createElement('td');
            whyVolunteerCell.textContent = application.WhyVolunteer;
            row.appendChild(whyVolunteerCell);

            approvedTable.appendChild(row);
        });
    }
}

function displayPartnerApplications() {
    const partnerTable = document.getElementById('partner-applications');
    const approvedTable = document.getElementById('approved-partners');
    
    // Clear the current content
    partnerTable.innerHTML = '';
    approvedTable.innerHTML = '';
    
    // Separate partners by status
    const pendingPartners = partnerApplications.filter(app => app.Status !== 'Approved');
    const approvedPartners = partnerApplications.filter(app => app.Status === 'Approved');
    
    // Display pending partners
    if (pendingPartners.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.textContent = 'No pending partner applications';
        emptyCell.colSpan = 7;
        emptyRow.appendChild(emptyCell);
        partnerTable.appendChild(emptyRow);
    } else {
        pendingPartners.forEach(application => {
            const row = document.createElement('tr');
            
            const orgNameCell = document.createElement('td');
            orgNameCell.textContent = application.OrgName;
            row.appendChild(orgNameCell);

            const contactPersonCell = document.createElement('td');
            contactPersonCell.textContent = application.ContactPerson;
            row.appendChild(contactPersonCell);

            const phoneCell = document.createElement('td');
            phoneCell.textContent = application.Phone;
            row.appendChild(phoneCell);

            const emailCell = document.createElement('td');
            emailCell.textContent = application.Email;
            row.appendChild(emailCell);

            const projectCell = document.createElement('td');
            projectCell.textContent = application.Project;
            row.appendChild(projectCell);

            const orgDescriptionCell = document.createElement('td');
            orgDescriptionCell.textContent = application.OrgDescription;
            row.appendChild(orgDescriptionCell);

            const actionsCell = document.createElement('td');
            
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';
            approveButton.classList.add('approve-btn');
            approveButton.onclick = () => approvePartner(application.PartnerID, row, application.Email);
            actionsCell.appendChild(approveButton);

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.classList.add('reject-btn');
            rejectButton.onclick = () => rejectPartner(application.PartnerID, row, application.Email);
            actionsCell.appendChild(rejectButton);

            row.appendChild(actionsCell);
            partnerTable.appendChild(row);
        });
    }
    
    // Display approved partners
    if (approvedPartners.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.textContent = 'No approved partners';
        emptyCell.colSpan = 6;
        emptyRow.appendChild(emptyCell);
        approvedTable.appendChild(emptyRow);
    } else {
        approvedPartners.forEach(application => {
            const row = document.createElement('tr');
            
            const orgNameCell = document.createElement('td');
            orgNameCell.textContent = application.OrgName;
            row.appendChild(orgNameCell);

            const contactPersonCell = document.createElement('td');
            contactPersonCell.textContent = application.ContactPerson;
            row.appendChild(contactPersonCell);

            const phoneCell = document.createElement('td');
            phoneCell.textContent = application.Phone;
            row.appendChild(phoneCell);

            const emailCell = document.createElement('td');
            emailCell.textContent = application.Email;
            row.appendChild(emailCell);

            const projectCell = document.createElement('td');
            projectCell.textContent = application.Project;
            row.appendChild(projectCell);

            const orgDescriptionCell = document.createElement('td');
            orgDescriptionCell.textContent = application.OrgDescription;
            row.appendChild(orgDescriptionCell);

            approvedTable.appendChild(row);
        });
    }
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
    fetch(`/volunteers/approveVolunteer/${volunteerId}`, {
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
        // Instead of removing the row, reload all volunteers to update both tables
        loadVolunteers();
        console.log(`Volunteer application for ${email} approved.`);
    })
    .catch(error => {
        console.error('Error approving volunteer:', error);
    });
}

function rejectVolunteer(volunteerId, row, email) {
    fetch(`/volunteers/deleteVolunteer/${volunteerId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })  // Make sure email is properly formatted as an object
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to delete volunteer: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        row.remove();
        console.log(`Volunteer application for ${email} rejected.`);
    })
    .catch(error => {
        console.error('Error deleting volunteer:', error);
        alert('Failed to reject volunteer. Please try again.');  // Add user feedback
    });
}

function approvePartner(partnerId, row, email) {
    fetch(`/partners/approvePartner/${partnerId}`, {
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
        // Instead of removing the row, reload all partners to update both tables
        loadPartners();
        console.log(`Partner application for ${email} approved.`);
    })
    .catch(error => {
        console.error('Error approving partner:', error);
    });
}

function rejectPartner(partnerId, row, email) {
    fetch(`/partners/deletePartner/${partnerId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
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
