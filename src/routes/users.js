const express = require('express');
const db = require('../db');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);

router.get('/allUsers', async (req, res) => {
    try {
        const userQuery = 'SELECT * FROM user WHERE Role != ?';
        const results = await query(userQuery, ['Admin']);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the users' });
    }
});

module.exports = router;
