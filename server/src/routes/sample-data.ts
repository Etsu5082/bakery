import { Router } from 'express';
import { db } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

export const sampleDataRouter = Router();

// サンプルデータ生成
sampleDataRouter.post('/generate', (req, res) => {
  try {
    const now = new Date().toISOString();

    // 既存データの確認
    const materialCount = db.prepare('SELECT COUNT(*) as count FROM materials').get() as { count: number };
    if (materialCount.count > 0) {
      return res.status(400).json({ error: 'Database already contains data. Clear data first before generating sample data.' });
    }

    // サンプル材料データ
    const sampleMaterials = [
      // 小麦粉
      { id: uuidv4(), name: '強力粉', category: '小麦粉', unit: 'g', unitPrice: 500, packageSize: 1000 },
      { id: uuidv4(), name: '薄力粉', category: '小麦粉', unit: 'g', unitPrice: 400, packageSize: 1000 },
      { id: uuidv4(), name: '全粒粉', category: '小麦粉', unit: 'g', unitPrice: 600, packageSize: 1000 },
      // 乳製品
      { id: uuidv4(), name: '牛乳', category: '乳製品', unit: 'ml', unitPrice: 200, packageSize: 1000 },
      { id: uuidv4(), name: 'バター', category: '乳製品', unit: 'g', unitPrice: 800, packageSize: 200 },
      { id: uuidv4(), name: '生クリーム', category: '乳製品', unit: 'ml', unitPrice: 400, packageSize: 200 },
      { id: uuidv4(), name: 'クリームチーズ', category: '乳製品', unit: 'g', unitPrice: 600, packageSize: 200 },
      // 糖類
      { id: uuidv4(), name: 'グラニュー糖', category: '糖類', unit: 'g', unitPrice: 300, packageSize: 1000 },
      { id: uuidv4(), name: '上白糖', category: '糖類', unit: 'g', unitPrice: 250, packageSize: 1000 },
      { id: uuidv4(), name: 'はちみつ', category: '糖類', unit: 'g', unitPrice: 1200, packageSize: 500 },
      // 油脂
      { id: uuidv4(), name: 'サラダ油', category: '油脂', unit: 'ml', unitPrice: 400, packageSize: 1000 },
      { id: uuidv4(), name: 'オリーブオイル', category: '油脂', unit: 'ml', unitPrice: 800, packageSize: 500 },
      // その他
      { id: uuidv4(), name: '卵', category: 'その他', unit: '個', unitPrice: 300, packageSize: 10 },
      { id: uuidv4(), name: 'ドライイースト', category: 'その他', unit: 'g', unitPrice: 500, packageSize: 100 },
      { id: uuidv4(), name: '塩', category: 'その他', unit: 'g', unitPrice: 100, packageSize: 1000 },
      { id: uuidv4(), name: 'ベーキングパウダー', category: 'その他', unit: 'g', unitPrice: 400, packageSize: 100 },
      { id: uuidv4(), name: 'チョコチップ', category: 'その他', unit: 'g', unitPrice: 800, packageSize: 200 },
      { id: uuidv4(), name: 'レーズン', category: 'その他', unit: 'g', unitPrice: 600, packageSize: 200 },
    ];

    // 材料をデータベースに挿入
    const insertMaterial = db.prepare(`
      INSERT INTO materials (id, name, category, unit, unit_price, package_size, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const material of sampleMaterials) {
      insertMaterial.run(
        material.id,
        material.name,
        material.category,
        material.unit,
        material.unitPrice,
        material.packageSize,
        now,
        now
      );
    }

    // 材料IDマップを作成（名前からIDを検索しやすくする）
    const materialMap = new Map(sampleMaterials.map(m => [m.name, m.id]));

    // サンプルレシピデータ
    const sampleRecipes = [
      {
        id: uuidv4(),
        productName: '食パン',
        yield: 1,
        laborTime: 180,
        notes: '定番の食パン。ふわふわ食感が人気です。',
        materials: [
          { materialId: materialMap.get('強力粉')!, quantity: 300 },
          { materialId: materialMap.get('牛乳')!, quantity: 180 },
          { materialId: materialMap.get('バター')!, quantity: 20 },
          { materialId: materialMap.get('グラニュー糖')!, quantity: 20 },
          { materialId: materialMap.get('ドライイースト')!, quantity: 4 },
          { materialId: materialMap.get('塩')!, quantity: 5 },
        ],
      },
      {
        id: uuidv4(),
        productName: 'クロワッサン',
        yield: 8,
        laborTime: 240,
        notes: 'バター折り込みの本格クロワッサン。',
        materials: [
          { materialId: materialMap.get('強力粉')!, quantity: 250 },
          { materialId: materialMap.get('バター')!, quantity: 150 },
          { materialId: materialMap.get('牛乳')!, quantity: 120 },
          { materialId: materialMap.get('グラニュー糖')!, quantity: 30 },
          { materialId: materialMap.get('ドライイースト')!, quantity: 5 },
          { materialId: materialMap.get('塩')!, quantity: 5 },
          { materialId: materialMap.get('卵')!, quantity: 1 },
        ],
      },
      {
        id: uuidv4(),
        productName: 'メロンパン',
        yield: 10,
        laborTime: 150,
        notes: 'サクサククッキー生地が特徴。子供に人気。',
        materials: [
          { materialId: materialMap.get('強力粉')!, quantity: 200 },
          { materialId: materialMap.get('薄力粉')!, quantity: 100 },
          { materialId: materialMap.get('バター')!, quantity: 80 },
          { materialId: materialMap.get('グラニュー糖')!, quantity: 80 },
          { materialId: materialMap.get('卵')!, quantity: 2 },
          { materialId: materialMap.get('牛乳')!, quantity: 100 },
          { materialId: materialMap.get('ドライイースト')!, quantity: 4 },
          { materialId: materialMap.get('塩')!, quantity: 3 },
        ],
      },
      {
        id: uuidv4(),
        productName: 'ベーグル',
        yield: 6,
        laborTime: 120,
        notes: 'もちもち食感のヘルシーなパン。',
        materials: [
          { materialId: materialMap.get('強力粉')!, quantity: 300 },
          { materialId: materialMap.get('グラニュー糖')!, quantity: 15 },
          { materialId: materialMap.get('ドライイースト')!, quantity: 4 },
          { materialId: materialMap.get('塩')!, quantity: 5 },
          { materialId: materialMap.get('はちみつ')!, quantity: 20 },
        ],
      },
      {
        id: uuidv4(),
        productName: 'チョコチップマフィン',
        yield: 12,
        laborTime: 60,
        notes: 'チョコチップたっぷりのリッチなマフィン。',
        materials: [
          { materialId: materialMap.get('薄力粉')!, quantity: 200 },
          { materialId: materialMap.get('バター')!, quantity: 100 },
          { materialId: materialMap.get('グラニュー糖')!, quantity: 100 },
          { materialId: materialMap.get('卵')!, quantity: 2 },
          { materialId: materialMap.get('牛乳')!, quantity: 100 },
          { materialId: materialMap.get('ベーキングパウダー')!, quantity: 8 },
          { materialId: materialMap.get('チョコチップ')!, quantity: 100 },
        ],
      },
      {
        id: uuidv4(),
        productName: 'レーズンパン',
        yield: 8,
        laborTime: 150,
        notes: 'レーズンの甘みが広がる定番パン。',
        materials: [
          { materialId: materialMap.get('強力粉')!, quantity: 250 },
          { materialId: materialMap.get('牛乳')!, quantity: 150 },
          { materialId: materialMap.get('バター')!, quantity: 30 },
          { materialId: materialMap.get('グラニュー糖')!, quantity: 30 },
          { materialId: materialMap.get('ドライイースト')!, quantity: 4 },
          { materialId: materialMap.get('塩')!, quantity: 4 },
          { materialId: materialMap.get('レーズン')!, quantity: 80 },
        ],
      },
    ];

    // レシピをデータベースに挿入
    const insertRecipe = db.prepare(`
      INSERT INTO recipes (id, product_name, yield, labor_time, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertRecipeMaterial = db.prepare(`
      INSERT INTO recipe_materials (recipe_id, material_id, quantity)
      VALUES (?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      for (const recipe of sampleRecipes) {
        insertRecipe.run(
          recipe.id,
          recipe.productName,
          recipe.yield,
          recipe.laborTime,
          recipe.notes,
          now,
          now
        );

        for (const material of recipe.materials) {
          insertRecipeMaterial.run(recipe.id, material.materialId, material.quantity);
        }
      }
    });

    transaction();

    res.json({
      message: 'Sample data generated successfully',
      materialsCreated: sampleMaterials.length,
      recipesCreated: sampleRecipes.length,
    });
  } catch (error) {
    console.error('Error generating sample data:', error);
    res.status(500).json({ error: 'Failed to generate sample data' });
  }
});

// データベースクリア
sampleDataRouter.delete('/clear', (req, res) => {
  try {
    db.prepare('DELETE FROM recipe_materials').run();
    db.prepare('DELETE FROM recipes').run();
    db.prepare('DELETE FROM materials').run();

    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});
