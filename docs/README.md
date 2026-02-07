# Tube Learn 開発ドキュメント

YouTube動画講座プラットフォームMVPの開発チケット一覧です。各チケットには詳細な実装手順とTodoリストが含まれています。

## チケット一覧

### セットアップ・基盤構築

- [01. Supabaseプロジェクトのセットアップとマイグレーション](./01-supabase-setup.md)
  - データベーステーブルの作成
  - RLSポリシーの設定
  - トリガーの設定

- [02. shadcn/uiのインストールと設定](./02-shadcn-ui-setup.md)
  - shadcn/uiの初期化
  - 必要なコンポーネントのインストール

- [03. Supabaseクライアントの設定](./03-supabase-client-setup.md)
  - Server Components用クライアント
  - Client Components用クライアント
  - Middleware用クライアント

### 認証機能

- [04. 認証機能の実装](./04-auth-implementation.md)
  - Google OAuth認証
  - ログイン/ログアウト
  - 認証状態の管理

### フロントエンド（ユーザー向け）

- [05. トップページ（講座一覧）の実装](./05-homepage.md)
  - 講座一覧表示
  - 講座カードコンポーネント
  - ヘッダーナビゲーション

- [06. 講座詳細ページの実装](./06-course-detail-page.md)
  - 講座情報表示
  - 動画リスト表示
  - アクセス制御

- [07. 動画視聴ページの実装](./07-video-watch-page.md)
  - YouTube埋め込みプレイヤー
  - 動画サイドバー
  - 動画ナビゲーション

### 管理画面

- [08. 管理画面レイアウトの実装](./08-admin-layout.md)
  - 管理画面レイアウト
  - サイドバーナビゲーション
  - 管理者権限チェック

- [09. 管理画面：講座管理の実装](./09-admin-course-management.md)
  - 講座の作成・編集・削除
  - Server Actions
  - フォームバリデーション

- [10. 管理画面：動画管理の実装](./10-admin-video-management.md)
  - 動画の追加・編集・削除
  - 講座との紐付け
  - 表示順管理

### テスト・デプロイ

- [11. テストと動作確認](./11-testing-verification.md)
  - 機能テスト
  - アクセス制御テスト
  - パフォーマンステスト

- [12. Vercelへのデプロイ](./12-deployment.md)
  - Vercelプロジェクトの作成
  - 環境変数の設定
  - 本番環境の設定

## 開発の進め方

1. チケットは基本的に上から順番に実装してください
2. 各チケットのTodoリストを確認しながら進めてください
3. Todoが完了したら`[ ]`を`[x]`に変更してください
4. 実装中に発見した問題や改善点は、該当チケットにメモを追加してください

## プロジェクト構成

```
tube-learn/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (admin)/           # 管理画面
│   ├── courses/           # 講座・動画ページ
│   ├── actions/           # Server Actions
│   └── layout.tsx         # ルートレイアウト
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/uiコンポーネント
│   ├── auth/             # 認証関連コンポーネント
│   ├── courses/          # 講座関連コンポーネント
│   ├── videos/           # 動画関連コンポーネント
│   ├── admin/            # 管理画面コンポーネント
│   └── layout/           # レイアウトコンポーネント
├── lib/                   # ユーティリティ
│   ├── supabase/         # Supabaseクライアント
│   └── utils.ts          # ヘルパー関数
├── types/                 # TypeScript型定義
│   └── database.types.ts # Supabase型定義
├── docs/                  # 開発ドキュメント（このフォルダ）
└── middleware.ts          # Next.js Middleware

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **UIライブラリ**: React 19, shadcn/ui
- **スタイリング**: Tailwind CSS v4
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth (Google OAuth)
- **ホスティング**: Vercel

## 参考リンク

- [プロジェクトガイド (CLAUDE.md)](../CLAUDE.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 注意事項

- 各チケットの実装前に、CLAUDE.mdのベストプラクティスを確認してください
- Server ComponentsとClient Componentsの使い分けに注意してください
- Supabaseクライアントは実行環境に応じて適切なものを使用してください
- セキュリティ（RLS、認証、アクセス制御）を常に意識してください
