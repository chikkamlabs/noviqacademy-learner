'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEARNER_REASONS = [
  'Doubt Clarification & Mentor Guidance',
  'Live Class Schedule & Meeting Link',
  'Assignment, Project & Code Review',
  'LMS & Course Portal Access Issue',
  'Certificate & Course Completion Query',
  'Batch Rescheduling & Transfer Request',
  'Course Upgrade & Advanced Track Guidance',
  'Other Enrolled Learner Support',
] as const;

export default function LearnerContactForm({ isOpen, onClose }: ContactFormProps) {
  const [reason, setReason] = useState<string>(LEARNER_REASONS[0]);
  const [learnerName, setLearnerName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [queryDetails, setQueryDetails] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attempt to autofill learner name if session exists
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && isMounted) {
          const name =
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            '';
          if (name && !learnerName) {
            setLearnerName(name);
          }
        }
      } catch {
        // Ignore auth fetch failures for prefilling
      }
    }

    loadUserData();

    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Handle ESC key to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, learnerName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!learnerName.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (!reason.trim()) {
      setError('Please select a reason.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const messageLines = [
      'Hello Noviq Academy! 👋',
      '',
      '*[Enrolled Learner Support Request]*',
      `*Learner Name:* ${learnerName.trim()}`,
      courseName.trim() ? `*Enrolled Course:* ${courseName.trim()}` : '',
      `*Reason:* ${reason}`,
      queryDetails.trim() ? `*Details / Doubt:* ${queryDetails.trim()}` : '',
      '',
      'Sent from Noviq Learner Portal',
    ].filter(Boolean);

    const formatted = messageLines.join('\n');
    const targetUrl = `https://wa.me/8184871722?text=${encodeURIComponent(formatted)}`;

    // Navigate to WhatsApp
    window.location.href = targetUrl;

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-lg bg-pure-white rounded-2xl border-2 border-soft-cream shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-dark-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-dark-black/60 hover:text-dark-black hover:bg-soft-cream rounded-full transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 bg-soft-cream rounded-xl text-primary-orange">
            <MessageCircle className="w-5 h-5 text-primary-orange" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-dark-black tracking-tight">
              Learner Support
            </h2>
            <p className="text-xs sm:text-sm text-dark-black/70">
              Assistance for enrolled learners &amp; active coursework
            </p>
          </div>
        </div>

        <hr className="border-soft-cream my-4" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="support-reason"
              className="block text-xs sm:text-sm font-bold text-dark-black"
            >
              Select Reason <span className="text-primary-orange">*</span>
            </label>
            <select
              id="support-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs text-dark-black"
            >
              {LEARNER_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Learner Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="support-name"
              className="block text-xs sm:text-sm font-bold text-dark-black"
            >
              Your Name <span className="text-primary-orange">*</span>
            </label>
            <input
              id="support-name"
              type="text"
              value={learnerName}
              onChange={(e) => {
                setLearnerName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your name"
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs text-dark-black"
            />
          </div>

          {/* Enrolled Course Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="support-course"
              className="block text-xs sm:text-sm font-semibold text-dark-black"
            >
              Enrolled Course / Batch <span className="text-dark-black/40 text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="support-course"
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Full Stack Web Development or Batch UK-04"
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs text-dark-black"
            />
          </div>

          {/* Query Details */}
          <div className="space-y-1.5">
            <label
              htmlFor="support-details"
              className="block text-xs sm:text-sm font-semibold text-dark-black"
            >
              Details / Question <span className="text-dark-black/40 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              id="support-details"
              rows={3}
              value={queryDetails}
              onChange={(e) => setQueryDetails(e.target.value)}
              placeholder="Describe your doubt, portal issue, or class schedule question..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/15 focus:outline-hidden focus:border-primary-orange shadow-2xs resize-none text-dark-black"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* WhatsApp Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3 px-6 flex items-center justify-center gap-2 bg-primary-orange text-pure-white font-bold text-sm sm:text-base rounded-xl hover:bg-soft-orange hover:text-dark-black transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Opening WhatsApp...' : 'Send to WhatsApp'}</span>
            <Send className="w-4 h-4" />
          </button>

          {/* Note regarding WhatsApp number */}
          <p className="text-[11px] text-center text-dark-black/60 pt-1">
            Connects directly to Noviq Academy Support on WhatsApp at <strong className="text-dark-black">+91 8184871722</strong>.
          </p>
        </form>
      </div>
    </div>
  );
}
