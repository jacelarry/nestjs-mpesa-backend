import rateLimit from 'express-rate-limit';
import type { Express } from 'express';

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later.',
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many payment requests, please try again later.',
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // per hour window
  max: 30, // max OTP requests per IP per hour
  message: 'Too many OTP requests from this IP, please slow down.',
});

export function applyGlobalRateLimit(app: Express) {
  app.use(globalLimiter);
}
