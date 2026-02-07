# 10. 管理画面：動画管理の実装

## 概要
管理者が動画の追加、編集、削除を行える管理画面を実装します。講座に紐づく動画を管理します。

## 関連技術
- Next.js App Router (Server Components, Server Actions)
- Supabase
- shadcn/ui (Form, Dialog, Table)
- React Hook Form
- Zod

## 実装の詳細

### 1. 動画管理ページ

`app/(admin)/admin/videos/page.tsx`を作成：

```typescript
import { createClient } from '@/lib/supabase/server'
import { VideoTable } from '@/components/admin/video-table'
import { CreateVideoButton } from '@/components/admin/create-video-button'

export default async function AdminVideosPage() {
  const supabase = await createClient()

  // 動画と講座情報を一緒に取得
  const { data: videos } = await supabase
    .from('videos')
    .select('*, course:courses(title)')
    .order('course_id')
    .order('order', { ascending: true })

  // 講座一覧を取得（動画作成時のセレクトボックス用）
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('title')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">動画管理</h1>
          <p className="mt-2 text-muted-foreground">
            講座に含まれる動画の追加、編集、削除を行います
          </p>
        </div>
        <CreateVideoButton courses={courses || []} />
      </div>

      <VideoTable videos={videos || []} courses={courses || []} />
    </div>
  )
}
```

### 2. Server Actions

`app/(admin)/admin/videos/actions.ts`を作成：

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const videoSchema = z.object({
  course_id: z.string().uuid('有効な講座を選択してください'),
  title: z.string().min(1, '動画タイトルは必須です'),
  youtube_url: z.string().url('有効なYouTube URLを入力してください'),
  order: z.number().int().positive('表示順は1以上の整数である必要があります'),
})

export async function createVideo(formData: FormData) {
  const supabase = await createClient()

  const data = {
    course_id: formData.get('course_id') as string,
    title: formData.get('title') as string,
    youtube_url: formData.get('youtube_url') as string,
    order: parseInt(formData.get('order') as string, 10),
  }

  const validated = videoSchema.parse(data)

  const { error } = await supabase.from('videos').insert(validated)

  if (error) {
    throw new Error('動画の作成に失敗しました')
  }

  revalidatePath('/admin/videos')
  return { success: true }
}

export async function updateVideo(id: string, formData: FormData) {
  const supabase = await createClient()

  const data = {
    course_id: formData.get('course_id') as string,
    title: formData.get('title') as string,
    youtube_url: formData.get('youtube_url') as string,
    order: parseInt(formData.get('order') as string, 10),
  }

  const validated = videoSchema.parse(data)

  const { error } = await supabase
    .from('videos')
    .update(validated)
    .eq('id', id)

  if (error) {
    throw new Error('動画の更新に失敗しました')
  }

  revalidatePath('/admin/videos')
  return { success: true }
}

export async function deleteVideo(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('videos').delete().eq('id', id)

  if (error) {
    throw new Error('動画の削除に失敗しました')
  }

  revalidatePath('/admin/videos')
  return { success: true }
}
```

### 3. 動画テーブルコンポーネント

`components/admin/video-table.tsx`を作成：

```typescript
'use client'

import { useState } from 'react'
import { EditVideoDialog } from './edit-video-dialog'
import { DeleteVideoDialog } from './delete-video-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { Video } from '@/types/database.types'

interface VideoWithCourse extends Video {
  course?: {
    title: string
  }
}

interface Course {
  id: string
  title: string
}

interface VideoTableProps {
  videos: VideoWithCourse[]
  courses: Course[]
}

export function VideoTable({ videos, courses }: VideoTableProps) {
  const [editingVideo, setEditingVideo] = useState<VideoWithCourse | null>(null)
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null)

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">動画がまだありません</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>講座</TableHead>
              <TableHead>タイトル</TableHead>
              <TableHead>表示順</TableHead>
              <TableHead>YouTube URL</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell>
                  <Badge variant="outline">{video.course?.title}</Badge>
                </TableCell>
                <TableCell className="font-medium">{video.title}</TableCell>
                <TableCell>{video.order}</TableCell>
                <TableCell>
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    YouTube <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingVideo(video)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingVideoId(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingVideo && (
        <EditVideoDialog
          video={editingVideo}
          courses={courses}
          open={!!editingVideo}
          onOpenChange={(open) => !open && setEditingVideo(null)}
        />
      )}

      {deletingVideoId && (
        <DeleteVideoDialog
          videoId={deletingVideoId}
          open={!!deletingVideoId}
          onOpenChange={(open) => !open && setDeletingVideoId(null)}
        />
      )}
    </>
  )
}
```

### 4. 動画作成ボタンと作成ダイアログ

`components/admin/create-video-button.tsx`を作成：

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { VideoFormDialog } from './video-form-dialog'

interface Course {
  id: string
  title: string
}

interface CreateVideoButtonProps {
  courses: Course[]
}

export function CreateVideoButton({ courses }: CreateVideoButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        新規動画
      </Button>

      <VideoFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        courses={courses}
      />
    </>
  )
}
```

