let currentAlbumImages = [];
let currentImageIndex = 0;
let selectedFiles = [];
let albumCounter = 0;
const albumsPerRow = 4;
let albumsInFirstRow = 0;
let album = [];

document.addEventListener('DOMContentLoaded', () => {
    displayCurrentDateTime();
    populateYearOptions();
    setupImageUploadPreview();
});


function displayCurrentDateTime() {
    const datetimeElement = document.getElementById('datetime');
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    datetimeElement.textContent = now.toLocaleDateString('en-US', options);
}

function populateYearOptions() {
    const yearSelect = document.getElementById('albumYear');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2017; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
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

function createAlbum() {
    const albumTitle = document.getElementById('albumTitle').value;
    const albumCaption = document.getElementById('albumCaption').value;
    const albumYear = document.getElementById('albumYear').value;
    const albumCategory = document.getElementById('albumCategory').value;

    const album = {
        title: albumTitle,
        caption: albumCaption,
        year: albumYear,
        category: albumCategory,
        images: [],
        fileCount: selectedFiles.length 
    };

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            album.images.push(event.target.result);

            if (album.images.length === selectedFiles.length) {
                displayAlbum(album);
                closeCreateAlbumModal();
                document.getElementById('createAlbumForm').reset();
                document.getElementById('albumPreviewContainer').innerHTML = '';
                selectedFiles = [];
            }
        };
        reader.readAsDataURL(file);
    });
}


