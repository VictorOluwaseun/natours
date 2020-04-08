const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require("./userModel");
// const validator = require('validator');

const tourSchema = new mongoose.Schema({
  name: {
    // Schema type options
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "A tour name must have less than or equal to 40 characters"], //this also works for date
    minlength: [10, "A tour name must have more than or equal to 10 characters"]
    // validate: [validator.isAlpha, 'Tour must only contain characters'] external library
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"]
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"]
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty"],
    enum: { //enum is only for string
      values: ['easy', 'medium', 'difficult'],
      message: "Difficulty is either: easy, medium, difficult"
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: val => Math.round(val * 10) / 10 //4.777878, 47.77878, 48, 4.8
  },

  ratingsQuantity: {
    type: Number,
    default: 0
  },

  price: {
    type: Number,
    required: [true, "A tour must have a price"]
  },
  priceDiscount: {
    type: Number,
    // validate: function (val) { // to return true of false
    //     return val < this.price;
    // }
    validate: {
      validator: function (val) { // to return true of false
        // this only points to current doc on NEW document creation
        return val < this.price;
      },
      message: "Discount price ({VALUE}) should be below regular price"
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, "A tour must have a description"]
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image"]
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
    //GeoJSON
    type: {
      type: String,
      default: "Point",
      enum: ["Point"]
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [{
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String,
    day: Number
  }],
  // guides: Array
  guides: [{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }]
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

//create index for price for fast execution
//1... sorting the index in ascending order while 
//there are other types of indexes like for text and geospatial data
// tourSchema.index({price: 1});
tourSchema.index({
  price: 1,
  ratingsAverage: -1
});

tourSchema.index({
  slug: 1
});
tourSchema.index({
  startLocation: "2dsphere"
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual Populate: Tours and Reviews   //go over this again
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id"
});

//four types of middlewares in mongoose, => document, query, aggregate and model middlware

//DOCUMENT MIDDLEWARE: runs before .save() and .create() but not on insertMany
tourSchema.pre('save', function (next) { //hook is called save and and the middleware function is called pre save hook
  this.slug = slugify(this.name, {
    lower: true
  });
  next();
});

// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises); //check this out in the lecture. Implement codes when guides get updated or promoted
//   next();
// });

// tourSchema.pre('save', function (next) {
//     console.log('will save document');
//     next();
// });

// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  this.find({ //this this point to the query. The filter object which is find, the secret tour is not equal to true. Query the object where the secret tour is not equal to true
    secretTour: {
      $ne: true
    }
  });

  this.start = Date.now(); //a kind of clock to know the runtime or something
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: "-__v -passwordChangedAt"
  });

  next();
});
// tourSchema.pre('findOne', function (next) {   this should be used. Regular expression instead. Check the other function for the regular expression
//     this.find({
//         secretTour: {
//             $ne: true
//         }
//     });
//     next();
// });

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  // console.log(docs);
  next();
});


//AGGREGATE MIDDLEWARE
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({
//     $match: {
//       secretTour: {
//         $ne: true
//       }
//     }
//   });

//   console.log(this.pipeline());
//   next();
// });

// The secret tour is included in the "aggregate" we might not want to exclude it.
const Tour = mongoose.model('Tour', tourSchema); //still check how this works

module.exports = Tour;