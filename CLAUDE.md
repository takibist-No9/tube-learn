# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

YouTube動画を活用したUdemy風の講座プラットフォームのMVPです。プログラミング学習者向けに、YouTubeのおすすめ動画を講座形式で提供します。

### 対象ユーザー

- ジャンル: プログラミング
- レベル: 初心者から中級者のエンジニア

### コンテンツ仕様

- 動画形式: YouTube埋め込み
- 総動画数: 約30本
- 1講座につき1〜複数の動画
- アクセス制御: 一部講座は無料公開、それ以外は会員登録必須

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **UIライブラリ**: React 19, shadcn/ui
- **スタイリング**: Tailwind CSS v4
- **データベース**: Supabase
- **認証**: Supabase Auth (Google認証のみ)
- **ホスティング**: Vercel

## 開発コマンド

```bash
# 開発サーバー起動 (http://localhost:3000)
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# Linter実行
npm run lint
# 特定ファイルに対して:
npx eslint path/to/file.ts
```

## タスク管理とドキュメント更新

### 重要：タスク完了時のチェックリスト更新

`docs/`ディレクトリ内の各ドキュメントには「## Todo」セクションがあり、実装タスクのチェックリストが記載されています。

**ルール：タスクを完了したら、必ず対応するドキュメントのチェックリストを更新すること**

```markdown
# 実装前
- [ ] コンポーネントを作成
- [ ] テストを実装

# 実装後
- [x] コンポーネントを作成
- [x] テストを実装
```

**手順：**
1. `docs/XX-feature-name.md`のドキュメントに従ってタスクを実装
2. タスク完了後、同じドキュメントの「## Todo」セクションを更新
3. 完了したタスクのチェックボックスを`[ ]`から`[x]`に変更

**例：**
```bash
# ドキュメント06の実装完了後
docs/06-course-detail-page.md の Todo セクションを全て [x] に更新
```

これにより、プロジェクトの進捗状況が常に明確に把握できます。

## アーキテクチャ

### ディレクトリ構成

- `app/` - Next.js App Routerのルーティングディレクトリ
  - `layout.tsx` - ルートレイアウト（Geist Sans & Geist Monoフォント設定）
  - `page.tsx` - トップページ
  - `globals.css` - グローバルスタイル（Tailwindインポート、CSS変数定義）
  - `(auth)/` - 認証関連ページ
  - `(admin)/` - 管理画面
  - `courses/` - 講座関連ページ

### TypeScript設定

- パスエイリアス `@/*` をルートディレクトリにマッピング（`@/app/...`, `@/components/...`等）
- Strictモード有効
- Target: ES2017
- Module resolution: bundler

### スタイリング

- **Tailwind CSS v4**（`@tailwindcss/postcss`使用）
- CSS変数によるテーマ管理（`app/globals.css`で定義）
- `prefers-color-scheme`によるダークモード対応
- `@theme inline`ディレクティブでカスタムテーマトークン定義
- フォントファミリーはCSS変数で設定: `--font-geist-sans`と`--font-geist-mono`

### ESLint設定

- フラット設定形式（`eslint.config.mjs`）
- Next.js core web vitalsとTypeScriptルール適用
- グローバルignore: `.next/`, `out/`, `build/`, `next-env.d.ts`

## データベース設計

### テーブル構成

#### profiles テーブル

ユーザー情報（Supabase Authと連携）

- `id` (uuid, PK): ユーザーID（auth.usersへの参照）
- `avatar_url` (text, nullable): アバター画像URL
- `is_admin` (boolean): 管理者フラグ
- `created_at`, `updated_at` (timestamp): タイムスタンプ

#### courses テーブル

講座情報

- `id` (uuid, PK): 講座ID
- `title` (text): 講座タイトル
- `description` (text): 講座説明
- `thumbnail_url` (text): サムネイル画像URL
- `difficulty` (text): 難易度（beginner/intermediate/advanced）
- `is_free` (boolean): 無料公開フラグ
- `instructor_id` (uuid, FK): 講師ID（profiles.id参照）
- `created_at`, `updated_at` (timestamp): タイムスタンプ

#### videos テーブル

動画情報

