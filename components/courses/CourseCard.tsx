'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, BookOpen, Layers } from 'lucide-react';
import { CourseWithDetails, getTopicsByCourseId } from '@/lib/coursesStore';

interface CourseCardProps {
  course: CourseWithDetails;
  region?: 'india' | 'uk';
  className?: string;
  isPriorityImage?: boolean;
}

export default function CourseCard({
  course,
  region = 'india',
  className = '',
  isPriorityImage = false,
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

  // Fetch topics from course_topics table where course_id is this course.id (or course_id)
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

  const courseUrl = `/courses/opencourse?course_id=${encodeURIComponent(
    course.course_id
  )}&region=${region}`;

  // Description & Subheading
  const rawSubHeading = course.sub_heading || '';
  const formattedSubHeading = rawSubHeading
    ? rawSubHeading.length > 80
      ? `${rawSubHeading.slice(0, 80).trim()} more..`
      : `${rawSubHeading} more..`
    : 'Comprehensive industry program with hands-on labs more..';

  const cardDescription = course.description
    ? course.description.length > 90
      ? `${course.description.slice(0, 90).trim()}...`
      : course.description
    : formattedSubHeading;

  // Topics display: Show top 3. If more than 3, show moree..
  const displayTopics = (courseTopics || []).slice(0, 3);

  // Price calculations
  const isUk = region === 'uk';
  const originalPrice = isUk ? course.uk_price || 0 : course.price || 0;
  const sellingPrice = isUk ? course.uk_selling_price || 0 : course.selling_price || 0;
  const currencySymbol = isUk ? '£' : '₹';

  // Handle Desktop Hover and stick flyout directly to course card
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
      const flyoutWidth = 350;
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
      className={`group relative flex flex-col justify-between bg-pure-white rounded-2xl border-2 border-soft-cream hover:border-primary-orange hover:shadow-xl transition-all duration-200 cursor-pointer p-5 sm:p-6 select-none ${className}`}
    >
      {/* Top Section */}
      <div className="space-y-3.5">
        {/* Course Thumbnail Image */}
        <div className="relative w-full h-48 sm:h-52 md:h-56 rounded-xl overflow-hidden bg-soft-cream border border-soft-cream/60 shrink-0">
          {course.preview_media_id ? (
            <Image
              src={course.preview_media_id}
              alt={course.title}
              fill
              priority={isPriorityImage}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 450px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-soft-cream text-dark-black font-semibold text-base">
              Noviq Academy
            </div>
          )}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-md bg-dark-black/90 text-pure-white text-xs sm:text-sm font-bold backdrop-blur-xs shadow-xs">
            {course.duration} Days
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-extrabold text-dark-black line-clamp-2 leading-snug group-hover:text-primary-orange transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm sm:text-base text-dark-black/75 line-clamp-2 leading-relaxed font-normal">
          {cardDescription}
        </p>

        {/* Bestseller Badge */}
        <div className="pt-0.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#eceb98] text-[#3d3c0a] text-xs sm:text-sm font-extrabold uppercase tracking-wide shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#3d3c0a]" />
            Bestseller
          </span>
        </div>

        {/* Course Topics: Below the bestseller, show top 3 from course_topics. If more than 3, show moree.. */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 min-h-[32px]">
          {displayTopics.map((topic, i) => (
            <span
              key={`${topic}-${i}`}
              className="px-3 py-1.5 rounded-lg bg-soft-cream text-dark-black text-xs sm:text-sm font-semibold border border-soft-orange/30 truncate max-w-[140px]"
            >
              {topic}
            </span>
          ))}
          {courseTopics.length > 3 && (
            <span className="text-xs sm:text-sm font-bold text-primary-orange hover:underline cursor-pointer">
              moree..
            </span>
          )}
        </div>
      </div>

      {/* Bottom Price & Open Course Action */}
      <div className="pt-4 mt-auto border-t border-soft-cream flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          {originalPrice > sellingPrice && (
            <span className="text-sm sm:text-base text-dark-black/45 line-through font-medium">
              {currencySymbol}
              {originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-2xl sm:text-3xl font-black text-primary-orange">
            {currencySymbol}
            {sellingPrice.toLocaleString()}
          </span>
        </div>

        <Link
          href={courseUrl}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="px-5 py-2.5 text-sm sm:text-base font-bold bg-primary-orange text-pure-white rounded-xl hover:bg-soft-orange hover:text-dark-black transition-colors shadow-2xs"
        >
          Open course
        </Link>
      </div>

      {/* DESKTOP HOVER SIDE SECTION STUCK TO ITS COURSE CARD WITH ARROW MARK */}
      {showFlyout && (
        <div
          ref={flyoutRef}
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
          className={`hidden md:flex flex-col w-[320px] lg:w-[350px] bg-pure-white border-2 border-primary-orange rounded-xl shadow-2xl p-5 text-left absolute top-0 ${
            flyoutSide === 'left' ? 'right-full mr-3' : 'left-full ml-3'
          } z-50 h-full max-h-full overflow-y-auto animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Arrow mark pointing between hovered card and course card */}
          {flyoutSide === 'right' ? (
            /* Arrow on left edge of hovered card, pointing left to course card */
            <div
              aria-hidden="true"
              className="absolute top-12 -left-2 w-3.5 h-3.5 bg-pure-white border-l-2 border-b-2 border-primary-orange transform rotate-45 z-20 pointer-events-none"
            />
          ) : (
            /* Arrow on right edge of hovered card, pointing right to course card */
            <div
              aria-hidden="true"
              className="absolute top-12 -right-2 w-3.5 h-3.5 bg-pure-white border-r-2 border-t-2 border-primary-orange transform rotate-45 z-20 pointer-events-none"
            />
          )}

          {/* Invisible hover bridge to maintain mouse continuity across the gap */}
          <div
            className={`absolute top-0 bottom-0 w-4 ${
              flyoutSide === 'left' ? '-right-4' : '-left-4'
            }`}
          />

          {/* Header in Side Section */}
          <div className="pb-3 border-b border-soft-cream">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-orange bg-soft-cream px-2.5 py-1 rounded border border-soft-orange/40">
              Course Quick View
            </span>
            <h4 className="font-bold text-sm sm:text-base text-dark-black mt-2 line-clamp-2 leading-snug">
              {course.title}
            </h4>
          </div>

          {/* course_learnings (top 3) */}
          <div className="py-3 border-b border-soft-cream space-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-dark-black">
              <BookOpen className="w-4 h-4 text-primary-orange shrink-0" />
              <span>What you&apos;ll learn (Top 3)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-dark-black/85">
              {(course.course_learnings && course.course_learnings.length > 0
                ? course.course_learnings.slice(0, 3)
                : [
                    'Production-grade implementation techniques',
                    'Real world architecture best practices',
                    'Job-ready portfolio project development',
                  ]
              ).map((learning, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary-orange shrink-0 mt-0.5 stroke-[2.5]" />
                  <span className="line-clamp-2 leading-snug">{learning}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* course_includes (top 3) */}
          <div className="py-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-dark-black">
              <Layers className="w-4 h-4 text-primary-orange shrink-0" />
              <span>This course includes (Top 3)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-dark-black/85">
              {(course.course_includes && course.course_includes.length > 0
                ? course.course_includes.slice(0, 3)
                : [
                    `${course.duration} Days of intensive coursework`,
                    'Full lifetime access & verified certificate',
                    'Live mentor code reviews & QA sessions',
                  ]
              ).map((inc, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-orange shrink-0 mt-1.5" />
                  <span className="line-clamp-2 leading-snug">{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tap / Click to Open Button */}
          <div className="pt-3 mt-auto border-t border-soft-cream">
            <Link
              href={courseUrl}
              className="block w-full py-2.5 px-4 bg-primary-orange text-pure-white font-bold rounded-lg hover:bg-soft-orange hover:text-dark-black transition-colors text-center text-xs sm:text-sm shadow-xs"
            >
              Go to course details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
