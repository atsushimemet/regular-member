import React from 'react';

const CommaSeparatedHelp: React.FC = () => {
  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <h4 style={{
        color: '#333',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        💡 カンマ区切りで設定できる機能
      </h4>
      
      <div style={{
        display: 'grid',
        gap: '12px',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        <div style={{
          padding: '12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '6px',
          border: '1px solid #bbdefb'
        }}>
          <strong style={{ color: '#1976d2' }}>🤔 新規商品の確認</strong>
          <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
            商品名の後に <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px' }}>,new</code> を付けると、本当に必要かどうか確認できます。
            <br />
            <strong>例:</strong> 新しい調味料,new
          </p>
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#fce4ec',
          borderRadius: '6px',
          border: '1px solid #f8bbd9'
        }}>
          <strong style={{ color: '#c2185b' }}>😴 元気ない時の商品</strong>
          <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
            商品名の後に <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px' }}>,tired</code> を付けると、元気ない時に買う商品として表示されます。
            <br />
            <strong>例:</strong> カップラーメン,tired
          </p>
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#e8eaf6',
          borderRadius: '6px',
          border: '1px solid #c5cae9'
        }}>
          <strong style={{ color: '#3f51b5' }}>🚨 非常食</strong>
          <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
            商品名の後に <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px' }}>,emer</code> を付けると、非常食として表示されます。
            <br />
            <strong>例:</strong> 缶詰,emer
          </p>
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#e0f2f1',
          borderRadius: '6px',
          border: '1px solid #b2dfdb'
        }}>
          <strong style={{ color: '#00695c' }}>💰 セール時購入</strong>
          <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
            商品名の後に <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px' }}>,low</code> を付けると、安い場合に買う商品として表示されます。
            <br />
            <strong>例:</strong> 高級チョコレート,low
          </p>
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#000',
          borderRadius: '6px',
          border: '1px solid #333'
        }}>
          <strong style={{ color: '#fff' }}>🏆 ベンチメンバー（必ず買うもの）</strong>
          <p style={{ margin: '5px 0 0 0', color: '#fff' }}>
            商品名の後に <code style={{ backgroundColor: '#333', padding: '2px 4px', borderRadius: '3px', color: '#fff' }}>,bench</code> を付けると、必ず買うものとして黒い枠で表示されます。
            <br />
            <strong>例:</strong> 牛乳,bench
          </p>
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#fff3e0',
          borderRadius: '6px',
          border: '1px solid #ffcc02'
        }}>
          <strong style={{ color: '#e65100' }}>💡 条件付き購入</strong>
          <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
            複数の商品をカンマで区切ると、その日安かった方を買う条件付き商品として表示されます。
            <br />
            <strong>例:</strong> しめじ,きのこ（その日安かったキノコを買う）
          </p>
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#f3e5f5',
          borderRadius: '6px',
          border: '1px solid #e1bee7'
        }}>
          <strong style={{ color: '#7b1fa2' }}>🎯 組み合わせ例</strong>
          <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
            複数の機能を組み合わせることもできます。
            <br />
            <strong>例:</strong> しめじ,きのこ,new（条件付きかつ新規確認）
            <br />
            <strong>例:</strong> カップラーメン,インスタントラーメン,tired（条件付きかつ元気ない時）
            <br />
            <strong>例:</strong> 牛乳,bench（必ず買うもの）
          </p>
        </div>
      </div>

      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#e8f5e8',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#2e7d32'
      }}>
        💡 ヒント: これらの機能を組み合わせることで、より効率的なお買い物リストを作成できます！
      </div>

      {/* ボタンとチェックボックスの説明 */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#fff8e1',
        borderRadius: '8px',
        border: '1px solid #ffcc02'
      }}>
        <h4 style={{
          color: '#333',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🛒 お買い物中の操作方法
        </h4>
        
        <div style={{
          display: 'grid',
          gap: '12px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#f1f8e9',
            borderRadius: '6px',
            border: '1px solid #c5e1a5'
          }}>
            <strong style={{ color: '#33691e' }}>☑️ チェックボックス</strong>
            <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
              スーパーでカゴに入れた、または購入が完了した際に押してください。
              <br />
              チェックすると商品が薄く表示され、購入済みであることが分かります。
            </p>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#e8f5e8',
            borderRadius: '6px',
            border: '1px solid #a5d6a7'
          }}>
            <strong style={{ color: '#2e7d32' }}>✅ あるボタン</strong>
            <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
              冷蔵庫にある、または記憶上冷蔵庫にある場合に押してください。
              <br />
              押すと商品が薄く表示され、在庫があることが分かります。
            </p>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#ffebee',
            borderRadius: '6px',
            border: '1px solid #ef9a9a'
          }}>
            <strong style={{ color: '#c62828' }}>❌ ないボタン</strong>
            <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
              冷蔵庫にない、または在庫が不明な場合に押してください。
              <br />
              押すと商品が黒い枠で囲まれ、購入が必要であることが分かります。
            </p>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#fff3e0',
            borderRadius: '6px',
            border: '1px solid #ffcc02'
          }}>
            <strong style={{ color: '#e65100' }}>🗑️ 削除ボタン</strong>
            <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
              間違って登録した商品を削除する際に押してください。
              <br />
              削除すると商品がリストから完全に削除されます。
            </p>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            border: '1px solid #90caf9'
          }}>
            <strong style={{ color: '#1565c0' }}>🛒 買い物終了ボタン</strong>
            <p style={{ margin: '5px 0 0 0', color: '#424242' }}>
              お会計後に押してください。
              <br />
              押すとチェックボックスと在庫状態がリセットされ、レギュラーメンバーのリストが復活します。
              <br />
              次回のお買い物で再び使用できるようになります。
            </p>
          </div>
        </div>

        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#e1f5fe',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#0277bd'
        }}>
          💡 ヒント: お買い物中は「ある」「ない」ボタンで在庫を管理し、購入後はチェックボックスで完了を記録しましょう！
        </div>
      </div>
    </div>
  );
};

export default CommaSeparatedHelp; 
