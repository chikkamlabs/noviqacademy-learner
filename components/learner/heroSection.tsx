'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Search,
  X,
  BookOpen,
  Users,
  BarChart3,
  Flame,
  Terminal,
  Code2,
  Cpu,
  Database,
  Settings,
  Globe,
  Laptop,
  Quote,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Helper to assign a clean Lucide icon to each topic (strict zero-emoji compliance)
function getTopicIcon(topicName: string) {
  const lower = topicName.toLowerCase();
  if (lower.includes('python')) {
    return <Terminal className="w-3.5 h-3.5 text-primary-orange shrink-0" />;
  }
  if (lower.includes('software') || lower.includes('code') || lower.includes('stack')) {
    return <Code2 className="w-3.5 h-3.5 text-primary-orange shrink-0" />;
  }
  if (lower.includes('data') || lower.includes('analysis') || lower.includes('analytics')) {
    return <BarChart3 className="w-3.5 h-3.5 text-primary-orange shrink-0" />;
  }
  if (lower.includes('ai') || lower.includes('machine') || lower.includes('intelligence')) {
    return <Cpu className="w-3.5 h-3.5 text-primary-orange shrink-0" />;
  }
  if (lower.includes('database') || lower.includes('sql')) {
    return <Database className="w-3.5 h-3.5 text-primary-orange shrink-0" />;
  }
  if (lower.includes('devops') || lower.includes('docker') || lower.includes('kubernetes')) {
    return <Settings className="w-3.5 h-3.5 text-primary-orange shrink-0" />;
  }
  if (lower.includes('web') || lower.includes('front') || lower.includes('next')) {
    return <Globe className="w-3.5 h-3.5 text-primary-orange shrink-0" />;
  }
  return <Laptop className="w-3.5 h-3.5 text-primary-orange shrink-0" />;
}

