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

module.exports = router;
