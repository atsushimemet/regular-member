import { useEffect, useState } from 'react';
import './App.css';
import AddItemForm from './components/AddItemForm';
import LineShareText from './components/LineShareText';
import RegularItemsList from './components/RegularItemsList';
import ShareUrl from './components/ShareUrl';
import { RegularItem } from './types';
import { getListIdFromUrl, loadShoppingList, saveShoppingList } from './utils/storage';

function App() {
  const [items, setItems] = useState<RegularItem[]>([]);
  const [listId, setListId] = useState<string>('');

  useEffect(() => {
    const id = getListIdFromUrl();
    setListId(id);
    
    // URLにリストIDが含まれていない場合は、URLを更新
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('list')) {
      const newUrl = `${window.location.pathname}?list=${id}`;
      window.history.replaceState({}, '', newUrl);
    }
    
    // 保存されたアイテムを読み込み
    const savedItems = loadShoppingList(id);
    setItems(savedItems);
  }, []);

  const handleAddItem = (newItemData: Omit<RegularItem, 'id' | 'createdAt'>) => {
    const newItem: RegularItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...newItemData,
      createdAt: new Date()
    };
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    saveShoppingList(listId, updatedItems);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    saveShoppingList(listId, updatedItems);
  };

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

        <ShareUrl listId={listId} />
        
        <AddItemForm onAddItem={handleAddItem} />
        
        <RegularItemsList 
          items={items} 
          onDeleteItem={handleDeleteItem} 
        />

        <LineShareText items={items} />
      </div>
    </div>
  );
}

export default App;
