'use client';

import { useEffect, useMemo, useState } from 'react';
import { Presentation, Search, X, Globe, MapPin, LayoutGrid } from 'lucide-react';
import Header from '@/components/landingpage/header';
import Footer from '@/components/landingpage/footer';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import WorkshopCard from '@/components/landingpage/workshopcard';
import { getAllWorkshops, WorkshopItem } from '@/lib/workshopsStore';
import { getLearnerProfile } from '@/lib/profilesStore';

type ModeFilter = 'all' | 'online' | 'offline';

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLearnerLoggedIn, setIsLearnerLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const [list, learner] = await Promise.all([
        getAllWorkshops(),
        getLearnerProfile().catch(() => null),
      ]);
      if (!isMounted) return;
      setWorkshops(list);
      setIsLearnerLoggedIn(Boolean(learner));
      setLoading(false);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredWorkshops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return workshops.filter((w) => {
      if (modeFilter !== 'all' && (w.mode || 'online').toLowerCase() !== modeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.tag.toLowerCase().includes(q)
      );
    });
  }, [workshops, searchQuery, modeFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF8] text-dark-black">
      {isLearnerLoggedIn ? <LearnerHeader /> : <Header />}

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-[#FFF3E8] via-[#FFF9F3] to-[#FDFBF8] border-b border-soft-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-orange uppercase tracking-wider">
              <Presentation className="w-4 h-4 shrink-0" />
              <span>Live &amp; Hands-On Sessions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-black tracking-tight">
              Workshops
            </h1>
            <p className="text-sm sm:text-base text-dark-black/70 leading-relaxed">
              Interactive workshops led by industry practitioners. Register to reserve your seat or join the community group for updates.
            </p>
          </div>

          {/* Search + Mode Filter Toolbar */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setModeFilter('all')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  modeFilter === 'all'
                    ? 'bg-primary-orange text-pure-white shadow-xs'
                    : 'bg-pure-white text-dark-black/80 border border-soft-cream hover:border-primary-orange/50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>All ({workshops.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModeFilter('online')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  modeFilter === 'online'
                    ? 'bg-primary-orange text-pure-white shadow-xs'
                    : 'bg-pure-white text-dark-black/80 border border-soft-cream hover:border-primary-orange/50'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Online</span>
              </button>

              <button
                type="button"
                onClick={() => setModeFilter('offline')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  modeFilter === 'offline'
                    ? 'bg-primary-orange text-pure-white shadow-xs'
                    : 'bg-pure-white text-dark-black/80 border border-soft-cream hover:border-primary-orange/50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Offline</span>
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-dark-black/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workshops..."
                aria-label="Search workshops"
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
          </div>
        </div>
      </section>

      {/* Main Workshops Grid */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
          isLearnerLoggedIn ? 'pb-28 md:pb-12' : 'pb-12'
        }`}
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-pure-white rounded-2xl border border-soft-cream overflow-hidden animate-pulse"
              >
                <div className="w-full h-44 bg-soft-cream" />
                <div className="p-5 space-y-3">
                  <div className="h-3.5 w-1/2 rounded bg-soft-cream" />
                  <div className="h-5 w-4/5 rounded bg-soft-cream" />
                  <div className="h-4 w-full rounded bg-soft-cream" />
                  <div className="pt-3 border-t border-soft-cream flex justify-between">
                    <div className="h-9 w-24 rounded-xl bg-soft-cream" />
                    <div className="h-9 w-20 rounded-xl bg-soft-cream" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : workshops.length === 0 ? (
          <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-soft-cream flex items-center justify-center text-primary-orange mx-auto mb-4">
              <Presentation className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-dark-black">No Workshops Available Yet</h2>
            <p className="text-xs sm:text-sm text-dark-black/70 mt-1.5">
              New live workshops will appear here as soon as they are scheduled.
            </p>
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div className="py-14 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto">
            <h2 className="text-base font-bold text-dark-black">No matching workshops found</h2>
            <p className="text-xs sm:text-sm text-dark-black/65 mt-1">
              Try changing your search query or mode filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setModeFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-soft-cream text-dark-black text-xs font-bold hover:bg-soft-orange/50 transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
        )}
      </main>

      {isLearnerLoggedIn ? <LearnerBottomNavigation /> : <Footer />}
    </div>
  );
}
