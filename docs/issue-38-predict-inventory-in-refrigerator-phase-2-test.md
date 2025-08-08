# Issue #38 予測機能 - フェーズ2テスト計画

このドキュメントでは、Issue #38の予測機能開発におけるフェーズ2（Flask予測サービスの導入）のテスト計画を説明します。

## 概要

### テスト対象
- **フェーズ2**: Flask予測サービスの導入（内部のみ）
- **新規サービス**: `predictor`（Flask + 確率マトリックス）
- **Docker統合**: Docker Composeへの`predictor`サービス追加

### テスト方針
- **内部ネットワーク限定**: 外部からのアクセス不可
- **健全性確認**: レスポンス時間とエラー率の監視
- **段階的検証**: サービス起動→基本動作→統合テスト

### テスト環境
- **開発環境**: Docker Compose（ローカル）
- **テスト期間**: 実装完了後
- **監視項目**: レスポンス時間、エラー率、ログ出力

## テスト項目

### 1. Docker Compose設定の確認

#### 1.1 predictorサービスの追加
**テスト項目**: Docker Composeに`predictor`サービスが正しく追加されている
**テスト方法**:
```bash
# Docker Compose設定の確認
docker compose -f regular-shopping-app/docker-compose.yml config

# 期待結果: predictorサービスが含まれている
```

**確認ポイント**:
- [ ] `predictor`サービスが定義されている
- [ ] ポート5000が公開されている
- [ ] 必要な環境変数が設定されている
- [ ] ネットワーク設定が正しい

#### 1.2 サービス間通信の確認
**テスト項目**: サービス間のネットワーク通信が正常
**テスト方法**:
```bash
# サービス起動
docker compose -f regular-shopping-app/docker-compose.yml up -d

# ネットワーク確認
docker compose -f regular-shopping-app/docker-compose.yml exec api ping predictor
```

**期待結果**:
- サービスが正常に起動する
- `api`サービスから`predictor`サービスにpingが通る

### 2. Flask予測サービスの基本動作

#### 2.1 サービス起動確認
**テスト項目**: `predictor`サービスが正常に起動する
**テスト方法**:
```bash
# サービス起動
docker compose -f regular-shopping-app/docker-compose.yml up -d predictor

# ログ確認
docker compose -f regular-shopping-app/docker-compose.yml logs predictor
```

**期待結果**:
- サービスが正常に起動する
- エラーログがない
- Flaskアプリケーションが起動している

#### 2.2 ヘルスチェックエンドポイント
**テスト項目**: `/health`エンドポイントが正常に動作する
**テスト方法**:
```bash
# ヘルスチェック
curl http://localhost:5001/health
```

**期待結果**:
```json
{
  "status": "OK",
  "message": "Predictor service is running",
  "version": "1.0.0"
}
```

#### 2.3 予測エンドポイントの基本動作
**テスト項目**: `/predict`エンドポイントが正常に動作する
**テスト方法**:
```bash
# サンプルリクエスト
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "categoryId": "dairy",
        "daysSinceLastPurchase": 3
      }
    ]
  }'
```

**期待結果**:
```json
{
  "predictions": [
    {
      "categoryId": "dairy",
      "daysSinceLastPurchase": 3,
      "probability": 0.75
    }
  ]
}
```

### 3. 確率マトリックスの動作確認

#### 3.1 確率マトリックスファイルの確認
**テスト項目**: `probability_matrix.json`が正しく読み込まれる
**テスト方法**:
```bash
# ファイル存在確認
docker compose -f regular-shopping-app/docker-compose.yml exec predictor ls -la /app/probability_matrix.json

# ファイル内容確認
docker compose -f regular-shopping-app/docker-compose.yml exec predictor cat /app/probability_matrix.json
```

**期待結果**:
- ファイルが存在する
- JSON形式で正しく解析できる
- 必要なカテゴリと日数が含まれている

