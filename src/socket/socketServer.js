const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Message, Project } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notificationService');

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'role_id'],
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected via Socket.IO`);

    // Join room for user-specific notifications
    socket.join(`user:${socket.userId}`);

    // Join chat room for a specific project conversation
    socket.on('join_chat', async ({ projectId, otherUserId }) => {
      try {
        const parsedProjectId = parseInt(projectId, 10);
        const parsedOtherUserId = parseInt(otherUserId, 10);
        
        // Calculate room ID consistently (same as send_message)
        const minUserId = Math.min(socket.userId, parsedOtherUserId);
        const maxUserId = Math.max(socket.userId, parsedOtherUserId);
        const roomId = `chat:${parsedProjectId}:${minUserId}:${maxUserId}`;
        
        console.log(`🔌 User ${socket.userId} joining chat room: ${roomId}`);
        console.log(`   Project: ${parsedProjectId}, Other User: ${parsedOtherUserId}`);
        
        // Leave previous room if any
        if (socket.currentChatRoom && socket.currentChatRoom !== roomId) {
          socket.leave(socket.currentChatRoom);
        }
        
        socket.join(roomId);
        socket.currentChatRoom = roomId;
        socket.currentProjectId = parsedProjectId;
        socket.currentOtherUserId = parsedOtherUserId;

        // Verify room join
        const roomSockets = await io.in(roomId).fetchSockets();
        console.log(`   ✅ Joined room ${roomId}. Total sockets in room: ${roomSockets.length}`);

        // Load and send existing messages with sender info
        const messages = await Message.findAll({
          where: {
            project_id: parsedProjectId,
            [Op.or]: [
              {
                sender_user_id: socket.userId,
                recipient_user_id: parsedOtherUserId,
              },
              {
                sender_user_id: parsedOtherUserId,
                recipient_user_id: socket.userId,
              },
            ],
          },
          include: [
            { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
          ],
          order: [['createdAt', 'ASC']],
        });

        console.log(`   📜 Sending ${messages.length} historical messages`);
        socket.emit('chat_history', { messages });
      } catch (error) {
        console.error('❌ Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat room: ' + error.message });
      }
    });

    // Handle sending messages
    socket.on('send_message', async ({ projectId, recipientUserId, text }) => {
      try {
        console.log(`📤 send_message received from user ${socket.userId} to user ${recipientUserId} in project ${projectId}`);
        
        const project = await Project.findByPk(projectId);
        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        const trimmed = (text || '').trim();
        if (!trimmed) {
          socket.emit('error', { message: 'Message text is required' });
          return;
        }

        // Save message to database
        const message = await Message.create({
          project_id: parseInt(projectId, 10),
          sender_user_id: socket.userId,
          recipient_user_id: parseInt(recipientUserId, 10),
          text: trimmed,
        });

        // Reload message to get proper timestamps
        const savedMessage = await Message.findByPk(message.id, {
          include: [
            { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
          ],
        });

        const messageWithSender = savedMessage ? savedMessage.toJSON() : {
          ...message.toJSON(),
          sender: {
            id: socket.user.id,
            name: socket.user.name,
            email: socket.user.email,
          },
        };

        // Create notification for recipient (non-blocking)
        notificationService.createNotification({
          userId: parseInt(recipientUserId, 10),
          type: 'CHAT_MESSAGE',
          message: `New message on project "${project.title}"`,
          relatedId: message.id,
          relatedType: 'message',
          sendEmail: false,
        }).catch((err) => console.error('Failed to create chat notification:', err));

        // Determine room ID (same format as join_chat - MUST be consistent)
        const minUserId = Math.min(socket.userId, parseInt(recipientUserId, 10));
        const maxUserId = Math.max(socket.userId, parseInt(recipientUserId, 10));
        const roomId = `chat:${projectId}:${minUserId}:${maxUserId}`;

        console.log(`📡 Broadcasting to room: ${roomId}`);
        console.log(`   Sender: ${socket.userId}, Recipient: ${recipientUserId}`);
        
        // Get all sockets in the room to verify
        const roomSockets = await io.in(roomId).fetchSockets();
        console.log(`   Sockets in room: ${roomSockets.length}`);

        // Emit to ALL users in the chat room (both sender and recipient see it)
// Emit to chat room
io.to(roomId).emit('new_message', { message: messageWithSender });

// Emit to recipient personal room
io.to(`user:${recipientUserId}`).emit('new_message', { message: messageWithSender });

// ✅ CHECK IF RECIPIENT IS ONLINE
const sockets = await io.in(`user:${recipientUserId}`).fetchSockets();

if (sockets.length > 0) {
  await Message.update(
    { delivered_at: new Date() },
    { where: { id: message.id } }
  );
}


        // ✅ Update delivered_at timestamp
await Message.update(
  {
    delivered_at: new Date()
  },
  {
    where: { id: message.id }
  }
);

        console.log(`✅ Message broadcasted to room ${roomId}`);

        // Also send to sender's socket directly (in case they're not in room yet)
        socket.emit('new_message', { message: messageWithSender });

        // Also notify recipient's user room if they're not in chat room
        io.to(`user:${recipientUserId}`).emit('chat_notification', {
          projectId,
          projectTitle: project.title,
          senderName: socket.user.name,
          message: trimmed,
        });
        
        console.log(`✅ Message sent successfully from user ${socket.userId} to user ${recipientUserId}`);
      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message: ' + error.message });
      }
    });

    // Leave chat room
    socket.on('leave_chat', () => {
      if (socket.currentChatRoom) {
        socket.leave(socket.currentChatRoom);
        socket.currentChatRoom = null;
        socket.currentProjectId = null;
        socket.currentOtherUserId = null;
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};
