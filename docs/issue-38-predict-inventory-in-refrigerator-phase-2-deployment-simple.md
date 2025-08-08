# Issue #38 予測機能 - フェーズ2簡易デプロイ手順

このドキュメントでは、Issue #38の予測機能開発におけるフェーズ2（予測機能の統合）の本番環境への簡易デプロイ手順を説明します。

## 概要

### デプロイ対象
- **フェーズ2**: 予測機能の統合（既存バックエンドAPIに統合）
- **統合アプローチ**: FlaskロジックをNode.jsに移植
- **既存サービス活用**: 新規サービス追加なし

### デプロイ方針
- **既存サービス活用**: 新規サービスを追加せず、既存の`regular-member-full`に統合
- **段階的導入**: 機能フラグによる制御
- **ロールバック可能**: 問題発生時は即座に無効化
- **シンプル構成**: Blueprintを使わない単純な構成

### 技術的変更点
- 予測ロジックのNode.js実装
- 既存バックエンドAPIへの統合
- 機能フラグによる制御
- 環境変数の追加

## 前提条件

### 必要な権限
- Renderプロジェクトの管理権限
- Supabaseプロジェクトの管理権限
- GitHubリポジトリのプッシュ権限

### 確認済み事項
- [ ] 開発環境での動作確認完了
- [ ] 既存サービスへの影響なし確認
- [ ] ロールバック手順の準備
- [ ] 機能フラグの設定確認

### フェーズ1完了確認
- [ ] フェーズ1のデプロイが完了している
- [ ] `last_purchases`テーブルが存在している
- [ ] 環境変数が正しく設定されている

### 現在のRender構成
- **フロントエンド**: `regular-member`（静的サイト）- https://regular-member.onrender.com
- **バックエンドAPI**: `regular-member-full`（Node.js）- https://regular-member-full.onrender.com

## デプロイ手順

### ステップ1: コードの準備

#### 1.1 ブランチの確認
```bash
# 現在のブランチを確認
git branch
# 期待結果: feature/issue-38-phase-2-flask-predictor

# 最新のコミットを確認
git log --oneline -3
# 期待結果:
# 2977efb fix: Correct Render Blueprint configuration
# 068934f docs: Update Phase 2 deployment strategy for Railway
# [previous commits...]
```

#### 1.2 リモートへのプッシュ
```bash
# 変更をリモートにプッシュ
git push origin feature/issue-38-phase-2-flask-predictor

# プルリクエストの作成（GitHub上で実行）
# タイトル: "feat: Add phase 2 - integrated prediction functionality"
# 説明: フェーズ2の統合変更内容を記載
```

### ステップ2: 既存バックエンドAPIの更新

#### 2.1 新規ファイルの追加
以下のファイルが追加されます：
- `regular-shopping-app/server/routes/predictions.js` - 予測エンドポイント

#### 2.2 既存ファイルの変更
以下のファイルが更新されます：
- `regular-shopping-app/server/index.js` - 予測ルートの追加

### ステップ3: Renderでの環境変数設定

#### 3.1 バックエンドAPI環境変数の追加
Renderダッシュボードで`regular-member-full`サービスに以下の環境変数を追加：

```bash
# 予測機能のフラグ（初期はOFF）
PREDICTIONS_ENABLED=false

# 段階公開用の許可リスト（空で全量対象）
PREDICTIONS_COUPLE_ALLOWLIST=""
```

#### 3.2 フロントエンド環境変数の追加
Renderダッシュボードで`regular-member`サービスに以下の環境変数を追加：

```bash
# 予測表示フラグ（初期はOFF）
REACT_APP_SHOW_PREDICTIONS=false
```

### ステップ4: Renderでのデプロイ

#### 4.1 自動デプロイの確認
```bash
# GitHubにプッシュすると自動デプロイが開始される
git push origin feature/issue-38-phase-2-flask-predictor

# Renderダッシュボードでデプロイ状況を確認
```

#### 4.2 手動デプロイ（必要に応じて）
1. Renderダッシュボードで`regular-member-full`サービスを開く
2. 「Manual Deploy」をクリック
3. デプロイ状況を確認

### ステップ5: 動作確認

#### 5.1 サービス起動確認
```bash
# バックエンドAPIのヘルスチェック
curl https://regular-member-full.onrender.com/api/health

# 期待結果:
# {
#   "status": "OK",
#   "message": "Regular Shopping App API is running",
#   "predictions": {
#     "enabled": false,
#     "allowlistEnabled": false,
#     "allowlistSize": 0,
#     "predictorUrlConfigured": false
#   }
# }
```

