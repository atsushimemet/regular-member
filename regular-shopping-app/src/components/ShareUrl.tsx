import React, { useState } from 'react';

interface Props {
  listId: string;
}

const ShareUrl: React.FC<Props> = ({ listId }) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}${window.location.pathname}?list=${listId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div style={{ 
      padding: '15px', 
      backgroundColor: '#e3f2fd', 
      borderRadius: '4px',
      marginBottom: '20px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
        夫婦で共有
      </h4>
      <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
        このURLを夫婦間で共有して、同じリストを使用できます。
      </p>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          value={shareUrl}
          readOnly
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9'
          }}
        />
        <button
          onClick={copyToClipboard}
          style={{
            padding: '8px 15px',
            fontSize: '14px',
            backgroundColor: copied ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            minWidth: '80px'
          }}
        >
          {copied ? 'コピー済み!' : 'コピー'}
        </button>
      </div>
    </div>
  );
};

export default ShareUrl;