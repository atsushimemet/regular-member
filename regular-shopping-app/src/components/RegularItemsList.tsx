import React from 'react';
import { CATEGORIES, RegularItem } from '../types';

interface Props {
  items: RegularItem[];
  onDeleteItem: (id: string) => void;
}

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
            {items.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.name}</span>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RegularItemsList;