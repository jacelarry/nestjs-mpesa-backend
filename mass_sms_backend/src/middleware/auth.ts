import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';

declare global {
  namespace Express {
    interface Request { user?: { id: number; email: string }; }
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Missing bearer token' });
  }
  try {
    const token = auth.slice(7);
    const payload = verifyToken(token);
    if (!payload || typeof payload.id !== 'number' || typeof payload.email !== 'string') {
      return res.status(401).json({ error: true, message: 'Invalid token' });
    }
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: true, message: 'Invalid token' });
  }
}
