'use client';

import Image from 'next/image';
import { motion, type Variants } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';

export default function JoinSection() {
  const provisions = [
    'Real time mentorship',
    'Batch wise learnings',
    'More Lab sessions',
    'access to industry level Resources',
  ];

  const headingText = 'We are different! Why?';

  const headingContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.045,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, x: -12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.22,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section id="why-us" className="w-full bg-pure-white text-dark-black pt-16 sm:pt-20 pb-12 sm:pb-16 overflow-hidden border-b border-soft-cream scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Section Heading: Animated writing from left to right when scrolled */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={headingContainerVariants}
          className="mb-10 sm:mb-14 inline-block"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-dark-black flex flex-wrap items-baseline">
            {headingText.split('').map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
            className="h-1 bg-gradient-to-r from-primary-orange via-soft-orange to-transparent origin-left rounded-full mt-2.5 w-full"
          />
        </motion.div>

        {/* 2-Column Content Container: Animation continues throughout this section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side Content */}
          <div className="flex flex-col space-y-6">
            <motion.h3
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-black leading-tight"
            >
              We aren&apos;t just selling courses we are offering Real time Work Experience with experts
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
              className="text-base sm:text-lg text-dark-black font-normal leading-relaxed"
            >
              We find that Students and Fresh Grads facing problems with the lack of practicals
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
              className="space-y-3 pt-2"
            >
              <span className="text-base sm:text-lg font-bold text-primary-orange block">
                So we provide:
              </span>

              <ul className="space-y-3">
                {provisions.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.7 + index * 0.12, ease: 'easeOut' }}
                    className="flex items-center gap-3 text-sm sm:text-base font-semibold text-dark-black"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-orange text-pure-white shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.15, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <button
                type="button"
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold bg-primary-orange text-pure-white rounded-lg hover:bg-soft-orange hover:text-dark-black transition-all shadow-xs"
              >
                <span>Get Startted</span>
                <ArrowRight className="w-5 h-5 text-pure-white group-hover:text-dark-black transition-transform duration-300 group-hover:translate-x-1.5 motion-safe:animate-pulse" />
              </button>

              {/* Explore Courses CTA button with black border removed */}
              <button
                type="button"
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-bold bg-soft-cream text-dark-black rounded-lg hover:bg-soft-orange/30 hover:text-primary-orange transition-all shadow-xs"
              >
                Explore Courses
              </button>
            </motion.div>
          </div>

          {/* Right Side Image */}
          <motion.div
            initial={{ opacity: 0, x: 45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border-2 border-soft-cream shadow-sm hover:border-soft-orange transition-all"
          >
            <Image
              src="/join1.png"
              alt="Real time Work Experience with experts at Noviq Academy"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
