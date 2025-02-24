let currentAlbumImages = [];
let currentImageIndex = 0;
let selectedFiles = [];
let albumCounter = 0;
const albumsPerRow = 4;
let albumsInFirstRow = 0;
let albums = [];

document.addEventListener('DOMContentLoaded', () => {
    displayCurrentDateTime();
    populateYearOptions();
    setupImageUploadPreview();
    loadAlbums();
});

function displayCurrentDateTime() {
    const datetimeElement = document.getElementById('datetime');
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    datetimeElement.textContent = now.toLocaleDateString('en-US', options);
}

function populateYearOptions() {
    const yearSelect = document.getElementById('albumYear');
    const editYearSelect = document.getElementById('editAlbumYear');
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 2017; year--) {
        const option1 = document.createElement('option');
        option1.value = year;
        option1.textContent = year;
        yearSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = year;
        option2.textContent = year;
        editYearSelect.appendChild(option2);
    }
}

function setupImageUploadPreview() {
    const albumImagesInput = document.getElementById('albumImages');
    albumImagesInput.addEventListener('change', handleFileSelect);
}

function openCreateAlbumModal() {
    document.getElementById('createAlbumModal').style.display = 'block';
}

function closeCreateAlbumModal() {
    document.getElementById('createAlbumModal').style.display = 'none';
}

function openEditAlbumModal() {
    document.getElementById('editAlbumModal').style.display = 'block';
}

function closeEditAlbumModal() {
    document.getElementById('editAlbumModal').style.display = 'none';
}

function createAlbum() {
    const albumTitle = document.getElementById('albumTitle').value;
    const albumCaption = document.getElementById('albumCaption').value;
    const albumYear = document.getElementById('albumYear').value;
    const albumCategory = document.getElementById('albumCategory').value;

    const album = {
        title: albumTitle,
        description: albumCaption,
        year: albumYear,
        category: albumCategory,
        images: []
    };

    const uploadPromises = selectedFiles.map(file => {
        const formData = new FormData();
        formData.append('image', file);

        return fetch('/upload/uploadImage', {
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
            album.images.push(data.imagePath);
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            throw error;
        });
    });

    Promise.all(uploadPromises)
        .then(() => {
            return fetch('/albums/addAlbum', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(album)
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save album');
            }
            return response.json();
        })
        .then(data => {
            closeCreateAlbumModal();
            document.getElementById('createAlbumForm').reset();
            document.getElementById('albumPreviewContainer').innerHTML = '';
            selectedFiles = [];
        })
        .catch(error => {
            console.error('Error saving album:', error);
        });
}

function loadAlbums() {
    fetch('/albums/allAlbums')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch albums');
            }
            return response.json();
        })
        .then(data => {
            albums = data.albums
            albums.forEach(album => {
                displayAlbum(album);
            });
        })
        .catch(error => {
            console.error('Error loading albums:', error);
        });
}

function displayAlbum(album) {
    const photoGallery = document.getElementById('photoGallery');
    const albumElement = document.createElement('div');
    albumElement.classList.add('album');
    albumElement.id = `album-${album.AlbumID}`;

    const titleElement = document.createElement('h2');
    titleElement.textContent = album.AlbumTitle;
    albumElement.appendChild(titleElement);

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = album.Description;
    albumElement.appendChild(descriptionElement);

    const yearElement = document.createElement('p');
    yearElement.textContent = `Year: ${album.Year}`;
    albumElement.appendChild(yearElement);

    const categoryElement = document.createElement('p');
    categoryElement.textContent = `Category: ${album.Category}`;
    albumElement.appendChild(categoryElement);

    if (album.images && album.images.length > 0) {
        const imagesContainer = document.createElement('div');
        imagesContainer.classList.add('album-images');

        album.images.forEach(imagePath => {
            const imageElement = document.createElement('img');
            imageElement.src = `${imagePath}`;
            imageElement.alt = 'Album Image';
            imageElement.style.width = '100px';
            imageElement.style.height = '100px';
            imageElement.style.margin =  '5px';
            imageElement.classList.add('album-image');
            imageElement.onclick = () => viewFullSize(`${imagePath}`);
            imagesContainer.appendChild(imageElement);
        });

        albumElement.appendChild(imagesContainer);
    }

    const albumActions = document.createElement('div');
    albumActions.classList.add('album-actions');

    const deleteButton = document.createElement('button');
    deleteButton.addEventListener('click', () => deleteAlbum(album.AlbumID));
    const deleteImage = document.createElement('img');
    deleteImage.src = 'images/delete.png';
    deleteImage.alt = 'Delete';
    deleteImage.style.width = '20px';
    deleteImage.style.height = '20px';
    deleteImage.title = 'Delete';
    deleteButton.appendChild(deleteImage);
    albumActions.appendChild(deleteButton);

    const editButton = document.createElement('button');
    editButton.addEventListener('click', () => editAlbum(album.AlbumID));
    const editImage = document.createElement('img');
    editImage.src = 'images/edit.png';
    editImage.alt = 'Edit';
    editImage.style.width = '20px';
    editImage.style.height = '20px';
    editImage.title = 'Edit';
    editButton.appendChild(editImage);
    albumActions.appendChild(editButton);

    albumElement.appendChild(albumActions);
    photoGallery.appendChild(albumElement);
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

function deleteAlbum(albumId) {
    fetch(`/albums/deleteAlbum/${albumId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete album');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const albumElement = document.getElementById(`album-${albumId}`);
            albumElement.remove();
        } else {
            console.error('Error deleting album:', data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting album:', error);
    });
}

const originalAlbumDetails = {};

function editAlbum(albumId) {
    const album = albums.find(album => album.AlbumID === albumId);

    if (!album) {
        console.error(`Album with ID ${albumId} not found`);
        return;
    }

    openEditAlbumModal();

    document.getElementById('editAlbumTitle').value = album.AlbumTitle;
    document.getElementById('editAlbumCaption').value = album.Description;
    document.getElementById('editAlbumYear').value = album.Year;
    document.getElementById('editAlbumCategory').value = album.Category;

    const saveButton = document.querySelector('#editAlbumModal .submit-button');
    saveButton.addEventListener('click', () => saveAlbum(albumId));
}

function saveAlbum(albumId) {
    const editedAlbum = {
        title: document.getElementById('editAlbumTitle').value,
        description: document.getElementById('editAlbumCaption').value,
        year: document.getElementById('editAlbumYear').value,
        category: document.getElementById('editAlbumCategory').value
    };

    fetch(`/albums/editAlbum/${albumId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedAlbum),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save edited album');
        }
        return response.json();
    })
    .then(data => {
        closeEditAlbumModal();
    })
    .catch(error => {
        console.error('Error saving edited album:', error);
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
    const files = Array.from(event.target.files);
    console.log('Selected Files:', files); 
    const previewContainer = document.getElementById('albumPreviewContainer');

    files.forEach(file => {
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
                
                selectedFiles = selectedFiles.filter(f => f !== file);
            });

            imageContainer.appendChild(image);
            imageContainer.appendChild(removeButton);

            previewContainer.appendChild(imageContainer);

            selectedFiles.push(file);
        };

        reader.readAsDataURL(file);
    });
}
