import React from 'react';
import { RegularItem } from '../types';
import { trackItemDeleted } from '../utils/ga4';

interface Props {
  items: RegularItem[];
  checkedItems: Set<string>;
  setCheckedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  onDeleteItem: (id: string) => void;
  isReadOnly?: boolean;
}

const BenchMemberList: React.FC<Props> = ({ items, checkedItems, setCheckedItems, onDeleteItem, isReadOnly }) => {
  // ベンチメンバーを判定する関数
  const isBenchItem = (name: string): boolean => {
    return name.trim().endsWith(',bench');
  };

  // 表示用の商品名を取得する関数（,benchを除去）
  const getDisplayName = (name: string): string => {
    return name.trim().replace(/,\s*bench$/, '');
  };

  // ベンチメンバーのみをフィルタリング
  const benchItems = items.filter(item => isBenchItem(item.name));

  // チェックボックスの状態を更新する関数
  const toggleCheckedItem = (itemId: string) => {
    // GA4イベントを送信（必要に応じて）
    // const item = items.find(i => i.id === itemId);
    // if (item) {
    //   const displayName = getDisplayName(item.name);
    //   trackItemChecked('ベンチメンバー', displayName);
    // }
    
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // ベンチメンバーがない場合は何も表示しない
  if (benchItems.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ 
        color: '#333', 
        borderBottom: '3px solid #000', 
        paddingBottom: '8px',
        margin: '20px 0 15px 0',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        🏆 ベンチメンバー（必ず買うもの）
      </h3>
      <div style={{ display: 'grid', gap: '8px' }}>
        {benchItems.map(item => {
          const displayName = getDisplayName(item.name);
          const isChecked = checkedItems.has(item.id);

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '12px',
                backgroundColor: isChecked ? '#f5f5f5' : '#fff',
                border: '2px solid #000',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                opacity: isChecked ? 0.6 : 1
              }}
            >
              {/* チェックボックス */}
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleCheckedItem(item.id)}
                style={{
                  marginRight: '12px',
                  marginTop: '2px',
                  transform: 'scale(1.2)'
                }}
              />
              
              {/* 商品情報 */}
              <div style={{ flex: 1 }}>
                <span style={{ 
                  fontSize: '16px',
                  textDecoration: isChecked ? 'line-through' : 'none',
                  fontWeight: '500'
                }}>
                  {displayName}
                </span>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#000', 
                  marginTop: '4px',
                  fontStyle: 'italic'
                }}>
                  🏆 必ず買うもの
                </div>
              </div>

              {/* 削除ボタン */}
              {!isReadOnly && (
                <div style={{ marginLeft: '10px' }}>
                  <button
                    onClick={() => {
                      const displayName = getDisplayName(item.name);
                      
                      // GA4イベントを送信
                      trackItemDeleted('ベンチメンバー', displayName);
                      
                      onDeleteItem(item.id);
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BenchMemberList; 
