'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Home, BookOpen, Compass, User, Presentation } from 'lucide-react';
import LearnerContactForm from './contactform';

export default function LearnerHeader() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/learner/dashboard',
      icon: Home,
      isActive: pathname === '/learner/dashboard',
    },
    {
      label: 'My courses',
      href: '/learner/courses/dashboard',
      icon: BookOpen,
      isActive:
        pathname?.startsWith('/learner/courses') ||
        pathname?.startsWith('/learner/study'),
    },
    {
      label: 'Explore Courses',
      href: '/learner/explorecourses',
      icon: Compass,
      isActive:
        pathname?.startsWith('/learner/explorecourses') ||
        pathname?.startsWith('/learner/courseregistration') ||
        pathname?.startsWith('/learner/openregistration'),
    },
    {
      label: 'Workshops',
      href: '/workshops',
      icon: Presentation,
      isActive:
        pathname?.startsWith('/workshops') ||
        pathname?.startsWith('/workshop'),
    },
    {
      label: 'Profile',
      href: '/learner/profile/dashboard',
      icon: User,
      isActive: pathname?.startsWith('/learner/profile'),
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-pure-white border-b border-soft-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 md:gap-8 h-16 sm:h-20">
            {/* Left: Logo & Bold Heading */}
            <Link href="/learner/dashboard" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 overflow-hidden rounded-full border border-soft-cream shrink-0">
                <Image
                  src="/noviqacademy_logo.png"
                  alt="Noviq Academy Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-dark-black whitespace-nowrap group-hover:text-primary-orange transition-colors">
                Noviq Academy
              </h1>
            </Link>

            {/* Mobile Center: Explore Courses & Workshops (Icons only on mobile) */}
            <div className="md:hidden flex items-center justify-center gap-3">
              <Link
                href="/learner/explorecourses"
                aria-label="Explore Courses"
                title="Explore Courses"
                className={`p-2 rounded-full transition-colors ${
                  pathname?.startsWith('/learner/explorecourses') ||
                  pathname?.startsWith('/learner/courseregistration') ||
                  pathname?.startsWith('/learner/openregistration')
                    ? 'text-primary-orange bg-soft-cream'
                    : 'text-dark-black hover:text-primary-orange'
                }`}
              >
                <Compass className="w-5 h-5" />
              </Link>
              <Link
                href="/workshops"
                aria-label="Workshops"
                title="Workshops"
                className={`p-2 rounded-full transition-colors ${
                  pathname?.startsWith('/workshops') ||
                  pathname?.startsWith('/workshop')
                    ? 'text-primary-orange bg-soft-cream'
                    : 'text-dark-black hover:text-primary-orange'
                }`}
              >
                <Presentation className="w-5 h-5" />
              </Link>
            </div>

            {/* Tablet & Desktop Center: Bottom Navigation Menu + Explore Courses */}
            <nav
              aria-label="Learner Navigation"
              className="hidden md:flex items-center justify-center gap-6 lg:gap-8"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative inline-flex items-center gap-2 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                      item.isActive
                        ? 'text-primary-orange'
                        : 'text-dark-black/80 hover:text-primary-orange'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-orange rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Chat Icon */}
            <div className="flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="p-2 text-dark-black hover:text-primary-orange transition-colors rounded-full cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary-orange/40"
                aria-label="Open support chat"
              >
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Over-the-screen Contact Form */}
      <LearnerContactForm
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
}
