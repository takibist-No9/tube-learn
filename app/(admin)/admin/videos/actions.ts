'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const videoSchema = z.object({
  course_id: z.string().uuid('有効な講座を選択してください'),
  title: z.string().min(1, '動画タイトルは必須です'),
  youtube_url: z.string().url('有効なYouTube URLを入力してください'),
  order: z.number().int().positive('表示順は1以上の整数である必要があります'),
});

export async function createVideo(formData: FormData) {
  const supabase = await createClient();

  const data = {
    course_id: formData.get('course_id') as string,
    title: formData.get('title') as string,
    youtube_url: formData.get('youtube_url') as string,
    order: parseInt(formData.get('order') as string, 10),
  };

  const validated = videoSchema.parse(data);

  const { error } = await supabase.from('videos').insert(validated);

  if (error) {
    throw new Error('動画の作成に失敗しました');
  }

  revalidatePath('/admin/videos');
  return { success: true };
}

export async function updateVideo(id: string, formData: FormData) {
  const supabase = await createClient();

  const data = {
    course_id: formData.get('course_id') as string,
    title: formData.get('title') as string,
    youtube_url: formData.get('youtube_url') as string,
    order: parseInt(formData.get('order') as string, 10),
  };

  const validated = videoSchema.parse(data);

  const { error } = await supabase
    .from('videos')
    .update(validated)
    .eq('id', id);

  if (error) {
    throw new Error('動画の更新に失敗しました');
  }

  revalidatePath('/admin/videos');
  return { success: true };
}

export async function deleteVideo(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('videos').delete().eq('id', id);

  if (error) {
    throw new Error('動画の削除に失敗しました');
  }

  revalidatePath('/admin/videos');
  return { success: true };
}
