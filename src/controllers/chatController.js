const { validationResult } = require('express-validator');
const chatService = require('../services/chatService');

async function getMessages(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, userId } = req.query;

    const messages = await chatService.getMessages({
      projectId: parseInt(projectId, 10),
      otherUserId: parseInt(userId, 10),
      currentUserId: req.user.id,
    });

    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, recipientUserId, text } = req.body;

    const message = await chatService.sendMessage({
      projectId: parseInt(projectId, 10),
      senderUserId: req.user.id,
      recipientUserId: parseInt(recipientUserId, 10),
      text,
    });

    return res.status(201).json(message);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getMessages,
  sendMessage,
};

