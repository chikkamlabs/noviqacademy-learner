import Link from 'next/link';
import Image from 'next/image';
import { MailCheck, Sparkles, BookOpen, Award } from 'lucide-react';

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen bg-soft-cream flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="w-full bg-pure-white border-b border-soft-cream px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-soft-cream shadow-xs">
              <Image
                src="/noviqacademy_logo.png"
                alt="Noviq Academy Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-dark-black">
              NoviQ Academy
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-primary-orange hover:text-dark-black transition-colors"
          >
            Go to Login &rarr;
          </Link>
        </div>
      </header>

      {/* Main Dual-Column Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full bg-pure-white rounded-2xl p-6 sm:p-10 shadow-sm border border-dark-black/10">
          
          {/* Left Column: Confirm Your Email to Login. */}
          <div className="flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-dark-black/10 pb-8 lg:pb-0 lg:pr-10">
            <div className="w-14 h-14 rounded-full bg-primary-orange/10 flex items-center justify-center text-primary-orange mb-6">
              <MailCheck className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-black tracking-tight">
              Confirm Your Email to Login.
            </h1>
            
            <p className="mt-4 text-base sm:text-lg text-dark-black/80 leading-relaxed">
              We have sent a verification confirmation link to your registered email address.
              Please check your inbox and click the confirmation link to activate your learner account.
            </p>

            <div className="mt-6 p-4 rounded-lg bg-soft-cream border border-primary-orange/20">
              <p className="text-sm text-dark-black/70">
                <span className="font-semibold text-dark-black">Tip:</span> If you don&apos;t see the message within a few minutes, check your spam or promotions folder.
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 font-semibold text-pure-white bg-primary-orange hover:bg-soft-orange hover:text-dark-black rounded-md shadow-xs transition-colors"
              >
                Proceed to Login
              </Link>
            </div>
          </div>

          {/* Right Column: Cheers to More learnings and Write some content */}
          <div className="flex flex-col justify-center lg:pl-6 space-y-6">
            <div className="flex items-center gap-2 text-primary-orange font-semibold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Welcome to NoviQ Academy</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-black tracking-tight">
              Cheers to More learnings
            </h2>

            <p className="text-base text-dark-black/80 leading-relaxed">
              You are about to embark on an incredible journey of skill development, hands-on masterclasses, and real-world project experience. At NoviQ Academy, we bring together expert mentors and curious minds to build the future of technology and engineering.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-soft-orange/30 text-dark-black flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-black text-sm">Comprehensive Curriculums</h3>
                  <p className="text-xs text-dark-black/70 mt-0.5">
                    Carefully structured modules crafted by industry veterans.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-soft-orange/30 text-dark-black flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-black text-sm">Practical Certifications</h3>
                  <p className="text-xs text-dark-black/70 mt-0.5">
                    Earn verified credentials recognized by top technology companies.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-black/10 text-xs text-dark-black/60">
              Need assistance? Contact our student support team anytime at support@noviqacademy.com.
            </div>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-4 text-center text-xs text-dark-black/50 border-t border-dark-black/5">
        &copy; {new Date().getFullYear()} NovQq Academy. All rights reserved.
      </footer>
    </div>
  );
}
