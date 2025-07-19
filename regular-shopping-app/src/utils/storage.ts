import { RegularItem, ShoppingList } from '../types';

const STORAGE_KEY = 'shopping-list-';

export const generateListId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const saveShoppingList = (listId: string, items: RegularItem[]): void => {
  const shoppingList: ShoppingList = {
    id: listId,
    items,
    lastUpdated: new Date()
  };
  localStorage.setItem(STORAGE_KEY + listId, JSON.stringify(shoppingList));
};

export const loadShoppingList = (listId: string): RegularItem[] => {
  const stored = localStorage.getItem(STORAGE_KEY + listId);
  if (!stored) return [];
  
  try {
    const parsed: ShoppingList = JSON.parse(stored);
    return parsed.items.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
  } catch (error) {
    console.error('Failed to parse shopping list:', error);
    return [];
  }
};

export const getListIdFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get('list');
  return listId || generateListId();
};