import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// データベースファイルのパス
const dbPath = path.join(__dirname, '..', 'bakery.db');

// データベース接続
export const db = new Database(dbPath);

/**
 * データベースの初期化
 * テーブルが存在しない場合は作成する
 */
export function initializeDatabase() {
  // 材料マスタテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL CHECK(unit IN ('g', 'ml', '個')),
      unit_price REAL NOT NULL,
      package_size REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // レシピテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      yield INTEGER NOT NULL,
      labor_time INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // レシピ材料テーブル（中間テーブル）
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipe_materials (
      recipe_id TEXT NOT NULL,
      material_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      PRIMARY KEY (recipe_id, material_id),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
    )
  `);

  // コスト設定テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS cost_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      labor_cost_per_hour REAL NOT NULL,
      overhead_cost_per_unit REAL NOT NULL,
      target_profit_margin REAL NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // デフォルトのコスト設定を挿入
  const settingsExists = db.prepare('SELECT COUNT(*) as count FROM cost_settings').get() as { count: number };
  if (settingsExists.count === 0) {
    db.prepare(`
      INSERT INTO cost_settings (id, labor_cost_per_hour, overhead_cost_per_unit, target_profit_margin, updated_at)
      VALUES (1, 1000, 10, 30, datetime('now'))
    `).run();
  }

  console.log('Database initialized successfully');
}

/**
 * データベースのクリーンアップ
 */
export function closeDatabase() {
  db.close();
}
