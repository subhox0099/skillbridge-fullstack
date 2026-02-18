const { validationResult } = require('express-validator');
const reviewService = require('../services/reviewService');

async function createReview(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, revieweeId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    const review = await reviewService.createReview({
      projectId,
      reviewerId,
      revieweeId,
      rating,
      comment,
    });

    return res.status(201).json(review);
  } catch (err) {
    return next(err);
  }
}

async function getReviewsForUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { userId } = req.params;
    const reviews = await reviewService.getReviewsForUser(Number(userId));
    return res.json(reviews);
  } catch (err) {
    return next(err);
  }
}

async function getReviewsForProject(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { projectId } = req.params;
    const reviews = await reviewService.getReviewsForProject(Number(projectId));
    return res.json(reviews);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createReview,
  getReviewsForUser,
  getReviewsForProject,
};
