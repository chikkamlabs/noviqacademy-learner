'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { getAllCourses, CourseWithDetails } from '@/lib/coursesStore';
import { getLearnerRegion } from '@/lib/profilesStore';
import CourseCard from '@/components/courses/CourseCard';

interface ExploreCourseProps {
  featuredOnly?: boolean;
}

export default function ExploreCourse({ featuredOnly = false }: ExploreCourseProps) {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [learnerRegion, setLearnerRegion] = useState<'india' | 'uk'>('india');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [coursesData, region] = await Promise.all([
        getAllCourses(),
        getLearnerRegion(),
      ]);

      const filtered = featuredOnly
        ? coursesData.filter((course) => course.is_featured === true)
        : coursesData;

      setCourses(filtered);
      setLearnerRegion(region);
      setLoading(false);
    }
    loadData();
  }, [featuredOnly]);

  return (
    <section className="w-full py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-dark-black tracking-tight">
            {featuredOnly ? 'Featured Courses' : 'All Courses'}
          </h3>
          <p className="text-xs sm:text-sm text-dark-black/70 mt-1">
            {featuredOnly
              ? 'Handpicked premier programs to accelerate your learning journey.'
              : 'Browse our complete catalog of industry-ready programs.'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-orange bg-pure-white px-3 py-1.5 rounded-full border border-soft-orange/40">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{courses.length} Available</span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-dark-black/60 font-medium bg-pure-white rounded-xl border border-soft-cream">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center text-sm text-dark-black/60 font-medium bg-pure-white rounded-xl border border-soft-cream">
          {featuredOnly
            ? 'No featured courses available at the moment.'
            : 'No courses available at the moment.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              region={learnerRegion}
              className="w-full max-w-[380px] h-[540px] sm:h-[560px]"
            />
          ))}
        </div>
      )}
    </section>
  );
}
