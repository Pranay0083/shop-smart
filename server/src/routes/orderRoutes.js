const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// User routes
router.post('/place', protect, orderController.place);
router.get('/userorders', protect, orderController.userOrders);

// Admin routes
router.get('/list', protect, adminOnly, orderController.list);
router.put('/status', protect, adminOnly, orderController.status);

module.exports = router;
