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
  ArrowLeft,
  GraduationCap,
  Award,
  Globe,
  FileQuestion,
  UserCheck,
} from 'lucide-react';
import { getCourseFullDetails, CourseFullDetails } from '@/lib/coursesStore';
import { getLearnerProfile } from '@/lib/profilesStore';
import Header from '@/components/landingpage/header';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';

function UdemyPreviewCard({
  course,
  selectedRegion,
  isLearnerLoggedIn,
}: {
  course: CourseFullDetails;
  selectedRegion: 'india' | 'uk';
  isLearnerLoggedIn: boolean;
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

        {/* Primary CTA */}
        <div className="space-y-2">
          <Link
            href={
              isLearnerLoggedIn
                ? `/learner/courseregistration?course_id=${encodeURIComponent(course.id)}`
                : '/signup'
            }
            className="block w-full py-3.5 px-4 text-center bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-extrabold text-base rounded-xl transition-colors shadow-xs"
          >
            Start Learning Now
          </Link>
          <p className="text-[11px] text-center text-dark-black/60">
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
            {course.modules.length} modules • {totalLecturesCount} lectures • {course.duration}{' '}
            days total length
          </p>
        </div>
        {course.modules.length > 0 && (
          <button
            type="button"
            onClick={toggleAllModules}
            className="text-xs sm:text-sm font-bold text-primary-orange hover:underline self-start sm:self-auto"
          >
            {course.modules.every((m) => expandedModules[m.id])
              ? 'Collapse all modules'
              : 'Expand all modules'}
          </button>
        )}
      </div>

      {course.modules.length === 0 ? (
        <div className="p-6 rounded-xl border border-soft-cream bg-soft-cream/30 text-xs sm:text-sm text-dark-black/60">
          No modules available for this course yet.
        </div>
      ) : (
        <div className="border border-dark-black/15 rounded-xl divide-y divide-dark-black/10 overflow-hidden bg-pure-white shadow-2xs">
          {course.modules.map((module, mIdx) => {
            const isExpanded = !!expandedModules[module.id];

            return (
              <div key={module.id} className="bg-pure-white">
                {/* Module Header from Course_modules table */}
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-5 py-4 flex items-center justify-between bg-soft-cream/40 hover:bg-soft-cream transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-dark-black/70 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-dark-black/70 shrink-0" />
                    )}
                    <span className="font-bold text-sm sm:text-base text-dark-black">
                      Section {mIdx + 1}: {module.title}
                    </span>
                  </div>
                  <span className="text-xs text-dark-black/60 font-medium shrink-0 ml-2">
                    {module.contents?.length || 0} lectures
                  </span>
                </button>

                {/* Module Contents from course_module_content table */}
                {isExpanded && (
                  <div className="px-5 py-3 space-y-2.5 bg-pure-white">
                    {module.contents && module.contents.length > 0 ? (
                      module.contents.map((item, cIdx) => (
                        <div
                          key={item.id || cIdx}
                          className="flex items-center justify-between py-1.5 text-xs sm:text-sm text-dark-black border-b border-dark-black/5 last:border-0"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base shrink-0">{item.emoji || '📖'}</span>
                            <span className="font-medium text-dark-black/90">{item.content}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-dark-black/50 italic py-1">
                        No lectures available in this module yet.
                      </p>
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

function OpenCourseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseParam = searchParams.get('course_id') || searchParams.get('id') || '';
  const urlRegionParam = searchParams.get('region');

  const [course, setCourse] = useState<CourseFullDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<'india' | 'uk'>('india');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isLearnerLoggedIn, setIsLearnerLoggedIn] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Check if learner is logged in
      const learner = await getLearnerProfile();
      if (learner) {
        setIsLearnerLoggedIn(true);
        setSelectedRegion(learner.region === 'uk' ? 'uk' : 'india');
      } else if (urlRegionParam === 'uk') {
        setSelectedRegion('uk');
      } else {
        setSelectedRegion('india');
      }

      // Fetch course details (fetches all modules for course_id)
      const details = await getCourseFullDetails(courseParam);
      setCourse(details);

      // Expand all modules by default so all are displayed
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
      <div className="min-h-screen bg-soft-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-dark-black">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-soft-cream flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-dark-black mb-2">Course Not Found</h2>
        <p className="text-sm text-dark-black/70 mb-6 max-w-md">
          The requested course is currently unavailable or may have been deactivated.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-primary-orange text-pure-white font-bold rounded-lg text-sm shadow-xs"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isUk = selectedRegion === 'uk';
  const totalLecturesCount = course.modules.reduce((acc, m) => acc + (m.contents?.length || 0), 0);

  return (
    <div className="min-h-screen bg-pure-white text-dark-black flex flex-col">
      {/* Header: Learner header if logged in, otherwise public header */}
      {isLearnerLoggedIn ? (
        <LearnerHeader />
      ) : (
        <Header
          showBackButton={true}
          showRegionSelector={!isLearnerLoggedIn}
          selectedRegion={selectedRegion}
          onRegionChange={(reg) => setSelectedRegion(reg)}
        />
      )}

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
          <UdemyPreviewCard
            course={course}
            selectedRegion={selectedRegion}
            isLearnerLoggedIn={isLearnerLoggedIn}
          />
        </div>

        {/* 2. DARK HERO BANNER SECOND */}
        <section className="w-full bg-[#1c1d1f] text-pure-white pt-10 pb-16 sm:pb-20 px-4 sm:px-6 space-y-4">
          {/* Breadcrumb Topics */}
          {course.topics && course.topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-primary-orange font-normal">
              <Link
                href={isLearnerLoggedIn ? '/learner/explorecourses' : '/publicexplorecourses'}
                className="hover:underline"
              >
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

          {/* Title: NORMAL FONT */}
          <h1 className="text-2xl sm:text-3xl font-normal tracking-normal leading-snug text-pure-white">
            {course.title}
          </h1>

          {/* Subheading: NORMAL FONT */}
          {course.sub_heading && (
            <p className="text-base text-pure-white/90 leading-relaxed font-normal">
              {course.sub_heading}
            </p>
          )}

          {/* Bestseller Badge */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs bg-[#eceb98] text-[#3d3c0a] font-extrabold uppercase tracking-wider text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Bestseller
            </span>
          </div>

          {/* Duration written below Bestseller */}
          <div className="flex items-center gap-2 text-sm text-pure-white/90 font-normal">
            <Clock className="w-4 h-4 text-primary-orange" />
            <span>
              Course Duration:{' '}
              <strong className="text-pure-white font-medium">{course.duration} Days</strong>
            </span>
          </div>

          {/* Below Duration: put all course_topics */}
          {course.topics && course.topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {course.topics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-pure-white/10 text-pure-white text-xs font-normal border border-pure-white/20"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Mentor info */}
          {course.mentor_name && (
            <div className="flex items-center gap-1.5 text-xs text-pure-white/80 pt-1 font-normal">
              <UserCheck className="w-4 h-4 text-primary-orange" />
              <span>
                Created by{' '}
                <strong className="text-pure-white font-medium">{course.mentor_name}</strong>
              </span>
            </div>
          )}
        </section>

        {/* 3. Pick up What you'll learn slightly into dark hero banner (-mt-8 sm:-mt-10) */}
        <div className="px-4 sm:px-6 -mt-8 sm:-mt-10 relative z-10 space-y-8 bg-transparent">
          {/* What you'll learn (Picked up slightly into the dark hero section) */}
          {course.course_learnings && course.course_learnings.length > 0 && (
            <div className="border border-dark-black/15 rounded-2xl p-5 sm:p-6 bg-pure-white shadow-xl space-y-3.5">
              <h2 className="text-lg sm:text-xl font-bold text-dark-black">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.course_learnings.map((learning, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary-orange shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-sm text-dark-black/90 leading-snug font-medium">
                      {learning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* After What you learn Add What course includes(courses.course_includes) */}
          {course.course_includes && course.course_includes.length > 0 && (
            <div className="border border-dark-black/15 rounded-2xl p-5 sm:p-6 bg-pure-white shadow-xs space-y-3.5">
              <h2 className="text-lg sm:text-xl font-bold text-dark-black">This course includes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.course_includes.map((inc, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary-orange shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-xs sm:text-sm text-dark-black/90 leading-snug font-medium">
                      {inc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course modules (Module headers from course_modules, content from course_module_content, strictly no demo data) */}
          <CourseModulesAccordion
            course={course}
            expandedModules={expandedModules}
            toggleModule={toggleModule}
            toggleAllModules={toggleAllModules}
            totalLecturesCount={totalLecturesCount}
          />

          {/* Description */}
          {course.description && (
            <div className="space-y-3 pt-4 border-t border-dark-black/10">
              <h2 className="text-lg sm:text-xl font-bold text-dark-black">Description</h2>
              <div className="text-sm text-dark-black/80 leading-relaxed whitespace-pre-line">
                {course.description}
              </div>
            </div>
          )}

          {/* Course Exams / Assessments */}
          {course.exams && course.exams.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-dark-black/10">
              <h2 className="text-lg sm:text-xl font-bold text-dark-black flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-primary-orange" />
                Assessments &amp; Certification Exams
              </h2>
              <div className="space-y-3">
                {course.exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 rounded-xl bg-soft-cream/40 border border-soft-orange/30 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-dark-black text-sm">{exam.title}</h4>
                      {exam.description && (
                        <p className="text-xs text-dark-black/70 mt-0.5">{exam.description}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-md bg-pure-white text-xs font-semibold text-primary-orange border border-soft-orange/40 shrink-0">
                      {exam.total_q} Questions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructor Details */}
          <div className="space-y-3 pt-4 border-t border-dark-black/10 pb-10">
            <h2 className="text-lg sm:text-xl font-bold text-dark-black">Instructor</h2>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-soft-cream/30 border border-dark-black/10">
              <div className="w-12 h-12 rounded-full bg-primary-orange/10 border-2 border-primary-orange flex items-center justify-center text-primary-orange font-bold text-lg shrink-0">
                {course.mentor_name ? course.mentor_name.charAt(0).toUpperCase() : 'N'}
              </div>
              <div>
                <h3 className="font-bold text-dark-black text-base">
                  {course.mentor_name || 'Noviq Academy Mentor Team'}
                </h3>
                <p className="text-xs font-semibold text-primary-orange">
                  Senior Industry Lead &amp; Mentor
                </p>
                <p className="text-xs text-dark-black/75 mt-1.5">
                  Mentoring aspiring engineers and learners with production-grade curriculum, live
                  guidance, and hands-on masterclasses at Noviq Academy.
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
                  <Link
                    href={isLearnerLoggedIn ? '/learner/explorecourses' : '/publicexplorecourses'}
                    className="hover:underline"
                  >
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

              {/* Title: NORMAL FONT */}
              <h1 className="text-3xl lg:text-4xl font-normal tracking-normal leading-snug text-pure-white">
                {course.title}
              </h1>

              {/* Subheading: NORMAL FONT */}
              {course.sub_heading && (
                <p className="text-base lg:text-lg text-pure-white/90 leading-relaxed font-normal">
                  {course.sub_heading}
                </p>
              )}

              {/* Bestseller Badge */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs bg-[#eceb98] text-[#3d3c0a] font-extrabold uppercase tracking-wider text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bestseller
                </span>
              </div>

              {/* Course duration below Bestseller */}
              <div className="flex items-center gap-2 text-sm text-pure-white/90 font-normal">
                <Clock className="w-4 h-4 text-primary-orange" />
                <span>
                  Course Duration:{' '}
                  <strong className="text-pure-white font-medium">{course.duration} Days</strong>
                </span>
              </div>

              {/* Below Duration: put all course_topics */}
              {course.topics && course.topics.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {course.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-pure-white/10 text-pure-white text-xs font-normal border border-pure-white/20"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Mentor info */}
              {course.mentor_name && (
                <div className="flex items-center gap-1.5 text-xs text-pure-white/80 pt-1 font-normal">
                  <UserCheck className="w-4 h-4 text-primary-orange" />
                  <span>
                    Created by{' '}
                    <strong className="text-pure-white font-medium">{course.mentor_name}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Preview Card Container positioned starting from top dark hero banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
          <div className="flex gap-8 lg:gap-10 items-start">
            {/* LEFT COLUMN: 'What you'll learn' picked up slightly into dark hero section (-mt-16 lg:-mt-20) and moved a little right towards centre (pl-8 lg:pl-16 xl:pl-20) */}
            <div className="w-[calc(100%-420px)] pl-8 lg:pl-16 xl:pl-20 -mt-16 lg:-mt-20 relative z-20 pb-16 space-y-8">
              {/* 1. What you'll learn Box (Picked up slightly into the dark hero section) */}
              {course.course_learnings && course.course_learnings.length > 0 && (
                <div className="border border-dark-black/15 rounded-2xl p-6 sm:p-8 bg-pure-white shadow-xl space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-dark-black">
                    What you&apos;ll learn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {course.course_learnings.map((learning, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary-orange shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="text-xs sm:text-sm text-dark-black/90 leading-snug font-medium">
                          {learning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. After What you learn Add What course includes(courses.course_includes) */}
              {course.course_includes && course.course_includes.length > 0 && (
                <div className="border border-dark-black/15 rounded-2xl p-6 sm:p-8 bg-pure-white shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-dark-black">
                    This course includes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {course.course_includes.map((inc, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary-orange shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="text-xs sm:text-sm text-dark-black/90 leading-snug font-medium">
                          {inc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Course modules (Module header from Course_modules, content from course_module_content, strictly no demo data) */}
              <CourseModulesAccordion
                course={course}
                expandedModules={expandedModules}
                toggleModule={toggleModule}
                toggleAllModules={toggleAllModules}
                totalLecturesCount={totalLecturesCount}
              />

              {/* 4. Description Section */}
              {course.description && (
                <div className="space-y-4 pt-4 border-t border-dark-black/10">
                  <h2 className="text-xl sm:text-2xl font-bold text-dark-black">Description</h2>
                  <div className="text-sm sm:text-base text-dark-black/80 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </div>
                </div>
              )}

              {/* 5. Course Exams / Assessments */}
              {course.exams && course.exams.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-dark-black/10">
                  <h2 className="text-xl sm:text-2xl font-bold text-dark-black flex items-center gap-2">
                    <FileQuestion className="w-6 h-6 text-primary-orange" />
                    Assessments &amp; Certification Exams
                  </h2>
                  <div className="space-y-3">
                    {course.exams.map((exam) => (
                      <div
                        key={exam.id}
                        className="p-4 rounded-xl bg-soft-cream/40 border border-soft-orange/30 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-dark-black text-sm sm:text-base">
                            {exam.title}
                          </h4>
                          {exam.description && (
                            <p className="text-xs text-dark-black/70 mt-0.5">{exam.description}</p>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-md bg-pure-white text-xs font-semibold text-primary-orange border border-soft-orange/40 shrink-0">
                          {exam.total_q} Questions
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Mentor / Instructor Details */}
              <div className="space-y-4 pt-4 border-t border-dark-black/10">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-black">Instructor</h2>
                <div className="flex items-start gap-4 p-5 rounded-xl bg-soft-cream/30 border border-dark-black/10">
                  <div className="w-14 h-14 rounded-full bg-primary-orange/10 border-2 border-primary-orange flex items-center justify-center text-primary-orange font-bold text-xl shrink-0">
                    {course.mentor_name ? course.mentor_name.charAt(0).toUpperCase() : 'N'}
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-black text-lg">
                      {course.mentor_name || 'Noviq Academy Mentor Team'}
                    </h3>
                    <p className="text-xs font-semibold text-primary-orange">
                      Senior Industry Lead &amp; Mentor
                    </p>
                    <p className="text-xs sm:text-sm text-dark-black/75 mt-2">
                      Mentoring aspiring engineers and learners with production-grade curriculum,
                      live guidance, and hands-on masterclasses at Noviq Academy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT FLOATING PREVIEW CARD: moved left towards a little centre with mr-6 lg:mr-10 xl:mr-16 */}
            <div className="w-[360px] lg:w-[380px] sticky top-20 shrink-0 self-start z-30 -mt-[310px] lg:-mt-[330px] mr-6 lg:mr-10 xl:mr-16 space-y-6">
              <UdemyPreviewCard
                course={course}
                selectedRegion={selectedRegion}
                isLearnerLoggedIn={isLearnerLoggedIn}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`mt-auto py-6 bg-soft-cream/60 border-t border-soft-cream text-center text-xs text-dark-black/60 ${
          isLearnerLoggedIn ? 'pb-24 lg:pb-6' : ''
        }`}
      >
        &copy; {new Date().getFullYear()} Noviq Academy. All rights reserved.
      </footer>

      {/* Bottom Navigation for Learner */}
      {isLearnerLoggedIn && <LearnerBottomNavigation />}
    </div>
  );
}

export default function OpenCoursePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-soft-cream flex items-center justify-center">
          <p className="text-sm font-semibold text-dark-black">Loading course...</p>
        </div>
      }
    >
      <OpenCourseContent />
    </Suspense>
  );
}
