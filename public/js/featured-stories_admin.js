let currentAlbumImages = [];
let currentImageIndex = 0;
let selectedFile = null;
let albumCounter = 0;
const albumsPerRow = 4;
let albumsInFirstRow = 0;
let stories = [];

document.addEventListener('DOMContentLoaded', () => {
    displayCurrentDateTime();
    setupImageUploadPreview();
    loadStories();
});

function displayCurrentDateTime() {
    const datetimeElement = document.getElementById('datetime');
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    datetimeElement.textContent = now.toLocaleDateString('en-US', options);
}

function setupImageUploadPreview() {
    const albumImagesInput = document.getElementById('albumImages');
    albumImagesInput.addEventListener('change', handleFileSelect);
}

function openCreateStoryModal() {
    document.getElementById('createAlbumModal').style.display = 'block';
}

function closeCreateStoryModal() {
    document.getElementById('createAlbumModal').style.display = 'none';
}

function openEditStoryModal() {
    document.getElementById('editAlbumModal').style.display = 'block';
}

function closeEditStoryModal() {
    document.getElementById('editAlbumModal').style.display = 'none';
}

function createStory() {
    const storyTitle = document.getElementById('albumTitle').value;
    const storyCaption = document.getElementById('albumCaption').value;
    const storyAuthor = document.getElementById('albumAuthor').value;
    const storyRole = document.getElementById('albumRole').value;
    const storyHighlights = document.getElementById('albumHighlights').value;
    const storyCategory = document.getElementById('albumCategory').value;

    const story = {
        title: storyTitle,
        description: storyCaption,
        author: storyAuthor,
        role: storyRole,
        highlights: storyHighlights,
        category: storyCategory,
        images: []
    };

    const formData = new FormData();
    formData.append('image', selectedFile);

    fetch('/uploadImage', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to upload image');
        }
        return response.json();
    })
    .then(data => {
        story.images.push(data.imagePath);
        return fetch('/addStory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(story)
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save story');
        }
        return response.json();
    })
    .then(data => {
        closeCreateStoryModal();
        document.getElementById('createAlbumForm').reset();
        document.getElementById('albumPreviewContainer').innerHTML = '';
        selectedFile = null; 
    })
    .catch(error => {
        console.error('Error saving story:', error);
    });
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
            stories = data.stories;
            stories.forEach(story => {
                displayStory(story);
            });
        })
        .catch(error => {
            console.error('Error loading stories:', error);
        });
}

function displayStory(story) {
    const photoGallery = document.getElementById('photoGallery');
    const storyElement = document.createElement('div');
    storyElement.classList.add('album');
    storyElement.id = `story-${story.StoryID}`;

    const titleElement = document.createElement('h3');
    titleElement.textContent = story.StoryTitle;
    storyElement.appendChild(titleElement);

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = story.Description;
    storyElement.appendChild(descriptionElement);

    const authorElement = document.createElement('p');
    authorElement.textContent = `Author: ${story.Author}`;
    storyElement.appendChild(authorElement);

    const roleElement = document.createElement('p');
    roleElement.textContent = `Author's Role: ${story.AuthorRole}`;
    storyElement.appendChild(roleElement);

    const highlightsElement = document.createElement('p');
    highlightsElement.textContent = `Story Highlights: ${story.StoryHighlights}`;
    storyElement.appendChild(highlightsElement);

    const categoryElement = document.createElement('p');
    categoryElement.textContent = `Category: ${story.Category}`;
    storyElement.appendChild(categoryElement);

    story.images.forEach(imagePath => {
        const imageElement = document.createElement('img');
        imageElement.src = imagePath;
        imageElement.alt = 'Story Image';
        imageElement.style.width = '100px';
        imageElement.style.height = '100px';
        imageElement.classList.add('album-image');
        imageElement.onclick = () => viewFullSize(`${imagePath}`);
        storyElement.appendChild(imageElement);
    });

    const storyActions = document.createElement('div');
    storyActions.classList.add('album-actions');

    const deleteButton = document.createElement('button');
    deleteButton.addEventListener('click', () => deleteStory(story.StoryID));
    const deleteImage = document.createElement('img');
    deleteImage.src = 'images/delete.png';
    deleteImage.alt = 'Delete';
    deleteImage.style.width = '20px';
    deleteImage.style.height = '20px';
    deleteImage.title = 'Delete';
    deleteButton.appendChild(deleteImage);
    storyActions.appendChild(deleteButton);

    const editButton = document.createElement('button');
    editButton.addEventListener('click', () => editStory(story.StoryID));
    const editImage = document.createElement('img');
    editImage.src = 'images/edit.png';
    editImage.alt = 'Edit';
    editImage.style.width = '20px';
    editImage.style.height = '20px';
    editImage.title = 'Edit';
    editButton.appendChild(editImage);
    storyActions.appendChild(editButton);

    storyElement.appendChild(storyActions);
    photoGallery.appendChild(storyElement);
}

