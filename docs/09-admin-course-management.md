# 09. 管理画面：講座管理の実装

## 概要
管理者が講座の作成、編集、削除を行える管理画面を実装します。

## 関連技術
- Next.js App Router (Server Components, Server Actions)
- Supabase
- shadcn/ui (Form, Dialog, Table)
- React Hook Form
- Zod

## 実装の詳細

### 1. 必要なパッケージのインストール

```bash
npm install react-hook-form @hookform/resolvers zod
npx shadcn@latest add table
npx shadcn@latest add dialog
```

### 2. 講座管理ページ

`app/(admin)/admin/courses/page.tsx`を作成：

```typescript
import { createClient } from '@/lib/supabase/server'
import { CourseTable } from '@/components/admin/course-table'
import { CreateCourseButton } from '@/components/admin/create-course-button'

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">講座管理</h1>
          <p className="mt-2 text-muted-foreground">
            講座の作成、編集、削除を行います
          </p>
        </div>
        <CreateCourseButton />
      </div>

      <CourseTable courses={courses || []} />
    </div>
  )
}
```

### 3. Server Actions

`app/(admin)/admin/courses/actions.ts`を作成：

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const courseSchema = z.object({
  title: z.string().min(1, '講座タイトルは必須です'),
  description: z.string().min(1, '講座説明は必須です'),
  thumbnail_url: z.string().url('有効なURLを入力してください'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  is_free: z.boolean(),
})

export async function createCourse(formData: FormData) {
  const supabase = await createClient()

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    thumbnail_url: formData.get('thumbnail_url') as string,
    difficulty: formData.get('difficulty') as string,
    is_free: formData.get('is_free') === 'true',
  }

  const validated = courseSchema.parse(data)

  const { error } = await supabase.from('courses').insert(validated)

  if (error) {
    throw new Error('講座の作成に失敗しました')
  }

  revalidatePath('/admin/courses')
  return { success: true }
}

export async function updateCourse(id: string, formData: FormData) {
  const supabase = await createClient()

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    thumbnail_url: formData.get('thumbnail_url') as string,
    difficulty: formData.get('difficulty') as string,
    is_free: formData.get('is_free') === 'true',
  }

  const validated = courseSchema.parse(data)

  const { error } = await supabase
    .from('courses')
    .update(validated)
    .eq('id', id)

  if (error) {
    throw new Error('講座の更新に失敗しました')
  }

  revalidatePath('/admin/courses')
  return { success: true }
}

export async function deleteCourse(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('courses').delete().eq('id', id)

  if (error) {
    throw new Error('講座の削除に失敗しました')
  }

  revalidatePath('/admin/courses')
  return { success: true }
}
```

### 4. 講座テーブルコンポーネント

`components/admin/course-table.tsx`を作成：

```typescript
'use client'

import { useState } from 'react'
import { EditCourseDialog } from './edit-course-dialog'
import { DeleteCourseDialog } from './delete-course-dialog'
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
import { Pencil, Trash2 } from 'lucide-react'
import type { Course } from '@/types/database.types'

const difficultyLabels = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
} as const

interface CourseTableProps {
  courses: Course[]
}

export function CourseTable({ courses }: CourseTableProps) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)

  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">講座がまだありません</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>難易度</TableHead>
              <TableHead>無料</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>
                  {difficultyLabels[course.difficulty as keyof typeof difficultyLabels]}
                </TableCell>
                <TableCell>
                  {course.is_free ? (
                    <Badge variant="outline">無料</Badge>
                  ) : (
                    <Badge variant="secondary">有料</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCourse(course)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCourseId(course.id)}
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

      {editingCourse && (
        <EditCourseDialog
          course={editingCourse}
          open={!!editingCourse}
          onOpenChange={(open) => !open && setEditingCourse(null)}
        />
      )}

      {deletingCourseId && (
        <DeleteCourseDialog
          courseId={deletingCourseId}
          open={!!deletingCourseId}
          onOpenChange={(open) => !open && setDeletingCourseId(null)}
        />
      )}
    </>
  )
}
```

### 5. 講座作成ボタンと作成ダイアログ

`components/admin/create-course-button.tsx`を作成：

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CourseFormDialog } from './course-form-dialog'

export function CreateCourseButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        新規講座
      </Button>

      <CourseFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
      />
    </>
  )
}
```

