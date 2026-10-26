'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
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
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import {
  getStudyDetails,
  getStudyBatchBoard,
  StudyCourseDetails,
  StudyBatchBoardData,
} from '@/lib/studyStore';

function StudyDashboardContent() {
  const searchParams = useSearchParams();
  const batchIdParam = searchParams.get('id');

  const [course, setCourse] = useState<StudyCourseDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Batch Board Modal State
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

  // Share Course + View course page actions (rendered beside the badge on
  // desktop, and below the title on mobile)
  const courseActions = course ? (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleShareCourse}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-soft-cream hover:bg-soft-orange/30 text-dark-black hover:text-primary-orange border border-soft-orange/50 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
        aria-label="Share Course"
      >
        {shareCopied ? (
          <Check className="w-4 h-4 text-green-600 shrink-0" />
        ) : (
          <Share2 className="w-4 h-4 text-primary-orange shrink-0" />
        )}
        <span>{shareCopied ? 'Link Copied!' : 'Share Course'}</span>
      </button>

      <Link
        href={`/courses/opencourse?id=${course.course_id}`}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-dark-black/60 hover:text-primary-orange transition-colors"
      >
        <span>View course page</span>
      </Link>
    </div>
  ) : null;

  return (
    <div className="min-h-screen flex flex-col bg-soft-cream">
      {/* 1. Header Attached */}
      <LearnerHeader />

      {/* ============================================================== */}
      {/* STATIC FIX CONTAINER: "Go to my courses" + Batch details div   */}
      {/* Fixed below header (top-16 / top-20), will NOT move with scroll */}
      {/* ============================================================== */}
      <div className="sticky top-16 sm:top-20 z-40 bg-soft-cream/95 backdrop-blur-md border-b border-soft-orange/30 shadow-2xs">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3">
          {/* Go to my courses - Static Fix */}
          <div>
            <Link
              href="/learner/courses/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl bg-pure-white border border-soft-cream text-xs sm:text-sm font-bold text-dark-black hover:text-primary-orange hover:border-primary-orange/40 transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-primary-orange" />
              <span>Go to my courses</span>
            </Link>
          </div>

          {/* Batch details div - Static Fix (No move with scroll) */}
          <div className="bg-pure-white rounded-2xl border-2 border-soft-cream p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-soft-cream text-primary-orange flex items-center justify-center shrink-0 border border-soft-orange/30">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="font-serif text-xs sm:text-sm font-bold text-dark-black tracking-normal truncate">
                  See the Batch board for all the updates.
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-dark-black/70">
                  {course?.batch_code && (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-dark-black">
                      <Hash className="w-3.5 h-3.5 text-primary-orange" />
                      <span>Batch: {course.batch_code}</span>
                    </span>
                  )}
                  {course?.time_display && (
                    <span className="inline-flex items-center gap-1 font-medium text-dark-black/75">
                      <Clock className="w-3.5 h-3.5 text-primary-orange" />
                      <span>{course.time_display}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBoardOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Radio className="w-4 h-4" />
              <span>Open Batch Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SCROLLABLE MAIN CONTENT AREA (Scrolls freely underneath)       */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28">
        {loading ? (
          <div className="py-24 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs">
            <div className="w-9 h-9 border-3 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs sm:text-sm text-dark-black/60 font-semibold">
              Loading course details...
            </p>
          </div>
        ) : !course ? (
          <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto">
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
          <div className="space-y-6">
            {/* Main Study Card */}
            <div className="bg-pure-white rounded-2xl border-2 border-soft-cream shadow-xs p-5 sm:p-7 space-y-5">
              {/* Enrolled badge (+ actions beside it on desktop) + course name */}
              <div className="space-y-3.5 pb-5 border-b border-soft-cream">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-cream border border-soft-orange/40 text-[11px] font-bold text-primary-orange uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Enrolled Course</span>
                  </div>

                  {/* Desktop: Share Course + View course page beside the badge */}
                  <div className="hidden sm:block">{courseActions}</div>
                </div>

                {/* Course Name */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-dark-black tracking-tight leading-snug">
                  {course.course_title}
                </h1>

                {/* Mobile: actions stay below the title */}
                <div className="sm:hidden pt-1">{courseActions}</div>
              </div>

              {/* Course start date (compact, highlighted) */}
              <div className="inline-flex max-w-full items-center gap-2.5 px-3 py-2 rounded-xl bg-primary-orange/10 border border-primary-orange shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-pure-white text-primary-orange flex items-center justify-center shrink-0 border border-primary-orange/30">
                  <Calendar className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-dark-black">
                  Course will start from{' '}
                  <span className="text-primary-orange bg-pure-white px-2 py-0.5 rounded-md border border-primary-orange/30 inline-block font-extrabold">
                    {course.start_date}
                  </span>
                </p>
              </div>

              {/* All the Links, course Resources will be shared once course started. */}
              <div className="p-4 sm:p-5 rounded-2xl bg-soft-cream/60 border border-soft-orange/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pure-white text-primary-orange flex items-center justify-center shrink-0 border border-soft-cream shadow-2xs">
                    <Info className="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-dark-black/85 leading-relaxed pt-0.5">
                    All the Links, course Resources will be shared once course started.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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