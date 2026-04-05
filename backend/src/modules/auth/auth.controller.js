

const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const authService = require('./auth.service');
const { registerSchema, loginSchema } = require('./auth.validation');
const prisma = require('../../db/prisma');

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Register ─────────────────────────────────────────────────────────────────
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

// ─── Login ────────────────────────────────────────────────────────────────────
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

// ─── Me ───────────────────────────────────────────────────────────────────────
const me = async (req, res) =>
  res.status(StatusCodes.OK).json({
    success: true,
    data: req.user,
  });

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    // Always return 200 — never reveal whether an email exists
    if (!user) {
      return res.json({
        success: true,
        message: 'If this email is registered, a reset link was sent.',
      });
    }

    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: user.email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to continue.</p>
          <a href="${resetUrl}" style="
            display: inline-block;
            margin: 16px 0;
            padding: 12px 24px;
            background: #2563eb;
            color: #fff;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
          ">Reset Password</a>
          <p style="color: #6b7280; font-size: 13px;">
            This link expires in <strong>1 hour</strong> and can only be used once.<br/>
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: 'If this email is registered, a reset link was sent.',
    });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// ─── Verify Reset Token ───────────────────────────────────────────────────────
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET); // throws if invalid or expired

    return res.json({ success: true, message: 'Token is valid.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashed },
    });

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  register,
  login,
  me,
  forgotPassword,
  verifyResetToken,
  resetPassword,
};