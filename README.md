# パン屋向け原価計算Webアプリケーション

小規模から中規模のパン屋が使用する原価計算システムです。材料費から製品ごとの原価を自動計算し、適切な販売価格の設定を支援します。

## 特徴

- **材料マスタ管理**: 材料の登録・編集・削除、カテゴリー分類、単位管理
- **レシピ管理**: パンの種類ごとのレシピ登録、材料と使用量の設定
- **原価計算**: 材料費、人件費、光熱費を考慮した自動原価計算
- **価格設定支援**: 目標利益率に基づいた推奨販売価格の算出
- **レポート機能**: 製品別原価一覧、利益率ランキング、CSVエクスポート
- **サンプルデータ**: デモ用のサンプルデータ自動生成機能
- **ダークモード**: 目に優しいダークモード対応
- **レスポンシブデザイン**: スマートフォンやタブレットでも使いやすい

## 技術スタック

### フロントエンド
- React 19
- TypeScript
- Tailwind CSS
- React Router
- Vite

### バックエンド
- Node.js
- Express
- TypeScript
- SQLite (better-sqlite3)

## セットアップ

### 必要な環境
- Node.js 18以上
- npm 9以上

### インストール

1. リポジトリをクローン（またはダウンロード）
```bash
cd bakery-cost-calculator
```

2. 依存パッケージをインストール
```bash
npm install
```

## 起動方法

### 開発環境

2つのターミナルウィンドウを開いて、それぞれ以下を実行します：

**ターミナル1: バックエンドサーバー**
```bash
npm run server
```
サーバーは http://localhost:3001 で起動します。

**ターミナル2: フロントエンド開発サーバー**
```bash
npm run dev
```
アプリケーションは http://localhost:5173 または http://localhost:5174 で起動します。

### プロダクションビルド

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

## 使い方

### 初めての利用

1. アプリケーションを起動すると、ダッシュボードが表示されます
2. データがない場合は「サンプルデータを生成」ボタンをクリック
3. 以下のサンプルデータが自動生成されます：
   - 18種類の材料（小麦粉、乳製品、糖類、油脂、その他）
   - 6種類のレシピ（食パン、クロワッサン、メロンパン、ベーグル、チョコチップマフィン、レーズンパン）

### 基本的な操作フロー

#### 1. 材料の登録
1. 「材料管理」ページへ移動
2. 「+ 材料を追加」ボタンをクリック
3. 以下の情報を入力：
   - 材料名（例: 強力粉）
   - カテゴリー（小麦粉、乳製品、糖類、油脂、その他）
   - 単位（g、ml、個）
   - 仕入単価（例: 500円）
   - 仕入単位量（例: 1000g）
4. 「作成」ボタンをクリック

#### 2. レシピの作成
1. 「レシピ管理」ページへ移動
2. 「+ レシピを追加」ボタンをクリック
3. 以下の情報を入力：
   - 製品名（例: 食パン）
   - 製造個数（例: 1個）
   - 製造時間（例: 180分）
   - 使用材料と数量
4. 「作成」ボタンをクリック

#### 3. 原価計算
1. 「原価計算」ページへ移動
2. すべてのレシピの原価が自動計算されて表示されます
3. 各レシピカードをクリックすると詳細な内訳が表示されます：
   - 材料費（材料別の内訳付き）
   - 人件費
   - 光熱費等
   - 総原価
   - 1個あたりの原価
   - 推奨販売価格

#### 4. コスト設定の変更
1. 「設定」ページへ移動
2. 以下の設定を変更できます：
   - 時給（デフォルト: 1000円）
   - 1個あたりの光熱費等（デフォルト: 10円）
   - 目標利益率（デフォルト: 30%）
3. 「設定を保存」ボタンをクリック

#### 5. レポートの確認
1. 「レポート」ページへ移動
2. 以下の情報が表示されます：
   - 総レシピ数、平均単価、平均利益率
   - 最高・最低利益率の製品
   - 利益率ランキング
   - 平均コスト構成
3. 「CSVエクスポート」ボタンでデータをダウンロード可能

## データベース

アプリケーションのデータは `server/bakery.db` に保存されます（SQLite形式）。

### データのバックアップ

```bash
cp server/bakery.db server/bakery.db.backup
```

### データのリストア

```bash
cp server/bakery.db.backup server/bakery.db
```

### データのクリア

データベースファイルを削除して再起動すると、空の状態から始められます：

```bash
rm server/bakery.db
npm run server
```

