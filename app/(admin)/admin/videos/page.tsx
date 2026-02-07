import { createClient } from '@/lib/supabase/server';
import { VideoTable } from '@/components/admin/video-table';
import { CreateVideoButton } from '@/components/admin/create-video-button';

export default async function VideosPage() {
  const supabase = await createClient();

  // 動画と講座情報を一緒に取得
  const { data: videos } = await supabase
    .from('videos')
    .select('*, courses(title)')
    .order('course_id')
    .order('order', { ascending: true });

  // 講座一覧を取得（動画作成時のセレクトボックス用）
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('title');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">動画管理</h1>
          <p className="mt-2 text-muted-foreground">
            講座に含まれる動画の追加、編集、削除を行います
          </p>
        </div>
        <CreateVideoButton courses={courses || []} />
      </div>

      <VideoTable videos={videos || []} courses={courses || []} />
    </div>
  );
}
