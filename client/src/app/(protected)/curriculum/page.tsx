'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Course } from '@/types';
import { BookOpen, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CurriculumPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then((res) => {
      setCourses(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--slate-800)]">Curriculum</h1>
          <p className="mt-1 text-sm text-[var(--slate-400)]">14-week Data Science Residency Program</p>
        </div>
        {user?.role !== 'INTERN' && (
          <Link
            href="/curriculum/new"
            className="flex items-center gap-2 rounded-lg bg-[var(--primary-400)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/curriculum/${course.id}`}
            className="flex items-center justify-between glass-card p-5 transition hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-50)]">
                <BookOpen className="h-6 w-6 text-[var(--primary-400)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[var(--slate-50)] px-2.5 py-0.5 text-xs font-medium text-[var(--slate-500)]">
                    Week {course.weekNumber}
                  </span>
                  {course.category && (
                    <span className="rounded-full bg-[var(--primary-50)] px-2.5 py-0.5 text-xs font-medium text-[var(--primary-400)]">
                      {course.category}
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-[var(--slate-800)]">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-0.5 text-xs text-[var(--slate-400)]">{course.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--slate-300)]">
                {course._count?.modules || 0} modules
              </span>
              <ChevronRight className="h-5 w-5 text-[var(--slate-300)]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
