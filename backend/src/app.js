const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1', routes);

app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);

module.exports = app;
