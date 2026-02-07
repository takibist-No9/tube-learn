'use client';

import { CourseFormDialog } from './course-form-dialog';
import type { Course } from '@/types/database.types';

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
}

export function EditCourseDialog({
  open,
  onOpenChange,
  course,
}: EditCourseDialogProps) {
  return (
    <CourseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      course={course}
    />
  );
}