#### 5.2 予測エンドポイントの確認（機能無効時）
```bash
# 予測エンドポイントのテスト（機能無効時）
curl -X POST https://regular-member-full.onrender.com/api/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "categoryId": "dairy",
        "daysSinceLastPurchase": 3
      }
    ]
  }'

# 期待結果（機能無効時）:
# {
#   "error": "Predictions feature is disabled",
#   "message": "This feature is currently not available"
# }
```

#### 5.3 機能有効化後の確認
```bash
# Renderダッシュボードで環境変数を変更
PREDICTIONS_ENABLED=true

# 予測エンドポイントのテスト（機能有効時）
curl -X POST https://regular-member-full.onrender.com/api/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "categoryId": "dairy",
        "daysSinceLastPurchase": 3
      }
    ]
  }'

# 期待結果（機能有効時）:
# {
#   "predictions": [
#     {
#       "categoryId": "dairy",
#       "daysSinceLastPurchase": 3,
#       "probability": 0.6
#     }
#   ]
# }
```

### ステップ6: 統合テスト

#### 6.1 既存機能の動作確認
```bash
# 1. 夫婦登録でトークンを取得
curl -X POST https://regular-member-full.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "coupleId": "test_couple_deployment",
    "coupleName": "デプロイテスト夫婦",
    "password": "testpassword123"
  }'

# 期待結果:
# {
#   "message": "Couple registered successfully",
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "couple": {
#     "coupleId": "test_couple_deployment",
#     "coupleName": "デプロイテスト夫婦"
#   }
# }

# 2. 取得したトークンでアイテム一覧を取得
curl -X GET https://regular-member-full.onrender.com/api/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 期待結果: 認証されたユーザーのアイテム一覧が返される
# {
#   "items": []
# }

# 3. アイテムを追加してテスト
curl -X POST https://regular-member-full.onrender.com/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "牛乳",
    "categoryId": "dairy"
  }'

# 期待結果:
# {
#   "message": "Item added successfully",
#   "item": {
#     "id": "...",
#     "name": "牛乳",
#     "categoryId": "dairy",
#     "createdAt": "..."
#   }
# }

# 4. 追加したアイテムを確認
curl -X GET https://regular-member-full.onrender.com/api/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 期待結果: 追加したアイテムが表示される
# {
#   "items": [
#     {
#       "id": "...",
#       "name": "牛乳",
#       "categoryId": "dairy",
#       "createdAt": "..."
#     }
#   ]
# }
```

#### 6.2 全サービスの動作確認
```bash
# フロントエンドの確認
curl https://regular-member.onrender.com

# バックエンドAPIの確認
curl https://regular-member-full.onrender.com/api/health

# 認証サービスの確認
curl https://regular-member-full.onrender.com/api/auth/health

# 期待結果: すべてのサービスが正常に動作している

#### 6.3 認証機能の詳細テスト
```bash
# 1. 認証サービスのヘルスチェック
curl https://regular-member-full.onrender.com/api/auth/health

# 期待結果:
# {
#   "status": "OK",
#   "message": "Auth service is running",
#   "endpoints": {
#     "register": "POST /api/auth/register",
#     "login": "POST /api/auth/login",
#     "verify": "GET /api/auth/verify"
#   }
# }

# 2. 夫婦ログインのテスト
curl -X POST https://regular-member-full.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "coupleId": "test_couple_deployment",
    "password": "testpassword123"
  }'

