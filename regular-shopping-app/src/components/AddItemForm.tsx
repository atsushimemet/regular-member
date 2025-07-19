import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES, CategoryId, RegularItem } from '../types';

interface Props {
  onAddItem: (item: Omit<RegularItem, 'id' | 'createdAt'>) => void;
}

const AddItemForm: React.FC<Props> = ({ onAddItem }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('other');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウンの外側をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const selectedCategory = CATEGORIES.find(cat => cat.id === categoryId);

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
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{selectedCategory?.name || 'カテゴリを選択'}</span>
              <span style={{ fontSize: '12px' }}>▼</span>
            </button>
            
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(category.id);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: categoryId === category.id ? '#e3f2fd' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '16px',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = categoryId === category.id ? '#e3f2fd' : '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = categoryId === category.id ? '#e3f2fd' : 'white';
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
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
