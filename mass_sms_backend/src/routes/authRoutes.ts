import { Router } from 'express';
import { register, login, requestOtp, resendOtp, verifyOtp } from '../services/authService.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimit.js';

// Auth routes for admin and user authentication
const router = Router();

router.use('/login', authLimiter);
router.use('/otp/request', otpLimiter);
router.use('/otp/resend', otpLimiter);

// Admin registration
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });
    const user = await register(email, password);
    res.status(201).json(user);
  } catch (e) { next(e); }
});

// Admin login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });
    const token = await login(email, password);
    res.json(token);
  } catch (e) { next(e); }
});

// User OTP request
router.post('/otp/request', async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await requestOtp(phone);
    res.json(result);
  } catch (e) { next(e); }
});

// User OTP resend
router.post('/otp/resend', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone required' });
    const result = await resendOtp(phone);
    res.json(result);
  } catch (e) { next(e); }
});

// User OTP verify
router.post('/otp/verify', async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'phone & code required' });
    const token = await verifyOtp(phone, code);
    res.json(token);
  } catch (e) { next(e); }
});

export default router;
