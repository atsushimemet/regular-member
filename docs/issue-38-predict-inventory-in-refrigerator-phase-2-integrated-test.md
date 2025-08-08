# Issue #38 予測機能 - フェーズ2統合テスト計画

このドキュメントでは、Issue #38の予測機能開発におけるフェーズ2（統合アプローチ）のテスト計画を説明します。

## 📋 はじめに

### 🎯 テスト対象
- **フェーズ2**: 予測機能の統合（既存バックエンドAPIに統合）
- **統合アプローチ**: FlaskロジックをNode.jsに移植
- **既存サービス活用**: 新規サービス追加なし

### 🧪 テスト方針
- **既存機能保護**: 既存APIへの影響を最小化
- **機能フラグ制御**: 予測機能の有効/無効をテスト
- **段階的検証**: 統合→基本動作→機能フラグ→パフォーマンス

### 🛠️ テスト環境
- **開発環境**: Docker Compose（ローカル）
- **テスト期間**: 実装完了後
- **監視項目**: レスポンス時間、エラー率、ログ出力

## テスト項目

### 1. 開発環境セットアップ

#### 1.1 Docker Compose設定の確認
**テスト項目**: 既存のDocker Compose設定が正常に動作する
**テスト方法**:
```bash
# Docker Compose設定の確認
docker compose -f regular-shopping-app/docker-compose.yml config

# 期待結果: 設定エラーがない
```

**確認ポイント**:
- [ ] 既存サービス（db, api, frontend）が定義されている
- [ ] 新規のpredictionsルートが追加されている
- [ ] 環境変数が正しく設定されている

#### 1.2 サービス起動確認
**テスト項目**: 全サービスが正常に起動する
**テスト方法**:
```bash
# サービス起動
docker compose -f regular-shopping-app/docker-compose.yml up -d

# サービス状態確認
docker compose -f regular-shopping-app/docker-compose.yml ps
```

**期待結果**:
- すべてのサービスが`Up`状態
- エラーログがない

### 2. 既存機能の動作確認

#### 2.1 既存APIエンドポイントの確認
**テスト項目**: 既存のAPIエンドポイントが正常に動作する
**テスト方法**:
```bash
# ヘルスチェック
curl http://localhost:3001/api/health

# 認証エンドポイント
curl http://localhost:3001/api/auth/health

# アイテムエンドポイント
curl http://localhost:3001/api/items
```

**期待結果**:
- すべての既存エンドポイントが正常に動作
- 新規ルートの追加による影響がない

#### 2.2 フロントエンドの動作確認
**テスト項目**: フロントエンドが正常に動作する
**テスト方法**:
```bash
# フロントエンドの確認
curl http://localhost:3000

# 期待結果: Reactアプリケーションが正常に表示される
```

### 3. 予測機能の基本動作

#### 3.1 機能フラグ無効時の動作
**テスト項目**: 機能フラグが無効の場合の動作
**テスト方法**:
```bash
# 環境変数を無効に設定
export PREDICTIONS_ENABLED=false

# 予測エンドポイントのテスト
curl -X POST http://localhost:3001/api/predictions/predict \
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
  "error": "Predictions feature is disabled",
  "message": "This feature is currently not available"
}
```

#### 3.2 機能フラグ有効時の動作
**テスト項目**: 機能フラグが有効の場合の動作
**テスト方法**:
```bash
# 環境変数を有効に設定
export PREDICTIONS_ENABLED=true

# 予測エンドポイントのテスト
curl -X POST http://localhost:3001/api/predictions/predict \
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
      "probability": 0.6
    }
  ]
}
```

### 4. 予測ロジックの動作確認

#### 4.1 各カテゴリの確率計算
**テスト項目**: 各カテゴリの確率が正しく計算される
**テスト方法**:
```bash
# 各カテゴリのテスト
for category in dairy frozen vegetables fruits meat fish beans mushrooms bread beverages snacks other; do
  curl -X POST http://localhost:3001/api/predictions/predict \
    -H "Content-Type: application/json" \
    -d "{\"items\": [{\"categoryId\": \"$category\", \"daysSinceLastPurchase\": 1}]}"
done
```

