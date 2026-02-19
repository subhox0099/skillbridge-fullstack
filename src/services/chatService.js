const { Message, Project } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('./notificationService');

async function getMessages({ projectId, otherUserId, currentUserId }) {
  const project = await Project.findByPk(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  const messages = await Message.findAll({
    where: {
      project_id: projectId,
      [Op.or]: [
        {
          sender_user_id: currentUserId,
          recipient_user_id: otherUserId,
        },
        {
          sender_user_id: otherUserId,
          recipient_user_id: currentUserId,
        },
      ],
    },
    order: [['createdAt', 'ASC']],
  });

  return messages;
}

async function sendMessage({ projectId, senderUserId, recipientUserId, text }) {
  const project = await Project.findByPk(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  const trimmed = (text || '').trim();
  if (!trimmed) {
    const error = new Error('Message text is required');
    error.status = 400;
    throw error;
  }

  const message = await Message.create({
    project_id: projectId,
    sender_user_id: senderUserId,
    recipient_user_id: recipientUserId,
    text: trimmed,
  });

  // Create in-app notification for recipient (non-blocking)
  notificationService.createNotification({
    userId: recipientUserId,
    type: 'CHAT_MESSAGE',
    message: `New message on project "${project.title}"`,
    relatedId: message.id,
    relatedType: 'message',
    sendEmail: false,
  }).catch((err) => console.error('Failed to create chat notification:', err));

  return message;
}

module.exports = {
  getMessages,
  sendMessage,
};

