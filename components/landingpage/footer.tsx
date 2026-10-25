'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllTopics } from '@/lib/coursesStore';
import { Tag } from 'lucide-react';

export default function Footer() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const handleWhyUsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const isHome =
        window.location.pathname === '/' || window.location.pathname === '/landingpage';
      if (isHome) {
        window.history.pushState(null, '', '/#why-us');
        const el = document.getElementById('why-us');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        router.push('/#why-us');
      }
    }
  };

  const handleContactClick = (type: 'learner' | 'mentor', e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const isHome =
        window.location.pathname === '/' || window.location.pathname === '/landingpage';
      if (isHome) {
        window.history.pushState(null, '', `/?type=${type}#contact-us`);
        window.dispatchEvent(new CustomEvent('noviq:set-contact-type', { detail: type }));
        const el = document.getElementById('contact-us');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        router.push(`/?type=${type}#contact-us`);
      }
    }
  };

  const resourceItems = [
    'Mentor Network',
    'Learner Support',
    'Admissions & FAQs',
    'Why Noviq Academy',
    'Privacy Policy',
    'Terms of Service',
    'Cookie Policy',
  ];

  // Topics state fetched from database topics table with fallback
  const [topics, setTopics] = useState<{ id: string; topic_name: string }[]>([
    { id: '1', topic_name: 'Full Stack' },
    { id: '2', topic_name: 'Next.js' },
    { id: '3', topic_name: 'TypeScript' },
    { id: '4', topic_name: 'Python' },
    { id: '5', topic_name: 'Data Science' },
    { id: '6', topic_name: 'Machine Learning' },
    { id: '7', topic_name: 'DevOps' },
    { id: '8', topic_name: 'Docker' },
    { id: '9', topic_name: 'Kubernetes' },
    { id: '10', topic_name: 'Mobile Development' },
    { id: '11', topic_name: 'Flutter' },
    { id: '12', topic_name: 'AI' },
  ]);

  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await getAllTopics();
        if (data && data.length > 0) {
          setTopics(data);
        }
      } catch (err) {
        console.warn('Error loading topics in footer:', err);
      }
    }
    loadTopics();
  }, []);

  return (
    <footer className="w-full bg-dark-black text-pure-white border-t border-dark-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand & Content Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative w-10 h-10 overflow-hidden rounded-full border border-soft-cream/30">
                <Image
                  src="/noviqacademy_logo.png"
                  alt="Noviq Academy Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-pure-white">
                Noviq Academy
              </span>
            </Link>

            <p className="text-sm text-soft-cream max-w-sm leading-relaxed">
              Code Learn Build. Learn programming with industry level Experience. Expert mentors guiding you toward real-world tech careers.
            </p>

            <div className="pt-2 text-xs text-soft-orange">
              Empowering developers worldwide with practical skills, production labs, and live mentorship.
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-primary-orange uppercase">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-soft-cream hover:text-primary-orange transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/publicexplorecourses"
                  className="text-soft-cream hover:text-primary-orange transition-colors"
                >
                  Explore courses
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleWhyUsClick}
                  className="text-soft-cream hover:text-primary-orange transition-colors cursor-pointer text-left"
                >
                  Why choose us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handleContactClick('learner', e)}
                  className="text-soft-cream hover:text-primary-orange transition-colors cursor-pointer text-left"
                >
                  Contact us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => handleContactClick('mentor', e)}
                  className="text-soft-cream hover:text-primary-orange transition-colors cursor-pointer text-left"
                >
                  Become a Mentor
                </button>
              </li>
            </ul>
          </div>

          {/* Topics Table Section: Display the topics table; clicking sends to /publicexplorecourses with selected topic filter */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2 text-primary-orange">
              <Tag className="w-4 h-4" />
              <h3 className="text-sm font-semibold tracking-wider uppercase">
                Topics
              </h3>
            </div>
            <p className="text-xs text-soft-cream/70">
              Browse curriculum by topic. Select any topic to filter courses:
            </p>

            {/* Topics Table / Grid */}
            <div className="border border-soft-cream/20 rounded-xl overflow-hidden bg-soft-cream/5">
              <table className="w-full text-left border-collapse text-xs">
                <tbody>
                  {Array.from({ length: Math.ceil(topics.length / 2) }).map((_, rowIndex) => {
                    const firstTopic = topics[rowIndex * 2];
                    const secondTopic = topics[rowIndex * 2 + 1];

                    return (
                      <tr
                        key={rowIndex}
                        className="border-b border-soft-cream/15 last:border-b-0 hover:bg-soft-cream/10 transition-colors"
                      >
                        {/* Topic 1 */}
                        <td className="w-1/2 p-2.5 border-r border-soft-cream/15">
                          {firstTopic ? (
                            <Link
                              href={`/publicexplorecourses?topic=${encodeURIComponent(
                                firstTopic.topic_name
                              )}`}
                              className="flex items-center justify-between text-soft-cream hover:text-primary-orange font-medium group transition-colors"
                            >
                              <span className="truncate">{firstTopic.topic_name}</span>
                              <span className="text-[10px] text-soft-cream/40 group-hover:text-primary-orange transition-colors ml-1 font-mono">
                                →
                              </span>
                            </Link>
                          ) : null}
                        </td>

                        {/* Topic 2 */}
                        <td className="w-1/2 p-2.5">
                          {secondTopic ? (
                            <Link
                              href={`/publicexplorecourses?topic=${encodeURIComponent(
                                secondTopic.topic_name
                              )}`}
                              className="flex items-center justify-between text-soft-cream hover:text-primary-orange font-medium group transition-colors"
                            >
                              <span className="truncate">{secondTopic.topic_name}</span>
                              <span className="text-[10px] text-soft-cream/40 group-hover:text-primary-orange transition-colors ml-1 font-mono">
                                →
                              </span>
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resources & Support Column */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-primary-orange uppercase">
              Resources &amp; Support
            </h3>
            <ul className="space-y-2 text-sm">
              {resourceItems.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    className="text-soft-cream/80 hover:text-soft-cream transition-colors text-left cursor-default select-none"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom divider & copyright */}
        <div className="mt-12 pt-8 border-t border-soft-cream/20 flex flex-col sm:flex-row items-center justify-between text-xs text-soft-cream gap-4">
          <p>© {currentYear} Noviq Academy. All rights reserved.</p>
          <p className="text-soft-orange">Practical Skills • Real Opportunities</p>
        </div>
      </div>
    </footer>
  );
}
