'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import LearnerContactForm from '@/components/learner/contactform';

export default function LearnerHeader() {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenContact = () => setContactModalOpen(true);
    window.addEventListener('noviq:open-learner-contact', handleOpenContact);
    return () =>
      window.removeEventListener('noviq:open-learner-contact', handleOpenContact);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-pure-white border-b border-soft-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Logo & Bold Heading */}
          <Link
            href="/learner/dashboard"
            className="flex items-center gap-3 group"
          >
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

          {/* Right: Chat Icon (opens over-the-screen LearnerContactForm) */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="p-2 text-dark-black hover:text-primary-orange transition-colors rounded-full hover:bg-soft-cream cursor-pointer"
              aria-label="Contact Learner Support"
              title="Contact Support"
            >
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary-orange" />
            </button>
          </div>
        </div>
      </div>

      {/* Over-the-screen Contact Form Modal */}
      <LearnerContactForm
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </header>
  );
}