- `id` (uuid, PK): 動画ID
- `course_id` (uuid, FK): 講座ID（courses.id参照、CASCADE削除）
- `title` (text): 動画タイトル
- `youtube_url` (text): YouTube URL
- `order` (integer): 表示順
- `created_at`, `updated_at` (timestamp): タイムスタンプ

### Row Level Security (RLS) ポリシー

- **profiles**
  - SELECT: 全員が読み取り可能
  - UPDATE: 本人のみ更新可能

- **courses**
  - SELECT: 全員が読み取り可能
  - INSERT/UPDATE/DELETE: 管理者（is_admin=true）のみ可能

- **videos**
  - SELECT: 全員が読み取り可能
  - INSERT/UPDATE/DELETE: 管理者のみ可能

## 主要機能

### フロントエンド（ユーザー向け）

#### 1. トップページ

- 講座一覧表示（サムネイル、タイトル、難易度）

#### 2. 講座詳細ページ

- 講座情報（タイトル、説明、サムネイル、難易度）
- 講座に含まれる動画リスト

#### 3. 動画視聴ページ

- YouTube埋め込みプレイヤー
- 動画タイトル表示
- 同じ講座内の他の動画リスト

#### 4. 認証ページ

- Google認証のみ（Supabase Auth使用）

#### 5. アクセス制御

- **未ログイン**: `is_free=true`の講座のみ閲覧可能
- **ログイン済み**: すべての講座が閲覧可能

### 管理画面

#### 1. 講座管理

- 講座一覧、作成、編集、削除
- 入力項目: タイトル、説明文、サムネイルURL、難易度、無料公開フラグ

#### 2. 動画管理

- 講座に紐づく動画一覧、追加、編集、削除
- 入力項目: タイトル、YouTube URL、表示順(order)

## 認証とアクセス制御

### Supabase Auth統合

- Google OAuth認証のみ
- 初回ログイン時に`profiles`テーブルにユーザー情報を自動作成
- 管理者フラグ（`is_admin`）による権限管理

### Supabaseクライアントの作成（重要）

Next.jsアプリケーションでは、実行環境に応じて**異なるSupabaseクライアント**を使用する必要があります。

#### 必須パッケージ

```bash
npm install @supabase/supabase-js @supabase/ssr
```

#### クライアントの種類と使い分け

**1. Server Components用クライアント** (`lib/supabase/server.ts`)

- サーバーサイドでのみ実行
- Cookieを読み取り専用で使用
- 認証状態の確認に使用

```tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Componentからのset呼び出しは無視
          }
        },
      },
    },
  );
}
```

**2. Client Components用クライアント** (`lib/supabase/client.ts`)

- ブラウザで実行
- リアルタイム機能やクライアントサイドの操作に使用

```tsx
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

**3. Server Actions用** (`lib/supabase/server.ts`と同じ)

- Server ComponentsとServer Actionsで同じサーバークライアントを使用
- データの変更（INSERT/UPDATE/DELETE）に使用

**4. Route Handlers用** (`lib/supabase/route-handler.ts`)

- API RouteでCookieの読み書きが必要な場合

```tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function createClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, supabaseResponse };
}
```

**5. Middleware用** (`lib/supabase/middleware.ts`)

- ルートへのアクセス前に認証チェックを行う場合

```tsx
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // トークンの更新とJWT検証
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return supabaseResponse;
}
```

#### 重要な注意事項

**🚨 絶対にやってはいけないこと:**

```tsx
// ❌ サーバーコードで getSession() を使用してはいけない
const {
  data: { session },
} = await supabase.auth.getSession();
```

**✅ 正しい方法:**

```tsx
// ✅ サーバーコードでは getUser() を使用（JWT署名を検証）
const {
  data: { user },
} = await supabase.auth.getUser();
```

**理由:**

- `getSession()`はJWT署名を検証せず、Cookieの値をそのまま信頼する
- サーバーコードでは必ず`getUser()`を使用してJWTを検証する必要がある
- `getUser()`は内部で`getClaims()`を呼び出し、トークンの署名を検証する

#### Server Componentsの制約

- Next.js Server ComponentsはCookieに**書き込めない**
- トークン更新時は`@supabase/ssr`が自動的にプロキシを通じて処理
- `setAll()`内の`try/catch`でServer Componentからのset呼び出しを無視

### アクセス制御の実装方針

- サーバーコンポーネントで認証状態を確認
- `is_free=false`の講座は認証必須
- 管理画面は`is_admin=true`のユーザーのみアクセス可能

### 認証フローの実装例

#### Server Componentでの認証確認

```tsx
// app/courses/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function CoursePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // 認証状態の確認
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 講座情報の取得
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single();

  // アクセス制御
  if (!course.is_free && !user) {
    redirect('/login');
  }

  return <CourseDetail course={course} />;
}
```

#### Middlewareでの認証チェック

```tsx
// middleware.ts
import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

