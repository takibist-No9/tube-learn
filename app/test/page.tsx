import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function TestPage() {
  const supabase = await createClient();

  // 認証状態の確認
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // データベース接続テスト（courses テーブルの件数を取得）
  const { count: coursesCount, error: coursesError } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });

  // videos テーブルの件数を取得
  const { count: videosCount, error: videosError } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true });

  // profiles テーブルの件数を取得
  const { count: profilesCount, error: profilesError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Supabaseクライアント 動作確認</h1>
          <p className="text-muted-foreground">
            Server Component でのデータベース接続テスト
          </p>
        </div>

        {/* 認証状態 */}
        <Card>
          <CardHeader>
            <CardTitle>認証状態</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <Badge variant="default">ログイン済み</Badge>
                <div className="text-sm">
                  <p>
                    <strong>ユーザーID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>メール:</strong> {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <Badge variant="secondary">未ログイン</Badge>
            )}
          </CardContent>
        </Card>

        {/* データベース接続状態 */}
        <Card>
          <CardHeader>
            <CardTitle>データベース接続</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>接続成功</AlertTitle>
              <AlertDescription>
                Supabaseデータベースに正常に接続できています。
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  {coursesError ? (
                    <Badge variant="destructive">エラー</Badge>
                  ) : (
                    <div>
                      <p className="text-3xl font-bold">{coursesCount ?? 0}</p>
                      <p className="text-sm text-muted-foreground">件</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  {videosError ? (
                    <Badge variant="destructive">エラー</Badge>
                  ) : (
                    <div>
                      <p className="text-3xl font-bold">{videosCount ?? 0}</p>
                      <p className="text-sm text-muted-foreground">件</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  {profilesError ? (
                    <Badge variant="destructive">エラー</Badge>
                  ) : (
                    <div>
                      <p className="text-3xl font-bold">{profilesCount ?? 0}</p>
                      <p className="text-sm text-muted-foreground">件</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* 環境変数チェック */}
        <Card>
          <CardHeader>
            <CardTitle>環境変数</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_URL</p>
              <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'default' : 'destructive'}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </p>
              <Badge
                variant={
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? 'default'
                    : 'destructive'
                }
              >
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                  ? '設定済み'
                  : '未設定'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
