const Review = require("./../models/reviewModel");
// const catchAsync = require("./../utils/catchAsync");
// const AppError = require("./../utils/appError");
const factory = require("./handleFactory");

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = {
//     tour: req.params.tourId
//   };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: "success",
//     result: reviews.length,
//     data: reviews
//   });
// });

// exports.getReview = catchAsync(async (req, res, next) => {

//   const review = await Review.find(req.params.id);

//   //In case it returns null since id optional
//   if (!review) {
//     return next(new AppError("No review found with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     result: review.length,
//     data: review
//   });
// });

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// exports.createReview = catchAsync(async (req, res, next) => {

//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: "success",
//     data: {
//       review: newReview
//     }
//   });
// });

// exports.deleteReview = catchAsync(async (req, res, next) => {

//   await Review.deleteById(req.params.id);
//   res.status(204).json({
//     status: "success"
//   });
// });
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);