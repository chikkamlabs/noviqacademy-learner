'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  X,
  Menu,
  GraduationCap,
  HelpCircle,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import StudySidebar from '@/components/study/sidebar';
import {
  getBatchExams,
  BatchExamItem,
  formatScheduleDateTime,
} from '@/lib/batchexamsStore';
import { startExamSession } from '@/lib/studyexams';

function ExamsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchIdParam = searchParams.get('id');
  const queryString = searchParams?.toString();

  const [exams, setExams] = useState<BatchExamItem[]>([]);
  const [totalActiveCount, setTotalActiveCount] = useState<number>(0);
  const [batchCode, setBatchCode] = useState<string>('');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Start Exam Confirmation Dialog State
  const [selectedExamToStart, setSelectedExamToStart] = useState<BatchExamItem | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  // Track which exam descriptions are opened on tap
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getBatchExams(batchIdParam);
        if (isMounted) {
          setExams(data.exams);
          setTotalActiveCount(data.totalActiveCount);
          if (data.batchCode) setBatchCode(data.batchCode);
          if (data.courseTitle) setCourseTitle(data.courseTitle);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error fetching batch exams:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [batchIdParam]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter exams strictly by Title (Title of the Exam) and status = true
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesStatus = exam.status === true;
      const matchesSearch =
        searchQuery.trim() === '' ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesStatus && matchesSearch;
    });
  }, [exams, searchQuery]);

  // Helper to format short description (3-5 words)
  const renderDescription = (exam: BatchExamItem) => {
    const rawDesc = exam.description?.trim() || '';
    if (!rawDesc) {
      return (
        <span className="text-xs text-dark-black/40 italic">
          No description provided for this exam.
        </span>
      );
    }

    const words = rawDesc.split(/\s+/);
    const isLong = words.length > 5;
    const isExpanded = !!expandedIds[exam.id];

    if (!isLong) {
      return (
        <p className="text-xs sm:text-sm text-dark-black/80 font-normal leading-relaxed">
          {rawDesc}
        </p>
      );
    }

    const shortText = words.slice(0, 5).join(' ');

    return (
      <div className="space-y-1">
        <p
          onClick={() => toggleExpand(exam.id)}
          className="text-xs sm:text-sm text-dark-black/80 font-normal leading-relaxed cursor-pointer select-none group inline-block"
          title="Tap to display full description"
        >
          {isExpanded ? rawDesc : `${shortText}...`}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(exam.id);
            }}
            className="ml-2 inline-flex items-center gap-0.5 text-xs font-bold text-primary-orange hover:underline cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="w-3.5 h-3.5 inline" />
              </>
            ) : (
              <>
                <span>Read more</span>
                <ChevronDown className="w-3.5 h-3.5 inline" />
              </>
            )}
          </button>
        </p>
      </div>
    );
  };

  const backHref = queryString
    ? `/learner/study/dashboard?${queryString}`
    : '/learner/study/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-soft-cream">
      {/* 1. Learner Header */}
      <LearnerHeader />

      {/* Main Study Layout: Sidebar on Left + Exams Content on Right */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar & Mobile Drawer */}
        <StudySidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem="exams"
        />

        {/* Exams Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* STATIC TOP BAR */}
          <div className="sticky top-16 sm:top-20 z-20 bg-soft-cream/95 backdrop-blur-md border-b border-soft-orange/30 shadow-2xs">
            <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  className="lg:hidden p-2 rounded-xl bg-pure-white border border-soft-cream text-dark-black hover:text-primary-orange hover:border-primary-orange/40 transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Toggle study navigation menu"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-primary-orange" />
                </button>

                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl bg-pure-white border border-soft-cream text-xs sm:text-sm font-bold text-dark-black hover:text-primary-orange hover:border-primary-orange/40 transition-all shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-orange" />
                  <span>Go to study dashboard</span>
                </Link>
              </div>

              {batchCode && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pure-white border border-soft-cream text-xs font-mono font-bold text-dark-black shadow-2xs">
                  <span className="text-primary-orange">Batch:</span>
                  <span>{batchCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-48 sm:pb-56 space-y-6">
            {/* Header & Total Exams Card */}
            <div className="bg-pure-white rounded-2xl border-2 border-soft-cream shadow-xs p-5 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soft-cream">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-cream border border-soft-orange/40 text-[11px] font-bold text-primary-orange uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Batch Assessments</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-dark-black tracking-tight">
                    Batch Exams
                  </h1>
                  {courseTitle && (
                    <p className="text-xs sm:text-sm text-dark-black/70">
                      Evaluations, quizzes, and tests assigned to {courseTitle}
                    </p>
                  )}
                </div>

                {/* Total Exams(Count status = true) */}
                <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-soft-cream/80 border border-soft-orange/40 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-orange text-pure-white flex items-center justify-center font-extrabold text-lg shadow-2xs">
                    {totalActiveCount}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-dark-black/60 uppercase tracking-wider block">
                      Total Exams
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-dark-black">
                      Active In Batch
                    </span>
                  </div>
                </div>
              </div>

              {/* Search bar(Title of the Exam) */}
              <div className="relative">
                <Search className="w-4 h-4 text-dark-black/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exams by title..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-soft-cream/50 border border-soft-cream text-xs sm:text-sm text-dark-black placeholder:text-dark-black/45 focus:outline-none focus:border-primary-orange/50 focus:bg-pure-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-dark-black/40 hover:text-dark-black hover:bg-soft-cream transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Batch Exams with status=true */}
            {loading ? (
              <div className="py-20 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs space-y-2">
                <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs sm:text-sm text-dark-black/60 font-semibold">
                  Loading active batch exams...
                </p>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-soft-cream text-primary-orange flex items-center justify-center mx-auto">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-dark-black">
                  {searchQuery ? 'No matching exams found' : 'No Data Found'}
                </h3>
                <p className="text-xs text-dark-black/65 leading-relaxed">
                  {searchQuery
                    ? `No active exams match "${searchQuery}". Try a different keyword.`
                    : 'No active exams found for this batch.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-soft-cream text-xs font-bold text-primary-orange hover:bg-soft-orange/30 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Search</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExams.map((exam) => {
                  return (
                    <div
                      key={exam.id}
                      className="bg-pure-white rounded-2xl border border-soft-cream hover:border-soft-orange/40 transition-all p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      {/* Left: Icon, Title & type, Description (Show first 3-5 words then Open on tap Display there only), total_q */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-soft-cream border border-soft-orange/30 flex items-center justify-center shrink-0 mt-0.5 text-primary-orange">
                          <FileQuestion className="w-5 h-5" />
                        </div>

                        <div className="space-y-2 min-w-0 flex-1">
                          {/* Title & type */}
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-dark-black tracking-tight">
                              {exam.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md bg-soft-cream border border-soft-orange/40 text-[10px] font-mono font-bold uppercase tracking-wider text-primary-orange shrink-0">
                              {exam.type || 'MCQ Exam'}
                            </span>
                          </div>

                          {/* Description (Show first 3-5 words then Open on tap Display there only) */}
                          <div>
                            {renderDescription(exam)}
                          </div>

                          {/* Schedule & Metrics: total_q, duration, start_time, end_time */}
                          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-dark-black/75">
                            {/* total_q */}
                            <span className="inline-flex items-center gap-1 font-semibold bg-soft-cream/60 px-2.5 py-1 rounded-lg border border-soft-cream">
                              <HelpCircle className="w-3.5 h-3.5 text-primary-orange" />
                              <span>{exam.total_q} Questions</span>
                            </span>

                            {/* duration */}
                            <span className="inline-flex items-center gap-1 font-semibold bg-soft-cream/60 px-2.5 py-1 rounded-lg border border-soft-cream">
                              <Clock className="w-3.5 h-3.5 text-primary-orange" />
                              <span>Duration: {exam.duration ? `${exam.duration} mins` : 'TBA'}</span>
                            </span>

                            {/* start_time */}
                            <span className="inline-flex items-center gap-1 font-semibold bg-soft-cream/60 px-2.5 py-1 rounded-lg border border-soft-cream">
                              <Calendar className="w-3.5 h-3.5 text-primary-orange" />
                              <span>Start: {formatScheduleDateTime(exam.start_time)}</span>
                            </span>

                            {/* end_time */}
                            <span className="inline-flex items-center gap-1 font-semibold bg-soft-cream/60 px-2.5 py-1 rounded-lg border border-soft-cream">
                              <Calendar className="w-3.5 h-3.5 text-primary-orange" />
                              <span>End: {formatScheduleDateTime(exam.end_time)}</span>
                            </span>

                            {/* conduct status indicator */}
                            {exam.conduct ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Conducted</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                                <Clock className="w-3 h-3" />
                                <span>Not Conducted</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Start Exam (Only allow to tap Start Exam if batch_exams.conduct = true) */}
                      <div className="sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-soft-cream">
                        {exam.conduct ? (
                          <button
                            type="button"
                            onClick={() => setSelectedExamToStart(exam)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-95 w-full sm:w-auto"
                            aria-label={`Start exam ${exam.title}`}
                            title="Start Exam Session"
                          >
                            <Play className="w-4 h-4 shrink-0 fill-current" />
                            <span>Start Exam</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-dark-black/10 text-dark-black/40 text-xs sm:text-sm font-bold border border-soft-cream cursor-not-allowed select-none opacity-80 w-full sm:w-auto"
                            aria-label={`Exam ${exam.title} is not yet conducted`}
                            title="This exam cannot be started until it is conducted (conduct = true)"
                          >
                            <Lock className="w-4 h-4 shrink-0" />
                            <span>Start Exam</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom clearance buffer so last exam card is fully visible above fixed bottom bar */}
            <div className="h-16 sm:h-20" aria-hidden="true" />
          </main>
        </div>
      </div>

      {/* Confirmation Modal: Start Exam Confirmation Dialog */}
      {selectedExamToStart && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/65 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isStarting) {
              setSelectedExamToStart(null);
            }
          }}
        >
          <div className="relative w-full max-w-md bg-pure-white rounded-2xl border-2 border-soft-cream shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-soft-cream border border-soft-orange/30 text-primary-orange flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-base sm:text-lg font-extrabold text-dark-black">
                  Start Exam Confirmation
                </h3>
                <p className="text-xs text-dark-black/70 leading-relaxed">
                  Are you sure you want to start this assessment session now?
                </p>
              </div>
            </div>

            {/* Exam brief details */}
            <div className="p-3.5 rounded-xl bg-soft-cream/60 border border-soft-orange/30 space-y-2">
              <p className="text-xs sm:text-sm font-bold text-dark-black line-clamp-2">
                {selectedExamToStart.title}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dark-black/70">
                <span>{selectedExamToStart.total_q} Questions</span>
                {selectedExamToStart.duration && (
                  <span>• {selectedExamToStart.duration} Minutes</span>
                )}
              </div>
            </div>

            <p className="text-xs text-dark-black/60 leading-relaxed">
              Once you confirm, a new exam session record will be created and your answers will be tracked.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-soft-cream">
              <button
                type="button"
                disabled={isStarting}
                onClick={() => setSelectedExamToStart(null)}
                className="px-4 py-2 rounded-xl bg-soft-cream hover:bg-soft-orange/30 text-dark-black text-xs sm:text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isStarting}
                onClick={async () => {
                  setIsStarting(true);
                  try {
                    const res = await startExamSession(
                      selectedExamToStart.exam_id,
                      batchIdParam || selectedExamToStart.batch_id
                    );
                    setSelectedExamToStart(null);
                    setIsStarting(false);
                    router.push(
                      `/learner/study/openexam?exam_id=${selectedExamToStart.exam_id}&id=${
                        batchIdParam || selectedExamToStart.batch_id
                      }&conducted_id=${res.conducted_id}`
                    );
                  } catch (err) {
                    console.warn('Error starting exam:', err);
                    setIsStarting(false);
                    setSelectedExamToStart(null);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isStarting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-pure-white border-t-transparent rounded-full animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Yes, Start Exam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Learner Bottom Navigation */}
      <LearnerBottomNavigation />
    </div>
  );
}

export default function StudyExamsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ExamsPageContent />
    </Suspense>
  );
}
