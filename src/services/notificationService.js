const { Notification, User } = require('../models');
const emailService = require('./emailService');

/**
 * Create notification and send email
 */
async function createNotification({ userId, type, message, relatedId = null, relatedType = null, sendEmail = true }) {
  const notification = await Notification.create({
    user_id: userId,
    type,
    message,
    related_id: relatedId,
    related_type: relatedType,
    is_read: false,
  });

  // Send email if enabled
  if (sendEmail) {
    try {
      const user = await User.findByPk(userId);
      if (user && user.email) {
        await emailService.sendEmail({
          to: user.email,
          subject: `SkillBridge Notification: ${type}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎓 SkillBridge</h1>
                  <p>New Notification</p>
                </div>
                <div class="content">
                  <h2>Hello ${user.name},</h2>
                  <p>${message}</p>
                  <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">View Dashboard</a>
                  </div>
                </div>
                <div class="footer">
                  <p>This is an automated email. Please do not reply.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      }
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }
  }

  return notification;
}

/**
 * Get notifications for a user
 */
async function getUserNotifications(userId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
  const where = { user_id: userId };
  if (unreadOnly) {
    where.is_read = false;
  }

  const notifications = await Notification.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const total = await Notification.count({ where });
  const unreadCount = await Notification.count({ where: { user_id: userId, is_read: false } });

  return {
    notifications,
    total,
    unreadCount,
  };
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId },
  });

  if (!notification) {
    const error = new Error('Notification not found');
    error.status = 404;
    throw error;
  }

  notification.is_read = true;
  await notification.save();

  return notification;
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead(userId) {
  await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } }
  );

  return { success: true };
}

/**
 * Delete notification
 */
async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId },
  });

  if (!notification) {
    const error = new Error('Notification not found');
    error.status = 404;
    throw error;
  }

  await notification.destroy();
  return { success: true };
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
