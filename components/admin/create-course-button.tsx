'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseFormDialog } from './course-form-dialog';

export function CreateCourseButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        新規講座作成
      </Button>

      <CourseFormDialog open={open} onOpenChange={setOpen} mode="create" />
    </>
  );
}
