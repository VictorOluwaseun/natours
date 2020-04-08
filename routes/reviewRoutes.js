const express = require("express");
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");

const router = express.Router({
  mergeParams: true
}); //merge params for nested route

router.use(authController.protect);

router
  .route("/")
  .get(
    reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );


router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(authController.restrictTo("user", "admin"), reviewController.updateReview)
  .delete(authController.restrictTo("user", "admin"), reviewController.deleteReview);
// .get(authController.protect, reviewController.getReview);

module.exports = router;