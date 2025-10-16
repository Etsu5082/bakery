import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Recipe, Material, RecipeMaterial } from '../types';

/**
 * レシピ管理ページ
 */
export const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const [formData, setFormData] = useState({
    productName: '',
    yield: 1,
    laborTime: 0,
    notes: '',
    materials: [] as RecipeMaterial[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recipesData, materialsData] = await Promise.all([
        api.getRecipes(),
        api.getMaterials(),
      ]);
      setRecipes(recipesData);
      setMaterials(materialsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.materials.length === 0) {
      alert('材料を1つ以上追加してください');
      return;
    }

    try {
      if (editingRecipe) {
        await api.updateRecipe(editingRecipe.id, formData);
        alert('レシピを更新しました');
      } else {
        await api.createRecipe(formData);
        alert('レシピを作成しました');
      }

      setShowForm(false);
      setEditingRecipe(null);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      productName: recipe.productName,
      yield: recipe.yield,
      laborTime: recipe.laborTime,
      notes: recipe.notes || '',
      materials: recipe.materials.map((m) => ({
        materialId: m.materialId,
        quantity: m.quantity,
      })),
    });
    setShowForm(true);
  };

  const handleCopy = async (id: string) => {
    try {
      await api.copyRecipe(id);
      alert('レシピを複製しました');
      loadData();
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このレシピを削除しますか?')) {
      return;
    }

    try {
      await api.deleteRecipe(id);
      alert('レシピを削除しました');
      loadData();
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      yield: 1,
      laborTime: 0,
      notes: '',
      materials: [],
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRecipe(null);
    resetForm();
  };

  const addMaterial = () => {
    if (materials.length === 0) {
      alert('材料が登録されていません。先に材料を登録してください。');
      return;
    }
    setFormData({
      ...formData,
      materials: [
        ...formData.materials,
        { materialId: materials[0].id, quantity: 0 },
      ],
    });
  };

  const updateMaterial = (index: number, field: keyof RecipeMaterial, value: any) => {
    const updated = [...formData.materials];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, materials: updated });
  };

  const removeMaterial = (index: number) => {
    const updated = formData.materials.filter((_, i) => i !== index);
    setFormData({ ...formData, materials: updated });
  };

  const getMaterialName = (materialId: string): string => {
    const material = materials.find((m) => m.id === materialId);
    return material?.name || '不明';
  };

  const getMaterialUnit = (materialId: string): string => {
    const material = materials.find((m) => m.id === materialId);
    return material?.unit || '';
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
            レシピ管理
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            レシピの登録・編集・削除を行います
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + レシピを追加
        </button>
      </div>

      {/* フォーム */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingRecipe ? 'レシピを編集' : 'レシピを追加'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  製品名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  製造個数 *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.yield}
                  onChange={(e) => setFormData({ ...formData, yield: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  製造時間（分） *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.laborTime}
                  onChange={(e) => setFormData({ ...formData, laborTime: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                メモ
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 材料リスト */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  材料 *
                </label>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  + 材料を追加
                </button>
              </div>

              {formData.materials.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  材料が追加されていません
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.materials.map((material, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <select
                          value={material.materialId}
                          onChange={(e) => updateMaterial(index, 'materialId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-40">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={material.quantity}
                          onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value))}
                          placeholder="使用量"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                        {getMaterialUnit(material.materialId)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                {editingRecipe ? '更新' : '作成'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* レシピリスト */}
      {recipes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🍞</div>
          <p className="text-gray-600 dark:text-gray-400">
            レシピが登録されていません
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {recipe.productName}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <span className="w-24">製造個数:</span>
                    <span className="font-medium">{recipe.yield}個</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24">製造時間:</span>
                    <span className="font-medium">{recipe.laborTime}分</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24">材料数:</span>
                    <span className="font-medium">{recipe.materials.length}種類</span>
                  </div>
                </div>

                {recipe.notes && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    {recipe.notes}
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    使用材料:
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {recipe.materials.map((m, idx) => (
                      <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                        <span>{getMaterialName(m.materialId)}</span>
                        <span>{m.quantity}{getMaterialUnit(m.materialId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                <button
                  onClick={() => handleEdit(recipe)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  編集
                </button>
                <button
                  onClick={() => handleCopy(recipe.id)}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                  複製
                </button>
                <button
                  onClick={() => handleDelete(recipe.id)}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
