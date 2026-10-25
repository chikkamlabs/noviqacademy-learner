'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, Quote, Search, ArrowRight, X, BookOpen } from 'lucide-react';
import { getAllTopics } from '@/lib/coursesStore';

export default function LearnerHeroSection() {
  const router = useRouter();

  const [topics, setTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load topics for topic search
  useEffect(() => {
    let isMounted = true;
    async function loadTopics() {
      try {
        const raw = await getAllTopics();
        if (isMounted) {
          const names = Array.from(new Set(raw.map((t) => t.topic_name).filter(Boolean)));
          setTopics(names);
        }
      } catch {
        if (isMounted) {
          setTopics([
            'Full Stack',
            'Next.js',
            'TypeScript',
            'Python',
            'Machine Learning',
            'AI',
            'DevOps',
            'Docker',
            'Kubernetes',
            'Mobile Development',
          ]);
        }
      }
    }
    loadTopics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) {
      return topics.slice(0, 8);
    }
    const q = searchQuery.toLowerCase().trim();
    return topics.filter((t) => t.toLowerCase().includes(q));
  }, [topics, searchQuery]);

  // Navigate directly to explorecourses dashboard with selected topic
  const handleSelectTopic = (topicName: string) => {
    if (!topicName) return;
    router.push(`/learner/explorecourses/dashboard?topic=${encodeURIComponent(topicName)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSelectTopic(searchQuery.trim());
    }
  };

  const quote =
    '“The capacity to learn is a gift; the willingness to learn is a choice.”';
  const author = '— Brian Herbert';

  return (
    <section className="w-full bg-pure-white border-b border-soft-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Divided into 3 parts: Left (Learner Hub CTA), Middle (Image), Right (Search by Topic). Ample spacing on mobile to prevent collision */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center min-h-0 md:min-h-[400px] lg:h-[50vh] py-6 sm:py-8 md:py-6 gap-8 md:gap-6 lg:gap-8">
          
          {/* 1. LEFT: Learner Hub Content & CTA Button (4 cols on desktop) */}
          <div className="md:col-span-4 flex flex-col justify-center space-y-4 py-2 md:py-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-soft-cream border border-soft-orange/60 text-xs sm:text-sm md:text-base font-extrabold text-primary-orange uppercase tracking-wider w-fit shadow-xs">
              <Sparkles className="w-4 h-4 text-primary-orange shrink-0" />
              <span>Learner Hub</span>
            </div>

            <div className="relative pl-1">
              <Quote className="w-6 h-6 text-soft-orange/50 absolute -top-3 -left-1.5 -z-0" />
              <p className="relative z-10 font-serif italic text-sm sm:text-base md:text-lg lg:text-xl text-dark-black/90 leading-snug">
                {quote}
              </p>
            </div>

            <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-primary-orange/90">
              {author}
            </p>

            {/* CTA Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => router.push('/learner/explorecourses')}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm md:text-base bg-primary-orange text-pure-white hover:bg-soft-orange hover:text-dark-black transition-all duration-200 shadow-md hover:shadow-lg w-fit group cursor-pointer"
              >
                <span>Explore courses</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 2. MIDDLE: Image Section - Perfectly fitted (5 cols on desktop) */}
          <div className="md:col-span-5 flex items-center justify-center py-2">
            <div className="relative w-full max-w-[420px] aspect-[306/213] rounded-2xl overflow-hidden bg-soft-cream/20 border border-soft-cream/60 shadow-xs flex items-center justify-center">
              <Image
                src="/learnerdb1.png"
                alt="Welcome to Noviq Academy"
                fill
                priority
                className="object-contain object-center p-1"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </div>
          </div>

          {/* 3. RIGHT: Topics Section - Decreased Size (3 cols on desktop) */}
          <div className="md:col-span-3 flex flex-col justify-center space-y-3 py-2 md:py-4 bg-pure-white">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-primary-orange">
                <BookOpen className="w-4 h-4 text-primary-orange shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-dark-black tracking-tight">
                  Search by Topic
                </h2>
              </div>
              <p className="text-[11px] text-dark-black/60">
                Pick or search a skill to explore courses
              </p>
            </div>

            {/* Search Input (Compact Size) */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-dark-black/50 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="e.g. Next.js, Python, AI..."
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-soft-cream/40 rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange focus:bg-pure-white transition-all text-dark-black shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-2.5 p-1 text-dark-black/40 hover:text-dark-black cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete / Suggested Topics Dropdown when typing */}
              {isDropdownOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-pure-white rounded-xl border border-soft-orange/40 shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-soft-cream">
                  {filteredTopics.length > 0 ? (
                    filteredTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          setSearchQuery(topic);
                          setIsDropdownOpen(false);
                          handleSelectTopic(topic);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-dark-black hover:bg-soft-cream hover:text-primary-orange transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{topic}</span>
                        <ArrowRight className="w-3 h-3 text-primary-orange/60" />
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-[11px] text-dark-black/60 text-center">
                      Press enter to search &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Quick Topic Pills / Chips (Compact) */}
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[10px] uppercase font-bold text-dark-black/50 tracking-wider">
                Popular Topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topics.slice(0, 6).map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleSelectTopic(topic)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-soft-cream/80 hover:bg-primary-orange hover:text-pure-white text-dark-black/85 border border-dark-black/10 transition-colors shadow-2xs cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
