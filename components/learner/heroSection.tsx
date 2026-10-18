import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Quote, ArrowRight } from 'lucide-react';

export default function LearnerHeroSection() {
  const quote =
    '“The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. Welcome back to shaping your future.”';
  const author = '— Brian Herbert';

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
      {/* Container: On laptop covers only 1/2 screen height with increased width (max-w-7xl) */}
      <div className="w-full max-w-7xl mx-auto bg-pure-white rounded-2xl sm:rounded-3xl shadow-sm border border-soft-orange/30 overflow-hidden">
        
        {/* DESKTOP / LAPTOP LAYOUT (md and up): 1/2 screen height, left quote + CTA, right image */}
        <div className="hidden md:grid md:grid-cols-2 items-center md:h-[50vh] min-h-[360px] max-h-[500px]">
          {/* Left Column: Motivational quote + CTA */}
          <div className="p-8 lg:p-12 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-cream border border-soft-orange/50 text-xs font-bold text-primary-orange uppercase tracking-wider w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Continue Learning</span>
              </div>

              <div className="relative">
                <Quote className="w-8 h-8 text-soft-orange/40 absolute -top-3 -left-2 -z-0" />
                <p className="relative z-10 font-serif italic text-lg lg:text-xl xl:text-2xl text-dark-black leading-relaxed">
                  {quote}
                </p>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-primary-orange">
                {author}
              </p>
            </div>

            {/* Desktop CTA: Explore Courses */}
            <div className="pt-4">
              <Link
                href="/learner/explorecourses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-orange text-pure-white font-bold text-sm rounded-xl hover:bg-soft-orange hover:text-dark-black transition-colors w-fit shadow-xs"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="relative h-full w-full bg-soft-cream">
            <Image
              src="/learnerdb1.png"
              alt="Welcome back to Noviq Academy"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 50vw, 50vw"
            />
          </div>
        </div>

        {/* MOBILE LAYOUT (below md): Quote over the image with rectangular Explore courses CTA */}
        <div className="relative md:hidden w-full min-h-[300px] overflow-hidden">
          {/* Background Image */}
          <Image
            src="/learnerdb1.png"
            alt="Welcome back to Noviq Academy"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />

          {/* Dark gradient overlay for clear contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-black/95 via-dark-black/70 to-dark-black/40" />

          {/* Text & Rectangular CTA Over the Image */}
          <div className="absolute inset-0 p-5 flex flex-col justify-end text-left space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-orange/90 text-pure-white text-[11px] font-bold uppercase tracking-wider w-fit shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>Welcome Back</span>
            </div>

            <p className="font-serif italic text-sm sm:text-base text-soft-cream font-medium leading-snug drop-shadow-sm">
              {quote}
            </p>

            <span className="text-[11px] font-bold text-soft-orange tracking-wide">
              {author}
            </span>

            {/* Mobile Rectangle Shape Explore Courses CTA */}
            <Link
              href="/learner/explorecourses"
              className="mt-2 block w-full py-3 text-center bg-primary-orange text-pure-white text-xs font-bold rounded-none hover:bg-soft-orange hover:text-dark-black transition-colors uppercase tracking-wider shadow-sm"
            >
              Explore Courses
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
