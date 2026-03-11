const { StatusCodes } = require('http-status-codes');
const prisma = require('../db/prisma');
const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/appError');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: missing or invalid token', StatusCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      throw new AppError('Unauthorized: user not found', StatusCodes.UNAUTHORIZED);
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError(error.message, error.statusCode || StatusCodes.UNAUTHORIZED));
  }
};

module.exports = authMiddleware;