**期待結果**:
- 各カテゴリで異なる確率が返される
- 日数が増えると確率が低下する
- 確率は0-1の範囲内

#### 4.2 日数範囲の確率計算
**テスト項目**: 日数範囲に応じた確率計算
**テスト方法**:
```bash
# 各日数範囲のテスト
for days in 0 1 2 3 4 7 8 14 15 30 31 50; do
  curl -X POST http://localhost:3001/api/predictions/predict \
    -H "Content-Type: application/json" \
    -d "{\"items\": [{\"categoryId\": \"dairy\", \"daysSinceLastPurchase\": $days}]}"
done
```

**期待結果**:
- 0-1日: 0.8
- 2-3日: 0.6
- 4-7日: 0.4
- 8-14日: 0.2
- 15-30日: 0.1
- 31+日: 0.05

### 5. エラーハンドリング

#### 5.1 無効なリクエスト
**テスト項目**: 無効なリクエストに対する適切なエラーハンドリング
**テスト方法**:
```bash
# 無効なJSON
curl -X POST http://localhost:3001/api/predictions/predict \
  -H "Content-Type: application/json" \
  -d 'invalid json'

# 無効なカテゴリ
curl -X POST http://localhost:3001/api/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "invalid", "daysSinceLastPurchase": 3}]}'

# 無効な日数
curl -X POST http://localhost:3001/api/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": -1}]}'

# 空のアイテム配列
curl -X POST http://localhost:3001/api/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{"items": []}'
```

**期待結果**:
- 適切なエラーメッセージが返される
- HTTPステータスコードが正しい（400, 422等）
- アプリケーションがクラッシュしない

#### 5.2 未知のカテゴリ
**テスト項目**: 未知のカテゴリに対する処理
**テスト方法**:
```bash
# 未知のカテゴリ
curl -X POST http://localhost:3001/api/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "unknown_category", "daysSinceLastPurchase": 3}]}'
```

**期待結果**:
- デフォルト確率（0.5）が返される
- 警告ログが出力される

### 6. パフォーマンステスト

#### 6.1 レスポンス時間
**テスト項目**: レスポンス時間が100ms以内
**テスト方法**:
```bash
# 10回のリクエストで平均時間を測定
for i in {1..10}; do
  time curl -X POST http://localhost:3001/api/predictions/predict \
    -H "Content-Type: application/json" \
    -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": 3}]}' \
    -s -o /dev/null
done
```

**期待結果**:
- 平均レスポンス時間: 100ms以内
- 最大レスポンス時間: 200ms以内

#### 6.2 同時リクエスト処理
**テスト項目**: 複数の同時リクエストを正常に処理
**テスト方法**:
```bash
# 5つの同時リクエスト
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/predictions/predict \
    -H "Content-Type: application/json" \
    -d "{\"items\": [{\"categoryId\": \"dairy\", \"daysSinceLastPurchase\": $i}]}" &
done
wait
```

**期待結果**:
- すべてのリクエストが正常に処理される
- エラーが発生しない
- レスポンス時間が許容範囲内

### 7. ログ出力の確認

#### 7.1 アクセスログ
**テスト項目**: リクエストが適切にログ出力される
**テスト方法**:
```bash
# リクエスト実行
curl -X POST http://localhost:3001/api/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": 3}]}'

# ログ確認
docker compose -f regular-shopping-app/docker-compose.yml logs api
```

**期待結果**:
- リクエストログが出力される
- 予測結果がログに記録される
- エラーが発生した場合はエラーログが出力される

#### 7.2 メトリクス出力
**テスト項目**: 予測呼び出し数とカテゴリ分布が記録される
**テスト方法**:
```bash
# 複数のカテゴリでリクエスト
for category in dairy frozen vegetables meat; do
  curl -X POST http://localhost:3001/api/predictions/predict \
    -H "Content-Type: application/json" \
    -d "{\"items\": [{\"categoryId\": \"$category\", \"daysSinceLastPurchase\": 3}]}"
done

# メトリクスエンドポイントの確認
curl http://localhost:3001/api/predictions/metrics
```

**期待結果**:
- 予測呼び出し数が記録される
- カテゴリ分布が記録される
- メトリクスエンドポイントが正常に動作する

### 8. 統合テスト

