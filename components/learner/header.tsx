'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import LearnerContactForm from './contactform';

export default function LearnerHeader() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-pure-white border-b border-soft-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Logo & Bold Heading */}
            <Link href="/learner/dashboard" className="flex items-center gap-3 group">
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

            {/* Center: Explore Courses */}
            <div className="text-center px-2">
              <Link
                href="/learner/explorecourses"
                className="text-sm sm:text-base font-semibold text-dark-black hover:text-primary-orange transition-colors"
              >
                Explore Courses
              </Link>
            </div>

            {/* Right: Chat Icon */}
            <div className="flex items-center justify-end">
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
