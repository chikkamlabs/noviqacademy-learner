'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getTrendingCourses, CourseWithDetails } from '@/lib/coursesStore';
import CourseCard from '@/components/courses/CourseCard';

export default function TrendingCoursesSection() {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<'india' | 'uk'>('india');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCourses() {
      const data = await getTrendingCourses();
      setCourses(data);
    }
    loadCourses();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 370;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <motion.section
      id="courses"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full bg-pure-white text-dark-black py-14 sm:py-16 border-b border-soft-cream overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-cream border border-soft-orange/50 text-xs font-semibold text-primary-orange uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary-orange" />
              <span>In-Demand Curriculum</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-dark-black">
              Trending Courses
            </h2>
          </div>

          {/* Region selector & Horizontal Scroll Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Region Selector */}
            <div className="flex items-center rounded-lg bg-soft-cream p-1 border border-soft-orange/40">
              <button
                type="button"
                onClick={() => setSelectedRegion('india')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  selectedRegion === 'india'
                    ? 'bg-primary-orange text-pure-white shadow-xs'
                    : 'text-dark-black hover:text-primary-orange'
                }`}
              >
                India (₹)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion('uk')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  selectedRegion === 'uk'
                    ? 'bg-primary-orange text-pure-white shadow-xs'
                    : 'text-dark-black hover:text-primary-orange'
                }`}
              >
                UK (£)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                aria-label="Scroll left"
                className="p-2.5 rounded-full border-2 border-dark-black text-dark-black bg-pure-white hover:bg-primary-orange hover:text-pure-white hover:border-primary-orange transition-colors shadow-xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                aria-label="Scroll right"
                className="p-2.5 rounded-full border-2 border-dark-black text-dark-black bg-pure-white hover:bg-primary-orange hover:text-pure-white hover:border-primary-orange transition-colors shadow-xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Moving Scroll Container with Standardized CourseCard UI */}
        {courses.length === 0 ? (
          <div className="py-12 text-center text-sm text-dark-black/60 font-medium bg-soft-cream/40 rounded-xl border border-soft-cream">
            No courses available at the moment.
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                region={selectedRegion}
                className="w-[300px] sm:w-[320px] md:w-[340px] shrink-0 snap-start"
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
