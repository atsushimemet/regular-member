import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ShareUrl: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { couple, logout } = useAuth();

  if (!couple) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}?couple=${couple.coupleId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logout();
    }
  };

  return (
    <div style={{
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{
          margin: '0',
          color: '#495057',
          fontSize: '18px'
        }}>
          👫 ログイン中: {couple.coupleName}
        </h3>
        <button
          onClick={handleLogout}
          style={{
            padding: '5px 10px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          ログアウト
        </button>
      </div>

      <div style={{
        marginBottom: '10px'
      }}>
        <label style={{
          display: 'block',
          marginBottom: '5px',
          fontWeight: 'bold',
          color: '#495057'
        }}>
          💑 夫婦で共有するURL
        </label>
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={shareUrl}
            readOnly
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              backgroundColor: '#fff',
              fontSize: '14px',
              color: '#495057'
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              padding: '8px 16px',
              backgroundColor: copied ? '#28a745' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s'
            }}
          >
            {copied ? '✓ コピー済み' : 'URLコピー'}
          </button>
        </div>
      </div>

      <p style={{
        margin: '0',
        fontSize: '12px',
        color: '#6c757d',
        lineHeight: '1.4'
      }}>
        このURLをパートナーと共有すると、同じレギュラーメンバーリストを見ることができます。
        パートナーは同じ夫婦IDとパスワードでログインする必要があります。
      </p>
    </div>
  );
};

export default ShareUrl;