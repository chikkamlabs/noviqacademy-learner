'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Hourglass,
  Check,
  ExternalLink,
  MessageCircle,
  Tag,
  Presentation,
  BookOpen,
} from 'lucide-react';
import Header from '@/components/landingpage/header';
import Footer from '@/components/landingpage/footer';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import {
  getWorkshopById,
  formatWorkshopDate,
  WorkshopItem,
} from '@/lib/workshopsStore';
import { getLearnerProfile } from '@/lib/profilesStore';

function WorkshopDetailsContent() {
  const searchParams = useSearchParams();
  const workshopId = searchParams.get('id') || '';

  const [workshop, setWorkshop] = useState<WorkshopItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLearnerLoggedIn, setIsLearnerLoggedIn] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const [data, learner] = await Promise.all([
        getWorkshopById(workshopId),
        getLearnerProfile().catch(() => null),
      ]);
      if (!isMounted) return;
      setWorkshop(data);
      setIsLearnerLoggedIn(Boolean(learner));
      setLoading(false);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [workshopId]);

  const isOnline = (workshop?.mode || 'online').toLowerCase() === 'online';

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF8] text-dark-black">
      {isLearnerLoggedIn ? <LearnerHeader /> : <Header showBackButton={true} />}

      <main
        className={`flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 ${
          isLearnerLoggedIn ? 'pb-28 md:pb-14' : 'pb-14'
        }`}
      >
        <div className="mb-6">
          <Link
            href="/workshops"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-pure-white border border-soft-cream text-xs sm:text-sm font-bold text-dark-black hover:text-primary-orange hover:border-primary-orange/50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-primary-orange" />
            <span>Back to Workshops</span>
          </Link>
        </div>

        {loading ? (
          <div className="bg-pure-white rounded-2xl border border-soft-cream p-6 sm:p-8 space-y-6 animate-pulse">
            <div className="h-64 sm:h-80 w-full rounded-xl bg-soft-cream" />
            <div className="h-8 w-2/3 rounded bg-soft-cream" />
            <div className="h-4 w-full rounded bg-soft-cream" />
            <div className="h-4 w-5/6 rounded bg-soft-cream" />
          </div>
        ) : !workshop ? (
          <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-soft-cream flex items-center justify-center text-primary-orange mx-auto mb-4">
              <Presentation className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-dark-black">Workshop Not Found</h1>
            <p className="text-xs sm:text-sm text-dark-black/70 mt-1.5">
              This workshop may have ended or is no longer available.
            </p>
            <Link
              href="/workshops"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-primary-orange text-pure-white rounded-xl hover:bg-soft-orange hover:text-dark-black text-sm font-bold transition-colors"
            >
              <span>Browse Workshops</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Main Details Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Preview Image (905 x 1280) + Hero Info Card */}
              <div className="bg-pure-white rounded-2xl border border-soft-cream shadow-xs overflow-hidden p-5 sm:p-7">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="relative w-full max-w-[320px] md:w-64 lg:w-72 mx-auto md:mx-0 aspect-[905/1280] bg-soft-cream rounded-xl overflow-hidden border border-soft-cream shrink-0">
                    {workshop.preview_image_link && !imgError ? (
                      <Image
                        src={workshop.preview_image_link}
                        alt={workshop.title}
                        width={905}
                        height={1280}
                        priority
                        sizes="(max-width: 768px) 320px, 288px"
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF3E8] to-soft-cream text-primary-orange gap-2">
                        <Presentation className="w-12 h-12 opacity-80" />
                        <span className="text-sm font-bold text-dark-black/60">
                          Noviq Academy Workshop
                        </span>
                      </div>
                    )}

                    {workshop.tag && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-md bg-dark-black/85 text-pure-white text-xs font-bold backdrop-blur-xs shadow-xs">
                        {workshop.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                      {workshop.tag && (
                        <span className="inline-flex items-center gap-1.5 text-primary-orange">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{workshop.tag}</span>
                        </span>
                      )}
                      {workshop.status && (
                        <>
                          {workshop.tag && (
                            <span aria-hidden="true" className="text-dark-black/25">
                              ·
                            </span>
                          )}
                          <span className="capitalize text-emerald-700">
                            Status: {workshop.status}
                          </span>
                        </>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-black tracking-tight leading-snug">
                      {workshop.title}
                    </h1>

                    <div className="pt-3 border-t border-soft-cream">
                      <h2 className="text-sm font-bold text-dark-black mb-2">
                        About this Workshop
                      </h2>
                      <p className="text-sm sm:text-base text-dark-black/80 leading-relaxed whitespace-pre-line">
                        {workshop.description || 'Details will be updated shortly.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What You'll Learn (workshop.learnings JSON) */}
              <div className="bg-pure-white rounded-2xl border border-soft-cream shadow-xs p-5 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-soft-cream">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF3E8] text-primary-orange flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-dark-black">
                    What You&apos;ll Learn
                  </h2>
                </div>

                {workshop.learnings && workshop.learnings.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {workshop.learnings.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-dark-black/85 leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#FFF3E8] text-primary-orange flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs sm:text-sm text-dark-black/65">
                    Key workshop topics and takeaways will be covered live during the session.
                  </p>
                )}
              </div>
            </div>

            {/* Right Sticky Schedule & Registration Card */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-pure-white rounded-2xl border border-soft-cream shadow-sm p-5 sm:p-6 space-y-5">
              <h2 className="text-base sm:text-lg font-extrabold text-dark-black pb-3 border-b border-soft-cream">
                Workshop Details
              </h2>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-dark-black/65 font-medium">
                    <Calendar className="w-4 h-4 text-primary-orange shrink-0" />
                    <span>Date</span>
                  </span>
                  <span className="font-bold text-dark-black text-right">
                    {formatWorkshopDate(workshop.date)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-dark-black/65 font-medium">
                    <Clock className="w-4 h-4 text-primary-orange shrink-0" />
                    <span>Time (IST)</span>
                  </span>
                  <span className="font-bold text-dark-black text-right">
                    {workshop.time ? `${workshop.time} IST` : 'TBA'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-dark-black/65 font-medium">
                    {isOnline ? (
                      <Globe className="w-4 h-4 text-primary-orange shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 text-primary-orange shrink-0" />
                    )}
                    <span>Mode</span>
                  </span>
                  <span className="font-bold text-dark-black capitalize text-right">
                    {workshop.mode || 'Online'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-dark-black/65 font-medium">
                    <Hourglass className="w-4 h-4 text-primary-orange shrink-0" />
                    <span>Duration</span>
                  </span>
                  <span className="font-bold text-dark-black text-right">
                    {workshop.duration || 'TBA'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-soft-cream space-y-3">
                {workshop.registrations_link ? (
                  <a
                    href={workshop.registrations_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-sm font-bold transition-colors shadow-xs"
                  >
                    <span>Register Now</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-dark-black/8 text-dark-black/45 border border-soft-cream text-sm font-bold cursor-not-allowed"
                  >
                    <span>Registration Link Unavailable</span>
                  </button>
                )}

                {workshop.whatsapp_group_link ? (
                  <a
                    href={workshop.whatsapp_group_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366]/12 text-[#128C7E] hover:bg-[#25D366] hover:text-pure-white border border-[#25D366]/35 text-sm font-bold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Join WhatsApp Group</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-dark-black/5 text-dark-black/40 border border-soft-cream text-sm font-bold cursor-not-allowed"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Group Unavailable</span>
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>

      {isLearnerLoggedIn ? <LearnerBottomNavigation /> : <Footer />}
    </div>
  );
}

export default function WorkshopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF8]">
          <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WorkshopDetailsContent />
    </Suspense>
  );
}
