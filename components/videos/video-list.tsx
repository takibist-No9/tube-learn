import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import type { Video } from '@/types/database.types';

interface VideoListProps {
  videos: Video[];
  courseId: string;
}

export function VideoList({ videos, courseId }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <PlayCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="mt-4 text-lg font-medium">動画がまだありません</p>
        <p className="mt-1 text-sm text-muted-foreground">
          この講座にはまだ動画が追加されていません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {videos.map((video, index) => (
        <Link
          key={video.id}
          href={`/courses/${courseId}/videos/${video.id}`}
          className="group block"
        >
          <Card className="border-0 bg-card shadow-sm transition-all duration-200 hover:-translate-x-1 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
                    {video.title}
                  </h3>
                </div>
              </div>
              <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-muted-foreground"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
