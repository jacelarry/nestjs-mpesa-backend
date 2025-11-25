import { Router } from 'express';
import { pool } from '../config/database.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    if (!from || !message) return res.status(400).json({ message: 'from & message required' });
    const payload = req.body;
    await pool.query('INSERT INTO inbound_sms(from_number,to_number,message,raw_payload) VALUES($1,$2,$3,$4)', [from, to || null, message, payload]);
    res.json({ stored: true });
  } catch (e) { next(e); }
});

export default router;
