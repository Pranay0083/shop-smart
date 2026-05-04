const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All cart routes require auth

router.get('/get', cartController.get);
router.post('/add', cartController.add);
router.put('/update', cartController.update);

module.exports = router;
