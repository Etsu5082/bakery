import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { CostSettings } from '../types';

/**
 * 設定ページ
 */
export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<CostSettings>({
    laborCostPerHour: 0,
    overheadCostPerUnit: 0,
    targetProfitMargin: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getCostSettings();
      setSettings(data);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      alert('設定の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      await api.updateCostSettings(settings);
      alert('設定を保存しました');
      setHasChanges(false);
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (field: keyof CostSettings, value: number) => {
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const handleReset = () => {
    if (!confirm('設定をリセットしますか？未保存の変更は失われます。')) {
      return;
    }
    loadSettings();
  };

  // 計算例
  const exampleLaborTime = 60; // 60分
  const exampleYield = 10; // 10個
  const exampleLaborCost = (settings.laborCostPerHour / 60) * exampleLaborTime;
  const exampleOverheadCost = settings.overheadCostPerUnit * exampleYield;
  const exampleMaterialCost = 500; // 仮の材料費
  const exampleTotalCost = exampleMaterialCost + exampleLaborCost + exampleOverheadCost;
  const exampleUnitCost = exampleTotalCost / exampleYield;
  const exampleSuggestedPrice = exampleUnitCost / (1 - settings.targetProfitMargin / 100);

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
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          設定
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          原価計算に使用する設定を管理します
        </p>
      </div>

      {/* 未保存の変更通知 */}
      {hasChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-yellow-800 dark:text-yellow-200">
              ⚠️ 未保存の変更があります。設定を保存してください。
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 設定フォーム */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 人件費設定 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">👤</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    人件費設定
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    時給を設定します
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  時給（円/時間）
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={settings.laborCostPerHour}
                  onChange={(e) => updateSetting('laborCostPerHour', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  1分あたり: <span className="font-medium">¥{(settings.laborCostPerHour / 60).toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* 光熱費設定 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">⚡</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    光熱費等設定
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    1個あたりの光熱費・その他間接費を設定します
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  1個あたりの光熱費等（円）
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={settings.overheadCostPerUnit}
                  onChange={(e) => updateSetting('overheadCostPerUnit', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  電気・ガス・水道・その他の間接費用
                </p>
              </div>
            </div>

            {/* 利益率設定 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">📊</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    目標利益率設定
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    推奨販売価格の計算に使用する目標利益率を設定します
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  目標利益率（%）
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.targetProfitMargin}
                  onChange={(e) => updateSetting('targetProfitMargin', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />

                {/* 利益率スライダー */}
                <div className="mt-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={settings.targetProfitMargin}
                    onChange={(e) => updateSetting('targetProfitMargin', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>利益率の計算式:</strong> 利益率 = (販売価格 - 原価) / 販売価格 × 100
                  </p>
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                リセット
              </button>
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '保存中...' : '設定を保存'}
              </button>
            </div>
          </form>
        </div>

        {/* 計算例 */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              計算例
            </h3>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-gray-600 dark:text-gray-400 mb-2">前提条件:</div>
                <div className="space-y-1 text-gray-900 dark:text-white">
                  <div>• 材料費: ¥{exampleMaterialCost}</div>
                  <div>• 製造時間: {exampleLaborTime}分</div>
                  <div>• 製造個数: {exampleYield}個</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">人件費:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ¥{exampleLaborCost.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 pl-4">
                  = ¥{settings.laborCostPerHour} ÷ 60 × {exampleLaborTime}分
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">光熱費等:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ¥{exampleOverheadCost.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 pl-4">
                  = ¥{settings.overheadCostPerUnit} × {exampleYield}個
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-gray-900 dark:text-white">総原価:</span>
                  <span className="text-gray-900 dark:text-white">
                    ¥{exampleTotalCost.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">1個あたり原価:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ¥{exampleUnitCost.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-green-900 dark:text-green-100 font-semibold">
                    推奨販売価格:
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    ¥{exampleSuggestedPrice.toFixed(0)}
                  </span>
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">
                  利益率 {settings.targetProfitMargin}% で計算
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                  1個あたり利益: ¥{(exampleSuggestedPrice - exampleUnitCost).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 説明セクション */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          設定について
        </h3>
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">時給</h4>
            <p>
              製造にかかる人件費を計算するための時給を設定します。
              実際の製造時間（分）に基づいて、レシピごとの人件費が自動計算されます。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">1個あたりの光熱費等</h4>
            <p>
              電気代、ガス代、水道代などの光熱費や、その他の間接費用を
              1個あたりの金額として設定します。製造個数に応じて総額が計算されます。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">目標利益率</h4>
            <p>
              推奨販売価格を計算する際の目標利益率を設定します。
              例: 原価が100円で利益率30%の場合、推奨販売価格は約143円となります。
              <br />
              計算式: 販売価格 = 原価 ÷ (1 - 利益率 ÷ 100)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
