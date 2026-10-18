'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  HelpCircle,
  Phone,
  BookOpen,
} from 'lucide-react';
import { getLearnerProfile } from '@/lib/profilesStore';

interface LearnerContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseTitle?: string;
}

export default function LearnerContactForm({
  isOpen,
  onClose,
  defaultCourseTitle,
}: LearnerContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    reason: 'Doubt Support & Concept Clarification',
    courseOrBatch: defaultCourseTitle || '',
    note: '',
  });

  const [error, setError] = useState('');

  // Pre-fill learner name and mobile if available
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getLearnerProfile();
        if (profile) {
          setFormData((prev) => ({
            ...prev,
            name: prev.name || profile.name || '',
            mobile: prev.mobile || profile.mobile || '',
          }));
        }
      } catch (err) {
        console.warn('Error fetching learner profile for contact form:', err);
      }
    }
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.mobile.trim()) {
      setError('Please enter your mobile or WhatsApp number');
      return;
    }
    if (!formData.note.trim()) {
      setError('Please describe your query or doubt');
      return;
    }

    // Formatted WhatsApp message from enrolled learner perspective
    const messageLines = [
      'Hello Noviq Academy! 👋',
      '',
      '*[Enrolled Learner Support Request]*',
      `*Name:* ${formData.name.trim()}`,
      `*Mobile:* ${formData.mobile.trim()}`,
      `*Reason:* ${formData.reason}`,
      formData.courseOrBatch.trim()
        ? `*Course / Batch:* ${formData.courseOrBatch.trim()}`
        : '',
      `*Message:* ${formData.note.trim()}`,
      '',
      'Sent from Noviq Academy Learner Dashboard',
    ].filter(Boolean);

    const formatted = messageLines.join('\n');
    const targetUrl = `https://wa.me/447867261674?text=${encodeURIComponent(
      formatted
    )}`;

    window.location.href = targetUrl;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-pure-white rounded-2xl border-2 border-soft-cream shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-pure-white border-b border-soft-cream flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-soft-cream text-primary-orange text-[11px] font-bold uppercase tracking-wider border border-soft-orange/40">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Learner Support Desk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-dark-black tracking-tight">
              Enrolled Learner Help
            </h2>
            <p className="text-xs text-dark-black/70">
              Connect directly with our academic coordinators and mentor leads on WhatsApp (+44 7867 261674).
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-dark-black/50 hover:text-dark-black hover:bg-soft-cream transition-colors shrink-0 cursor-pointer"
            aria-label="Close support modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 [scrollbar-width:thin]"
        >
          {/* Reason (from enrolled learner perspective) */}
          <div className="space-y-1.5">
            <label
              htmlFor="learner-reason-select"
              className="block text-xs sm:text-sm font-bold text-dark-black flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-primary-orange" />
              <span>
                Reason for Contact <span className="text-primary-orange">*</span>
              </span>
            </label>
            <select
              id="learner-reason-select"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs text-dark-black font-medium"
            >
              <option value="Doubt Support & Concept Clarification">
                Doubt Support &amp; Concept Clarification
              </option>
              <option value="Live Batch Timings & Class Reschedule">
                Live Batch Timings &amp; Class Reschedule
              </option>
              <option value="Assignment & Project Review Assistance">
                Assignment &amp; Project Review Assistance
              </option>
              <option value="Lab Environment, Compiler & Tool Access">
                Lab Environment, Compiler &amp; Tool Access
              </option>
              <option value="1-on-1 Mentor Guidance Session Request">
                1-on-1 Mentor Guidance Session Request
              </option>
              <option value="Course Completion & Certificate Issuance">
                Course Completion &amp; Certificate Issuance
              </option>
              <option value="Exam, Quiz & Assessment Inquiries">
                Exam, Quiz &amp; Assessment Inquiries
              </option>
              <option value="Batch Feedback & Coordinator Assistance">
                Batch Feedback &amp; Coordinator Assistance
              </option>
              <option value="Other Enrolled Learner Support">
                Other Enrolled Learner Support
              </option>
            </select>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="learner-name"
              className="block text-xs sm:text-sm font-semibold text-dark-black"
            >
              Full Name <span className="text-primary-orange">*</span>
            </label>
            <input
              id="learner-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs"
            />
          </div>

          {/* Mobile / WhatsApp Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="learner-mobile"
              className="block text-xs sm:text-sm font-semibold text-dark-black flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-primary-orange" />
              <span>
                Mobile / WhatsApp Number <span className="text-primary-orange">*</span>
              </span>
            </label>
            <input
              id="learner-mobile"
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="e.g. +44 7867 261674 or +91 98765 43210"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs"
            />
          </div>

          {/* Course / Batch Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="learner-course-batch"
              className="block text-xs sm:text-sm font-semibold text-dark-black flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary-orange" />
              <span>Enrolled Course / Batch (Optional)</span>
            </label>
            <input
              id="learner-course-batch"
              type="text"
              name="courseOrBatch"
              value={formData.courseOrBatch}
              onChange={handleChange}
              placeholder="e.g. Full Stack Web Development (Batch 01)"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs"
            />
          </div>

          {/* Detailed Message */}
          <div className="space-y-1.5">
            <label
              htmlFor="learner-message-note"
              className="block text-xs sm:text-sm font-semibold text-dark-black"
            >
              How can we assist you? <span className="text-primary-orange">*</span>
            </label>
            <textarea
              id="learner-message-note"
              name="note"
              rows={3}
              value={formData.note}
              onChange={handleChange}
              placeholder="Explain your doubt, topic, code error, or query in detail..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs resize-none"
            />
          </div>

          {/* Error notice */}
          {error && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-5 flex items-center justify-center gap-2 bg-primary-orange text-pure-white font-bold text-sm sm:text-base rounded-xl hover:bg-soft-orange hover:text-dark-black transition-colors shadow-xs cursor-pointer"
            >
              <span>Send via WhatsApp (+44 7867 261674)</span>
              <Send className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-dark-black/60 pt-2">
              You will be redirected to WhatsApp with your formatted inquiry for immediate mentor assistance.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
