import CouponsSection from '@/components/landingpage/couponsSection';
import LearnerHeader from '@/components/learner/header';
import LearnerHeroSection from '@/components/learner/heroSection';
import ExploreCourse from '@/components/learner/explorecourse';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';

export default function LearnerDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-soft-cream">
      <CouponsSection />
      <LearnerHeader />
      <LearnerHeroSection />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-24">
        <ExploreCourse featuredOnly={true} />
      </main>
      <LearnerBottomNavigation />
    </div>
  );
}