## API エンドポイント

### 材料管理
- `GET /api/materials` - 全材料取得
- `GET /api/materials/:id` - 特定の材料取得
- `POST /api/materials` - 材料作成
- `PUT /api/materials/:id` - 材料更新
- `DELETE /api/materials/:id` - 材料削除

### レシピ管理
- `GET /api/recipes` - 全レシピ取得
- `GET /api/recipes/:id` - 特定のレシピ取得
- `POST /api/recipes` - レシピ作成
- `PUT /api/recipes/:id` - レシピ更新
- `DELETE /api/recipes/:id` - レシピ削除
- `POST /api/recipes/:id/copy` - レシピのコピー

### コスト管理
- `GET /api/cost/settings` - コスト設定取得
- `PUT /api/cost/settings` - コスト設定更新
- `GET /api/cost/calculate/:recipeId` - 特定レシピの原価計算
- `GET /api/cost/calculate` - 全レシピの原価計算
- `GET /api/cost/report` - レポート取得

### サンプルデータ
- `POST /api/sample-data/generate` - サンプルデータ生成
- `DELETE /api/sample-data/clear` - データクリア

## プロジェクト構造

```
bakery-cost-calculator/
├── src/                      # フロントエンドソースコード
│   ├── components/          # Reactコンポーネント
│   │   └── Layout.tsx       # レイアウトコンポーネント
│   ├── pages/               # ページコンポーネント
│   │   ├── Dashboard.tsx    # ダッシュボード
│   │   ├── Materials.tsx    # 材料管理
│   │   ├── Recipes.tsx      # レシピ管理
│   │   ├── CostCalculation.tsx  # 原価計算
│   │   ├── Reports.tsx      # レポート
│   │   └── Settings.tsx     # 設定
│   ├── services/            # APIクライアント
│   │   └── api.ts          # APIサービス
│   ├── types/               # TypeScript型定義
│   │   └── index.ts        # 型定義
│   ├── App.tsx              # メインアプリケーション
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
├── server/                   # バックエンドソースコード
│   └── src/
│       ├── routes/          # APIルート
│       │   ├── materials.ts # 材料API
│       │   ├── recipes.ts   # レシピAPI
│       │   ├── cost.ts      # コストAPI
│       │   └── sample-data.ts  # サンプルデータAPI
│       ├── database.ts      # データベース初期化
│       └── index.ts         # サーバーエントリーポイント
├── package.json             # 依存パッケージ
├── tsconfig.json            # TypeScript設定
├── vite.config.ts           # Vite設定
├── tailwind.config.js       # Tailwind CSS設定
└── README.md                # このファイル
```

## トラブルシューティング

### ポートが使用中の場合

バックエンドサーバーのポート（3001）またはフロントエンドのポート（5173/5174）が既に使用されている場合は、別のポートを使用できます：

**バックエンド:**
```bash
PORT=3002 npm run server
```

フロントエンドの場合、Viteが自動的に別のポートを探します。

### データベースエラー

データベースファイルが破損した場合：
```bash
rm server/bakery.db
npm run server
```

### 依存パッケージのエラー

```bash
rm -rf node_modules package-lock.json
npm install
```

## カスタマイズ

### デフォルト設定の変更

`server/src/database.ts` でデフォルトのコスト設定を変更できます：

```typescript
INSERT INTO cost_settings (id, labor_cost_per_hour, overhead_cost_per_unit, target_profit_margin, updated_at)
VALUES (1, 1000, 10, 30, datetime('now'))
```

### カテゴリーの追加

`src/types/index.ts` で材料カテゴリーを追加できます：

```typescript
export type MaterialCategory = '小麦粉' | '乳製品' | '糖類' | '油脂' | 'その他' | '新しいカテゴリー';
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## サポート

問題が発生した場合や機能リクエストがある場合は、GitHubのIssuesセクションで報告してください。

## 今後の拡張案

- ユーザー認証機能
- 複数店舗対応
- 在庫管理機能
- 売上分析機能
- グラフによる可視化
- 印刷用レポート
- データのインポート/エクスポート（Excel対応）
- 多言語対応
- モバイルアプリ版

## 開発者向け情報

### コードスタイル

- TypeScriptの型安全性を最大限活用
- 関数とコンポーネントにJSDocコメントを記載
- Tailwind CSSでスタイリング（インラインクラス使用）
- Reactフックを活用した関数コンポーネント

### 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずIssueで議論してください。

---

作成日: 2024年
バージョン: 1.0.0
