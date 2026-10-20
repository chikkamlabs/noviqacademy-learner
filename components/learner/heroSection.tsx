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
    <section className="w-full bg-pure-white border-b border-soft-cream mt-0 pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Divided into 3 parts: Left (small content), Middle (image), Right (topic search). Covers half screen height (md:h-[50vh]) */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center md:h-[50vh] min-h-[340px] max-h-[480px] py-4 md:py-0 gap-6 md:gap-4 lg:gap-6">
          
          {/* 1. LEFT: Small Content Section (3 cols) */}
          <div className="md:col-span-3 flex flex-col justify-center space-y-3 py-2 md:py-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-soft-cream border border-soft-orange/50 text-[11px] font-bold text-primary-orange uppercase tracking-wider w-fit">
              <Sparkles className="w-3 h-3 text-primary-orange shrink-0" />
              <span>Learner Hub</span>
            </div>

            <div className="relative pl-1">
              <Quote className="w-5 h-5 text-soft-orange/50 absolute -top-2.5 -left-1 -z-0" />
              <p className="relative z-10 font-serif italic text-xs sm:text-sm lg:text-base text-dark-black/90 leading-snug">
                {quote}
              </p>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-orange/90">
              {author}
            </p>

            <button
              type="button"
              onClick={() => router.push('/learner/explorecourses')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-black hover:text-primary-orange transition-colors w-fit pt-1 group cursor-pointer"
            >
              <span>Explore all courses</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 2. MIDDLE: Image Section (5 cols) */}
          <div className="md:col-span-5 h-[200px] sm:h-[240px] md:h-[90%] w-full relative rounded-2xl overflow-hidden bg-soft-cream/30 border border-soft-cream shadow-2xs">
            <Image
              src="/learnerdb1.png"
              alt="Welcome back to Noviq Academy"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 42vw"
            />
          </div>

          {/* 3. RIGHT: Topic Search Bar & Chips (4 cols) */}
          <div className="md:col-span-4 flex flex-col justify-center space-y-3 py-2 md:py-4 bg-pure-white">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-primary-orange">
                <BookOpen className="w-4 h-4 text-primary-orange" />
                <h2 className="text-sm font-extrabold text-dark-black tracking-tight">
                  Search by Topic
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-dark-black/60">
                Pick or search a skill to open dashboard courses
              </p>
            </div>

            {/* Search Input */}
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
                  placeholder="e.g. Next.js, Python, Full Stack..."
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-soft-cream/40 rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange focus:bg-pure-white transition-all text-dark-black shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-2.5 p-1 text-dark-black/40 hover:text-dark-black"
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

            {/* Quick Topic Pills / Chips */}
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[10px] uppercase font-bold text-dark-black/50 tracking-wider">
                Popular Topics:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-hidden">
                {topics.slice(0, 6).map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleSelectTopic(topic)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-soft-cream/70 hover:bg-primary-orange hover:text-pure-white text-dark-black/85 border border-dark-black/10 transition-colors shadow-2xs cursor-pointer"
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