#### 8.1 全APIエンドポイントの動作確認
**テスト項目**: すべてのAPIエンドポイントが正常に動作する
**テスト方法**:
```bash
# ヘルスチェック
curl http://localhost:3001/api/health

# 認証
curl http://localhost:3001/api/auth/health

# アイテム
curl http://localhost:3001/api/items

# 予測（機能有効時）
curl -X POST http://localhost:3001/api/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{"items": [{"categoryId": "dairy", "daysSinceLastPurchase": 3}]}'

# メトリクス
curl http://localhost:3001/api/predictions/metrics
```

**期待結果**:
- すべてのエンドポイントが正常に動作する
- エラーが発生しない

#### 8.2 フロントエンドとの統合
**テスト項目**: フロントエンドがバックエンドAPIと正常に通信する
**テスト方法**:
```bash
# フロントエンドの動作確認
curl http://localhost:3000

# ブラウザでフロントエンドにアクセス
# 既存機能が正常に動作することを確認
```

**期待結果**:
- フロントエンドが正常に表示される
- 既存機能が正常に動作する

## テスト実行手順

### 事前準備
1. Docker環境の確認
2. 環境変数の設定
3. ログ監視ツールの準備

### テスト実行順序
1. **開発環境セットアップ** (5分)
2. **既存機能確認** (10分)
3. **予測機能基本動作** (15分)
4. **予測ロジック確認** (20分)
5. **エラーハンドリング** (15分)
6. **パフォーマンステスト** (15分)
7. **ログ出力確認** (10分)
8. **統合テスト** (10分)

### テスト結果記録
- [ ] 各テスト項目の結果を記録
- [ ] パフォーマンス測定値を記録
- [ ] エラーログを保存
- [ ] 問題が発生した場合は詳細を記録

## 成功基準

### 必須項目
- [x] 既存バックエンドAPIが正常に起動する
- [x] 予測エンドポイントが正常に動作する（機能有効時）
- [x] 機能フラグが正常に動作する
- [x] 既存機能に影響がない
- [x] ログが適切に出力される
- [x] エラーハンドリングが適切に動作する

### 推奨項目
- [x] レスポンス時間が100ms以内
- [x] エラー率が1%未満
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
- [ ] フロントエンドでの予測表示機能
- [ ] ユーザーインターフェースの実装
- [ ] 段階的リリースの実装

### 本番環境でのテスト計画
- [ ] 本番環境での動作確認
- [ ] パフォーマンスの確認
- [ ] エラーハンドリングの確認

## 参考資料

- [Issue #38](https://github.com/atsushimemet/regular-member/issues/38)
- [フェーズ0-1の実装詳細](./issue-38-predict-inventory-in-refrigerator-deployment.md)
- [フェーズ2の統合デプロイ手順](./issue-38-predict-inventory-in-refrigerator-phase-2-deployment-simple.md)
- [統合予測ロジック](../regular-shopping-app/server/routes/predictions.js)

---

## UAT確認項目（ユーザー確認用）

### 基本動作確認
- [ ] 既存バックエンドAPIが正常に起動する
- [ ] 既存のAPIエンドポイントが正常に動作する
- [ ] 予測エンドポイントが正常に動作する（機能フラグ有効時）
- [ ] 機能フラグが正常に動作する（無効/有効の切り替え）

### 予測ロジック確認
- [ ] 各カテゴリの確率が正しく計算される
- [ ] 日数範囲に応じた確率計算が正常
- [ ] 未知のカテゴリに対する適切な処理
- [ ] 無効なリクエストに対するエラーハンドリング

### パフォーマンス確認
- [ ] レスポンス時間が100ms以内
- [ ] 同時リクエスト処理が正常
- [ ] メモリ使用量が適切

### 統合確認
- [ ] フロントエンドが正常に動作する
- [ ] 既存機能に影響がない
- [ ] ログが適切に出力される

### エラーハンドリング確認
- [ ] 無効なリクエストに対する適切な処理
- [ ] 未知のカテゴリに対する警告ログ
- [ ] サービスがクラッシュしない

### 本番環境準備
- [ ] 本番環境での動作確認
- [ ] パフォーマンスの確認
- [ ] エラーハンドリングの確認 
