import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';
import type { Video } from '@/types/database.types';

interface VideoSidebarProps {
  videos: Video[];
  currentVideoId: string;
  courseId: string;
}

export function VideoSidebar({
  videos,
  currentVideoId,
  courseId,
}: VideoSidebarProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">講座の動画</CardTitle>
        <p className="text-sm text-muted-foreground">
          {videos.length}本の動画
        </p>
      </CardHeader>
      <CardContent className="space-y-1 px-3">
        {videos.map((video, index) => {
          const isCurrent = video.id === currentVideoId;

          return (
            <Link
              key={video.id}
              href={`/courses/${courseId}/videos/${video.id}`}
              className={cn(
                'group flex items-start gap-3 rounded-lg p-3 transition-all',
                isCurrent
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'hover:bg-muted/50'
              )}
            >
              <div className="flex shrink-0 pt-0.5">
                {isCurrent ? (
                  <div className="flex h-6 w-6 items-center justify-center">
                    <PlayCircle className="h-5 w-5 fill-current" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-xs font-semibold text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                    {index + 1}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p
                  className={cn(
                    'text-sm font-medium leading-tight transition-colors',
                    isCurrent
                      ? 'font-semibold'
                      : 'group-hover:text-foreground'
                  )}
                >
                  {video.title}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