export default function LearnerHeroSection() {
  const router = useRouter();
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch real topics strictly from database without dummy or fallback data
  useEffect(() => {
    let isMounted = true;
    async function loadTopics() {
      try {
        setLoadingTopics(true);
        const { data, error } = await supabase
          .from('topics')
          .select('id, topic_name')
          .order('topic_name', { ascending: true });

        if (!error && data && isMounted) {
          const fetchedNames = data.map((t) => t.topic_name).filter(Boolean);
          setAllTopics(fetchedNames);
        }
      } catch (err) {
        console.warn('Error fetching topics from Supabase:', err);
      } finally {
        if (isMounted) {
          setLoadingTopics(false);
        }
      }
    }
    loadTopics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter topics for the autocomplete dropdown strictly from real database topics
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allTopics.filter((t) => t.toLowerCase().includes(q)).slice(0, 8);
  }, [allTopics, searchQuery]);

  const handleSelectTopic = (topicName: string) => {
    if (!topicName) return;
    setIsDropdownOpen(false);
    router.push(`/learner/explorecourses/dashboard?topic=${encodeURIComponent(topicName)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSelectTopic(searchQuery.trim());
    }
  };

  return (
    <section className="w-full bg-white border-b border-dark-black/10 py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ================= LEFT COLUMN: HERO CONTENT ================= */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            
            {/* 1. Pill Tag: LEARNER HUB */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-soft-orange/20 border border-soft-orange/50 text-xs sm:text-sm font-extrabold text-primary-orange uppercase tracking-wider w-fit shadow-2xs">
              <Sparkles className="w-4 h-4 text-primary-orange shrink-0" />
              <span>Learner Hub</span>
            </div>

            {/* 2. Main Headline */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-dark-black tracking-tight leading-tight">
                Welcome Back,
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary-orange tracking-tight leading-tight">
                  Let&apos;s Keep Building!
                </span>
                {/* Decorative playful radiant marks */}
                <span className="inline-flex items-center gap-0.5 text-primary-orange text-lg sm:text-xl font-black select-none opacity-85">
                  <span className="rotate-[-20deg] inline-block">/</span>
                  <span className="inline-block">|</span>
                  <span className="rotate-[20deg] inline-block">\</span>
                </span>
              </div>
            </div>

            {/* 3. Subtitle description */}
            <p className="text-sm sm:text-base text-dark-black/70 leading-relaxed max-w-lg">
              Explore new courses, continue your learning journey and get one step closer to your goals.
            </p>

            {/* 4. Quote Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-soft-cream/70 border border-soft-orange/40 shadow-xs relative max-w-xl">
              <div className="flex items-start gap-3">
                <Quote className="w-6 h-6 text-primary-orange shrink-0 mt-0.5 fill-primary-orange/20" />
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm italic font-medium text-dark-black leading-relaxed">
                    &ldquo;The capacity to learn is a gift; the willingness to learn is a choice.&rdquo;
                  </p>
                  <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary-orange">
                    — Brian Herbert
                  </p>
                </div>
              </div>
            </div>

            {/* 5. CTA Button: Explore courses */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => router.push('/learner/explorecourses')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-white transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer group"
              >
                <span>Explore courses</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* 6. Three Value Badges: Practical Skills, Experts, Real Projects */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-dark-black/10 max-w-xl">
              {/* Badge 1 */}
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-soft-orange/20 flex items-center justify-center text-primary-orange">
                  <BookOpen className="w-4 h-4 text-primary-orange" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-dark-black leading-tight">
                  Learn Practical Skills
                </p>
              </div>

              {/* Badge 2 */}
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-soft-orange/20 flex items-center justify-center text-primary-orange">
                  <Users className="w-4 h-4 text-primary-orange" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-dark-black leading-tight">
                  Get Guidance from Experts
                </p>
              </div>

              {/* Badge 3 */}
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-soft-orange/20 flex items-center justify-center text-primary-orange">
                  <BarChart3 className="w-4 h-4 text-primary-orange" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-dark-black leading-tight">
                  Work on Real Projects
                </p>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: IMAGE & SEARCH BY TOPIC ================= */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            
            {/* 1. Photograph: public/learnerdb01.png */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-white border border-dark-black/10 shadow-md">
              <Image
                src="/learnerdb01.png"
                alt="Good Learning Always Leads to Great Opportunities"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* 2. Search by Topic Card */}
            <div className="bg-white rounded-2xl border border-dark-black/10 shadow-lg p-5 sm:p-6 space-y-4">
              
              {/* Card Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-soft-orange/20 flex items-center justify-center text-primary-orange shrink-0">
                  <BookOpen className="w-5 h-5 text-primary-orange" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-dark-black tracking-tight leading-snug">
                    Search by Topic
                  </h2>
                  <p className="text-xs text-dark-black/60">
                    Pick or search a skill to explore courses
                  </p>
                </div>
              </div>

              {/* Search Bar Input */}
              <div ref={searchContainerRef} className="relative w-full">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <Search className="w-4 h-4 text-dark-black/40 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="e.g. Python, Web Development, AI..."
                    className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-soft-cream/40 rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange focus:bg-white text-dark-black transition-all shadow-2xs"
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
                </form>

                {/* Autocomplete / Suggested Topics Dropdown */}
                {isDropdownOpen && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-soft-orange/50 shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-dark-black/5">
                    {filteredTopics.length > 0 ? (
                      filteredTopics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleSelectTopic(topic)}
                          className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-semibold text-dark-black hover:bg-soft-cream/80 hover:text-primary-orange transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            {getTopicIcon(topic)}
                            <span>{topic}</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-primary-orange/60" />
                        </button>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectTopic(searchQuery.trim())}
                        className="w-full p-3.5 text-xs text-dark-black/70 hover:bg-soft-cream/60 transition-colors text-left flex items-center justify-between cursor-pointer"
                      >
                        <span>Search courses for &ldquo;{searchQuery}&rdquo;</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary-orange" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Popular Topics Section Header */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-dark-black">
                    <Flame className="w-4 h-4 text-primary-orange shrink-0 fill-primary-orange/20" />
                    <span className="text-xs sm:text-sm font-bold text-dark-black">
                      Popular Topics
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/learner/explorecourses')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-orange hover:text-soft-orange transition-colors cursor-pointer"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Popular Topics Chips (Strictly NO EMOJIS - Lucide icons only - Real DB data only) */}
                {loadingTopics ? (
                  <div className="flex items-center gap-2 py-1">
                    <div className="w-4 h-4 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-dark-black/60 font-medium">Loading topics...</span>
                  </div>
                ) : allTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleSelectTopic(topic)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-soft-cream/50 hover:bg-primary-orange hover:text-white text-dark-black border border-dark-black/10 hover:border-primary-orange transition-all shadow-2xs cursor-pointer group"
                      >
                        <span className="group-hover:text-white transition-colors">
                          {getTopicIcon(topic)}
                        </span>
                        <span>{topic}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-black/50 italic">
                    No topics found. Browse all courses below.
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
