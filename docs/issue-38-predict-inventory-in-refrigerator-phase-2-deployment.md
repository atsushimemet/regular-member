# Issue #38 予測機能 - フェーズ2デプロイ手順

このドキュメントでは、Issue #38の予測機能開発におけるフェーズ2（Flask予測サービスの導入）の本番環境へのデプロイ手順を説明します。

## 概要

### デプロイ対象
- **フェーズ2**: Flask予測サービスの導入
- **新規サービス**: `predictor`（Flask + 確率マトリックス）
- **Render統合**: 既存のRenderプロジェクトへの新規サービス追加

### デプロイ方針
- **Render統合**: 既存の`regular-member`プロジェクトに統合
- **段階的導入**: 既存サービスに影響を与えない
- **ロールバック可能**: 問題発生時は即座に無効化
- **監視強化**: ログとメトリクスの追加

### 技術的変更点
- 新しいFlaskサービスの追加
- `render.yaml`設定の拡張
- 確率マトリックスファイルの配置
- サービス間通信の設定

## 前提条件

### 必要な権限
- Renderプロジェクトの管理権限
- Supabaseプロジェクトの管理権限
- GitHubリポジトリのプッシュ権限

### 確認済み事項
- [ ] 開発環境での動作確認完了
- [ ] Flaskサービスの安定性確認
- [ ] 既存サービスへの影響なし確認
- [ ] ロールバック手順の準備
- [ ] 確率マトリックスファイルの準備

### フェーズ1完了確認
- [ ] フェーズ1のデプロイが完了している
- [ ] `last_purchases`テーブルが存在している
- [ ] 環境変数が正しく設定されている

### 現在のRender構成
- **フロントエンド**: `regular-member`（静的サイト）
- **バックエンドAPI**: `regular-member-full`（Node.js）
- **新規追加**: `regular-member-predictor`（Flask）

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
# 90642c9 docs: Update Phase 2 deployment strategy for Railway
# a57e93a docs: Add comprehensive introduction for Zenn publication
# [previous commits...]
```

#### 1.2 リモートへのプッシュ
```bash
# 変更をリモートにプッシュ
git push origin feature/issue-38-phase-2-flask-predictor

