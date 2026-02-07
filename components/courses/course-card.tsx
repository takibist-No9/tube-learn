import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/types/database.types';

const difficultyLabels = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
} as const;

const difficultyConfig = {
  beginner: {
    label: '初級',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  intermediate: {
    label: '中級',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  advanced: {
    label: '上級',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
} as const;

interface CourseCardProps {
  course: Course;
  priority?: boolean;
}

export function CourseCard({ course, priority = false }: CourseCardProps) {
  const difficulty = difficultyConfig[course.difficulty as keyof typeof difficultyConfig];

  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <Card className="h-full overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
            />
            {course.is_free && (
              <div className="absolute left-3 top-3">
                <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                  無料
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
        </CardContent>
        <CardFooter className="px-5 pb-5 pt-0">
          <Badge
            variant="outline"
            className={`font-medium ${difficulty.className}`}
          >
            {difficulty.label}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
