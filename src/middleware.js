const db = require('./db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

async function isAdmin(req, res, next) {
    if (req.session && req.session.isLoggedIn && req.session.userId) {
        try {
            const getUserRoleQuery = 'SELECT Role FROM user WHERE UserID = ?';
            const results = await query(getUserRoleQuery, [req.session.userId]);
            
            if (results.length > 0 && results[0].Role === 'Admin') {
                next();
            } else {
                res.status(403).send('403 Forbidden');
            }
        } catch (err) {
            res.status(500).send('500 Internal Server Error');
        }
    } else {
        res.status(401).send('401 Unauthorized');
    }
}

function sessionTimeout(req, res, next) {
    const userTimeoutPaths = ['/Contact-us_user.html', '/features-stories_user.html', '/Feedback.html', '/Founders.html',
                              '/get-in-touch.html', '/Mission_Vision_Purpose.html', '/multimedia-resources.html', '/My_Account.html',
                              '/Our_Journey.html', '/partner-with-us.html', '/User.html', '/volunteer-with-us.html'];

    const exemptedAdminPaths = ['/login_admin.html', '/forgot-password_admin.html', '/TermsOfUse_admin.html'];
    const isUserPath = userTimeoutPaths.includes(req.path);
    const isAdminPath = req.path.endsWith('_admin.html') && !exemptedAdminPaths.includes(req.path);
    const timeoutDuration = 30 * 60 * 1000;

    if (req.session && req.session.isLoggedIn && (isUserPath || isAdminPath)) {
        if (!req.session.lastAccess) {
            req.session.lastAccess = Date.now();
        } else {
            const now = Date.now();
            const sessionAge = now - req.session.lastAccess;

            if (sessionAge > timeoutDuration) {
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                        return next();
                    }
                    res.clearCookie('connect.sid');
                    return res.status(401).send('Session expired. Please log in again.');
                });
                return;
            }
            req.session.lastAccess = now;
        }
    }
    next();
}

module.exports = { isAdmin, sessionTimeout };
