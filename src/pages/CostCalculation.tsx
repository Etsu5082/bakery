import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { CostCalculation } from '../types';

/**
 * 原価計算ページ
 */
export const CostCalculation: React.FC = () => {
  const [calculations, setCalculations] = useState<CostCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = async () => {
    try {
      const data = await api.calculateAllCosts();
      setCalculations(data);
    } catch (error) {
      console.error('Failed to load calculations:', error);
      alert('原価計算の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (recipeId: string) => {
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
  };

  const formatCurrency = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };

  const getProfitMarginColor = (margin: number): string => {
    if (margin >= 40) return 'text-green-600 dark:text-green-400';
    if (margin >= 30) return 'text-blue-600 dark:text-blue-400';
    if (margin >= 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            原価計算
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            製品ごとの原価と推奨販売価格を確認します
          </p>
        </div>
        <button
          onClick={loadCalculations}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          再計算
        </button>
      </div>

      {/* サマリーカード */}
      {calculations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">総レシピ数</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {calculations.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">平均単価</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(calculations.reduce((sum, c) => sum + c.unitCost, 0) / calculations.length)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">平均利益率</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {(calculations.reduce((sum, c) => sum + c.profitMargin, 0) / calculations.length).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">平均推奨価格</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(calculations.reduce((sum, c) => sum + c.suggestedPrice, 0) / calculations.length)}
            </p>
          </div>
        </div>
      )}

      {/* 原価計算リスト */}
      {calculations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">💰</div>
          <p className="text-gray-600 dark:text-gray-400">
            原価計算データがありません
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            レシピを登録すると自動的に原価が計算されます
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {calculations.map((calc) => (
            <div
              key={calc.recipeId}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              {/* カードヘッダー */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleExpand(calc.recipeId)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {calc.recipeName}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">製造個数:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {calc.yield}個
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">単価:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {formatCurrency(calc.unitCost)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">推奨価格:</span>
                        <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                          {formatCurrency(calc.suggestedPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">利益率:</span>
                        <span className={`ml-2 font-medium ${getProfitMarginColor(calc.profitMargin)}`}>
                          {calc.profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {expandedRecipe === calc.recipeId ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {/* 展開コンテンツ */}
              {expandedRecipe === calc.recipeId && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 原価内訳 */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        原価内訳
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded">
                          <span className="text-gray-700 dark:text-gray-300">材料費</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(calc.materialCost)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded">
                          <span className="text-gray-700 dark:text-gray-300">人件費</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(calc.laborCost)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded">
                          <span className="text-gray-700 dark:text-gray-300">光熱費等</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(calc.overheadCost)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <span className="font-semibold text-gray-900 dark:text-white">総原価</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(calc.totalCost)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 材料別内訳 */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        材料別内訳
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {calc.materialBreakdown.map((material, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {material.materialName}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {material.quantity}{material.unit}
                              </div>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(material.cost)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 価格シミュレーション */}
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                      価格シミュレーション
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xs text-green-700 dark:text-green-300">1個あたり原価</div>
                        <div className="text-lg font-bold text-green-900 dark:text-green-100">
                          {formatCurrency(calc.unitCost)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-green-700 dark:text-green-300">推奨販売価格</div>
                        <div className="text-lg font-bold text-green-900 dark:text-green-100">
                          {formatCurrency(calc.suggestedPrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-green-700 dark:text-green-300">1個あたり利益</div>
                        <div className="text-lg font-bold text-green-900 dark:text-green-100">
                          {formatCurrency(calc.suggestedPrice - calc.unitCost)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