function adjustAlbumLayout() {
    const photoGallery = document.getElementById('photoGallery');
    const albums = photoGallery.querySelectorAll('.album');
    const albumsInCurrentRow = albumsInFirstRow;


    if (albumsInCurrentRow === albumsPerRow) {
        const br = document.createElement('br');
        br.classList.add('album-row-break');
        photoGallery.appendChild(br);
        albumsInFirstRow = 0;
    }
}

function deleteStory(storyId) {
    fetch(`/deleteStory/${storyId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete story');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const storyElement = document.getElementById(`story-${storyId}`);
            storyElement.remove();
        } else {
            console.error('Error deleting story:', data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting story:', error);
    });
}

const originalStoryDetails = {};

function editStory(storyId) {
    const story = stories.find(story => story.StoryID === storyId);

    if (!story) {
        console.error(`Story with ID ${storyId} not found`);
        return;
    }

    openEditStoryModal();

    document.getElementById('editAlbumTitle').value = story.StoryTitle;
    document.getElementById('editAlbumCaption').value = story.Description;
    document.getElementById('editAlbumAuthor').value = story.Author;
    document.getElementById('editAlbumRole').value = story.AuthorRole;
    document.getElementById('editAlbumHighlights').value = story.StoryHighlights;
    document.getElementById('editAlbumCategory').value = story.Category;

    const saveButton = document.querySelector('#editAlbumModal .submit-button');
    saveButton.addEventListener('click', () => saveStory(storyId));
}

function saveStory(storyId) {
    const editedStory = {
        title: document.getElementById('editAlbumTitle').value,
        description: document.getElementById('editAlbumCaption').value,
        author: document.getElementById('editAlbumAuthor').value,
        authorRole: document.getElementById('editAlbumRole').value,
        highlights: document.getElementById('editAlbumHighlights').value,
        category: document.getElementById('editAlbumCategory').value
    };

    fetch(`/editStory/${storyId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedStory),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save edited story');
        }
        return response.json();
    })
    .then(data => {
        closeEditStoryModal();
    })
    .catch(error => {
        console.error('Error saving edited story:', error);
    });
}

function viewFullSize(imageSrc) {
    const fullSizeOverlay = document.getElementById('fullSizeOverlay');
    const fullSizeImage = document.getElementById('fullSizeImage');
    fullSizeImage.src = imageSrc;
    fullSizeOverlay.style.display = 'block';
}

function closeFullSize() {
    document.getElementById('fullSizeOverlay').style.display = 'none';
}

function handleFileSelect(event) {
    const file = event.target.files[0]; 
    console.log('Selected File:', file); 

    const previewContainer = document.getElementById('albumPreviewContainer');
    previewContainer.innerHTML = ''; 

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'photo-preview-item';

            const image = new Image();
            image.src = e.target.result;
            image.className = 'preview-image';
            
            const removeButton = document.createElement('span');
            removeButton.innerHTML = '&times;';
            removeButton.className = 'remove-image';
            removeButton.addEventListener('click', function () {
                imageContainer.remove();
                selectedFile = null; 
                document.getElementById('albumImages').value = ''; 
            });

            imageContainer.appendChild(image);
            imageContainer.appendChild(removeButton);

            previewContainer.appendChild(imageContainer);

            selectedFile = file;
        };

        reader.readAsDataURL(file);
    }
}
