import { AuthResponse, Couple, ItemsResponse, RegularItem } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // 認証API
  async register(coupleId: string, coupleName: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coupleId, coupleName, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async login(coupleId: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coupleId, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  async verifyToken(): Promise<{ valid: boolean; couple: Couple }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return response.json();
  }

  // アイテムAPI
  async getItems(): Promise<RegularItem[]> {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch items');
    }

    const data: ItemsResponse = await response.json();
    return data.items.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
  }

  // 共有用のアイテム取得（認証不要）
  async getSharedItems(shareId: string): Promise<RegularItem[]> {
    const response = await fetch(`${API_BASE_URL}/items/shared/${shareId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch shared items');
    }

    const data: ItemsResponse = await response.json();
    return data.items.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
  }

  // 共有IDを保存
  async saveShareId(shareId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/items/share`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ shareId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save share ID');
    }
  }

  async addItem(name: string, categoryId: string): Promise<RegularItem> {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, categoryId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add item');
    }

    const data = await response.json();
    return {
      ...data.item,
      createdAt: new Date(data.item.createdAt)
    };
  }

  async deleteItem(itemId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete item');
    }
  }

  async updateItem(itemId: string, name: string, categoryId: string): Promise<RegularItem> {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, categoryId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update item');
    }

    const data = await response.json();
    return {
      ...data.item,
      createdAt: new Date(data.item.createdAt)
    };
  }
}

export const apiClient = new ApiClient();
