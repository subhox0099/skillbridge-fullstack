const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.patch(
  '/',
  authMiddleware,
  [
    body('location').optional().isString().trim(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).toFloat(),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).toFloat(),
  ],
  profileController.updateProfile,
);

module.exports = router;