function displayAlbum(album) {
    const photoGallery = document.getElementById('photoGallery');

    const albumElement = document.createElement('div');
    albumElement.classList.add('album');
    const albumId = `album-${albumCounter++}`; 
    albumElement.id = albumId;

    albumElement.innerHTML = `
        <h3>${album.title}</h3>
        <p><strong>Caption:</strong> ${album.caption}</p>
        <p><strong>Year:</strong> ${album.year}</p>
        <p><strong>Category:</strong> ${album.category}</p>
        <p><strong>File Count:</strong> ${album.fileCount}</p> <!-- Add file count -->
        <div class="photo-container">
            ${album.images.map((src) => `<img src="${src}" onclick="viewFullSize('${src}')">`).join('')}
        </div>
        <div class="album-actions">
            <button onclick="deleteAlbum('${albumId}')">
                <img src="delete.png" alt="Delete" style="width: 15px; height= 15px;" title="Delete">
            </button>
            <button onclick="editAlbum('${albumId}')">
                <img src="edit.png" alt="Edit" style="width: 15px; height: 15px;" title="Edit">
            </button>
        </div>
    `;

    photoGallery.appendChild(albumElement);

    const albums = photoGallery.querySelectorAll('.album');
    const albumsInRow = albums.length % albumsPerRow;

    if (albumsInRow === 0 && albums.length !== 0) {
        const br = document.createElement('br');
        br.classList.add('album-row-break');
        photoGallery.appendChild(br); 
    }

    if (albumsInRow !== 0 && albumsInRow !== albumsPerRow - 1) {
        albumElement.style.marginRight = '10px';
    }
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
    console.log('Deleting album:', albumId);

    const albumElement = document.getElementById(albumId);
    if (albumElement) {
        albumElement.remove();
    }

    fetch(`/api/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete album');
        }
   
    })
    .catch(error => {
        console.error('Error deleting album:', error);
        
    });
}

const originalAlbumDetails = {};

function editAlbum(albumId) {
    const albumElement = document.getElementById(albumId);
    if (!albumElement) return;

    const titleElement = albumElement.querySelector('h3');
    const captionElement = albumElement.querySelector('p:nth-of-type(1)');
    const yearElement = albumElement.querySelector('p:nth-of-type(2)');
    const categoryElement = albumElement.querySelector('p:nth-of-type(3)');

    const title = titleElement.textContent.replace('Album Title:', '').trim();
    const caption = captionElement.textContent.replace('Caption:', '').trim();
    const year = yearElement.textContent.replace('Year:', '').trim();
    const category = categoryElement.textContent.replace('Category:', '').trim();

    originalAlbumDetails[albumId] = {
        title: titleElement.innerHTML,
        caption: captionElement.innerHTML,
        year: yearElement.innerHTML,
        category: categoryElement.innerHTML
    };
s
    titleElement.innerHTML = `<label for="editTitle-${albumId}"><strong>Album Title:</strong></label>
                                <input type="text" id="editTitle-${albumId}" value="${title}" required>`;
    yearElement.innerHTML = `<label for="editYear-${albumId}"><strong>Year:</strong></label>
                                <input type="number" id="editYear-${albumId}" value="${year}" required>`;
    categoryElement.innerHTML = `<label for="editCategory-${albumId}"><strong>Category:</strong></label>
                                    <select id="editCategory-${albumId}" required>
                                        <option value="Educational">Educational</option>
                                        <option value="Community Outreach">Community Outreach</option>
                                        <option value="Advocacy">Advocacy</option>
                                        <option value="Volunteer Engagement">Volunteer Engagement</option>
                                    </select>`;
    captionElement.innerHTML = `<label for="editCaption-${albumId}"><strong>Description:</strong></label>
                                <textarea id="editCaption-${albumId}" rows="4" required>${caption}</textarea>`;

    const categorySelect = document.getElementById(`editCategory-${albumId}`);
    categorySelect.value = category;

    const albumActions = albumElement.querySelector('.album-actions');
    albumActions.innerHTML = `
        <button class="action-button bold-button" onclick="saveAlbum('${albumId}')">Update</button>
        <button class="action-button bold-button" onclick="cancelEdit('${albumId}')">Cancel</button>`;
}

function cancelEdit(albumId) {
    const albumElement = document.getElementById(albumId);
    if (!albumElement) return;

    const originalDetails = originalAlbumDetails[albumId];
    if (!originalDetails) return;

    const titleElement = albumElement.querySelector('h3');
    const captionElement = albumElement.querySelector('p:nth-of-type(1)');
    const yearElement = albumElement.querySelector('p:nth-of-type(2)');
    const categoryElement = albumElement.querySelector('p:nth-of-type(3)');

    titleElement.innerHTML = originalDetails.title;
    captionElement.innerHTML = originalDetails.caption;
    yearElement.innerHTML = originalDetails.year;
    categoryElement.innerHTML = originalDetails.category;

    const albumActions = albumElement.querySelector('.album-actions');
    albumActions.innerHTML = `
        <button onclick="deleteAlbum('${albumId}')">
            <img src="delete.png" alt="Delete" style="width: 15px; height: 15px;" title="Delete">
        </button>
        <button onclick="editAlbum('${albumId}')">
            <img src="edit.png" alt="Edit" style="width: 15px; height: 15px;" title="Edit">
        </button>`;

    delete originalAlbumDetails[albumId];
}

function saveAlbum(albumId) {

    const editedTitle = document.getElementById(`editTitle-${albumId}`).value;
    const editedCaption = document.getElementById(`editCaption-${albumId}`).value;
    const editedYear = document.getElementById(`editYear-${albumId}`).value;
    const editedCategory = document.getElementById(`editCategory-${albumId}`).value;

    const albumElement = document.getElementById(albumId);
    albumElement.querySelector('h3').innerHTML = `<strong>Album Title:</strong> ${editedTitle}`;
    albumElement.querySelector('p:nth-of-type(1)').innerHTML = `<strong>Caption:</strong> ${editedCaption}`;
    albumElement.querySelector('p:nth-of-type(2)').innerHTML = `<strong>Year:</strong> ${editedYear}`;
    albumElement.querySelector('p:nth-of-type(3)').innerHTML = `<strong>Category:</strong> ${editedCategory}`;

    const albumActions = albumElement.querySelector('.album-actions');
    albumActions.innerHTML = `
        <button onclick="deleteAlbum('${albumId}')">
            <img src="delete.png" alt="Delete" style="width: 15px; height: 15px; margin-top:15px" title="Delete">
        </button>
        <button onclick="editAlbum('${albumId}')">
            <img src="edit.png" alt="Edit" style="width: 15px; height: 15px; margin-top:15px" title="Edit">
        </button>`;


    delete originalAlbumDetails[albumId];
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


