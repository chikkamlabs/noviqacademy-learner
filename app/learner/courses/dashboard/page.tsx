'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Radio,
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  Trophy,
  Search,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import CourseBoard from '@/components/learner/courseboard';
import {
  getLearnerBoughtCourses,
  LearnerBoughtCourse,
  formatBatchDate,
} from '@/lib/learnercourses';
import { checkHasBatchBoard } from '@/lib/studyStore';

type BatchCategory = 'active' | 'upcoming' | 'completed';
type FilterTab = 'all' | BatchCategory;
type ViewMode = 'grid' | 'list';

function getBatchCategory(course: LearnerBoughtCourse): BatchCategory {
  const progress = Number(course.progress) || 0;
  const status = (course.status || '').toLowerCase();

  if (progress >= 100 || status === 'completed') {
    return 'completed';
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  if (course.end_date) {
    const end = new Date(course.end_date);
    if (!isNaN(end.getTime())) {
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      if (endDay < todayStart) {
        return 'completed';
      }
    }
  }

  if (course.start_date) {
    const start = new Date(course.start_date);
    if (!isNaN(start.getTime())) {
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      if (startDay > todayStart) {
        return 'upcoming';
      }
    }
  }

  return 'active';
}

function CourseThumbnail({
  src,
  alt,
  className = '',
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || src.trim() === '' || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-soft-cream to-soft-orange/30 text-primary-orange ${className}`}
      >
        <BookOpen className="w-7 h-7 opacity-80" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 96px, 112px"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
}

export default function LearnerCoursesDashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<LearnerBoughtCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableBoards, setAvailableBoards] = useState<Record<string, boolean>>({});
  const [selectedBatchForBoard, setSelectedBatchForBoard] =
    useState<LearnerBoughtCourse | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    async function loadBoughtCourses() {
      setLoading(true);
      const data = await getLearnerBoughtCourses();
      setCourses(data);
      setLoading(false);

      // Verify if batch board record exists for each batch
      const boardMap: Record<string, boolean> = {};
      for (const c of data) {
        const batchKey = c.batch_uuid || c.batch_id;
        if (batchKey && boardMap[batchKey] === undefined) {
          const hasBoard = await checkHasBatchBoard(batchKey);
          boardMap[batchKey] = hasBoard;
        }
      }
      setAvailableBoards(boardMap);
    }
    loadBoughtCourses();
  }, []);

  const categorizedCourses = useMemo(() => {
    return courses.map((course) => ({
      course,
      category: getBatchCategory(course),
    }));
  }, [courses]);

  const counts = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let completed = 0;
    for (const item of categorizedCourses) {
      if (item.category === 'active') active += 1;
      else if (item.category === 'upcoming') upcoming += 1;
      else if (item.category === 'completed') completed += 1;
    }
    return {
      total: courses.length,
      active,
      upcoming,
      completed,
    };
  }, [categorizedCourses, courses.length]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categorizedCourses.filter(({ course, category }) => {
      if (activeFilter !== 'all' && category !== activeFilter) {
        return false;
      }
      if (!q) return true;
      const titleMatch = course.course_title.toLowerCase().includes(q);
      const batchMatch = (course.batch_code || course.batch_id || '').toLowerCase().includes(q);
      return titleMatch || batchMatch;
    });
  }, [categorizedCourses, activeFilter, searchQuery]);

  const filterTabs: { id: FilterTab; label: string; count: number; icon: typeof LayoutGrid }[] = [
    { id: 'all', label: 'All Courses', count: counts.total, icon: LayoutGrid },
    { id: 'active', label: 'Active Batches', count: counts.active, icon: PlayCircle },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming, icon: Calendar },
    { id: 'completed', label: 'Completed', count: counts.completed, icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF8]">
      {/* 1. Header Attached */}
      <LearnerHeader />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-28 md:pb-14">
        {/* Top Hero Banner Area (Layout reference without top-right image) */}
        <section className="w-full bg-gradient-to-b from-[#FFF3E8] via-[#FFF9F3] to-[#FDFBF8] border-b border-soft-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-8 sm:pt-9 sm:pb-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-orange mb-2">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>My Learning Space</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-black tracking-tight">
                My Courses
              </h1>
              <p className="text-sm sm:text-base text-dark-black/70 mt-1.5 leading-relaxed">
                All the courses you&apos;re enrolled in, with scheduled batches, live sessions, and progress in one place.
              </p>
            </div>

            {/* Summary Metrics Strip: Enrolled, Active Batches, Upcoming, Completed */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 bg-pure-white rounded-2xl border border-soft-cream shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-soft-cream max-w-3xl overflow-hidden">
              <div className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] text-primary-orange flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-extrabold text-dark-black tabular-nums leading-tight">
                    {counts.total}
                  </p>
                  <p className="text-xs text-dark-black/65 font-medium truncate">
                    Enrolled Courses
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-extrabold text-dark-black tabular-nums leading-tight">
                    {counts.active}
                  </p>
                  <p className="text-xs text-dark-black/65 font-medium truncate">
                    Active Batches
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-extrabold text-dark-black tabular-nums leading-tight">
                    {counts.upcoming}
                  </p>
                  <p className="text-xs text-dark-black/65 font-medium truncate">
                    Upcoming
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-extrabold text-dark-black tabular-nums leading-tight">
                    {counts.completed}
                  </p>
                  <p className="text-xs text-dark-black/65 font-medium truncate">
                    Completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Toolbar & Courses Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-7">
          {/* Toolbar: Filter Tabs + Search + Grid/List Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-primary-orange text-pure-white shadow-xs'
                        : 'bg-pure-white text-dark-black/80 border border-soft-cream hover:border-primary-orange/50 hover:text-dark-black'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                    <span className="tabular-nums opacity-90">({tab.count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search & View Switcher */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64 lg:w-72">
                <Search className="w-4 h-4 text-dark-black/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your courses..."
                  aria-label="Search your courses"
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-pure-white border border-soft-cream text-xs sm:text-sm text-dark-black placeholder:text-dark-black/45 focus:outline-hidden focus:border-primary-orange transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-black/45 hover:text-dark-black cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div
                className="inline-flex items-center bg-pure-white border border-soft-cream rounded-xl p-1 shrink-0"
                role="group"
                aria-label="Layout view"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-primary-orange text-pure-white'
                      : 'text-dark-black/60 hover:text-dark-black'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-primary-orange text-pure-white'
                      : 'text-dark-black/60 hover:text-dark-black'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Courses Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-pure-white rounded-2xl border border-soft-cream p-5 space-y-4 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-xl bg-soft-cream shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-4 w-24 rounded bg-soft-cream" />
                      <div className="h-5 w-full rounded bg-soft-cream" />
                      <div className="h-3.5 w-3/4 rounded bg-soft-cream" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-soft-cream flex items-center justify-between gap-3">
                    <div className="h-2.5 w-28 rounded-full bg-soft-cream" />
                    <div className="h-9 w-28 rounded-xl bg-soft-cream" />
                  </div>
                </div>
              ))}
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
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-primary-orange text-pure-white rounded-xl hover:bg-soft-orange hover:text-dark-black text-sm font-bold transition-all shadow-xs"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-14 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto">
              <h3 className="text-base font-bold text-dark-black">No matching batches found</h3>
              <p className="text-xs sm:text-sm text-dark-black/65 mt-1">
                Try adjusting your filter tab or search query.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-soft-cream text-dark-black text-xs font-bold hover:bg-soft-orange/50 transition-colors cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'space-y-4'
              }
            >
              {filteredCourses.map(({ course, category }, idx) => {
                const formattedDate = formatBatchDate(course.start_date);
                const targetBatchId = course.batch_id || course.batch_code || '';
                const batchKey = course.batch_uuid || course.batch_id;
                const hasBoard = Boolean(availableBoards[batchKey]);
                const progress = Math.min(Math.max(Number(course.progress) || 0, 0), 100);

                const statusConfig =
                  category === 'completed'
                    ? {
                        label: 'Completed',
                        icon: CheckCircle2,
                        textClass: 'text-violet-700',
                        barClass: 'bg-violet-600',
                      }
                    : category === 'upcoming'
                    ? {
                        label: 'Upcoming',
                        icon: Calendar,
                        textClass: 'text-primary-orange',
                        barClass: 'bg-primary-orange',
                      }
                    : {
                        label: 'Active Batch',
                        icon: PlayCircle,
                        textClass: 'text-emerald-700',
                        barClass: 'bg-primary-orange',
                      };

                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={`${course.registration_id}-${idx}`}
                    onClick={() =>
                      router.push(`/learner/study/dashboard?id=${encodeURIComponent(targetBatchId)}`)
                    }
                    className={`bg-pure-white rounded-2xl border border-soft-cream hover:border-primary-orange shadow-xs hover:shadow-md transition-all p-4 sm:p-5 cursor-pointer group ${
                      viewMode === 'list'
                        ? 'flex flex-col md:flex-row md:items-center justify-between gap-5'
                        : 'flex flex-col justify-between gap-4'
                    }`}
                  >
                    {/* Top / Left: Thumbnail + Course & Batch Info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden border border-soft-cream shrink-0 bg-soft-cream">
                        <CourseThumbnail
                          src={course.preview_media_id}
                          alt={course.course_title}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Status Label */}
                        <div
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${statusConfig.textClass}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{statusConfig.label}</span>
                        </div>

                        {/* Course Title */}
                        <h2 className="text-base font-bold text-dark-black group-hover:text-primary-orange transition-colors leading-snug line-clamp-2">
                          {course.course_title}
                        </h2>

                        {/* Batch ID & Batch Time */}
                        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-dark-black/70 pt-0.5">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                            <span>
                              Batch:{' '}
                              <span className="font-mono font-semibold text-dark-black">
                                {course.batch_code || course.batch_id}
                              </span>
                            </span>
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                            <span className="font-medium text-dark-black/80">
                              {course.time_display}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom / Right: Progress (batches.progress) + Start Date + Actions */}
                    <div
                      className={
                        viewMode === 'list'
                          ? 'flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-4 md:w-[430px] shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-soft-cream/80'
                          : 'pt-3.5 border-t border-soft-cream/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3'
                      }
                    >
                      {/* Progress / Upcoming Start Date */}
                      <div className="flex-1 min-w-[140px] space-y-1.5">
                        {category === 'upcoming' && (
                          <p className="text-xs font-semibold text-dark-black/75">
                            Starts {formattedDate}
                          </p>
                        )}
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 h-2 bg-soft-cream rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${statusConfig.barClass}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-dark-black tabular-nums shrink-0">
                            {progress}%
                          </span>
                        </div>
                      </div>

                      {/* Actions: Batch Board + Open Course */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={!hasBoard}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasBoard) setSelectedBatchForBoard(course);
                          }}
                          title={
                            hasBoard
                              ? 'Open Batch Board'
                              : 'No batch board record available for this batch'
                          }
                          aria-label={
                            hasBoard
                              ? 'Open Batch Board'
                              : 'No batch board available'
                          }
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                            hasBoard
                              ? 'bg-soft-cream text-dark-black hover:bg-soft-orange/60 border border-soft-orange/40 cursor-pointer'
                              : 'bg-dark-black/5 text-dark-black/35 border border-soft-cream cursor-not-allowed'
                          }`}
                        >
                          <Radio className={`w-3.5 h-3.5 ${hasBoard ? 'text-primary-orange' : 'opacity-50'}`} />
                          <span>Board</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/learner/study/dashboard?id=${encodeURIComponent(targetBatchId)}`
                            );
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs font-bold transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Open Course</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
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

      {/* 2. Bottom Navigation Attached (Mobile only) */}
      <LearnerBottomNavigation />
    </div>
  );
}
