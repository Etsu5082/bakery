import { Router } from 'express';
import { db } from '../database.js';

export const costRouter = Router();

interface CostSettingsRow {
  labor_cost_per_hour: number;
  overhead_cost_per_unit: number;
  target_profit_margin: number;
  updated_at: string;
}

interface RecipeRow {
  id: string;
  product_name: string;
  yield: number;
  labor_time: number;
}

interface RecipeMaterialRow {
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  package_size: number;
}

// コスト設定取得
costRouter.get('/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM cost_settings WHERE id = 1').get() as CostSettingsRow | undefined;
    if (!settings) {
      return res.status(404).json({ error: 'Cost settings not found' });
    }

    res.json({
      laborCostPerHour: settings.labor_cost_per_hour,
      overheadCostPerUnit: settings.overhead_cost_per_unit,
      targetProfitMargin: settings.target_profit_margin,
    });
  } catch (error) {
    console.error('Error fetching cost settings:', error);
    res.status(500).json({ error: 'Failed to fetch cost settings' });
  }
});

// コスト設定更新
costRouter.put('/settings', (req, res) => {
  try {
    const { laborCostPerHour, overheadCostPerUnit, targetProfitMargin } = req.body;

    if (laborCostPerHour === undefined || overheadCostPerUnit === undefined || targetProfitMargin === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE cost_settings
      SET labor_cost_per_hour = ?, overhead_cost_per_unit = ?, target_profit_margin = ?, updated_at = ?
      WHERE id = 1
    `).run(laborCostPerHour, overheadCostPerUnit, targetProfitMargin, now);

    res.json({
      laborCostPerHour,
      overheadCostPerUnit,
      targetProfitMargin,
    });
  } catch (error) {
    console.error('Error updating cost settings:', error);
    res.status(500).json({ error: 'Failed to update cost settings' });
  }
});

// 原価計算（特定のレシピ）
costRouter.get('/calculate/:recipeId', (req, res) => {
  try {
    const { recipeId } = req.params;

    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId) as RecipeRow | undefined;
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const settings = db.prepare('SELECT * FROM cost_settings WHERE id = 1').get() as CostSettingsRow;

    const materials = db.prepare(`
      SELECT
        rm.material_id,
        m.name as material_name,
        rm.quantity,
        m.unit,
        m.unit_price,
        m.package_size
      FROM recipe_materials rm
      JOIN materials m ON rm.material_id = m.id
      WHERE rm.recipe_id = ?
    `).all(recipeId) as RecipeMaterialRow[];

    // 材料費計算
    let materialCost = 0;
    const materialBreakdown = materials.map(m => {
      const cost = (m.unit_price / m.package_size) * m.quantity;
      materialCost += cost;
      return {
        materialId: m.material_id,
        materialName: m.material_name,
        quantity: m.quantity,
        unit: m.unit,
        cost: Math.round(cost * 100) / 100,
      };
    });

    // 人件費計算（時給 × 製造時間（分）/ 60）
    const laborCost = (settings.labor_cost_per_hour * recipe.labor_time) / 60;

    // 光熱費等計算（1個あたり × 製造個数）
    const overheadCost = settings.overhead_cost_per_unit * recipe.yield;

    // 総原価
    const totalCost = materialCost + laborCost + overheadCost;

    // 1個あたりの原価
    const unitCost = totalCost / recipe.yield;

    // 推奨販売価格（原価 / (1 - 利益率)）
    const suggestedPrice = unitCost / (1 - settings.target_profit_margin / 100);

    // 実際の利益率
    const profitMargin = settings.target_profit_margin;

    res.json({
      recipeId: recipe.id,
      recipeName: recipe.product_name,
      yield: recipe.yield,
      materialCost: Math.round(materialCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      overheadCost: Math.round(overheadCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      unitCost: Math.round(unitCost * 100) / 100,
      suggestedPrice: Math.round(suggestedPrice),
      profitMargin: Math.round(profitMargin * 100) / 100,
      materialBreakdown,
    });
  } catch (error) {
    console.error('Error calculating cost:', error);
    res.status(500).json({ error: 'Failed to calculate cost' });
  }
});

// 原価計算（全レシピ）
costRouter.get('/calculate', (req, res) => {
  try {
    const recipes = db.prepare('SELECT * FROM recipes').all() as RecipeRow[];
    const settings = db.prepare('SELECT * FROM cost_settings WHERE id = 1').get() as CostSettingsRow;

    const calculations = recipes.map(recipe => {
      const materials = db.prepare(`
        SELECT
          rm.material_id,
          m.name as material_name,
          rm.quantity,
          m.unit,
          m.unit_price,
          m.package_size
        FROM recipe_materials rm
        JOIN materials m ON rm.material_id = m.id
        WHERE rm.recipe_id = ?
      `).all(recipe.id) as RecipeMaterialRow[];

      // 材料費計算
      let materialCost = 0;
      const materialBreakdown = materials.map(m => {
        const cost = (m.unit_price / m.package_size) * m.quantity;
        materialCost += cost;
        return {
          materialId: m.material_id,
          materialName: m.material_name,
          quantity: m.quantity,
          unit: m.unit,
          cost: Math.round(cost * 100) / 100,
        };
      });

      // 人件費計算
      const laborCost = (settings.labor_cost_per_hour * recipe.labor_time) / 60;

      // 光熱費等計算
      const overheadCost = settings.overhead_cost_per_unit * recipe.yield;

      // 総原価
      const totalCost = materialCost + laborCost + overheadCost;

      // 1個あたりの原価
      const unitCost = totalCost / recipe.yield;

      // 推奨販売価格
      const suggestedPrice = unitCost / (1 - settings.target_profit_margin / 100);

      return {
        recipeId: recipe.id,
        recipeName: recipe.product_name,
        yield: recipe.yield,
        materialCost: Math.round(materialCost * 100) / 100,
        laborCost: Math.round(laborCost * 100) / 100,
        overheadCost: Math.round(overheadCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        unitCost: Math.round(unitCost * 100) / 100,
        suggestedPrice: Math.round(suggestedPrice),
        profitMargin: Math.round(settings.target_profit_margin * 100) / 100,
        materialBreakdown,
      };
    });

    res.json(calculations);
  } catch (error) {
    console.error('Error calculating costs:', error);
    res.status(500).json({ error: 'Failed to calculate costs' });
  }
});

// レポート生成
costRouter.get('/report', (req, res) => {
  try {
    const recipes = db.prepare('SELECT * FROM recipes').all() as RecipeRow[];
    const settings = db.prepare('SELECT * FROM cost_settings WHERE id = 1').get() as CostSettingsRow;

    const calculations = recipes.map(recipe => {
      const materials = db.prepare(`
        SELECT
          rm.material_id,
          m.name as material_name,
          rm.quantity,
          m.unit,
          m.unit_price,
          m.package_size
        FROM recipe_materials rm
        JOIN materials m ON rm.material_id = m.id
        WHERE rm.recipe_id = ?
      `).all(recipe.id) as RecipeMaterialRow[];

      let materialCost = 0;
      const materialBreakdown = materials.map(m => {
        const cost = (m.unit_price / m.package_size) * m.quantity;
        materialCost += cost;
        return {
          materialId: m.material_id,
          materialName: m.material_name,
          quantity: m.quantity,
          unit: m.unit,
          cost: Math.round(cost * 100) / 100,
        };
      });

      const laborCost = (settings.labor_cost_per_hour * recipe.labor_time) / 60;
      const overheadCost = settings.overhead_cost_per_unit * recipe.yield;
      const totalCost = materialCost + laborCost + overheadCost;
      const unitCost = totalCost / recipe.yield;
      const suggestedPrice = unitCost / (1 - settings.target_profit_margin / 100);

      return {
        recipeId: recipe.id,
        recipeName: recipe.product_name,
        yield: recipe.yield,
        materialCost: Math.round(materialCost * 100) / 100,
        laborCost: Math.round(laborCost * 100) / 100,
        overheadCost: Math.round(overheadCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        unitCost: Math.round(unitCost * 100) / 100,
        suggestedPrice: Math.round(suggestedPrice),
        profitMargin: Math.round(settings.target_profit_margin * 100) / 100,
        materialBreakdown,
      };
    });

    // サマリー計算
    const totalRecipes = calculations.length;
    const averageUnitCost = totalRecipes > 0
      ? calculations.reduce((sum, c) => sum + c.unitCost, 0) / totalRecipes
      : 0;
    const averageProfitMargin = totalRecipes > 0
      ? calculations.reduce((sum, c) => sum + c.profitMargin, 0) / totalRecipes
      : 0;

    const sortedByProfit = [...calculations].sort((a, b) => b.profitMargin - a.profitMargin);
    const highestProfitMargin = sortedByProfit[0] || null;
    const lowestProfitMargin = sortedByProfit[sortedByProfit.length - 1] || null;

    res.json({
      calculations,
      summary: {
        totalRecipes,
        averageUnitCost: Math.round(averageUnitCost * 100) / 100,
        averageProfitMargin: Math.round(averageProfitMargin * 100) / 100,
        highestProfitMargin,
        lowestProfitMargin,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});