#### 3.2 各カテゴリの確率計算
**テスト項目**: 各カテゴリの確率が正しく計算される
**テスト方法**:
```bash
# 各カテゴリのテスト
for category in dairy frozen vegetables; do
  curl -X POST http://localhost:5001/predict \
    -H "Content-Type: application/json" \
    -d "{\"items\": [{\"categoryId\": \"$category\", \"daysSinceLastPurchase\": 1}]}"
done
```

**期待結果**:
- 各カテゴリで異なる確率が返される
- 日数が増えると確率が低下する
- 確率は0-1の範囲内

### 4. パフォーマンステスト

#### 4.1 レスポンス時間
**テスト項目**: レスポンス時間が100ms以内
**テスト方法**:
```bash
# 10回のリクエストで平均時間を測定
for i in {1..10}; do
  time curl -X POST http://localhost:5001/predict \
    -H "Content-Type: application/json" \
    -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": 3}]}' \
    -s -o /dev/null
done
```

**期待結果**:
- 平均レスポンス時間: 100ms以内
- 最大レスポンス時間: 200ms以内

#### 4.2 同時リクエスト処理
**テスト項目**: 複数の同時リクエストを正常に処理
**テスト方法**:
```bash
# 5つの同時リクエスト
for i in {1..5}; do
  curl -X POST http://localhost:5001/predict \
    -H "Content-Type: application/json" \
    -d "{\"items\": [{\"categoryId\": \"dairy\", \"daysSinceLastPurchase\": $i}]}" &
done
wait
```

**期待結果**:
- すべてのリクエストが正常に処理される
- エラーが発生しない
- レスポンス時間が許容範囲内

### 5. エラーハンドリング

#### 5.1 無効なリクエスト
**テスト項目**: 無効なリクエストに対する適切なエラーハンドリング
**テスト方法**:
```bash
# 無効なJSON
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d 'invalid json'

# 無効なカテゴリ
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "invalid", "daysSinceLastPurchase": 3}]}'

# 無効な日数
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": -1}]}'
```

**期待結果**:
- 適切なエラーメッセージが返される
- HTTPステータスコードが正しい（400, 422等）
- アプリケーションがクラッシュしない

#### 5.2 確率マトリックスファイルエラー
**テスト項目**: 確率マトリックスファイルが存在しない場合の処理
**テスト方法**:
```bash
# ファイルを一時的に削除
docker compose -f regular-shopping-app/docker-compose.yml exec predictor rm /app/probability_matrix.json

# リクエスト実行
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": 3}]}'

# ファイルを復元
docker compose -f regular-shopping-app/docker-compose.yml exec predictor cp /app/probability_matrix.json.backup /app/probability_matrix.json
```

**期待結果**:
- 適切なエラーメッセージが返される
- サービスが停止しない

### 6. ログ出力の確認

#### 6.1 アクセスログ
**テスト項目**: リクエストが適切にログ出力される
**テスト方法**:
```bash
# リクエスト実行
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": 3}]}'

# ログ確認
docker compose -f regular-shopping-app/docker-compose.yml logs predictor
```

**期待結果**:
- リクエストログが出力される
- レスポンス時間が記録される
- エラーが発生した場合はエラーログが出力される

#### 6.2 メトリクス出力
**テスト項目**: 予測呼び出し数とカテゴリ分布が記録される
**テスト方法**:
```bash
# 複数のカテゴリでリクエスト
for category in dairy frozen vegetables meat; do
  curl -X POST http://localhost:5001/predict \
    -H "Content-Type: application/json" \
    -d "{\"items\": [{\"categoryId\": \"$category\", \"daysSinceLastPurchase\": 3}]}"
done

# ログ確認
docker compose -f regular-shopping-app/docker-compose.yml logs predictor
```

**期待結果**:
- 予測呼び出し数が記録される
- カテゴリ分布が記録される
- 平均レスポンス時間が記録される

### 7. 統合テスト

