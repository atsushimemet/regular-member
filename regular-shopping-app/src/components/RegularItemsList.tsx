import React from 'react';
import { CATEGORIES, RegularItem } from '../types';

interface Props {
  items: RegularItem[];
  onDeleteItem: (id: string) => void;
}

// カンマ区切りの商品を解析する関数
const parseCommaSeparatedItems = (name: string): { items: string[], hasCondition: boolean } => {
  // ,new、,tired、,emer、,lowで終わる場合は最後の要素を除外して判定
  const isNewItem = name.trim().endsWith(',new');
  const isTiredItem = name.trim().endsWith(',tired');
  const isEmerItem = name.trim().endsWith(',emer');
  const isLowItem = name.trim().endsWith(',low');
  const nameWithoutSuffix = isNewItem || isTiredItem || isEmerItem || isLowItem ? 
    name.trim().replace(/,\s*(new|tired|emer|low)$/, '') : name;
  
  const items = nameWithoutSuffix.split(',').map(item => item.trim()).filter(item => item.length > 0);
  
  // 2商品以上の場合に条件を適用
  if (items.length >= 2) {
    return {
      items,
      hasCondition: true
    };
  }
  
  return {
    items: [name],
    hasCondition: false
  };
};

// 新規商品かどうかを判定する関数
const isNewItem = (name: string): boolean => {
  return name.trim().endsWith(',new');
};

// 元気ない時に買う商品かどうかを判定する関数
const isTiredItem = (name: string): boolean => {
  return name.trim().endsWith(',tired');
};

// 非常食商品かどうかを判定する関数
const isEmerItem = (name: string): boolean => {
  return name.trim().endsWith(',emer');
};

// セール時購入商品かどうかを判定する関数
const isLowItem = (name: string): boolean => {
  return name.trim().endsWith(',low');
};

// 表示用の商品名を取得する関数（,new、,tired、,emer、,lowを除去）
const getDisplayName = (name: string): string => {
  return name.trim().replace(/,\s*(new|tired|emer|low)$/, '');
};

const RegularItemsList: React.FC<Props> = ({ items, onDeleteItem }) => {
  // カテゴリごとにアイテムをグループ化し、カテゴリの順序で並べる
  const itemsByCategory = CATEGORIES.map(category => ({
    category,
    items: items.filter(item => item.categoryId === category.id)
  })).filter(group => group.items.length > 0);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>まだレギュラーメンバーが登録されていません。</p>
        <p>上のフォームから商品を追加してください。</p>
      </div>
    );
  }

  return (
    <div>
      <h3>レギュラーメンバー（スーパーでの順番）</h3>
      {itemsByCategory.map(({ category, items }) => (
        <div key={category.id} style={{ marginBottom: '20px' }}>
          <h4 style={{ 
            color: '#333', 
            borderBottom: '2px solid #e0e0e0', 
            paddingBottom: '5px',
            margin: '15px 0 10px 0'
          }}>
            {category.name}
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {items.map(item => {
              const parsed = parseCommaSeparatedItems(item.name);
              const isConditionalItem = parsed.hasCondition;
              const isNewItemFlag = isNewItem(item.name);
              const isTiredItemFlag = isTiredItem(item.name);
              const isEmerItemFlag = isEmerItem(item.name);
              const isLowItemFlag = isLowItem(item.name);
              const displayName = getDisplayName(item.name);
              
              // 背景色の決定（優先順位: 新規かつ条件付き > 元気ないかつ条件付き > 非常食かつ条件付き > セール時かつ条件付き > 新規 > 元気ない > 非常食 > セール時 > 条件付き > 通常）
              let backgroundColor = '#fff';
              if (isNewItemFlag && isConditionalItem) {
                backgroundColor = '#e8f5e8'; // 薄い緑色（新規かつ条件付き）
              } else if (isTiredItemFlag && isConditionalItem) {
                backgroundColor = '#fff3e0'; // 薄いオレンジ色（元気ないかつ条件付き）
              } else if (isEmerItemFlag && isConditionalItem) {
                backgroundColor = '#f3e5f5'; // 薄い紫色（非常食かつ条件付き）
              } else if (isLowItemFlag && isConditionalItem) {
                backgroundColor = '#e0f2f1'; // 薄いティール色（セール時かつ条件付き）
              } else if (isNewItemFlag) {
                backgroundColor = '#e3f2fd'; // 薄い青色（新規のみ）
              } else if (isTiredItemFlag) {
                backgroundColor = '#fce4ec'; // 薄いピンク色（元気ないのみ）
              } else if (isEmerItemFlag) {
                backgroundColor = '#e8eaf6'; // 薄いインディゴ色（非常食のみ）
              } else if (isLowItemFlag) {
                backgroundColor = '#e0f2f1'; // 薄いティール色（セール時のみ）
              } else if (isConditionalItem) {
                backgroundColor = '#ffe6f2'; // 薄ピンク色（条件付きのみ）
              }
              
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor,
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '16px' }}>{displayName}</span>
                    {isNewItemFlag && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#1976d2', 
                        marginTop: '4px',
                        fontStyle: 'italic'
                      }}>
                        🤔 本当に必要？
                      </div>
                    )}
                    {isTiredItemFlag && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#e65100', 
                        marginTop: '4px',
                        fontStyle: 'italic'
                      }}>
                        😴 元気ない時に買う
                      </div>
                    )}
                    {isEmerItemFlag && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6a1b9a', 
                        marginTop: '4px',
                        fontStyle: 'italic'
                      }}>
                        🚨 非常食
                      </div>
                    )}
                                         {isLowItemFlag && (
                       <div style={{ 
                         fontSize: '12px', 
                         color: '#00796b', 
                         marginTop: '4px',
                         fontStyle: 'italic'
                       }}>
                         💰 安い場合に買う
                       </div>
                     )}
                    {isConditionalItem && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#e91e63', 
                        marginTop: '4px',
                        fontStyle: 'italic'
                      }}>
                        💡 条件: 安い方を買う
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      marginLeft: '10px'
                    }}
                  >
                    削除
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RegularItemsList;
