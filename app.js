const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const routes = require('./src/router');
const initData = require('./src/initData');
require('dotenv').config();

const debug = process.env.DEBUG;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) return next();

    if (!req.session.lastAccess) {
        req.session.lastAccess = Date.now();
    } else {
        const now = Date.now();
        const sessionAge = now - req.session.lastAccess;
        const timeout = 1 * 10 * 1000;

        if (sessionAge > timeout) {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error destroying session:", err);
                    return next();
                }
                res.clearCookie('connect.sid');
                return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
            });
            return;
        }
        req.session.lastAccess = now;
    }
    next();
});

// app.use('/User', (req, res, next) => {
//     if (req.session && req.session.isLoggedIn) {
//         next();
//     } else {
//         res.status(401).send('401 Unauthorized');
//     }
// });

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home-default.html'));
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(routes);
initData();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
