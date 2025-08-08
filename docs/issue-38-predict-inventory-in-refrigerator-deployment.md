# Issue #38 予測機能 - フェーズ1デプロイ手順

このドキュメントでは、Issue #38の予測機能開発におけるフェーズ0（準備）とフェーズ1（DB拡張）の本番環境へのデプロイ手順を説明します。

## 概要

### デプロイ対象
- **フェーズ0**: フラグ設定・監視基盤の追加
- **フェーズ1**: データベース拡張（`last_purchases`テーブル追加）

### デプロイ方針
- **ゼロダウンタイム**: 既存機能に影響を与えない
- **段階的導入**: フラグは初期OFFで安全に展開
- **ロールバック可能**: 問題発生時は即座に無効化

### 技術的変更点
- 環境変数追加（`PREDICTOR_URL`, `PREDICTIONS_ENABLED`等）
- データベーステーブル追加（`last_purchases`）
- ヘルスチェック拡張（予測フラグ状態の可視化）

## 前提条件

### 必要な権限
- Renderプロジェクトの管理権限
- Supabaseプロジェクトの管理権限
- GitHubリポジトリのプッシュ権限

### 確認済み事項
- [ ] 開発環境での動作確認完了
- [ ] データベースマイグレーションの安全性確認
- [ ] 既存機能への影響なし確認
- [ ] ロールバック手順の準備

## デプロイ手順

### ステップ1: コードの準備

#### 1.1 ブランチの確認
```bash
# 現在のブランチを確認
git branch
# 期待結果: feature/issue-38-predict-inventory-in-refrigerator

# 最新のコミットを確認
git log --oneline -3
# 期待結果:
# 6afd51c fix: Remove unnecessary share_links table creation
# 424ec2b feat: Add phase 1 - database extension for predictions
# 2022923 feat: Add phase 0 - feature flags and monitoring foundation for predictions
```

#### 1.2 リモートへのプッシュ
```bash
# 変更をリモートにプッシュ
git push origin feature/issue-38-predict-inventory-in-refrigerator

# プルリクエストの作成（GitHub上で実行）
# タイトル: "feat: Add phase 0-1 - feature flags and database extension for predictions"
# 説明: フェーズ0-1の変更内容を記載
```

### ステップ2: Render環境変数の設定

#### 2.1 バックエンドAPI環境変数の追加
1. RenderダッシュボードでバックエンドAPIプロジェクトを開く
2. 「Environment」タブを選択
3. 以下の環境変数を追加：

```bash
# 予測機能のフラグ（初期はOFF）
PREDICTIONS_ENABLED=false

# 予測サービスのURL（将来のFlaskサービス用）
PREDICTOR_URL=http://predictor:5000

# 段階公開用の許可リスト（空で全量対象）
PREDICTIONS_COUPLE_ALLOWLIST=
```

#### 2.2 フロントエンド環境変数の追加
1. Renderダッシュボードでフロントエンドプロジェクトを開く
2. 「Environment」タブを選択
3. 以下の環境変数を追加：

```bash
# 予測表示フラグ（初期はOFF）
REACT_APP_SHOW_PREDICTIONS=false
```

### ステップ3: データベースマイグレーション

#### 3.1 Supabaseでのマイグレーション実行
1. Supabaseダッシュボードでプロジェクトを開く
2. 「SQL Editor」を開く
3. 以下のSQLを実行：

```sql
-- last_purchasesテーブルの作成
CREATE TABLE IF NOT EXISTS last_purchases (
  id SERIAL PRIMARY KEY,
  couple_id VARCHAR(255) NOT NULL,
  item_id VARCHAR(255) NOT NULL,
  last_purchased_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(couple_id, item_id),
  FOREIGN KEY (couple_id) REFERENCES couples(couple_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES regular_items(item_id) ON DELETE CASCADE
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_last_purchases_couple_id ON last_purchases(couple_id);
CREATE INDEX IF NOT EXISTS idx_last_purchases_item_id ON last_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_last_purchases_purchased_at ON last_purchases(last_purchased_at);
```

#### 3.2 マイグレーション結果の確認
```sql
-- テーブル一覧の確認
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 期待結果:
-- couples
-- last_purchases
-- regular_items
-- share_links

-- last_purchasesテーブル構造の確認
\d last_purchases
```

