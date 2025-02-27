const express = require('express');
const db = require('../db');
const { logAdmin } = require('../logger');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);

router.get('/allStories', async (req, res) => {
    try {
        const storiesQuery = 'SELECT * FROM story';
        const stories = await query(storiesQuery);

        stories.forEach(story => {
            story.images = [story.ImagePath];
        });

        res.json({ success: true, stories: stories });
    } catch (err) {
        console.error('Error fetching stories:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the stories' });
    }
});

router.post('/addStory', async (req, res) => {
    try {
        const { title, description, author, role, highlights, category, images } = req.body;
        const userId = req.session.userId;

        const insertStoryQuery = 'INSERT INTO story (StoryTitle, Description, Author, AuthorRole, StoryHighlights, Category, ImagePath) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await query(insertStoryQuery, [title, description, author, role, highlights, category, images]);

        logAdmin(`Admin User ID: ${user.UserID} added a new story: "${title}"`);
        res.json({ success: true });
    } catch (err) {
        logAdmin(`Error adding story: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred while adding the story' });
    }
});

router.put('/editStory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, author, authorRole, highlights, category } = req.body;
        const userId = req.session.userId;

        const updateStoryQuery = 'UPDATE story SET StoryTitle = ?, Description = ?, Author = ?, AuthorRole = ?, StoryHighlights = ?, Category = ? WHERE StoryID = ?';
        await query(updateStoryQuery, [title, description, author, authorRole, highlights, category, id]);

        logAdmin(`Admin User ID: ${userId} updated story ID: ${id} - Title: "${title}"`);
        res.json({ success: true });
    } catch (err) {
        logAdmin(`Error editing story: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred while editing the story' });
    }
});

router.delete('/deleteStory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const deleteStoryQuery = 'DELETE FROM story WHERE StoryID = ?';
        await query(deleteStoryQuery, [id]);

        logAdmin(`Admin User ID: ${userId} deleted story ID: ${id}`);
        res.json({ success: true });
    } catch (err) {
        logAdmin(`Error deleting story: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the story' });
    }
});

module.exports = router;
