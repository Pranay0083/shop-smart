const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected & Admin routes
router.get('/admin', protect, adminOnly, userController.getAdmin);

// Protected routes
router.post('/address', protect, userController.createAddress);

module.exports = router;
