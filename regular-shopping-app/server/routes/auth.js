const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const router = express.Router();

// 認証サービスヘルスチェック
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Auth service is running',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      verify: 'GET /api/auth/verify'
    }
  });
});

// 夫婦登録
router.post('/register', async (req, res) => {
  try {
    const { coupleId, coupleName, password } = req.body;

    if (!coupleId || !coupleName || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 既存の夫婦IDをチェック
    const existingCouple = await pool.query(
      'SELECT couple_id FROM couples WHERE couple_id = $1',
      [coupleId]
    );

    if (existingCouple.rows.length > 0) {
      return res.status(400).json({ error: 'Couple ID already exists' });
    }

    // パスワードをハッシュ化
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 夫婦を登録
    await pool.query(
      'INSERT INTO couples (couple_id, couple_name, password_hash) VALUES ($1, $2, $3)',
      [coupleId, coupleName, passwordHash]
    );

    // JWTトークンを生成
    const token = jwt.sign(
      { coupleId, coupleName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Couple registered successfully',
      token,
      couple: {
        coupleId,
        coupleName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 夫婦ログイン
router.post('/login', async (req, res) => {
  try {
    const { coupleId, password } = req.body;

    if (!coupleId || !password) {
      return res.status(400).json({ error: 'Couple ID and password are required' });
    }

    // 夫婦を検索
    const result = await pool.query(
      'SELECT couple_id, couple_name, password_hash FROM couples WHERE couple_id = $1',
      [coupleId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid couple ID or password' });
    }

    const couple = result.rows[0];

    // パスワードを確認
    const isValidPassword = await bcrypt.compare(password, couple.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid couple ID or password' });
    }

    // JWTトークンを生成
    const token = jwt.sign(
      { coupleId: couple.couple_id, coupleName: couple.couple_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      couple: {
        coupleId: couple.couple_id,
        coupleName: couple.couple_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// トークン検証
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // データベースで夫婦の存在を確認
    const result = await pool.query(
      'SELECT couple_id, couple_name FROM couples WHERE couple_id = $1',
      [decoded.coupleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Couple not found' });
    }

    const couple = result.rows[0];

    res.json({
      valid: true,
      couple: {
        coupleId: couple.couple_id,
        coupleName: couple.couple_name
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