## デザイン方針

- Udemyのようなモダンでクリーンなデザイン
- レスポンシブ対応（モバイル、タブレット、デスクトップ）
- shadcn/uiコンポーネントを活用
- ダークモード対応

## Next.js App Router ベストプラクティス

### サーバーコンポーネントとクライアントコンポーネントの使い分け

#### デフォルトはサーバーコンポーネント

- **原則**: すべてのコンポーネントはデフォルトでサーバーコンポーネントとして作成
- クライアントコンポーネントは必要な場合のみ`'use client'`ディレクティブを使用

#### クライアントコンポーネントが必要な場合

- `useState`, `useEffect`などのReact Hooksを使用する場合
- ブラウザAPIを使用する場合（`window`, `localStorage`等）
- イベントハンドラー（`onClick`, `onChange`等）を使用する場合
- カスタムフック（`use`で始まるフック）を使用する場合

#### クライアントコンポーネントの配置ルール

- クライアントコンポーネントはできるだけツリーの下層（リーフノード）に配置
- 大きなコンポーネントをクライアント化せず、インタラクティブな部分のみを小さなクライアントコンポーネントに分離

**良い例:**

```tsx
// app/courses/[id]/page.tsx (Server Component)
import { CoursePlayer } from '@/components/course-player';

export default async function CoursePage({
  params,
}: {
  params: { id: string };
}) {
  const course = await getCourse(params.id); // サーバーでデータ取得
  return <CoursePlayer course={course} />; // クライアントコンポーネントにprops渡し
}

// components/course-player.tsx (Client Component)
('use client');
import { useState } from 'react';

export function CoursePlayer({ course }) {
  const [isPlaying, setIsPlaying] = useState(false);
  // インタラクティブなロジック
}
```

### データフェッチング

#### サーバーコンポーネントでのデータ取得

- `async/await`を直接使用してサーバーコンポーネント内でデータ取得
- Supabaseクライアントはサーバー専用のインスタンスを使用

```tsx
// app/courses/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase.from('courses').select('*');

  return <CourseList courses={courses} />;
}
```

#### データキャッシングとRevalidation

- デフォルトで`fetch()`は自動的にキャッシュされる
- 動的データには`{ cache: 'no-store' }`または`{ next: { revalidate: 0 } }`を使用
- 静的データには`{ next: { revalidate: 3600 } }`等でISRを活用

#### Server Actionsの使用

- フォーム送信やデータ変更には Server Actions を使用
- ファイル名: `actions.ts`または`actions/`ディレクトリ
- 必ず`'use server'`ディレクティブを使用

```tsx
// app/admin/courses/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCourse(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('courses').insert({
    title: formData.get('title'),
    description: formData.get('description'),
    // ...
  });

  if (error) throw error;

  revalidatePath('/admin/courses');
  return data;
}
```

### ファイルとフォルダの命名規約

#### 特殊ファイル

- `page.tsx` - ルートのUIを定義
- `layout.tsx` - 共通レイアウト（ネストされたルート間で共有）
- `loading.tsx` - ローディングUI（Suspense境界を自動作成）
- `error.tsx` - エラーUI（Error Boundaryを自動作成）
- `not-found.tsx` - 404ページ
- `route.ts` - APIエンドポイント（App Router形式）

#### ルートグループ

- `(グループ名)/` - URLに影響せずにルートを整理
- 例: `(auth)/login`, `(admin)/dashboard` 等

