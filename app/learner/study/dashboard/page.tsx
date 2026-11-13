'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  BookOpen,
  Radio,
  Info,
  Clock,
  Hash,
  X,
  MessageSquare,
  Sparkles,
  Lock,
  Share2,
  Check,
  Menu,
  Video,
  FolderOpen,
  GraduationCap,
  PlaySquare,
  Bell,
  Zap,
  ExternalLink,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import StudySidebar from '@/components/study/sidebar';
import {
  getStudyDetails,
  getStudyBatchBoard,
  checkHasBatchBoard,
  StudyCourseDetails,
  StudyBatchBoardData,
} from '@/lib/studyStore';

function StudyDashboardContent() {
  const searchParams = useSearchParams();
  const batchIdParam = searchParams.get('id');
  const queryString = searchParams?.toString();
  const getStudyHref = (basePath: string) =>
    queryString ? `${basePath}?${queryString}` : basePath;

  const [course, setCourse] = useState<StudyCourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Batch Board Availability & Modal State
  const [hasBoardRecord, setHasBoardRecord] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [boardData, setBoardData] = useState<StudyBatchBoardData | null>(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleShareCourse = async () => {
    if (!course) return;
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/courses/opencourse?id=${course.course_id}`
        : `/courses/opencourse?id=${course.course_id}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: course.course_title,
          text: `Check out ${course.course_title} on Noviq Academy!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
        return;
      } catch (err) {
        console.warn('Clipboard write error:', err);
      }
    }

    window.open(`/courses/opencourse?id=${course.course_id}`, '_blank');
  };

  // Load study details strictly via lib/studyStore.ts
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const details = await getStudyDetails(batchIdParam);
        if (isMounted) {
          setCourse(details);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading study details:', err);
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

  // Check if any batch board record is available in batch_board table for this batch
  useEffect(() => {
    if (!course) return;
    let isMounted = true;
    async function checkBoard() {
      const hasRecord = await checkHasBatchBoard(
        course?.batch_uuid || course?.batch_id || course?.batch_code
      );
      if (isMounted) {
        setHasBoardRecord(hasRecord);
      }
    }
    checkBoard();
    return () => {
      isMounted = false;
    };
  }, [course]);

  // Load batch board data strictly via lib/studyStore.ts when modal opens
  useEffect(() => {
    if (!isBoardOpen || !course) return;

    let isMounted = true;
    async function loadBoard() {
      setBoardLoading(true);
      try {
        const data = await getStudyBatchBoard(
          course?.batch_uuid || course?.batch_id,
          course?.batch_code,
          course?.course_title
        );
        if (isMounted) {
          setBoardData(data);
          setBoardLoading(false);
        }
      } catch (err) {
        console.warn('Error loading batch board:', err);
        if (isMounted) {
          setBoardLoading(false);
        }
      }
    }

    loadBoard();

    return () => {
      isMounted = false;
    };
  }, [isBoardOpen, course]);

  // Auto-scroll messages
  useEffect(() => {
    if (isBoardOpen && !boardLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isBoardOpen, boardLoading, boardData?.messages]);

  const progress = Math.min(Math.max(Number(course?.progress) || 0, 0), 100);
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progress / 100) * ringCircumference;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF8]">
      {/* 1. Header Attached */}
      <LearnerHeader />

      {/* Main Study Layout: Sidebar on Left + Dashboard Content on Right */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar: Sticks to left, sticks top at header; Mobile Drawer */}
        <StudySidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem="home"
          batchProgress={course?.progress}
        />

        {/* Dashboard Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Hero Area (Layout reference without top-right image) */}
          <section className="w-full bg-gradient-to-b from-[#FFF3E8] via-[#FFF9F3] to-[#FDFBF8] border-b border-soft-cream">
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-7 sm:pt-6 sm:pb-8">
              {/* Top Row: Mobile Sidebar Toggle + Go to my courses */}
              <div className="flex items-center gap-2.5 mb-5">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  className="lg:hidden p-2 rounded-xl bg-pure-white border border-soft-cream text-dark-black hover:text-primary-orange hover:border-primary-orange/40 transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Toggle study navigation menu"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-primary-orange" />
                </button>

                <Link
                  href="/learner/courses/dashboard"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full bg-pure-white border border-soft-cream text-xs sm:text-sm font-bold text-dark-black hover:text-primary-orange hover:border-primary-orange/40 transition-all shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-orange" />
                  <span>Go to my courses</span>
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3 max-w-2xl animate-pulse">
                  <div className="h-5 w-36 rounded-md bg-soft-orange/30" />
                  <div className="h-8 w-3/4 rounded-lg bg-soft-orange/30" />
                  <div className="h-4 w-2/3 rounded bg-soft-orange/20" />
                </div>
              ) : !course ? (
                <div className="py-10 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg">
                  <h3 className="text-lg font-bold text-dark-black">No Course Found</h3>
                  <p className="text-xs sm:text-sm text-dark-black/70 mt-1">
                    Please select a course from your enrolled curriculum.
                  </p>
                  <Link
                    href="/learner/courses/dashboard"
                    className="inline-block mt-4 px-4 py-2 bg-primary-orange text-pure-white rounded-lg text-xs font-bold"
                  >
                    Go to my courses
                  </Link>
                </div>
              ) : (
                <>
                  {/* Enrolled Course Heading */}
                  <div className="max-w-3xl space-y-2.5">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-primary-orange">
                      <span className="inline-flex items-center gap-1.5 uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>Enrolled Course</span>
                      </span>
                      {course.batch_code && (
                        <>
                          <span aria-hidden="true" className="text-dark-black/30">
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-dark-black/80">
                            <Hash className="w-3.5 h-3.5 text-primary-orange" />
                            <span>Batch {course.batch_code}</span>
                          </span>
                        </>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-black tracking-tight leading-tight">
                      {course.course_title}
                    </h1>

                    <p className="text-xs sm:text-sm text-dark-black/70 leading-relaxed">
                      All the links and course resources will be shared once the course has started.
                    </p>
                  </div>

                  {/* Top 3-Card Row: Course Progress | Next Live Class | Quick Actions */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Course Progress */}
                    <div className="bg-pure-white rounded-2xl border border-soft-cream shadow-xs p-5 flex items-center gap-4">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle
                            cx="32"
                            cy="32"
                            r={ringRadius}
                            fill="none"
                            stroke="#F7F2E8"
                            strokeWidth="6"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r={ringRadius}
                            fill="none"
                            stroke="#FF7A30"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={ringCircumference}
                            strokeDashoffset={ringOffset}
                          />
                        </svg>
                        <span className="absolute text-sm font-extrabold text-dark-black tabular-nums">
                          {progress}%
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-dark-black">
                            Course Progress
                          </h2>
                          <p className="text-xs text-dark-black/65 tabular-nums">
                            {progress >= 100
                              ? 'Curriculum completed'
                              : `${progress}% curriculum completed`}
                          </p>
                        </div>
                        <div className="w-full h-2 bg-soft-cream rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-orange rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Next Live Class (taps open batches.live_link in _blank) */}
                    {course.live_link ? (
                      <a
                        href={course.live_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-pure-white rounded-2xl border border-soft-cream hover:border-primary-orange shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] text-primary-orange flex items-center justify-center shrink-0">
                            <Radio className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <h2 className="text-sm sm:text-base font-bold text-dark-black group-hover:text-primary-orange transition-colors">
                              Next Live Class
                            </h2>
                            <div className="flex items-center gap-1.5 text-xs text-dark-black/75">
                              <Calendar className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                              <span className="truncate">{course.start_date}</span>
                            </div>
                            {course.time_display && (
                              <div className="flex items-center gap-1.5 text-xs text-dark-black/75">
                                <Clock className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                                <span className="truncate">{course.time_display}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-orange group-hover:bg-soft-orange text-pure-white group-hover:text-dark-black text-xs font-bold transition-colors whitespace-nowrap">
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Class</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </a>
                    ) : (
                      <div className="bg-pure-white rounded-2xl border border-soft-cream shadow-xs p-5 flex flex-col justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] text-primary-orange flex items-center justify-center shrink-0">
                            <Radio className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <h2 className="text-sm sm:text-base font-bold text-dark-black">
                              Next Live Class
                            </h2>
                            <div className="flex items-center gap-1.5 text-xs text-dark-black/75">
                              <Calendar className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                              <span className="truncate">{course.start_date}</span>
                            </div>
                            {course.time_display && (
                              <div className="flex items-center gap-1.5 text-xs text-dark-black/75">
                                <Clock className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                                <span className="truncate">{course.time_display}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <span
                            title="Live class link will be available once shared by your mentor"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-black/8 text-dark-black/45 border border-soft-cream text-xs font-bold cursor-not-allowed whitespace-nowrap"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Class</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Card 3: Quick Actions */}
                    <div className="bg-pure-white rounded-2xl border border-soft-cream shadow-xs p-5 flex flex-col justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#FFF3E8] text-primary-orange flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <h2 className="text-sm sm:text-base font-bold text-dark-black">
                          Quick Actions
                        </h2>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <Link
                          href={getStudyHref('/learner/study/resources')}
                          className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#FDFBF8] border border-soft-cream hover:border-primary-orange/60 hover:bg-[#FFF7F0] transition-colors text-center group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-pure-white border border-soft-cream flex items-center justify-center text-primary-orange group-hover:scale-105 transition-transform">
                            <FolderOpen className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-dark-black">Resources</span>
                        </Link>

                        <Link
                          href={getStudyHref('/learner/study/exams')}
                          className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#FDFBF8] border border-soft-cream hover:border-primary-orange/60 hover:bg-[#FFF7F0] transition-colors text-center group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-pure-white border border-soft-cream flex items-center justify-center text-primary-orange group-hover:scale-105 transition-transform">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-dark-black">Exams</span>
                        </Link>

                        <Link
                          href={getStudyHref('/learner/study/classrecordings')}
                          className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#FDFBF8] border border-soft-cream hover:border-primary-orange/60 hover:bg-[#FFF7F0] transition-colors text-center group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-pure-white border border-soft-cream flex items-center justify-center text-primary-orange group-hover:scale-105 transition-transform">
                            <PlaySquare className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-dark-black">Recordings</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Bottom 2-Column Main Content Area */}
          {!loading && course && (
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Left Section (Replaces Continue Learning — Share Course or View Course, NO modules) */}
                <div className="lg:col-span-7 bg-pure-white rounded-2xl border border-soft-cream shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 pb-4 border-b border-soft-cream">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#FFF3E8] text-primary-orange flex items-center justify-center shrink-0">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-dark-black">
                            Share or View Course
                          </h2>
                          <p className="text-xs text-dark-black/65">
                            Explore the public course overview or invite peers to join.
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/courses/opencourse?id=${course.course_id}`}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary-orange hover:underline whitespace-nowrap shrink-0"
                      >
                        <span>View Course</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Schedule Notice */}
                    <div className="p-4 rounded-2xl bg-[#FFF7F0] border border-soft-orange/45 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-pure-white text-primary-orange flex items-center justify-center shrink-0 border border-soft-orange/30">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-dark-black">
                          Course starts from{' '}
                          <span className="text-primary-orange">{course.start_date}</span>
                        </p>
                        <p className="text-xs text-dark-black/70 leading-relaxed flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-primary-orange shrink-0 mt-0.5" />
                          <span>
                            All the links and course resources will be shared once the course has started.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Primary Share & View Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleShareCourse}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-bold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                      aria-label="Share Course"
                    >
                      {shareCopied ? (
                        <Check className="w-4 h-4 shrink-0" />
                      ) : (
                        <Share2 className="w-4 h-4 shrink-0" />
                      )}
                      <span>{shareCopied ? 'Link Copied!' : 'Share Course'}</span>
                    </button>

                    <Link
                      href={`/courses/opencourse?id=${course.course_id}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-soft-cream hover:bg-soft-orange/40 text-dark-black border border-soft-orange/40 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
                    >
                      <span>View Course</span>
                      <ExternalLink className="w-3.5 h-3.5 text-primary-orange" />
                    </Link>
                  </div>
                </div>

                {/* Right Section (Recent Updates — Open Batch Board Button) */}
                <div className="lg:col-span-5 bg-pure-white rounded-2xl border border-soft-cream shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 pb-4 border-b border-soft-cream">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#FFF3E8] text-primary-orange flex items-center justify-center shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-dark-black">
                          Recent Updates
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-primary-orange whitespace-nowrap">
                        Batch Board
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FDFBF8] border border-soft-cream space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF3E8] text-primary-orange flex items-center justify-center shrink-0">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-dark-black truncate">
                            See the Batch board for all updates
                          </p>
                          <p className="text-xs text-dark-black/65 truncate">
                            {course.batch_code ? `Batch ${course.batch_code}` : 'Active Batch'}
                            {course.time_display ? ` · ${course.time_display}` : ''}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-dark-black/70 leading-relaxed">
                        Instructor announcements, schedule notices, and session links are posted directly to your batch board.
                      </p>
                    </div>
                  </div>

                  <div>
                    {hasBoardRecord ? (
                      <button
                        type="button"
                        onClick={() => setIsBoardOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-bold transition-colors shadow-xs cursor-pointer"
                      >
                        <Radio className="w-4 h-4" />
                        <span>Open Batch Board</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-dark-black/8 text-dark-black/45 border border-soft-cream text-xs sm:text-sm font-bold cursor-not-allowed select-none"
                        title="No batch board record available for this batch"
                      >
                        <Radio className="w-4 h-4 opacity-50" />
                        <span>Open Batch Board</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </main>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* BATCH BOARD MODAL OVERLAY (Powered strictly by lib/studyStore) */}
      {/* ============================================================== */}
      {isBoardOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-black/65 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBoardOpen(false);
          }}
        >
          <div className="relative w-full max-w-2xl bg-pure-white rounded-2xl border-2 border-soft-cream shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-pure-white border-b border-soft-cream flex items-start justify-between gap-3 shrink-0">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-soft-cream text-primary-orange text-[11px] font-bold uppercase tracking-wider border border-soft-orange/40">
                    <Radio className="w-3 h-3 text-primary-orange animate-pulse" />
                    <span>Batch Board</span>
                  </span>
                  {course?.batch_code && (
                    <span className="text-xs font-semibold text-dark-black/60 bg-soft-cream/60 px-2 py-0.5 rounded-md font-mono">
                      {course.batch_code}
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-dark-black truncate">
                  {boardData?.title || `${course?.batch_code || 'Batch'} Board`}
                </h2>

                <p className="text-xs text-dark-black/70 leading-relaxed line-clamp-2">
                  {boardData?.description ||
                    `Official announcements and instructor updates for ${course?.course_title || 'your course'}.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBoardOpen(false)}
                className="p-2 rounded-xl text-dark-black/50 hover:text-dark-black hover:bg-soft-cream transition-colors shrink-0 cursor-pointer"
                aria-label="Close batch board"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-soft-cream/25 [scrollbar-width:thin]">
              {boardLoading ? (
                <div className="py-20 text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-dark-black/60 font-semibold">
                    Loading batch announcements...
                  </p>
                </div>
              ) : !boardData || boardData.messages.length === 0 ? (
                <div className="py-16 px-4 text-center max-w-sm mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-full bg-soft-cream text-primary-orange flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-dark-black">No Messages Yet</h3>
                  <p className="text-xs text-dark-black/60 leading-relaxed">
                    Instructors and coordinators have not posted announcements yet. All batch schedules, links, and updates will be streamed here.
                  </p>
                </div>
              ) : (
                <>
                  {boardData.messages.map((msg, index) => {
                    const isTextMessage =
                      msg.type === 'message' || msg.type === 'text' || !msg.type;
                    const dateFormatted = msg.created_at
                      ? new Date(msg.created_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : '';

                    return (
                      <div
                        key={msg.id || index}
                        className="flex flex-col items-start gap-1 max-w-[90%] sm:max-w-[85%]"
                      >
                        <div className="flex items-center gap-1.5 px-1 text-[11px] text-dark-black/60 font-medium">
                          <span className="font-bold text-primary-orange">Instructor / Board</span>
                          {dateFormatted && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-dark-black/40" />
                                <span>{dateFormatted}</span>
                              </span>
                            </>
                          )}
                        </div>

                        {isTextMessage ? (
                          <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-xs bg-pure-white border border-soft-cream shadow-xs text-dark-black space-y-1">
                            <p className="text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-wrap break-words">
                              {msg.text_value || 'No message content'}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-2xl rounded-tl-xs bg-pure-white border border-soft-cream shadow-xs text-dark-black space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-primary-orange">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Resource Attachment</span>
                            </div>
                            {msg.text_value && (
                              <p className="text-xs sm:text-sm text-dark-black/80 whitespace-pre-wrap break-words">
                                {msg.text_value}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-pure-white border-t border-soft-cream shrink-0">
              <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-soft-cream/60 border border-soft-cream text-xs text-dark-black/75">
                <div className="flex items-center gap-2 min-w-0">
                  <Lock className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                  <span className="truncate text-[11px] sm:text-xs">
                    Batch board is read-only. Only receiving messages from instructors.
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-orange shrink-0 bg-pure-white px-2 py-0.5 rounded-sm border border-soft-orange/30">
                  Live Feed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Navigation Bar Attached */}
      <LearnerBottomNavigation />
    </div>
  );
}

export default function StudyDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudyDashboardContent />
    </Suspense>
  );
}
