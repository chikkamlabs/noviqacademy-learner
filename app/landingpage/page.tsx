import CouponsSection from '@/components/landingpage/couponsSection';
import Header from '@/components/landingpage/header';
import HeroSection from '@/components/landingpage/heroSection';
import TrendingCoursesSection from '@/components/landingpage/trendingcoursesSection';
import JoinSection from '@/components/landingpage/joinSection';
import ContactUsSection from '@/components/landingpage/contactus';
import Footer from '@/components/landingpage/footer';

export const metadata = {
  title: 'Noviq Academy | Code Learn Build',
  description: 'Practical Skills. Real opportunities. Learn programming with industry level Experience and expert mentors.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-pure-white text-dark-black flex flex-col">
      {/* 1. Coupons Section */}
      <CouponsSection />

      {/* 2. Header */}
      <Header />

      {/* 3. Hero Section */}
      <HeroSection />

      {/* 4. Trending Courses Section */}
      <TrendingCoursesSection />

      {/* 5. Join Section (We are different! Why?) */}
      <JoinSection />

      {/* 6. Contact Us Section */}
      <ContactUsSection />

      {/* 7. Footer */}
      <Footer />
    </main>
  );
}
