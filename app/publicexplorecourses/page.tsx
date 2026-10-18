'use client';

import { useEffect, useState, useMemo } from 'react';
import { Sparkles, Filter, X, Search } from 'lucide-react';
import { getAllCourses, CourseWithDetails } from '@/lib/coursesStore';
import CourseCard from '@/components/courses/CourseCard';
import Header from '@/components/landingpage/header';
import Footer from '@/components/landingpage/footer';

export default function PublicExploreCoursesPage() {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('topic');
    }
    return null;
  });
  const [selectedRegion, setSelectedRegion] = useState<'india' | 'uk'>('india');
  const [searchQuery, setSearchQuery] = useState('');
  const [topicSearch, setTopicSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAllCourses();
      setCourses(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Also listen for popstate when user uses browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const topicFromUrl = params.get('topic');
        setSelectedTopic(topicFromUrl || null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Extract all unique topics across all courses (from course_topics / topics)
  const allTopics = useMemo(() => {
    const topicMap = new Map<string, number>();
    courses.forEach((c) => {
      if (Array.isArray(c.topics)) {
        c.topics.forEach((t) => {
          const trimmed = t.trim();
          if (trimmed) {
            topicMap.set(trimmed, (topicMap.get(trimmed) || 0) + 1);
          }
        });
      }
    });

    return Array.from(topicMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [courses]);

  // Filter topics based on search bar inside topic filter sidebar
  const displayedTopicList = useMemo(() => {
    if (!topicSearch.trim()) return allTopics;
    const q = topicSearch.toLowerCase().trim();
    return allTopics.filter((t) => t.name.toLowerCase().includes(q));
  }, [allTopics, topicSearch]);

  // Filtered courses when a topic is selected
  const filteredCourses = useMemo(() => {
    let list = courses;

    if (selectedTopic) {
      list = list.filter((course) =>
        course.topics?.some(
          (t) => t.toLowerCase().trim() === selectedTopic.toLowerCase().trim()
        )
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.sub_heading && c.sub_heading.toLowerCase().includes(q)) ||
          c.topics?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [courses, selectedTopic, searchQuery]);

  const hasFilter = selectedTopic !== null || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-pure-white text-dark-black flex flex-col">
      {/* Unified Header with Main Navigation Menu preserved */}
      <Header
        showRegionSelector={true}
        selectedRegion={selectedRegion}
        onRegionChange={(reg) => setSelectedRegion(reg)}
      />

      {/* Hero Header Section - Compact spacing */}
      <section className="bg-soft-cream/40 border-b border-soft-cream py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pure-white border border-soft-orange/50 text-xs font-semibold text-primary-orange uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-primary-orange" />
              <span>Full Curriculum Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-dark-black tracking-tight">
              Explore Courses
            </h1>
            <p className="text-xs sm:text-sm text-dark-black/75 leading-relaxed">
              Discover industry-ready engineering programs, hands-on masterclasses, and production-grade technologies mentored by senior tech leaders.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="mt-3.5 max-w-md relative">
            <Search className="w-4 h-4 text-dark-black/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by keyword, topic, or role..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-black/40 hover:text-dark-black p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area: Left Courses Grid & Right-most Topics Sidebar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Main Courses Area (Left/Center) */}
          <div className="flex-1 w-full min-w-0">
            {/* Results count & Active filter status */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-soft-cream">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-semibold text-dark-black">
                  Showing <span className="text-primary-orange font-bold">{filteredCourses.length}</span> course
                  {filteredCourses.length === 1 ? '' : 's'}
                </p>
                {selectedTopic && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary-orange/10 border border-primary-orange/30 text-primary-orange text-xs font-bold">
                    <span>{selectedTopic}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:opacity-75"
                      onClick={() => setSelectedTopic(null)}
                    />
                  </span>
                )}
              </div>

              {hasFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic(null);
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-primary-orange hover:underline inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>

            {/* Courses Display */}
            {loading ? (
              <div className="py-20 text-center text-sm font-medium text-dark-black/60 bg-soft-cream/20 rounded-2xl border border-soft-cream">
                Loading courses catalog...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-16 text-center bg-soft-cream/30 rounded-2xl border border-soft-cream p-6">
                <h3 className="text-base font-bold text-dark-black mb-1">
                  No courses found matching your criteria
                </h3>
                <p className="text-xs text-dark-black/70 mb-4 max-w-md mx-auto">
                  Try choosing another topic filter or reset filters to browse the complete catalog.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-primary-orange text-pure-white text-xs font-bold rounded-lg hover:bg-soft-orange hover:text-dark-black transition-colors shadow-2xs"
                >
                  View All Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6 justify-items-center">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    region={selectedRegion}
                    className="w-full max-w-[460px] h-[540px] sm:h-[560px]"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right-most Small Sidebar for Filters: Displays all topics to filter with search bar & increased width */}
          <aside className="order-first lg:order-last w-full lg:w-80 xl:w-88 shrink-0 lg:sticky lg:top-20 bg-pure-white rounded-2xl border-2 border-soft-cream p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-soft-cream">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-orange" />
                <h2 className="text-xs sm:text-sm font-bold text-dark-black tracking-tight">
                  Filter by Topic ({allTopics.length})
                </h2>
              </div>
              {(selectedTopic || topicSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic(null);
                    setTopicSearch('');
                  }}
                  className="text-xs font-semibold text-primary-orange hover:underline inline-flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Search Bar for Topic Filter */}
            <div className="relative my-2.5">
              <Search className="w-3.5 h-3.5 text-dark-black/45 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-soft-cream/40 rounded-lg border border-dark-black/15 focus:outline-hidden focus:border-primary-orange focus:bg-pure-white transition-colors"
              />
              {topicSearch && (
                <button
                  type="button"
                  onClick={() => setTopicSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-black/40 hover:text-dark-black p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Topics List: Responsive (horizontal scroll on mobile, vertical list on desktop) */}
            <div className="mt-2 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto max-h-none lg:max-h-[calc(100vh-230px)] pb-1.5 lg:pb-0 [scrollbar-width:thin]">
              {/* All Topics (Only shown when not actively filtering topics with search query) */}
              {!topicSearch && (
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  className={`shrink-0 lg:shrink w-auto lg:w-full flex items-center justify-between gap-3 px-3 py-2 text-xs rounded-lg transition-all ${
                    selectedTopic === null
                      ? 'bg-primary-orange text-pure-white shadow-2xs font-bold'
                      : 'text-dark-black hover:bg-soft-cream/70 font-medium bg-soft-cream/40 lg:bg-transparent'
                  }`}
                >
                  <span className="whitespace-nowrap">All Topics</span>
                  <span
                    className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      selectedTopic === null
                        ? 'bg-pure-white/20 text-pure-white'
                        : 'bg-soft-cream text-dark-black/70'
                    }`}
                  >
                    {courses.length}
                  </span>
                </button>
              )}

              {/* Display all topics to filter */}
              {displayedTopicList.length === 0 ? (
                <div className="py-4 text-center text-xs text-dark-black/50">
                  No topics matching &quot;{topicSearch}&quot;
                </div>
              ) : (
                displayedTopicList.map(({ name, count }) => {
                  const isSelected = selectedTopic?.toLowerCase() === name.toLowerCase();

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedTopic(isSelected ? null : name)}
                      className={`shrink-0 lg:shrink w-auto lg:w-full flex items-center justify-between gap-3 px-3 py-2 text-xs rounded-lg transition-all text-left ${
                        isSelected
                          ? 'bg-primary-orange text-pure-white shadow-2xs font-bold'
                          : 'text-dark-black hover:bg-soft-cream/70 font-medium bg-soft-cream/40 lg:bg-transparent'
                      }`}
                    >
                      <span className="whitespace-nowrap lg:truncate pr-1">{name}</span>
                      <span
                        className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full shrink-0 font-bold ${
                          isSelected
                            ? 'bg-pure-white/20 text-pure-white'
                            : 'bg-soft-cream text-dark-black/70'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
