document.addEventListener("DOMContentLoaded", function () {
    // For editing user details
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            // Collect updated user data
            const updatedUser = {
                name: document.getElementById("profile-name")?.textContent.trim(),
                contact: document.getElementById("contact-number")?.value.trim(),
                address: document.getElementById("address")?.value.trim(),
            };

            fetch("/users/editProfile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedUser),
            })
                .then(response => {
                    if (!response.ok) throw new Error("Failed to save user profile");
                    return response.json();
                })
                .then(data => {
                    alert("Profile updated successfully!");
                    console.log("Server response:", data);
                })
                .catch(error => {
                    console.error("Error saving profile:", error);
                    alert("Error saving profile. Please try again.");
                });
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            alert("Changes canceled.");
            window.location.reload();
        });
    }

    // Toggle Edit Mode
    function toggleEditMode(enable) {
        const editableFields = ["profile-name", "contact-number", "address"];

        editableFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.setAttribute("contenteditable", enable);
                el.readOnly = !enable;
            }
        });

        ["edit-buttons-contact"]
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = enable ? "flex" : "none";
            });
    }

    // Tab Navigation
    window.openTab = function (evt, tabName) {
        document.querySelectorAll(".tab-content").forEach(tab => tab.style.display = "none");
        document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));

        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.classList.add("active");
    };

    // Highlight Tab and Toggle Edit Mode
    window.highlightTab = function (evt) {
        document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("active"));
        evt.currentTarget.classList.add("active");

        toggleEditMode(evt.currentTarget.id === "edit-profile-tab");
    };

    // Load Profile and Default Tab
    loadUserDetails();
    document.getElementById("personal-tab")?.click();
});

function loadUserDetails() {
    fetch('/users/allUserDetails')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch user details: ${response.statusText}`);
            }
            return response.json();
        })
        .then(({ success, data }) => {
            if (!success || !data) {
                throw new Error('Invalid data format or empty response');
            }
            const mergedUser = mergeUserData(data);
            displayUserDetails(mergedUser);
        })
        .catch(error => {
            console.error('Error loading user details:', error);
        });
}

// Helper function to merge database data with localStorage extras
function mergeUserData(user) {
    return {
        name: user.FirstName + ' ' + user.LastName,
        id: "ID: " + user.UserID,
        role: "Role: " + user.Role,
        contact: user.Phone || 'Not Provided',
        email: user.Email,
        address: user.Address || 'Not Provided'
    };
}

// Example function to display user details (customize as needed)
function displayUserDetails(user) {
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-id').textContent = user.id;
    document.getElementById('profile-role').textContent = user.role;
    document.getElementById('contact-number').value = user.contact;
    document.getElementById('email-address').value = user.email;
    document.getElementById('address').value = user.address;
}
