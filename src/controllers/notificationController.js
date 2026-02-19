const notificationService = require('../services/notificationService');

async function getNotifications(req, res, next) {
  try {
    const { limit = 50, offset = 0, unreadOnly } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true',
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, req.user.id);
    return res.json(notification);
  } catch (err) {
    return next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    const result = await notificationService.deleteNotification(id, req.user.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