### ステップ4: Renderデプロイ

#### 4.1 バックエンドAPIのデプロイ
1. RenderダッシュボードでバックエンドAPIプロジェクトを開く
2. 「Manual Deploy」→「Deploy latest commit」を実行
3. デプロイログを確認してエラーがないことを確認

#### 4.2 フロントエンドのデプロイ
1. Renderダッシュボードでフロントエンドプロジェクトを開く
2. 「Manual Deploy」→「Deploy latest commit」を実行
3. デプロイログを確認してエラーがないことを確認

### ステップ5: デプロイ後の確認

#### 5.1 ヘルスチェックの確認
```bash
# バックエンドAPIのヘルスチェック
curl https://your-api-url.onrender.com/api/health

# 期待結果:
{
  "status": "OK",
  "message": "Regular Shopping App API is running",
  "predictions": {
    "enabled": false,
    "allowlistEnabled": false,
    "allowlistSize": 0,
    "predictorUrlConfigured": true
  }
}
```

#### 5.2 フロントエンドの動作確認
1. ブラウザでフロントエンドURLにアクセス
2. 既存機能（ログイン、アイテム追加・削除）が正常に動作することを確認
3. 共有機能が正常に動作することを確認

#### 5.3 データベースの確認
```sql
-- Supabase SQL Editorで実行
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- last_purchasesテーブルの構造確認
\d last_purchases
```

## ロールバック手順

### 緊急時のロールバック

#### 1. 環境変数の無効化
1. RenderダッシュボードでバックエンドAPIプロジェクトを開く
2. 環境変数を以下のように変更：
   ```bash
   PREDICTIONS_ENABLED=false
   ```

3. フロントエンドプロジェクトでも同様に：
   ```bash
   REACT_APP_SHOW_PREDICTIONS=false
   ```

#### 2. デプロイの再実行
1. バックエンドAPIの「Manual Deploy」を実行
2. フロントエンドの「Manual Deploy」を実行

#### 3. データベースのロールバック（必要時）
```sql
-- last_purchasesテーブルを削除（注意: データが失われます）
DROP TABLE IF EXISTS last_purchases CASCADE;
```

## 監視項目

### デプロイ後の監視
- [ ] バックエンドAPIの応答時間（5秒以内）
- [ ] フロントエンドの読み込み時間（3秒以内）
- [ ] データベース接続エラー（0件）
- [ ] 既存機能のエラー率（1%未満）

### ログの確認
- [ ] Renderのログでエラーがないことを確認
- [ ] アプリケーションログで予測フラグが正しく設定されていることを確認

## 次のステップ

### フェーズ2の準備
- [ ] Flask予測サービスの実装
- [ ] Docker Composeへの`predictor`サービス追加
- [ ] 予測ロジックの実装

### 本番環境でのテスト計画
- [ ] 既存機能の動作確認
- [ ] データベース構造の確認
- [ ] 環境変数の動作確認
- [ ] パフォーマンスの確認

## トラブルシューティング

### よくある問題と解決方法

#### 1. デプロイエラー
**症状**: Renderでデプロイが失敗する
**解決方法**:
1. ログを確認してエラーの詳細を把握
2. 環境変数の設定を確認
3. 必要に応じてコードを修正して再デプロイ

#### 2. データベース接続エラー
**症状**: APIがデータベースに接続できない
**解決方法**:
1. Supabaseの接続情報を確認
2. 環境変数の設定を確認
3. ネットワーク設定を確認

#### 3. フロントエンドエラー
**症状**: ブラウザでアプリケーションが動作しない
**解決方法**:
1. ブラウザの開発者ツールでエラーを確認
2. 環境変数の設定を確認
3. APIとの通信を確認

## 参考資料

- [Issue #38](https://github.com/atsushimemet/regular-member/issues/38)
- [フェーズ0-1の実装詳細](./issue-38-predict-inventory-in-refrigerator-transition-plan.md)
- [予測機能の要件定義](./issue-38-predict-inventory-in-refrigerator-requirements.md)
- [既存のデプロイ手順](./DEPLOY.md) 
