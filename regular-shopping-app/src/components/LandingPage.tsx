import React from 'react';

interface Props {
  onGetStarted: () => void;
}

const LandingPage: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif'
    }}>
      {/* ヘッダー */}
      <header style={{
        padding: '20px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          margin: '0',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🛒 レギュラーメンバー
        </h1>
        <p style={{
          fontSize: '1.2rem',
          margin: '10px 0 0 0',
          opacity: 0.9
        }}>
          夫婦で共有するスマートな買い物リスト
        </p>
      </header>

      {/* メインコンテンツ */}
      <main style={{ padding: '40px 20px' }}>
        {/* ヒーロセクション */}
        <section style={{
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto 60px auto'
        }}>
          <h2 style={{
            fontSize: '2.2rem',
            margin: '0 0 20px 0',
            fontWeight: 'bold'
          }}>
            毎日の買い物を、もっと楽に、もっと効率的に
          </h2>
          <p style={{
            fontSize: '1.3rem',
            margin: '0 0 30px 0',
            lineHeight: '1.6',
            opacity: 0.9
          }}>
            いつものスーパーで買う「レギュラーメンバー」な商品を登録して、<br />
            夫婦でリアルタイムに共有できる買い物リストアプリです。
          </p>
          <button
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              fontSize: '1.2rem',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            今すぐ始める
          </button>
        </section>

        {/* 問題・解決策セクション */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto 60px auto'
        }}>
          <h3 style={{
            fontSize: '2rem',
            textAlign: 'center',
            margin: '0 0 40px 0',
            fontWeight: 'bold'
          }}>
            こんな悩みありませんか？
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            margin: '0 0 50px 0'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '30px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>😓</div>
              <h4 style={{ fontSize: '1.3rem', margin: '0 0 15px 0', fontWeight: 'bold' }}>
                毎回同じものを思い出すのが大変
              </h4>
              <p style={{ opacity: 0.9, lineHeight: '1.5' }}>
                「あれ、醤油は買ったっけ？」「いつものパンは何だったかな？」<br />
                毎回同じ商品を思い出すのに時間がかかる
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '30px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🤝</div>
              <h4 style={{ fontSize: '1.3rem', margin: '0 0 15px 0', fontWeight: 'bold' }}>
                夫婦で買い物リストを共有したい
              </h4>
              <p style={{ opacity: 0.9, lineHeight: '1.5' }}>
                「これも買ってきて」のやり取りが面倒。<br />
                リアルタイムで共有できるリストがあれば便利
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '30px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏪</div>
              <h4 style={{ fontSize: '1.3rem', margin: '0 0 15px 0', fontWeight: 'bold' }}>
                スーパーで効率よく買い物したい
              </h4>
              <p style={{ opacity: 0.9, lineHeight: '1.5' }}>
                売り場をあちこち行き来するのは非効率。<br />
                スーパーの導線に合わせてリストが並んでいれば楽
              </p>
            </div>
          </div>

          <h3 style={{
            fontSize: '2rem',
            textAlign: 'center',
            margin: '0 0 40px 0',
            fontWeight: 'bold'
          }}>
            レギュラーメンバーで解決！
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '30px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏆</div>
              <h4 style={{ fontSize: '1.3rem', margin: '0 0 15px 0', fontWeight: 'bold' }}>
                レギュラーメンバー登録
              </h4>
              <p style={{ opacity: 0.9, lineHeight: '1.5' }}>
                よく買う商品を「レギュラーメンバー」として登録。<br />
                一度登録すれば、毎回の買い物で自動的にリストに表示されます。
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '30px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔄</div>
              <h4 style={{ fontSize: '1.3rem', margin: '0 0 15px 0', fontWeight: 'bold' }}>
                リアルタイム共有
              </h4>
              <p style={{ opacity: 0.9, lineHeight: '1.5' }}>
                夫婦でURLを共有するだけで、リアルタイムでリストを同期。<br />
                「これも買って」の連絡が不要になります。
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '30px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏪</div>
              <h4 style={{ fontSize: '1.3rem', margin: '0 0 15px 0', fontWeight: 'bold' }}>
                売り場順に整理
              </h4>
              <p style={{ opacity: 0.9, lineHeight: '1.5' }}>
                野菜→肉→魚→乳製品の順で商品をカテゴリ分け。<br />
                スーパーの売り場順に表示されるので効率的に買い物できます。
              </p>
            </div>
          </div>
        </section>

        {/* 機能紹介セクション */}
        <section style={{
          maxWidth: '1000px',
          margin: '0 auto 60px auto',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '40px',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '2rem',
            textAlign: 'center',
            margin: '0 0 40px 0',
            fontWeight: 'bold'
          }}>
            主な機能
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '25px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔐</div>
              <h5 style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>安全な夫婦認証</h5>
              <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                夫婦IDとパスワードで安全にデータを管理
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📱</div>
              <h5 style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>スマホ対応</h5>
              <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                スマホでいつでもどこでもリストを確認・更新
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
              <h5 style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>チェック機能</h5>
              <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                買った商品をチェックして買い忘れを防止
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏷️</div>
              <h5 style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>12のカテゴリ</h5>
              <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                野菜・肉・魚など12カテゴリで整理
              </p>
            </div>
          </div>
        </section>

        {/* 利用方法セクション */}
        <section style={{
          maxWidth: '800px',
          margin: '0 auto 60px auto'
        }}>
          <h3 style={{
            fontSize: '2rem',
            textAlign: 'center',
            margin: '0 0 40px 0',
            fontWeight: 'bold'
          }}>
            利用方法
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '25px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '25px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                background: '#ff6b6b',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                1
              </div>
              <div>
                <h5 style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  夫婦登録・ログイン
                </h5>
                <p style={{ margin: '0', opacity: 0.9 }}>
                  夫婦ID、夫婦名、パスワードを入力して新規登録。その後ログインしてください。
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '25px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                background: '#4ecdc4',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                2
              </div>
              <div>
                <h5 style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  レギュラーメンバーを追加
                </h5>
                <p style={{ margin: '0', opacity: 0.9 }}>
                  よく買う商品を商品名とカテゴリで登録。一度登録すれば毎回使えます。
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '25px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                background: '#45b7d1',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                3
              </div>
              <div>
                <h5 style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  URLをパートナーと共有
                </h5>
                <p style={{ margin: '0', opacity: 0.9 }}>
                  ログイン後に表示される専用URLをパートナーと共有してリアルタイム同期。
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '25px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                background: '#96ceb4',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                4
              </div>
              <div>
                <h5 style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  効率的に買い物
                </h5>
                <p style={{ margin: '0', opacity: 0.9 }}>
                  スーパーで売り場順にリストを確認。買ったらチェックして買い忘れを防止。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '40px',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '1.8rem',
            margin: '0 0 20px 0',
            fontWeight: 'bold'
          }}>
            今日から楽しい買い物を始めませんか？
          </h3>
          <p style={{
            fontSize: '1.1rem',
            margin: '0 0 30px 0',
            opacity: 0.9,
            lineHeight: '1.5'
          }}>
            無料で使える買い物リストアプリ「レギュラーメンバー」で、<br />
            夫婦の買い物をもっと効率的に、もっと楽しく。
          </p>
          <button
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              fontSize: '1.2rem',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            無料で始める
          </button>
        </section>
      </main>

      {/* フッター */}
      <footer style={{
        textAlign: 'center',
        padding: '30px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        opacity: 0.8
      }}>
        <p style={{ margin: '0', fontSize: '0.9rem' }}>
          © 2025 レギュラーメンバー. 夫婦で共有する買い物リスト.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;