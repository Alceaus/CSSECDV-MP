const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const routes = require('./src/router');
const initData = require('./src/initData');
const { isAdmin, sessionTimeout } = require('./src/middleware');
require('dotenv').config();
const https = require('https');
const db = require('./src/db');
const { body, validationResult } = require('express-validator'); 

const debug = process.env.DEBUG;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        const newPath = req.path.slice(0, -5);
        res.redirect(301, newPath);
    } else {
        next();
    }
});

app.use((req, res, next) => {
    const extname = path.extname(req.path);
    if (!extname) {
        const newPath = path.join(__dirname, 'public', `${req.path}.html`);
        if (fs.existsSync(newPath)) {
            req.url += '.html';
        }
    }
    next();
});

app.use('/User', (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
        next();
    } else {
        res.status(401).send('401 Unauthorized');
    }
});

app.use((req, res, next) => {
    try {
        const exemptedAdminPaths = ['/login_admin.html', '/forgot-password_admin.html', '/TermsOfUse_admin.html'];

        if (req.path.endsWith('admin.html')) {
            if (exemptedAdminPaths.includes(req.path)) {
                return next();
            }
            return isAdmin(req, res, next);
        }
        next();
    } catch (err) {
        next(err);
    }
});

app.post('/api/save-inputs', [
    body('textInput').trim().notEmpty().withMessage('Feedback text is required'),
    body('numericInput1').isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
    body('numericInput2').isInt({ min: 1, max: 100 }).withMessage('Satisfaction score must be between 1 and 100')], 
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation error', errors: errors.array()});
        }

        const { textInput, numericInput1, numericInput2 } = req.body;
        
        const query = `
            INSERT INTO feedback (text_input, numeric_input1, numeric_input2)
            VALUES (?, ?, ?)`;

        db.query(query, [textInput, numericInput1, numericInput2], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        message: 'Error saving to database',
                        error: err.message
                    });
                }
    
                res.status(200).json({ 
                    message: 'Feedback saved successfully',
                    id: result.insertId 
                });
            });
    
        } catch (err) {
            console.error('Server error:', err);
            res.status(500).json({
                message: 'Internal server error',
                error: err.message
            });
        }
    });

app.get('/api/get-inputs', async (req, res, next) => {
    try {
        const query = `
            SELECT * FROM feedback 
            ORDER BY created_at DESC
            LIMIT 100
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    message: 'Error retrieving feedback',
                    error: err.message
                });
            }
            res.status(200).json(results);
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({
            message: 'Internal server error',
            error: err.message
        });
    }
});

app.get('/', async (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'home-default.html'));
    } catch (err) {
        next(err);
    }
});

app.use(sessionTimeout);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(routes);
initData();



app.use((err, req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();

    console.error(err);

    
    if (debug === 'true') {
        res.status(err.status || 500).json({
            error: {
                message: err.message,
                stack: err.stack,
                details: err
            }
        });
    } else {
        const genericMessage = 'An error occurred while processing your request.';
        res.status(err.status || 500).json({
            error: {
                message: genericMessage
            }
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});