const { StatusCodes } = require('http-status-codes');
const authService = require('./auth.service');
const { registerSchema, loginSchema } = require('./auth.validation');

const register = async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const data = await authService.register(payload);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const data = await authService.login(payload);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) =>
  res.status(StatusCodes.OK).json({
    success: true,
    data: req.user,
  });

module.exports = {
  register,
  login,
  me,
};
