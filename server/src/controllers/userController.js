const userService = require('../services/userService');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const result = await userService.registerUser(name, email, password);
  res.status(201).json({
    success: true,
    data: result,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await userService.loginUser(email, password);
  res.status(200).json({
    success: true,
    data: result,
  });
};

const getAdmin = async (req, res) => {
  const admins = await userService.getAdmins();
  res.status(200).json({
    success: true,
    data: admins,
  });
};

const createAddress = async (req, res) => {
  const userId = req.user.id;
  const address = await userService.createAddress(userId, req.body);
  res.status(201).json({
    success: true,
    data: address,
  });
};

module.exports = {
  register,
  login,
  getAdmin,
  createAddress,
};
