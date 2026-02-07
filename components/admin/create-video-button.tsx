'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoFormDialog } from './video-form-dialog';

interface Course {
  id: string;
  title: string;
}

interface CreateVideoButtonProps {
  courses: Course[];
}

export function CreateVideoButton({ courses }: CreateVideoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        新規動画追加
      </Button>

      <VideoFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        courses={courses}
      />
    </>
  );
}
