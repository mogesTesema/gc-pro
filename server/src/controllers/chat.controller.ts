import { Request, Response } from 'express';
import { Chat, Message } from '../models/Message.model';
import Notification from '../models/Notification.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { NOTIFICATION_TYPES } from '../config/constants';

// ─── GET /api/chats ───────────────────────────────────────
// Returns all chats the current user is in
export const getMyChats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const chats = await Chat.find({
    participants: req.user!._id,
    isActive: true,
  })
    .populate('participants', 'name avatar role')
    .populate('applicationId', 'campaignId status collaborationStatus')
    .populate({
      path: 'applicationId',
      populate: { path: 'campaignId', select: 'title' },
    })
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  res.status(200).json({ success: true, chats });
});

// ─── GET /api/chats/:chatId ───────────────────────────────
export const getChatById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const chat = await Chat.findById(req.params.chatId)
    .populate('participants', 'name avatar role')
    .populate({
      path: 'applicationId',
      populate: { path: 'campaignId', select: 'title status budget' },
    });

  if (!chat) {
    res.status(404).json({ success: false, message: 'Chat not found.' });
    return;
  }

  const isParticipant = chat.participants.some(
    (p: any) => p._id.toString() === req.user!._id.toString()
  );

  if (!isParticipant && !['admin', 'superadmin'].includes(req.user!.role)) {
    res.status(403).json({ success: false, message: 'Not authorized to view this chat.' });
    return;
  }

  // Mark messages as read
  await Message.updateMany(
    { chatId: chat._id, senderId: { $ne: req.user!._id }, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  // Reset unread count for this user
  const unreadKey = req.user!._id.toString();
  if (chat.unreadCount.has(unreadKey)) {
    chat.unreadCount.set(unreadKey, 0);
    await chat.save();
  }

  res.status(200).json({ success: true, chat });
});

// ─── GET /api/chats/:chatId/messages ─────────────────────
export const getChatMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const chat = await Chat.findById(req.params.chatId);

  if (!chat) {
    res.status(404).json({ success: false, message: 'Chat not found.' });
    return;
  }

  const isParticipant = chat.participants.some(
    (p: any) => p.toString() === req.user!._id.toString()
  );

  if (!isParticipant && !['admin', 'superadmin'].includes(req.user!.role)) {
    res.status(403).json({ success: false, message: 'Not authorized.' });
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ chatId: req.params.chatId, isDeleted: false })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 }) // newest first for pagination
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ chatId: req.params.chatId, isDeleted: false }),
  ]);

  res.status(200).json({
    success: true,
    messages: messages.reverse(), // return oldest first within page
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ─── POST /api/chats/:chatId/messages ────────────────────
// REST fallback — primary messaging goes through Socket.IO
export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { content, messageType } = req.body;

  const chat = await Chat.findById(req.params.chatId);

  if (!chat) {
    res.status(404).json({ success: false, message: 'Chat not found.' });
    return;
  }

  const isParticipant = chat.participants.some(
    (p: any) => p.toString() === req.user!._id.toString()
  );

  if (!isParticipant) {
    res.status(403).json({ success: false, message: 'Not authorized.' });
    return;
  }

  const message = await Message.create({
    chatId: chat._id,
    senderId: req.user!._id,
    content,
    messageType: messageType || 'text',
  });

  // Update chat's last message info
  chat.lastMessage = content;
  chat.lastMessageAt = new Date();
  chat.lastMessageSender = req.user!._id;

  // Increment unread for the OTHER participant
  const otherId = chat.participants.find(
    (p: any) => p.toString() !== req.user!._id.toString()
  )?.toString();

  if (otherId) {
    const current = chat.unreadCount.get(otherId) || 0;
    chat.unreadCount.set(otherId, current + 1);

    // Notify other participant
    await Notification.create({
      userId: otherId,
      senderId: req.user!._id,
      type: NOTIFICATION_TYPES.NEW_MESSAGE,
      title: `New message from ${req.user!.name}`,
      message: content.length > 60 ? content.slice(0, 60) + '...' : content,
      refId: chat._id,
      refModel: 'Chat',
    });
  }

  await chat.save();

  const populated = await Message.findById(message._id).populate('senderId', 'name avatar');

  res.status(201).json({ success: true, message: populated });
});
