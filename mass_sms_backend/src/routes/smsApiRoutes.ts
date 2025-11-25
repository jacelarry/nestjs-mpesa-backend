import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { consumeTokens } from '../services/tokenService.js';
import { sendSms } from '../services/smsService.js';

const router = Router();

// Send SMS via API (Africa's Talking, admin credentials)
router.post('/send', authRequired, async (req, res, next) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: true, message: 'to and message required' });
    }
    // Check and deduct API tokens (1 per SMS)
    await consumeTokens(req.user!.id, 1, 'api');
    // Send SMS using admin's Africa's Talking credentials
    const result = await sendSms(to, message);
    if (result.success) {
      return res.json({ sent: true, provider: result.provider, messageId: result.messageId });
    } else {
      return res.status(500).json({ sent: false, error: result.error });
    }
  } catch (e) {
    const err = e as Error;
    if (err.message && err.message.includes('Insufficient tokens')) {
      return res.status(402).json({ error: true, message: 'Insufficient API tokens' });
    }
    next(err);
  }
});

export default router;
