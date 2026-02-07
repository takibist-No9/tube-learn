'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EditCourseDialog } from './edit-course-dialog';
import { DeleteCourseDialog } from './delete-course-dialog';
import type { Course } from '@/types/database.types';

interface CourseTableProps {
  courses: Course[];
}

const difficultyLabels = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
} as const;

export function CourseTable({ courses }: CourseTableProps) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>難易度</TableHead>
              <TableHead>公開状態</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  講座がありません
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    {difficultyLabels[course.difficulty as keyof typeof difficultyLabels]}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        course.is_free
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {course.is_free ? '無料' : '会員限定'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {course.created_at
                      ? new Date(course.created_at).toLocaleDateString('ja-JP')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCourse(course)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingCourse(course)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingCourse && (
        <EditCourseDialog
          open={!!editingCourse}
          onOpenChange={(open) => !open && setEditingCourse(null)}
          course={editingCourse}
        />
      )}

      {deletingCourse && (
        <DeleteCourseDialog
          open={!!deletingCourse}
          onOpenChange={(open) => !open && setDeletingCourse(null)}
          course={deletingCourse}
        />
      )}
    </>
  );
}
