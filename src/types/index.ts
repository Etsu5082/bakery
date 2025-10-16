/**
 * 材料の単位
 */
export type MaterialUnit = 'g' | 'ml' | '個';

/**
 * 材料のカテゴリー
 */
export type MaterialCategory = '小麦粉' | '乳製品' | '糖類' | '油脂' | 'その他';

/**
 * 材料マスタ
 */
export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  unitPrice: number; // 仕入単価（円）
  packageSize: number; // 仕入単位量
  createdAt: string;
  updatedAt: string;
}

/**
 * レシピ材料
 */
export interface RecipeMaterial {
  materialId: string;
  quantity: number; // 使用量
  material?: Material; // 材料マスタの参照（取得時に含まれる）
}

/**
 * レシピ
 */
export interface Recipe {
  id: string;
  productName: string;
  yield: number; // 製造個数
  materials: RecipeMaterial[];
  laborTime: number; // 製造時間（分）
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * コスト設定
 */
export interface CostSettings {
  laborCostPerHour: number; // 時給（円）
  overheadCostPerUnit: number; // 1個あたりの光熱費等（円）
  targetProfitMargin: number; // 目標利益率（%）
}

/**
 * 原価計算結果
 */
export interface CostCalculation {
  recipeId: string;
  recipeName: string;
  yield: number;
  materialCost: number; // 材料費合計
  laborCost: number; // 人件費
  overheadCost: number; // 光熱費等
  totalCost: number; // 総原価
  unitCost: number; // 1個あたりの原価
  suggestedPrice: number; // 推奨販売価格
  profitMargin: number; // 利益率（%）
  materialBreakdown: MaterialCostBreakdown[]; // 材料別内訳
}

/**
 * 材料別原価内訳
 */
export interface MaterialCostBreakdown {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: MaterialUnit;
  cost: number;
}

/**
 * レポート用データ
 */
export interface CostReport {
  calculations: CostCalculation[];
  summary: {
    totalRecipes: number;
    averageUnitCost: number;
    averageProfitMargin: number;
    highestProfitMargin: CostCalculation | null;
    lowestProfitMargin: CostCalculation | null;
  };
}
