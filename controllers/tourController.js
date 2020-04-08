//modern view "controllers" architecture will be created
const multer = require("multer");
const sharp = require("sharp");
const Tour = require("./../models/tourModel");
// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handleFactory");


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true)
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([{
    name: "imageCover",
    maxCount: 1
  }, //maxCount:1 means we can only have one field called imageCovered which is then it's going to be processed
  {
    name: "images",
    maxCount: 3
  }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // console.log(req.files.imageCover);
  // if (!req.files.imageCover || !req.files.images) return next();
  if (!req.files.imageCover && !req.files.images) return next();

  //1. Cover image

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  console.log(req.body.imageCover);


  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({
      quality: 90
    })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // req.body.imageCover = imageCoverFilename;

  //2. Images
  req.body.images = [];

  const g = await Promise.all(req.files.images.map(async (file, i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({
        quality: 90
      })
      .toFile(`public/img/tours/${filename}`);

    req.body.images.push(filename);
  }));

  console.log(g);

  console.log(req.body);

  next();
});

// upload.single("images") req.file
// upload.array("images", 5) req.files

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage.price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next(); //why next here
  //now because you are not sending anyhing here, no res, you are still connecting to next middleware
};

//2.) Route handlers
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //BUILD QUERY
//   console.log(req.query);
//   // 1a. Filtering
//   // const queryObj = {
//   //     ...req.query
//   // };
//   // const excludedFields = ["page", "sort", "limit", "fields"];

//   // excludedFields.forEach(el => delete queryObj[el]);
//   // // console.log(req.query, queryObj);

//   // //1b. Adevanced filetering
//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b{gte|gt|lte|lt}\b/g, match => `$${match}`);
//   // console.log(JSON.parse(queryStr));

//   // // { difficulty: 'easy, duration: { $gte:5 } }
//   // // { difficulty: 'easy, duration: { gte:5 } }

//   // // const query = Tour.find(req.query);
//   // let query = Tour.find(JSON.parse(queryStr));

//   // 2. Sorting
//   // if (req.query.sort) {
//   //     const sortBy = req.query.sort.split(',').join(" ");
//   //     query = query.sort(sortBy);
//   //     //sort('price ratingsAverage')
//   // } else {
//   //     query = query.sort("-createdAt");
//   // }

//   //3. Field limiting
//   // if (req.query.fields) {
//   //     const fields = req.query.fields.split(",").join(" "); //coming from javascriptx
//   //     query = query.select(fields);
//   //     // query = query.select('name duration difficulty');
//   //     console.log(fields);

//   // } else {
//   //     query = query.select('-__v');
//   // }

//   //4. Pagination
//   // const page = req.query.page * 1 || 1; //defining a default in Javascript by putting || operator
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit;

//   // query = query.skip(skip).limit(limit);

//   // if (req.query.page) {
//   //     const numTours = await Tour.countDocuments();
//   //     if (skip >= numTours) throw new Error("This page does not exist");
//   // }

//   //Get all tours should always pass through these queries
//   // EXECUTE QUERY                 this.query.find(JSON.parse(queryStr));
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   // const query = await Tour.find()
//   //     .where("duration")
//   //     .equals(5) //or lte()
//   //     .where("difficulty")
//   //     .equals("easy");

//   // console.log(req.requestTime);

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     // requestedAt: req.requestTime,
//     results: tours.length,
//     data: {
//       tours
//     }
//   });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate("reviews");
//   // Tour.findOne({_id: req.params.id}) or Tour.findOne({req.params.name}) incase name is one of the params

//   //because it was returning null
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });

//exports.createTour =  catchAsync(async (req, res, next) => { //now has next in order to an error into it so that that error can then be handled in the global error handling middleware
//   //it returns a Promise and instead of using Promise, async await will be used
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: "success",
//     data: {
//       tour: newTour
//     }
//   });
// });

//     try {
//         // const newTour = new Tour({});
//         // newTour.save();

//     } catch (err) {
//         res.status(400).json({
//             status: "fail",
//             message: `${err} \n Invalid data sent`
//         });
//     }
// });

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {
  path: "reviews"
});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, // to send updated data to the client, like the new document
//     runValidators: true
//   });

//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   //the returned value is not needed but now to handle error when we have invalid ID
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([{
      $match: {
        ratingsAverage: {
          $gte: 4.5
        }
      }
    },
    {
      $group: {
        _id: {
          $toUpper: "$difficulty"
        },
        // _id: '$ratingsAverage',
        numTours: {
          $sum: 1
        },
        numRatings: {
          $sum: "$ratingsQuantity"
        },
        avgRating: {
          $avg: "$ratingsAverage"
        },
        avgPrice: {
          $avg: "$price"
        },
        minPrice: {
          $min: "$price"
        },
        maxPrice: {
          $max: "$price"
        }
      }
    },
    {
      $sort: {
        avgPrice: 1
      }
    }
    // {
    //     $match: {
    //         _id: {
    //             $ne: 'EASY'
    //         }
    //     }
    // }
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021
  const plan = await Tour.aggregate([{
      $unwind: "$startDates"
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year}-12-31`) //$lt: new Date(`${year+1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: {
          $month: "$startDates"
        },
        numTourStarts: {
          $sum: 1 //no of tours
        },
        tours: {
          $push: "$name"
        }
      }
    },
    {
      $addFields: {
        month: "$_id"
      }
    },
    {
      $project: {
        _id: 0 //not to show
      }
    },
    {
      $sort: {
        numTourStarts: -1 //in descending order
      }
    },
    {
      $limit: 12 // not that helpful
    }
  ]);
  res.status(200).json({
    status: "success",
    results: plan.length,
    data: {
      plan
    }
  });
});

//  "/tours-within/:distance/center/:latlng/unit/:unit"
// /tours-distance?distance=223&center=-40,45,&unit=mi alternatively
// /tours-distance/233/center/-40,45/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const {
    distance,
    latlng,
    unit
  } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat, lng.",
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat], radius
        ]
      }
    }
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const {
    latlng,
    unit
  } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat, lng.",
        400
      )
    );
  }

  const distances = await Tour.aggregate([{
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: "distance",
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances
    }
  });
});