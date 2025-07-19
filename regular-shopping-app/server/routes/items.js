const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// レギュラーアイテム一覧取得
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { coupleId } = req.user;

    const result = await pool.query(
      'SELECT item_id, name, category_id, created_at FROM regular_items WHERE couple_id = $1 ORDER BY created_at ASC',
      [coupleId]
    );

    const items = result.rows.map(row => ({
      id: row.item_id,
      name: row.name,
      categoryId: row.category_id,
      createdAt: row.created_at
    }));

    res.json({ items });

  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// レギュラーアイテム追加
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { coupleId } = req.user;
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    // ユニークなアイテムIDを生成
    const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    await pool.query(
      'INSERT INTO regular_items (item_id, couple_id, name, category_id) VALUES ($1, $2, $3, $4)',
      [itemId, coupleId, name, categoryId]
    );

    // 追加されたアイテムを取得
    const result = await pool.query(
      'SELECT item_id, name, category_id, created_at FROM regular_items WHERE item_id = $1',
      [itemId]
    );

    const newItem = result.rows[0];
    const item = {
      id: newItem.item_id,
      name: newItem.name,
      categoryId: newItem.category_id,
      createdAt: newItem.created_at
    };

    res.status(201).json({
      message: 'Item added successfully',
      item
    });

  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// レギュラーアイテム削除
router.delete('/:itemId', authenticateToken, async (req, res) => {
  try {
    const { coupleId } = req.user;
    const { itemId } = req.params;

    // アイテムが存在し、夫婦に属しているかチェック
    const checkResult = await pool.query(
      'SELECT item_id FROM regular_items WHERE item_id = $1 AND couple_id = $2',
      [itemId, coupleId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or access denied' });
    }

    // アイテムを削除
    await pool.query(
      'DELETE FROM regular_items WHERE item_id = $1 AND couple_id = $2',
      [itemId, coupleId]
    );

    res.json({ message: 'Item deleted successfully' });

  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// レギュラーアイテム更新
router.put('/:itemId', authenticateToken, async (req, res) => {
  try {
    const { coupleId } = req.user;
    const { itemId } = req.params;
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    // アイテムが存在し、夫婦に属しているかチェック
    const checkResult = await pool.query(
      'SELECT item_id FROM regular_items WHERE item_id = $1 AND couple_id = $2',
      [itemId, coupleId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or access denied' });
    }

    // アイテムを更新
    await pool.query(
      'UPDATE regular_items SET name = $1, category_id = $2 WHERE item_id = $3 AND couple_id = $4',
      [name, categoryId, itemId, coupleId]
    );

    // 更新されたアイテムを取得
    const result = await pool.query(
      'SELECT item_id, name, category_id, created_at FROM regular_items WHERE item_id = $1',
      [itemId]
    );

    const updatedItem = result.rows[0];
    const item = {
      id: updatedItem.item_id,
      name: updatedItem.name,
      categoryId: updatedItem.category_id,
      createdAt: updatedItem.created_at
    };

    res.json({
      message: 'Item updated successfully',
      item
    });

  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;