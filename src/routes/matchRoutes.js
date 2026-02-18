const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const matchController = require('../controllers/matchController');

const router = express.Router();

router.get(
  '/:projectId',
  authMiddleware,
  roleMiddleware(['Business', 'Admin']),
  matchController.getMatches,
);

module.exports = router;

