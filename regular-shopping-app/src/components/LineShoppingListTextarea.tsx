import React, { useMemo, useState } from 'react';
import { RegularItem } from '../types';

interface Props {
  items: RegularItem[];
  checkedItems: Set<string>;
  inventoryState: {[itemId: string]: 'unknown' | 'available' | 'unavailable'};
}

const LineShoppingListTextarea: React.FC<Props> = ({ items, checkedItems, inventoryState }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 買い物リストのテキストを生成
  const shoppingListText = useMemo(() => {
    const shoppingItems: string[] = [];

    items.forEach(item => {
      const isChecked = checkedItems.has(item.id);
      const isUnavailable = inventoryState[item.id] === 'unavailable';
      
      // チェックされたアイテムまたは在庫がないアイテムを買い物リストに追加
      if (isChecked || isUnavailable) {
        // 商品名から条件付きの部分（,new、,tired、,emer、,low）を除去
        const displayName = item.name.trim().replace(/,\s*(new|tired|emer|low)$/, '');
        shoppingItems.push(displayName);
      }
    });

    if (shoppingItems.length === 0) {
      return '買い物リストが空です。\nアイテムをチェックするか、在庫がないとマークしてください。';
    }

    return shoppingItems.join('\n');
  }, [items, checkedItems, inventoryState]);

  // テキストをクリップボードにコピー
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shoppingListText);
      // コピー成功のフィードバック（オプション）
      alert('買い物リストをクリップボードにコピーしました！');
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      alert('コピーに失敗しました。手動でコピーしてください。');
    }
  };

  // 買い物リストのアイテム数を計算
  const shoppingItemCount = items.filter(item => 
    checkedItems.has(item.id) || inventoryState[item.id] === 'unavailable'
  ).length;

  return (
    <div style={{
      marginTop: '20px',
      padding: '16px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{
          margin: '0',
          fontSize: '16px',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📝 LINE用買い物リスト
          {shoppingItemCount > 0 && (
            <span style={{
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '10px',
              fontWeight: 'normal'
            }}>
              {shoppingItemCount}個
            </span>
          )}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '14px',
            color: '#007bff',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {isExpanded ? '閉じる' : '開く'}
        </button>
      </div>

      {isExpanded && (
        <div>
          <div style={{
            position: 'relative',
            marginBottom: '12px'
          }}>
            <textarea
              value={shoppingListText}
              readOnly
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                lineHeight: '1.5',
                resize: 'vertical',
                backgroundColor: '#fff'
              }}
            />
            <button
              onClick={copyToClipboard}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
            >
              📋 コピー
            </button>
          </div>
          
          <div style={{
            fontSize: '12px',
            color: '#666',
            backgroundColor: '#e9ecef',
            padding: '8px 12px',
            borderRadius: '4px',
            borderLeft: '3px solid #007bff'
          }}>
            <p style={{ margin: '0 0 4px 0' }}>
              <strong>使い方:</strong>
            </p>
            <ul style={{ margin: '0', paddingLeft: '16px' }}>
              <li>チェックしたアイテムと在庫がないアイテムが自動的にリストに追加されます</li>
              <li>「コピー」ボタンをクリックしてLINEに貼り付けてください</li>
              <li>買い物が終わったら「買い物終了」ボタンで状態をリセットできます</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineShoppingListTextarea; 
