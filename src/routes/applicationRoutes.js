const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const applicationController = require('../controllers/applicationController');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Student']),
  [
    body('projectId').isInt({ gt: 0 }).withMessage('Valid projectId is required'),
  ],
  applicationController.apply,
);

router.get(
  '/',
  authMiddleware,
  applicationController.getApplications,
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['Business', 'Admin']),
  [
    body('status').isIn(['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED']).withMessage('Invalid status'),
  ],
  applicationController.updateStatus,
);

module.exports = router;

