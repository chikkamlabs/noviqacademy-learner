import Link from 'next/link';
import { Home, BookOpen, User } from 'lucide-react';

export default function LearnerBottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-pure-white border-t border-soft-cream shadow-sm">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Home Icon */}
          <Link
            href="/learner/dashboard"
            className="flex flex-1 flex-col items-center justify-center text-dark-black hover:text-primary-orange transition-colors"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs font-medium mt-1">Home</span>
          </Link>

          {/* Middle: My courses */}
          <Link
            href="/learner/courses/dashboard"
            className="flex flex-1 flex-col items-center justify-center text-dark-black hover:text-primary-orange transition-colors"
          >
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs font-medium mt-1">My courses</span>
          </Link>

          {/* Right: Profile Icon */}
          <Link
            href="/learner/profile/dashboard"
            className="flex flex-1 flex-col items-center justify-center text-dark-black hover:text-primary-orange transition-colors"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs font-medium mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
