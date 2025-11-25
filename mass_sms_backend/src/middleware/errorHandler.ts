import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
}
