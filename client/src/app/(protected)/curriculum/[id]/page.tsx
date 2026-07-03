'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { ChevronLeft, Plus, FileText, ExternalLink, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

interface Lesson { id: string; title: string; contentType: string; fileUrl?: string | null; content?: string | null; }
interface Module { id: string; title: string; description?: string | null; order?: number | null; _count?: { lessons: number }; }
interface Course { id: string; title: string; description?: string | null; weekNumber: number; category?: string | null; modules: Module[]; }

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user } = useAuthStore();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MENTOR';

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

  const [expanded, setExpanded] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [lessonForm, setLessonForm] = useState({ title: '', fileUrl: '' });
  const [showLessonFor, setShowLessonFor] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    const { data } = await api.get(`/courses/${courseId}`);
    setCourse(data.data);
    setLoading(false);
  }, [courseId]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/modules', {
      courseId,
      title: moduleForm.title,
      description: moduleForm.description || undefined,
      order: (course?.modules.length || 0) + 1,
    });
    setModuleForm({ title: '', description: '' });
    setShowModuleForm(false);
    await loadCourse();
  }

  async function deleteModule(id: string) {
    if (!confirm('Delete this module and its links?')) return;
    await api.delete(`/modules/${id}`);
    await loadCourse();
  }

  async function toggleModule(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!lessons[id]) {
      const { data } = await api.get(`/modules/${id}`);
      setLessons((p) => ({ ...p, [id]: data.data.lessons || [] }));
    }
  }

  async function addLesson(e: React.FormEvent, moduleId: string) {
    e.preventDefault();
    await api.post('/lessons', {
      moduleId,
      title: lessonForm.title,
      contentType: 'PDF',
      fileUrl: lessonForm.fileUrl,
      order: (lessons[moduleId]?.length || 0) + 1,
    });
    setLessonForm({ title: '', fileUrl: '' });
    setShowLessonFor(null);
    const { data } = await api.get(`/modules/${moduleId}`);
    setLessons((p) => ({ ...p, [moduleId]: data.data.lessons || [] }));
    await loadCourse();
  }

  async function deleteLesson(lessonId: string, moduleId: string) {
    if (!confirm('Delete this link?')) return;
    await api.delete(`/lessons/${lessonId}`);
    const { data } = await api.get(`/modules/${moduleId}`);
    setLessons((p) => ({ ...p, [moduleId]: data.data.lessons || [] }));
    await loadCourse();
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }
  if (!course) {
    return <div className="p-6"><Link href="/curriculum" className="text-blue-600">← Back</Link><p className="mt-4 text-gray-500">Course not found.</p></div>;
  }

  return (
    <div>
      <Link href="/curriculum" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft className="h-4 w-4" /> Back to Curriculum
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Week {course.weekNumber}</span>
            {course.category && <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">{course.category}</span>}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{course.title}</h1>
          {course.description && <p className="mt-1 text-sm text-gray-500">{course.description}</p>}
        </div>
        {canEdit && (
          <button onClick={() => setShowModuleForm(!showModuleForm)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add Module
          </button>
        )}
      </div>

      {showModuleForm && canEdit && (
        <form onSubmit={addModule} className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-3">
            <input type="text" placeholder="Module title (e.g. Introduction to Pandas)" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2 text-sm" required />
            <input type="text" placeholder="Short description (optional)" value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2 text-sm" />
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Create Module</button>
        </form>
      )}

      <div className="space-y-3">
        {course.modules.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-400">No modules yet.{canEdit ? ' Click "Add Module" to start.' : ''}</p>}
        {course.modules.map((mod) => (
          <div key={mod.id} className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between p-4">
              <button onClick={() => toggleModule(mod.id)} className="flex flex-1 items-center gap-3 text-left">
                {expanded === mod.id ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{mod.title}</h3>
                  {mod.description && <p className="text-xs text-gray-500">{mod.description}</p>}
                </div>
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{mod._count?.lessons || 0} links</span>
                {canEdit && <button onClick={() => deleteModule(mod.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>}
              </div>
            </div>

            {expanded === mod.id && (
              <div className="border-t border-gray-100 px-4 py-3">
                <div className="space-y-2">
                  {(lessons[mod.id] || []).map((l) => (
                    <div key={l.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <a href={l.fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                        <FileText className="h-4 w-4" /> {l.title} <ExternalLink className="h-3 w-3" />
                      </a>
                      {canEdit && <button onClick={() => deleteLesson(l.id, mod.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>}
                    </div>
                  ))}
                  {(lessons[mod.id] || []).length === 0 && <p className="text-xs text-gray-400">No links in this module yet.</p>}
                </div>

                {canEdit && (
                  showLessonFor === mod.id ? (
                    <form onSubmit={(e) => addLesson(e, mod.id)} className="mt-3 flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
                      <input type="text" placeholder="Link title (e.g. Week 1 Slides)" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
                      <input type="url" placeholder="Google Drive link (https://drive.google.com/...)" value={lessonForm.fileUrl} onChange={(e) => setLessonForm({ ...lessonForm, fileUrl: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
                      <div className="flex gap-2">
                        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Add Link</button>
                        <button type="button" onClick={() => setShowLessonFor(null)} className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs text-gray-600">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => { setShowLessonFor(mod.id); setLessonForm({ title: '', fileUrl: '' }); }} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700">
                      <Plus className="h-3.5 w-3.5" /> Add Google Drive Link
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
