// 商品カテゴリの定義
export const CATEGORIES = [
  { id: 'vegetables', name: '野菜・生鮮', order: 1 },
  { id: 'beans', name: '豆類', order: 2 },
  { id: 'mushrooms', name: 'きのこ類', order: 3 },
  { id: 'fruits', name: '果物', order: 4 },
  { id: 'meat', name: '肉類', order: 5 },
  { id: 'fish', name: '魚類', order: 6 },
  { id: 'dairy', name: '乳製品', order: 7 },
  { id: 'bread', name: 'パン', order: 8 },
  { id: 'beverages', name: '飲み物', order: 9 },
  { id: 'frozen', name: '冷凍食品', order: 10 },
  { id: 'snacks', name: 'お菓子', order: 11 },
  { id: 'other', name: 'その他', order: 12 }
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export interface RegularItem {
  id: string;
  name: string;
  categoryId: CategoryId;
  createdAt: Date;
}

export interface ShoppingList {
  id: string;
  items: RegularItem[];
  lastUpdated: Date;
}

// 認証関連の型定義
export interface Couple {
  coupleId: string;
  coupleName: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  couple: Couple;
}

export interface AuthContextType {
  couple: Couple | null;
  token: string | null;
  login: (coupleId: string, password: string) => Promise<void>;
  register: (coupleId: string, coupleName: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// API レスポンス型
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface ItemsResponse {
  items: RegularItem[];
}
