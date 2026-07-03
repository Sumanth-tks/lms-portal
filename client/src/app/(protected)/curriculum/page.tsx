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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curriculum</h1>
          <p className="mt-1 text-sm text-gray-500">14-week Data Science Residency Program</p>
        </div>
        {user?.role !== 'INTERN' && (
          <Link
            href="/curriculum/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    Week {course.weekNumber}
                  </span>
                  {course.category && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                      {course.category}
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-gray-900">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-0.5 text-xs text-gray-500">{course.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {course._count?.modules || 0} modules
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
