'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  GraduationCap,
  Award,
  Video,
  X,
  Compass,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StudySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: 'home' | 'resources' | 'exams' | 'learnings' | 'mylearnings' | 'classrecordings';
  batchProgress?: number;
}

export default function StudySidebar({
  isOpen,
  onClose,
  activeItem,
  batchProgress,
}: StudySidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString();

  const [fetchedProgress, setFetchedProgress] = useState<number>(0);
  const progress = batchProgress !== undefined ? batchProgress : fetchedProgress;

  useEffect(() => {
    if (batchProgress !== undefined) return;

    const batchIdParam = searchParams.get('id');
    if (!batchIdParam) return;

    let isMounted = true;
    async function fetchProgress() {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(batchIdParam!);
        let query = supabase.from('batches').select('progress');
        if (isUuid) {
          query = query.or(`id.eq.${batchIdParam},batch_id.eq.${batchIdParam}`);
        } else {
          query = query.eq('batch_id', batchIdParam!);
        }

        const { data } = await query.maybeSingle();
        if (isMounted && data && data.progress !== undefined && data.progress !== null) {
          setFetchedProgress(Number(data.progress) || 0);
        }
      } catch (err) {
        console.warn('Error fetching batch progress in sidebar:', err);
      }
    }

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [batchProgress, searchParams]);

  const getHref = (basePath: string) =>
    queryString ? `${basePath}?${queryString}` : basePath;

  const resolvedActive =
    activeItem ||
    (pathname?.includes('/study/resources')
      ? 'resources'
      : pathname?.includes('/study/exams') || pathname?.includes('/study/openexam')
      ? 'exams'
      : pathname?.includes('/study/mylearnings') || pathname?.includes('/study/learnings')
      ? 'mylearnings'
      : pathname?.includes('/study/classrecordings')
      ? 'classrecordings'
      : 'home');

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: getHref('/learner/study/dashboard'),
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: BookOpen,
      href: getHref('/learner/study/resources'),
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: GraduationCap,
      href: getHref('/learner/study/exams'),
    },
    {
      id: 'mylearnings',
      label: 'My Learnings',
      icon: Award,
      href: getHref('/learner/study/mylearnings'),
    },
    {
      id: 'classrecordings',
      label: 'Class Recordings',
      icon: Video,
      href: getHref('/learner/study/classrecordings'),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full py-4 px-3 space-y-6">
      {/* Header section inside sidebar */}
      <div className="px-3 pt-1">
        <div className="flex items-center gap-2 text-primary-orange font-bold text-xs uppercase tracking-wider">
          <Compass className="w-4 h-4 text-primary-orange shrink-0" />
          <span>Study Portal</span>
        </div>
        <p className="text-[11px] text-dark-black/60 mt-0.5 font-medium">
          Course Navigation
        </p>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = resolvedActive === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary-orange text-pure-white shadow-xs'
                  : 'text-dark-black/80 hover:text-primary-orange hover:bg-soft-cream/80'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-pure-white' : 'text-primary-orange'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Dynamic Batch Progress Card - Taken from batches.progress */}
      <div className="p-3.5 rounded-2xl bg-pure-white border border-soft-orange/40 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-dark-black font-bold text-xs">
            <Award className="w-4 h-4 text-primary-orange shrink-0" />
            <span>Batch Progress</span>
          </div>
          <span className="text-xs font-mono font-extrabold text-primary-orange bg-soft-cream px-2 py-0.5 rounded-md border border-soft-orange/30">
            {progress}%
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-soft-cream rounded-full h-2 overflow-hidden border border-soft-cream/60">
          <div
            className="bg-primary-orange h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>

        <p className="text-[11px] text-dark-black/65 font-medium leading-snug">
          {progress >= 100
            ? 'All batch course milestones completed!'
            : `${progress}% of batch curriculum completed.`}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* ============================================================== */}
      {/* 1. DESKTOP SIDEBAR: Sticky top at header, stick to left        */}
      {/* ============================================================== */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 bg-pure-white border-r border-soft-orange/30 sticky top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] z-30 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* ============================================================== */}
      {/* 2. MOBILE / TABLET DRAWER: On tap it opens, on tap it closes   */}
      {/* ============================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop (tap to close) */}
          <div
            className="fixed inset-0 bg-dark-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer (slides in from left) */}
          <div className="fixed top-0 bottom-0 left-0 w-64 max-w-[80vw] bg-pure-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200 border-r border-soft-cream">
            {/* Top Bar with Close button */}
            <div className="flex items-center justify-between p-4 border-b border-soft-cream bg-pure-white">
              <div className="flex items-center gap-2 text-primary-orange font-bold text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4 text-primary-orange shrink-0" />
                <span>Study Menu</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-dark-black/60 hover:text-dark-black hover:bg-soft-cream transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
