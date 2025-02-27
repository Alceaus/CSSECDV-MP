const express = require('express');
const db = require('../db');
const { logAdmin } = require('../logger');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);

router.get('/allAlbums', async (req, res) => {
    try {
        const albumsQuery = 'SELECT * FROM album';
        const albums = await query(albumsQuery);

        const albumsWithImages = await Promise.all(albums.map(async album => {
            const imagesQuery = 'SELECT ImagePath FROM album_images WHERE AlbumID = ?';
            const images = await query(imagesQuery, [album.AlbumID]);
            album.images = images.map(image => image.ImagePath);
            return album;
        }));

        res.json({ success: true, albums: albumsWithImages });
    } catch (err) {
        console.error('Error fetching albums:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the albums' });
    }
});

router.post('/addAlbum', async (req, res) => {
    try {
        const { title, description, year, category, images } = req.body;

        const insertAlbumQuery = 'INSERT INTO album (AlbumTitle, Description, Year, Category) VALUES (?, ?, ?, ?)';
        const result = await query(insertAlbumQuery, [title, description, year, category]);
        const albumId = result.insertId;
        const userId = req.session.userId;

        if (images && images.length > 0) {
            const insertImageQuery = 'INSERT INTO album_images (AlbumID, ImagePath) VALUES (?, ?)';
            const insertPromises = images.map(imagePath => query(insertImageQuery, [albumId, imagePath]));
            await Promise.all(insertPromises);
        }

        logAdmin(`Admin User ID: ${userId} added a new album: "${title}" (ID: ${albumId})`);
        res.json({ success: true, albumId });
    } catch (err) {
        logAdmin(`Error adding album: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred while adding the album' });
    }
});

router.put('/editAlbum/:id', async (req, res) => {
    try {
        const albumId = req.params.id;
        const { title, description, year, category } = req.body;
        const userId = req.session.userId;

        const updateAlbumQuery = 'UPDATE album SET AlbumTitle = ?, Description = ?, Year = ?, Category = ? WHERE AlbumID = ?';
        await query(updateAlbumQuery, [title, description, year, category, albumId]);

        logAdmin(`Admin User ID: ${userId} updated album ID: ${albumId} - Title: "${title}"`);
        res.json({ success: true });
    } catch (err) {
        logAdmin(`Error updating album: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred while updating the album' });
    }
});

router.delete('/deleteAlbum/:id', async (req, res) => {
    try {
        const albumId = req.params.id;
        const userId = req.session.userId;

        const deleteImagesQuery = 'DELETE FROM album_images WHERE AlbumID = ?';
        await query(deleteImagesQuery, [albumId]);

        const deleteAlbumQuery = 'DELETE FROM album WHERE AlbumID = ?';
        await query(deleteAlbumQuery, [albumId]);

        logAdmin(`Admin User ID: ${userId} deleted album ID: ${albumId}`);
        res.json({ success: true });
    } catch (err) {
        logAdmin(`Error deleting album: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the album' });
    }
});

module.exports = router;
