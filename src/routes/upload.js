const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const fileUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/uploadFile', fileUpload.single('file'), async (req, res) => {
    try {
        const { fileTypeFromBuffer } = await import('file-type');
        const type = await fileTypeFromBuffer(req.file.buffer);
        const validImageTypes = [
            'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'heif', 'heic', 'avif'
        ];

        if (!type || !validImageTypes.includes(type.ext)) {
            return res.status(400).send('Please upload a valid image file.');
        }
        res.send(`File accepted as ${type.ext}`);
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).send('Server error. Please try again.');
    }
});

router.post('/uploadImage', upload.single('image'), async (req, res) => {
    try {
        const imagePath = req.file.path;
        res.json({ success: true, imagePath });
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ success: false, message: 'An error occurred while uploading image' });
    }
});

module.exports = router;
