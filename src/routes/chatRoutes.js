const express = require('express');
const { query, body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get(
  '/messages',
  authMiddleware,
  [
    query('projectId').isInt({ gt: 0 }).withMessage('projectId is required'),
    query('userId').isInt({ gt: 0 }).withMessage('userId is required'),
  ],
  chatController.getMessages,
);

router.post(
  '/messages',
  authMiddleware,
  [
    body('projectId').isInt({ gt: 0 }).withMessage('projectId is required'),
    body('recipientUserId').isInt({ gt: 0 }).withMessage('recipientUserId is required'),
    body('text').isLength({ min: 1 }).withMessage('Message text is required'),
  ],
  chatController.sendMessage,
);

module.exports = router;

