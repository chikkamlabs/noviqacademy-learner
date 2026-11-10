'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  X,
  Menu,
  FileText,
  FileSpreadsheet,
  File,
  ExternalLink,
  HardDrive,
  FolderOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import StudySidebar from '@/components/study/sidebar';
import {
  getBatchResources,
  BatchResourceItem,
} from '@/lib/batchresourcesStore';

function ResourcesPageContent() {
  const searchParams = useSearchParams();
  const batchIdParam = searchParams.get('id');
  const queryString = searchParams?.toString();

  const [resources, setResources] = useState<BatchResourceItem[]>([]);
  const [totalActiveCount, setTotalActiveCount] = useState<number>(0);
  const [batchCode, setBatchCode] = useState<string>('');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Track which resource descriptions are opened on tap
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getBatchResources(batchIdParam);
        if (isMounted) {
          setResources(data.resources);
          setTotalActiveCount(data.totalActiveCount);
          if (data.batchCode) setBatchCode(data.batchCode);
          if (data.courseTitle) setCourseTitle(data.courseTitle);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error fetching batch resources:', err);
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

  // Filter resources strictly by Title (Title of the resource) and status = active
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesStatus = res.status === 'active';
      const matchesSearch =
        searchQuery.trim() === '' ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesStatus && matchesSearch;
    });
  }, [resources, searchQuery]);

  // Helper to get formatted type icon
  const getResourceIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (t.includes('doc')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (t.includes('ppt') || t.includes('slide')) return <FileSpreadsheet className="w-5 h-5 text-amber-500" />;
    if (t.includes('link')) return <ExternalLink className="w-5 h-5 text-emerald-500" />;
    return <File className="w-5 h-5 text-primary-orange" />;
  };

  // Helper to format short description (3-5 words)
  const renderDescription = (res: BatchResourceItem) => {
    const rawDesc = res.description?.trim() || '';
    if (!rawDesc) {
      return (
        <span className="text-xs text-dark-black/40 italic">
          No description provided for this resource.
        </span>
      );
    }

    const words = rawDesc.split(/\s+/);
    const isLong = words.length > 5;
    const isExpanded = !!expandedIds[res.id];

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
          onClick={() => toggleExpand(res.id)}
          className="text-xs sm:text-sm text-dark-black/80 font-normal leading-relaxed cursor-pointer select-none group inline-block"
          title="Tap to display full description"
        >
          {isExpanded ? rawDesc : `${shortText}...`}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(res.id);
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

      {/* Main Study Layout: Sidebar on Left + Resources Content on Right */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar & Mobile Drawer */}
        <StudySidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem="resources"
        />

        {/* Resources Content Column */}
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
            {/* Header & Total Resources Card */}
            <div className="bg-pure-white rounded-2xl border-2 border-soft-cream shadow-xs p-5 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soft-cream">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-cream border border-soft-orange/40 text-[11px] font-bold text-primary-orange uppercase tracking-wider">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Batch Study Material</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-dark-black tracking-tight">
                    Batch Resources
                  </h1>
                  {courseTitle && (
                    <p className="text-xs sm:text-sm text-dark-black/70">
                      Curated drive files, code templates, and notes for {courseTitle}
                    </p>
                  )}
                </div>

                {/* Total Resources(Count for Status = active) */}
                <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-soft-cream/80 border border-soft-orange/40 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-orange text-pure-white flex items-center justify-center font-extrabold text-lg shadow-2xs">
                    {totalActiveCount}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-dark-black/60 uppercase tracking-wider block">
                      Total Resources
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-dark-black">
                      Active In Batch
                    </span>
                  </div>
                </div>
              </div>

              {/* Search bar(Title of the resource) */}
              <div className="relative">
                <Search className="w-4 h-4 text-dark-black/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources by title..."
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

            {/* List of Batch Resources with status=active */}
            {loading ? (
              <div className="py-20 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs space-y-2">
                <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs sm:text-sm text-dark-black/60 font-semibold">
                  Loading active batch resources...
                </p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-soft-cream text-primary-orange flex items-center justify-center mx-auto">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-dark-black">
                  {searchQuery ? 'No matching resources found' : 'No Data Found'}
                </h3>
                <p className="text-xs text-dark-black/65 leading-relaxed">
                  {searchQuery
                    ? `No active resources match "${searchQuery}". Try a different keyword.`
                    : 'No active resources found for this batch.'}
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
                {filteredResources.map((res) => {
                  const targetUrl = res.related_url || 'https://drive.google.com';

                  return (
                    <div
                      key={res.id}
                      className="bg-pure-white rounded-2xl border border-soft-cream hover:border-soft-orange/40 transition-all p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      {/* Left: Icon, Title & type, Description (Show first 3-5 words then Open on tap Display there only) */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-soft-cream border border-soft-orange/30 flex items-center justify-center shrink-0 mt-0.5">
                          {getResourceIcon(res.type)}
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Title & type */}
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-dark-black tracking-tight">
                              {res.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md bg-soft-cream border border-soft-orange/40 text-[10px] font-mono font-bold uppercase tracking-wider text-primary-orange shrink-0">
                              {res.type || 'DOC'}
                            </span>
                          </div>

                          {/* Description (Show first 3-5 words then Open on tap Display there only) */}
                          <div className="pt-0.5">
                            {renderDescription(res)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Open (Icon It's a drive open on target = blank) */}
                      <div className="sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-soft-cream">
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-95 w-full sm:w-auto"
                          aria-label={`Open drive resource ${res.title}`}
                        >
                          <HardDrive className="w-4 h-4 shrink-0" />
                          <span>Open</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom clearance buffer so last resource card is fully visible above fixed bottom bar */}
            <div className="h-16 sm:h-20" aria-hidden="true" />
          </main>
        </div>
      </div>

      {/* 2. Learner Bottom Navigation */}
      <LearnerBottomNavigation />
    </div>
  );
}

export default function StudyResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResourcesPageContent />
    </Suspense>
  );
}
