import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Material, MaterialCategory, MaterialUnit } from '../types';

/**
 * 材料管理ページ
 */
export const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '小麦粉' as MaterialCategory,
    unit: 'g' as MaterialUnit,
    unitPrice: 0,
    packageSize: 0,
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await api.getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials:', error);
      alert('材料の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMaterial) {
        await api.updateMaterial(editingMaterial.id, formData);
        alert('材料を更新しました');
      } else {
        await api.createMaterial(formData);
        alert('材料を作成しました');
      }

      setShowForm(false);
      setEditingMaterial(null);
      resetForm();
      loadMaterials();
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      category: material.category,
      unit: material.unit,
      unitPrice: material.unitPrice,
      packageSize: material.packageSize,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この材料を削除しますか?')) {
      return;
    }

    try {
      await api.deleteMaterial(id);
      alert('材料を削除しました');
      loadMaterials();
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '小麦粉',
      unit: 'g',
      unitPrice: 0,
      packageSize: 0,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMaterial(null);
    resetForm();
  };

  const groupedMaterials = materials.reduce((acc, material) => {
    if (!acc[material.category]) {
      acc[material.category] = [];
    }
    acc[material.category].push(material);
    return acc;
  }, {} as Record<MaterialCategory, Material[]>);

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
            材料管理
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            材料の登録・編集・削除を行います
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 材料を追加
        </button>
      </div>

      {/* フォーム */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingMaterial ? '材料を編集' : '材料を追加'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  材料名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  カテゴリー *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MaterialCategory })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="小麦粉">小麦粉</option>
                  <option value="乳製品">乳製品</option>
                  <option value="糖類">糖類</option>
                  <option value="油脂">油脂</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  単位 *
                </label>
                <select
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as MaterialUnit })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="g">g (グラム)</option>
                  <option value="ml">ml (ミリリットル)</option>
                  <option value="個">個</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  仕入単価 (円) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  仕入単位量 *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.packageSize}
                  onChange={(e) => setFormData({ ...formData, packageSize: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  単位あたり単価: ¥{formData.packageSize > 0 ? (formData.unitPrice / formData.packageSize).toFixed(2) : '0.00'} / {formData.unit}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingMaterial ? '更新' : '作成'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 材料リスト */}
      {Object.keys(groupedMaterials).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📦</div>
          <p className="text-gray-600 dark:text-gray-400">
            材料が登録されていません
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMaterials).map(([category, items]) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category} ({items.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((material) => (
                  <div key={material.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {material.name}
                      </h4>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>¥{material.unitPrice} / {material.packageSize}{material.unit}</span>
                        <span className="mx-2">•</span>
                        <span>単価: ¥{(material.unitPrice / material.packageSize).toFixed(2)}/{material.unit}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(material)}
                        className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
