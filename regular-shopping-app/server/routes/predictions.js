const express = require('express');
const router = express.Router();
const { predictionsEnabled, predictorUrl } = require('../config/featureFlags');
const logger = require('../utils/logger');

// 確率マトリックス（Flaskサービスから移植）
const probabilityMatrix = {
  "dairy": {
    "0-1": 0.8,
    "2-3": 0.6,
    "4-7": 0.4,
    "8-14": 0.2,
    "15-30": 0.1,
    "31+": 0.05
  },
  "frozen": {
    "0-1": 0.9,
    "2-3": 0.8,
    "4-7": 0.7,
    "8-14": 0.5,
    "15-30": 0.3,
    "31+": 0.1
  },
  "vegetables": {
    "0-1": 0.6,
    "2-3": 0.3,
    "4-7": 0.1,
    "8-14": 0.05,
    "15-30": 0.02,
    "31+": 0.01
  },
  "fruits": {
    "0-1": 0.7,
    "2-3": 0.4,
    "4-7": 0.2,
    "8-14": 0.1,
    "15-30": 0.05,
    "31+": 0.02
  },
  "meat": {
    "0-1": 0.8,
    "2-3": 0.5,
    "4-7": 0.2,
    "8-14": 0.1,
    "15-30": 0.05,
    "31+": 0.02
  },
  "fish": {
    "0-1": 0.8,
    "2-3": 0.4,
    "4-7": 0.1,
    "8-14": 0.05,
    "15-30": 0.02,
    "31+": 0.01
  },
  "beans": {
    "0-1": 0.9,
    "2-3": 0.8,
    "4-7": 0.7,
    "8-14": 0.6,
    "15-30": 0.4,
    "31+": 0.2
  },
  "mushrooms": {
    "0-1": 0.6,
    "2-3": 0.3,
    "4-7": 0.1,
    "8-14": 0.05,
    "15-30": 0.02,
    "31+": 0.01
  },
  "bread": {
    "0-1": 0.8,
    "2-3": 0.5,
    "4-7": 0.2,
    "8-14": 0.1,
    "15-30": 0.05,
    "31+": 0.02
  },
  "beverages": {
    "0-1": 0.9,
    "2-3": 0.8,
    "4-7": 0.7,
    "8-14": 0.6,
    "15-30": 0.4,
    "31+": 0.2
  },
  "snacks": {
    "0-1": 0.8,
    "2-3": 0.6,
    "4-7": 0.4,
    "8-14": 0.3,
    "15-30": 0.2,
    "31+": 0.1
  },
  "other": {
    "0-1": 0.7,
    "2-3": 0.5,
    "4-7": 0.3,
    "8-14": 0.2,
    "15-30": 0.1,
    "31+": 0.05
  }
};

// 確率計算関数
function getProbability(categoryId, daysSinceLastPurchase) {
  const categoryData = probabilityMatrix[categoryId];
  
  if (!categoryData) {
    logger.warn(`Unknown category: ${categoryId}`);
    return 0.5; // デフォルト確率
  }

  // 日数範囲の決定
  let dayRange;
  if (daysSinceLastPurchase <= 1) {
    dayRange = "0-1";
  } else if (daysSinceLastPurchase <= 3) {
    dayRange = "2-3";
  } else if (daysSinceLastPurchase <= 7) {
    dayRange = "4-7";
  } else if (daysSinceLastPurchase <= 14) {
    dayRange = "8-14";
  } else if (daysSinceLastPurchase <= 30) {
    dayRange = "15-30";
  } else {
    dayRange = "31+";
  }

  return categoryData[dayRange] || 0.5;
}

// 予測エンドポイント
router.post('/predict', async (req, res) => {
  try {
    // 機能フラグチェック
    if (!predictionsEnabled) {
      return res.status(403).json({
        error: 'Predictions feature is disabled',
        message: 'This feature is currently not available'
      });
    }

    const { items } = req.body;

    // 入力検証
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'Items array is required'
      });
    }

    // 予測計算
    const predictions = items.map(item => {
      const { categoryId, daysSinceLastPurchase } = item;
      
      // 入力検証
      if (!categoryId || typeof daysSinceLastPurchase !== 'number' || daysSinceLastPurchase < 0) {
        return {
          categoryId,
          daysSinceLastPurchase,
          probability: 0.5,
          error: 'Invalid input parameters'
        };
      }

      const probability = getProbability(categoryId, daysSinceLastPurchase);
      
      return {
        categoryId,
        daysSinceLastPurchase,
        probability
      };
    });

    logger.info('Prediction request processed', {
      itemCount: items.length,
      predictions: predictions.map(p => ({ categoryId: p.categoryId, probability: p.probability }))
    });

    res.json({ predictions });

  } catch (error) {
    logger.error('Error in prediction endpoint', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process prediction request'
    });
  }
});

// メトリクスエンドポイント
router.get('/metrics', (req, res) => {
  try {
    // 簡単なメトリクス（実際の実装ではより詳細な統計を追加）
    res.json({
      total_categories: Object.keys(probabilityMatrix).length,
      prediction_logic: 'integrated',
      version: '1.0.0'
    });
  } catch (error) {
    logger.error('Error in metrics endpoint', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 
