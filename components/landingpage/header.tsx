'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, ArrowLeft, ChevronDown, GraduationCap, UserCheck } from 'lucide-react';

interface HeaderProps {
  showRegionSelector?: boolean;
  selectedRegion?: 'india' | 'uk';
  onRegionChange?: (region: 'india' | 'uk') => void;
  showBackButton?: boolean;
}

export default function Header({
  showRegionSelector = false,
  selectedRegion = 'india',
  onRegionChange,
  showBackButton = false,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [couponsHeight, setCouponsHeight] = useState(0);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const router = useRouter();
  const contactDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContactMouseEnter = () => {
    if (contactDropdownTimeoutRef.current) {
      clearTimeout(contactDropdownTimeoutRef.current);
      contactDropdownTimeoutRef.current = null;
    }
    setContactDropdownOpen(true);
  };

  const handleContactMouseLeave = () => {
    contactDropdownTimeoutRef.current = setTimeout(() => {
      setContactDropdownOpen(false);
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (contactDropdownTimeoutRef.current) {
        clearTimeout(contactDropdownTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
  let observed: HTMLElement | null = null;

  const ro =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => update())
      : null;

  function update() {
    const el = document.getElementById('coupons-section');
    setCouponsHeight(el ? el.getBoundingClientRect().height : 0);

    // (re)attach the ResizeObserver if the element appeared/changed
    if (el !== observed) {
      if (observed) ro?.unobserve(observed);
      observed = el;
      if (el) ro?.observe(el);
    }
  }

  update();

  // Coupons render after an async fetch, so watch the DOM for it
  const mo = new MutationObserver(update);
  mo.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('resize', update);

  return () => {
    window.removeEventListener('resize', update);
    mo.disconnect();
    ro?.disconnect();
  };
}, []);

  // Handle hash scrolling when page loads with #why-us or #contact-us
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#why-us' || hash.startsWith('#contact-us')) {
        setTimeout(() => {
          const id = hash.startsWith('#contact-us') ? 'contact-us' : 'why-us';
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    }
  }, []);

  const handleWhyChooseUsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined') {
      const isHome = window.location.pathname === '/' || window.location.pathname === '/landingpage';
      if (isHome) {
        const el = document.getElementById('why-us');
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', '/#why-us');
          setMobileMenuOpen(false);
        }
      }
    }
  };

  const handleContactClick = (type: 'learner' | 'mentor', e: React.MouseEvent) => {
    e.preventDefault();
    if (contactDropdownTimeoutRef.current) {
      clearTimeout(contactDropdownTimeoutRef.current);
      contactDropdownTimeoutRef.current = null;
    }
    setContactDropdownOpen(false);
    setMobileMenuOpen(false);

    if (typeof window !== 'undefined') {
      const isHome = window.location.pathname === '/' || window.location.pathname === '/landingpage';
      if (isHome) {
        window.history.pushState(null, '', `/#contact-us?type=${type}`);
        window.dispatchEvent(new CustomEvent('noviq:set-contact-type', { detail: type }));
        const el = document.getElementById('contact-us');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        router.push(`/#contact-us?type=${type}`);
      }
    }
  };

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Explore courses', href: '/publicexplorecourses' },
    { label: 'Why choose us', href: '/#why-us' },
  ];

  return (
    <header
      style={{ top: `${couponsHeight}px` }}
      className="sticky z-40 w-full bg-pure-white border-b border-soft-cream text-dark-black transition-[top] duration-75 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Back button (if needed), Logo & Brand Name & Desktop Navigation Menu */}
          <div className="flex items-center gap-6 lg:gap-8">
            {showBackButton && (
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-dark-black hover:text-primary-orange transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 overflow-hidden rounded-full border border-soft-cream shadow-xs shrink-0">
                <Image
                  src="/noviqacademy_logo.png"
                  alt="Noviq Academy Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-dark-black group-hover:text-primary-orange transition-colors">
                NoviQ Academy
              </span>
            </Link>

            {/* Desktop Main Navigation Menu - Kept across all pages */}
            <nav className="hidden md:flex items-center gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={item.href.includes('#why-us') ? handleWhyChooseUsClick : undefined}
                  className="text-sm font-medium text-dark-black hover:text-primary-orange transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              {/* Contact Us (Learner and Mentor) Dropdown */}
              <div
                className="relative"
                onMouseEnter={handleContactMouseEnter}
                onMouseLeave={handleContactMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setContactDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-black hover:text-primary-orange transition-colors cursor-pointer py-1"
                >
                  <span>Contact us</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      contactDropdownOpen ? 'rotate-180 text-primary-orange' : ''
                    }`}
                  />
                </button>

                {contactDropdownOpen && (
                  <div
                    onMouseEnter={handleContactMouseEnter}
                    onMouseLeave={handleContactMouseLeave}
                    className="absolute top-full left-0 pt-2 w-64 z-50"
                  >
                    <div className="bg-pure-white rounded-xl border border-soft-cream shadow-xl p-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <button
                        type="button"
                        onClick={(e) => handleContactClick('learner', e)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-soft-cream/80 transition-colors flex items-start gap-3 group cursor-pointer"
                      >
                        <div className="p-1.5 rounded-md bg-soft-orange/30 text-primary-orange group-hover:bg-primary-orange group-hover:text-pure-white transition-colors shrink-0 mt-0.5">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-dark-black group-hover:text-primary-orange transition-colors">
                            Contact as Learner
                          </div>
                          <div className="text-[11px] text-dark-black/70 leading-snug">
                            Course inquiries &amp; curriculum advice
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleContactClick('mentor', e)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-soft-cream/80 transition-colors flex items-start gap-3 group mt-1 cursor-pointer"
                      >
                        <div className="p-1.5 rounded-md bg-soft-orange/30 text-primary-orange group-hover:bg-primary-orange group-hover:text-pure-white transition-colors shrink-0 mt-0.5">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-dark-black group-hover:text-primary-orange transition-colors">
                            Become a Mentor
                          </div>
                          <div className="text-[11px] text-dark-black/70 leading-snug">
                            Join senior mentor cohort &amp; instruct
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right: Region selector + Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {showRegionSelector && (
              <div className="flex items-center rounded-lg bg-soft-cream p-1 border border-soft-orange/40">
                <button
                  type="button"
                  onClick={() => onRegionChange?.('india')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    selectedRegion === 'india'
                      ? 'bg-primary-orange text-pure-white shadow-xs'
                      : 'text-dark-black hover:text-primary-orange'
                  }`}
                >
                  India (₹)
                </button>
                <button
                  type="button"
                  onClick={() => onRegionChange?.('uk')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    selectedRegion === 'uk'
                      ? 'bg-primary-orange text-pure-white shadow-xs'
                      : 'text-dark-black hover:text-primary-orange'
                  }`}
                >
                  UK (£)
                </button>
              </div>
            )}

            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-dark-black hover:text-primary-orange transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 text-sm font-semibold bg-primary-orange text-pure-white rounded-md hover:bg-soft-orange hover:text-dark-black transition-colors shadow-xs"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Right: Region switcher + 3-lines menu button */}
          <div className="flex md:hidden items-center gap-2">
            {showRegionSelector && (
              <div className="flex items-center rounded-lg bg-soft-cream p-0.5 border border-soft-orange/40 text-[11px]">
                <button
                  type="button"
                  onClick={() => onRegionChange?.('india')}
                  className={`px-2 py-1 font-bold rounded ${
                    selectedRegion === 'india'
                      ? 'bg-primary-orange text-pure-white'
                      : 'text-dark-black'
                  }`}
                >
                  ₹
                </button>
                <button
                  type="button"
                  onClick={() => onRegionChange?.('uk')}
                  className={`px-2 py-1 font-bold rounded ${
                    selectedRegion === 'uk'
                      ? 'bg-primary-orange text-pure-white'
                      : 'text-dark-black'
                  }`}
                >
                  £
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-dark-black hover:text-primary-orange focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-pure-white border-b border-soft-cream px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (item.href.includes('#why-us')) {
                    handleWhyChooseUsClick(e);
                  }
                }}
                className="px-3 py-2 text-base font-medium text-dark-black hover:text-primary-orange hover:bg-soft-cream rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Contact us options (learner and mentor) */}
            <div className="pt-2 pb-1 border-t border-soft-cream">
              <div className="px-3 py-1 text-xs font-bold text-dark-black/60 uppercase tracking-wider">
                Contact Us
              </div>
              <div className="mt-1 flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={(e) => handleContactClick('learner', e)}
                  className="w-full text-left px-3 py-2.5 text-sm font-semibold text-dark-black hover:text-primary-orange hover:bg-soft-cream rounded-md transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-primary-orange" />
                  <span>Contact as Learner</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleContactClick('mentor', e)}
                  className="w-full text-left px-3 py-2.5 text-sm font-semibold text-dark-black hover:text-primary-orange hover:bg-soft-cream rounded-md transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-primary-orange" />
                  <span>Become a Mentor</span>
                </button>
              </div>
            </div>
          </nav>
          <div className="pt-4 border-t border-soft-cream flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-sm font-semibold border border-dark-black text-dark-black rounded-md hover:bg-soft-cream transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-sm font-semibold bg-primary-orange text-pure-white rounded-md hover:bg-soft-orange hover:text-dark-black transition-colors shadow-xs"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
