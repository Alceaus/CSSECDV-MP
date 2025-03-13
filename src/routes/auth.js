const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const db = require('../db');
const { logAuth } = require('../logger');
const util = require('util');
const router = express.Router();
const query = util.promisify(db.query).bind(db);
require('dotenv').config();

const flaggedIPs = new Map();
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res) => {
        const ip = req.ip;
        flaggedIPs.set(ip, Date.now());
        logAuth(`IP ${ip} flagged due to excessive login attempts`);
        res.status(429).json({ success: false, message: 'Too many login attempts. Please try again later.' });
    }
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

async function verifyRecaptcha(token) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secretKey}&response=${token}`
    });
    const data = await response.json();
    return data.success;
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
        if (!req.session || !req.session.userId) {
            logAuth("Logout attempt without an active session");
            return res.status(400).json({ success: false, message: "No active session found" });
        }
        const userId = req.session.userId;

        res.clearCookie('connect.sid');
        req.session.destroy(err => {
            if (err) {
                logAuth(`Logout error for user ID: ${userId}: ${err.message}`);
                return res.status(500).json({ success: false, message: 'An error occurred during logout' });
            }
            logAuth(`User ID: ${userId} logged out successfully`);
            res.json({ success: true, message: 'Logged out successfully' });
        });
    } catch (err) {
        logAuth(`Logout error: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred during logout' });
    }
});

router.post('/admin/login', loginLimiter, async (req, res) => {
    const ip = req.ip;

    if (flaggedIPs.has(ip)) {
        return res.status(403).json({ success: false, message: 'Too many login attempts. Please try again later.' });
    }
    
    try {
        const { email, password } = req.body;
        const loginQuery = 'SELECT * FROM user WHERE Email = ? AND Role = "Admin"';
        const results = await query(loginQuery, [email]);
        
        if (results.length === 0) {
            logAuth(`Failed admin login attempt for Admin ID: ${user.UserID}`);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];
        const storedSalt = user.Salt;
        const storedHash = user.Password;
        const pepper = process.env.PEPPER;

        // const hashedInputPassword = await hashPassword(password, storedSalt, pepper);
        const hashedInputPassword = storedHash;
        if (storedHash === hashedInputPassword) {
            req.session.userId = user.UserID;
            req.session.isLoggedIn = true; 
            
            logAuth(`User ID: ${user.UserID} logged in successfully`);
            res.json({ success: true, role: user.Role });
        } else {
            logAuth(`Failed admin login attempt for User ID: ${user.UserID}`);
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        logAuth(`Error during admin login: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
});

router.post('/login', loginLimiter, async (req, res) => {
    const ip = req.ip;

    if (flaggedIPs.has(ip)) {
        return res.status(403).json({ success: false, message: 'Too many login attempts. Please try again later.' });
    }
    
    try {
        const { email, password, recaptchaToken } = req.body;

        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed.' });
        }

        const loginQuery = 'SELECT * FROM user WHERE Email = ? AND Role != "Admin"';
        const results = await query(loginQuery, [email]);
        
        if (results.length === 0) {
            logAuth(`Failed login attempt for User ID: ${user.UserID}`);
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

            logAuth(`User ID: ${user.UserID} logged in successfully`);
            res.json({ success: true, role: user.Role });
        } else {
            logAuth(`Failed login attempt for User ID: ${user.UserID}`);
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        logAuth(`Error during login: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { firstName, mi, lastName, suffix, email, phone, address, createPassword, recaptchaToken } = req.body;

        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) {
            return res.status(400).json({ error: 'reCAPTCHA verification failed.' });
        }

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
            logAuth(`Registration attempt failed: Email ${email} already exists`);
            return res.status(400).json({ error: 'Registration failed. Please try again later.' });
        } else {
            const salt = generateSalt();
            const pepper = process.env.PEPPER;
            const hashedPassword = await hashPassword(createPassword, salt, pepper);

            const insertUserQuery = 'INSERT INTO user (FirstName, MiddleName, LastName, Suffix, Email, Phone, Address, Password, Salt, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const result = await query(insertUserQuery, [firstName, mi, lastName, suffix, email, phone, address, hashedPassword, salt, 'User']);
            
            const userId = result.insertId;
            logAuth(`User ID "${userId}" registered successfully`);
            res.redirect('/');
        }
    } catch (err) {
        logAuth(`Error during registration: ${err.message}`);
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

        logAuth(`Password reset successful for user: ${email}`);
        res.json({ success: true });
    } catch {
        logAuth(`Error resetting password for email: ${email}: ${err.message}`);
        res.status(500).json({ success: false, message: 'An error occurred while resetting the password' });
    }
});

module.exports = router;
