import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/types/database.types';

const difficultyConfig = {
  beginner: {
    label: '初級',
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  intermediate: {
    label: '中級',
    className:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  advanced: {
    label: '上級',
    className:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
} as const;

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const difficulty =
    difficultyConfig[course.difficulty as keyof typeof difficultyConfig];

  return (
    <div className="space-y-8">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-muted shadow-lg">
        <Image
          src={course.thumbnail_url}
          alt={course.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`font-medium ${difficulty.className}`}>
            {difficulty.label}
          </Badge>
          {course.is_free && (
            <Badge className="bg-primary/90 text-primary-foreground">無料</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          {course.title}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {course.description}
        </p>
      </div>
    </div>
  );
}
