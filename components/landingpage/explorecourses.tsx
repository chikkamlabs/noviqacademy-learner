'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { getAllCourses, CourseWithDetails } from '@/lib/coursesStore';
import CourseCard from '@/components/courses/CourseCard';

interface ExploreCoursesProps {
  initialCourses?: CourseWithDetails[];
  region?: 'india' | 'uk';
  showTitle?: boolean;
}

export default function ExploreCoursesSection({
  initialCourses,
  region = 'india',
  showTitle = false,
}: ExploreCoursesProps) {
  const [fetchedCourses, setFetchedCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(!initialCourses || initialCourses.length === 0);

  useEffect(() => {
    if (initialCourses && initialCourses.length > 0) {
      return;
    }

    let isCancelled = false;
    async function loadCourses() {
      setLoading(true);
      const data = await getAllCourses();
      if (!isCancelled) {
        setFetchedCourses(data);
        setLoading(false);
      }
    }
    loadCourses();

    return () => {
      isCancelled = true;
    };
  }, [initialCourses]);

  const courses = initialCourses && initialCourses.length > 0 ? initialCourses : fetchedCourses;

  return (
    <div className="w-full">
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-black tracking-tight">
              All Courses
            </h2>
            <p className="text-xs sm:text-sm text-dark-black/70 mt-1">
              Browse our complete catalog of industry-standard tech programs.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-orange bg-pure-white px-3 py-1.5 rounded-full border border-soft-orange/40 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{courses.length} Courses</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-dark-black/60 font-medium bg-pure-white rounded-xl border border-soft-cream">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center text-sm text-dark-black/60 font-medium bg-pure-white rounded-xl border border-soft-cream">
          No courses available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              region={region}
              className="w-full max-w-[380px] h-[540px] sm:h-[560px]"
            />
          ))}
        </div>
      )}
    </div>
  );
}
