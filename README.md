# WebAuthn デモアプリケーション

このアプリケーションは、WebAuthnを使用したパスワードレス認証のデモ実装です。Next.js、Prisma、Supabase(PostgreSQL)を使用して構築されています。

## 機能

- WebAuthnを使用したパスワードレス認証
- ユーザー登録と認証
- セキュアな認証情報の保存

## 必要条件

- Node.js 18以上
- npm 9以上
- [supabase-cli](https://supabase.com/docs/guides/cli)（ローカル開発用DBとして利用）

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

3. Supabaseローカル環境の初期化・起動：
```bash
npx supabase init
npx supabase start
```

4. データベースのセットアップ（マイグレーション適用）：
```bash
npx prisma generate
npx prisma migrate dev
```

5. SSL証明書作成：
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

6. 開発サーバーの起動：
```bash
npm run dev
```

アプリケーションは https://localhost:3001 で利用可能になります。

## 技術スタック

- **フロントエンド**: Next.js 15.3.2
- **データベース**: Supabase (PostgreSQL, Prisma ORM)
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

このアプリケーションはSupabase(PostgreSQL)データベースを使用し、Prisma ORMで管理されています。主なテーブルは以下の通りです：

- `challenges`: WebAuthn登録時のチャレンジを保存
- `authenticators`: ユーザーの認証情報を保存

### データベースの閲覧方法

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

`.env.local`ファイルにSupabase(PostgreSQL)の接続情報を記載してください。

例：
```
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
```

（ポート番号やユーザー名・DB名はsupabase-cliの設定に合わせてください）

## 注意事項

- このアプリケーションはデモ用であり、本番環境での使用は推奨されません
- セキュリティ設定は最小限に抑えられています
- データベースはローカルのSupabase(PostgreSQL)に保存され、バックアップは行われません

## ライセンス

MIT
