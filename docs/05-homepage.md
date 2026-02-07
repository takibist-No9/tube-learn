# 05. トップページ（講座一覧）の実装

## 概要
講座一覧を表示するトップページを実装します。サムネイル、タイトル、難易度を表示し、講座詳細ページへのリンクを提供します。

## 関連技術
- Next.js App Router (Server Components)
- Supabase
- shadcn/ui (Card, Badge)
- next/image

## 実装の詳細

### 1. トップページの作成

`app/page.tsx`を更新：

```typescript
import { createClient } from '@/lib/supabase/server'
import { CourseList } from '@/components/courses/course-list'

export default async function HomePage() {
  const supabase = await createClient()

  // 全講座を取得
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return <div>講座の取得に失敗しました</div>
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">講座一覧</h1>
        <p className="mt-2 text-muted-foreground">
          プログラミング学習に役立つ講座をご覧ください
        </p>
      </div>
      <CourseList courses={courses || []} />
    </div>
  )
}
```

### 2. 講座一覧コンポーネント

`components/courses/course-list.tsx`を作成：

```typescript
import { CourseCard } from './course-card'
import type { Course } from '@/types/database.types'

interface CourseListProps {
  courses: Course[]
}

export function CourseList({ courses }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">講座がまだありません</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
```

### 3. 講座カードコンポーネント

`components/courses/course-card.tsx`を作成：

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Course } from '@/types/database.types'

const difficultyLabels = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
} as const

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
} as const

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="line-clamp-2 text-lg font-semibold">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={difficultyColors[course.difficulty as keyof typeof difficultyColors]}
            >
              {difficultyLabels[course.difficulty as keyof typeof difficultyLabels]}
            </Badge>
            {course.is_free && (
              <Badge variant="outline">無料</Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
```

### 4. レイアウトにナビゲーションを追加

`app/layout.tsx`を更新：

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tube Learn - プログラミング講座プラットフォーム",
  description: "YouTube動画を活用したプログラミング学習プラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### 5. ヘッダーコンポーネント

`components/layout/header.tsx`を作成：

```typescript
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserNav } from '@/components/auth/user-nav'
import { Button } from '@/components/ui/button'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Tube Learn</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
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

- [x] `app/page.tsx`を更新（講座一覧の取得と表示）
- [x] `components/courses/course-list.tsx`を作成
- [x] `components/courses/course-card.tsx`を作成
- [x] `components/layout/header.tsx`を作成
- [x] `app/layout.tsx`を更新（ヘッダーを追加）
- [x] 難易度バッジのスタイリング確認
- [x] 無料バッジの表示確認
- [x] レスポンシブデザインの確認（モバイル、タブレット、デスクトップ）
- [x] ホバーエフェクトの確認
- [x] 画像の最適化とローディング確認
- [x] 講座が0件の場合の表示確認
- [x] エラーハンドリングの実装

## 参考資料
- [next/image Documentation](https://nextjs.org/docs/app/api-reference/components/image)
- [shadcn/ui Card](https://ui.shadcn.com/docs/components/card)
- [shadcn/ui Badge](https://ui.shadcn.com/docs/components/badge)
