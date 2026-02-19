const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const projectController = require('../controllers/projectController');

const router = express.Router();

router.get('/', projectController.listProjects);

router.get(
  '/stats',
  authMiddleware,
  roleMiddleware(['Business', 'Admin']),
  projectController.getStats,
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Business', 'Admin']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).toFloat(),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).toFloat(),
  ],
  projectController.createProject,
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['Business', 'Admin']),
  [
    body('status').isIn(['OPEN', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED']).withMessage('Invalid status'),
  ],
  projectController.updateStatus,
);

module.exports = router;

