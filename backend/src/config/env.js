const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'change_this_to_a_strong_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};
