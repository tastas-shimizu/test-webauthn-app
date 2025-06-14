# WebAuthn デモアプリケーション

このアプリケーションは、WebAuthnを使用したパスワードレス認証のデモ実装です。Next.js、Prisma、SQLiteを使用して構築されています。

## 機能

- WebAuthnを使用したパスワードレス認証
- ユーザー登録と認証
- セキュアな認証情報の保存

## 必要条件

- Node.js 18以上
- npm 9以上

## セットアップ

1. リポジトリをクローン：
```bash
git clone <repository-url>
cd test-webauthn-app
```

2. 依存関係のインストール：
```bash
npm install
```

3. データベースのセットアップ：
```bash
npx prisma generate
npx prisma migrate dev
```

4. SSL証明書作成：
    #### macOS
    ```bash
    brew install mkcert
    mkcert -install
    mkcert localhost
    ```
   #### WSL
    ```bash
    openssl req -x509 -newkey rsa:2048 -nodes -keyout localhost-key.pem -out localhost.pem -days 365 -subj "/CN=localhost"
    ```

5. 開発サーバーの起動：
```bash
npm run dev
```

アプリケーションは https://localhost:3001 で利用可能になります。

## 技術スタック

- **フロントエンド**: Next.js 15.3.2
- **データベース**: SQLite (Prisma ORM)
- **認証**: WebAuthn (@simplewebauthn/server)

## プロジェクト構造

```
.
├── prisma/              # Prismaスキーマとマイグレーション
├── src/
│   ├── app/            # Next.jsアプリケーションコード
│   │   ├── api/        # APIルート
│   │   └── page.tsx    # メインページ
│   └── lib/            # ユーティリティ関数
└── public/             # 静的ファイル
```

## データベース

このアプリケーションはSQLiteデータベースを使用し、Prisma ORMで管理されています。主なテーブルは以下の通りです：

- `challenges`: WebAuthn登録時のチャレンジを保存
- `authenticators`: ユーザーの認証情報を保存

### データベースの閲覧方法

#### SQLiteコマンドラインツールを使用する場合

1. テーブル一覧の確認：
```bash
sqlite3 prisma/dev.db ".tables"
```

2. テーブルの内容確認（見やすい形式）：
```bash
sqlite3 prisma/dev.db ".mode column" ".headers on" "SELECT id, username, credentialId, deviceType, deviceName, datetime(createdAt/1000, 'unixepoch') as createdAt, datetime(lastUsedAt/1000, 'unixepoch') as lastUsedAt FROM authenticators;"
```

3. スキーマの確認：
```bash
sqlite3 prisma/dev.db ".schema テーブル名"
```

#### Prisma Studioを使用する場合

以下のコマンドでブラウザベースのGUIツールを起動できます：
```bash
npx prisma studio
```

## 開発

### データベースの変更

データベーススキーマを変更する場合は、以下の手順に従ってください：

1. `prisma/schema.prisma`を編集
2. マイグレーションを生成：
```bash
npx prisma migrate dev --name <migration-name>
```

### 環境変数

現在、特別な環境変数は必要ありません。データベースは`prisma/dev.db`に保存されます。

## 注意事項

- このアプリケーションはデモ用であり、本番環境での使用は推奨されません
- セキュリティ設定は最小限に抑えられています
- データベースはローカルに保存され、バックアップは行われません

## ライセンス

MIT
