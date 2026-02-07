import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { YouTubePlayer } from '@/components/videos/youtube-player';
import { VideoSidebar } from '@/components/videos/video-sidebar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Metadata } from 'next';

interface VideoPageProps {
  params: Promise<{
    id: string;
    videoId: string;
  }>;
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { videoId } = await params;
  const supabase = await createClient();
  const { data: video } = await supabase
    .from('videos')
    .select('title, course_id, courses(title)')
    .eq('id', videoId)
    .single();

  if (!video) {
    return {
      title: '動画が見つかりません',
    };
  }

  // Type assertion for courses relation
  const courses = video.courses as { title: string } | { title: string }[] | null;
  const courseTitle = courses
    ? Array.isArray(courses)
      ? courses[0]?.title
      : courses.title
    : '講座';

  return {
    title: `${video.title} - ${courseTitle} - TubeLearn`,
    description: `${courseTitle}の動画`,
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id, videoId } = await params;
  const supabase = await createClient();

  // 認証状態の確認
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 動画情報の取得
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('*, courses(*)')
    .eq('id', videoId)
    .single();

  if (videoError || !video) {
    notFound();
  }

  // course relation handling - type assertion
  type CourseData = {
    id: string;
    title: string;
    is_free: boolean;
    [key: string]: unknown;
  };
  const courses = video.courses as CourseData | CourseData[] | null;
  const course = courses
    ? Array.isArray(courses)
      ? courses[0]
      : courses
    : null;

  if (!course) {
    notFound();
  }

  // アクセス制御
  if (!course?.is_free && !user) {
    redirect('/login');
  }

  // 同じ講座の動画リストを取得
  const { data: courseVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('course_id', video.course_id)
    .order('order', { ascending: true });

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href={`/courses/${video.course_id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          講座に戻る
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <YouTubePlayer video={video} />
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {course?.is_free && (
                <Badge className="bg-primary/90 text-primary-foreground">
                  無料
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {video.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>講座:</span>
              <Link
                href={`/courses/${video.course_id}`}
                className="font-medium transition-colors hover:text-foreground"
              >
                {course?.title}
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <VideoSidebar
            videos={courseVideos || []}
            currentVideoId={video.id}
            courseId={video.course_id}
          />
        </div>
      </div>
    </div>
  );
}
