const express = require('express');
const db = require('../db');
const { logAdmin } = require('../logger');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);

router.get('/allVolunteers', async (req, res) => {
    try {
        // Fetch all volunteers instead of filtering out approved ones
        const volunteerQuery = 'SELECT * FROM volunteer';
        const results = await query(volunteerQuery);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching volunteers:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the volunteers' });
    }
});

router.post('/addVolunteer', async (req, res) => {
    try {
        const { name, email, phone, skills, availability, experience, reason } = req.body;

        const insertVolunteerQuery = 'INSERT INTO volunteer (FullName, Email, Phone, Skills, Availability, PreviousExperience, WhyVolunteer, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await query(insertVolunteerQuery, [name, email, phone, skills, availability, experience, reason, 'Pending']);

        res.json({ success: true });
    } catch (err) {
        console.error('Error adding volunteer:', err);
        res.status(500).json({ success: false, message: 'An error occurred while adding the volunteer' });
    }
});

router.put('/approveVolunteer/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        const updateVolunteerQuery = 'UPDATE volunteer SET Status = ? WHERE VolunteerID = ?';
        await query(updateVolunteerQuery, ['Approved', id]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Volunteer Application Approved',
            text: 'Congratulations! Your volunteer application has been approved. We look forward to working with you.'
        };

        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.error('Error sending email:', error);
        //         res.status(500).json({ success: false, message: 'Volunteer approved, but an error occurred while sending the email' });
        //     } else {
        //         console.log('Email sent:', info.response);
        //         res.json({ success: true, message: 'Volunteer approved and email sent' });
        //     }
        // });
    } catch (err) {
        console.error('Error approving volunteer:', err);
        res.status(500).json({ success: false, message: 'An error occurred while approving the volunteer' });
    }
});

router.delete('/deleteVolunteer/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        const deleteVolunteerQuery = 'DELETE FROM volunteer WHERE VolunteerID = ?';
        await query(deleteVolunteerQuery, [id]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Volunteer Application Rejected',
            text: 'Thank you for your interest in volunteering with us. After careful consideration, we regret to inform you that your volunteer application has not been approved at this time.'
        };

        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.error('Error sending email:', error);
        //         res.status(500).json({ success: false, message: 'Volunteer deleted, but an error occurred while sending the email' });
        //     } else {
        //         console.log('Email sent:', info.response);
        //         res.json({ success: true, message: 'Volunteer deleted and email sent' });
        //     }
        // });
    } catch (err) {
        console.error('Error deleting volunteer:', err);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the volunteer' });
    }
});

module.exports = router;
