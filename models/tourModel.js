const mongoose = require('mongoose');
const slugify = require('slugify');

//mongoose will automatically take User
// const User = require('./userModel');
// const validator = require('validator');
// Schema creation start
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must need a name'],
      unique: true,
      maxlength: [40, 'name lenght dont exceed 40 characters'],
      minlength: [10, 'name lenght must have  10 characters']
      // npm module calidator not mangoose validator
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a Group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'meadium', 'difficult'],
        message: 'Difficulty eithe easy,meadium,difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must not be abou 5.0']
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a number'] },
    priceDiscount: {
      type: Number,
      // cutome validator
      validate: {
        validator: function(val) {
          // this key word only points to current document on NEW document creation
          return val < this.price;
        },
        message: 'Discout price ({VALUE}) shuld be less than real price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have description']
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    //for disply durationWeek
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// -1 dedcending
tourSchema.index({ price: 1, ratingsAverage: -1 });
// Schema creation End
tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
});
// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
// DOCUMENT MIDDLWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('will save document');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });
// QUERY MIIDLEWARE
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v, -passwordChangedAt'
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query too ${Date.now() - this.start} milly second`);
  // console.log(docs);
  next();
});

// AGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
// Create a model start
const Tour = mongoose.model('Tour', tourSchema);
// Create a model End
module.exports = Tour;
