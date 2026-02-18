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

module.exports = router;

