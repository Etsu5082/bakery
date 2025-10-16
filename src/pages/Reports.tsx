import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { CostReport } from '../types';

/**
 * レポートページ
 */
export const Reports: React.FC = () => {
  const [report, setReport] = useState<CostReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const data = await api.getReport();
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      alert('レポートの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report || report.calculations.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    // CSVヘッダー
    const headers = [
      '製品名',
      '製造個数',
      '材料費',
      '人件費',
      '光熱費等',
      '総原価',
      '単価',
      '推奨販売価格',
      '利益率(%)',
    ];

    // CSVデータ
    const rows = report.calculations.map((calc) => [
      calc.recipeName,
      calc.yield,
      calc.materialCost.toFixed(2),
      calc.laborCost.toFixed(2),
      calc.overheadCost.toFixed(2),
      calc.totalCost.toFixed(2),
      calc.unitCost.toFixed(2),
      calc.suggestedPrice.toFixed(2),
      calc.profitMargin.toFixed(2),
    ]);

    // CSV文字列を生成
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // BOMを追加してUTF-8として保存
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // ダウンロードリンクを作成してクリック
    const link = document.createElement('a');
    link.href = url;
    link.download = `cost_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const getSortedByProfitMargin = () => {
    if (!report) return [];
    return [...report.calculations].sort((a, b) => b.profitMargin - a.profitMargin);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (!report || report.calculations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            レポート
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            原価分析とレポートを確認します
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📊</div>
          <p className="text-gray-600 dark:text-gray-400">
            レポートデータがありません
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            レシピを登録すると自動的にレポートが生成されます
          </p>
        </div>
      </div>
    );
  }

  const sortedCalculations = getSortedByProfitMargin();

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            レポート
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            原価分析とレポートを確認します
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadReport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            更新
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            CSVエクスポート
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                総レシピ数
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {report.summary.totalRecipes}
              </p>
            </div>
            <div className="text-4xl">🍞</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                平均単価
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(report.summary.averageUnitCost)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                平均利益率
              </p>
              <p className={`mt-2 text-3xl font-bold ${getProfitMarginColor(report.summary.averageProfitMargin)}`}>
                {report.summary.averageProfitMargin.toFixed(1)}%
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                最高利益率
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {report.summary.highestProfitMargin
                  ? `${report.summary.highestProfitMargin.profitMargin.toFixed(1)}%`
                  : 'N/A'}
              </p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      </div>

      {/* トップ/ボトムパフォーマー */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 最高利益率 */}
        {report.summary.highestProfitMargin && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              最高利益率
            </h3>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {report.summary.highestProfitMargin.recipeName}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">単価:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(report.summary.highestProfitMargin.unitCost)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">推奨価格:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(report.summary.highestProfitMargin.suggestedPrice)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600 dark:text-gray-400">利益率:</span>
                  <span className="ml-2 font-bold text-green-600 dark:text-green-400 text-lg">
                    {report.summary.highestProfitMargin.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 最低利益率 */}
        {report.summary.lowestProfitMargin && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              最低利益率
            </h3>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {report.summary.lowestProfitMargin.recipeName}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">単価:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(report.summary.lowestProfitMargin.unitCost)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">推奨価格:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(report.summary.lowestProfitMargin.suggestedPrice)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600 dark:text-gray-400">利益率:</span>
                  <span className={`ml-2 font-bold text-lg ${getProfitMarginColor(report.summary.lowestProfitMargin.profitMargin)}`}>
                    {report.summary.lowestProfitMargin.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 利益率ランキング */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            利益率ランキング
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  順位
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  製品名
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  単価
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  推奨価格
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  利益率
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  利益額
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedCalculations.map((calc, index) => (
                <tr key={calc.recipeId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                      {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                      {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {calc.recipeName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {calc.yield}個製造
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(calc.unitCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-600 dark:text-blue-400">
                    {formatCurrency(calc.suggestedPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-bold ${getProfitMarginColor(calc.profitMargin)}`}>
                      {calc.profitMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(calc.suggestedPrice - calc.unitCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* コスト構成チャート（簡易版） */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          平均コスト構成
        </h3>
        <div className="space-y-4">
          {(() => {
            const avgMaterialCost = report.calculations.reduce((sum, c) => sum + c.materialCost, 0) / report.calculations.length;
            const avgLaborCost = report.calculations.reduce((sum, c) => sum + c.laborCost, 0) / report.calculations.length;
            const avgOverheadCost = report.calculations.reduce((sum, c) => sum + c.overheadCost, 0) / report.calculations.length;
            const total = avgMaterialCost + avgLaborCost + avgOverheadCost;

            const materialPercent = (avgMaterialCost / total) * 100;
            const laborPercent = (avgLaborCost / total) * 100;
            const overheadPercent = (avgOverheadCost / total) * 100;

            return (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">材料費</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(avgMaterialCost)} ({materialPercent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${materialPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">人件費</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(avgLaborCost)} ({laborPercent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{ width: `${laborPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">光熱費等</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(avgOverheadCost)} ({overheadPercent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-yellow-600 h-3 rounded-full"
                      style={{ width: `${overheadPercent}%` }}
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
