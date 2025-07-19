# レギュラーメンバー管理アプリ

夫婦で共有するお買い物リストアプリケーションです。いつものスーパーで買う「レギュラーメンバー」な商品を登録し、スーパーでの買い物順序に並べて管理できます。

## 機能

- **夫婦認証**: 夫婦IDとパスワードによる安全な認証システム
- **データ永続化**: PostgreSQLデータベースでデータを安全に保存
- **レギュラーメンバー登録**: よく買う商品を名前とカテゴリで登録
- **カテゴリ分類**: 野菜・生鮮、豆類、きのこ類、果物、肉類、魚類、乳製品、パン、飲み物、冷凍食品、お菓子、その他
- **買い物順序**: スーパーでの売り場順序に合わせてアイテムを表示
- **夫婦間共有**: URLで簡単にリストを共有
- **リアルタイム同期**: データベース経由で夫婦間のリアルタイム同期

## 使い方

### 1. 夫婦登録・ログイン
1. **新規登録**: 夫婦ID、夫婦名、パスワードを入力して登録
2. **ログイン**: 登録した夫婦IDとパスワードでログイン
3. **URL共有**: ログイン後に表示されるURLをパートナーと共有

### 2. レギュラーメンバー管理
1. **商品の追加**: フォームに商品名を入力し、適切なカテゴリを選択して「追加」ボタンをクリック
2. **商品の削除**: 各商品の「削除」ボタンをクリック
3. **リアルタイム同期**: 追加・削除はすぐに夫婦間で同期されます

## 開発環境セットアップ

### 必要なもの
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose（推奨）

### Docker環境（推奨）

#### 1. 開発環境の起動
```bash
# プロジェクトディレクトリに移動
cd regular-shopping-app

# 全てのサービスを起動（バックグラウンド）
docker compose up -d

# または、ログを確認しながら起動
docker compose up
```

#### 2. 起動確認
```bash
# 全てのコンテナの状態を確認
docker compose ps

# 各サービスのログを確認
docker compose logs -f          # 全てのサービスのログ
docker compose logs -f frontend # フロントエンドのログ
docker compose logs -f api      # APIのログ
docker compose logs -f db       # データベースのログ
```

#### 3. データベースのセットアップ（初回のみ）
```bash
# データベースが起動するまで少し待ってから実行
docker compose exec api npm run db:setup
```

#### 4. アプリケーションへのアクセス
- **フロントエンド**: http://localhost:3000
- **API**: http://localhost:3001
- **データベース**: localhost:5432

#### 5. 開発時の便利なコマンド
```bash
# コンテナ内でコマンド実行
docker compose exec frontend npm install  # フロントエンドに依存関係追加
docker compose exec api npm install       # APIに依存関係追加

# コンテナ内でシェル実行
docker compose exec frontend sh
docker compose exec api sh
docker compose exec db psql -U postgres -d regular_shopping

# 特定のサービスの再起動
docker compose restart frontend
docker compose restart api
docker compose restart db

# イメージの再ビルド（コード変更後）
docker compose build
docker compose up -d
```

#### 6. 開発環境の停止
```bash
# 全てのサービスを停止
docker compose down

# データベースのデータも削除して完全にクリーンアップ
docker compose down -v
```

#### 7. トラブルシューティング

**ポートが既に使用されている場合**
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :3001
lsof -i :5432

# 既存のコンテナを停止
docker compose down
docker system prune -f
```

**依存関係の問題**
```bash
# コンテナを再ビルド
docker compose build --no-cache
docker compose up -d
```

**データベース接続エラー**
```bash
# データベースの状態確認
docker compose logs db

# データベースを再起動
docker compose restart db

# データベースセットアップを再実行
docker compose exec api npm run db:setup
```

**フロントエンドが起動しない**
```bash
# フロントエンドのログ確認
docker compose logs frontend

# node_modulesを再インストール
docker compose exec frontend rm -rf node_modules package-lock.json
docker compose exec frontend npm install
```

#### 8. 本番環境での起動
```bash
docker compose --profile production up -d
```

### 通常のNode.js環境

#### 1. データベースの準備
```bash
# PostgreSQLをインストール（macOS）
brew install postgresql
brew services start postgresql

# データベースとユーザーを作成
createdb regular_shopping
```

#### 2. 依存関係のインストール
```bash
cd regular-shopping-app
npm install
```

#### 3. 環境変数の設定
```bash
# .envファイルをコピーして編集
cp .env .env.local
# 必要に応じてデータベース接続情報を編集
```

#### 4. データベースのセットアップ
```bash
npm run db:setup
```

#### 5. 開発サーバーの起動
```bash
# バックエンドAPIとフロントエンドを同時起動
npm run dev

# 別々に起動する場合
npm run server  # バックエンドAPI（ポート3001）
npm start       # フロントエンド（ポート3000）
```

#### 6. 本番用ビルド
```bash
npm run build
```

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- CSS-in-JS（インラインスタイル）

### バックエンド
- Node.js
- Express.js
- PostgreSQL
- JWT認証
- bcryptjs（パスワードハッシュ化）

### インフラ
- Docker & Docker Compose
- nginx（本番環境）

## API エンドポイント

### 認証
- `POST /api/auth/register` - 夫婦登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/verify` - トークン検証

### レギュラーアイテム
- `GET /api/items` - アイテム一覧取得
- `POST /api/items` - アイテム追加
- `PUT /api/items/:id` - アイテム更新
- `DELETE /api/items/:id` - アイテム削除

## データベース構造

### couples テーブル
- `id` (SERIAL PRIMARY KEY)
- `couple_id` (VARCHAR UNIQUE) - 夫婦ID
- `couple_name` (VARCHAR) - 夫婦名
- `password_hash` (VARCHAR) - ハッシュ化されたパスワード
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### regular_items テーブル
- `id` (SERIAL PRIMARY KEY)
- `item_id` (VARCHAR UNIQUE) - アイテムID
- `couple_id` (VARCHAR) - 夫婦ID（外部キー）
- `name` (VARCHAR) - 商品名
- `category_id` (VARCHAR) - カテゴリID
- `created_at` (TIMESTAMP)

## セキュリティ

- パスワードはbcryptでハッシュ化して保存
- JWT トークンによる認証
- CORS設定でフロントエンドからのアクセスのみ許可
- データベースアクセスは認証済みユーザーのみ

## URL パラメータ

`?couple=xxxxx` のクエリパラメータで夫婦IDを指定します。
夫婦登録・ログイン後、この形式のURLを夫婦間で共有できます。
