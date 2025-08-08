### ロールアウト計画（Issue #38 対応）

- **ゴール**
  - レギュラーアイテム一覧に「在庫確率」を安全に段階導入。障害時は即時無効化できる仕組みで進める。[Issue #38](https://github.com/atsushimemet/regular-member/issues/38)

### フェーズ0：準備（環境/フラグ/観測）
- 環境変数（Backend）
  - `PREDICTOR_URL=http://predictor:5000`
  - `PREDICTIONS_ENABLED=false`（初期はOFF）
  - 任意: `PREDICTIONS_COUPLE_ALLOWLIST=cid1,cid2`（段階公開用）
- 環境変数（Frontend）
  - `REACT_APP_SHOW_PREDICTIONS=false`（初期はOFF）
- 監視
  - Node: 予測プロキシのレイテンシ/エラー率をログ出力
  - Flask: 予測呼び出し数/カテゴリ分布/レイテンシをログ出力
- 実行はDocker内で統一（DB操作も含む）[[memory:3719956]] [[memory:3719948]] [[memory:3719922]]。Dockerコマンドは `docker compose` を使用 [[memory:3719911]]。

### フェーズ1：DB拡張（安全な前方互換マイグレーション）
- 追加テーブル
  - `last_purchases (id, couple_id, item_id, last_purchased_at, UNIQUE(couple_id, item_id))`
  - （不足していれば）`share_links (share_id, couple_id)`
- 実行
  - `server/scripts/setup-db.js` にDDLを追記し、コンテナ内で実行
  - コマンド例
    ```bash
    docker compose -f regular-shopping-app/docker-compose.yml up -d db
    docker compose -f regular-shopping-app/docker-compose.yml up -d api
    docker compose -f regular-shopping-app/docker-compose.yml exec api node server/scripts/setup-db.js
    ```
- 検証
  - テーブル存在確認、既存機能影響なし（ゼロダウン）

### フェーズ2：Flask予測サービスの導入（内部のみ）
- 新規サービス `predictor` を追加（内部ネットワーク限定公開）
- `probability_matrix.json` にカテゴリ×経過日数の確率マスタを配置
- ビルド/起動
  ```bash
  docker compose -f regular-shopping-app/docker-compose.yml up -d --build predictor
  ```
- 健全性
  - `/predict` にサンプルPOSTで200返却、レイテンシ<100ms（N件=10目安）

### フェーズ3：Backend（Node）拡張＋シャドーモード
- 追加エンドポイント
  - `GET /api/items/predictions`（認証必須、Flaskへ一括プロキシ）
  - `POST /api/items/:itemId/last-purchase`（チェックON時の購入記録、UPSERT）
- シャドー実行
  - `PREDICTIONS_ENABLED=false` のまま本番展開
  - 内部でのみ叩いてメトリクス確認、エラー率<1%を目安
- デプロイ
  ```bash
  docker compose -f regular-shopping-app/docker-compose.yml up -d --build api
  ```

### フェーズ4：Frontend 実装（フラグ裏で無害化）
- UI: 削除ボタン直下に「在庫確率: 72%」を表示する実装を追加
- 初期は `REACT_APP_SHOW_PREDICTIONS=false`（表示OFF）
- スモークテスト（ローカル/ステージング）

### フェーズ5：カナリア公開（限定ON）
- 有効化
  - Backend: `PREDICTIONS_ENABLED=true`
  - Frontend: `REACT_APP_SHOW_PREDICTIONS=true`
  - かつ `PREDICTIONS_COUPLE_ALLOWLIST` に対象 `coupleId` を限定
- 監視（24–48h）
  - Node→FlaskレイテンシP95、エラー率、API 5xx、UIの読み込み遅延
  - 目安: P95 < 300ms（100件時）、エラー率 < 1%

### フェーズ6：段階拡大→全量ON
- Allowlistを徐々に拡大→空（=全量）
- しきい値到達や異常時は即ロールバック（下記）

### フェーズ7：運用定着・改善
- `probability_matrix.json` の調整（実績から補正）
- ログからカテゴリ別の適合度を計測、閾値/色分けのUX調整
- 必要に応じて「購入日時の手動補正」UIを検討

### ロールバック手順（即時）
- フロント非表示
  ```bash
  # 環境変数を更新し再デプロイ
  REACT_APP_SHOW_PREDICTIONS=false
  docker compose -f regular-shopping-app/docker-compose.yml up -d --build frontend
  ```
- Backend無効化
  ```bash
  PREDICTIONS_ENABLED=false
  docker compose -f regular-shopping-app/docker-compose.yml up -d --build api
  ```
- 予測サービス停止（必要時）
  ```bash
  docker compose -f regular-shopping-app/docker-compose.yml stop predictor
  ```

### 受け入れ基準
- UIに在庫確率が表示される（3カテゴリ以上で目視確認）
- チェックONで `last_purchases` に記録される（DB確認）
- `GET /api/items/predictions` が200、N=100でP95<300ms、エラー率<1%
- 予測未登録/未購入のアイテムでもUIが破綻しない（フォールバック表示）
- ロールバック手順で即非表示/無効化できる

- 要件参照: [Issue #38](https://github.com/atsushimemet/regular-member/issues/38)