### 6. 講座フォームダイアログ

`components/admin/course-form-dialog.tsx`を作成：

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCourse, updateCourse } from '@/app/(admin)/admin/courses/actions'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import type { Course } from '@/types/database.types'

const formSchema = z.object({
  title: z.string().min(1, '講座タイトルは必須です'),
  description: z.string().min(1, '講座説明は必須です'),
  thumbnail_url: z.string().url('有効なURLを入力してください'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  is_free: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface CourseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  course?: Course
}

export function CourseFormDialog({
  open,
  onOpenChange,
  mode,
  course,
}: CourseFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: course
      ? {
          title: course.title,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          difficulty: course.difficulty as 'beginner' | 'intermediate' | 'advanced',
          is_free: course.is_free,
        }
      : {
          title: '',
          description: '',
          thumbnail_url: '',
          difficulty: 'beginner',
          is_free: false,
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
          await createCourse(formData)
          toast({
            title: '講座を作成しました',
          })
        } else if (course) {
          await updateCourse(course.id, formData)
          toast({
            title: '講座を更新しました',
          })
        }

        form.reset()
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '新規講座作成' : '講座編集'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>講座タイトル</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>講座説明</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>サムネイルURL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>難易度</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">初級</SelectItem>
                      <SelectItem value="intermediate">中級</SelectItem>
                      <SelectItem value="advanced">上級</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_free"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">無料講座</FormLabel>
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

### 7. 編集・削除ダイアログ

`components/admin/edit-course-dialog.tsx`:
```typescript
'use client'

import { CourseFormDialog } from './course-form-dialog'
import type { Course } from '@/types/database.types'

interface EditCourseDialogProps {
  course: Course
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCourseDialog({
  course,
  open,
  onOpenChange,
}: EditCourseDialogProps) {
  return (
    <CourseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      course={course}
    />
  )
}
```

`components/admin/delete-course-dialog.tsx`:
```typescript
'use client'

import { useTransition } from 'react'
import { deleteCourse } from '@/app/(admin)/admin/courses/actions'
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

interface DeleteCourseDialogProps {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteCourseDialog({
  courseId,
  open,
  onOpenChange,
}: DeleteCourseDialogProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCourse(courseId)
        toast({
          title: '講座を削除しました',
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
          <AlertDialogTitle>講座を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は取り消せません。講座とそれに紐づく動画がすべて削除されます。
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

### 8. Checkboxコンポーネントの追加
```bash
npx shadcn@latest add checkbox
npx shadcn@latest add alert-dialog
```

## Todo

- [x] 必要なパッケージをインストール（react-hook-form, zod等）
- [x] Tableコンポーネントをインストール
- [x] Dialogコンポーネントをインストール（既にある場合はスキップ）
- [x] Checkboxコンポーネントをインストール
- [x] Alert Dialogコンポーネントをインストール
- [x] `app/(admin)/admin/courses/page.tsx`を作成
- [x] `app/(admin)/admin/courses/actions.ts`を作成
- [x] `components/admin/course-table.tsx`を作成
- [x] `components/admin/create-course-button.tsx`を作成
- [x] `components/admin/course-form-dialog.tsx`を作成
- [x] `components/admin/edit-course-dialog.tsx`を作成
- [x] `components/admin/delete-course-dialog.tsx`を作成
- [x] 講座作成機能の動作確認
- [x] 講座編集機能の動作確認
- [x] 講座削除機能の動作確認
- [x] フォームバリデーションの確認
- [x] エラーハンドリングの確認
- [x] Toastメッセージの表示確認

## 参考資料
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [shadcn/ui Table](https://ui.shadcn.com/docs/components/table)
- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)
- [shadcn/ui Form](https://ui.shadcn.com/docs/components/form)
