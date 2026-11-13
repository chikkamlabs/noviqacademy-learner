'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Globe,
  MapPin,
  MessageCircle,
  ExternalLink,
  ArrowRight,
  Presentation,
} from 'lucide-react';
import { WorkshopItem, formatWorkshopDate } from '@/lib/workshopsStore';

interface WorkshopCardProps {
  workshop: WorkshopItem;
}

export default function WorkshopCard({ workshop }: WorkshopCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const openHref = `/workshop?id=${encodeURIComponent(workshop.id)}`;
  const isOnline = (workshop.mode || 'online').toLowerCase() === 'online';
  const formattedDate = formatWorkshopDate(workshop.date);

  return (
    <article
      onClick={() => router.push(openHref)}
      className="group bg-pure-white rounded-2xl border border-soft-cream hover:border-primary-orange shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Container + Top-Right Tag (905 x 1280) */}
      <div className="relative w-full aspect-[905/1280] bg-soft-cream overflow-hidden shrink-0">
        {workshop.preview_image_link && !imgError ? (
          <Image
            src={workshop.preview_image_link}
            alt={workshop.title}
            width={905}
            height={1280}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF3E8] to-soft-cream text-primary-orange gap-2">
            <Presentation className="w-9 h-9 opacity-85" />
            <span className="text-xs font-bold text-dark-black/60">Noviq Workshop</span>
          </div>
        )}

        {/* Tag on Top Right */}
        {workshop.tag && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-dark-black/85 text-pure-white text-xs font-bold backdrop-blur-xs shadow-xs max-w-[60%] truncate">
            {workshop.tag}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5">
          {/* Quick Meta Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dark-black/70">
            {workshop.date && (
              <span className="inline-flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                <span>{formattedDate}</span>
              </span>
            )}
            {workshop.time && (
              <span className="inline-flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                <span>{workshop.time} IST</span>
              </span>
            )}
            {workshop.mode && (
              <span className="inline-flex items-center gap-1 font-semibold text-dark-black">
                {isOnline ? (
                  <Globe className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                )}
                <span className="capitalize">{workshop.mode}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-lg font-bold text-dark-black group-hover:text-primary-orange transition-colors leading-snug line-clamp-2">
            {workshop.title}
          </h2>

          {/* Description: Single line, expands on tap "more" */}
          <div className="text-xs sm:text-sm text-dark-black/75 leading-relaxed">
            {descExpanded ? (
              <p className="whitespace-pre-line">
                {workshop.description}{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDescExpanded(false);
                  }}
                  className="text-primary-orange font-bold hover:underline cursor-pointer inline ml-1"
                >
                  less
                </button>
              </p>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <p className="line-clamp-1 flex-1 min-w-0">
                  {workshop.description || 'Hands-on live workshop session.'}
                </p>
                {workshop.description && workshop.description.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDescExpanded(true);
                    }}
                    className="text-primary-orange font-bold hover:underline cursor-pointer shrink-0 text-xs"
                  >
                    more
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions: Register button, WhatsApp icon, Open button */}
        <div className="pt-3.5 border-t border-soft-cream flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {workshop.registrations_link ? (
              <a
                href={workshop.registrations_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-bold transition-colors shadow-2xs whitespace-nowrap shrink-0"
              >
                <span>Register</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-black/8 text-dark-black/40 border border-soft-cream text-xs sm:text-sm font-bold cursor-not-allowed whitespace-nowrap shrink-0"
              >
                <span>Register</span>
              </button>
            )}

            {workshop.whatsapp_group_link ? (
              <a
                href={workshop.whatsapp_group_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label="Join WhatsApp Group"
                title="Join WhatsApp Group"
                className="inline-flex items-center justify-center p-2 rounded-xl bg-[#25D366]/12 text-[#128C7E] hover:bg-[#25D366] hover:text-pure-white border border-[#25D366]/35 transition-colors shrink-0"
              >
                <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                onClick={(e) => e.stopPropagation()}
                aria-label="WhatsApp link unavailable"
                title="WhatsApp group link not available"
                className="inline-flex items-center justify-center p-2 rounded-xl bg-dark-black/5 text-dark-black/30 border border-soft-cream cursor-not-allowed shrink-0"
              >
                <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            )}
          </div>

          <Link
            href={openHref}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-soft-cream hover:bg-soft-orange/50 text-dark-black border border-soft-orange/40 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary-orange" />
          </Link>
        </div>
      </div>
    </article>
  );
}
