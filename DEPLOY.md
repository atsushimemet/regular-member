# デプロイ手順

このドキュメントでは、レギュラーメンバー管理アプリケーションをRenderとSupabaseにデプロイする手順を説明します。

## 前提条件

### なぜSupabaseを利用するのか
このアプリケーションは以下の理由からSupabaseをデータベースとして利用します：

1. **PostgreSQLの完全互換性**: 開発環境と同じPostgreSQLを使用できる
2. **無料プランの充実**: 月500MB、2プロジェクトまで無料で利用可能
3. **自動バックアップ**: データの安全性が保証される
4. **Row Level Security (RLS)**: セキュリティ機能が充実
5. **リアルタイム機能**: 将来的な機能拡張に対応
6. **管理の簡素化**: データベースの管理が不要

### 必要なアカウント
- **Supabase**: データベース用（無料プランで十分）
- **Render**: フロントエンド・バックエンド用（無料プランで十分）
- **GitHub**: ソースコード管理用

### 技術スタック
- **フロントエンド**: React + TypeScript
- **バックエンド**: Node.js + Express
- **データベース**: PostgreSQL (Supabase)
- **ホスティング**: Render

## アーキテクチャ

### 本番環境構成
- **フロントエンド**: Render (Static Site)
- **バックエンドAPI**: Render (Web Service)
- **データベース**: Supabase (PostgreSQL)

### データフロー
```
ユーザー → Render (フロントエンド) → Render (API) → Supabase (データベース)
```

### Supabase vs 他の選択肢

| 項目 | Supabase | 自前PostgreSQL | MongoDB Atlas | Firebase |
|------|----------|----------------|---------------|----------|
| **セットアップ難易度** | 簡単 | 複雑 | 簡単 | 簡単 |
| **PostgreSQL互換性** | 完全 | 完全 | なし | なし |
| **無料プラン** | 充実 | なし | 制限あり | 制限あり |
| **自動バックアップ** | あり | 自前実装 | あり | あり |
| **セキュリティ** | RLS対応 | 自前実装 | 制限あり | 制限あり |
| **管理コスト** | 低 | 高 | 中 | 中 |

### 開発環境との一貫性
- 開発環境: Docker PostgreSQL
- 本番環境: Supabase PostgreSQL
- 同じSQLクエリ、同じスキーマ構造を使用可能
- データベースマイグレーションが不要

### Docker環境でのデプロイの利点
- **開発環境との一貫性**: 開発時と同じDocker環境でデプロイ
- **依存関係の管理**: 環境の違いによる問題を回避
- **再現性**: 同じ環境で確実にビルド・デプロイ
- **スケーラビリティ**: コンテナ化により水平スケーリングが容易

### デプロイ方式の選択
| 方式 | 利点 | 注意点 | 推奨度 |
|------|------|--------|--------|
| **Docker環境** | 開発環境との一貫性、依存関係管理 | ビルド時間が長い | ✅ **推奨** |
| 従来のNode.js | ビルド時間が短い | 環境の違いによる問題 | 代替案 |

## 1. Supabase（データベース）のセットアップ

### 1.1 Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクト名: `regular-shopping-app`
4. データベースパスワードを設定（後で使用）

### 1.2 データベース接続情報の取得
1. プロジェクトダッシュボードで「Settings」→「Database」を開く
2. **「Direct connection」セクション**を探す（推奨）
3. 以下の情報をメモ：
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: プロジェクト作成時に設定したパスワード

**重要**: **Direct connection**を選択してください。Transaction poolerやSession poolerは今回の用途には不要です。

**Connection stringの形式**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**注意**: 最新のSupabase UIでは、接続情報の表示方法が変更されている場合があります。以下の代替方法も試してください：

**代替方法1: Connection stringから取得**
1. 「Settings」→「Database」で「Direct connection」の「Connection string」を探す
2. `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres` の形式で表示される
3. この文字列から各要素を抽出：
   - Host: `db.xxxxxxxxxxxxx.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: `[YOUR-PASSWORD]`の部分

**代替方法2: 個別の接続情報から取得**
1. 「Settings」→「Database」で「Direct connection」セクションを開く
2. 以下の項目を個別に確認：
   - **Host**: データベースのホスト名
   - **Database name**: 通常は `postgres`
   - **Port**: 通常は `5432`
   - **User**: 通常は `postgres`
   - **Password**: プロジェクト作成時に設定したパスワード

**代替方法3: API Keysから取得（参考）**
1. 「Settings」→「API」を開く
2. 「Project API keys」セクションで「anon public」キーを確認
3. または「service_role secret」キーを確認（注意: このキーは機密情報）
4. ただし、データベース接続には上記のDirect connection情報を使用してください

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

### 2.2 Docker環境でのデプロイ設定
Renderダッシュボードで以下のDocker設定を行います：

#### Docker設定
- **Docker Build Context Directory**: `regular-shopping-app`
- **Dockerfile Path**: `regular-shopping-app/Dockerfile.api`
- **Docker Command**: `npm run server`

#### 環境変数の設定
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
```

**注意**: FRONTEND_URLは今回のアプリケーションでは使用しないため、設定不要です。

### 2.3 従来のNode.js環境でのデプロイ設定（代替）
もしDocker環境を使用しない場合は、以下の設定を使用：

