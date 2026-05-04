const orderService = require('../services/orderService');

const place = async (req, res) => {
  const userId = req.user.id;
  const { addressId } = req.body;
  const order = await orderService.placeOrder(userId, addressId);
  res.status(201).json({
    success: true,
    data: order,
  });
};

const userOrders = async (req, res) => {
  const userId = req.user.id;
  const orders = await orderService.getUserOrders(userId);
  res.status(200).json({
    success: true,
    data: orders,
  });
};

const list = async (req, res) => {
  const orders = await orderService.listAllOrders();
  res.status(200).json({
    success: true,
    data: orders,
  });
};

const status = async (req, res) => {
  const { orderId, status } = req.body;
  const updatedOrder = await orderService.updateOrderStatus(orderId, status);
  res.status(200).json({
    success: true,
    data: updatedOrder,
  });
};

module.exports = {
  place,
  userOrders,
  list,
  status,
};
