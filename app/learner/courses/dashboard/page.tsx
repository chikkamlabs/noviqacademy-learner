'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Radio,
  Tag,
  Hash,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import CourseBoard from '@/components/learner/courseboard';
import {
  getLearnerBoughtCourses,
  LearnerBoughtCourse,
  formatBatchDate,
} from '@/lib/learnercourses';

export default function LearnerCoursesDashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<LearnerBoughtCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchForBoard, setSelectedBatchForBoard] =
    useState<LearnerBoughtCourse | null>(null);

  useEffect(() => {
    async function loadBoughtCourses() {
      setLoading(true);
      const data = await getLearnerBoughtCourses();
      setCourses(data);
      setLoading(false);
    }
    loadBoughtCourses();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-soft-cream">
      {/* 1. Header Attached */}
      <LearnerHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pure-white border border-soft-orange/50 text-xs font-semibold text-primary-orange uppercase tracking-wider mb-2 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Enrolled Curriculum</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-black tracking-tight">
              My Courses
            </h1>
            <p className="text-xs sm:text-sm text-dark-black/70 mt-1">
              Courses you have enrolled in with scheduled batches and live sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-pure-white border border-soft-orange/40 text-dark-black shadow-2xs">
              {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>
        </div>

        {/* Courses List - Display each course in 2 rows, not in box */}
        {loading ? (
          <div className="py-20 text-center text-sm text-dark-black/60 font-medium bg-pure-white rounded-2xl border border-soft-cream shadow-xs">
            Loading your courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-soft-cream flex items-center justify-center text-primary-orange mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-dark-black">No Courses Bought Yet</h3>
            <p className="text-xs sm:text-sm text-dark-black/70 mt-1.5 max-w-sm mx-auto">
              You have not enrolled in any courses yet. Explore our premier catalog to accelerate your career.
            </p>
            <Link
              href="/learner/explorecourses"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-primary-orange text-pure-white rounded-lg hover:bg-soft-orange hover:text-dark-black text-sm font-bold transition-all shadow-xs"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course, idx) => {
              const formattedDate = formatBatchDate(course.start_date);
              const targetBatchId = course.batch_id || course.batch_code || '';

              return (
                <div
                  key={`${course.registration_id}-${idx}`}
                  onClick={() => router.push(`/learner/study/dashboard?id=${encodeURIComponent(targetBatchId)}`)}
                  className="bg-pure-white rounded-2xl border-2 border-soft-cream hover:border-primary-orange shadow-xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4 cursor-pointer group"
                >
                  {/* ============================================================== */}
                  {/* 1st ROW: Course Title & Course topics (from course_topics only) */}
                  {/* ============================================================== */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-soft-cream/80">
                    {/* Course Title */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-dark-black group-hover:text-primary-orange transition-colors leading-snug">
                        {course.course_title}
                      </h2>
                    </div>

                    {/* Course topics (use from course_topics, no dummy data) */}
                    {course.course_topics && course.course_topics.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <Tag className="w-3.5 h-3.5 text-primary-orange hidden sm:inline" />
                        {course.course_topics.map((topic, tIdx) => (
                          <span
                            key={`${topic}-${tIdx}`}
                            className="px-2.5 py-1 rounded-md bg-soft-cream text-dark-black text-xs font-semibold border border-soft-orange/30"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* ============================================================== */}
                  {/* 2nd ROW: Batch id, Batch time, Batch board button, Start date  */}
                  {/* ============================================================== */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                    {/* Left: Batch ID, Batch Time, Course will start from start_date */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs text-dark-black">
                      {/* Batch ID */}
                      <div className="inline-flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-primary-orange" />
                        <span className="text-dark-black/60 font-medium">Batch ID:</span>
                        <span className="font-bold text-dark-black bg-soft-cream px-2 py-0.5 rounded-sm border border-soft-orange/30 font-mono">
                          {course.batch_code || course.batch_id}
                        </span>
                      </div>

                      {/* Batch Time */}
                      <div className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary-orange" />
                        <span className="text-dark-black/60 font-medium">Batch Time:</span>
                        <span className="font-bold text-dark-black">
                          {course.time_display}
                        </span>
                      </div>

                      {/* Course will start from start_date */}
                      <div className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary-orange" />
                        <span className="font-semibold text-dark-black">
                          Course will start from{' '}
                          <span className="text-primary-orange font-bold">
                            {course.start_date || formattedDate}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Batch board button */}
                    <div className="shrink-0 flex items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBatchForBoard(course);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span>Batch Board</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Over-the-screen CourseBoard Modal */}
      {selectedBatchForBoard && (
        <CourseBoard
          isOpen={!!selectedBatchForBoard}
          onClose={() => setSelectedBatchForBoard(null)}
          batchId={selectedBatchForBoard.batch_id}
          batchUuid={selectedBatchForBoard.batch_uuid}
          batchCode={selectedBatchForBoard.batch_code}
          courseTitle={selectedBatchForBoard.course_title}
        />
      )}

      {/* 2. Bottom Navigation Attached */}
      <LearnerBottomNavigation />
    </div>
  );
}
