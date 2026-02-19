const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  notificationController.getNotifications,
);

router.patch(
  '/:id/read',
  authMiddleware,
  notificationController.markAsRead,
);

router.patch(
  '/read-all',
  authMiddleware,
  notificationController.markAllAsRead,
);

router.delete(
  '/:id',
  authMiddleware,
  notificationController.deleteNotification,
);

module.exports = router;
