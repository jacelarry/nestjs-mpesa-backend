import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { getBalance, addTokens, consumeTokens } from '../services/tokenService.js';

const router = Router();

router.get('/balance', authRequired, async (req, res, next) => {
  try {
    const tokenType = req.query.type as string || 'phone';
    const balance = await getBalance(req.user!.id, tokenType);
    res.json({ balance });
  } catch (e) { next(e); }
});

// Purchase tokens via M-Pesa Till Number
router.post('/purchase', authRequired, async (req, res, next) => {
  try {
    const { phoneNumber, amount, tokenType } = req.body;
    if (!phoneNumber || !amount) {
      return res.status(400).json({ message: 'phoneNumber & amount required' });
    }
    // Forward to M-Pesa STK Push, but also allow specifying tokenType
    res.json({
      message: 'Use /api/payments/mpesa/stk endpoint for M-Pesa payments',
      redirect: '/api/payments/mpesa/stk',
      tokenType: tokenType || 'phone',
    });
  } catch (e) { next(e); }
});

export default router;