# プルリクエストの作成（GitHub上で実行）
# タイトル: "feat: Add phase 2 - Flask predictor service"
# 説明: フェーズ2の変更内容を記載
```

### ステップ2: Render設定の更新

#### 2.1 render.yamlの更新
`render.yaml`にFlask予測サービスを追加：

```yaml
services:
  # フロントエンド（静的サイト）
  - type: web
    name: regular-member-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    routes:
      - type: rewrite
        source: /*
        destination: /index.html

  # バックエンドAPI
  - type: web
    name: regular-member-full
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DB_HOST
        sync: false
      - key: DB_PORT
        value: 5432
      - key: DB_NAME
        sync: false
      - key: DB_USER
        sync: false
      - key: DB_PASSWORD
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: FRONTEND_URL
        value: https://regular-member.onrender.com
      - key: PREDICTOR_URL
        value: https://regular-member-predictor.onrender.com
      - key: PREDICTIONS_ENABLED
        value: false
      - key: PREDICTIONS_COUPLE_ALLOWLIST
        value: ""

  # Flask予測サービス
  - type: web
    name: regular-member-predictor
    env: python
    buildCommand: pip install -r predictor/requirements.txt
    startCommand: cd predictor && python app.py
    envVars:
      - key: PORT
        value: 5000
```

### ステップ3: Flaskサービスのファイル配置

#### 3.1 ディレクトリ構造の確認
```bash
# 本番環境で以下のディレクトリ構造を確認
regular-shopping-app/
├── predictor/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app.py
│   ├── probability_matrix.json
│   └── probability_matrix.json.backup
├── server/
│   └── [既存のNode.jsファイル]
├── src/
│   └── [既存のReactファイル]
└── render.yaml
```

#### 3.2 確率マトリックスファイルの配置
```bash
# 確率マトリックスファイルの内容確認
cat regular-shopping-app/predictor/probability_matrix.json

# 期待結果: 各カテゴリの確率データが含まれている
```

### ステップ4: Renderでのデプロイ

#### 4.1 GitHubとの連携確認
1. Renderダッシュボードでプロジェクトを開く
2. 「Settings」タブでGitHubリポジトリとの連携を確認
3. 自動デプロイが有効になっていることを確認

#### 4.2 環境変数の設定
Renderダッシュボードで各サービスに環境変数を設定：

**バックエンドAPI（regular-member-full）**:
- `NODE_ENV`: production
- `PORT`: 3001
- `DB_HOST`: Supabaseのホスト
- `DB_NAME`: データベース名
- `DB_USER`: ユーザー名
- `DB_PASSWORD`: パスワード
- `JWT_SECRET`: 秘密鍵
- `FRONTEND_URL`: https://regular-member.onrender.com
- `PREDICTOR_URL`: https://regular-member-predictor.onrender.com
- `PREDICTIONS_ENABLED`: false
- `PREDICTIONS_COUPLE_ALLOWLIST`: ""

**Flask予測サービス（regular-member-predictor）**:
- `PORT`: 5000

#### 4.3 デプロイの実行
```bash
# GitHubにプッシュすると自動デプロイが開始される
git push origin feature/issue-38-phase-2-flask-predictor

# または、Renderダッシュボードで手動デプロイ
```

### ステップ5: Renderでの動作確認

#### 5.1 サービス起動確認
```bash
# Renderダッシュボードでログを確認
# 期待結果: エラーがなく、Flaskアプリケーションが起動している
```

#### 5.2 ヘルスチェック
```bash
# ヘルスチェックエンドポイントの確認
curl https://regular-member-predictor.onrender.com/health

# 期待結果:
# {
#   "status": "OK",
#   "message": "Predictor service is running",
#   "version": "1.0.0"
# }
```

#### 5.3 予測エンドポイントの確認
```bash
# 予測エンドポイントのテスト
curl -X POST https://regular-member-predictor.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "categoryId": "dairy",
        "daysSinceLastPurchase": 3
      }
    ]
  }'

# 期待結果:
# {
#   "predictions": [
#     {
#       "categoryId": "dairy",
#       "daysSinceLastPurchase": 3,
#       "probability": 0.75
#     }
#   ]
# }
```

### ステップ6: Renderでの統合テスト

#### 6.1 サービス間通信の確認
```bash
# バックエンドAPIのヘルスチェック
curl https://regular-member-full.onrender.com/api/health

# 期待結果: 正常に通信できる
```

#### 6.2 全サービスの動作確認
```bash
# フロントエンドの確認
curl https://regular-member.onrender.com

# バックエンドAPIの確認
curl https://regular-member-full.onrender.com/api/health

# Flask予測サービスの確認
curl https://regular-member-predictor.onrender.com/health

# 期待結果: すべてのサービスが正常に動作している
```

## ロールバック手順

### 緊急時ロールバック
問題が発生した場合の緊急ロールバック手順：

#### 1. Renderでのサービスの停止
```bash
# Renderダッシュボードでregular-member-predictorサービスを停止
# または、環境変数を無効化
```

#### 2. 環境変数の無効化
```bash
# Renderダッシュボードで予測機能を無効化
PREDICTIONS_ENABLED=false
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
- ログの確認と修正
- 設定の調整
- サービスの再起動

#### 重大な問題
- サービスの完全停止
- 設定の完全復元
- 既存機能の動作確認

## 監視とログ

### ログの確認方法
```bash
# Renderダッシュボードでログを確認
# 各サービスの「Logs」タブを確認

# リアルタイムログ監視
# Renderダッシュボードで「Live Logs」を有効化
```

### メトリクスの確認
```bash
# メトリクスエンドポイントの確認
curl https://regular-member-predictor.onrender.com/metrics

# 期待結果: 予測呼び出し数やカテゴリ分布が表示される
```

### パフォーマンス監視
```bash
# レスポンス時間の確認
time curl -X POST https://regular-member-predictor.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": 3}]}'

# 期待結果: 100ms以内のレスポンス
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. サービスが起動しない
**症状**: `regular-member-predictor`サービスが起動しない
**原因**: requirements.txtの依存関係の問題、Python環境の問題
**解決方法**:
```bash
# Renderダッシュボードでログを確認
# requirements.txtの依存関係を確認
# Python環境の設定を確認
```

#### 2. 確率マトリックスファイルが見つからない
**症状**: 予測エンドポイントでエラーが発生
**原因**: ファイルの配置ミス、権限の問題
**解決方法**:
```bash
# ファイルの存在確認
ls -la regular-shopping-app/predictor/

# ファイルの再配置
cp regular-shopping-app/predictor/probability_matrix.json.backup regular-shopping-app/predictor/probability_matrix.json
```

#### 3. サービス間通信エラー
**症状**: `regular-member-full`から`regular-member-predictor`にアクセスできない
**原因**: URL設定の問題、ネットワーク設定の問題
**解決方法**:
```bash
# 環境変数の確認
# PREDICTOR_URLが正しく設定されているか確認
# Renderダッシュボードでサービス間の通信を確認
```

#### 4. 環境変数の問題
**症状**: 環境変数が正しく設定されていない
**原因**: Renderでの環境変数設定ミス
**解決方法**:
```bash
# Renderダッシュボードで環境変数を確認
# 各サービスに必要な環境変数が設定されているか確認
```

## 成功基準

### 必須項目
- [ ] Flaskサービスが正常に起動する
- [ ] `/health`エンドポイントが200を返す
- [ ] `/predict`エンドポイントが正常に動作する
- [ ] 確率マトリックスが正しく読み込まれる
- [ ] レスポンス時間が100ms以内
- [ ] エラーハンドリングが適切に動作する
- [ ] ログが適切に出力される
- [ ] サービス間通信が正常

### 推奨項目
- [ ] レスポンス時間が50ms以内
- [ ] エラー率が1%未満
- [ ] メモリ使用量が適切
- [ ] ログの可読性が高い

## 次のステップ

### フェーズ3の準備
- [ ] バックエンドAPIの拡張
- [ ] 予測エンドポイントの実装
- [ ] シャドーモードの実装

### 本番環境でのテスト計画
- [ ] 本番環境での動作確認
- [ ] パフォーマンスの確認
- [ ] エラーハンドリングの確認

## 参考資料

- [Issue #38](https://github.com/atsushimemet/regular-member/issues/38)
- [フェーズ0-1のデプロイ手順](./issue-38-predict-inventory-in-refrigerator-deployment.md)
- [フェーズ2のテスト計画](./issue-38-predict-inventory-in-refrigerator-phase-2-test.md)
- [Render設定](../regular-shopping-app/render.yaml)
- [Flask予測サービス](../regular-shopping-app/predictor/)

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
- [ ] render.yaml設定の更新
- [ ] Flaskサービスのファイル配置
- [ ] Renderでの環境変数設定
- [ ] 自動デプロイの確認

### 動作確認
- [ ] サービス起動確認
- [ ] ヘルスチェック
- [ ] 予測エンドポイントの確認
- [ ] サービス間通信の確認
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
