import { useEffect, useState } from 'react';
import './App.css';
import AddItemForm from './components/AddItemForm';
import AuthForm from './components/AuthForm';
import RegularItemsList from './components/RegularItemsList';
import ShareUrl from './components/ShareUrl';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RegularItem } from './types';
import { apiClient } from './utils/api';
import { getShareIdFromUrl, isValidShareId } from './utils/shareUtils';

function AppContent() {
  const [items, setItems] = useState<RegularItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inventoryState, setInventoryState] = useState<{[itemId: string]: 'unknown' | 'available' | 'unavailable'}>({});
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedCoupleId, setSharedCoupleId] = useState<string | null>(null);
  
  const { couple, isLoading: authLoading } = useAuth();

  // 共有URLからのアクセスをチェック
  useEffect(() => {
    const shareId = getShareIdFromUrl();
    if (shareId && isValidShareId(shareId)) {
      // 共有IDが有効な場合、共有ビューとして表示
      setIsSharedView(true);
      // 共有IDから夫婦IDを取得するロジック（後で実装）
      // 現在は仮の実装として、共有IDの最初の8文字を夫婦IDとして使用
      setSharedCoupleId(shareId.substring(0, 8));
      // 共有ビューでもデータを取得
      fetchSharedItems(shareId);
    }
  }, []);

  // 共有ビュー用のデータ取得
  const fetchSharedItems = async (shareId: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const fetchedItems = await apiClient.getSharedItems(shareId);
      setItems(fetchedItems);
    } catch (error) {
      setError(error instanceof Error ? error.message : '共有データの取得に失敗しました');
      console.error('Failed to fetch shared items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // データを取得
  const fetchItems = async () => {
    if (!couple && !isSharedView) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const fetchedItems = await apiClient.getItems();
      setItems(fetchedItems);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
      console.error('Failed to fetch items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (couple) {
      fetchItems();
    }
  }, [couple]);

  // URLパラメータをチェックして、夫婦ID指定でのアクセスに対応
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const coupleIdFromUrl = urlParams.get('couple');
    
    if (coupleIdFromUrl && couple && coupleIdFromUrl !== couple.coupleId) {
      // 異なる夫婦IDでアクセスされた場合は警告
      alert(`このページは ${coupleIdFromUrl} 夫婦のページです。正しい夫婦でログインしてください。`);
    }
  }, [couple]);

  const handleAddItem = async (newItemData: Omit<RegularItem, 'id' | 'createdAt'>) => {
    try {
      const newItem = await apiClient.addItem(newItemData.name, newItemData.categoryId);
      setItems(prevItems => [...prevItems, newItem]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'アイテムの追加に失敗しました');
      console.error('Failed to add item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await apiClient.deleteItem(id);
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'アイテムの削除に失敗しました');
      console.error('Failed to delete item:', error);
    }
  };

  // 買い物終了時に状態をリセットする関数
  const resetShoppingState = () => {
    setInventoryState({});
    setCheckedItems(new Set());
  };

  // 認証ロード中
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        読み込み中...
      </div>
    );
  }

  // 共有ビューの場合（ログイン不要）
  if (isSharedView) {
    return (
      <div className="App">
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <header style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ 
              color: '#333', 
              fontSize: '28px',
              marginBottom: '10px'
            }}>
              🛒 レギュラーメンバー（共有ビュー）
            </h1>
            <p style={{ 
              color: '#666', 
              fontSize: '16px',
              margin: '0'
            }}>
              共有されたお買い物リスト
            </p>
          </header>

          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666'
            }}>
              データを読み込み中...
            </div>
          ) : (
            <RegularItemsList 
              items={items} 
              onDeleteItem={() => {}} // 共有ビューでは削除不可
              inventoryState={inventoryState}
              setInventoryState={setInventoryState}
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
              isReadOnly={false}
            />
          )}

          {/* 買い物終了ボタン */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '30px',
            marginBottom: '20px'
          }}>
            <button
              onClick={resetShoppingState}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2196f3';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🛒 買い物終了
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 未認証の場合はログインフォームを表示
  if (!couple) {
    return <AuthForm />;
  }

  return (
    <div className="App">
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            color: '#333', 
            fontSize: '28px',
            marginBottom: '10px'
          }}>
            🛒 レギュラーメンバー管理
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '16px',
            margin: '0'
          }}>
            いつものお買い物リストを夫婦で共有
          </p>
        </header>

        <ShareUrl />
        
        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#ffe6e6',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            color: '#d63031',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
            <button 
              onClick={() => setError('')}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                color: '#d63031',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        )}
        
        <AddItemForm onAddItem={handleAddItem} />
        
        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#666'
          }}>
            データを読み込み中...
          </div>
        ) : (
          <RegularItemsList 
            items={items} 
            onDeleteItem={handleDeleteItem}
            inventoryState={inventoryState}
            setInventoryState={setInventoryState}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            isReadOnly={false}
          />
        )}

        {/* 買い物終了ボタン */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px',
          marginBottom: '20px'
        }}>
          <button
            onClick={resetShoppingState}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1976d2';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#2196f3';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🛒 買い物終了
          </button>
        </div>

      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
