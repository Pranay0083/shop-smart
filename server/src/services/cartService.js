const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

const getCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
  }

  return cart;
};

const addToCart = async (userId, productId, quantity = 1) => {
  if (!productId) throw new ApiError(400, 'Product ID is required');

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, 'Product not found');

  // Get or Create cart
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + parseInt(quantity) },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: parseInt(quantity),
      },
    });
  }

  return getCart(userId);
};

const updateCartItem = async (userId, productId, quantity) => {
  if (!productId || quantity === undefined)
    throw new ApiError(400, 'Product ID and quantity are required');

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new ApiError(404, 'Cart not found');

  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
  });

  if (!item) throw new ApiError(404, 'Item not found in cart');

  if (parseInt(quantity) <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: parseInt(quantity) },
    });
  }

  return getCart(userId);
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
};
