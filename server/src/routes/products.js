const express = require('express');
const products = require('../data/products');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      products
    }
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      product
    }
  });
});

module.exports = router;
