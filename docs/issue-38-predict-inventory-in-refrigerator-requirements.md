### 最適化された要件一覧（Issue #38 準拠）
- **目的**
  - レギュラーメンバー一覧に「冷蔵庫にある確率（在庫確率）」を表示して買い物判断を支援する。[Issue #38](https://github.com/atsushimemet/regular-member/issues/38)

- **データモデル（DB）**
  - 既存テーブル: `couples`, `regular_items`
  - 追加テーブル: `last_purchases`
    - カラム: `id (PK)`, `couple_id (FK)`, `item_id (FK)`, `last_purchased_at (TIMESTAMP)`
    - 制約: `(couple_id, item_id)` UNIQUE、外部キーは `ON DELETE CASCADE`
  - 不足DDLの補完: `share_links`（既存ルートで参照済みのためDDL追記）
  - 書き込み仕様:
    - 「購入した」瞬間＝アイテムのチェックボックスをオンにした時刻を購入時刻として `last_purchases` に登録（デフォルトは現在時刻）
    - 「ない」ボタンは在庫判断（UI状態）であり、DBには書かない

- **予測サービス（Flask, 内部）**
  - エンドポイント: `POST /predict`
  - 入力: `[{ itemId, categoryId, lastPurchasedAt }]` と任意の `asOf`
  - 予測: カテゴリごとの「経過日数×確率」マトリクス(JSON)で算出
  - 出力: `[{ itemId, probability }]` のみ（bucketは内部利用でレスポンス不要）
  - カテゴリ例: `dairy=乳製品`, `frozen=冷凍食品`（`src/types.ts` 準拠）

- **API（Node, 既存APIの拡張）**
  - 取得: `GET /api/items/predictions`（認証必須）
    - `regular_items` と `last_purchases` を LEFT JOIN し、`{ itemId, categoryId, lastPurchasedAt }` を作成
    - Flask `/predict` へ一括プロキシ、`[{ itemId, probability }]` を返却
    - `lastPurchasedAt` 未登録時は `created_at` 代替または未定義扱い（設計方針に合わせて統一）
    - Flask不達時は 502 を返す
  - 更新: `POST /api/items/:itemId/last-purchase`
    - Body: `{ purchasedAt?: ISO8601 }`（未指定なら現在時刻）
    - 動作: `(couple_id, item_id)` UPSERT
    - 用意する理由: 正確な購入瞬間の保存、UI非依存の更新経路、将来の補正・外部連携・監査に有用、予測の安定性向上、責務分離

- **フロントエンド（UI/UX）**
  - 取得フロー: アイテム一覧取得後に予測を一括取得し、`itemId -> probability` をマップで保持
  - 表示位置: 各アイテムの「削除」ボタン直下に「在庫確率: 72%」のように表示
  - 色分け（任意）: 例) 0.7以上=緑、0.4–0.69=黄、0.4未満=赤
  - 購入記録: チェックボックスをオンにしたタイミングで `POST /api/items/:itemId/last-purchase` を呼び出し
  - 共有ビュー（認証不要の `/shared/:shareId`）は範囲外（今回は未対応）

- **セキュリティ/構成**
  - 認証: JWT（Nodeで検証、`coupleId` 解決）
  - Flaskは内部ネットワークのみ公開、外部に露出しない
  - CORSはフロント→Nodeのみ許可

- **運用/可観測性**
  - ログ: リクエスト数・レイテンシ・エラー（Node/Flask）
  - パフォーマンス: N件を1リクエストで一括予測

- **ロールアウト（段階導入）**
  - DB拡張（DDL追加）
  - Flask サービス追加（内部）
  - Nodeに `GET /api/items/predictions` 追加
  - フロントは feature flag の背後で確率表示を実装し、安定確認後にON（問題時は即OFFで切り戻し）

- **Docker/実行環境**
  - すべてDockerコンテナで実行し、Compose管理に統一
  - コマンドは `docker compose` 形式を使用 [[memory:3719911]]
  - プロジェクトのコマンド/ビルド/実行は原則Docker内で実施 [[memory:3719948]] [[memory:3719922]]

- **非機能要件（テスト）**
  - Flask: 経過日数の境界値テスト、カテゴリ未定義時のフォールバック
  - Node: JOIN→Flask→レスポンスのE2E、異常系（Flaskダウン）での502
  - Frontend: 表示・色分け・チェック時のAPI呼び出し

- **非対象（スコープ外）**
  - 共有ビューでの確率表示
  - 機械学習モデル導入（今回はルックアップ方式）

- **用語**
  - bucket: 経過日数の区間ラベル（レスポンスには含めない）
  - dairy/frozen: それぞれ「乳製品」「冷凍食品」
