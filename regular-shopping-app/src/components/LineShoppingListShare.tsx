import { useMemo } from 'react';
import { RegularItem } from '../types';

interface Props {
  items: RegularItem[];
  checkedItems: Set<string>;
  inventoryState: {[itemId: string]: 'unknown' | 'available' | 'unavailable'};
}

const LineShoppingListShare = ({ items, checkedItems, inventoryState }: Props) => {
  // ベンチメンバーを判定する関数
  const isBenchItem = (name: string): boolean => {
    return name.trim().endsWith(',bench');
  };

  // 表示用の商品名を取得する関数（,new、,tired、,emer、,low、,benchを除去）
  const getDisplayName = (name: string): string => {
    return name.trim().replace(/,\s*(new|tired|emer|low|bench)$/, '');
  };

  // 買い物リストのテキストを生成
  const shoppingListText = useMemo(() => {
    const shoppingItems: string[] = [];

    items.forEach(item => {
      const isChecked = checkedItems.has(item.id);
      const isUnavailable = inventoryState[item.id] === 'unavailable';
      const isBenchItemFlag = isBenchItem(item.name);
      
      // ベンチメンバーは必ず買い物リストに追加、またはチェックされたアイテムまたは在庫がないアイテムを買い物リストに追加
      if (isBenchItemFlag || isChecked || isUnavailable) {
        const displayName = getDisplayName(item.name);
        shoppingItems.push(displayName);
      }
    });

    if (shoppingItems.length === 0) {
      return '買い物リストが空です。\nアイテムをチェックするか、在庫がないとマークしてください。';
    }

    return shoppingItems.join('\n');
  }, [items, checkedItems, inventoryState]);

  // Web Share APIを使用して共有
  const shareShoppingList = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '買い物リスト',
          text: shoppingListText,
        });
      } catch (err) {
        console.error('共有に失敗しました:', err);
        // フォールバック: クリップボードにコピー
        fallbackCopyToClipboard();
      }
    } else {
      // Web Share APIがサポートされていない場合のフォールバック
      fallbackCopyToClipboard();
    }
  };

  // フォールバック: クリップボードにコピー
  const fallbackCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shoppingListText);
      alert('買い物リストをクリップボードにコピーしました！\nLINEに貼り付けてください。');
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      alert('コピーに失敗しました。手動でコピーしてください。');
    }
  };

  // 買い物リストのアイテム数を計算
  const shoppingItemCount = items.filter(item => 
    isBenchItem(item.name) || checkedItems.has(item.id) || inventoryState[item.id] === 'unavailable'
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
        
        {/* 共有ボタン */}
        <button
          onClick={shareShoppingList}
          disabled={shoppingItemCount === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: shoppingItemCount > 0 ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: shoppingItemCount > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            fontWeight: '500'
          }}
          onMouseOver={(e) => {
            if (shoppingItemCount > 0) {
              e.currentTarget.style.backgroundColor = '#218838';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (shoppingItemCount > 0) {
              e.currentTarget.style.backgroundColor = '#28a745';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          📤 共有
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
          <li>「共有」ボタンをタップしてiPhoneの共有機能でLINEに送信できます</li>
          <li>共有機能が使えない場合は、クリップボードにコピーされます</li>
          <li>買い物が終わったら「買い物終了」ボタンで状態をリセットできます</li>
        </ul>
      </div>
    </div>
  );
};

export default LineShoppingListShare; 
