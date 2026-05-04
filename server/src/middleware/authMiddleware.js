const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return next(new ApiError(401, 'User no longer exists'));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ApiError(401, 'Not authorized, token failed'));
  }
};

module.exports = { protect };
