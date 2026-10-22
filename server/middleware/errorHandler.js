const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server error';

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Email already registered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  res.status(statusCode).json({
    message,
  });
};

module.exports = errorHandler;
