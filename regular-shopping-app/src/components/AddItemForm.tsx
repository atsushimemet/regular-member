import React, { useState } from 'react';
import { CATEGORIES, CategoryId, RegularItem } from '../types';

interface Props {
  onAddItem: (item: Omit<RegularItem, 'id' | 'createdAt'>) => void;
}

const AddItemForm: React.FC<Props> = ({ onAddItem }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddItem({
        name: name.trim(),
        categoryId
      });
      setName('');
      setCategoryId('other');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', marginBottom: '20px' }}>
      <h3>レギュラーメンバーを追加</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label htmlFor="itemName" style={{ display: 'block', marginBottom: '5px' }}>
            商品名:
          </label>
          <input
            id="itemName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: バナナ, 牛乳, パンなど"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        <div>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '5px' }}>
            カテゴリ:
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value as CategoryId)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            {CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          追加
        </button>
      </form>
    </div>
  );
};

export default AddItemForm;