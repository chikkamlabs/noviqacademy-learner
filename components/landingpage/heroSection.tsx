'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CODE_SNIPPETS = [
  {
    file: 'src/academy.ts',
    lines: [
      { num: 1, text: '// Noviq Academy • Full Stack & Cloud', color: 'text-zinc-500 italic' },
      { num: 2, text: 'import { createLearner } from "@noviq/core";', color: 'text-purple-400' },
      { num: 3, text: 'const student = await createLearner({', color: 'text-sky-300' },
      { num: 4, text: '  track: "Next.js + AI Engineering",', color: 'text-emerald-400' },
      { num: 5, text: '  mentorship: "1-on-1 Senior Lead",', color: 'text-emerald-400' },
      { num: 6, text: '});', color: 'text-zinc-300' },
      { num: 7, text: 'await student.deployProject();', color: 'text-amber-300' },
      { num: 8, text: '// Ready for top tech career 🚀', color: 'text-primary-orange font-semibold' },
    ],
    output: '✓ Build succeeded. 0 errors, 14 tests passing [42ms]',
  },
  {
    file: 'src/api/routes.py',
    lines: [
      { num: 1, text: '# Data Science & Predictive AI Model', color: 'text-zinc-500 italic' },
      { num: 2, text: 'from noviq import Pipeline, FastInference', color: 'text-purple-400' },
      { num: 3, text: 'model = Pipeline.train(dataset="real_world")', color: 'text-sky-300' },
      { num: 4, text: 'accuracy = model.evaluate(metric="f1_score")', color: 'text-emerald-400' },
      { num: 5, text: 'print(f"Accuracy: {accuracy * 100:.1f}%")', color: 'text-amber-300' },
      { num: 6, text: 'FastInference.serve(model, port=8000)', color: 'text-emerald-300' },
      { num: 7, text: '# Production endpoint live on cloud ⚡', color: 'text-primary-orange font-semibold' },
    ],
    output: '✓ Pipeline trained • 99.4% precision • Model serving live',
  },
];

