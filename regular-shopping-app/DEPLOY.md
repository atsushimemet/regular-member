# Render へのデプロイ手順

## 前提条件
- Renderアカウント
- GitHubリポジトリにコードがプッシュ済み

## デプロイ手順

### 1. Renderダッシュボードでの設定

1. [Render](https://render.com) にログイン
2. "New +" ボタンをクリック
3. "Static Site" を選択

### 2. リポジトリの接続

1. GitHubリポジトリを接続
2. リポジトリ: `your-username/regular-member` を選択
3. ブランチ: `main` (またはデプロイしたいブランチ)

### 3. ビルド設定

以下の設定を入力：

- **Name**: `regular-shopping-app` (任意の名前)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### 4. 環境変数（必要に応じて）

アプリケーションで環境変数を使用している場合は、Environment Variables セクションで設定してください。

### 5. デプロイ

"Create Static Site" をクリックしてデプロイを開始します。

## 注意事項

- 初回デプロイには数分かかる場合があります
- デプロイ後、Renderが提供するURLでアプリケーションにアクセスできます
- コードをプッシュすると自動的に再デプロイされます

## トラブルシューティング

### ビルドエラーが発生する場合
- Node.jsのバージョンが適切か確認
- 依存関係が正しくインストールされているか確認
- ビルドログを確認してエラーの詳細を確認

### ルーティングが正しく動作しない場合
- `public/_redirects` ファイルが正しく配置されているか確認
- SPAの設定が正しく行われているか確認 
