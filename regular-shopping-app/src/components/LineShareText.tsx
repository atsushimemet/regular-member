import React, { useState } from 'react';
import { CATEGORIES, RegularItem } from '../types';

interface Props {
  items: RegularItem[];
}

const LineShareText: React.FC<Props> = ({ items }) => {
  const [copied, setCopied] = useState(false);

  // カテゴリごとにアイテムをグループ化し、カテゴリの順序で並べる
  const itemsByCategory = CATEGORIES.map(category => ({
    category,
    items: items.filter(item => item.categoryId === category.id)
  })).filter(group => group.items.length > 0);

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

  // LINEで共有するテキストを生成
  const generateShareText = () => {
    if (items.length === 0) {
      return 'まだレギュラーメンバーが登録されていません。';
    }

    const today = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    let text = `🛒 レギュラーメンバー（${today}）\n\n`;

    itemsByCategory.forEach(({ category, items }) => {
      text += `【${category.name}】\n`;
      items.forEach(item => {
        const parsed = parseCommaSeparatedItems(item.name);
        const isNewItemFlag = isNewItem(item.name);
        const isTiredItemFlag = isTiredItem(item.name);
        const isEmerItemFlag = isEmerItem(item.name);
        const isLowItemFlag = isLowItem(item.name);
        const displayName = getDisplayName(item.name);
        
        text += `・${displayName}`;
        if (isNewItemFlag) {
          text += ` 🤔本当に必要？`;
        }
        if (isTiredItemFlag) {
          text += ` 😴元気ない時に買う`;
        }
        if (isEmerItemFlag) {
          text += ` 🚨非常食`;
        }
        if (isLowItemFlag) {
          text += ` 💰安い場合に買う`;
        }
        if (parsed.hasCondition) {
          text += ` 💡条件: 安い方を買う`;
        }
        text += '\n';
      });
      text += '\n';
    });

    text += `合計: ${items.length}品\n`;
    text += 'いつものお買い物リストです！';

    return text;
  };

  const shareText = generateShareText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div style={{
      marginTop: '40px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <h3 style={{
        color: '#333',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📱 LINEで共有
      </h3>
      
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '15px',
        marginBottom: '15px',
        position: 'relative'
      }}>
        <pre style={{
          margin: '0',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#333',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {shareText}
        </pre>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <button
          onClick={handleCopy}
          style={{
            padding: '10px 20px',
            backgroundColor: copied ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
        >
          {copied ? '✅ コピー完了！' : '📋 テキストをコピー'}
        </button>
        
        <span style={{
          fontSize: '12px',
          color: '#666'
        }}>
          コピーしたテキストをLINEに貼り付けて送信できます
        </span>
      </div>

      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#1976d2'
      }}>
        💡 使い方: コピーボタンを押して、LINEのチャットに貼り付けて送信してください
      </div>
    </div>
  );
};

export default LineShareText; 
