# 08. 管理画面レイアウトの実装

## 概要
管理者専用の管理画面レイアウトを実装します。サイドバーナビゲーションと管理者権限チェックを含みます。

## 関連技術
- Next.js App Router (Layouts, Route Groups)
- Supabase (認証、RLS)
- shadcn/ui
- lucide-react

## 実装の詳細

### 1. 管理画面レイアウト

`app/(admin)/layout.tsx`を作成：

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 認証状態の確認
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 管理者権限の確認
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
```

### 2. 管理画面サイドバー

`components/admin/admin-sidebar.tsx`を作成：

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Home,
} from 'lucide-react'

const routes = [
  {
    label: 'ダッシュボード',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    label: '講座管理',
    icon: BookOpen,
    href: '/admin/courses',
  },
  {
    label: '動画管理',
    icon: Video,
    href: '/admin/videos',
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="font-bold">管理画面</span>
        </Link>
      </div>
      <div className="space-y-4 p-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant={pathname === route.href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  pathname === route.href && 'bg-secondary'
                )}
              >
                <route.icon className="mr-2 h-4 w-4" />
                {route.label}
              </Button>
            </Link>
          ))}
        </div>
        <Separator />
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            トップページに戻る
          </Button>
        </Link>
      </div>
    </aside>
  )
}
```

### 3. 管理画面トップページ

`app/(admin)/admin/page.tsx`を作成：

```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Video, Users } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 統計情報の取得
  const [
    { count: coursesCount },
    { count: videosCount },
    { count: usersCount },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('videos').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      title: '講座数',
      value: coursesCount || 0,
      icon: BookOpen,
    },
    {
      title: '動画数',
      value: videosCount || 0,
      icon: Video,
    },
    {
      title: 'ユーザー数',
      value: usersCount || 0,
      icon: Users,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="mt-2 text-muted-foreground">
          プラットフォームの概要と統計情報
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### 4. ヘッダーに管理画面リンクを追加

`components/layout/header.tsx`を更新：

```typescript
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserNav } from '@/components/auth/user-nav'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 管理者権限の確認
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.is_admin || false
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Tube Learn</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {isAdmin && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <Settings className="mr-2 h-4 w-4" />
                管理画面
              </Link>
            </Button>
          )}
          {user ? (
            <UserNav />
          ) : (
            <Button asChild>
              <Link href="/login">ログイン</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
```

## Todo

- [x] `app/(admin)/layout.tsx`を作成
- [x] `components/admin/admin-sidebar.tsx`を作成
- [x] `app/(admin)/admin/page.tsx`を作成
- [x] `components/layout/header.tsx`を更新（管理画面リンク追加）
- [x] Separatorコンポーネントをインストール（`npx shadcn@latest add separator`）
- [x] 管理者権限チェックの動作確認
- [x] 非管理者ユーザーのリダイレクト確認
- [x] 未ログインユーザーのリダイレクト確認
- [x] サイドバーナビゲーションの動作確認
- [x] レスポンシブデザインの確認
- [x] 統計情報の表示確認
- [x] 管理画面へのアクセス制御確認

## 参考資料
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js Layouts](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [shadcn/ui Separator](https://ui.shadcn.com/docs/components/separator)