function CodeEditorAnimation() {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [step, setStep] = useState(1);

  const currentSnippet = CODE_SNIPPETS[snippetIndex];
  const totalLines = currentSnippet.lines.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        // Step 1 to totalLines: lines typing
        // Step totalLines to totalLines + 6: execution pause
        if (prev < totalLines + 6) {
          return prev + 1;
        } else {
          setSnippetIndex((s) => (s + 1) % CODE_SNIPPETS.length);
          return 1;
        }
      });
    }, 380);

    return () => clearInterval(timer);
  }, [totalLines]);

  const displayedCount = Math.min(step, totalLines);
  const isExecuting = step >= totalLines;

  return (
    <div className="w-full rounded-xl overflow-hidden bg-[#18181b] border border-zinc-800 shadow-xl font-mono select-none">
      {/* Window Title Bar */}
      <div className="bg-[#27272a]/70 px-3.5 py-2 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span className="ml-2 text-[11px] text-zinc-400 font-medium">{currentSnippet.file}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Runner</span>
        </div>
      </div>

      {/* Code Lines Body */}
      <div className="p-3.5 sm:p-4 text-xs sm:text-[13px] leading-relaxed space-y-1 min-h-[175px]">
        {currentSnippet.lines.slice(0, displayedCount).map((l, idx) => (
          <div key={l.num} className="flex items-start gap-2.5">
            <span className="text-zinc-600 select-none w-4 text-right text-[11px] shrink-0 font-normal">
              {l.num}
            </span>
            <span className={l.color}>
              {l.text}
              {idx === displayedCount - 1 && (
                <span className="inline-block w-1.5 h-3.5 bg-primary-orange animate-pulse align-middle ml-1" />
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Terminal execution footer */}
      <div className="bg-[#121214] px-3.5 py-2 border-t border-zinc-800/90 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-2 truncate">
          <span className="text-primary-orange font-bold">$</span>
          <span className={isExecuting ? 'text-emerald-400 truncate' : 'text-zinc-500 truncate'}>
            {isExecuting ? currentSnippet.output : 'compiling & executing program...'}
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 shrink-0 ml-2">Node v22 • live</span>
      </div>
    </div>
  );
}

function ContinuousCodeLearnBuild() {
  const fullText = 'EXPLORE APPLY ACHIEVE';
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText.length < fullText.length) {
      // Writing forward character by character
      timeout = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length + 1));
      }, 110);
    } else if (!isDeleting && displayText.length === fullText.length) {
      // Finished writing full phrase, hold for 1.8s
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
    } else if (isDeleting && displayText.length > 0) {
      // Erasing back from right to left
      timeout = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length - 1));
      }, 55);
    } else if (isDeleting && displayText.length === 0) {
      // Start writing again and again
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 400);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, fullText]);

  return (
    <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-soft-cream border border-soft-orange/60 shadow-2xs">
      <div className="font-mono text-xs sm:text-sm font-bold tracking-wider text-primary-orange uppercase inline-flex items-center">
        {displayText.split('').map((char, index) => (
          <motion.span
            key={`${index}-${char}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
        <span className="inline-block w-1.5 h-3.5 bg-primary-orange ml-1 align-middle animate-pulse" />
      </div>
    </div>
  );
}

function HeroTextContent({
  rotatingWords,
  wordIndex,
}: {
  rotatingWords: string[];
  wordIndex: number;
}) {
  return (
    <div className="flex flex-col items-start space-y-3 sm:space-y-3.5 pt-0">
      {/* Tagline: EXPLORE APPLY ACHIEVE Continuously write from right to left and start writing again and again */}
      <ContinuousCodeLearnBuild />

      {/* Main Heading with decreased vertical spacing */}
      <div className="space-y-0.5">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-dark-black leading-tight">
          Practical Skills.
        </h1>

        {/* Dynamic Animated Word Rotation: 'Real' static, rotating words with basic animation */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-orange leading-tight flex items-baseline gap-3 min-h-[1.25em]">
          <span>Real</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={rotatingWords[wordIndex]}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="inline-block text-primary-orange"
            >
              {rotatingWords[wordIndex]}.
            </motion.span>
          </AnimatePresence>
        </h2>
      </div>

      {/* Description - Decreased vertical space */}
      <p className="text-base sm:text-lg lg:text-xl text-dark-black/85 font-normal max-w-xl leading-snug">
        Learn programming with industry level Experience. Expert mentors.
      </p>

      {/* CTA Buttons - Removed black border from Explore button */}
      <div className="flex flex-wrap items-center gap-3.5 pt-1">
        {/* Explore Button (No black border) */}
        <Link
          href="/publicexplorecourses"
          className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold bg-soft-cream text-dark-black rounded-lg hover:bg-soft-orange hover:text-dark-black transition-all shadow-xs"
        >
          <span>Explore</span>
          <ArrowRight className="w-5 h-5 text-dark-black transition-transform duration-300 group-hover:translate-x-1.5 motion-safe:animate-pulse" />
        </Link>

        {/* Get Started Button */}
        <Link
          href="/signup"
          className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold bg-primary-orange text-pure-white rounded-lg hover:bg-soft-orange hover:text-dark-black transition-all shadow-xs"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 text-pure-white group-hover:text-dark-black transition-transform duration-300 group-hover:translate-x-1.5 motion-safe:animate-pulse" />
        </Link>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const rotatingWords = ['Opportunities', 'Experience', 'Work', 'Career'];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  // Marquee text repeated for infinite smooth loop attached at hero bottom
  const tickerItems = [
    'EXPLORE APPLY ACHIEVE',
    'EXPLORE APPLY ACHIEVE',
    'EXPLORE APPLY ACHIEVE',
    'EXPLORE APPLY ACHIEVE',
  ];

  return (
    <section className="relative overflow-hidden bg-pure-white text-dark-black pt-8 sm:pt-12 lg:pt-14 pb-8 sm:pb-12 border-b border-soft-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================== */}
        {/* DESKTOP LAYOUT (lg: and above):                                 */}
        {/* - Text part on left pushed up (items-start, pt-0) to align with */}
        {/*   images on right side                                         */}
        {/* - Below CTA buttons: Code editor animation running continuously */}
        {/* - Right side: Images 1 column and 2 rows                       */}
        {/* ============================================================== */}
        <div className="hidden lg:grid grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left Column: Text aligned to top + Code Editor below CTAs */}
          <div className="flex flex-col items-start space-y-4 pt-0">
            <HeroTextContent rotatingWords={rotatingWords} wordIndex={wordIndex} />

            {/* Below CTA buttons: code editor animation running continuously */}
            <div className="w-full pt-3">
              <CodeEditorAnimation />
            </div>
          </div>

          {/* Right Column: Images 1 column and 2 rows on desktop */}
          <div className="flex flex-col gap-6 items-center justify-center w-full pt-0">
            {/* Image 1: welcone1.png */}
            <div className="relative w-full max-w-lg lg:max-w-xl h-64 lg:h-76 rounded-2xl overflow-hidden border-2 border-soft-cream shadow-md hover:border-soft-orange transition-all">
              <Image
                src="/welcone1.png"
                alt="Students collaborating and coding at Noviq Academy"
                fill
                className="object-cover"
                sizes="550px"
                priority
              />
            </div>

            {/* Image 2: welcone2.png */}
            <div className="relative w-full max-w-lg lg:max-w-xl h-64 lg:h-76 rounded-2xl overflow-hidden border-2 border-soft-cream shadow-md hover:border-soft-orange transition-all">
              <Image
                src="/welcone2.png"
                alt="Learner thriving with expert mentorship at Noviq Academy"
                fill
                className="object-cover"
                sizes="550px"
                priority
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TABLET LAYOUT (md: and < lg):                                   */}
        {/* - Beside text part: code editor animation                      */}
        {/* - Images: 2 columns on tablet                                  */}
        {/* ============================================================== */}
        <div className="hidden md:block lg:hidden space-y-8">
          {/* Top Row: Beside text part put the code editor animation (2 cols) */}
          <div className="grid grid-cols-2 gap-8 items-start">
            <HeroTextContent rotatingWords={rotatingWords} wordIndex={wordIndex} />
            <div className="w-full pt-1">
              <CodeEditorAnimation />
            </div>
          </div>

          {/* Bottom Row: Images 2 columns on tablet */}
          <div className="grid grid-cols-2 gap-6 w-full">
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border-2 border-soft-cream shadow-md hover:border-soft-orange transition-all">
              <Image
                src="/welcone1.png"
                alt="Students collaborating and coding at Noviq Academy"
                fill
                className="object-cover"
                sizes="50vw"
                priority
              />
            </div>
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border-2 border-soft-cream shadow-md hover:border-soft-orange transition-all">
              <Image
                src="/welcone2.png"
                alt="Learner thriving with expert mentorship at Noviq Academy"
                fill
                className="object-cover"
                sizes="50vw"
                priority
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MOBILE LAYOUT (< md):                                          */}
        {/* Stacked vertically: text, code editor, images                  */}
        {/* ============================================================== */}
        <div className="block md:hidden space-y-6">
          <HeroTextContent rotatingWords={rotatingWords} wordIndex={wordIndex} />

          <div className="w-full pt-1">
            <CodeEditorAnimation />
          </div>

          <div className="flex flex-col gap-5 w-full">
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border-2 border-soft-cream shadow-md">
              <Image
                src="/welcone1.png"
                alt="Students collaborating and coding at Noviq Academy"
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border-2 border-soft-cream shadow-md">
              <Image
                src="/welcone2.png"
                alt="Learner thriving with expert mentorship at Noviq Academy"
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>

      </div>

      {/* Animated Big Font Horizontal Scrolling Letters "EXPLORE APPLY ACHIEVE" attached to hero bottom */}
      <div className="mt-10 sm:mt-14 pt-6 border-t border-soft-cream overflow-hidden whitespace-nowrap w-full select-none">
        <div className="flex w-max animate-marquee gap-8">
          {tickerItems.concat(tickerItems).map((text, idx) => (
            <div key={idx} className="flex items-center gap-8">
              <span className="font-mono text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-wider text-dark-black/10 hover:text-primary-orange/40 transition-colors">
                {text}
              </span>
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary-orange shrink-0 opacity-60" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