- **Build Command**: `npm install`
- **Start Command**: `npm run server`
- **Root Directory**: `regular-shopping-app`

### 2.4 デプロイ
1. 「Create Web Service」をクリック
2. デプロイが完了するまで待機
3. APIのURLをメモ（例: `https://your-api-app.onrender.com`）

## 3. Render（フロントエンド）のデプロイ

### 3.1 Docker環境でのデプロイ設定
Renderダッシュボードで以下のDocker設定を行います：

#### Docker設定
- **Docker Build Context Directory**: `regular-shopping-app`
- **Dockerfile Path**: `regular-shopping-app/Dockerfile`
- **Docker Command**: （空欄のまま、DockerfileのCMDを使用）

#### 環境変数の設定
フロントエンド用の環境変数を設定：

```
REACT_APP_API_URL=https://your-api-app.onrender.com/api
```

**重要**: この環境変数は、フロントエンドがバックエンドAPIにアクセスするために必要です。

### 3.2 従来のStatic Site環境でのデプロイ設定（代替）
もしDocker環境を使用しない場合は、以下の設定を使用：

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Root Directory**: `regular-shopping-app`

### 3.3 デプロイ
1. 「Create Static Site」をクリック
2. デプロイが完了するまで待機
3. フロントエンドのURLをメモ（例: `https://your-frontend-app.onrender.com`）

## 4. アプリケーションへのアクセス

### 4.1 メインアプリケーション
**フロントエンドのURL**にアクセスしてください：
```
https://your-frontend-app.onrender.com
```

### 4.2 APIエンドポイント（開発者用）
バックエンドAPIに直接アクセスする場合：
```
https://your-api-app.onrender.com/api
```

### 4.3 データベース（管理用）
Supabaseダッシュボードで管理：
```
https://supabase.com/dashboard/project/your-project-id
```

## 5. 本番環境のテスト

### 5.1 データベース接続テスト
1. Supabaseダッシュボードで「Table Editor」を開く
2. アプリケーションから夫婦登録を実行
3. `couples`テーブルにデータが作成されることを確認

### 5.2 API接続テスト
```bash
# APIのヘルスチェック
curl https://your-api-app.onrender.com/api/health

# 夫婦登録テスト
curl -X POST https://your-api-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"couple_id":"test123","couple_name":"テスト夫婦","password":"password123"}'
```

### 5.3 フロントエンドテスト
1. ブラウザでフロントエンドURLにアクセス
2. 夫婦登録・ログイン機能をテスト
3. レギュラーメンバーの追加・削除をテスト

## 6. ドメイン設定（オプション）

### 6.1 カスタムドメインの設定
1. Renderダッシュボードで「Settings」→「Custom Domains」を開く
2. カスタムドメインを追加
3. DNSレコードを設定

### 6.2 HTTPS設定
- Renderは自動的にSSL証明書を提供
- カスタムドメインでも自動的にHTTPSが有効

## 7. 監視とログ

### 7.1 Renderログの確認
1. Renderダッシュボードで「Logs」タブを開く
2. リアルタイムログを確認
3. エラーが発生した場合はログを確認

### 7.2 Supabase監視
1. Supabaseダッシュボードで「Database」→「Logs」を開く
2. データベースクエリの実行状況を確認
3. パフォーマンスメトリクスを監視

## 8. セキュリティ設定

### 8.1 環境変数の管理
- 本番環境のJWT_SECRETは強力なランダム文字列を使用
- データベースパスワードは定期的に更新
- 環境変数はGitにコミットしない

### 8.2 CORS設定
- フロントエンドのドメインのみを許可
- 本番環境では適切なCORS設定を確認

### 8.3 データベースセキュリティ
- SupabaseのRow Level Security (RLS)を有効化
- 必要に応じてIP制限を設定

## 9. トラブルシューティング

### 9.1 よくある問題

**APIが起動しない**
```bash
# ログを確認
# Renderダッシュボードでログを確認
# 環境変数が正しく設定されているか確認
```

**Dockerビルドエラー**
```bash
# Dockerfileの構文エラーを確認
# 依存関係のインストールエラーを確認
# ビルドコンテキストのパスを確認
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

**Docker環境での特有の問題**
```bash
# Docker Build Context Directoryが正しく設定されているか確認
# Dockerfile Pathが正しく設定されているか確認
# Docker Commandが正しく設定されているか確認
# コンテナ内のポート設定を確認
```

### 9.2 ロールバック手順
1. Renderダッシュボードで「Manual Deploy」を開く
2. 以前のバージョンを選択
3. 「Deploy Latest Commit」をクリック

## 10. 運用管理

### 10.1 バックアップ
- Supabaseは自動バックアップを提供
- 定期的にデータベースのバックアップを確認

### 10.2 スケーリング
- Renderは自動スケーリングを提供
- 必要に応じて手動でスケールアップ

### 10.3 更新手順
1. コードをGitHubにプッシュ
2. Renderが自動的にデプロイを開始
3. デプロイ完了後に動作確認

## 11. コスト管理

### 11.1 Render料金
- フリープラン: 月512時間
- 有料プラン: 月$7から

### 11.2 Supabase料金
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
