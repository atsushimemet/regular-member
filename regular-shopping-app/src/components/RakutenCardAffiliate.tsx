import React from 'react';

const RakutenCardAffiliate: React.FC = () => {
  return (
    <div style={{
      marginTop: '40px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      textAlign: 'center'
    }}>
      <h3 style={{
        color: '#333',
        marginBottom: '15px',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        💳 夫婦のお買い物をもっとスマートに
      </h3>
      
      <p style={{
        color: '#666',
        fontSize: '14px',
        lineHeight: '1.6',
        marginBottom: '20px'
      }}>
        お買い物の費用を個人のクレジットで精算していて面倒じゃありませんか？
        <br />
        楽天カードで家計費を一元化して、ポイント還元もお得に。
      </p>

      <div style={{
        marginBottom: '15px'
      }}>
        <a 
          href="https://hb.afl.rakuten.co.jp/hsc/4a79d931.11866031.4a79d932.d7886e02/?link_type=pict&ut=eyJwYWdlIjoic2hvcCIsInR5cGUiOiJwaWN0IiwiY29sIjoxLCJjYXQiOjEsImJhbiI6MTY3NDAxLCJhbXAiOmZhbHNlfQ%3D%3D" 
          target="_blank" 
          rel="nofollow sponsored noopener"
          style={{ display: 'inline-block' }}
        >
          <img 
            src="https://hbb.afl.rakuten.co.jp/hsb/4a79d931.11866031.4a79d932.d7886e02/?me_id=2101008&me_adv_id=167401&t=pict" 
            alt="楽天カード" 
            title="楽天カード"
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              margin: '2px',
              borderRadius: '4px'
            }} 
          />
        </a>
      </div>

      <div style={{
        fontSize: '12px',
        color: '#999',
        lineHeight: '1.4'
      }}>
        ※ 楽天カードの申し込みは外部サイトで行われます
        <br />
        ※ 年会費永年無料・ポイント還元率1%
        <br />
        ※ このリンクはPR（プロモーション）です
      </div>
    </div>
  );
};

export default RakutenCardAffiliate; 
