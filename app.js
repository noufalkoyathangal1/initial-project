const express = require('express');
const morgan = require('morgan');
const reteLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// 1)GLOBAL MIDDLEWARES
// http header security
app.use(helmet());
// Developmwnt login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Litim request from same IP for prevent DOS and bruteforce attacks
const limiter = reteLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this id, please try again in an hour'
});

app.use('/api', limiter);
// Body parser, reading data from body into req.body
app.use(express.json());
// Data sanitization against NoSQL  query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// prevent parameter pollution  ___ whitelist provide some exceptions to pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
// serving static file
app.use(express.static(`${__dirname}/public`));
// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
// we want to handle error in all http methods such as post,get.. so we are using app.all()
// using for handle incorrect url eg .../api/tour instead of ..api/v1/tour
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find the ${req.originalUrl} on this server`, 404));
});
// iplementation of ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);
module.exports = app;
