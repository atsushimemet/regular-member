const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const predictionsRoutes = require('./routes/predictions');
const { predictionsEnabled, predictorUrl, isAllowlistEnabled, getAllowlistSize } = require('./config/featureFlags');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/predictions', predictionsRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Regular Shopping App API is running',
    predictions: {
      enabled: predictionsEnabled,
      allowlistEnabled: isAllowlistEnabled(),
      allowlistSize: getAllowlistSize(),
      predictorUrlConfigured: Boolean(predictorUrl)
    }
  });
});

// 404エラーハンドリング
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// エラーハンドリングミドルウェア
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// サーバー開始
app.listen(PORT, () => {
  logger.info('Server started', { port: PORT });
  logger.info('Predictions feature flags', {
    predictionsEnabled,
    allowlistEnabled: isAllowlistEnabled(),
    allowlistSize: getAllowlistSize(),
    predictorUrl
  });
  logger.info('API endpoints available', { baseUrl: `http://localhost:${PORT}/api` });
});
