import { Router } from 'express';
import { db } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

export const materialsRouter = Router();

interface MaterialRow {
  id: string;
  name: string;
  category: string;
  unit: string;
  unit_price: number;
  package_size: number;
  created_at: string;
  updated_at: string;
}

// 材料の形式変換（DB → API）
function formatMaterial(row: MaterialRow) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    unit: row.unit,
    unitPrice: row.unit_price,
    packageSize: row.package_size,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 全材料取得
materialsRouter.get('/', (req, res) => {
  try {
    const materials = db.prepare('SELECT * FROM materials ORDER BY category, name').all() as MaterialRow[];
    res.json(materials.map(formatMaterial));
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// 特定の材料取得
materialsRouter.get('/:id', (req, res) => {
  try {
    const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id) as MaterialRow | undefined;
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(formatMaterial(material));
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

// 材料作成
materialsRouter.post('/', (req, res) => {
  try {
    const { name, category, unit, unitPrice, packageSize } = req.body;

    // バリデーション
    if (!name || !category || !unit || unitPrice === undefined || packageSize === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO materials (id, name, category, unit, unit_price, package_size, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, category, unit, unitPrice, packageSize, now, now);

    const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(id) as MaterialRow;
    res.status(201).json(formatMaterial(material));
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// 材料更新
materialsRouter.put('/:id', (req, res) => {
  try {
    const { name, category, unit, unitPrice, packageSize } = req.body;
    const { id } = req.params;

    // 存在確認
    const exists = db.prepare('SELECT id FROM materials WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE materials
      SET name = ?, category = ?, unit = ?, unit_price = ?, package_size = ?, updated_at = ?
      WHERE id = ?
    `).run(name, category, unit, unitPrice, packageSize, now, id);

    const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(id) as MaterialRow;
    res.json(formatMaterial(material));
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// 材料削除
materialsRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // 存在確認
    const exists = db.prepare('SELECT id FROM materials WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // レシピで使用されているかチェック
    const usedInRecipes = db.prepare('SELECT COUNT(*) as count FROM recipe_materials WHERE material_id = ?').get(id) as { count: number };
    if (usedInRecipes.count > 0) {
      return res.status(400).json({ error: 'Material is used in recipes and cannot be deleted' });
    }

    db.prepare('DELETE FROM materials WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});
