const express = require('express');
const db = require('../db');
const { logAdmin } = require('../logger');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);

router.get('/allGetInTouch', async (req, res) => {
    try {
        const getInTouchQuery = 'SELECT * FROM get_in_touch';
        const results = await query(getInTouchQuery);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching get in touch:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching get in touch' });
    }
});

router.post('/addGetInTouch', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const insertGetInTouchQuery = 'INSERT INTO get_in_touch (FullName, Email, Phone, Subject, Message) VALUES (?, ?, ?, ?, ?)';
        await query(insertGetInTouchQuery, [name, email, phone, subject, message]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error adding get in touch:', err);
        res.status(500).json({ success: false, message: 'An error occurred while adding get in touch' });
    }
});

module.exports = router;
