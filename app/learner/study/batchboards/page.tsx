'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Radio,
  Search,
  X,
  Menu,
  BookOpen,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import StudySidebar from '@/components/study/sidebar';
import CourseBoard from '@/components/learner/courseboard';
import {
  getBatchBoards,
  BatchBoardItem,
  BatchBoardsResponse,
} from '@/lib/batchboardsStore';

function BatchBoardsContent() {
  const searchParams = useSearchParams();
  const batchIdParam = searchParams.get('id') || searchParams.get('batch_id');
  const queryString = searchParams?.toString();

  const [data, setData] = useState<BatchBoardsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Expanded descriptions map: board.id -> boolean
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  // Active board selected for opening the CourseBoard modal
  const [selectedBoardToOpen, setSelectedBoardToOpen] = useState<BatchBoardItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadBoards() {
      setLoading(true);
      try {
        const res = await getBatchBoards(batchIdParam);
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading batch boards:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBoards();

    return () => {
      isMounted = false;
    };
  }, [batchIdParam]);

  // Filter boards based on search query
  const boards = data?.boards;
  const filteredBoards = useMemo(() => {
    if (!boards) return [];
    if (!searchQuery.trim()) return boards;

    const q = searchQuery.toLowerCase().trim();
    return boards.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        Boolean(b.description && b.description.toLowerCase().includes(q))
    );
  }, [boards, searchQuery]);

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderDescription = (board: BatchBoardItem) => {
    const desc = board.description || 'No description provided for this batch board.';
    const isExpanded = Boolean(expandedDescriptions[board.id]);
    const words = desc.trim().split(/\s+/);
    const isLong = words.length > 5;

    if (!isLong) {
      return (
        <p className="text-xs sm:text-sm text-dark-black/75 leading-relaxed">
          {desc}
        </p>
      );
    }

    const shortExcerpt = words.slice(0, 5).join(' ');

    return (
      <div className="space-y-1">
        <p className="text-xs sm:text-sm text-dark-black/75 leading-relaxed">
          {isExpanded ? desc : `${shortExcerpt}...`}
        </p>
        <button
          type="button"
          onClick={() => toggleDescription(board.id)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-orange hover:text-soft-orange transition-colors cursor-pointer select-none"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Show less' : 'Read more'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-primary-orange" />
          ) : (
            <ChevronDown className="w-3 h-3 text-primary-orange" />
          )}
        </button>
      </div>
    );
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
          activeItem="home"
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

              {data?.batchCode && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pure-white border border-soft-cream text-xs font-mono font-bold text-dark-black shadow-2xs">
                  <span className="text-primary-orange">Batch:</span>
                  <span>{data.batchCode}</span>
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
                <span>{data?.courseTitle || 'Enrolled Course'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-dark-black tracking-tight flex items-center gap-2.5">
                <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-primary-orange animate-pulse" />
                <span>Batch Announcements Boards</span>
              </h1>
              <p className="text-xs sm:text-sm text-dark-black/65">
                Access official instructor noticeboards, class discussions, and critical batch broadcasts.
              </p>
            </div>

            {/* ============================================================== */}
            {/* 1. TOTAL BOARDS (COUNT) & SEARCH BAR (BOARD)                   */}
            {/* ============================================================== */}
            <div className="bg-pure-white rounded-2xl border-2 border-soft-cream p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Total boards (count) */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-soft-cream text-primary-orange border border-soft-orange/30 flex items-center justify-center shrink-0 shadow-2xs font-extrabold text-base">
                    {data?.total_count || 0}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-dark-black/55 uppercase tracking-wider block">
                      Total Boards
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-dark-black">
                      {data?.total_count || 0} Active Announcement Boards
                    </span>
                  </div>
                </div>

                {/* Search bar (board) */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-dark-black/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search boards by title or keyword..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-soft-cream/40 border border-soft-cream text-xs sm:text-sm text-dark-black placeholder:text-dark-black/45 focus:outline-none focus:border-primary-orange/60 focus:bg-pure-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-dark-black/40 hover:text-dark-black transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 2. DISPLAY LIST OF BOARDS: s. no, Title, Description, Open     */}
            {/* ============================================================== */}
            {loading ? (
              <div className="py-24 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs space-y-3">
                <div className="w-9 h-9 border-3 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs sm:text-sm text-dark-black/60 font-semibold">
                  Loading batch announcement boards...
                </p>
              </div>
            ) : filteredBoards.length === 0 ? (
              <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-soft-cream text-primary-orange flex items-center justify-center mx-auto">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-dark-black">
                  {searchQuery ? 'No matching boards found' : 'No Data Found'}
                </h3>
                <p className="text-xs sm:text-sm text-dark-black/65 leading-relaxed">
                  {searchQuery
                    ? `No batch boards match "${searchQuery}". Please check your query.`
                    : 'There are currently no announcement boards published for this batch.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-orange text-pure-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>Clear Search</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredBoards.map((board, index) => {
                  const sNo = index + 1;

                  return (
                    <div
                      key={board.id || index}
                      className="bg-pure-white rounded-2xl border-2 border-soft-cream hover:border-soft-orange/40 transition-all p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      {/* Left: s. no, Title, Description (show some on tap expand and display full) */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Serial Number (s. no) */}
                        <div className="w-9 h-9 rounded-xl bg-soft-cream border border-soft-orange/30 text-primary-orange font-mono font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          #{sNo}
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Board Title */}
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-dark-black leading-snug">
                              {board.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md bg-soft-cream border border-soft-orange/30 text-[10px] font-mono font-bold text-primary-orange uppercase tracking-wider">
                              Batch Board
                            </span>
                          </div>

                          {/* Description (show some, on tap expand and display full) */}
                          <div>
                            {renderDescription(board)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Open (components/learner/courseboard.tsx use already existing ui) */}
                      <div className="sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-soft-cream">
                        <button
                          type="button"
                          onClick={() => setSelectedBoardToOpen(board)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-95 w-full sm:w-auto"
                          aria-label={`Open batch board ${board.title}`}
                          title="Open Batch Board"
                        >
                          <MessageSquare className="w-4 h-4 shrink-0" />
                          <span>Open Board</span>
                        </button>
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

      {/* CourseBoard Modal using already existing UI from components/learner/courseboard.tsx */}
      {selectedBoardToOpen && (
        <CourseBoard
          isOpen={Boolean(selectedBoardToOpen)}
          onClose={() => setSelectedBoardToOpen(null)}
          batchId={selectedBoardToOpen.batch_id}
          batchUuid={selectedBoardToOpen.batch_id}
          batchCode={selectedBoardToOpen.batchCode}
          courseTitle={selectedBoardToOpen.courseTitle}
        />
      )}

      {/* 2. Learner Bottom Navigation */}
      <LearnerBottomNavigation />
    </div>
  );
}

export default function BatchBoardsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BatchBoardsContent />
    </Suspense>
  );
}
