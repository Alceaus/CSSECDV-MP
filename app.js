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
    const exemptedAdminPaths = ['/login_admin.html', '/forgot-password_admin.html', '/TermsOfUse_admin.html'];

    if (req.path.endsWith('admin.html')) {
        if (exemptedAdminPaths.includes(req.path)) {
            return next();
        }
        return isAdmin(req, res, next);
    }
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home-default.html'));
});

app.use(sessionTimeout);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(routes);
initData();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});