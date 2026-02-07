'use client';

import { useEffect, useState } from 'react';
import type { Video } from '@/types/database.types';

interface YouTubePlayerProps {
  video: Video;
}

// YouTube URLからビデオIDを抽出する関数
function extractVideoId(url: string): string | null {
  // 様々なYouTube URL形式に対応
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function YouTubePlayer({ video }: YouTubePlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    const id = extractVideoId(video.youtube_url);
    setVideoId(id);
  }, [video.youtube_url]);

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border bg-muted">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted-foreground/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-muted-foreground"
              >
                <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
                <rect x="2" y="6" width="14" height="12" rx="2" />
              </svg>
            </div>
          </div>
          <p className="font-medium text-muted-foreground">
            動画を読み込めませんでした
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            YouTube URLが正しくありません
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border shadow-lg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
