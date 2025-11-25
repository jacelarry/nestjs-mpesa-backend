import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { initiateStkPush, handleMpesaCallback } from '../services/mpesaService.js';
import { paymentLimiter } from '../middleware/rateLimit.js';

const router = Router();

// M-Pesa STK Push (Buy Goods - Till Number)
router.post('/mpesa/stk', authRequired, paymentLimiter, async (req, res, next) => {
  try {
    const { amount, phone } = req.body;
    if (!amount || !phone) return res.status(400).json({ message: 'amount & phone required' });
    const result = await initiateStkPush({ amount, phone, userId: req.user!.id });
    res.json(result);
  } catch (e) { next(e); }
});

// M-Pesa Callback
router.post('/callback/mpesa', async (req, res, next) => {
  try {
    await handleMpesaCallback(req.body);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
