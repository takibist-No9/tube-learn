import { createClient } from '@/lib/supabase/server';
import { CourseTable } from '@/components/admin/course-table';
import { CreateCourseButton } from '@/components/admin/create-course-button';

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">講座管理</h1>
          <p className="mt-2 text-muted-foreground">
            講座の作成、編集、削除を行います
          </p>
        </div>
        <CreateCourseButton />
      </div>

      <CourseTable courses={courses || []} />
    </div>
  );
}
