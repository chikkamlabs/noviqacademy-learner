'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Globe,
  CheckCircle2,
  GraduationCap,
  UserCheck,
  Briefcase,
  Award,
} from 'lucide-react';

export default function ContactUsSection() {
  const [formType, setFormType] = useState<'learner' | 'mentor'>('learner');

  // Learner form fields
  const [learnerData, setLearnerData] = useState({
    name: '',
    mobile: '',
    reason: 'Course Inquiry & Curriculum',
    note: '',
  });

  // Mentor form fields
  const [mentorData, setMentorData] = useState({
    name: '',
    mobile: '',
    email: '',
    domain: 'Full Stack & Web Engineering',
    experience: '3-5 Years',
    portfolioUrl: '',
    note: '',
  });

  const [error, setError] = useState('');

  // Check URL parameter, hash, or custom event to toggle form type dynamically
  useEffect(() => {
    const checkType = () => {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const type =
          url.searchParams.get('type') ||
          (window.location.hash.includes('mentor')
            ? 'mentor'
            : window.location.hash.includes('learner')
            ? 'learner'
            : null);
        if (type === 'mentor') {
          setFormType('mentor');
        } else if (type === 'learner') {
          setFormType('learner');
        }
      }
    };

    checkType();
    window.addEventListener('hashchange', checkType);
    window.addEventListener('popstate', checkType);

    const handleCustomTypeEvent = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail === 'mentor' || custom.detail === 'learner') {
        setFormType(custom.detail);
      }
    };
    window.addEventListener('noviq:set-contact-type', handleCustomTypeEvent);

    return () => {
      window.removeEventListener('hashchange', checkType);
      window.removeEventListener('popstate', checkType);
      window.removeEventListener('noviq:set-contact-type', handleCustomTypeEvent);
    };
  }, []);

  const handleLearnerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setLearnerData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleMentorChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setMentorData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formType === 'learner') {
      if (!learnerData.name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (!learnerData.mobile.trim()) {
        setError('Please enter your mobile number');
        return;
      }

      // Formatted WhatsApp message for Learner
      const messageLines = [
        'Hello Noviq Academy! 👋',
        '',
        '*[Learner Inquiry]*',
        `*Name:* ${learnerData.name.trim()}`,
        `*Mobile:* ${learnerData.mobile.trim()}`,
        `*Reason:* ${learnerData.reason}`,
        learnerData.note.trim() ? `*Note:* ${learnerData.note.trim()}` : '',
        '',
        'Sent via Noviq Academy Contact Form',
      ].filter(Boolean);

      const formatted = messageLines.join('\n');
      const targetUrl = `https://wa.me/8184871722?text=${encodeURIComponent(formatted)}`;
      window.location.href = targetUrl;
    } else {
      // Mentor Form
      if (!mentorData.name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!mentorData.mobile.trim()) {
        setError('Please enter your mobile or WhatsApp number');
        return;
      }
      if (!mentorData.email.trim()) {
        setError('Please enter your email address');
        return;
      }

      // Formatted WhatsApp message for Mentor
      const messageLines = [
        'Hello Noviq Academy! 👋',
        '',
        '*[Become a Mentor Application]*',
        `*Name:* ${mentorData.name.trim()}`,
        `*Mobile:* ${mentorData.mobile.trim()}`,
        `*Email:* ${mentorData.email.trim()}`,
        `*Domain:* ${mentorData.domain}`,
        `*Experience:* ${mentorData.experience}`,
        mentorData.portfolioUrl.trim() ? `*LinkedIn / Portfolio:* ${mentorData.portfolioUrl.trim()}` : '',
        mentorData.note.trim() ? `*Note / Bio:* ${mentorData.note.trim()}` : '',
        '',
        'Sent via Noviq Academy Mentor Application Form',
      ].filter(Boolean);

      const formatted = messageLines.join('\n');
      const targetUrl = `https://wa.me/8184871722?text=${encodeURIComponent(formatted)}`;
      window.location.href = targetUrl;
    }
  };

  return (
    <section id="contact-us" className="w-full bg-pure-white text-dark-black py-16 sm:py-20 border-b border-soft-cream scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Side: Information related to Contact Us */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-soft-cream border border-soft-orange/50 text-xs font-semibold text-primary-orange uppercase tracking-wider shadow-2xs">
              <MessageSquare className="w-3.5 h-3.5 text-primary-orange" />
              <span>Contact Us</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-dark-black tracking-tight leading-tight">
              {formType === 'learner' ? (
                <>
                  Have Questions? <br className="hidden sm:inline" />
                  <span className="text-primary-orange">Let&apos;s Connect.</span>
                </>
              ) : (
                <>
                  Shape Future Engineers. <br className="hidden sm:inline" />
                  <span className="text-primary-orange">Become a Mentor.</span>
                </>
              )}
            </h2>

            <p className="text-base sm:text-lg text-dark-black/80 font-normal leading-relaxed max-w-xl">
              {formType === 'learner'
                ? 'Whether you are looking for guidance on choosing the right curriculum, batch timings, hands-on lab sessions, or personalized 1-on-1 mentorship, our team is here to assist you every step of the way.'
                : 'Join our senior engineering mentor cohort. Share your production experience, conduct real-world code reviews, lead live masterclasses, and guide ambitious learners into high-growth tech careers.'}
            </p>

            {/* Value Points */}
            <div className="space-y-3.5 pt-2">
              {formType === 'learner' ? (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-orange shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-dark-black">Direct Expert Support</h4>
                      <p className="text-xs sm:text-sm text-dark-black/70">Connect directly with industry advisors and tech leads.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-orange shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-dark-black">Quick Turnaround</h4>
                      <p className="text-xs sm:text-sm text-dark-black/70">Get instant responses to your course queries and admissions.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-orange shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-dark-black">Global Mentorship Network</h4>
                      <p className="text-xs sm:text-sm text-dark-black/70">Serving ambitious learners across India, UK, and worldwide.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-primary-orange shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-dark-black">Impact High-Growth Careers</h4>
                      <p className="text-xs sm:text-sm text-dark-black/70">Mentor developers with production code, architecture reviews, and labs.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-primary-orange shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-dark-black">Flexible Hourly Commitments</h4>
                      <p className="text-xs sm:text-sm text-dark-black/70">Part-time mentor hours tailored to your existing work schedule.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-primary-orange shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-dark-black">Competitive Compensation</h4>
                      <p className="text-xs sm:text-sm text-dark-black/70">Industry-leading honorariums for experienced mentors and tech leads.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Direct Contact Info */}
            <div className="pt-4 border-t border-soft-cream flex flex-wrap gap-6 text-xs sm:text-sm text-dark-black/75">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-orange" />
                <span className="font-semibold">+91 81848 71722</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-orange" />
                <span>UK &amp; India Programs</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form with Learner / Mentor Option Selector */}
          <div className="bg-pure-white rounded-2xl border-2 border-soft-cream p-6 sm:p-8 shadow-md">
            
            {/* Form Selector Tab: Learner or Mentor */}
            <div className="space-y-1.5 mb-6">
              <label className="block text-xs font-bold text-dark-black uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 p-1.5 bg-soft-cream rounded-xl border border-soft-orange/40 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setFormType('learner');
                    setError('');
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    formType === 'learner'
                      ? 'bg-primary-orange text-pure-white shadow-xs'
                      : 'text-dark-black hover:text-primary-orange'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>I am a Learner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormType('mentor');
                    setError('');
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    formType === 'mentor'
                      ? 'bg-primary-orange text-pure-white shadow-xs'
                      : 'text-dark-black hover:text-primary-orange'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Become a Mentor</span>
                </button>
              </div>
            </div>

            {/* Title for the Active Form */}
            <div className="mb-5 pb-3 border-b border-soft-cream">
              <h3 className="text-xl sm:text-2xl font-bold text-dark-black">
                {formType === 'learner' ? 'Learner Inquiry Form' : 'Mentor Application Form'}
              </h3>
              <p className="text-xs sm:text-sm text-dark-black/70 mt-0.5">
                {formType === 'learner'
                  ? 'Fill out your inquiry details and connect directly with our admissions and mentor team.'
                  : 'Apply to join our mentor network. We will review your profile and reach out promptly.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* LEARNER FORM FIELDS */}
              {formType === 'learner' ? (
                <>
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="learner-name" className="block text-xs sm:text-sm font-semibold text-dark-black">
                      Name <span className="text-primary-orange">*</span>
                    </label>
                    <input
                      id="learner-name"
                      type="text"
                      name="name"
                      value={learnerData.name}
                      onChange={handleLearnerChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs"
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1.5">
                    <label htmlFor="learner-mobile" className="block text-xs sm:text-sm font-semibold text-dark-black">
                      Mobile Number <span className="text-primary-orange">*</span>
                    </label>
                    <input
                      id="learner-mobile"
                      type="tel"
                      name="mobile"
                      value={learnerData.mobile}
                      onChange={handleLearnerChange}
                      placeholder="e.g. 1234567890"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs"
                    />
                  </div>

                  {/* Reason */}
                  <div className="space-y-1.5">
                    <label htmlFor="learner-reason" className="block text-xs sm:text-sm font-semibold text-dark-black">
                      Reason for Contact
                    </label>
                    <select
                      id="learner-reason"
                      name="reason"
                      value={learnerData.reason}
                      onChange={handleLearnerChange}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs text-dark-black"
                    >
                      <option value="Course Inquiry & Curriculum">Course Inquiry &amp; Curriculum</option>
                      <option value="Batch Timings & Registration">Batch Timings &amp; Registration</option>
                      <option value="1-on-1 Mentorship & Career Guidance">1-on-1 Mentorship &amp; Career Guidance</option>
                      <option value="Fees, Discounts & Coupons">Fees, Discounts &amp; Coupons</option>
                      <option value="Corporate / Group Training">Corporate / Group Training</option>
                      <option value="Other Query">Other Query</option>
                    </select>
                  </div>

                  {/* Note */}
                  <div className="space-y-1.5">
                    <label htmlFor="learner-note" className="block text-xs sm:text-sm font-semibold text-dark-black">
                      Note / Message
                    </label>
                    <textarea
                      id="learner-note"
                      name="note"
                      rows={3}
                      value={learnerData.note}
                      onChange={handleLearnerChange}
                      placeholder="Tell us what you are looking to learn or any specific questions..."
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs resize-none"
                    />
                  </div>
                </>
              ) : (
                /* BECOME A MENTOR FORM FIELDS */
                <>
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="mentor-name" className="block text-xs sm:text-sm font-semibold text-dark-black">
                      Full Name <span className="text-primary-orange">*</span>
                    </label>
                    <input
                      id="mentor-name"
                      type="text"
                      name="name"
                      value={mentorData.name}
                      onChange={handleMentorChange}
                      placeholder="e.g. Dr. Jane Smith"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs"
                    />
                  </div>

                  {/* Mobile & Email in 2 columns on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="mentor-mobile" className="block text-xs sm:text-sm font-semibold text-dark-black">
                        Mobile Number <span className="text-primary-orange">*</span>
                      </label>
                      <input
                        id="mentor-mobile"
                        type="tel"
                        name="mobile"
                        value={mentorData.mobile}
                        onChange={handleMentorChange}
                        placeholder="e.g. +91 8184871722"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="mentor-email" className="block text-xs sm:text-sm font-semibold text-dark-black">
                        Email Address <span className="text-primary-orange">*</span>
                      </label>
                      <input
                        id="mentor-email"
                        type="email"
                        name="email"
                        value={mentorData.email}
                        onChange={handleMentorChange}
                        placeholder="e.g. mentor@domain.com"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Domain & Experience in 2 columns on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="mentor-domain" className="block text-xs sm:text-sm font-semibold text-dark-black">
                        Domain / Expertise
                      </label>
                      <select
                        id="mentor-domain"
                        name="domain"
                        value={mentorData.domain}
                        onChange={handleMentorChange}
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs text-dark-black"
                      >
                        <option value="Full Stack & Web Engineering">Full Stack &amp; Web Engineering</option>
                        <option value="Generative AI & Machine Learning">Generative AI &amp; Machine Learning</option>
                        <option value="Cloud DevOps, Docker & K8s">Cloud DevOps, Docker &amp; K8s</option>
                        <option value="Mobile App Development (Flutter/React Native)">Mobile App Development</option>
                        <option value="Backend Systems & Microservices (Go/Python)">Backend Systems &amp; Go/Python</option>
                        <option value="System Design & Data Architecture">System Design &amp; Architecture</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="mentor-experience" className="block text-xs sm:text-sm font-semibold text-dark-black">
                        Years of Experience
                      </label>
                      <select
                        id="mentor-experience"
                        name="experience"
                        value={mentorData.experience}
                        onChange={handleMentorChange}
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs text-dark-black"
                      >
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5-8 Years">5-8 Years</option>
                        <option value="8+ Years">8+ Years (Staff / Principal)</option>
                      </select>
                    </div>
                  </div>

                  {/* LinkedIn / Portfolio */}
                  <div className="space-y-1.5">
                    <label htmlFor="mentor-portfolio" className="block text-xs sm:text-sm font-semibold text-dark-black">
                      LinkedIn or GitHub Profile
                    </label>
                    <input
                      id="mentor-portfolio"
                      type="url"
                      name="portfolioUrl"
                      value={mentorData.portfolioUrl}
                      onChange={handleMentorChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs"
                    />
                  </div>

                  {/* Note / Bio */}
                  <div className="space-y-1.5">
                    <label htmlFor="mentor-note" className="block text-xs sm:text-sm font-semibold text-dark-black">
                      Note / Background Summary
                    </label>
                    <textarea
                      id="mentor-note"
                      name="note"
                      rows={2}
                      value={mentorData.note}
                      onChange={handleMentorChange}
                      placeholder="Briefly tell us about your current role, technologies, and mentorship interests..."
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs resize-none"
                    />
                  </div>
                </>
              )}

              {/* Error display */}
              {error && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {error}
                </p>
              )}

              {/* Contact Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3.5 px-6 flex items-center justify-center gap-2 bg-primary-orange text-pure-white font-bold text-sm sm:text-base rounded-xl hover:bg-soft-orange hover:text-dark-black transition-colors shadow-xs cursor-pointer"
              >
                <span>{formType === 'learner' ? 'Contact as Learner' : 'Submit Mentor Application'}</span>
                <Send className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-dark-black/60 pt-1">
                Tapping {formType === 'learner' ? 'Contact' : 'Submit'} will redirect you to +91 8184871722 with your formatted {formType === 'learner' ? 'inquiry' : 'application'}.
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
