const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require("./../controllers/authController");
// const reviewController = require("./../controllers/reviewController");
const reviewRouter = require("./../routes/reviewRoutes");

const router = express.Router();

// router.param('id', tourController.checkID);


//POST /tour/234fad4/reviews
//GET /tour/234fad4/reviews
//GET /tour/234fad4/reviews/487348

// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restrictTo("user"),
//         reviewController.createReview
//     );

//router 
router.use("/:tourId/reviews", reviewRouter);

router
	.route('/top-5-cheap')
	.get(tourController.aliasTopTours, tourController.getAllTours);

router
	.route('/tour-stats')
	.get(tourController.getTourStats);

router
	.route('/monthly-plan/:year')
	.get(
		authController.protect,
		authController.restrictTo("admin", "lead-guide", "guide"),
		tourController.getMonthlyPlan
	);

router.route("/tours-within/:distance/center/:latlng/unit/:unit")
	.get(tourController.getToursWithin);
// /tours-distance?distance=223&center=-40,45,&unit=mi alternatively
// /tours-distance/233/center/-40,45/unit/mi

router.route("/distance/:latlng/unit/:unit")
	.get(tourController.getDistances);

router
	.route('/')
	.get(tourController.getAllTours)
	.post(
		authController.protect,
		authController.restrictTo("admin", "lead-guide"),
		tourController.createTour
	);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(
		authController.protect,
		authController.restrictTo("admin", "lead-guide"),
		tourController.uploadTourImages,
		tourController.resizeTourImages,
		tourController.updateTour)
	.delete(
		authController.protect,
		authController.restrictTo("admin", "lead-guide"),
		tourController.deleteTour
	);

module.exports = router;