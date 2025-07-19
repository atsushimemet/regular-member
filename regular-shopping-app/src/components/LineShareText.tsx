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
    const items = name.split(',').map(item => item.trim()).filter(item => item.length > 0);
    
    // 2商品の場合のみ条件を適用
    if (items.length === 2) {
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
        text += `・${item.name}`;
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