# 期待結果:
# {
#   "message": "Login successful",
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "couple": {
#     "coupleId": "test_couple_deployment",
#     "coupleName": "デプロイテスト夫婦"
#   }
# }

# 3. トークン検証のテスト
curl -X GET https://regular-member-full.onrender.com/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 期待結果:
# {
#   "valid": true,
#   "couple": {
#     "coupleId": "test_couple_deployment",
#     "coupleName": "デプロイテスト夫婦"
#   }
# }
```

### 注意事項
- **トークンの置き換え**: `YOUR_TOKEN_HERE`を実際に取得したトークンに置き換えてください
- **テストデータの管理**: デプロイテスト用のデータは本番環境では適切に管理してください
- **セキュリティ**: テスト用のパスワードは本番環境では強力なものに変更してください

## ロールバック手順

### 緊急時ロールバック
問題が発生した場合の緊急ロールバック手順：

#### 1. 機能フラグの無効化
```bash
# Renderダッシュボードで予測機能を無効化
PREDICTIONS_ENABLED=false
REACT_APP_SHOW_PREDICTIONS=false
```

#### 2. コードのロールバック
```bash
# 前のコミットに戻す
git revert HEAD
git push origin feature/issue-38-phase-2-flask-predictor
```

#### 3. 動作確認
```bash
# 既存機能の動作確認
curl https://regular-member-full.onrender.com/api/health

# 期待結果: 既存機能が正常に動作している
```

### 段階的ロールバック
問題の程度に応じた段階的ロールバック：

#### 軽微な問題
- 機能フラグの無効化
- ログの確認と修正
- 設定の調整

#### 重大な問題
- コードの完全ロールバック
- 機能フラグの完全無効化
- 既存機能の動作確認

## 監視とログ

### ログの確認方法
```bash
# Renderダッシュボードでログを確認
# regular-member-fullサービスの「Logs」タブを確認

# リアルタイムログ監視
# Renderダッシュボードで「Live Logs」を有効化
```

### メトリクスの確認
```bash
# メトリクスエンドポイントの確認
curl https://regular-member-full.onrender.com/api/predictions/metrics

# 期待結果:
# {
#   "total_categories": 12,
#   "prediction_logic": "integrated",
#   "version": "1.0.0"
# }
```

### パフォーマンス監視
```bash
# レスポンス時間の確認
time curl -X POST https://regular-member-full.onrender.com/api/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": 3}]}'

# 期待結果: 100ms以内のレスポンス
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. サービスが起動しない
**症状**: `regular-member-full`サービスが起動しない
**原因**: 新規ルートの追加によるエラー
**解決方法**:
```bash
# Renderダッシュボードでログを確認
# エラーの詳細を確認して修正
```

#### 2. 予測エンドポイントが動作しない
**症状**: `/api/predictions/predict`エンドポイントでエラーが発生
**原因**: 機能フラグの設定ミス、ルートの設定ミス
**解決方法**:
```bash
# 環境変数の確認
# PREDICTIONS_ENABLEDが正しく設定されているか確認
# ルートの設定を確認
```

#### 3. 既存機能への影響
**症状**: 既存のAPIエンドポイントが動作しない
**原因**: 新規ルートの追加による競合
**解決方法**:
```bash
# ルートの設定を確認
# 既存ルートとの競合を解決
```

#### 4. 環境変数の問題
**症状**: 環境変数が正しく設定されていない
**原因**: Renderでの環境変数設定ミス
**解決方法**:
```bash
# Renderダッシュボードで環境変数を確認
# 必要な環境変数が設定されているか確認
```

## 成功基準

### 必須項目
- [ ] 既存バックエンドAPIが正常に起動する
- [ ] 予測エンドポイントが正常に動作する（機能有効時）
- [ ] 機能フラグが正常に動作する
- [ ] 既存機能に影響がない
- [ ] ログが適切に出力される

### 推奨項目
- [ ] レスポンス時間が100ms以内
- [ ] エラー率が1%未満
- [ ] 機能フラグの切り替えが正常

## 次のステップ

### フェーズ3の準備
- [ ] フロントエンドでの予測表示機能
- [ ] ユーザーインターフェースの実装
- [ ] 段階的リリースの実装

### 本番環境でのテスト計画
- [ ] 機能フラグの動作確認
- [ ] パフォーマンスの確認
- [ ] エラーハンドリングの確認

## 参考資料

- [Issue #38](https://github.com/atsushimemet/regular-member/issues/38)
- [フェーズ0-1のデプロイ手順](./issue-38-predict-inventory-in-refrigerator-deployment.md)
- [フェーズ2のテスト計画](./issue-38-predict-inventory-in-refrigerator-phase-2-test.md)
- [統合予測ロジック](../regular-shopping-app/server/routes/predictions.js)

---

## 📋 デプロイチェックリスト

### 事前準備
- [ ] 開発環境での動作確認完了
- [ ] コードレビュー完了
- [ ] テスト計画の実行完了
- [ ] ロールバック手順の準備

### デプロイ実行
- [ ] ブランチの確認
- [ ] リモートへのプッシュ
- [ ] 既存バックエンドAPIの更新
- [ ] Renderでの環境変数設定
- [ ] 自動デプロイの確認

### 動作確認
- [ ] サービス起動確認
- [ ] 既存機能の動作確認
- [ ] 予測エンドポイントの確認
- [ ] 機能フラグの動作確認
- [ ] 全サービスの動作確認

### 監視設定
- [ ] ログ監視の設定
- [ ] メトリクス監視の設定
- [ ] パフォーマンス監視の設定
- [ ] アラート設定の確認

### 完了確認
- [ ] 成功基準の確認
- [ ] ドキュメントの更新
- [ ] チームへの報告
- [ ] 次のフェーズの準備 
