const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Note: Exact routes provided in requirements
router.post('/add', protect, adminOnly, productController.add);
router.delete('/remove', protect, adminOnly, productController.remove);
router.get('/single', productController.single);
router.get('/list', productController.list);

module.exports = router;
