const express = require('express');
const db = require('../db');
const { logAdmin, logUser } = require('../logger');
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

router.get('/allUserDetails', async (req, res) => {
    try {
        const userId = req.session.userId;
        const userQuery = 'SELECT * FROM user WHERE UserID = ?';
        const results = await query(userQuery, [userId]);
        res.json({ success: true, data: results[0] });
    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the user details' });
    }
});

router.put('/editUser/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone, address } = req.body;
        const userId = req.session.userId;

        const updateStoryQuery = 'UPDATE user SET FirstName = ?, LastName = ?, Phone = ?, Address = ? WHERE UserID = ?';
        await query(updateStoryQuery, [firstName, lastName, phone, address, id]);

        logUser(`User ID: ${userId} updated user profile of user ID: ${id}`);
        res.json({ success: true });
    } catch (err) {
        logUser(`Error editing user: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred while editing the user' });
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
