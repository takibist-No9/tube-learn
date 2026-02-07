import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Video, Users } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 統計情報の取得
  const [
    { count: coursesCount },
    { count: videosCount },
    { count: usersCount },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('videos').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    {
      title: '講座数',
      value: coursesCount || 0,
      icon: BookOpen,
      description: '登録されている講座の総数',
    },
    {
      title: '動画数',
      value: videosCount || 0,
      icon: Video,
      description: '全講座の動画総数',
    },
    {
      title: 'ユーザー数',
      value: usersCount || 0,
      icon: Users,
      description: '登録ユーザーの総数',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="mt-2 text-muted-foreground">
          プラットフォームの概要と統計情報
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <a
            href="/admin/courses"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">講座を管理</p>
              <p className="text-sm text-muted-foreground">
                講座の追加・編集・削除
              </p>
            </div>
          </a>
          <a
            href="/admin/videos"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">動画を管理</p>
              <p className="text-sm text-muted-foreground">
                動画の追加・編集・削除
              </p>
            </div>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
