# 07. 動画視聴ページの実装

## 概要
YouTube動画を埋め込み、視聴できるページを実装します。動画タイトルと同じ講座内の他の動画リストも表示します。

## 関連技術
- Next.js App Router (Server Components, Dynamic Routes)
- YouTube Embed API
- Supabase
- shadcn/ui

## 実装の詳細

### 1. 動画視聴ページの作成

`app/courses/[id]/videos/[videoId]/page.tsx`を作成：

```typescript
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { YouTubePlayer } from '@/components/videos/youtube-player'
import { VideoSidebar } from '@/components/videos/video-sidebar'
import type { Metadata } from 'next'

interface VideoPageProps {
  params: {
    id: string
    videoId: string
  }
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { data: video } = await supabase
    .from('videos')
    .select('title, course:courses(title)')
    .eq('id', params.videoId)
    .single()

  if (!video) {
    return {
      title: '動画が見つかりません',
    }
  }

  return {
    title: `${video.title} - ${video.course?.title} - Tube Learn`,
    description: `${video.course?.title}の講座動画`,
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const supabase = await createClient()

  // 認証状態の確認
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 動画情報の取得
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('*, course:courses(*)')
    .eq('id', params.videoId)
    .single()

  if (videoError || !video) {
    notFound()
  }

  // アクセス制御
  if (!video.course?.is_free && !user) {
    redirect('/login')
  }

  // 同じ講座の動画リストを取得
  const { data: courseVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('course_id', video.course_id)
    .order('order', { ascending: true })

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <YouTubePlayer video={video} />
          <div className="mt-4 space-y-2">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <p className="text-sm text-muted-foreground">
              講座: {video.course?.title}
            </p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <VideoSidebar
            videos={courseVideos || []}
            currentVideoId={video.id}
            courseId={video.course_id}
          />
        </div>
      </div>
    </div>
  )
}
```

### 2. YouTubeプレイヤーコンポーネント

`components/videos/youtube-player.tsx`を作成：

```typescript
'use client'

import { useEffect, useState } from 'react'
import type { Video } from '@/types/database.types'

interface YouTubePlayerProps {
  video: Video
}

// YouTube URLからビデオIDを抽出する関数
function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}

export function YouTubePlayer({ video }: YouTubePlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null)

  useEffect(() => {
    const id = extractVideoId(video.youtube_url)
    setVideoId(id)
  }, [video.youtube_url])

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
        <p className="text-muted-foreground">動画を読み込めませんでした</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}
```

### 3. 動画サイドバーコンポーネント

`components/videos/video-sidebar.tsx`を作成：

```typescript
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PlayCircle, CheckCircle } from 'lucide-react'
import type { Video } from '@/types/database.types'

interface VideoSidebarProps {
  videos: Video[]
  currentVideoId: string
  courseId: string
}

export function VideoSidebar({
  videos,
  currentVideoId,
  courseId,
}: VideoSidebarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>講座の動画</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {videos.map((video, index) => {
          const isCurrent = video.id === currentVideoId

          return (
            <Link
              key={video.id}
              href={`/courses/${courseId}/videos/${video.id}`}
              className={cn(
                'flex items-start gap-3 rounded-lg p-3 transition-colors',
                isCurrent
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted'
              )}
            >
              <div className="flex-shrink-0 pt-0.5">
                {isCurrent ? (
                  <PlayCircle className="h-5 w-5" />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2">
                    <span className="text-xs">{index + 1}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p
                  className={cn(
                    'text-sm font-medium leading-tight',
                    isCurrent && 'font-semibold'
                  )}
                >
                  {video.title}
                </p>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
```

### 4. not-foundページ

`app/courses/[id]/videos/[videoId]/not-found.tsx`を作成：

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold">動画が見つかりません</h2>
        <p className="mt-4 text-muted-foreground">
          お探しの動画は存在しないか、削除された可能性があります。
        </p>
        <Button asChild className="mt-6">
          <Link href="/">トップページに戻る</Link>
        </Button>
      </div>
    </div>
  )
}
```

## Todo

- [x] `app/courses/[id]/videos/[videoId]/page.tsx`を作成
- [x] `components/videos/youtube-player.tsx`を作成
- [x] `components/videos/video-sidebar.tsx`を作成
- [x] `app/courses/[id]/videos/[videoId]/not-found.tsx`を作成
- [x] YouTube埋め込みの動作確認
- [x] YouTube URLからビデオID抽出の動作確認
- [x] 様々なYouTube URL形式での動作確認
- [x] サイドバーの現在の動画ハイライト確認
- [x] レスポンシブデザインの確認（モバイル、タブレット、デスクトップ）
- [x] アクセス制御の動作確認
- [x] 存在しない動画IDでの404表示確認
- [x] メタデータの動作確認

## 参考資料
- [YouTube Embed API](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube Player Parameters](https://developers.google.com/youtube/player_parameters)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
