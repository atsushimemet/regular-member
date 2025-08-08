# Issue #38 予測機能 - フェーズ2デプロイ手順

このドキュメントでは、Issue #38の予測機能開発におけるフェーズ2（Flask予測サービスの導入）の本番環境へのデプロイ手順を説明します。

## 概要

### デプロイ対象
- **フェーズ2**: Flask予測サービスの導入
- **新規サービス**: `predictor`（Flask + 確率マトリックス）
- **Docker統合**: 本番環境でのFlaskサービス追加

### デプロイ方針
- **内部ネットワーク限定**: 外部からのアクセス不可
- **段階的導入**: 既存サービスに影響を与えない
- **ロールバック可能**: 問題発生時は即座に無効化
- **監視強化**: ログとメトリクスの追加

### 技術的変更点
- 新しいFlaskサービスの追加
- Docker Compose設定の拡張
- 確率マトリックスファイルの配置
- サービス間通信の設定

## 前提条件

### 必要な権限
- Renderプロジェクトの管理権限
- Docker環境の管理権限
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
# a57e93a docs: Add comprehensive introduction for Zenn publication
# 00ca3a7 docs: Fix service communication test command
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

### ステップ2: 本番環境でのデプロイ設定

#### 2.1 Railwayでの統合デプロイ設定
本番環境ではRailwayを使用して統合デプロイを行います：

```bash
# Railway CLIのインストール
npm install -g @railway/cli

# プロジェクトの初期化
railway login
railway init
```

#### 2.2 本番用Docker Compose設定の作成
`docker-compose.prod.yml`を作成：

```yaml
version: '3.8'

services:
  # バックエンドAPI
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    environment:
      NODE_ENV: production
      PORT: 3001
      DB_HOST: ${DB_HOST}
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      PREDICTOR_URL: http://predictor:5000
      PREDICTIONS_ENABLED: ${PREDICTIONS_ENABLED}
      PREDICTIONS_COUPLE_ALLOWLIST: ${PREDICTIONS_COUPLE_ALLOWLIST}
    ports:
      - "3001:3001"
    depends_on:
      - predictor

  # Flask予測サービス
  predictor:
    build:
      context: ./predictor
      dockerfile: Dockerfile
    environment:
      PORT: 5000
    ports:
      - "5000:5000"
    volumes:
      - ./predictor:/app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
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
└── docker-compose.yml
```

#### 3.2 確率マトリックスファイルの配置
```bash
# 確率マトリックスファイルの内容確認
cat regular-shopping-app/predictor/probability_matrix.json

# 期待結果: 各カテゴリの確率データが含まれている
```

### ステップ4: Railwayでの本番デプロイ

#### 4.1 環境変数の設定
Railwayダッシュボードで環境変数を設定：

```bash
# Railway CLIで環境変数を設定
railway variables set DB_HOST=your-supabase-host
railway variables set DB_NAME=your-database-name
railway variables set DB_USER=your-username
railway variables set DB_PASSWORD=your-password
railway variables set JWT_SECRET=your-jwt-secret
railway variables set PREDICTIONS_ENABLED=false
railway variables set PREDICTIONS_COUPLE_ALLOWLIST=""
```

#### 4.2 Railwayでのデプロイ
```bash
# Railwayにデプロイ
railway up

# デプロイ状況の確認
railway status
```

#### 4.3 デプロイ後の確認
```bash
# ログの確認
railway logs

# サービスの状態確認
railway status
```

### ステップ5: Railwayでの動作確認

#### 5.1 サービス起動確認
```bash
# Railwayログの確認
railway logs

# 期待結果: エラーがなく、Flaskアプリケーションが起動している
```

#### 5.2 ヘルスチェック
```bash
# RailwayのURLを取得
railway domain

# ヘルスチェックエンドポイントの確認
curl https://your-railway-app.railway.app/health

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
curl -X POST https://your-railway-app.railway.app/predict \
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

### ステップ6: Railwayでの統合テスト

#### 6.1 サービス間通信の確認
```bash
# RailwayのAPIエンドポイントで通信確認
curl https://your-railway-app.railway.app/api/health

# 期待結果: 正常に通信できる
```

#### 6.2 全サービスの動作確認
```bash
# Railwayサービスの状態確認
railway status

# 期待結果: すべてのサービスが正常に動作している
```

## ロールバック手順

### 緊急時ロールバック
問題が発生した場合の緊急ロールバック手順：

#### 1. Railwayでのサービスの停止
```bash
# Railwayでのサービスの停止
railway service stop predictor

# 他のサービスは継続
railway service start api
```

#### 2. 環境変数の無効化
```bash
# 予測機能を無効化
railway variables set PREDICTIONS_ENABLED=false
```

#### 3. 動作確認
```bash
# 既存機能の動作確認
curl https://your-railway-app.railway.app/api/health

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
# Railwayでのログ確認
railway logs

# リアルタイムログ監視
railway logs --follow

# 特定のサービスのログ
railway logs --service predictor
```

### メトリクスの確認
```bash
# メトリクスエンドポイントの確認
curl http://localhost:5001/metrics

# 期待結果: 予測呼び出し数やカテゴリ分布が表示される
```

### パフォーマンス監視
```bash
# レスポンス時間の確認
time curl -X POST https://your-railway-app.railway.app/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": 3}]}'

# 期待結果: 100ms以内のレスポンス
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. サービスが起動しない
**症状**: Railwayで`predictor`サービスが起動しない
**原因**: Dockerfileの設定ミス、依存関係の問題
**解決方法**:
```bash
# ログの確認
railway logs --service predictor

# Railwayでの再デプロイ
railway up
```

#### 2. 確率マトリックスファイルが見つからない
**症状**: 予測エンドポイントでエラーが発生
**原因**: ファイルの配置ミス、権限の問題
**解決方法**:
```bash
# Railwayでのファイル確認
railway run ls -la /app/

# ファイルの再配置
railway run cp /app/probability_matrix.json.backup /app/probability_matrix.json
```

#### 3. サービス間通信エラー
**症状**: `api`サービスから`predictor`サービスにアクセスできない
**原因**: Railwayのネットワーク設定の問題
**解決方法**:
```bash
# Railwayでのサービス状態確認
railway status

# Railwayでの再デプロイ
railway up
```

#### 4. 環境変数の問題
**症状**: 環境変数が正しく設定されていない
**原因**: Railwayでの環境変数設定ミス
**解決方法**:
```bash
# 環境変数の確認
railway variables

# 環境変数の再設定
railway variables set PREDICTIONS_ENABLED=false
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
- [Docker Compose設定](../regular-shopping-app/docker-compose.yml)
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
- [ ] Docker Compose設定の更新
- [ ] Flaskサービスのファイル配置
- [ ] サービスのビルド
- [ ] 全サービスの起動

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
