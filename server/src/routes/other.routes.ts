// ─── chat.routes.ts ───────────────────────────────────────
import { Router as ChatRouter } from 'express';
import {
  getMyChats,
  getChatById,
  getChatMessages,
  sendMessage,
} from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

export const chatRouter = ChatRouter();
chatRouter.get('/', protect, getMyChats);
chatRouter.get('/:chatId', protect, getChatById);
chatRouter.get('/:chatId/messages', protect, getChatMessages);
chatRouter.post('/:chatId/messages', protect, sendMessage);

// ─── misc.routes.ts ───────────────────────────────────────
import { Router as MiscRouter } from 'express';
import {
  submitRating,
  getUserRatings,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getCoinBalance,
  getCoinTransactions,
  requestCoins,
} from '../controllers/misc.controller';

export const ratingsRouter = MiscRouter();
ratingsRouter.post('/', protect, submitRating);
ratingsRouter.get('/:userId', getUserRatings);

export const notificationsRouter = MiscRouter();
notificationsRouter.get('/', protect, getNotifications);
notificationsRouter.put('/read-all', protect, markAllNotificationsRead);
notificationsRouter.put('/:id/read', protect, markNotificationRead);

export const coinsRouter = MiscRouter();
coinsRouter.get('/balance', protect, getCoinBalance);
coinsRouter.get('/transactions', protect, getCoinTransactions);
coinsRouter.post('/request', protect, requestCoins);

// ─── admin.routes.ts ──────────────────────────────────────
import { Router as AdminRouter } from 'express';
import {
  getPendingProfiles,
  approveProfile,
  rejectProfile,
  addCoinsManually,
  getAllUsers,
  toggleUserStatus,
  getDashboardStats,
} from '../controllers/admin.controller';
import { authorize } from '../middleware/auth.middleware';

export const adminRouter = AdminRouter();
adminRouter.use(protect);
adminRouter.use(authorize('admin', 'superadmin'));

adminRouter.get('/stats', getDashboardStats);
adminRouter.get('/pending-profiles', getPendingProfiles);
adminRouter.put('/profiles/:userId/approve', approveProfile);
adminRouter.put('/profiles/:userId/reject', rejectProfile);
adminRouter.post('/coins/:userId', addCoinsManually);
adminRouter.get('/users', getAllUsers);
adminRouter.put('/users/:userId/toggle', toggleUserStatus);

// ─── ai.routes.ts ─────────────────────────────────────────
import { Router as AIRouter } from 'express';
import { getCreatorRecommendations, analyzeCreator } from '../controllers/ai.controller';

export const aiRouter = AIRouter();
aiRouter.post('/recommend', protect, getCreatorRecommendations);
aiRouter.post('/analyze/:creatorId', protect, analyzeCreator);

// ─── superadmin.routes.ts ─────────────────────────────────
import { Router as SuperAdminRouter } from 'express';
import {
  getSuperAdminStats,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getActivityLogs,
  getDisputes,
  createDispute,
  resolveDispute,
} from '../controllers/superadmin.controller';

export const superAdminRouter = SuperAdminRouter();
superAdminRouter.use(protect);
superAdminRouter.use(authorize('superadmin'));

superAdminRouter.get('/stats', getSuperAdminStats);
superAdminRouter.get('/admins', getAdmins);
superAdminRouter.post('/admins', createAdmin);
superAdminRouter.put('/admins/:id', updateAdmin);
superAdminRouter.delete('/admins/:id', deleteAdmin);
superAdminRouter.get('/activity-logs', getActivityLogs);
superAdminRouter.get('/disputes', getDisputes);
superAdminRouter.post('/disputes', createDispute);
superAdminRouter.put('/disputes/:id/resolve', resolveDispute);
