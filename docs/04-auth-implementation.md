# 04. 認証機能の実装

## 概要
Supabase AuthとGoogle OAuthを使用した認証機能を実装します。ログイン、ログアウト、認証状態の確認を行います。

## 関連技術
- Supabase Auth
- Google OAuth
- Next.js App Router
- Server Actions

## 実装の詳細

### 1. Supabase AuthでGoogle認証を有効化

Supabaseダッシュボードで以下を設定：
1. Authentication → Providers → Google
2. Google OAuth認証情報（Client IDとClient Secret）を入力
3. Redirect URLを設定（`https://your-project.supabase.co/auth/v1/callback`）

### 2. Google Cloud Consoleでの設定

1. Google Cloud Consoleでプロジェクトを作成
2. OAuth 2.0 クライアントIDを作成
3. 承認済みのリダイレクトURIを追加

### 3. 認証ページの作成

#### ログインページ

`app/(auth)/login/page.tsx`を作成：

```typescript
import { LoginButton } from '@/components/auth/login-button'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Googleアカウントでログインしてください
          </p>
        </div>
        <LoginButton />
      </div>
    </div>
  )
}
```

#### ログインボタンコンポーネント

`components/auth/login-button.tsx`を作成：

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <Button onClick={handleLogin} className="w-full">
      Googleでログイン
    </Button>
  )
}
```

### 4. 認証コールバックの処理

`app/auth/callback/route.ts`を作成：

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // ログイン後はトップページにリダイレクト
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
```

### 5. ログアウト機能の実装

#### Server Action

`app/actions/auth.ts`を作成：

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

#### ログアウトボタンコンポーネント

`components/auth/logout-button.tsx`を作成：

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'

export function LogoutButton() {
  return (
    <Button onClick={() => signOut()} variant="ghost">
      ログアウト
    </Button>
  )
}
```

### 6. ユーザー情報の取得

#### ユーザー情報表示コンポーネント

`components/auth/user-nav.tsx`を作成：

```typescript
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogoutButton } from './logout-button'

export async function UserNav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback>
            {profile?.display_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{profile?.display_name}</p>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 7. 認証レイアウトの作成

`app/(auth)/layout.tsx`を作成：

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {children}
    </div>
  )
}
```

## Todo

- [x] SupabaseダッシュボードでGoogle認証を有効化
- [x] Google Cloud ConsoleでOAuth 2.0設定
- [x] 環境変数にGoogle認証情報を追加（必要に応じて）
- [x] `app/(auth)/login/page.tsx`を作成
- [x] `components/auth/login-button.tsx`を作成
- [x] `app/auth/callback/route.ts`を作成
- [x] `app/actions/auth.ts`を作成（ログアウトServer Action）
- [x] `components/auth/logout-button.tsx`を作成
- [x] `components/auth/user-nav.tsx`を作成
- [x] `app/(auth)/layout.tsx`を作成
- [x] ログインフローの動作確認
- [x] ログアウトの動作確認
- [x] プロファイル自動作成トリガーの動作確認
- [x] エラーハンドリングの実装

## 参考資料
- [Supabase Auth with OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Google OAuth Setup](https://console.cloud.google.com/)
