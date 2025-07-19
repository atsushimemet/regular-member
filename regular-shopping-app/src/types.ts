// 商品カテゴリの定義
export const CATEGORIES = [
  { id: 'vegetables', name: '野菜・生鮮', order: 1 },
  { id: 'meat', name: '肉類', order: 2 },
  { id: 'fish', name: '魚類', order: 3 },
  { id: 'dairy', name: '乳製品', order: 4 },
  { id: 'bread', name: 'パン', order: 5 },
  { id: 'beverages', name: '飲み物', order: 6 },
  { id: 'frozen', name: '冷凍食品', order: 7 },
  { id: 'snacks', name: 'お菓子', order: 8 },
  { id: 'other', name: 'その他', order: 9 }
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