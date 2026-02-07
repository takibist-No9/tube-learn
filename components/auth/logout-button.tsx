'use client';

import { Button } from '@/components/ui/button';
import { signOut } from '@/app/actions/auth';

export function LogoutButton() {
  return (
    <Button onClick={() => signOut()} variant="ghost" className="w-full justify-start">
      ログアウト
    </Button>
  );
}
