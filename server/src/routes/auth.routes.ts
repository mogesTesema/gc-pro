import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, changePassword } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// ─── Validators ───────────────────────────────────────────
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['creator', 'business']).withMessage('Role must be "creator" or "business"'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Routes ───────────────────────────────────────────────
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

export default router;
