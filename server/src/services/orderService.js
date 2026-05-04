const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

const placeOrder = async (userId, addressId) => {
  if (!addressId) throw new ApiError(400, 'Address ID is required');

  // Verify address belongs to user
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    throw new ApiError(404, 'Valid address not found for user');
  }

  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  let totalAmount = 0;
  const orderItemsData = cart.items.map((item) => {
    const itemTotal = item.quantity * item.product.price;
    totalAmount += itemTotal;
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
    };
  });

  // Create order with items and payment inside a transaction
  const order = await prisma.$transaction(async (tx) => {
    // 1. Create order
    const createdOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        orderStatus: 'Processing',
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            method: 'COD',
            status: 'Pending',
          },
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    // 2. Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return createdOrder;
  });

  return order;
};

const getUserOrders = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return orders;
};

const listAllOrders = async () => {
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } },
      payment: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return orders;
};

const updateOrderStatus = async (orderId, status) => {
  if (!orderId || !status)
    throw new ApiError(400, 'Order ID and status are required');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) throw new ApiError(404, 'Order not found');

  // If delivered, update payment to completed for COD
  let paymentUpdate = {};
  if (
    status === 'Delivered' &&
    order.payment &&
    order.payment.method === 'COD'
  ) {
    paymentUpdate = {
      update: { status: 'Completed' },
    };
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      orderStatus: status,
      ...(Object.keys(paymentUpdate).length && { payment: paymentUpdate }),
    },
    include: {
      payment: true,
    },
  });

  return updatedOrder;
};

module.exports = {
  placeOrder,
  getUserOrders,
  listAllOrders,
  updateOrderStatus,
};
