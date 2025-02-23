const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);
require('dotenv').config();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

function generateSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
}

function hashPassword(password, salt, pepper) {
    return new Promise((resolve, reject) => {
      const passwordWithSaltAndPepper = password + salt + pepper;
      crypto.scrypt(passwordWithSaltAndPepper, salt, 64, (err, derivedKey) => {
            if (err) {
                reject(err);
            } else {
                resolve(derivedKey.toString('hex'));
            }
        });
    });
}

router.get('/checkLogin', (req, res) => {
    if (req.session.isLoggedIn) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});

router.get('/logout', async (req, res) => {
    try {
        res.clearCookie('connect.sid');
        req.session.destroy(err => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ success: false, message: 'An error occurred during logout' });
            }
            console.log("User logged out");
            res.json({ success: true, message: 'Logged out successfully' });
        });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ success: false, message: 'An error occurred during logout' });
    }
});

router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const loginQuery = 'SELECT * FROM user WHERE Email = ? AND Role = "Admin"';
        const results = await query(loginQuery, [email]);
        
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];
        const storedSalt = user.Salt;
        const storedHash = user.Password;
        const pepper = process.env.PEPPER;

        const hashedInputPassword = await hashPassword(password, storedSalt, pepper);
        if (storedHash === hashedInputPassword) {
            req.session.userId = user.UserID;
            req.session.isLoggedIn = true; 
            
            console.log(`Admin "${user.Email}" has logged in`); 
            res.json({ success: true, role: user.Role });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
});

router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const loginQuery = 'SELECT * FROM user WHERE Email = ? AND Role != "Admin"';
        const results = await query(loginQuery, [email]);
        
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];
        const storedSalt = user.Salt;
        const storedHash = user.Password;
        const pepper = process.env.PEPPER;

        const hashedInputPassword = await hashPassword(password, storedSalt, pepper);
        if (storedHash === hashedInputPassword) {
            req.session.userId = user.UserID;
            req.session.isLoggedIn = true;
            req.session.lastAccess = Date.now();

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

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        const phonePattern = /^[0-9]{10,15}$/;
        if (!phonePattern.test(phone)) {
            return res.status(400).json({ error: 'Enter a valid phone number (10-15 digits).' });
        }
        
        const checkEmailQuery = 'SELECT * FROM user WHERE Email = ?';
        const results = await query(checkEmailQuery, [email]);
        
        if (results.length > 0) {
            return res.status(400).json({ error: 'Email already exists. Please use a different email address.' });
        } else {
            const salt = generateSalt();
            const pepper = process.env.PEPPER;
            const hashedPassword = await hashPassword(createPassword, salt, pepper);

            const insertUserQuery = 'INSERT INTO user (FirstName, MiddleName, LastName, Suffix, Email, Phone, Address, Password, Salt, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            await query(insertUserQuery, [firstName, mi, lastName, suffix, email, phone, address, hashedPassword, salt, 'User']);
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

router.put('/resetPassword', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const salt = generateSalt();
        const pepper = process.env.PEPPER;
        const hashedPassword = await hashPassword(newPassword, salt, pepper);

        const resetPasswordQuery = 'UPDATE user SET Password = ?, Salt = ? WHERE Email = ?';
        await query(resetPasswordQuery, [hashedPassword, salt, email]);

        res.json({ success: true });
    } catch {
        console.error('Error resetting password:', err);
        res.status(500).json({ success: false, message: 'An error occurred while resetting the password' });
    }
});

module.exports = router;
