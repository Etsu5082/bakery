import type {
  Material,
  Recipe,
  CostSettings,
  CostCalculation,
  CostReport,
} from '../types';

// 環境変数からAPI URLを取得（本番環境対応）
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * APIクライアント
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // 材料API
  async getMaterials(): Promise<Material[]> {
    return this.request<Material[]>('/materials');
  }

  async getMaterial(id: string): Promise<Material> {
    return this.request<Material>(`/materials/${id}`);
  }

  async createMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<Material> {
    return this.request<Material>('/materials', {
      method: 'POST',
      body: JSON.stringify(material),
    });
  }

  async updateMaterial(id: string, material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<Material> {
    return this.request<Material>(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(material),
    });
  }

  async deleteMaterial(id: string): Promise<void> {
    return this.request<void>(`/materials/${id}`, {
      method: 'DELETE',
    });
  }

  // レシピAPI
  async getRecipes(): Promise<Recipe[]> {
    return this.request<Recipe[]>('/recipes');
  }

  async getRecipe(id: string): Promise<Recipe> {
    return this.request<Recipe>(`/recipes/${id}`);
  }

  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    return this.request<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    });
  }

  async updateRecipe(id: string, recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    return this.request<Recipe>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipe),
    });
  }

  async deleteRecipe(id: string): Promise<void> {
    return this.request<void>(`/recipes/${id}`, {
      method: 'DELETE',
    });
  }

  async copyRecipe(id: string): Promise<Recipe> {
    return this.request<Recipe>(`/recipes/${id}/copy`, {
      method: 'POST',
    });
  }

  // コストAPI
  async getCostSettings(): Promise<CostSettings> {
    return this.request<CostSettings>('/cost/settings');
  }

  async updateCostSettings(settings: CostSettings): Promise<CostSettings> {
    return this.request<CostSettings>('/cost/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async calculateCost(recipeId: string): Promise<CostCalculation> {
    return this.request<CostCalculation>(`/cost/calculate/${recipeId}`);
  }

  async calculateAllCosts(): Promise<CostCalculation[]> {
    return this.request<CostCalculation[]>('/cost/calculate');
  }

  async getReport(): Promise<CostReport> {
    return this.request<CostReport>('/cost/report');
  }

  // サンプルデータAPI
  async generateSampleData(): Promise<{ message: string; materialsCreated: number; recipesCreated: number }> {
    return this.request('/sample-data/generate', {
      method: 'POST',
    });
  }

  async clearData(): Promise<{ message: string }> {
    return this.request('/sample-data/clear', {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
