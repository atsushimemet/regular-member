# Issue #38 予測機能 - フェーズ2テスト計画

## 📋 はじめに

このドキュメントは、**定期的な買い物リストアプリ**に「冷蔵庫内の在庫予測機能」を追加する開発プロジェクトの**フェーズ2**におけるテスト計画書です。

### 🎯 プロジェクト概要

**Issue #38**: [冷蔵庫内の在庫を予測する機能の実装](https://github.com/atsushimemet/regular-member/issues/38)

#### 背景
- ユーザーが定期的に購入する商品のリストを管理するアプリ
- 現在は手動でチェックリストを作成・管理
- **新機能**: 最後に購入してからの日数に基づいて「冷蔵庫に在庫がある確率」を自動計算

#### 技術スタック
- **フロントエンド**: React + TypeScript
- **バックエンド**: Node.js + Express.js
- **データベース**: PostgreSQL
- **新規サービス**: Flask（Python）予測エンジン
- **インフラ**: Docker + Docker Compose

### 🔄 開発フェーズ

このプロジェクトは**段階的なロールアウト**で進められています：

1. **フェーズ0**: 準備（機能フラグ、ログ基盤）
2. **フェーズ1**: データベース拡張（`last_purchases`テーブル追加）
3. **フェーズ2**: Flask予測サービスの導入 ⬅️ **現在ここ**
4. **フェーズ3**: バックエンドAPI拡張
5. **フェーズ4**: フロントエンド実装
6. **フェーズ5**: カナリアリリース
7. **フェーズ6**: 段階的スケールアップ

### 🧠 予測ロジック

#### 確率計算の仕組み
```
確率 = f(カテゴリ, 最後に購入してからの日数)
```

**例**:
- **乳製品（dairy）**: 購入後1日 → 80%の確率で在庫あり
- **冷凍食品（frozen）**: 購入後7日 → 60%の確率で在庫あり
- **野菜（vegetables）**: 購入後3日 → 30%の確率で在庫あり

#### カテゴリ分類
- `dairy`（乳製品）
- `frozen`（冷凍食品）
- `vegetables`（野菜）
- `fruits`（果物）
- `meat`（肉類）
- `fish`（魚類）
- `beans`（豆類）
- `mushrooms`（きのこ類）
- `bread`（パン類）
- `beverages`（飲料）
- `snacks`（スナック）
- `other`（その他）

### 🏗️ アーキテクチャ

#### 現在の構成
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │     API     │    │   Database  │
│  (React)    │◄──►│  (Node.js)  │◄──►│ (PostgreSQL)│
└─────────────┘    └─────────────┘    └─────────────┘
```

#### フェーズ2後の構成
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │     API     │    │   Database  │
│  (React)    │◄──►│  (Node.js)  │◄──►│ (PostgreSQL)│
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │  Predictor  │
                   │   (Flask)   │
                   └─────────────┘
```

### 🎯 フェーズ2の目的

1. **独立した予測サービス**の構築
2. **確率マトリックス**による予測ロジックの実装
3. **Docker環境**での統合
4. **内部ネットワーク**での動作確認

### 📊 期待される効果

- **ユーザー体験の向上**: 在庫の有無を視覚的に確認
- **買い物の効率化**: 必要な商品の見落としを防止
- **データ駆動**: 購入履歴に基づく予測精度の向上

---

このドキュメントでは、フェーズ2の実装が正常に動作することを確認するための包括的なテスト計画を説明します。

## 🧪 テスト概要

### 🎯 テスト対象
- **フェーズ2**: Flask予測サービスの導入（内部のみ）
- **新規サービス**: `predictor`（Flask + 確率マトリックス）
- **Docker統合**: Docker Composeへの`predictor`サービス追加

### 📋 テスト方針
- **内部ネットワーク限定**: 外部からのアクセス不可
- **健全性確認**: レスポンス時間とエラー率の監視
- **段階的検証**: サービス起動→基本動作→統合テスト

### 🛠️ テスト環境
- **開発環境**: Docker Compose（ローカル）
- **テスト期間**: 実装完了後
- **監視項目**: レスポンス時間、エラー率、ログ出力

### 📝 テストの流れ

1. **環境セットアップ**: Docker Compose設定の確認
2. **サービス起動**: Flask予測サービスの動作確認
3. **基本機能**: エンドポイントの動作確認
4. **予測ロジック**: 確率マトリックスの動作確認
5. **パフォーマンス**: レスポンス時間と同時処理の確認
6. **エラー処理**: 異常系の動作確認
7. **統合テスト**: 全サービス間の連携確認

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

---

## 📚 関連ドキュメント

### プロジェクト全体
- [Issue #38: 冷蔵庫内の在庫を予測する機能の実装](https://github.com/atsushimemet/regular-member/issues/38)
- [プロジェクト概要](./README.md)

### 開発フェーズ
- [フェーズ0-1: 準備とDB拡張](./issue-38-predict-inventory-in-refrigerator-deployment.md)
- [フェーズ2: Flask予測サービス（本ドキュメント）](./issue-38-predict-inventory-in-refrigerator-phase-2-test.md)
- [フェーズ3以降: バックエンド・フロントエンド実装（予定）]

### 技術仕様
- [Docker Compose設定](../regular-shopping-app/docker-compose.yml)
- [Flask予測サービス](../regular-shopping-app/predictor/)
- [確率マトリックス](../regular-shopping-app/predictor/probability_matrix.json)

---

## 🚀 Zennでの公開について

このドキュメントは、**マイクロサービスアーキテクチャ**における**段階的な機能追加**の実践例として公開されています。

### 学べるポイント
- **段階的ロールアウト**の実装方法
- **Docker Compose**でのマイクロサービス統合
- **Flask**と**Node.js**の連携
- **確率ベースの予測システム**の構築
- **包括的なテスト計画**の策定

### 技術スタック
- **フロントエンド**: React + TypeScript
- **バックエンド**: Node.js + Express.js
- **予測エンジン**: Flask (Python)
- **データベース**: PostgreSQL
- **インフラ**: Docker + Docker Compose

### 実践的な開発手法
- **機能フラグ**による段階的リリース
- **マイクロサービス**アーキテクチャ
- **コンテナ化**による環境統一
- **包括的テスト**による品質保証

このプロジェクトは、実際のプロダクト開発で使用されている手法を学ぶことができる実践的な例となっています。 
