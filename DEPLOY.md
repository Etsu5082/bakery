# デプロイ手順書

このドキュメントでは、パン屋原価計算システムを本番環境にデプロイする手順を説明します。

## デプロイ構成

- **バックエンドAPI**: Render.com（無料プラン）
- **フロントエンド**: お名前.com RSプラン（レンタルサーバー）

## 前提条件

- GitHubアカウント
- Render.comアカウント（無料で作成可能）
- お名前.comのRSプランレンタルサーバー
- FTPクライアント（FileZillaなど）

---

## ステップ1: GitHubリポジトリの作成

### 1.1 Gitリポジトリの初期化

```bash
cd bakery-cost-calculator
git init
git add .
git commit -m "Initial commit"
```

### 1.2 GitHubにリポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 「New repository」をクリック
3. リポジトリ名: `bakery-cost-calculator`
4. Public または Private を選択
5. 「Create repository」をクリック

### 1.3 リモートリポジトリに接続

```bash
git remote add origin https://github.com/あなたのユーザー名/bakery-cost-calculator.git
git branch -M main
git push -u origin main
```

---

## ステップ2: Render.comにバックエンドをデプロイ

### 2.1 Render.comにログイン

1. [Render.com](https://render.com)にアクセス
2. 「Get Started for Free」でアカウント作成（GitHubアカウントで連携可能）

### 2.2 新しいWeb Serviceを作成

1. ダッシュボードで「New +」→「Web Service」をクリック
2. 「Connect a repository」でGitHubリポジトリを選択
3. 以下の設定を入力：

**基本設定:**
- **Name**: `bakery-cost-calculator-api`
- **Region**: `Oregon (US West)` または `Singapore (Asia)`
- **Branch**: `main`
- **Root Directory**: （空欄のまま）

**ビルド設定:**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm run server`

**料金プラン:**
- **Instance Type**: `Free`（無料プラン）

### 2.3 環境変数の設定

「Environment」セクションで以下の環境変数を追加：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `FRONTEND_URL` | `https://あなたのドメイン.com`（後で更新） |

### 2.4 デプロイ

「Create Web Service」をクリックして、デプロイを開始します。

デプロイが完了すると、以下のようなURLが発行されます：
```
https://bakery-cost-calculator-api.onrender.com
```

**このURLを控えておいてください**（フロントエンドで使用します）

### 2.5 動作確認

ブラウザで以下のURLにアクセスして、APIが動作しているか確認：
```
https://bakery-cost-calculator-api.onrender.com/api/health
```

以下のようなレスポンスが返ってくればOK：
```json
{
  "status": "ok",
  "message": "Bakery Cost Calculator API is running"
}
```

---

## ステップ3: フロントエンドのビルド

### 3.1 環境変数ファイルの作成

プロジェクトルートに `.env.production` ファイルを作成：

```bash
# .env.production
VITE_API_URL=https://bakery-cost-calculator-api.onrender.com/api
```

**注意**: `bakery-cost-calculator-api` の部分は、Render.comで発行された実際のURLに置き換えてください。

### 3.2 本番用ビルドの実行

```bash
npm run build
```

ビルドが完了すると、`dist` ディレクトリに本番用ファイルが生成されます。

### 3.3 ビルドの確認

`dist` ディレクトリの内容を確認：

```bash
ls -la dist/
```

以下のようなファイルが生成されているはずです：
- `index.html`
- `assets/` ディレクトリ（CSS、JSファイル）
- その他の静的ファイル

---

## ステップ4: お名前.comにフロントエンドをデプロイ

### 4.1 FTP接続情報の確認

お名前.comのコントロールパネルから、以下の情報を確認：

- FTPホスト名: `ftp.あなたのドメイン.com`
- FTPユーザー名: （コントロールパネルで確認）
- FTPパスワード: （コントロールパネルで確認）

### 4.2 FTPクライアントの設定（FileZilla使用例）

1. FileZillaを起動
2. 「ファイル」→「サイトマネージャー」
3. 「新しいサイト」をクリック
4. 以下の情報を入力：
   - **ホスト**: `ftp.あなたのドメイン.com`
   - **ポート**: `21`
   - **プロトコル**: `FTP - ファイル転送プロトコル`
   - **暗号化**: `明示的なFTP over TLSが必要`（利用可能な場合）
   - **ログオンタイプ**: `通常`
   - **ユーザー**: FTPユーザー名
   - **パスワード**: FTPパスワード
5. 「接続」をクリック

### 4.3 ファイルのアップロード

1. リモートサイトで、公開ディレクトリに移動（通常は `/public_html/` または `/www/`）
2. ローカルサイトで、`dist` ディレクトリを開く
3. `dist` ディレクトリ内の**すべてのファイルとフォルダ**を選択
4. 右クリック→「アップロード」

**重要**: `dist` ディレクトリ自体ではなく、**その中身**をアップロードしてください。

アップロード完了後、公開ディレクトリの構造は以下のようになります：
```
/public_html/
  ├── index.html
  ├── assets/
  │   ├── index-xxxxx.js
  │   ├── index-xxxxx.css
  │   └── ...
  └── vite.svg
```

### 4.4 .htaccessの設定（React Router対応）

お名前.comの公開ディレクトリに `.htaccess` ファイルを作成（またはテキストエディタで作成してアップロード）：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# MIME types
AddType application/javascript .js
AddType text/css .css

# Cache control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>
```

---

## ステップ5: 動作確認

### 5.1 フロントエンドの確認

ブラウザで以下のURLにアクセス：
```
https://あなたのドメイン.com
```

ダッシュボードが表示されればOKです。

### 5.2 API接続の確認

1. ダッシュボードで「サンプルデータを生成」ボタンをクリック
2. サンプルデータが生成されることを確認
3. 「材料管理」「レシピ管理」など、各ページを確認

### 5.3 エラーが発生した場合

**症状1: 「Failed to fetch」エラー**
- 原因: CORS設定またはAPI URLが間違っている
- 対処:
  1. `.env.production` のAPI URLが正しいか確認
  2. Render.comの環境変数 `FRONTEND_URL` が正しいか確認
  3. 再ビルド＆再アップロード

**症状2: ページ遷移時に404エラー**
- 原因: `.htaccess` が正しく設定されていない
- 対処: `.htaccess` ファイルをアップロードし直す

**症状3: APIが応答しない**
- 原因: Render.comの無料プランはアイドル状態でスリープする
- 対処: 初回アクセス時は起動に30秒〜1分かかることがあります。少し待ってからリロード

---

## ステップ6: Render.comの環境変数を更新

Render.comのダッシュボードに戻り、環境変数を更新：

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://あなたのドメイン.com` |

変更を保存すると、自動的に再デプロイされます。

---

## 運用上の注意点

### Render.com無料プランの制限

- **スリープ**: 15分間リクエストがないとスリープ状態になります
- **起動時間**: スリープからの復帰に30秒〜1分かかります
- **月間稼働時間**: 750時間/月（31日でも約744時間なので、ほぼ常時稼働可能）
- **データベース**: SQLiteファイルは再起動時にリセットされる可能性があります

### データの永続化について

Render.comの無料プランでは、ファイルシステムが永続化されません。以下の対応が推奨されます：

1. **PostgreSQLを使用**（Render.comの無料PostgreSQLプランを利用）
2. **定期的にエクスポート機能を使用してバックアップ**
3. **有料プランにアップグレード**（月$7〜、ディスク永続化）

---

## 更新手順

### フロントエンドの更新

1. コードを修正
2. 再ビルド: `npm run build`
3. `dist` ディレクトリの内容をFTPでアップロード

### バックエンドの更新

1. コードを修正
2. Gitにコミット＆プッシュ:
   ```bash
   git add .
   git commit -m "Update: xxxxx"
   git push origin main
   ```
3. Render.comが自動的にデプロイ

---

## トラブルシューティング

### ビルドエラー

```bash
# node_modulesをクリーンアップして再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Render.comのログ確認

1. Render.comのダッシュボード
2. Web Serviceを選択
3. 「Logs」タブでエラーログを確認

### お名前.comのエラーログ

コントロールパネルからエラーログを確認できます。

---

## セキュリティ対策

### 本番環境での推奨設定

1. **HTTPS必須**: お名前.comでSSL証明書を設定
2. **環境変数の保護**: `.env.production` をGitにコミットしない
3. **CORS設定の厳格化**: 本番環境のドメインのみ許可
4. **レート制限**: 必要に応じてAPI側でレート制限を実装

---

## サポート

問題が発生した場合は、以下を確認してください：

1. Render.comのステータスページ
2. お名前.comのサーバーステータス
3. ブラウザの開発者ツール（Console、Network）
4. GitHubのIssues

---

## 参考リンク

- [Render.com ドキュメント](https://render.com/docs)
- [お名前.com サポート](https://www.onamae.com/support/)
- [Vite デプロイガイド](https://vitejs.dev/guide/static-deploy.html)

---

作成日: 2024年
バージョン: 1.0.0
