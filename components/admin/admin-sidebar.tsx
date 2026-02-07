'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, BookOpen, Video, Home } from 'lucide-react';

const routes = [
  {
    label: 'ダッシュボード',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    label: '講座管理',
    icon: BookOpen,
    href: '/admin/courses',
  },
  {
    label: '動画管理',
    icon: Video,
    href: '/admin/videos',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-muted/40">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">管理画面</span>
        </Link>
      </div>
      <div className="flex-1 space-y-4 p-4">
        <div className="space-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link key={route.href} href={route.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start transition-colors',
                    isActive && 'bg-secondary shadow-sm'
                  )}
                >
                  <route.icon className="mr-3 h-4 w-4" />
                  {route.label}
                </Button>
              </Link>
            );
          })}
        </div>
        <Separator />
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-3 h-4 w-4" />
            トップページに戻る
          </Button>
        </Link>
      </div>
    </aside>
  );
}
