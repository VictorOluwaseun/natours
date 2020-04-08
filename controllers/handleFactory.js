const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, res, next) => { //closure: that inner function would get access to the variable of the outer function even after the outer function as already returned
  //the returned value is not needed but now to handle error when we have invalid ID
  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // to send updated data to the client, like the new document
    runValidators: true
  });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

exports.createOne = Model => catchAsync(async (req, res, next) => { //now has next in order to an error into it so that that error can then be handled in the global error handling middleware 
  //it returns a Promise and instead of using Promise, async await will be used
  const doc = await Model.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      data: doc
    }
  });
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
  let query = Model.findById(req.params.id);
  if (popOptions) query = query.populate(popOptions);
  const doc = await query;
  // const doc = await Model.findById(req.params.id).populate("reviews");
  // Tour.findOne({_id: req.params.id}) or Tour.findOne({req.params.name}) incase name is one of the params

  //because it was returning null
  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
  //To allow for nested GET reviews on tour - hack
  let filter = {};
  if (req.params.tourId) filter = {
    tour: req.params.tourId
  };

  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // const docs = await features.query.explain();
  const docs = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    // requestedAt: req.requestTime,
    results: docs.length,
    data: {
      data: docs
    }
  });
});