const { Review, Project, User, sequelize } = require('../models');

/**
 * Validates that the reviewer (business) can rate the reviewee (student) for the project.
 * Only allowed when project is COMPLETED and the reviewer was the project's business owner.
 */
async function validateReviewEligibility(projectId, reviewerId, revieweeId) {
  const project = await Project.findByPk(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }
  if (project.business_user_id !== reviewerId) {
    const error = new Error('Only the project owner can submit a review');
    error.status = 403;
    throw error;
  }
  if (project.status !== 'COMPLETED') {
    const error = new Error('Reviews can only be submitted for completed projects');
    error.status = 400;
    throw error;
  }

  // Ensure reviewee was selected for this project (via Application with status SELECTED)
  const { Application } = require('../models');
  const application = await Application.findOne({
    where: {
      project_id: projectId,
      student_user_id: revieweeId,
      status: 'SELECTED',
    },
  });

  if (!application) {
    const error = new Error('Cannot review a student who was not selected for this project');
    error.status = 400;
    throw error;
  }
}

/**
 * Creates a review and updates the reviewee's average_rating.
 */
async function createReview({ projectId, reviewerId, revieweeId, rating, comment }) {
  await validateReviewEligibility(projectId, reviewerId, revieweeId);

  const existing = await Review.findOne({
    where: {
      project_id: projectId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
    },
  });
  if (existing) {
    const error = new Error('You have already reviewed this student for this project');
    error.status = 400;
    throw error;
  }

  const review = await Review.create({
    project_id: projectId,
    reviewer_id: reviewerId,
    reviewee_id: revieweeId,
    rating,
    comment: comment || null,
  });

  await updateUserAverageRating(revieweeId);

  return review;
}

/**
 * Recomputes and updates User.average_rating from all received reviews.
 */
async function updateUserAverageRating(revieweeId) {
  const [result] = await Review.findAll({
    where: { reviewee_id: revieweeId },
    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
    raw: true,
  });

  const avg = result?.avgRating != null ? parseFloat(result.avgRating) : 0;
  const user = await User.findByPk(revieweeId);
  if (user) {
    await user.update({ average_rating: avg });
  }
}

/**
 * Gets reviews for a user (as reviewee) or for a project.
 */
async function getReviewsForUser(revieweeId) {
  const reviews = await Review.findAll({
    where: { reviewee_id: revieweeId },
    include: [
      { model: User, as: 'reviewer', attributes: ['id', 'name'] },
      { model: Project, attributes: ['id', 'title'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  return reviews;
}

async function getReviewsForProject(projectId) {
  const reviews = await Review.findAll({
    where: { project_id: projectId },
    include: [
      { model: User, as: 'reviewer', attributes: ['id', 'name'] },
      { model: User, as: 'reviewee', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  return reviews;
}

module.exports = {
  createReview,
  updateUserAverageRating,
  getReviewsForUser,
  getReviewsForProject,
  validateReviewEligibility,
};
