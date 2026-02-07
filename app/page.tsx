import { createClient } from '@/lib/supabase/server';
import { CourseList } from '@/components/courses/course-list';

export default async function HomePage() {
  const supabase = await createClient();

  // 全講座を取得
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
    return <div className="container py-8">講座の取得に失敗しました</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 to-background pb-16 pt-12">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              プログラミングを
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                動画で学ぶ
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              厳選されたYouTube動画で、効率的にプログラミングスキルを習得。
              <br className="hidden sm:inline" />
              初心者から上級者まで、あなたのレベルに合った講座が見つかります。
            </p>
          </div>
        </div>
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>
      </section>

      {/* Course List Section */}
      <section className="container py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">講座一覧</h2>
            <p className="mt-1 text-muted-foreground">
              {courses?.length || 0}件の講座が見つかりました
            </p>
          </div>
        </div>
        <CourseList courses={courses || []} />
      </section>
    </div>
  );
}
