# デプロイ手順

このドキュメントでは、レギュラーメンバー管理アプリケーションをRenderとSupabaseにデプロイする手順を説明します。

## アーキテクチャ

### 本番環境構成
- **フロントエンド**: Render (Static Site)
- **バックエンドAPI**: Render (Web Service)
- **データベース**: Supabase (PostgreSQL)

## 1. Supabase（データベース）のセットアップ

### 1.1 Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクト名: `regular-shopping-app`
4. データベースパスワードを設定（後で使用）

### 1.2 データベース接続情報の取得
1. プロジェクトダッシュボードで「Settings」→「Database」を開く
2. 以下の情報をメモ：
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: プロジェクト作成時に設定したパスワード

### 1.3 データベーススキーマの設定
1. Supabaseダッシュボードで「SQL Editor」を開く
2. 以下のSQLを実行：

```sql
-- couples テーブル
CREATE TABLE couples (
    id SERIAL PRIMARY KEY,
    couple_id VARCHAR UNIQUE NOT NULL,
    couple_name VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- regular_items テーブル
CREATE TABLE regular_items (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR UNIQUE NOT NULL,
    couple_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    category_id VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (couple_id) REFERENCES couples(couple_id) ON DELETE CASCADE
);

-- インデックスの作成
CREATE INDEX idx_regular_items_couple_id ON regular_items(couple_id);
CREATE INDEX idx_couples_couple_id ON couples(couple_id);
```

## 2. Render（バックエンドAPI）のデプロイ

### 2.1 Renderプロジェクトの作成
1. [Render](https://render.com)にアクセスしてアカウントを作成
2. 「New」→「Web Service」を選択
3. GitHubリポジトリを接続

### 2.2 環境変数の設定
Renderダッシュボードで以下の環境変数を設定：

```
NODE_ENV=production
PORT=10000
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=https://your-frontend-app.onrender.com
```

### 2.3 ビルド設定
- **Build Command**: `npm install`
- **Start Command**: `npm run server`
- **Root Directory**: `regular-shopping-app`

### 2.4 デプロイ
1. 「Create Web Service」をクリック
2. デプロイが完了するまで待機
3. APIのURLをメモ（例: `https://your-api-app.onrender.com`）

## 3. Render（フロントエンド）のデプロイ

### 3.1 環境変数の設定
フロントエンド用の環境変数を設定：

```
REACT_APP_API_URL=https://your-api-app.onrender.com/api
```

### 3.2 ビルド設定
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Root Directory**: `regular-shopping-app`

### 3.3 デプロイ
1. 「Create Static Site」をクリック
2. デプロイが完了するまで待機
3. フロントエンドのURLをメモ（例: `https://your-frontend-app.onrender.com`）

## 4. 本番環境のテスト

### 4.1 データベース接続テスト
1. Supabaseダッシュボードで「Table Editor」を開く
2. アプリケーションから夫婦登録を実行
3. `couples`テーブルにデータが作成されることを確認

### 4.2 API接続テスト
```bash
# APIのヘルスチェック
curl https://your-api-app.onrender.com/api/health

# 夫婦登録テスト
curl -X POST https://your-api-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"couple_id":"test123","couple_name":"テスト夫婦","password":"password123"}'
```

### 4.3 フロントエンドテスト
1. ブラウザでフロントエンドURLにアクセス
2. 夫婦登録・ログイン機能をテスト
3. レギュラーメンバーの追加・削除をテスト

## 5. ドメイン設定（オプション）

### 5.1 カスタムドメインの設定
1. Renderダッシュボードで「Settings」→「Custom Domains」を開く
2. カスタムドメインを追加
3. DNSレコードを設定

### 5.2 HTTPS設定
- Renderは自動的にSSL証明書を提供
- カスタムドメインでも自動的にHTTPSが有効

## 6. 監視とログ

### 6.1 Renderログの確認
1. Renderダッシュボードで「Logs」タブを開く
2. リアルタイムログを確認
3. エラーが発生した場合はログを確認

### 6.2 Supabase監視
1. Supabaseダッシュボードで「Database」→「Logs」を開く
2. データベースクエリの実行状況を確認
3. パフォーマンスメトリクスを監視

## 7. セキュリティ設定

### 7.1 環境変数の管理
- 本番環境のJWT_SECRETは強力なランダム文字列を使用
- データベースパスワードは定期的に更新
- 環境変数はGitにコミットしない

### 7.2 CORS設定
- フロントエンドのドメインのみを許可
- 本番環境では適切なCORS設定を確認

### 7.3 データベースセキュリティ
- SupabaseのRow Level Security (RLS)を有効化
- 必要に応じてIP制限を設定

## 8. トラブルシューティング

### 8.1 よくある問題

**APIが起動しない**
```bash
# ログを確認
# Renderダッシュボードでログを確認
# 環境変数が正しく設定されているか確認
```

**データベース接続エラー**
```bash
# Supabaseの接続情報を確認
# ファイアウォール設定を確認
# データベースが起動しているか確認
```

**フロントエンドがAPIに接続できない**
```bash
# REACT_APP_API_URLが正しく設定されているか確認
# CORS設定を確認
# APIが正常に動作しているか確認
```

### 8.2 ロールバック手順
1. Renderダッシュボードで「Manual Deploy」を開く
2. 以前のバージョンを選択
3. 「Deploy Latest Commit」をクリック

## 9. 運用管理

### 9.1 バックアップ
- Supabaseは自動バックアップを提供
- 定期的にデータベースのバックアップを確認

### 9.2 スケーリング
- Renderは自動スケーリングを提供
- 必要に応じて手動でスケールアップ

### 9.3 更新手順
1. コードをGitHubにプッシュ
2. Renderが自動的にデプロイを開始
3. デプロイ完了後に動作確認

## 10. コスト管理

### 10.1 Render料金
- フリープラン: 月512時間
- 有料プラン: 月$7から

### 10.2 Supabase料金
- フリープラン: 月500MB、2プロジェクト
- 有料プラン: 月$25から

---

## デプロイ完了後の確認事項

- [ ] フロントエンドが正常にアクセス可能
- [ ] APIが正常に動作
- [ ] データベース接続が正常
- [ ] 夫婦登録・ログイン機能が動作
- [ ] レギュラーメンバーの追加・削除が動作
- [ ] ログが正常に出力されている
- [ ] セキュリティ設定が適切
- [ ] パフォーマンスが良好 
