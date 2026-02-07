# 06. 講座詳細ページの実装

## 概要
講座の詳細情報（タイトル、説明、難易度）と、その講座に含まれる動画リストを表示するページを実装します。

## 関連技術
- Next.js App Router (Server Components, Dynamic Routes)
- Supabase
- shadcn/ui
- next/image

## 実装の詳細

### 1. 講座詳細ページの作成

`app/courses/[id]/page.tsx`を作成：

```typescript
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CourseHeader } from '@/components/courses/course-header'
import { VideoList } from '@/components/videos/video-list'
import type { Metadata } from 'next'

interface CoursePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('title, description, thumbnail_url')
    .eq('id', params.id)
    .single()

  if (!course) {
    return {
      title: '講座が見つかりません',
    }
  }

  return {
    title: `${course.title} - Tube Learn`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: [course.thumbnail_url],
    },
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const supabase = await createClient()

  // 認証状態の確認
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 講座情報の取得
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (courseError || !course) {
    notFound()
  }

  // アクセス制御: 無料講座でない場合はログイン必須
  if (!course.is_free && !user) {
    redirect('/login')
  }

  // 動画リストの取得
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('course_id', params.id)
    .order('order', { ascending: true })

  return (
    <div className="container py-8">
      <CourseHeader course={course} />
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">講座の動画</h2>
        <VideoList videos={videos || []} courseId={course.id} />
      </div>
    </div>
  )
}
```

### 2. 講座ヘッダーコンポーネント

`components/courses/course-header.tsx`を作成：

```typescript
import Image from 'next/image'
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

interface CourseHeaderProps {
  course: Course
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Image
          src={course.thumbnail_url}
          alt={course.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={difficultyColors[course.difficulty as keyof typeof difficultyColors]}
          >
            {difficultyLabels[course.difficulty as keyof typeof difficultyLabels]}
          </Badge>
          {course.is_free && <Badge variant="outline">無料</Badge>}
        </div>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          {course.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {course.description}
        </p>
      </div>
    </div>
  )
}
```

### 3. 動画リストコンポーネント

`components/videos/video-list.tsx`を作成：

```typescript
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { PlayCircle } from 'lucide-react'
import type { Video } from '@/types/database.types'

interface VideoListProps {
  videos: Video[]
  courseId: string
}

export function VideoList({ videos, courseId }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          この講座にはまだ動画がありません
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {videos.map((video, index) => (
        <Link
          key={video.id}
          href={`/courses/${courseId}/videos/${video.id}`}
        >
          <Card className="transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                  <h3 className="font-semibold">{video.title}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
```

### 4. not-foundページ

`app/courses/[id]/not-found.tsx`を作成：

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold">講座が見つかりません</h2>
        <p className="mt-4 text-muted-foreground">
          お探しの講座は存在しないか、削除された可能性があります。
        </p>
        <Button asChild className="mt-6">
          <Link href="/">トップページに戻る</Link>
        </Button>
      </div>
    </div>
  )
}
```

### 5. lucide-reactのインストール

アイコン用にlucide-reactをインストール：

```bash
npm install lucide-react
```

## Todo

- [x] `lucide-react`をインストール
- [x] `app/courses/[id]/page.tsx`を作成
- [x] `components/courses/course-header.tsx`を作成
- [x] `components/videos/video-list.tsx`を作成
- [x] `app/courses/[id]/not-found.tsx`を作成
- [x] メタデータ（OGP）の動作確認
- [x] アクセス制御の動作確認（無料講座/有料講座）
- [x] 動画が0件の場合の表示確認
- [x] レスポンシブデザインの確認
- [x] 動画リストのホバーエフェクト確認
- [x] 存在しない講座IDでの404表示確認
- [x] ログイン後のリダイレクト確認

## 参考資料
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js not-found](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [lucide-react](https://lucide.dev/guide/packages/lucide-react)
