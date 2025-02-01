document.addEventListener("DOMContentLoaded", function() {
    loadStories();
    async function checkLoginStatus() {
        try {
            const response = await fetch('/checkLogin');
            const data = await response.json();
            return data.isLoggedIn;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }

    async function updateNavigation() {
        const isLoggedIn = await checkLoginStatus();
        const accountLink = document.getElementById('account-link');

        if (isLoggedIn) {
            accountLink.className = 'dropdown logout';
            accountLink.innerHTML = `
                <a href="#logout" data-arrow>MY ACCOUNT</a>
                <div class="dropdown-content logout-dropdown">
                    <a href="My_Account.html">ACCOUNT SETTINGS</a>
                    <a href="home-default.html" id="logout-link">LOGOUT</a>
                </div>
            `;

            document.getElementById('logout-link').addEventListener('click', async function() {
                await fetch('/logout');
                sessionStorage.removeItem('isLoggedIn');
                window.location.href = 'home-default.html';
            });
        } else {
            accountLink.className = 'dropdown login';
            accountLink.innerHTML = `
                <a href="user-login-register.html" data-arrow>LOGIN / REGISTER</a>
            `;
        }
    }

    updateNavigation();
});

function openModal(story) {
    document.getElementById('modal-author-image').src = story.ImagePath;
    document.getElementById('modal-author-name').textContent = story.Author;
    document.getElementById('modal-author-role').textContent = story.AuthorRole;
    document.getElementById('modal-story-title').textContent = story.StoryTitle;
    document.getElementById('modal-story-content').textContent = story.Description;
    document.getElementById('myModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
}

function loadStories() {
    fetch('/allStories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch stories');
            }
            return response.json();
        })
        .then(data => {
            const stories = data.stories;
            stories.forEach(story => {
                displayStory(story);
            });
        })
        .catch(error => {
            console.error('Error loading stories:', error);
        });
}

function displayStory(story) {
    const storyContainer = document.querySelector('.main-story-container');
    
    const storyElement = document.createElement('div');
    storyElement.className = 'story-container';

    const storyDiv = document.createElement('div');
    storyDiv.className = 'story';

    const storyHeader = document.createElement('div');
    storyHeader.className = 'story-header';

    const authorImageContainer = document.createElement('div');
    authorImageContainer.className = 'author-image-container';

    const authorImage = document.createElement('img');
    authorImage.src = story.ImagePath;
    authorImage.alt = "author's image";
    authorImage.className = 'author-image';
    authorImageContainer.appendChild(authorImage);

    const storyDetails = document.createElement('div');
    storyDetails.className = 'story-details';

    const storyTitle = document.createElement('h2');
    storyTitle.textContent = story.StoryTitle;
    storyDetails.appendChild(storyTitle);

    const storySummary = document.createElement('p');
    storySummary.className = 'summary';
    storySummary.textContent = story.StoryHighlights;
    storyDetails.appendChild(storySummary);

    storyHeader.appendChild(authorImageContainer);
    storyHeader.appendChild(storyDetails);

    const storyFooter = document.createElement('div');
    storyFooter.className = 'story-footer';

    const authorInfo = document.createElement('div');
    authorInfo.className = 'author-info';

    const authorName = document.createElement('p');
    authorName.className = 'author-name';
    authorName.textContent = story.Author;

    const authorRole = document.createElement('p');
    authorRole.className = 'author-role';
    authorRole.textContent = story.AuthorRole;

    const storyCategory = document.createElement('p');
    storyCategory.className = 'category';
    storyCategory.textContent = story.Category;

    authorInfo.appendChild(authorName);
    authorInfo.appendChild(authorRole);
    authorInfo.appendChild(storyCategory);

    const readStoryLink = document.createElement('a');
    readStoryLink.href = '#';
    readStoryLink.className = 'read-story';
    readStoryLink.textContent = "Read author's story";
    readStoryLink.onclick = function () {
        openModal(story);
        return false;
    };

    storyFooter.appendChild(authorInfo);
    storyFooter.appendChild(readStoryLink);

    storyDiv.appendChild(storyHeader);
    storyDiv.appendChild(storyFooter);

    storyElement.appendChild(storyDiv);

    storyContainer.appendChild(storyElement);
}
