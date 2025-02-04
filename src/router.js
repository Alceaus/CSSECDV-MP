const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const util = require('util');
const upload = require('./upload');
const router = express.Router();
const query = util.promisify(db.query).bind(db);
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

router.use('/login', loginLimiter);

router.use((req, res, next) => {
    if (typeof req.session.isLoggedIn === 'undefined') {
        req.session.isLoggedIn = false;
    }
    next();
});

router.get('/logout', async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('An error occurred during logout');
        } else {
            res.json({ success: true, message: 'Logged out successfully' });
        }
    });
});

router.get('/checkLogin', (req, res) => {
    if (req.session.isLoggedIn) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});

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

router.get('/allVolunteers', async (req, res) => {
    try {
        const volunteerQuery = 'SELECT * FROM volunteer WHERE Status != ?';
        const results = await query(volunteerQuery, ['Approved']);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching volunteers:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the volunteers' });
    }
});

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

router.get('/allAlbums', async (req, res) => {
    try {
        const albumsQuery = 'SELECT * FROM album';
        const albums = await query(albumsQuery);

        const albumsWithImages = await Promise.all(albums.map(async album => {
            const imagesQuery = 'SELECT ImagePath FROM album_images WHERE AlbumID = ?';
            const images = await query(imagesQuery, [album.AlbumID]);
            album.images = images.map(image => image.ImagePath);
            return album;
        }));

        res.json({ success: true, albums: albumsWithImages });
    } catch (err) {
        console.error('Error fetching albums:', err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the albums' });
    }
});

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

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const loginQuery = 'SELECT * FROM user WHERE Email = ?';
        const results = await query(loginQuery, [email]);
        
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.Password);
        if (match) {
            req.session.userId = user.UserID;
            req.session.isLoggedIn = true; 
            console.log(`User "${user.Email}" has logged in`); 
            res.json({ success: true, role: user.Role });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { firstName, mi, lastName, suffix, email, phone, address, createPassword } = req.body;
        
        const checkEmailQuery = 'SELECT * FROM user WHERE Email = ?';
        const results = await query(checkEmailQuery, [email]);
        
        if (results.length > 0) {
            return res.status(400).json({ error: 'Email already exists. Please use a different email address.' });
        } else {
            const hashedPassword = await bcrypt.hash(createPassword, 10);
            const insertUserQuery = 'INSERT INTO user (FirstName, MiddleName, LastName, Suffix, Email, Phone, Address, Password, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            await query(insertUserQuery, [firstName, mi, lastName, suffix, email, phone, address, hashedPassword, 'User']);
            res.redirect('/');
        }
    } catch (err) {
        res.status(500).send('An error occurred during registration');
    }
});

router.post('/verifyEmail', async (req, res) => {
    try {
        const { email, uniqueKey } = req.body;

        const verifyEmailQuery = 'SELECT * FROM user WHERE Email = ?';
        const results = await query(verifyEmailQuery, [email]);

        if (results.length === 0) {
            res.status(404).json({ success: false, message: 'Email not found' });
        } else {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Key',
                text: 'Here is the verification key for your password reset request: ' + uniqueKey
            };
    
            // transporter.sendMail(mailOptions, (error, info) => {
            //     if (error) {
            //         console.error('Error sending email:', error);
            //         res.status(500).json({ success: false, message: 'Email verified, but an error occurred while sending the email' });
            //     } else {
            //         console.log('Email sent:', info.response);
            //         res.json({ success: true, message: 'Email verified and email sent' });
            //     }
            // });
        }
    } catch (err) {
        console.error('Error verifying email:', err);
        res.status(500).json({ success: false, message: 'An error occurred while verifying the email' });
    }
});

router.post('/uploadImage', upload.single('image'), async (req, res) => {
    try {
        const imagePath = req.file.path;
        res.json({ success: true, imagePath });
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ success: false, message: 'An error occurred while uploading image' });
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

router.post('/addAlbum', async (req, res) => {
    try {
        const { title, description, year, category, images } = req.body;

        const insertAlbumQuery = 'INSERT INTO album (AlbumTitle, Description, Year, Category) VALUES (?, ?, ?, ?)';
        const result = await query(insertAlbumQuery, [title, description, year, category]);
        const albumId = result.insertId;

        if (images && images.length > 0) {
            const insertImageQuery = 'INSERT INTO album_images (AlbumID, ImagePath) VALUES (?, ?)';
            const insertPromises = images.map(imagePath => query(insertImageQuery, [albumId, imagePath]));
            await Promise.all(insertPromises);
        }

        res.json({ success: true, albumId });
    } catch (err) {
        console.error('Error adding album:', err);
        res.status(500).json({ success: false, message: 'An error occurred while adding the album' });
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

router.put('/resetPassword', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const resetPasswordQuery = 'UPDATE user SET Password = ? WHERE Email = ?';
        await query(resetPasswordQuery, [hashedPassword, email]);

        res.json({ success: true });
    } catch {
        console.error('Error resetting password:', err);
        res.status(500).json({ success: false, message: 'An error occurred while resetting the password' });
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

router.put('/editAlbum/:id', async (req, res) => {
    try {
        const albumId = req.params.id;
        const { title, description, year, category } = req.body;

        const updateAlbumQuery = 'UPDATE album SET AlbumTitle = ?, Description = ?, Year = ?, Category = ? WHERE AlbumID = ?';
        await query(updateAlbumQuery, [title, description, year, category, albumId]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating album:', err);
        res.status(500).json({ success: false, message: 'An error occurred while updating the album' });
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

router.delete('/deleteAlbum/:id', async (req, res) => {
    try {
        const albumId = req.params.id;

        const deleteImagesQuery = 'DELETE FROM album_images WHERE AlbumID = ?';
        await query(deleteImagesQuery, [albumId]);

        const deleteAlbumQuery = 'DELETE FROM album WHERE AlbumID = ?';
        await query(deleteAlbumQuery, [albumId]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting album:', err);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the album' });
    }
});

module.exports = router;
