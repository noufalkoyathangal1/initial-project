const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}.please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data.${errors.join('. ')}`;
  return new AppError(message, 400);
};

const hanldeJWTError = () =>
  new AppError('Invalid token plese log in again !', 401);
const hanldeJWTExpiredError = () =>
  new AppError('Your token is expired please login again !', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // OPERATIONAL, TRUSTED error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // PROGRAMMING or OTHER UNKNOWN ERROR: DONT leak error details
  } else {
    // 1) LOG error
    console.error('ERROR 💥', err);
    // 2) send generic message
    res.status(500).json({
      status: 'fail',
      message: 'something very wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.code === 'ValidatorError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = hanldeJWTError();
    if (error.name === 'TokenExpiredError') error = hanldeJWTExpiredError();
    sendErrorProd(error, res);
  }
};
