const express = require('express');
const db = require('../db');
const { logAdmin } = require('../logger');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);

router.get('/allPartners', async (req, res) => {
    try {
        const partnerQuery = 'SELECT * FROM partner WHERE Status != ?';
        const results = await query(partnerQuery, ['Approved']);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching partners:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the partners' });
    }
});

router.post('/addPartner', async (req, res) => {
    try {
        const { name, contact, email, phone, website, project, description } = req.body;

        const insertPartnerQuery = 'INSERT INTO partner (OrgName, ContactPerson, Email, Phone, Website, Project, OrgDescription, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await query(insertPartnerQuery, [name, contact, email, phone, website, project, description, 'Pending']);

        res.json({ success: true });
    } catch (err) {
        console.error('Error adding partner:', err);
        res.status(500).json({ success: false, message: 'An error occurred while adding the partner' });
    }
});

router.put('/approvePartner/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        const updatePartnerQuery = 'UPDATE partner SET Status = ? WHERE PartnerID = ?';
        await query(updatePartnerQuery, ['Approved', id]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Partner Application Approved',
            text: 'Congratulations! Your partner application has been approved. We look forward to working with you.'
        };

        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.error('Error sending email:', error);
        //         res.status(500).json({ success: false, message: 'Partner approved, but an error occurred while sending the email' });
        //     } else {
        //         console.log('Email sent:', info.response);
        //         res.json({ success: true, message: 'Partner approved and email sent' });
        //     }
        // });
    } catch (err) {
        console.error('Error approving partner:', err);
        res.status(500).json({ success: false, message: 'An error occurred while approving the partner' });
    }
});

router.delete('/deletePartner/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        const deletePartnerQuery = 'DELETE FROM partner WHERE PartnerID = ?';
        await query(deletePartnerQuery, [id]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Partner Application Rejected',
            text: 'Thank you for your interest in partnering with us. After careful consideration, we regret to inform you that your partner application has not been approved at this time.'
        };

        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.error('Error sending email:', error);
        //         res.status(500).json({ success: false, message: 'Partner deleted, but an error occurred while sending the email' });
        //     } else {
        //         console.log('Email sent:', info.response);
        //         res.json({ success: true, message: 'Partner deleted and email sent' });
        //     }
        // });
    } catch (err) {
        console.error('Error deleting partner:', err);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the partner' });
    }
});

module.exports = router;
