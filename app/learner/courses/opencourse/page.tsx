'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Globe,
  UserCheck,
} from 'lucide-react';
import { getCourseFullDetails, CourseFullDetails } from '@/lib/coursesStore';
import { getLearnerProfile } from '@/lib/profilesStore';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';

function UdemyPreviewCard({
  course,
  selectedRegion,
}: {
  course: CourseFullDetails;
  selectedRegion: 'india' | 'uk';
}) {
  const isUk = selectedRegion === 'uk';
  const currentSellingPrice = isUk ? course.uk_selling_price || 0 : course.selling_price;
  const currentOriginalPrice = isUk ? course.uk_price || 0 : course.price;
  const currencySymbol = isUk ? '£' : '₹';
  const hasDiscount = currentOriginalPrice > currentSellingPrice;
  const discountPercent = hasDiscount
    ? Math.round(((currentOriginalPrice - currentSellingPrice) / currentOriginalPrice) * 100)
    : 0;

  return (
    <div className="bg-pure-white rounded-2xl border-2 border-soft-orange/40 shadow-xl overflow-hidden">
      {/* Media Preview Box */}
      <div className="relative w-full h-52 sm:h-56 bg-dark-black overflow-hidden">
        <Image
          src={course.preview_media_id}
          alt={course.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 380px"
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-dark-black/85 text-pure-white text-xs font-bold backdrop-blur-xs">
          {course.duration} Days
        </div>
      </div>

      {/* Price & Action Box */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Course Title just above the price */}
        <h2 className="text-lg sm:text-xl font-extrabold text-dark-black line-clamp-2 leading-snug">
          {course.title}
        </h2>

        {/* Price Line */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-dark-black tracking-tight">
            {currencySymbol}
            {currentSellingPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <>
              <span className="text-base text-dark-black/50 line-through font-semibold">
                {currencySymbol}
                {currentOriginalPrice.toLocaleString()}
              </span>
              <span className="text-xs font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded-sm">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>

        {/* Primary CTA: Preserves learner auth and navigates to learner registration/dashboard */}
        <div className="space-y-2">
          <Link
            href={`/learner/courseregistration?course_id=${course.id}`}
            className="block w-full py-3.5 px-4 text-center bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-extrabold text-base rounded-xl transition-colors shadow-xs"
          >
            Start Learning Now
          </Link>
          <p className="text-[15px] text-center text-dark-black/60">
            India/Uk difference is for different timings and payment methods
          </p>
        </div>
      </div>
    </div>
  );
}

function CourseModulesAccordion({
  course,
  expandedModules,
  toggleModule,
  toggleAllModules,
  totalLecturesCount,
}: {
  course: CourseFullDetails;
  expandedModules: Record<string, boolean>;
  toggleModule: (id: string) => void;
  toggleAllModules: () => void;
  totalLecturesCount: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          {/* Replaced 'Course content' with 'Course modules' */}
          <h2 className="text-xl sm:text-2xl font-bold text-dark-black">Course modules</h2>
          <p className="text-xs sm:text-sm text-dark-black/70 mt-1">
            {course.modules.length} modules • {totalLecturesCount} Contents • {course.duration}{' '}
            days total length
          </p>
        </div>
        {course.modules.length > 0 && (
          <button
            type="button"
            onClick={toggleAllModules}
            className="text-xs sm:text-sm font-bold text-primary-orange hover:underline self-start sm:self-auto cursor-pointer"
          >
            {course.modules.every((m) => expandedModules[m.id])
              ? 'Collapse all modules'
              : 'Expand all modules'}
          </button>
        )}
      </div>

      {course.modules.length === 0 ? (
        <div className="p-6 rounded-xl border border-soft-cream bg-soft-cream/30 text-xs sm:text-sm text-dark-black/60 text-center">
          No modules published yet for this course.
        </div>
      ) : (
        <div className="border border-soft-cream rounded-xl overflow-hidden divide-y divide-soft-cream">
          {course.modules.map((module, mIdx) => {
            const isExpanded = !!expandedModules[module.id];
            const lecturesCount = module.contents ? module.contents.length : 0;

            return (
              <div key={module.id} className="bg-pure-white">
                {/* Module Header from Course_modules table */}
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-soft-cream/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-dark-black/70 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-dark-black/70 shrink-0" />
                    )}
                    <span className="font-bold text-sm sm:text-base text-dark-black">
                      Section {mIdx + 1}: {module.title}
                    </span>
                  </div>
                  <div className="text-xs text-dark-black/60 shrink-0">
                    {lecturesCount} {lecturesCount === 1 ? 'Content' : 'Contents'}
                  </div>
                </button>

                {/* Module Content from course_module_content table */}
                {isExpanded && (
                  <div className="px-5 py-3 bg-soft-cream/20 border-t border-soft-cream/60 space-y-2.5">
                    {lecturesCount === 0 ? (
                      <p className="text-xs text-dark-black/50 py-1 italic">
                        No Content uploaded for this module yet.
                      </p>
                    ) : (
                      module.contents.map((content) => (
                        <div
                          key={content.id}
                          className="flex items-center justify-between gap-4 text-xs sm:text-sm text-dark-black/85 py-1"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-orange shrink-0" />
                            <span className="font-normal">{content.content}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LearnerOpenCourseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseParam = searchParams.get('course_id') || searchParams.get('id') || '';
  const urlRegionParam = searchParams.get('region');

  const [course, setCourse] = useState<CourseFullDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<'india' | 'uk'>('india');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Verify learner auth and retain learner session & region
      try {
        const learner = await getLearnerProfile();
        if (learner?.region) {
          setSelectedRegion(learner.region === 'uk' ? 'uk' : 'india');
        } else if (urlRegionParam === 'uk') {
          setSelectedRegion('uk');
        } else {
          setSelectedRegion('india');
        }
      } catch (err) {
        console.warn('Error reading learner profile:', err);
      }

      // Fetch course details strictly from database
      const details = await getCourseFullDetails(courseParam);
      setCourse(details);

      // Expand all modules by default so full curriculum is visible
      if (details?.modules) {
        const initialExpanded: Record<string, boolean> = {};
        details.modules.forEach((m) => {
          initialExpanded[m.id] = false;
        });
        setExpandedModules(initialExpanded);
      }

      setLoading(false);
    }

    loadData();
  }, [courseParam, urlRegionParam]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAllModules = () => {
    if (!course?.modules) return;
    const allExpanded = course.modules.every((m) => expandedModules[m.id]);
    const newState: Record<string, boolean> = {};
    course.modules.forEach((m) => {
      newState[m.id] = !allExpanded;
    });
    setExpandedModules(newState);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cream flex flex-col">
        <LearnerHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-dark-black">Loading course details...</p>
          </div>
        </div>
        <LearnerBottomNavigation />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-soft-cream flex flex-col">
        <LearnerHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-dark-black mb-2">Course Not Found</h2>
          <p className="text-sm text-dark-black/70 mb-6 max-w-md">
            The requested course is currently unavailable or may have been deactivated.
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-primary-orange text-pure-white font-bold rounded-lg text-sm shadow-xs cursor-pointer"
          >
            Go Back
          </button>
        </div>
        <LearnerBottomNavigation />
      </div>
    );
  }

  const totalLecturesCount = course.modules.reduce(
    (acc, m) => acc + (m.contents?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-pure-white text-dark-black flex flex-col pb-28 sm:pb-32">
      {/* 1. TOP: Learner Header */}
      <LearnerHeader />

      {/* ============================================================== */}
      {/* MOBILE / TABLET LAYOUT (< lg):                                  */}
      {/* 1st: Right floating preview card                               */}
      {/* 2nd: Dark hero banner                                          */}
      {/* 3rd: What you'll learn picked up slightly into dark hero       */}
      {/* 4th: This course includes right after What you'll learn        */}
      {/* ============================================================== */}
      <div className="block lg:hidden w-full">
        {/* 1. PREVIEW CARD FIRST */}
        <div className="p-4 sm:p-6 bg-soft-cream/30 border-b border-soft-cream">
          <UdemyPreviewCard course={course} selectedRegion={selectedRegion} />
        </div>

        {/* 2. DARK HERO BANNER */}
        <div className="bg-[#1c1d1f] text-pure-white p-6 sm:p-8 space-y-4">
          {/* Breadcrumb Topics */}
          {course.topics && course.topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-primary-orange font-normal">
              <Link href="/learner/explorecourses" className="hover:underline">
                Courses
              </Link>
              <span>&gt;</span>
              {course.topics.slice(0, 3).map((t, i) => (
                <span key={i} className="text-pure-white/80">
                  {t}
                  {i < Math.min(course.topics.length, 3) - 1 ? ' • ' : ''}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-pure-white tracking-tight leading-snug">
            {course.title}
          </h1>

          {/* Subheading */}
          {course.sub_heading && (
            <p className="text-sm sm:text-base text-pure-white/85 leading-relaxed font-normal">
              {course.sub_heading}
            </p>
          )}

          {/* Bestseller Badge, Duration, and Info */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#eceb98] text-[#3d3c0a] font-extrabold uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#3d3c0a]" />
              Bestseller
            </span>
            <div className="flex items-center gap-1.5 text-pure-white/80">
              <Clock className="w-4 h-4 text-primary-orange" />
              <span>{course.duration} Days intensive</span>
            </div>
          </div>

          {/* Course Topics */}
          {course.topics && course.topics.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {course.topics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-pure-white/10 text-pure-white text-xs border border-pure-white/15"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

        </div>

        {/* 3. WHAT YOU'LL LEARN: Picked up slightly into dark hero */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
          <div className="border-2 border-soft-orange/30 rounded-2xl p-5 sm:p-6 bg-pure-white shadow-xl space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-dark-black">What you&apos;ll learn</h2>
            {course.course_learnings && course.course_learnings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-dark-black/90">
                {course.course_learnings.map((learning, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary-orange shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="leading-snug">{learning}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-dark-black/60 italic">
                Comprehensive curriculum syllabus with practical hands-on labs.
              </p>
            )}
          </div>
        </div>

        {/* 4. WHAT COURSE INCLUDES */}
        {course.course_includes && course.course_includes.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
            <div className="border border-soft-cream rounded-2xl p-5 sm:p-6 bg-pure-white shadow-xs space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-dark-black">
                What this course Includes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-dark-black/85">
                {course.course_includes.map((inc, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-primary-orange shrink-0 mt-1.5" />
                    <span className="leading-snug">{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Main Body Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
          {/* Course Modules Accordion */}
          <CourseModulesAccordion
            course={course}
            expandedModules={expandedModules}
            toggleModule={toggleModule}
            toggleAllModules={toggleAllModules}
            totalLecturesCount={totalLecturesCount}
          />

          {/* Requirements */}
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-dark-black">Requirements</h2>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-dark-black/80">
              <li>A laptop or desktop computer (Windows, Mac, or Linux) with internet access.</li>
              <li>Basic curiosity to learn coding and modern engineering best practices.</li>
              <li>No prior advanced programming experience needed; we begin from foundational concepts.</li>
            </ul>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-dark-black">Description</h2>
            <div className="text-xs sm:text-sm text-dark-black/80 leading-relaxed whitespace-pre-line">
              {course.description ||
                'This comprehensive program is designed in collaboration with senior software engineers to take you from foundational syntax to building production-ready architectures.'}
            </div>
          </div>

          {/* Instructor / Mentor */}
          <div className="space-y-4 pt-4 border-t border-soft-cream">
            <h2 className="text-xl sm:text-2xl font-bold text-dark-black">Instructor</h2>
            <div className="flex items-start gap-4">
              <div className="relative w-14 h-14 rounded-full bg-soft-cream border border-soft-orange/50 overflow-hidden shrink-0 flex items-center justify-center font-bold text-primary-orange text-lg">
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-dark-black">
                  {course.mentor_name || 'NoviQ Academy Senior mentor'}
                </h3>
                <p className="text-xs font-semibold text-primary-orange">
                  Senior Industry Lead &amp; Mentor
                </p>
                <p className="text-xs text-dark-black/75 mt-1">
                  Mentoring aspiring engineers and learners with production-grade curriculum, live guidance, and hands-on masterclasses at NoviQ Academy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP LAYOUT (lg and above):                                  */}
      {/* - Dark hero section: Title, Subheading, Bestseller, duration,   */}
      {/*   topics moved a little right side towards centre.              */}
      {/* - Media preview box moved left towards a little centre.         */}
      {/* - What you'll learn picked up slightly into the dark hero.      */}
      {/* - After What you learn: Add What course includes.               */}
      {/* ============================================================== */}
      <div className="hidden lg:block relative w-full">
        {/* Full-width dark background for hero banner */}
        <div className="w-full bg-[#1c1d1f] text-pure-white border-b border-dark-black/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title, Subheading, Bestseller, duration, topics moved a little right side towards centre with pl-8 lg:pl-16 xl:pl-20 */}
            <div className="w-[calc(100%-420px)] pl-8 lg:pl-16 xl:pl-20 pt-16 lg:pt-20 pb-28 lg:pb-32 space-y-4">
              {/* Breadcrumb Topics */}
              {course.topics && course.topics.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-primary-orange font-normal">
                  <Link href="/learner/explorecourses" className="hover:underline">
                    Courses
                  </Link>
                  <span>&gt;</span>
                  {course.topics.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-pure-white/80">
                      {t}
                      {i < Math.min(course.topics.length, 3) - 1 ? ' • ' : ''}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-pure-white tracking-tight leading-tight">
                {course.title}
              </h1>

              {/* Subheading */}
              {course.sub_heading && (
                <p className="text-base sm:text-lg text-pure-white/85 leading-relaxed font-normal max-w-2xl">
                  {course.sub_heading}
                </p>
              )}

              {/* Bestseller Badge, Duration, and Info */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#eceb98] text-[#3d3c0a] font-extrabold uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-[#3d3c0a]" />
                  Bestseller
                </span>
                <div className="flex items-center gap-1.5 text-pure-white/80">
                  <Clock className="w-4 h-4 text-primary-orange" />
                  <span>{course.duration} Days intensive</span>
                </div>
              </div>

              {/* Course Topics */}
              {course.topics && course.topics.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5 max-w-2xl">
                  {course.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-md bg-pure-white/10 text-pure-white text-xs border border-pure-white/15"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Instructor & Language */}
              
            </div>
          </div>
        </div>

        {/* Content Container with Overlapping Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            {/* LEFT MAIN COLUMN: -mt-16 to pick up What you'll learn into the dark hero */}
            <div className="w-[calc(100%-420px)] -mt-16 relative z-10 space-y-12 pb-20">
              {/* WHAT YOU'LL LEARN: Picked up slightly into dark hero */}
              <div className="border-2 border-soft-orange/30 rounded-2xl p-6 sm:p-8 bg-pure-white shadow-xl space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-black">
                  What you&apos;ll learn
                </h2>
                {course.course_learnings && course.course_learnings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-dark-black/90">
                    {course.course_learnings.map((learning, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-primary-orange shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="leading-snug">{learning}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-black/60 italic">
                    Comprehensive curriculum syllabus with practical hands-on labs.
                  </p>
                )}
              </div>

              {/* WHAT COURSE INCLUDES (courses.course_includes): Added after What you learn */}
              {course.course_includes && course.course_includes.length > 0 && (
                <div className="border border-soft-cream rounded-2xl p-6 sm:p-8 bg-pure-white shadow-xs space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-dark-black">
                    What this course Includes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-dark-black/85">
                    {course.course_includes.map((inc, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary-orange shrink-0 mt-1.5" />
                        <span className="leading-snug">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Modules Accordion */}
              <CourseModulesAccordion
                course={course}
                expandedModules={expandedModules}
                toggleModule={toggleModule}
                toggleAllModules={toggleAllModules}
                totalLecturesCount={totalLecturesCount}
              />

              {/* Requirements */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-black">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-dark-black/80">
                  <li>A laptop or desktop computer (Windows, Mac, or Linux) with internet access.</li>
                  <li>Basic curiosity to learn coding and modern engineering best practices.</li>
                  <li>No prior advanced programming experience needed; we begin from foundational concepts.</li>
                </ul>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-black">Description</h2>
                <div className="text-xs sm:text-sm text-dark-black/80 leading-relaxed whitespace-pre-line">
                  {course.description ||
                    'This comprehensive program is designed in collaboration with senior software engineers to take you from foundational syntax to building production-ready architectures.'}
                </div>
              </div>

              {/* Instructor / Mentor */}
              <div className="space-y-4 pt-6 border-t border-soft-cream">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-black">Instructor</h2>
                <div className="flex items-start gap-5">
                  <div className="relative w-16 h-16 rounded-full bg-soft-cream border border-soft-orange/50 overflow-hidden shrink-0 flex items-center justify-center font-bold text-primary-orange text-xl">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-lg">
                    <h3 className="font-bold text-lg text-dark-black">
                      {course.mentor_name || 'NoviQ academy senior mentor'}
                    </h3>
                    <p className="text-xs font-semibold text-primary-orange">
                      Senior Industry Lead &amp; Mentor
                    </p>
                    <p className="text-xs sm:text-sm text-dark-black/75 mt-2">
                      Mentoring aspiring engineers and learners with production-grade curriculum, live guidance, and hands-on masterclasses at NoviQ Academy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT FLOATING PREVIEW CARD: moved left towards a little centre with mr-6 lg:mr-10 xl:mr-16 */}
            <div className="w-[360px] lg:w-[380px] sticky top-20 shrink-0 self-start z-30 -mt-[310px] lg:-mt-[330px] mr-6 lg:mr-10 xl:mr-16 space-y-6">
              <UdemyPreviewCard course={course} selectedRegion={selectedRegion} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM: Learner Bottom Navigation */}
      <LearnerBottomNavigation />
    </div>
  );
}

export default function LearnerOpenCoursePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-soft-cream flex items-center justify-center">
          <p className="text-sm font-semibold text-dark-black">Loading course...</p>
        </div>
      }
    >
      <LearnerOpenCourseContent />
    </Suspense>
  );
}
