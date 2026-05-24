import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import connectDB from './config/db';
import { errorHandler, notFound } from './middleware/error.middleware';
import { initSocket } from './socket/socket.handler';
import { sanitizeInputs } from './middleware/sanitize.middleware';

// ─── Route imports ────────────────────────────────────────
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import campaignRoutes from './routes/campaign.routes';
import applicationRoutes from './routes/application.routes';
import {
  chatRouter,
  ratingsRouter,
  notificationsRouter,
  coinsRouter,
  adminRouter,
  aiRouter,
  superAdminRouter,
} from './routes/other.routes';

// ─── App initialization ───────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

initSocket(io);

// Make io accessible in controllers if needed
app.set('io', io);

// ─── Middleware ───────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInputs);

// ─── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AACP API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chats', chatRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/coins', coinsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/superadmin', superAdminRouter);
app.use('/api/ai', aiRouter);

// ─── Error Handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║        AACP Backend Server               ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  🚀 Server:   http://localhost:${PORT}       ║`);
    console.log(`║  🌍 Mode:     ${process.env.NODE_ENV?.padEnd(28)}║`);
    console.log(`║  🔌 Socket:   Initialized                ║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { io };
export default app;
