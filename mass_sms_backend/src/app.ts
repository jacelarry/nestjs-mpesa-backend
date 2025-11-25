const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { router: apiRouter } = require('./routes/index.js');
const { errorHandler } = require('./middleware/errorHandler.js');
const { applyGlobalRateLimit } = require('./middleware/rateLimit.js');

dotenv.config();

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('combined'));
  applyGlobalRateLimit(app);

  app.get('/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', apiRouter);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
