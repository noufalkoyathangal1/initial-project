const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');
// DB connection start
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB connecton successful...');
});

// mongoose.connect(
//   DB,
//   {
//     useNewUrlParser: true,

//     useUnifiedTopology: true
//   },
//   err => {
//     if (err) throw err;
//     console.log('Connected to MongoDB!!!');
//   }
// );

// DB connection end

// Schema creation start
// models/tourModel.js
// Schema creation End

// Create a model start
// models/tourModel.js
// Create a model End

// insert data into database start
//Not use for further moveings
// const testTour = new Tour({
//   name: 'Bali Trip',
//   rating: 4.6,
//   price: 888
// });
// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => {
//     console.log('Error moonoose', err);
//   });
// insert data into database End
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION Shuttind down......');
  server.close(() => {
    //0-success 1-uncought exception
    process.exit(1);
  });
});

process.on('uncoughtException', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED Exception Shuttind down......');
  server.close(() => {
    //0-success 1-uncought exception
    process.exit(1);
  });
});
