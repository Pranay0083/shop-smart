const ApiError = require('../utils/apiError');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    next(new ApiError(403, 'Not authorized as an admin'));
  }
};

module.exports = { adminOnly };
