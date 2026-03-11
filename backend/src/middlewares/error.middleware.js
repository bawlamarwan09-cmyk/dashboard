const { StatusCodes } = require('http-status-codes');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorMiddleware;
