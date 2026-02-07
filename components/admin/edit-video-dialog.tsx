'use client';

import { VideoFormDialog } from './video-form-dialog';
import type { Video } from '@/types/database.types';

interface Course {
  id: string;
  title: string;
}

interface EditVideoDialogProps {
  video: Video;
  courses: Course[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVideoDialog({
  video,
  courses,
  open,
  onOpenChange,
}: EditVideoDialogProps) {
  return (
    <VideoFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      courses={courses}
      video={video}
    />
  );
}
