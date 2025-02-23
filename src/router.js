const express = require('express');
const router = express.Router();

const albumRoutes = require('./routes/albums');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const getInTouchRoutes = require('./routes/get_in_touch');
const partnerRoutes = require('./routes/partners');
const qaRoutes = require('./routes/qa');
const storyRoutes = require('./routes/stories');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./routes/users');
const visitorCountRoutes = require('./routes/visitor_count');
const volunteerRoutes = require('./routes/volunteers');

router.use('/albums', albumRoutes);
router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);
router.use('/getInTouch', getInTouchRoutes);
router.use('/partners', partnerRoutes);
router.use('/qa', qaRoutes);
router.use('/stories', storyRoutes);
router.use('/upload', uploadRoutes);
router.use('/users', userRoutes);
router.use('/visitorCount', visitorCountRoutes);
router.use('/volunteers', volunteerRoutes);

module.exports = router;
