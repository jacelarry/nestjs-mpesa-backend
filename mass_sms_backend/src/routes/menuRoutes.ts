import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, (_req, res) => {
  res.json({
    menu: [
      { key: 'purchase_tokens', label: 'Purchase Tokens', path: '/api/tokens/purchase' },
      { key: 'check_balance', label: 'Check Token Balance', path: '/api/tokens/balance' },
      { key: 'initiate_stk_push', label: 'Initiate M-Pesa STK Push', path: '/api/payments/mpesa/stk' },
      { key: 'sms_inbound_webhook', label: 'SMS Inbound Webhook', path: '/api/webhooks/sms' },
      { key: 'payments_callback', label: 'Payment Callback Webhook', path: '/api/payments/callback' }
    ]
  });
});

export default router;
