const express = require('express');
const db = require('../db');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);

router.get('/getVisitorCount', async (req, res) => {
    try {
        const countQuery = 'SELECT Count FROM visitor_count WHERE VisitorID = 1';
        const results = await query(countQuery);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching visitor count:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the visitor count' });
    }
});

router.put('/addVisitorCount', async (req, res) => {
    try {
        const addCountQuery = 'UPDATE visitor_count SET Count = Count + 1 WHERE VisitorID = 1';
        await query(addCountQuery);
        res.json({ success: true });
    } catch (err) {
        console.error('Error adding visitor count:', err);
        res.status(500).json({ success: false, message: 'An error occurred while adding the visitor count' });
    }
});

module.exports = router;
