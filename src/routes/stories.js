const express = require('express');
const db = require('../db');
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

        const insertStoryQuery = 'INSERT INTO story (StoryTitle, Description, Author, AuthorRole, StoryHighlights, Category, ImagePath) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await query(insertStoryQuery, [title, description, author, role, highlights, category, images]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error adding story:', err);
        res.status(500).json({ success: false, message: 'An error occurred while adding the story' });
    }
});

router.put('/editStory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, author, authorRole, highlights, category } = req.body;

        const updateStoryQuery = 'UPDATE story SET StoryTitle = ?, Description = ?, Author = ?, AuthorRole = ?, StoryHighlights = ?, Category = ? WHERE StoryID = ?';
        await query(updateStoryQuery, [title, description, author, authorRole, highlights, category, id]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error editing story:', err);
        res.status(500).json({ success: false, message: 'An error occurred while editing the story' });
    }
});

router.delete('/deleteStory/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleteStoryQuery = 'DELETE FROM story WHERE StoryID = ?';
        await query(deleteStoryQuery, [id]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting story:', err);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the story' });
    }
});

module.exports = router;
