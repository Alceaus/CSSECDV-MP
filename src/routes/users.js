const express = require('express');
const db = require('../db');
const { logAdmin } = require('../logger');
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

router.get('/allAdmin', async (req, res) => {
    try {
        const adminQuery = 'SELECT * FROM user WHERE Role = ?';
        const results = await query(adminQuery, ['Admin']);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching admin:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the admin' });
    }
});

router.delete('/deleteUser/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.session.userId;

        const deleteAdminQuery = 'DELETE FROM user WHERE UserID = ? AND Role != ?';
        await query(deleteAdminQuery, [id, 'Admin']);

        logAdmin(`Admin User ID: ${adminId} deleted user ID: ${id}`);
        res.json({ success: true });
    } catch (err) {
        logAdmin(`Error deleting user: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the user' });
    }
});

module.exports = router;
