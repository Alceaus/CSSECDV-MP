const express = require('express');
const db = require('../db');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);

router.get('/getContact', async (req, res) => {
    try {
        const contactQuery = 'SELECT * FROM contact LIMIT 1';
        const contactRows = await query(contactQuery);

        if (contactRows.length === 0) {
            return res.json({ contact: null });
        }

        const contact = contactRows[0];
        const businessHoursQuery = 'SELECT * FROM business_hours WHERE ContactID = ?';
        const scheduleRows = await query(businessHoursQuery, [contact.ContactID]);

        res.json({ contact, businessHours: scheduleRows });
    } catch (err) {
        console.error('Error fetching contact:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the contact' });
    }
});

router.post('/addContact', async (req, res) => {
    try {
        const { address, number, network, email, images, schedule } = req.body;

        const checkContactQuery = 'SELECT ContactID FROM contact LIMIT 1';
        const rows = await query(checkContactQuery);
        let contactId, params;

        if (rows.length > 0) {
            contactId = rows[0].ContactID;
            let updateContactQuery = 'UPDATE contact SET Address = ?, Phone = ?, Network = ?, Email = ?';
            
            if (images.length > 0) {
                params = [address, number, network, email, images, contactId];
                updateContactQuery += ', ImagePath = ?';
            }
            else params = [address, number, network, email, contactId];
            updateContactQuery += ' WHERE ContactID = ?';

            await query(updateContactQuery, params);
            const deleteBusinessHoursQuery = 'DELETE FROM business_hours WHERE ContactID = ?';
            await query(deleteBusinessHoursQuery, [contactId]);
        } else {
            let insertContactQuery = 'INSERT INTO contact (Address, Phone, Network, Email';

            if (images.length > 0) {
                params = [address, number, network, email, images];
                insertContactQuery += ', ImagePath) VALUES (?, ?, ?, ?, ?)';
            }
            else {
                params = [address, number, network, email];
                insertContactQuery += ') VALUES (?, ?, ?, ?)';
            }

            const result  = await query(insertContactQuery, params);
            contactId = result.insertId;
        }
        const insertBusinessHoursQuery = 'INSERT INTO business_hours (ContactID, Day, StartTime, EndTime) VALUES (?, ?, ?, ?)';
        const businessHoursPromises = schedule.day.map((day, index) => {
            const startTime = schedule.start[index];
            const endTime = schedule.end[index];
            return query(insertBusinessHoursQuery, [contactId, day, startTime, endTime]);
        });
        await Promise.all(businessHoursPromises);

        res.json({ success: true });
    } catch (err) {
        console.error('Error adding contact:', err);
        res.status(500).json({ success: false, message: 'An error occurred while adding the contact' });
    }
});

module.exports = router;
