const express = require('express');
const db = require('../db');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);

router.get('/allQA', async (req, res) => {
    try {
        const qaQuery = 'SELECT * FROM qa';
        const results = await query(qaQuery);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching Q&A:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the Q&A' });
    }
});

router.post('/addQA', async (req, res) => {
    try {
        const { question, answer } = req.body;
        
        if (!question || !answer) {
            return res.status(400).json({ success: false, message: 'Question and answer are required' });
        }

        const insertQAQuery = 'INSERT INTO qa (Question, Answer) VALUES (?, ?)';
        await query(insertQAQuery, [question, answer]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error adding Q&A:', err);
        res.status(500).json({ success: false, message: 'An error occurred while adding the Q&A' });
    }
});

router.put('/editQA/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        
        if (!question || !answer) {
            return res.status(400).json({ success: false, message: 'Question and answer are required' });
        }

        const updateQAQuery = 'UPDATE qa SET Question = ?, Answer = ? WHERE qaID = ?';
        await query(updateQAQuery, [question, answer, id]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error editing Q&A:', err);
        res.status(500).json({ success: false, message: 'An error occurred while editing the Q&A' });
    }
});

router.delete('/deleteQA/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQAQuery = 'DELETE FROM qa WHERE qaID = ?';
        await query(deleteQAQuery, [id]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting Q&A:', err);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the Q&A' });
    }
});

module.exports = router;
