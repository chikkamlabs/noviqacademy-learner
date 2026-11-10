'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Video,
  Calendar,
  ExternalLink,
  Menu,
  BookOpen,
  Filter,
  RotateCcw,
  Film,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import StudySidebar from '@/components/study/sidebar';
import {
  getClassRecordings,
  getDefaultDateRange,
  formatRecordingDate,
  ClassRecordingsResponse,
} from '@/lib/classrecordings';

function ClassRecordingsContent() {
  const searchParams = useSearchParams();
  const batchIdParam = searchParams.get('id') || searchParams.get('batch_id');
  const queryString = searchParams?.toString();

  // Date filters: default to last one week as requested
  const defaultDates = getDefaultDateRange();
  const [fromDate, setFromDate] = useState<string>(defaultDates.fromDate);
  const [toDate, setToDate] = useState<string>(defaultDates.toDate);

  const [data, setData] = useState<ClassRecordingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadRecordings() {
      setLoading(true);
      try {
        const res = await getClassRecordings(batchIdParam, fromDate || null, toDate || null);
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading class recordings:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRecordings();

    return () => {
      isMounted = false;
    };
  }, [batchIdParam, fromDate, toDate]);

  const handleResetToLastWeek = () => {
    const range = getDefaultDateRange();
    setFromDate(range.fromDate);
    setToDate(range.toDate);
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
  };

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
          activeItem="classrecordings"
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
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-dark-black tracking-tight flex items-center gap-2.5">
                <Video className="w-6 h-6 sm:w-7 sm:h-7 text-primary-orange" />
                <span>Class Recordings</span>
              </h1>
              <p className="text-xs sm:text-sm text-dark-black/65">
                Catch up on past live classes, interactive workshops, and mentor walkthrough sessions.
              </p>
            </div>

            {/* ============================================================== */}
            {/* 1. TOTAL RECORDINGS COUNT & DATE FILTER CONTROLS               */}
            {/* ============================================================== */}
            <div className="bg-pure-white rounded-2xl border-2 border-soft-cream p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-soft-cream">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-soft-cream text-primary-orange border border-soft-orange/30 flex items-center justify-center shrink-0 shadow-2xs">
                    <Film className="w-5 h-5 text-primary-orange" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-dark-black/55 uppercase tracking-wider block">
                      Total Recordings
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-dark-black">
                      {data?.total_count || 0} Recorded Sessions
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToLastWeek}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-soft-cream text-primary-orange border border-soft-orange/40 hover:bg-soft-orange/30 text-xs font-bold transition-all cursor-pointer"
                    title="Filter to last one week"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Last 1 Week</span>
                  </button>

                  {(fromDate || toDate) && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pure-white text-dark-black/70 border border-soft-cream hover:bg-soft-cream text-xs font-bold transition-all cursor-pointer"
                      title="Clear date filters"
                    >
                      <span>Show All</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Date Filters: From to (default last one week) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
                {/* From Date */}
                <div className="space-y-1">
                  <label htmlFor="from-date" className="text-[11px] font-bold text-dark-black/60 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary-orange" />
                    <span>From Date</span>
                  </label>
                  <input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-soft-cream/40 border border-soft-cream text-xs sm:text-sm font-semibold text-dark-black focus:outline-none focus:border-primary-orange/60 focus:bg-pure-white transition-all"
                  />
                </div>

                {/* To Date */}
                <div className="space-y-1">
                  <label htmlFor="to-date" className="text-[11px] font-bold text-dark-black/60 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary-orange" />
                    <span>To Date</span>
                  </label>
                  <input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-soft-cream/40 border border-soft-cream text-xs sm:text-sm font-semibold text-dark-black focus:outline-none focus:border-primary-orange/60 focus:bg-pure-white transition-all"
                  />
                </div>

                {/* Quick Hint */}
                <div className="text-[11px] text-dark-black/55 pb-1">
                  Showing sessions between {fromDate || 'earliest'} and {toDate || 'latest'}.
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 2. RECORDINGS LIST: Date, Link (Open Icon target = _blank)     */}
            {/* ============================================================== */}
            {loading ? (
              <div className="py-24 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs space-y-3">
                <div className="w-9 h-9 border-3 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs sm:text-sm text-dark-black/60 font-semibold">
                  Loading class recordings...
                </p>
              </div>
            ) : !data || data.recordings.length === 0 ? (
              <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-soft-cream text-primary-orange flex items-center justify-center mx-auto">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-dark-black">
                  No Recordings Found
                </h3>
                <p className="text-xs text-dark-black/65 leading-relaxed">
                  No recorded classes match the selected date window ({fromDate || 'start'} to {toDate || 'now'}).
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-orange text-pure-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Show All Recordings</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {data.recordings.map((recording, index) => {
                  return (
                    <div
                      key={recording.id || index}
                      className="bg-pure-white rounded-2xl border-2 border-soft-cream hover:border-soft-orange/40 transition-all p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Video Icon, Date, Description */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-xl bg-soft-cream border border-soft-orange/30 flex items-center justify-center shrink-0 mt-0.5 text-primary-orange shadow-2xs">
                          <Video className="w-5 h-5 text-primary-orange" />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-soft-cream font-mono font-bold text-xs text-dark-black border border-soft-orange/30">
                              <Calendar className="w-3.5 h-3.5 text-primary-orange" />
                              <span>{formatRecordingDate(recording.date)}</span>
                            </span>

                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                              Class Recording
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-dark-black/80 font-medium leading-relaxed truncate">
                            Live Lecture & Mentorship Session
                          </p>
                          <p className="text-[11px] text-dark-black/50 font-mono truncate">
                            {recording.link}
                          </p>
                        </div>
                      </div>

                      {/* Right: Link (Open Icon target = _blank) */}
                      <div className="sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-soft-cream">
                        <a
                          href={recording.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-95 w-full sm:w-auto"
                          aria-label={`Open class recording for ${recording.date}`}
                          title="Open Recording in New Tab"
                        >
                          <span>Open Recording</span>
                          <ExternalLink className="w-4 h-4 shrink-0" />
                        </a>
                      </div>
                    </div>
                  );
                })}
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

export default function ClassRecordingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClassRecordingsContent />
    </Suspense>
  );
}
