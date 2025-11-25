import { Router } from 'express';
import authRoutes from './authRoutes.js';
import menuRoutes from './menuRoutes.js';
import tokenRoutes from './tokenRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import smsWebhookRoutes from './smsWebhookRoutes.js';
import smsApiRoutes from './smsApiRoutes.js';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/tokens', tokenRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks/sms', smsWebhookRoutes);
router.use('/sms', smsApiRoutes);
