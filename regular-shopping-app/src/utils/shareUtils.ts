// ランダムな64文字の識別子を生成する関数
export const generateShareId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 共有URLを生成する関数
export const generateShareUrl = (shareId: string): string => {
  return `${window.location.origin}${window.location.pathname}?share=${shareId}`;
};

// URLパラメータから共有IDを取得する関数
export const getShareIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('share');
};

// 共有IDが有効かどうかをチェックする関数（64文字の英数字のみ）
export const isValidShareId = (shareId: string): boolean => {
  return /^[A-Za-z0-9]{64}$/.test(shareId);
}; 
