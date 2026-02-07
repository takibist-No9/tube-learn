'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Button onClick={handleLogin} className="w-full">
      Googleでログイン
    </Button>
  );
}
