import React, { useMemo, useState } from 'react';

interface AdditionalItem {
  id: string;
  name: string;
  isChecked: boolean;
  createdAt: Date;
}

const AdditionalShoppingList: React.FC = () => {
  const [items, setItems] = useState<AdditionalItem[]>([]);
  const [newItemName, setNewItemName] = useState('');

  // 新しいアイテムを追加
  const handleAddItem = () => {
    if (newItemName.trim()) {
      const newItem: AdditionalItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        isChecked: false,
        createdAt: new Date()
      };
      setItems(prevItems => [...prevItems, newItem]);
      setNewItemName('');
    }
  };

  // アイテムを削除
  const handleDeleteItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // チェック状態を切り替え
  const toggleChecked = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  // 買い物リストのテキストを生成
  const shoppingListText = useMemo(() => {
    const checkedItems = items.filter(item => item.isChecked);
    
    if (checkedItems.length === 0) {
      return '追加の買い物リストが空です。\nアイテムをチェックしてください。';
    }

    return checkedItems.map(item => item.name).join('\n');
  }, [items]);

  // Web Share APIを使用して共有
  const shareShoppingList = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '追加の買い物リスト',
          text: shoppingListText,
        });
      } catch (err) {
        console.error('共有に失敗しました:', err);
        fallbackCopyToClipboard();
      }
    } else {
      fallbackCopyToClipboard();
    }
  };

  // フォールバック: クリップボードにコピー
  const fallbackCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shoppingListText);
      alert('追加の買い物リストをクリップボードにコピーしました！\nLINEに貼り付けてください。');
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      alert('コピーに失敗しました。手動でコピーしてください。');
    }
  };

  // チェックされたアイテム数を計算
  const checkedItemCount = items.filter(item => item.isChecked).length;

  return (
    <div style={{
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#fff',
      border: '2px solid #e9ecef',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #f8f9fa'
      }}>
        <h2 style={{
          margin: '0',
          fontSize: '20px',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🛍️ 追加の買い物リスト
          {checkedItemCount > 0 && (
            <span style={{
              backgroundColor: '#ff6b6b',
              color: 'white',
              fontSize: '14px',
              padding: '4px 8px',
              borderRadius: '12px',
              fontWeight: 'normal'
            }}>
              {checkedItemCount}個
            </span>
          )}
        </h2>
        
        {/* 共有ボタン */}
        <button
          onClick={shareShoppingList}
          disabled={checkedItemCount === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            fontSize: '14px',
            backgroundColor: checkedItemCount > 0 ? '#ff6b6b' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: checkedItemCount > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            fontWeight: '500'
          }}
          onMouseOver={(e) => {
            if (checkedItemCount > 0) {
              e.currentTarget.style.backgroundColor = '#e55555';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (checkedItemCount > 0) {
              e.currentTarget.style.backgroundColor = '#ff6b6b';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          📤 共有
        </button>
      </div>

      {/* アイテム追加フォーム */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          placeholder="追加したい商品を入力..."
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ced4da',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={handleAddItem}
          disabled={!newItemName.trim()}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            backgroundColor: newItemName.trim() ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: newItemName.trim() ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (newItemName.trim()) {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseOut={(e) => {
            if (newItemName.trim()) {
              e.currentTarget.style.backgroundColor = '#007bff';
            }
          }}
        >
          追加
        </button>
      </div>

      {/* アイテムリスト */}
      {items.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
            追加の買い物リストが空です
          </p>
          <p style={{ margin: '0', fontSize: '14px' }}>
            上記のフォームから商品を追加してください
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: item.isChecked ? '#f8f9fa' : '#fff',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                opacity: item.isChecked ? 0.7 : 1
              }}
            >
              {/* チェックボックス */}
              <input
                type="checkbox"
                checked={item.isChecked}
                onChange={() => toggleChecked(item.id)}
                style={{
                  marginRight: '12px',
                  transform: 'scale(1.2)'
                }}
              />
              
              {/* 商品名 */}
              <span style={{
                flex: 1,
                fontSize: '16px',
                textDecoration: item.isChecked ? 'line-through' : 'none',
                color: item.isChecked ? '#666' : '#333'
              }}>
                {item.name}
              </span>
              
              {/* 削除ボタン */}
              <button
                onClick={() => handleDeleteItem(item.id)}
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 使い方説明 */}
      <div style={{
        marginTop: '20px',
        fontSize: '12px',
        color: '#666',
        backgroundColor: '#f8f9fa',
        padding: '12px',
        borderRadius: '6px',
        borderLeft: '3px solid #ff6b6b'
      }}>
        <p style={{ margin: '0 0 6px 0' }}>
          <strong>使い方:</strong>
        </p>
        <ul style={{ margin: '0', paddingLeft: '16px' }}>
          <li>レギュラーメンバー以外の商品を追加できます</li>
          <li>チェックしたアイテムが買い物リストに追加されます</li>
          <li>「共有」ボタンでiPhoneの共有機能を使ってLINEに送信できます</li>
          <li>買い物が終わったらチェックを外してください</li>
        </ul>
      </div>
    </div>
  );
};

export default AdditionalShoppingList; 
