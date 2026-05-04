const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');
const generateToken = require('../utils/generateToken');

const registerUser = async (name, email, password) => {
  if (!name || !email || !password) {
    throw new ApiError(400, 'Please add all fields');
  }

  // Check if user exists
  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  if (user) {
    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user.id),
    };
  } else {
    throw new ApiError(400, 'Invalid user data');
  }
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new ApiError(400, 'Please add all fields');
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user.id),
    };
  } else {
    throw new ApiError(401, 'Invalid credentials');
  }
};

const getAdmins = async () => {
  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
  return admins;
};

const createAddress = async (userId, addressData) => {
  const { street, city, state, zip, country } = addressData;
  if (!street || !city || !state || !zip || !country) {
    throw new ApiError(400, 'Please provide street, city, state, zip, and country');
  }

  const address = await prisma.address.create({
    data: {
      userId,
      street,
      city,
      state,
      zip,
      country,
    },
  });

  return address;
};

module.exports = {
  registerUser,
  loginUser,
  getAdmins,
  createAddress,
};
