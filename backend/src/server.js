const app = require('./app');
const env = require('./config/env');
const prisma = require('./db/prisma');

const startServer = async () => {
  try {
    await prisma.$connect();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
