const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadResume: uploadResumeMulter } = require('../middleware/uploadMiddleware');
const resumeController = require('../controllers/resumeController');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Student']),
  uploadResumeMulter,
  resumeController.uploadResume,
);

router.get(
  '/parsed',
  authMiddleware,
  roleMiddleware(['Student']),
  resumeController.getParsedResume,
);

// Business/Admin can view a student's resume if the student applied to their project
router.get(
  '/student/:userId',
  authMiddleware,
  roleMiddleware(['Business', 'Admin']),
  resumeController.viewStudentResume,
);

module.exports = router;
