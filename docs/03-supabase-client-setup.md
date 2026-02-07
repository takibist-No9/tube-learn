# 03. Supabaseクライアントの設定

## 概要
Next.js App Routerの各実行環境（Server Components、Client Components、Server Actions、Middleware等）に応じた適切なSupabaseクライアントを作成します。

## 関連技術
- @supabase/supabase-js
- @supabase/ssr
- Next.js App Router
- TypeScript

## 実装の詳細

### 1. パッケージのインストール

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. 型定義の生成

```bash
npx supabase gen types typescript --project-id your-project-id > types/database.types.ts
```

または、Supabaseダッシュボードから型定義をコピー。

### 3. Server Components用クライアント

`lib/supabase/server.ts`を作成：

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentからのset呼び出しは無視
          }
        },
      },
    }
  )
}
```

### 4. Client Components用クライアント

`lib/supabase/client.ts`を作成：

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 5. Middleware用クライアント

`lib/supabase/middleware.ts`を作成：

```typescript
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // トークンの更新とJWT検証
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return supabaseResponse
}
```

### 6. Middlewareファイルの作成

`middleware.ts`（ルートディレクトリ）を作成：

```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 7. 型定義ファイルの作成

`types/database.types.ts`に生成した型を配置。

必要に応じて型エイリアスを追加：

```typescript
import type { Database } from './database.types'

export type Course = Database['public']['Tables']['courses']['Row']
export type CourseInsert = Database['public']['Tables']['courses']['Insert']
export type CourseUpdate = Database['public']['Tables']['courses']['Update']

export type Video = Database['public']['Tables']['videos']['Row']
export type VideoInsert = Database['public']['Tables']['videos']['Insert']
export type VideoUpdate = Database['public']['Tables']['videos']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
```

## 重要な注意事項

### 🚨 絶対にやってはいけないこと

```typescript
// ❌ サーバーコードで getSession() を使用してはいけない
const { data: { session } } = await supabase.auth.getSession()
```

### ✅ 正しい方法

```typescript
// ✅ サーバーコードでは getUser() を使用（JWT署名を検証）
const { data: { user } } = await supabase.auth.getUser()
```

**理由:**
- `getSession()`はJWT署名を検証せず、Cookieの値をそのまま信頼する
- サーバーコードでは必ず`getUser()`を使用してJWTを検証する必要がある

## Todo

- [x] `@supabase/supabase-js`と`@supabase/ssr`をインストール
- [x] Supabase型定義を生成（`types/database.types.ts`）
- [x] `lib/supabase/server.ts`を作成（Server Components用）
- [x] `lib/supabase/client.ts`を作成（Client Components用）
- [x] `lib/supabase/middleware.ts`を作成（Middleware用）
- [x] ルートディレクトリに`middleware.ts`を作成
- [x] 型エイリアスを`types/database.types.ts`に追加
- [x] Server Componentでクライアントの動作確認
- [x] Client Componentでクライアントの動作確認
- [x] Middlewareでトークン更新の動作確認
- [x] 環境変数（.env.local）の設定を再確認

## 参考資料
- [Supabase Auth - Server-Side](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs)
- [@supabase/ssr Documentation](https://supabase.com/docs/guides/auth/server-side/overview)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
