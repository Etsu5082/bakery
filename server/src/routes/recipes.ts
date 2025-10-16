import { Router } from 'express';
import { db } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

export const recipesRouter = Router();

interface RecipeRow {
  id: string;
  product_name: string;
  yield: number;
  labor_time: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RecipeMaterialRow {
  material_id: string;
  quantity: number;
}

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

// レシピの形式変換（DB → API）
function formatRecipe(row: RecipeRow, materials: any[]) {
  return {
    id: row.id,
    productName: row.product_name,
    yield: row.yield,
    materials,
    laborTime: row.labor_time,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 全レシピ取得
recipesRouter.get('/', (req, res) => {
  try {
    const recipes = db.prepare('SELECT * FROM recipes ORDER BY product_name').all() as RecipeRow[];

    const result = recipes.map(recipe => {
      const recipeMaterials = db.prepare(`
        SELECT rm.material_id, rm.quantity, m.*
        FROM recipe_materials rm
        JOIN materials m ON rm.material_id = m.id
        WHERE rm.recipe_id = ?
      `).all(recipe.id) as Array<RecipeMaterialRow & MaterialRow>;

      const materials = recipeMaterials.map(rm => ({
        materialId: rm.material_id,
        quantity: rm.quantity,
        material: {
          id: rm.id,
          name: rm.name,
          category: rm.category,
          unit: rm.unit,
          unitPrice: rm.unit_price,
          packageSize: rm.package_size,
          createdAt: rm.created_at,
          updatedAt: rm.updated_at,
        },
      }));

      return formatRecipe(recipe, materials);
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// 特定のレシピ取得
recipesRouter.get('/:id', (req, res) => {
  try {
    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id) as RecipeRow | undefined;
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipeMaterials = db.prepare(`
      SELECT rm.material_id, rm.quantity, m.*
      FROM recipe_materials rm
      JOIN materials m ON rm.material_id = m.id
      WHERE rm.recipe_id = ?
    `).all(recipe.id) as Array<RecipeMaterialRow & MaterialRow>;

    const materials = recipeMaterials.map(rm => ({
      materialId: rm.material_id,
      quantity: rm.quantity,
      material: {
        id: rm.id,
        name: rm.name,
        category: rm.category,
        unit: rm.unit,
        unitPrice: rm.unit_price,
        packageSize: rm.package_size,
        createdAt: rm.created_at,
        updatedAt: rm.updated_at,
      },
    }));

    res.json(formatRecipe(recipe, materials));
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// レシピ作成
recipesRouter.post('/', (req, res) => {
  try {
    const { productName, yield: recipeYield, materials, laborTime, notes } = req.body;

    // バリデーション
    if (!productName || !recipeYield || !materials || !Array.isArray(materials) || laborTime === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // トランザクション開始
    const insertRecipe = db.prepare(`
      INSERT INTO recipes (id, product_name, yield, labor_time, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMaterial = db.prepare(`
      INSERT INTO recipe_materials (recipe_id, material_id, quantity)
      VALUES (?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      insertRecipe.run(id, productName, recipeYield, laborTime, notes || null, now, now);

      for (const material of materials) {
        insertMaterial.run(id, material.materialId, material.quantity);
      }
    });

    transaction();

    // 作成されたレシピを取得
    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id) as RecipeRow;
    const recipeMaterials = db.prepare(`
      SELECT rm.material_id, rm.quantity, m.*
      FROM recipe_materials rm
      JOIN materials m ON rm.material_id = m.id
      WHERE rm.recipe_id = ?
    `).all(id) as Array<RecipeMaterialRow & MaterialRow>;

    const formattedMaterials = recipeMaterials.map(rm => ({
      materialId: rm.material_id,
      quantity: rm.quantity,
      material: {
        id: rm.id,
        name: rm.name,
        category: rm.category,
        unit: rm.unit,
        unitPrice: rm.unit_price,
        packageSize: rm.package_size,
        createdAt: rm.created_at,
        updatedAt: rm.updated_at,
      },
    }));

    res.status(201).json(formatRecipe(recipe, formattedMaterials));
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// レシピ更新
recipesRouter.put('/:id', (req, res) => {
  try {
    const { productName, yield: recipeYield, materials, laborTime, notes } = req.body;
    const { id } = req.params;

    // 存在確認
    const exists = db.prepare('SELECT id FROM recipes WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const now = new Date().toISOString();

    const updateRecipe = db.prepare(`
      UPDATE recipes
      SET product_name = ?, yield = ?, labor_time = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `);

    const deleteMaterials = db.prepare('DELETE FROM recipe_materials WHERE recipe_id = ?');

    const insertMaterial = db.prepare(`
      INSERT INTO recipe_materials (recipe_id, material_id, quantity)
      VALUES (?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      updateRecipe.run(productName, recipeYield, laborTime, notes || null, now, id);
      deleteMaterials.run(id);

      for (const material of materials) {
        insertMaterial.run(id, material.materialId, material.quantity);
      }
    });

    transaction();

    // 更新されたレシピを取得
    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id) as RecipeRow;
    const recipeMaterials = db.prepare(`
      SELECT rm.material_id, rm.quantity, m.*
      FROM recipe_materials rm
      JOIN materials m ON rm.material_id = m.id
      WHERE rm.recipe_id = ?
    `).all(id) as Array<RecipeMaterialRow & MaterialRow>;

    const formattedMaterials = recipeMaterials.map(rm => ({
      materialId: rm.material_id,
      quantity: rm.quantity,
      material: {
        id: rm.id,
        name: rm.name,
        category: rm.category,
        unit: rm.unit,
        unitPrice: rm.unit_price,
        packageSize: rm.package_size,
        createdAt: rm.created_at,
        updatedAt: rm.updated_at,
      },
    }));

    res.json(formatRecipe(recipe, formattedMaterials));
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// レシピ削除
recipesRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // 存在確認
    const exists = db.prepare('SELECT id FROM recipes WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// レシピのコピー
recipesRouter.post('/:id/copy', (req, res) => {
  try {
    const { id } = req.params;

    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id) as RecipeRow | undefined;
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipeMaterials = db.prepare('SELECT * FROM recipe_materials WHERE recipe_id = ?').all(id) as RecipeMaterialRow[];

    const newId = uuidv4();
    const now = new Date().toISOString();

    const insertRecipe = db.prepare(`
      INSERT INTO recipes (id, product_name, yield, labor_time, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMaterial = db.prepare(`
      INSERT INTO recipe_materials (recipe_id, material_id, quantity)
      VALUES (?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      insertRecipe.run(
        newId,
        `${recipe.product_name} (コピー)`,
        recipe.yield,
        recipe.labor_time,
        recipe.notes,
        now,
        now
      );

      for (const material of recipeMaterials) {
        insertMaterial.run(newId, material.material_id, material.quantity);
      }
    });

    transaction();

    // 作成されたレシピを取得
    const newRecipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(newId) as RecipeRow;
    const newRecipeMaterials = db.prepare(`
      SELECT rm.material_id, rm.quantity, m.*
      FROM recipe_materials rm
      JOIN materials m ON rm.material_id = m.id
      WHERE rm.recipe_id = ?
    `).all(newId) as Array<RecipeMaterialRow & MaterialRow>;

    const formattedMaterials = newRecipeMaterials.map(rm => ({
      materialId: rm.material_id,
      quantity: rm.quantity,
      material: {
        id: rm.id,
        name: rm.name,
        category: rm.category,
        unit: rm.unit,
        unitPrice: rm.unit_price,
        packageSize: rm.package_size,
        createdAt: rm.created_at,
        updatedAt: rm.updated_at,
      },
    }));

    res.status(201).json(formatRecipe(newRecipe, formattedMaterials));
  } catch (error) {
    console.error('Error copying recipe:', error);
    res.status(500).json({ error: 'Failed to copy recipe' });
  }
});
