import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message, Chat } from '../models/Message.model';
import Notification from '../models/Notification.model';
import { NOTIFICATION_TYPES } from '../config/constants';

interface AuthSocket extends Socket {
  userId?: string;
}

const onlineUsers = new Map<string, Set<string>>();

export const initSocket = (io: Server): void => {
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token =
        (socket.handshake.auth as any).token ||
        socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(socket.id);
    socket.join(`user:${userId}`);
    socket.broadcast.emit('user:online', { userId });

    socket.on('chat:join',  (chatId: string) => socket.join(`chat:${chatId}`));
    socket.on('chat:leave', (chatId: string) => socket.leave(`chat:${chatId}`));

    socket.on('message:send', async (data: { chatId: string; content: string }) => {
      try {
        const { chatId, content } = data;
        if (!content?.trim()) return;

        const chat = await Chat.findById(chatId);
        if (!chat) return;
        const isParticipant = chat.participants.some((p: any) => p.toString() === userId);
        if (!isParticipant) return;

        const message = await Message.create({
          chatId,
          senderId: userId,
          content: content.trim(),
          messageType: 'text' as const,
        });

        const otherId = chat.participants
          .find((p: any) => p.toString() !== userId)?.toString();

        chat.lastMessage = content;
        chat.lastMessageAt = new Date();
        chat.lastMessageSender = message.senderId;
        if (otherId) {
          const cur = chat.unreadCount.get(otherId) || 0;
          chat.unreadCount.set(otherId, cur + 1);
        }
        await chat.save();

        const populated = await Message.findById(message._id).populate('senderId', 'name avatar');
        io.to(`chat:${chatId}`).emit('message:received', populated);

        if (otherId) {
          const notification = await Notification.create({
            userId: otherId,
            senderId: userId,
            type: NOTIFICATION_TYPES.NEW_MESSAGE,
            title: 'New Message',
            message: content.length > 60 ? content.slice(0, 60) + '...' : content,
            refId: chat._id,
            refModel: 'Chat',
          });
          io.to(`user:${otherId}`).emit('notification:new', notification);
        }
      } catch (err) {
        console.error('Socket message:send error:', err);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    socket.on('chat:typing',      (chatId: string) => socket.to(`chat:${chatId}`).emit('chat:typing',      { userId, chatId }));
    socket.on('chat:stop_typing', (chatId: string) => socket.to(`chat:${chatId}`).emit('chat:stop_typing', { userId, chatId }));

    socket.on('messages:read', async (chatId: string) => {
      try {
        await Message.updateMany(
          { chatId, senderId: { $ne: userId }, isRead: false },
          { isRead: true, readAt: new Date() }
        );
        const chat = await Chat.findById(chatId);
        if (chat) { chat.unreadCount.set(userId, 0); await chat.save(); }
        socket.to(`chat:${chatId}`).emit('messages:read', { chatId, userId });
      } catch (err) {
        console.error('messages:read error:', err);
      }
    });

    socket.on('users:online', () => socket.emit('users:online', Array.from(onlineUsers.keys())));

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user:offline', { userId });
        }
      }
    });
  });
};

export { onlineUsers };