### 5. 動画フォームダイアログ

`components/admin/video-form-dialog.tsx`を作成：

```typescript
'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createVideo, updateVideo } from '@/app/(admin)/admin/videos/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Video } from '@/types/database.types'

const formSchema = z.object({
  course_id: z.string().min(1, '講座を選択してください'),
  title: z.string().min(1, '動画タイトルは必須です'),
  youtube_url: z.string().url('有効なYouTube URLを入力してください'),
  order: z.coerce.number().int().positive('表示順は1以上の整数である必要があります'),
})

type FormValues = z.infer<typeof formSchema>

interface Course {
  id: string
  title: string
}

interface VideoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  courses: Course[]
  video?: Video
}

export function VideoFormDialog({
  open,
  onOpenChange,
  mode,
  courses,
  video,
}: VideoFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: video
      ? {
          course_id: video.course_id,
          title: video.title,
          youtube_url: video.youtube_url,
          order: video.order,
        }
      : {
          course_id: '',
          title: '',
          youtube_url: '',
          order: 1,
        },
  })

  const onSubmit = async (values: FormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        Object.entries(values).forEach(([key, value]) => {
          formData.append(key, String(value))
        })

        if (mode === 'create') {
          await createVideo(formData)
          toast({
            title: '動画を作成しました',
          })
        } else if (video) {
          await updateVideo(video.id, formData)
          toast({
            title: '動画を更新しました',
          })
        }

        form.reset()
        onOpenChange(false)
      } catch (error) {
        toast({
          title: 'エラーが発生しました',
          description: error instanceof Error ? error.message : '不明なエラー',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '新規動画追加' : '動画編集'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="course_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>講座</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="講座を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>動画タイトル</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="youtube_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube URL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" placeholder="https://www.youtube.com/watch?v=..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>表示順</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={1} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isPending}>
                {mode === 'create' ? '作成' : '更新'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### 6. 編集・削除ダイアログ

`components/admin/edit-video-dialog.tsx`:
```typescript
'use client'

import { VideoFormDialog } from './video-form-dialog'
import type { Video } from '@/types/database.types'

interface Course {
  id: string
  title: string
}

interface EditVideoDialogProps {
  video: Video
  courses: Course[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVideoDialog({
  video,
  courses,
  open,
  onOpenChange,
}: EditVideoDialogProps) {
  return (
    <VideoFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      courses={courses}
      video={video}
    />
  )
}
```

`components/admin/delete-video-dialog.tsx`:
```typescript
'use client'

import { useTransition } from 'react'
import { deleteVideo } from '@/app/(admin)/admin/videos/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface DeleteVideoDialogProps {
  videoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteVideoDialog({
  videoId,
  open,
  onOpenChange,
}: DeleteVideoDialogProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteVideo(videoId)
        toast({
          title: '動画を削除しました',
        })
        onOpenChange(false)
      } catch (error) {
        toast({
          title: 'エラーが発生しました',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>動画を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は取り消せません。動画が完全に削除されます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

## Todo

- [x] `app/(admin)/admin/videos/page.tsx`を作成
- [x] `app/(admin)/admin/videos/actions.ts`を作成
- [x] `components/admin/video-table.tsx`を作成
- [x] `components/admin/create-video-button.tsx`を作成
- [x] `components/admin/video-form-dialog.tsx`を作成
- [x] `components/admin/edit-video-dialog.tsx`を作成
- [x] `components/admin/delete-video-dialog.tsx`を作成
- [x] 動画作成機能の動作確認
- [x] 動画編集機能の動作確認
- [x] 動画削除機能の動作確認
- [x] 講座選択セレクトボックスの動作確認
- [x] YouTube URL形式のバリデーション確認
- [x] 表示順の重複チェック（オプション）
- [x] フォームバリデーションの確認
- [x] エラーハンドリングの確認

## 参考資料
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [shadcn/ui Table](https://ui.shadcn.com/docs/components/table)
- [shadcn/ui Form](https://ui.shadcn.com/docs/components/form)
