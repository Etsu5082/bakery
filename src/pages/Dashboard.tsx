import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

/**
 * ダッシュボードページ
 * システムの概要とクイックアクセスを提供
 */
export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    materialsCount: 0,
    recipesCount: 0,
    averageUnitCost: 0,
    loading: true,
  });

  const [hasData, setHasData] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [materials, recipes, report] = await Promise.all([
        api.getMaterials(),
        api.getRecipes(),
        api.getReport().catch(() => null),
      ]);

      setStats({
        materialsCount: materials.length,
        recipesCount: recipes.length,
        averageUnitCost: report?.summary.averageUnitCost || 0,
        loading: false,
      });

      setHasData(materials.length > 0 || recipes.length > 0);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleGenerateSampleData = async () => {
    if (!confirm('サンプルデータを生成しますか?')) {
      return;
    }

    setGenerating(true);
    try {
      await api.generateSampleData();
      alert('サンプルデータを生成しました');
      loadStats();
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (stats.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          ダッシュボード
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          パン屋向け原価計算システムへようこそ
        </p>
      </div>

      {/* サンプルデータ生成 */}
      {!hasData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            はじめに
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            データがありません。サンプルデータを生成してシステムを体験してみましょう。
          </p>
          <button
            onClick={handleGenerateSampleData}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? '生成中...' : 'サンプルデータを生成'}
          </button>
        </div>
      )}

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                登録材料数
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.materialsCount}
              </p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                登録レシピ数
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.recipesCount}
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
                ¥{stats.averageUnitCost.toFixed(0)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* クイックアクセス */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/materials"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            材料管理
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            材料の登録・編集・削除を行います
          </p>
        </Link>

        <Link
          to="/recipes"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            レシピ管理
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            レシピの登録・編集・削除を行います
          </p>
        </Link>

        <Link
          to="/cost-calculation"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            原価計算
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            製品ごとの原価と推奨販売価格を計算します
          </p>
        </Link>

        <Link
          to="/reports"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            レポート
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            原価分析とレポートを確認します
          </p>
        </Link>
      </div>

      {/* 機能説明 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          主な機能
        </h3>
        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>材料マスタの登録・管理（カテゴリー分類、単位管理）</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>レシピの作成・編集（材料と使用量の設定）</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>自動原価計算（材料費、人件費、光熱費を考慮）</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>推奨販売価格の算出（目標利益率に基づく）</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>レポート出力とCSVエクスポート</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
