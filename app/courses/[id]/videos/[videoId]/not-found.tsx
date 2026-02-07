import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-muted-foreground"
            >
              <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
              <rect x="2" y="6" width="14" height="12" rx="2" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          動画が見つかりません
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          お探しの動画は存在しないか、削除された可能性があります。
        </p>
        <Button asChild className="mt-8 rounded-full px-8">
          <Link href="/">トップページに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