#### 7.1 サービス間通信
**テスト項目**: `api`サービスから`predictor`サービスへの通信
**テスト方法**:
```bash
# apiサービスからpredictorサービスへのテスト（Node.js 18の組み込みfetch使用）
docker compose -f regular-shopping-app/docker-compose.yml exec api node -e "
fetch('http://predictor:5000/health')
  .then(res => res.json())
  .then(data => console.log('Health check:', data))
  .catch(err => console.error('Error:', err));
"

# または、pingでネットワーク接続を確認
docker compose -f regular-shopping-app/docker-compose.yml exec api ping predictor
```

**期待結果**:
- 正常に通信できる
- ヘルスチェックが成功する

#### 7.2 全サービス起動確認
**テスト項目**: すべてのサービスが正常に起動する
**テスト方法**:
```bash
# 全サービス起動
docker compose -f regular-shopping-app/docker-compose.yml up -d

# サービス状態確認
docker compose -f regular-shopping-app/docker-compose.yml ps
```

**期待結果**:
- すべてのサービスが`Up`状態
- エラーがない

## テスト実行手順

### 事前準備
1. Docker環境の確認
2. テスト用データの準備
3. ログ監視ツールの準備

### テスト実行順序
1. **Docker Compose設定確認** (5分)
2. **Flaskサービス起動確認** (10分)
3. **基本エンドポイントテスト** (15分)
4. **確率マトリックステスト** (20分)
5. **パフォーマンステスト** (15分)
6. **エラーハンドリングテスト** (15分)
7. **ログ出力確認** (10分)
8. **統合テスト** (10分)

### テスト結果記録
- [ ] 各テスト項目の結果を記録
- [ ] パフォーマンス測定値を記録
- [ ] エラーログを保存
- [ ] 問題が発生した場合は詳細を記録

## 成功基準

### 必須項目
- [x] Flaskサービスが正常に起動する
- [x] `/health`エンドポイントが200を返す
- [x] `/predict`エンドポイントが正常に動作する
- [x] 確率マトリックスが正しく読み込まれる
- [x] レスポンス時間が100ms以内
- [x] エラーハンドリングが適切に動作する
- [x] ログが適切に出力される
- [x] サービス間通信が正常

### 推奨項目
- [x] レスポンス時間が50ms以内（平均約5ms）
- [x] エラー率が1%未満（エラーなし）
- [x] メモリ使用量が適切

## 問題発生時の対応

### 軽微な問題
**症状**: 一部の機能でエラーが発生するが、全体の動作に影響がない
**対応**:
1. エラーの詳細を記録
2. ログを確認して原因を特定
3. 修正後に再テスト

### 重大な問題
**症状**: サービスが起動しない、レスポンス時間が大幅に遅い
**対応**:
1. サービスを停止してログを確認
2. 設定ファイルを確認
3. 必要に応じてDockerイメージを再ビルド

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
- [フェーズ0-1の実装詳細](./issue-38-predict-inventory-in-refrigerator-transition-plan.md)
- [予測機能の要件定義](./issue-38-predict-inventory-in-refrigerator-requirements.md)
- [Docker Compose設定](./../regular-shopping-app/docker-compose.yml)

---

## UAT確認項目（ユーザー確認用）

### 基本動作確認
- [ ] Flask予測サービスが正常に起動する
- [ ] ヘルスチェックエンドポイント（`http://localhost:5001/health`）が正常に動作する
- [ ] 予測エンドポイント（`http://localhost:5001/predict`）が正常に動作する
- [ ] 確率マトリックスが正しく読み込まれる

### パフォーマンス確認
- [ ] レスポンス時間が100ms以内
- [ ] 同時リクエスト処理が正常
- [ ] メモリ使用量が適切

### エラーハンドリング確認
- [ ] 無効なリクエストに対する適切なエラーハンドリング
- [ ] 確率マトリックスファイルエラー時の適切な処理
- [ ] サービスがクラッシュしない

### 統合確認
- [ ] Docker Composeで全サービスが正常に起動する
- [ ] サービス間通信が正常
- [ ] ログが適切に出力される

### 本番環境準備
- [ ] 本番環境での動作確認
- [ ] パフォーマンスの確認
- [ ] エラーハンドリングの確認 
