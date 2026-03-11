const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Unauthorized', StatusCodes.UNAUTHORIZED));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient permissions', StatusCodes.FORBIDDEN));
  }

  return next();
};

module.exports = authorizeRoles;
