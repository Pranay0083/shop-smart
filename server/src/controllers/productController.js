const productService = require('../services/productService');

const add = async (req, res) => {
  const product = await productService.addProduct(req.body);
  res.status(201).json({
    success: true,
    data: product,
  });
};

const remove = async (req, res) => {
  // Can accept ID from body or query based on requirements.
  // Requirements don't specify URL params like /remove/:id, so assuming query or body.
  const id = req.query.id || req.body.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: 'Product ID required' });
  }

  const result = await productService.removeProduct(id);
  res.status(200).json({
    success: true,
    message: result.message,
  });
};

const single = async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: 'Product ID required' });
  }

  const product = await productService.getSingleProduct(id);
  res.status(200).json({
    success: true,
    data: product,
  });
};

const list = async (req, res) => {
  const products = await productService.listProducts();
  res.status(200).json({
    success: true,
    data: products,
  });
};

module.exports = {
  add,
  remove,
  single,
  list,
};
