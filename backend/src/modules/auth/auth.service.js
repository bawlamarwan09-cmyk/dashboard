const { StatusCodes } = require('http-status-codes');
const prisma = require('../../db/prisma');
const AppError = require('../../utils/appError');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signToken } = require('../../utils/jwt');

const register = async ({ name, email, password, role = 'USER' }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError('Email already in use', StatusCodes.CONFLICT);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });

  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
    token,
  };
};

module.exports = {
  register,
  login,
};
