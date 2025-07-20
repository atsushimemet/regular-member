import { GA4Event } from '../types';

// GA4の測定ID
const GA4_MEASUREMENT_ID = 'G-SYWQW499F8';

// GA4イベントを送信する関数
export const trackEvent = (event: GA4Event): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }
};

// ページビューを送信する関数
export const trackPageView = (pageTitle?: string, pageLocation?: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA4_MEASUREMENT_ID, {
      page_title: pageTitle || document.title,
      page_location: pageLocation || window.location.href,
    });
  }
};

// 商品追加イベント
export const trackItemAdded = (categoryName: string, itemName: string): void => {
  trackEvent({
    action: 'add_item',
    category: 'shopping_list',
    label: `${categoryName}: ${itemName}`,
  });
};

// 商品削除イベント
export const trackItemDeleted = (categoryName: string, itemName: string): void => {
  trackEvent({
    action: 'delete_item',
    category: 'shopping_list',
    label: `${categoryName}: ${itemName}`,
  });
};

// 商品チェックイベント
export const trackItemChecked = (categoryName: string, itemName: string): void => {
  trackEvent({
    action: 'check_item',
    category: 'shopping_list',
    label: `${categoryName}: ${itemName}`,
  });
};

// 在庫状態更新イベント
export const trackInventoryUpdate = (status: 'available' | 'unavailable', itemName: string): void => {
  trackEvent({
    action: 'update_inventory',
    category: 'shopping_list',
    label: `${status}: ${itemName}`,
  });
};

// ログインイベント
export const trackLogin = (coupleId: string): void => {
  trackEvent({
    action: 'login',
    category: 'authentication',
    label: coupleId,
  });
};

// 登録イベント
export const trackRegister = (coupleId: string): void => {
  trackEvent({
    action: 'register',
    category: 'authentication',
    label: coupleId,
  });
};

// ログアウトイベント
export const trackLogout = (): void => {
  trackEvent({
    action: 'logout',
    category: 'authentication',
  });
}; 
