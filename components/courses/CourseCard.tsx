'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CourseWithDetails, getTopicsByCourseId } from '@/lib/coursesStore';

interface CourseCardProps {
  course: CourseWithDetails;
  region?: 'india' | 'uk';
  className?: string;
  isPriorityImage?: boolean;
  hrefPrefix?: string;
}

export default function CourseCard({
  course,
  region = 'india',
  className = '',
  isPriorityImage = false,
  hrefPrefix,
}: CourseCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [showFlyout, setShowFlyout] = useState(false);
  const [flyoutSide, setFlyoutSide] = useState<'right' | 'left'>('right');
  const [courseTopics, setCourseTopics] = useState<string[]>(course.topics || []);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate fallback topics if database table currently has 0 rows for this course
  const getDefaultTopicsForCourse = (c: CourseWithDetails): string[] => {
    if (c.topics && c.topics.length > 0) return c.topics;
    const lower = `${c.title} ${c.sub_heading || ''} ${c.description || ''}`.toLowerCase();
    if (lower.includes('python')) {
      return ['Python Basics', 'Data Structures', 'OOP in Python', 'File Handling & Modules', 'Data Analysis'];
    }
    if (lower.includes('next') || lower.includes('react') || lower.includes('ts') || lower.includes('full stack')) {
      return ['Next.js 15', 'TypeScript', 'React 19', 'PostgreSQL', 'Tailwind CSS'];
    }
    if (lower.includes('devops') || lower.includes('docker') || lower.includes('cloud') || lower.includes('kubernetes')) {
      return ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS Cloud', 'Terraform'];
    }
    if (lower.includes('flutter') || lower.includes('dart') || lower.includes('mobile')) {
      return ['Flutter', 'Dart', 'State Management', 'Mobile UI', 'API Integration'];
    }
    if (lower.includes('ai') || lower.includes('llm') || lower.includes('ml') || lower.includes('genai')) {
      return ['Generative AI', 'LLM Agents', 'Vector Databases', 'Prompt Engineering', 'Python'];
    }
    if (lower.includes('golang') || lower.includes('go ') || lower.includes('backend')) {
      return ['Go Concurrency', 'Microservices', 'Goroutines', 'gRPC', 'Distributed Systems'];
    }
    return ['Foundations', 'Core Concepts', 'Hands-on Labs', 'Architecture'];
  };

  // Fetch topics from course_topics table
  useEffect(() => {
    let isCurrent = true;
    async function loadTopics() {
      if (course?.id) {
        const fetched = await getTopicsByCourseId(course.id, course.course_id);
        if (isCurrent && fetched && fetched.length > 0) {
          setCourseTopics(fetched);
          return;
        }
      }
      if (isCurrent && course?.topics && course.topics.length > 0) {
        setCourseTopics(course.topics);
        return;
      }
      if (isCurrent) {
        setCourseTopics(getDefaultTopicsForCourse(course));
      }
    }
    loadTopics();
    return () => {
      isCurrent = false;
    };
  }, [course]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const targetBase =
    hrefPrefix ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/learner')
      ? '/learner/courses/opencourse'
      : '/courses/opencourse');

  const courseUrl = `${targetBase}?course_id=${encodeURIComponent(
    course.course_id
  )}&region=${region}`;

  // Description & Subheading
  const rawSubHeading = course.sub_heading || '';
  const formattedSubHeading = rawSubHeading
    ? rawSubHeading.length > 70
      ? `${rawSubHeading.slice(0, 70).trim()} more..`
      : `${rawSubHeading} more..`
    : 'Comprehensive industry program with hands-on labs more..';

  const cardDescription = course.description
    ? course.description.length > 80
      ? `${course.description.slice(0, 80).trim()}...`
      : course.description
    : formattedSubHeading;

  // Topics display: Show top 3.
  const displayTopics = (courseTopics || []).slice(0, 3);

  // Price calculations
  const isUk = region === 'uk';
  const originalPrice = isUk ? course.uk_price || 0 : course.price || 0;
  const sellingPrice = isUk ? course.uk_selling_price || 0 : course.selling_price || 0;
  const currencySymbol = isUk ? '£' : '₹';

  // Handle Desktop Hover and side placement
  const handleMouseEnter = () => {
    if (typeof window === 'undefined' || window.innerWidth < 768) {
      return;
    }

    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const flyoutWidth = 290;
      // If overflowing right window border, stick to left side of card
      if (rect.right + flyoutWidth > window.innerWidth - 16) {
        setFlyoutSide('left');
      } else {
        setFlyoutSide('right');
      }
    }

    setShowFlyout(true);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setShowFlyout(false);
    }, 120);
  };

  const handleFlyoutMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleFlyoutMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setShowFlyout(false);
    }, 120);
  };

  const handleCardClick = () => {
    router.push(courseUrl);
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative z-10 hover:z-30 flex flex-col  bg-pure-white rounded-2xl border-2 border-soft-cream hover:border-primary-orange hover:shadow-lg transition-all duration-200 cursor-pointer p-4 sm:p-4.5 select-none ${className}`}
    >
      {/* Top Section */}
      <div className="space-y-3">
        {/* Course Thumbnail Image (decreased slightly) */}
        <div className="relative w-full h-38 sm:h-42 md:h-46 rounded-xl overflow-hidden bg-soft-cream border border-soft-cream/60 shrink-0">
          {course.preview_media_id ? (
            <Image
              src={course.preview_media_id}
              alt={course.title}
              fill
              priority={isPriorityImage}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-soft-cream text-dark-black font-semibold text-sm">
              Noviq Academy
            </div>
          )}
          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-dark-black/90 text-pure-white text-xs font-bold backdrop-blur-xs shadow-xs">
            {course.duration} Days
          </div>
        </div>

        {/* Title (decreased slightly) */}
        <h3 className="text-base sm:text-lg font-bold text-dark-black line-clamp-2 leading-snug group-hover:text-primary-orange transition-colors">
          {course.title}
        </h3>

        {/* Description (decreased slightly) */}
        <p className="text-xs sm:text-sm text-dark-black/75 line-clamp-2 leading-relaxed font-normal">
          {cardDescription}
        </p>

        {/* Bestseller Badge */}
        <div className="pt-0.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#eceb98] text-[#3d3c0a] text-xs font-bold uppercase tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#3d3c0a]" />
            Bestseller
          </span>
        </div>

        {/* Course Topics */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {displayTopics.map((topic, i) => (
            <span
              key={`${topic}-${i}`}
              className="px-2.5 py-1 rounded-md bg-soft-cream text-dark-black text-xs font-medium border border-soft-orange/30 truncate max-w-[120px]"
            >
              {topic}
            </span>
          ))}
          {courseTopics.length > 3 && (
            <span className="text-xs font-bold text-primary-orange hover:underline cursor-pointer">
              moree..
            </span>
          )}
        </div>
      </div>

      {/* Bottom Price & Open Course Action (decreased slightly) */}
      <div className="pt-3 mt-3 border-t border-soft-cream flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          {originalPrice > sellingPrice && (
            <span className="text-xs sm:text-sm text-dark-black/45 line-through font-medium">
              {currencySymbol}
              {originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-xl sm:text-2xl font-black text-primary-orange">
            {currencySymbol}
            {sellingPrice.toLocaleString()}
          </span>
        </div>

        <Link
          href={courseUrl}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="px-4 py-2 text-xs sm:text-sm font-bold bg-primary-orange text-pure-white rounded-xl hover:bg-soft-orange hover:text-dark-black transition-colors shadow-2xs"
        >
          Open course
        </Link>
      </div>

      {/* DESKTOP HOVER SIDE SECTION WITH CONNECTING CURLY BRACKET ANIMATION */}
      {/* Uses z-30 (less than header z-50) so while scrolling it passes below header same as main card */}
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            ref={flyoutRef}
            initial={{
              opacity: 0,
              scale: 0.94,
              x: flyoutSide === 'right' ? -10 : 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              x: flyoutSide === 'right' ? -8 : 8,
            }}
            transition={{
              duration: 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
            onMouseEnter={handleFlyoutMouseEnter}
            onMouseLeave={handleFlyoutMouseLeave}
            className={`hidden md:flex flex-col w-[260px] lg:w-[280px] bg-pure-white border-2 border-primary-orange rounded-xl shadow-2xl p-2.5 sm:p-3 text-left absolute top-1/2 -translate-y-1/2 ${
              flyoutSide === 'left' ? 'right-full mr-3.5' : 'left-full ml-3.5'
            } z-30 h-auto max-h-[380px] overflow-y-auto [scrollbar-width:thin]`}
          >
            {/* CONNECTING CURLY BRACKET SVG BETWEEN CARD AND HOVERED SECTION */}
            {flyoutSide === 'right' ? (
              /* Curly bracket { positioned on left edge of flyout connecting to card */
              <div
                aria-hidden="true"
                className="absolute top-1/2 -left-3.5 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20"
              >
                <svg
                  className="w-3.5 h-10 text-primary-orange stroke-current"
                  viewBox="0 0 14 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3 C6 3, 6 18, 2 24 C6 30, 6 45, 12 45"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : (
              /* Curly bracket } positioned on right edge of flyout connecting to card */
              <div
                aria-hidden="true"
                className="absolute top-1/2 -right-3.5 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20"
              >
                <svg
                  className="w-3.5 h-10 text-primary-orange stroke-current"
                  viewBox="0 0 14 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 3 C8 3, 8 18, 12 24 C8 30, 8 45, 2 45"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* Invisible hover bridge to maintain mouse continuity across the gap */}
            <div
              className={`absolute top-0 bottom-0 w-4.5 ${
                flyoutSide === 'left' ? '-right-4.5' : '-left-4.5'
              }`}
            />

            {/* Header in Side Section */}
            <div className="pb-1 border-b border-soft-cream">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-orange bg-soft-cream px-2 py-0.5 rounded border border-soft-orange/40">
                Course Quick View
              </span>
              <h4 className="font-bold text-xs text-dark-black mt-1 line-clamp-1 leading-tight">
                {course.title}
              </h4>
            </div>

            {/* course_learnings (top 2) */}
            <div className="py-1.5 border-b border-soft-cream space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-dark-black">
                <BookOpen className="w-3 h-3 text-primary-orange shrink-0" />
                <span>What you&apos;ll learn</span>
              </div>
              <ul className="space-y-0.5 text-[10.5px] text-dark-black/85">
                {(course.course_learnings && course.course_learnings.length > 0
                  ? course.course_learnings.slice(0, 2)
                  : [
                      'Production-grade implementation techniques',
                      'Real world architecture best practices',
                    ]
                ).map((learning, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-primary-orange shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="line-clamp-1 leading-snug">{learning}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* course_includes (top 2) */}
            <div className="py-1.5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-dark-black">
                <Layers className="w-3 h-3 text-primary-orange shrink-0" />
                <span>This course includes</span>
              </div>
              <ul className="space-y-0.5 text-[10.5px] text-dark-black/85">
                {(course.course_includes && course.course_includes.length > 0
                  ? course.course_includes.slice(0, 2)
                  : [
                      `${course.duration} Days of intensive coursework`,
                      'Full lifetime access & verified certificate',
                    ]
                ).map((inc, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-orange shrink-0 mt-0.5" />
                    <span className="line-clamp-1 leading-snug">{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tap / Click to Open Button */}
            <div className="pt-1.5 mt-auto border-t border-soft-cream">
              <Link
                href={courseUrl}
                className="block w-full py-1.5 px-3 bg-primary-orange text-pure-white font-bold rounded-lg hover:bg-soft-orange hover:text-dark-black transition-colors text-center text-xs shadow-xs"
              >
                Go to course details
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
