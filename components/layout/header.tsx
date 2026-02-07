import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { UserNav } from '@/components/auth/user-nav';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 管理者権限の確認
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.is_admin || false;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-primary-foreground"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">TubeLearn</span>
        </Link>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin" className="gap-2">
                <Settings className="h-4 w-4" />
                管理画面
              </Link>
            </Button>
          )}
          {user ? (
            <UserNav />
          ) : (
            <Button asChild size="sm" className="rounded-full px-6">
              <Link href="/login">ログイン</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
