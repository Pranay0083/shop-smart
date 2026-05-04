const cartService = require('../services/cartService');

const get = async (req, res) => {
  const userId = req.user.id;
  const cart = await cartService.getCart(userId);
  res.status(200).json({
    success: true,
    data: cart,
  });
};

const add = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  const cart = await cartService.addToCart(userId, productId, quantity);
  res.status(200).json({
    success: true,
    data: cart,
  });
};

const update = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  const cart = await cartService.updateCartItem(userId, productId, quantity);
  res.status(200).json({
    success: true,
    data: cart,
  });
};

module.exports = {
  get,
  add,
  update,
};
