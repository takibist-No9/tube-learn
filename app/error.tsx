'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">エラーが発生しました</h2>
        <p className="mb-6 text-muted-foreground">
          申し訳ございません。問題が発生しました。
        </p>
        <Button onClick={() => reset()}>再試行</Button>
      </div>
    </div>
  );
}
