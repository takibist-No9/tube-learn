'use client';

import { useState } from 'react';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EditVideoDialog } from './edit-video-dialog';
import { DeleteVideoDialog } from './delete-video-dialog';
import type { Video } from '@/types/database.types';

interface VideoWithCourse extends Video {
  courses?: {
    title: string;
  } | {
    title: string;
  }[] | null;
}

interface Course {
  id: string;
  title: string;
}

interface VideoTableProps {
  videos: VideoWithCourse[];
  courses: Course[];
}

export function VideoTable({ videos, courses }: VideoTableProps) {
  const [editingVideo, setEditingVideo] = useState<VideoWithCourse | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>講座</TableHead>
              <TableHead>タイトル</TableHead>
              <TableHead>表示順</TableHead>
              <TableHead>YouTube URL</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  動画がありません
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => {
                const courseData = Array.isArray(video.courses)
                  ? video.courses[0]
                  : video.courses;
                const courseTitle = courseData?.title || '不明な講座';

                return (
                  <TableRow key={video.id}>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {courseTitle}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell>{video.order}</TableCell>
                    <TableCell>
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        YouTube <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingVideo(video)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingVideoId(video.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editingVideo && (
        <EditVideoDialog
          video={editingVideo}
          courses={courses}
          open={!!editingVideo}
          onOpenChange={(open) => !open && setEditingVideo(null)}
        />
      )}

      {deletingVideoId && (
        <DeleteVideoDialog
          videoId={deletingVideoId}
          open={!!deletingVideoId}
          onOpenChange={(open) => !open && setDeletingVideoId(null)}
        />
      )}
    </>
  );
}
