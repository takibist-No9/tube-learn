import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CourseHeader } from '@/components/courses/course-header';
import { VideoList } from '@/components/videos/video-list';
import type { Metadata } from 'next';

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('title, description, thumbnail_url')
    .eq('id', id)
    .single();

  if (!course) {
    return {
      title: '講座が見つかりません',
    };
  }

  return {
    title: `${course.title} - TubeLearn`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: [course.thumbnail_url],
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 認証状態の確認
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 講座情報の取得
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (courseError || !course) {
    notFound();
  }

  // アクセス制御: 無料講座でない場合はログイン必須
  if (!course.is_free && !user) {
    redirect('/login');
  }

  // 動画リストの取得
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('course_id', id)
    .order('order', { ascending: true });

  return (
    <div className="container py-12">
      <CourseHeader course={course} />
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">講座の動画</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {videos?.length || 0}本の動画
            </p>
          </div>
        </div>
        <VideoList videos={videos || []} courseId={course.id} />
      </div>
    </div>
  );
}
