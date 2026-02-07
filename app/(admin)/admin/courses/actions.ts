'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const courseSchema = z.object({
  title: z.string().min(1, '講座タイトルは必須です'),
  description: z.string().min(1, '講座説明は必須です'),
  thumbnail_url: z.string().url('有効なURLを入力してください'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  is_free: z.boolean(),
});

export async function createCourse(formData: FormData) {
  const supabase = await createClient();

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    thumbnail_url: formData.get('thumbnail_url') as string,
    difficulty: formData.get('difficulty') as string,
    is_free: formData.get('is_free') === 'true',
  };

  const validated = courseSchema.parse(data);

  const { error } = await supabase.from('courses').insert(validated);

  if (error) {
    throw new Error('講座の作成に失敗しました');
  }

  revalidatePath('/admin/courses');
  return { success: true };
}

export async function updateCourse(id: string, formData: FormData) {
  const supabase = await createClient();

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    thumbnail_url: formData.get('thumbnail_url') as string,
    difficulty: formData.get('difficulty') as string,
    is_free: formData.get('is_free') === 'true',
  };

  const validated = courseSchema.parse(data);

  const { error } = await supabase.from('courses').update(validated).eq('id', id);

  if (error) {
    throw new Error('講座の更新に失敗しました');
  }

  revalidatePath('/admin/courses');
  return { success: true };
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('courses').delete().eq('id', id);

  if (error) {
    throw new Error('講座の削除に失敗しました');
  }

  revalidatePath('/admin/courses');
  return { success: true };
}
