const pool = require('../config/database');

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // 夫婦テーブル
    await pool.query(`
      CREATE TABLE IF NOT EXISTS couples (
        id SERIAL PRIMARY KEY,
        couple_id VARCHAR(255) UNIQUE NOT NULL,
        couple_name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // レギュラーアイテムテーブル
    await pool.query(`
      CREATE TABLE IF NOT EXISTS regular_items (
        id SERIAL PRIMARY KEY,
        item_id VARCHAR(255) UNIQUE NOT NULL,
        couple_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (couple_id) REFERENCES couples(couple_id) ON DELETE CASCADE
      )
    `);

    // インデックスの作成
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_regular_items_couple_id ON regular_items(couple_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_regular_items_category_id ON regular_items(category_id)
    `);

    console.log('Database setup completed successfully!');
    
    // テーブル一覧を表示
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Created tables:');
    result.rows.forEach(row => {
      console.log('- ' + row.table_name);
    });

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();