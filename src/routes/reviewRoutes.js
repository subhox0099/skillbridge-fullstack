const express = require('express');
const { body, param } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Business', 'Admin']),
  [
    body('projectId').isInt({ gt: 0 }).withMessage('Valid projectId is required'),
    body('revieweeId').isInt({ gt: 0 }).withMessage('Valid revieweeId (student) is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().trim(),
  ],
  reviewController.createReview,
);

router.get(
  '/user/:userId',
  authMiddleware,
  [param('userId').isInt({ gt: 0 }).withMessage('Valid userId is required')],
  reviewController.getReviewsForUser,
);

router.get(
  '/project/:projectId',
  authMiddleware,
  [param('projectId').isInt({ gt: 0 }).withMessage('Valid projectId is required')],
  reviewController.getReviewsForProject,
);

module.exports = router;