#### プライベートフォルダ

- `_フォルダ名/` - ルーティング対象外（内部コンポーネントや utilities）

### メタデータとSEO

#### 静的メタデータ

```tsx
// app/courses/[id]/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '講座詳細',
  description: 'プログラミング講座の詳細ページ',
};
```

#### 動的メタデータ

```tsx
// app/courses/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const course = await getCourse(params.id);

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: [course.thumbnail_url],
    },
  };
}
```

### エラーハンドリングとローディング状態

#### error.tsx の配置

- エラーが発生する可能性のあるルートセグメントに配置
- 必ずクライアントコンポーネント（`'use client'`が必要）

```tsx
// app/courses/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={() => reset()}>再試行</button>
    </div>
  );
}
```

#### loading.tsx の活用

- データ取得中のローディング状態を自動的に表示
- Suspense境界を自動的に作成

```tsx
// app/courses/loading.tsx
export default function Loading() {
  return <div>読み込み中...</div>;
}
```

### パフォーマンス最適化

#### 画像最適化

- `next/image`コンポーネントを使用
- `priority`プロパティをLCP画像に設定
- 適切な`width`と`height`を指定

```tsx
import Image from 'next/image';

<Image
  src={course.thumbnail_url}
  alt={course.title}
  width={800}
  height={450}
  priority={isMainImage}
/>;
```

#### フォント最適化

- `next/font`を使用してフォントを最適化
- `layout.tsx`でフォント定義を一元管理

#### Dynamic Imports

- クライアントコンポーネントの遅延読み込みに使用
- 初期バンドルサイズを削減

```tsx
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/video-player'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // クライアントサイドのみで実行
});
```

### 静的レンダリングと動的レンダリング

#### 静的レンダリング（デフォルト）

- ビルド時にレンダリング
- 講座一覧ページなど、頻繁に変更されないページに適用

#### 動的レンダリング

- リクエスト時にレンダリング
- 以下の場合に自動的に動的レンダリングに切り替わる:
  - `cookies()`, `headers()`の使用
  - 認証状態の確認（Supabase Auth）
  - `searchParams`の使用

#### generateStaticParams の活用

- 動的ルートの静的生成に使用

```tsx
// app/courses/[id]/page.tsx
export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course) => ({ id: course.id }));
}
```

### コンポーネント構成のベストプラクティス

#### ディレクトリ構成

```
app/
├── (auth)/          # 認証関連ルート
│   ├── login/
│   └── layout.tsx
├── (admin)/         # 管理画面ルート
│   ├── courses/
│   └── layout.tsx
├── courses/         # 公開ページ
│   ├── [id]/
│   └── page.tsx
└── layout.tsx

components/          # 共有コンポーネント
├── ui/             # shadcn/ui コンポーネント
├── course-card.tsx # ドメインコンポーネント
└── ...

lib/                # ユーティリティ
├── supabase/
│   ├── client.ts   # クライアント用
│   └── server.ts   # サーバー用
└── utils.ts
```

#### Server と Client の分離

- `lib/supabase/server.ts` - サーバーコンポーネント用（cookieベース）
- `lib/supabase/client.ts` - クライアントコンポーネント用

### 型安全性

#### Supabase型定義の生成

```bash
# Supabaseから型定義を生成
npx supabase gen types typescript --project-id your-project-id > types/database.types.ts
```

#### 型の活用

```tsx
import type { Database } from '@/types/database.types';

type Course = Database['public']['Tables']['courses']['Row'];
type CourseInsert = Database['public']['Tables']['courses']['Insert'];
```

## 開発の進め方

1. Supabaseのセットアップとマイグレーション
2. shadcn/uiのインストールと設定
3. 認証機能の実装（Supabase Auth）
4. フロントエンドの実装（ユーザー向けページ）
5. 管理画面の実装
6. テストとVercelへのデプロイ

## 将来的な拡張予定

- 複数の講師による講座登録機能
- ユーザーによるおすすめ講座の登録機能
- 視聴進捗の保存機能
- 修了証明書の発行
- コメント機能（動画単位）
- レビュー機能（講座単位、5段階評価+コメント）
