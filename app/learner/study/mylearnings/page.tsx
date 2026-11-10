'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  Menu,
  Award,
  Clock,
  BookOpen,
  FileText,
  ExternalLink,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import StudySidebar from '@/components/study/sidebar';
import {
  getMyLearningsData,
  formatLearningsDate,
  MyLearningsData,
} from '@/lib/mylearningsStore';

function MyLearningsContent() {
  const searchParams = useSearchParams();
  const batchIdParam = searchParams.get('id') || searchParams.get('batch_id');
  const queryString = searchParams?.toString();

  const [data, setData] = useState<MyLearningsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadLearnings() {
      setLoading(true);
      try {
        const res = await getMyLearningsData(batchIdParam);
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading learnings data:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLearnings();

    return () => {
      isMounted = false;
    };
  }, [batchIdParam]);

  const backHref = queryString
    ? `/learner/study/dashboard?${queryString}`
    : '/learner/study/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-soft-cream">
      {/* 1. Header */}
      <LearnerHeader />

      {/* Main Study Layout */}
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <StudySidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem="mylearnings"
        />

        {/* Content Column */}
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
                  <span>Back to Study Dashboard</span>
                </Link>
              </div>

              {data?.batch_id && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pure-white border border-soft-cream text-xs font-mono font-bold text-dark-black shadow-2xs">
                  <span className="text-primary-orange">Batch:</span>
                  <span>{data.batch_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* MAIN SCROLLABLE AREA */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-48 sm:pb-56 space-y-6">
            {/* Header info */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-cream border border-soft-orange/40 text-[11px] font-bold text-primary-orange uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{data?.course_name || 'Enrolled Course'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-dark-black tracking-tight">
                My Learnings & Performance
              </h1>
              <p className="text-xs sm:text-sm text-dark-black/65">
                Track your course engagement points, attendance record, and conducted assessment history.
              </p>
            </div>

            {loading ? (
              <div className="py-24 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs space-y-3">
                <div className="w-9 h-9 border-3 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs sm:text-sm text-dark-black/60 font-semibold">
                  Loading your learning metrics and exams...
                </p>
              </div>
            ) : !data || !data.hasData ? (
              <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-soft-cream text-primary-orange flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-dark-black">No Data Found</h3>
                <p className="text-xs sm:text-sm text-dark-black/70 leading-relaxed">
                  No learning records or batch metrics found for your profile. Please verify your course enrollment.
                </p>
                <Link
                  href={backHref}
                  className="inline-block mt-2 px-4 py-2 bg-primary-orange text-pure-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Return to Dashboard
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ============================================================== */}
                {/* 1. METRICS: Total Points (batch_learners.points) & Attendance  */}
                {/* ============================================================== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Total Points (batch_learners.points) */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-pure-white border-2 border-soft-cream hover:border-soft-orange/40 transition-all shadow-xs flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-soft-cream text-primary-orange border border-soft-orange/40 flex items-center justify-center shrink-0 shadow-2xs">
                      <Award className="w-7 h-7 text-primary-orange" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-dark-black/55 uppercase tracking-wider block">
                        Total Points
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-dark-black font-mono">
                          {data.points}
                        </span>
                        <span className="text-xs font-bold text-primary-orange">
                          Points Earned
                        </span>
                      </div>
                      <p className="text-[11px] text-dark-black/60 mt-0.5">
                        Accumulated from quizzes, attendance, and batch tasks.
                      </p>
                    </div>
                  </div>

                  {/* Attendance (batch_learners.attendance) */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-pure-white border-2 border-soft-cream hover:border-soft-orange/40 transition-all shadow-xs flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-soft-cream text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <Clock className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-dark-black/55 uppercase tracking-wider block">
                        Batch Attendance
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-dark-black font-mono">
                          {data.attendance}%
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          Active Participation
                        </span>
                      </div>
                      <p className="text-[11px] text-dark-black/60 mt-0.5">
                        Recorded attendance for scheduled live sessions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 2. EXAMS SECTION: Total Exams (Exams conducted count)          */}
                {/*    Display all the list of exams conducted                     */}
                {/*    (Basic Exams details, points, correct, wrong, created_at,   */}
                {/*     open(no action))                                           */}
                {/* ============================================================== */}
                <div className="space-y-4">
                  {/* Exams Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-dark-black tracking-tight flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary-orange" />
                        <span>Conducted Exams History</span>
                        <span className="text-xs font-mono font-bold text-primary-orange bg-soft-cream px-2.5 py-0.5 rounded-md border border-soft-orange/30">
                          Total Exams: {data.total_exams}
                        </span>
                      </h2>
                      <p className="text-xs text-dark-black/60 mt-0.5">
                        Review all assessments conducted for your batch profile.
                      </p>
                    </div>
                  </div>

                  {/* List of Exams Conducted */}
                  {data.exams_conducted.length === 0 ? (
                    <div className="py-16 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs space-y-2">
                      <FileText className="w-8 h-8 text-dark-black/40 mx-auto" />
                      <p className="text-xs sm:text-sm font-semibold text-dark-black/60">
                        No exams have been conducted for your profile yet.
                      </p>
                      <p className="text-xs text-dark-black/45">
                        Once an exam is completed or conducted, its performance metrics will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {data.exams_conducted.map((exam, index) => {
                        return (
                          <div
                            key={exam.id || index}
                            className="bg-pure-white rounded-2xl border-2 border-soft-cream hover:border-soft-orange/40 transition-all p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            {/* Left: Basic Exams Details & Metrics */}
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-xl bg-soft-cream border border-soft-orange/30 flex items-center justify-center shrink-0 mt-0.5 text-primary-orange">
                                <GraduationCap className="w-5 h-5" />
                              </div>

                              <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm sm:text-base font-bold text-dark-black leading-snug">
                                    {exam.exam_title}
                                  </h3>
                                  {exam.submitted && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                                      Submitted
                                    </span>
                                  )}
                                </div>

                                {exam.exam_description && (
                                  <p className="text-xs text-dark-black/70 line-clamp-2 leading-relaxed">
                                    {exam.exam_description}
                                  </p>
                                )}

                                {/* Metrics Badges: Points, Correct, Wrong, Created_at Date */}
                                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                                  {/* Points */}
                                  <span className="inline-flex items-center gap-1 font-semibold bg-soft-cream/80 text-dark-black px-2.5 py-1 rounded-lg border border-soft-cream">
                                    <Award className="w-3.5 h-3.5 text-primary-orange" />
                                    <span>{exam.points} Points</span>
                                  </span>

                                  {/* Correct */}
                                  <span className="inline-flex items-center gap-1 font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{exam.correct} Correct</span>
                                  </span>

                                  {/* Wrong */}
                                  <span className="inline-flex items-center gap-1 font-semibold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200">
                                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                    <span>{exam.wrong} Wrong</span>
                                  </span>

                                  {/* created_at date */}
                                  <span className="inline-flex items-center gap-1 font-semibold bg-soft-cream/60 text-dark-black/70 px-2.5 py-1 rounded-lg border border-soft-cream">
                                    <Calendar className="w-3.5 h-3.5 text-primary-orange" />
                                    <span>{formatLearningsDate(exam.created_at)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Open (No action as instructed) */}
                            <div className="sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-soft-cream">
                              <button
                                type="button"
                                onClick={() => {}}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-pure-white hover:bg-soft-cream text-dark-black hover:text-primary-orange border border-soft-cream hover:border-soft-orange/50 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer w-full sm:w-auto"
                                aria-label={`Open exam ${exam.exam_title} (no action)`}
                                title="Exam Overview"
                              >
                                <ExternalLink className="w-4 h-4 text-primary-orange" />
                                <span>Open</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom clearance buffer */}
            <div className="h-16 sm:h-20" aria-hidden="true" />
          </main>
        </div>
      </div>

      {/* 2. Learner Bottom Navigation */}
      <LearnerBottomNavigation />
    </div>
  );
}

export default function MyLearningsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MyLearningsContent />
    </Suspense>
  );
}
