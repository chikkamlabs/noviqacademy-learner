'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  HelpCircle,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BookOpen,
  ChevronsUpDown,
  ChevronsDown,
  Menu,
  CheckCircle2,
  Send,
  AlertTriangle,
  Check,
  Award,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import StudySidebar from '@/components/study/sidebar';
import {
  getOpenExamStudyDetails,
  saveExamAnswer,
  submitExamSession,
  OpenExamStudyData,
} from '@/lib/studyexams';

function formatTimerString(endTimeStr: string | null): { text: string; isEnded: boolean } {
  if (!endTimeStr) return { text: 'No Limit', isEnded: false };
  const target = new Date(endTimeStr).getTime();
  if (isNaN(target)) return { text: 'Active', isEnded: false };
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { text: '00:00 (Ended)', isEnded: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return { text: `${hours}h ${pad(minutes)}m ${pad(seconds)}s`, isEnded: false };
  }
  return { text: `${pad(minutes)}:${pad(seconds)}`, isEnded: false };
}

function OpenExamPageContent() {
  const searchParams = useSearchParams();
  const examIdParam = searchParams.get('exam_id') || searchParams.get('id');
  const batchIdParam = searchParams.get('id') || searchParams.get('batch_id');
  const conductedIdParam = searchParams.get('conducted_id');
  const queryString = searchParams?.toString();

  const [exam, setExam] = useState<OpenExamStudyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Accordion state: mapped by question ID. Initially empty (all collapsed)
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  // Answers selected by learner: question_id -> choice_id
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  // Submission state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Live timer countdown state
  const [timeRemaining, setTimeRemaining] = useState<{ text: string; isEnded: boolean }>({
    text: '--:--',
    isEnded: false,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getOpenExamStudyDetails(examIdParam, batchIdParam, conductedIdParam);
        if (isMounted) {
          setExam(data);
          // Initially collapse all questions as strictly instructed
          setExpandedQuestions({});
          setSelectedAnswers(data.selected_answers || {});
          setIsSubmitted(Boolean(data.submitted));
          setTimeRemaining(formatTimerString(data.end_time));
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading open exam study details:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [examIdParam, batchIdParam, conductedIdParam]);

  // Live countdown timer running every second
  useEffect(() => {
    if (!exam?.end_time) return;

    const timer = setInterval(() => {
      setTimeRemaining(formatTimerString(exam.end_time));
    }, 1000);

    return () => clearInterval(timer);
  }, [exam?.end_time]);

  // Toggle individual question accordion
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Check if all questions are currently expanded
  const areAllExpanded = useMemo(() => {
    if (!exam || exam.questions.length === 0) return false;
    return exam.questions.every((q) => !!expandedQuestions[q.id]);
  }, [exam, expandedQuestions]);

  // Toggle expand all / collapse all
  const toggleExpandAll = () => {
    if (!exam || exam.questions.length === 0) return;

    if (areAllExpanded) {
      setExpandedQuestions({});
    } else {
      const allOpen: Record<string, boolean> = {};
      exam.questions.forEach((q) => {
        allOpen[q.id] = true;
      });
      setExpandedQuestions(allOpen);
    }
  };

  // Handle choice selection:
  // Saves choice into exam_conducted_answers without creating duplicates.
  // Answers are NOT revealed until results_released=true.
  const handleSelectChoice = async (questionId: string, choiceId: string) => {
    if (isSubmitted || !exam) return;

    // Optimistically update local selection
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));

    // Save answer to database
    if (exam.conducted_id) {
      await saveExamAnswer(exam.conducted_id, questionId, choiceId);
    }
  };

  // Handle exam submission
  const handleConfirmSubmit = async () => {
    if (!exam?.conducted_id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await submitExamSession(exam.conducted_id);
      if (res.success) {
        setIsSubmitted(true);
        setShowSubmitModal(false);
      }
    } catch (err) {
      console.warn('Error during exam submit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backHref = queryString
    ? `/learner/study/exams?${queryString}`
    : '/learner/study/exams';

  const totalQuestionsCount = exam?.questions.length || exam?.total_q || 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen flex flex-col bg-soft-cream">
      {/* 1. Learner Header */}
      <LearnerHeader />

      {/* Main Study Layout: Sidebar on Left + Open Exam Content on Right */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar & Mobile Drawer */}
        <StudySidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem="exams"
        />

        {/* Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* STATIC TOP BAR: Back link on left, Human-readable Batch ID and Time Left on Top Right */}
          <div className="sticky top-16 sm:top-20 z-20 bg-soft-cream/95 backdrop-blur-md border-b border-soft-orange/30 shadow-2xs">
            <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
              {/* Left: Menu & Back Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  className="lg:hidden p-2 rounded-xl bg-pure-white border border-soft-cream text-dark-black hover:text-primary-orange hover:border-primary-orange/40 transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Toggle study navigation menu"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-primary-orange" />
                </button>

                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl bg-pure-white border border-soft-cream text-xs sm:text-sm font-bold text-dark-black hover:text-primary-orange hover:border-primary-orange/40 transition-all shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-orange" />
                  <span>Back to Batch Exams</span>
                </Link>
              </div>

              {/* Right: Human-readable batch_id and Live Countdown Timer */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                {/* Human readable batch_id (not raw UUID) */}
                {exam?.batch_id && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pure-white border border-soft-cream text-xs font-mono font-bold text-dark-black shadow-2xs">
                    <span className="text-primary-orange">Batch:</span>
                    <span className="text-dark-black">{exam.batch_id}</span>
                  </div>
                )}

                {/* Display time left for ending the exam with batch_exams.end_time */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-extrabold shadow-2xs transition-colors ${
                    timeRemaining.isEnded
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-pure-white text-dark-black border-soft-orange/40'
                  }`}
                  title="Time left based on batch exam schedule"
                >
                  <Clock
                    className={`w-3.5 h-3.5 ${
                      timeRemaining.isEnded ? 'text-rose-600' : 'text-primary-orange animate-pulse'
                    }`}
                  />
                  <span className="text-[11px] font-bold text-dark-black/60 hidden sm:inline">Time Left:</span>
                  <span className="text-primary-orange font-mono">{timeRemaining.text}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN SCROLLABLE AREA */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-48 sm:pb-56 space-y-6">
            {loading ? (
              <div className="py-24 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs space-y-3">
                <div className="w-9 h-9 border-3 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs sm:text-sm text-dark-black/60 font-semibold">
                  Loading exam session and questions...
                </p>
              </div>
            ) : !exam ? (
              <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-soft-cream text-primary-orange flex items-center justify-center mx-auto">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-dark-black">Exam Not Found</h3>
                <p className="text-xs sm:text-sm text-dark-black/70 leading-relaxed">
                  The requested exam could not be loaded. Please return to the exams list.
                </p>
                <Link
                  href={backHref}
                  className="inline-block mt-2 px-4 py-2 bg-primary-orange text-pure-white rounded-xl text-xs font-bold"
                >
                  Return to Exams
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Submission Banner (if submitted) */}
                {isSubmitted && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3.5 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-extrabold text-emerald-950">
                        Exam Submitted Successfully
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Your answers have been securely recorded. Answers and performance evaluations
                        will become visible once results are officially released by the mentor.
                      </p>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* 1. EXAM OVERVIEW: Course Name, Title, Description              */}
                {/*    Total Questions, Questions Answered (count)                 */}
                {/*    REMOVED: Created_at and Updated_at                          */}
                {/* ============================================================== */}
                <div className="bg-pure-white rounded-2xl border-2 border-soft-cream shadow-xs p-5 sm:p-7 space-y-6">
                  {/* Top Bar with Course Name Badge */}
                  <div className="space-y-2 pb-5 border-b border-soft-cream">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-cream border border-soft-orange/40 text-[11px] font-bold text-primary-orange uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{exam.course_name || 'Enrolled Course'}</span>
                    </div>

                    {/* Exam Title */}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-dark-black tracking-tight leading-snug">
                      {exam.title}
                    </h1>

                    {/* Description from course_exams */}
                    {exam.description && (
                      <p className="text-xs sm:text-sm text-dark-black/75 leading-relaxed pt-1">
                        {exam.description}
                      </p>
                    )}
                  </div>

                  {/* Overview Cards: Total Questions and Questions Answered (count) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Total Questions */}
                    <div className="p-4 rounded-xl bg-soft-cream/60 border border-soft-orange/30 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-pure-white text-primary-orange border border-soft-orange/40 flex items-center justify-center font-extrabold text-base shadow-2xs shrink-0">
                        <HelpCircle className="w-5 h-5 text-primary-orange" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-dark-black/55 uppercase tracking-wider block">
                          Total Questions
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-dark-black">
                          {totalQuestionsCount} Questions
                        </span>
                      </div>
                    </div>

                    {/* After Total questions: Questions Answered (count) */}
                    <div className="p-4 rounded-xl bg-soft-cream/60 border border-soft-orange/30 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-pure-white text-emerald-600 border border-emerald-200 flex items-center justify-center font-extrabold text-base shadow-2xs shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-dark-black/55 uppercase tracking-wider block">
                          Questions Answered
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-extrabold text-dark-black">
                            {answeredCount} of {totalQuestionsCount}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-primary-orange bg-soft-cream px-2 py-0.5 rounded border border-soft-orange/30">
                            {totalQuestionsCount > 0
                              ? Math.round((answeredCount / totalQuestionsCount) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 2. QUESTIONS SECTION HEADER + TOGGLE EXPAND ALL / COLLAPSE ALL */}
                {/* ============================================================== */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-dark-black tracking-tight flex items-center gap-2">
                      <FileQuestion className="w-5 h-5 text-primary-orange" />
                      <span>Exam Questions</span>
                      <span className="text-xs font-mono font-bold text-primary-orange bg-soft-cream px-2 py-0.5 rounded-md border border-soft-orange/30">
                        {exam.questions.length}
                      </span>
                    </h2>
                    <p className="text-xs text-dark-black/60 mt-0.5">
                      Select your choices below. You can change your choice anytime before submitting.
                    </p>
                  </div>

                  {/* Toggle expand all / collapse all button (initially collapse all) */}
                  <button
                    type="button"
                    onClick={toggleExpandAll}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-pure-white hover:bg-soft-cream text-dark-black hover:text-primary-orange border border-soft-cream hover:border-soft-orange/50 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    aria-label={areAllExpanded ? 'Collapse All Questions' : 'Expand All Questions'}
                  >
                    {areAllExpanded ? (
                      <>
                        <ChevronsDown className="w-4 h-4 text-primary-orange rotate-180" />
                        <span>Collapse All</span>
                      </>
                    ) : (
                      <>
                        <ChevronsUpDown className="w-4 h-4 text-primary-orange" />
                        <span>Expand All</span>
                      </>
                    )}
                  </button>
                </div>

                {/* ============================================================== */}
                {/* 3. QUESTIONS LIST                                              */}
                {/*    Allow selecting choice for all questions available          */}
                {/*    Inserts into exam_conducted_answers without duplicates      */}
                {/*    DO NOT show correct answers until results_released=true     */}
                {/* ============================================================== */}
                {exam.questions.length === 0 ? (
                  <div className="py-16 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs space-y-2">
                    <HelpCircle className="w-8 h-8 text-dark-black/40 mx-auto" />
                    <p className="text-xs sm:text-sm font-semibold text-dark-black/60">
                      No questions have been attached to this exam yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exam.questions.map((q, qIndex) => {
                      const isExpanded = !!expandedQuestions[q.id];
                      const selectedChoiceId = selectedAnswers[q.id];
                      const isAnswered = Boolean(selectedChoiceId);

                      return (
                        <div
                          key={q.id || qIndex}
                          className={`bg-pure-white rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-xs ${
                            isAnswered
                              ? 'border-primary-orange/40'
                              : 'border-soft-cream'
                          }`}
                        >
                          {/* Question Header (Always visible, tap to toggle accordion) */}
                          <button
                            type="button"
                            onClick={() => toggleQuestion(q.id)}
                            className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 hover:bg-soft-cream/40 transition-colors cursor-pointer select-none"
                            aria-expanded={isExpanded}
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {/* Question Number Badge */}
                              <span
                                className={`w-7 h-7 rounded-lg border font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                                  isAnswered
                                    ? 'bg-primary-orange text-pure-white border-primary-orange'
                                    : 'bg-soft-cream text-primary-orange border-soft-orange/30'
                                }`}
                              >
                                {isAnswered ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  `Q${qIndex + 1}`
                                )}
                              </span>

                              <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="text-xs sm:text-sm font-bold text-dark-black leading-snug">
                                  {q.question}
                                </h3>

                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-dark-black/55">
                                  <span>{q.choices.length} Choices</span>
                                  <span>•</span>
                                  {isAnswered ? (
                                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                      <span>Answered</span>
                                    </span>
                                  ) : (
                                    <span className="text-amber-600 font-semibold">Unanswered</span>
                                  )}
                                  {q.hint && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 text-primary-orange/80">
                                        <Lightbulb className="w-3 h-3" />
                                        <span>Hint</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Chevron Toggle Icon */}
                            <div className="p-1 rounded-lg text-dark-black/50 hover:text-primary-orange transition-colors shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-primary-orange" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </div>
                          </button>

                          {/* Expanded Content: Description, Hint, and Selectable Choices */}
                          {isExpanded && (
                            <div className="px-4 sm:px-6 pb-5 pt-1 space-y-4 border-t border-soft-cream/80 bg-soft-cream/15 animate-in fade-in duration-150">
                              {/* 1. Question Description */}
                              {q.description && (
                                <div className="p-3 sm:p-3.5 rounded-xl bg-pure-white border border-soft-cream space-y-1">
                                  <span className="text-[10px] font-bold text-dark-black/50 uppercase tracking-wider block">
                                    Question Notes / Description
                                  </span>
                                  <p className="text-xs sm:text-sm text-dark-black/80 font-normal leading-relaxed whitespace-pre-wrap">
                                    {q.description}
                                  </p>
                                </div>
                              )}

                              {/* 2. Hint (if provided) */}
                              {q.hint && (
                                <div className="p-3 sm:p-3.5 rounded-xl bg-soft-cream/80 border border-soft-orange/30 flex items-start gap-2.5">
                                  <Lightbulb className="w-4 h-4 text-primary-orange shrink-0 mt-0.5" />
                                  <div className="space-y-0.5 min-w-0">
                                    <span className="text-[11px] font-bold text-primary-orange uppercase tracking-wider block">
                                      Hint
                                    </span>
                                    <p className="text-xs text-dark-black/80 leading-relaxed">
                                      {q.hint}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* 3. Interactive Choices */}
                              {/* NOTE: Correct answer is NOT shown until exams_conducted.results_released=true */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-dark-black/60 uppercase tracking-wider block">
                                    Select an Answer Choice ({q.choices.length})
                                  </span>
                                  {isAnswered && (
                                    <span className="text-[11px] font-semibold text-primary-orange">
                                      Tap another choice to update
                                    </span>
                                  )}
                                </div>

                                {q.choices.length === 0 ? (
                                  <p className="text-xs text-dark-black/45 italic">
                                    No multiple-choice options provided for this question.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 gap-2.5">
                                    {q.choices.map((choice, cIndex) => {
                                      const optionLetter = String.fromCharCode(65 + cIndex);
                                      const isChosen = selectedChoiceId === choice.id;

                                      return (
                                        <button
                                          key={choice.id || cIndex}
                                          type="button"
                                          disabled={isSubmitted}
                                          onClick={() => handleSelectChoice(q.id, choice.id)}
                                          className={`w-full text-left flex items-start sm:items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none text-xs sm:text-sm ${
                                            isSubmitted
                                              ? isChosen
                                                ? 'bg-soft-orange/30 border-primary-orange/60 font-semibold cursor-default'
                                                : 'bg-pure-white border-soft-cream opacity-60 cursor-not-allowed'
                                              : isChosen
                                              ? 'bg-soft-cream border-2 border-primary-orange text-dark-black shadow-xs font-bold'
                                              : 'bg-pure-white border-soft-cream hover:border-soft-orange/50 hover:bg-soft-cream/30 text-dark-black/85'
                                          }`}
                                        >
                                          {/* Option Identifier Badge */}
                                          <div
                                            className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                                              isChosen
                                                ? 'bg-primary-orange text-pure-white border-primary-orange'
                                                : 'bg-soft-cream text-dark-black border-soft-cream'
                                            }`}
                                          >
                                            {optionLetter}
                                          </div>

                                          {/* Choice Text (No answer revealed) */}
                                          <span className="flex-1 leading-relaxed">
                                            {choice.choice}
                                          </span>

                                          {/* Selected Indicator */}
                                          {isChosen && (
                                            <div className="shrink-0 flex items-center gap-1 text-primary-orange font-bold text-xs">
                                              <CheckCircle2 className="w-4 h-4 text-primary-orange" />
                                              <span className="hidden sm:inline">Selected</span>
                                            </div>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ============================================================== */}
                {/* 4. LAST SUBMIT BUTTON (Asks confirmation and updates submitted) */}
                {/* ============================================================== */}
                <div className="pt-4 border-t border-soft-orange/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-dark-black/60 text-center sm:text-left">
                    <span>{answeredCount} of {totalQuestionsCount} questions answered.</span>{' '}
                    <span>Ensure all questions are reviewed before submitting.</span>
                  </div>

                  <div>
                    {isSubmitted ? (
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-pure-white text-xs sm:text-sm font-bold shadow-xs select-none">
                        <CheckCircle2 className="w-4 h-4 text-pure-white" />
                        <span>Exam Submitted</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs sm:text-sm font-extrabold transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95 w-full sm:w-auto"
                        aria-label="Submit Exam"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Exam</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom clearance buffer */}
            <div className="h-16 sm:h-20" aria-hidden="true" />
          </main>
        </div>
      </div>

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/65 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setShowSubmitModal(false);
            }
          }}
        >
          <div className="bg-pure-white rounded-2xl border-2 border-soft-cream shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-extrabold text-dark-black">
                  Submit Exam Confirmation
                </h3>
                <p className="text-xs text-dark-black/70 leading-relaxed">
                  Are you sure you want to finish and submit your exam?
                </p>
              </div>
            </div>

            {/* Questions Answered Status in Modal */}
            <div className="p-3.5 rounded-xl bg-soft-cream/60 border border-soft-orange/30 space-y-1.5 text-xs text-dark-black/80">
              <div className="flex justify-between font-bold">
                <span>Progress:</span>
                <span className="text-primary-orange font-mono">
                  {answeredCount} / {totalQuestionsCount} Answered
                </span>
              </div>
              {answeredCount < totalQuestionsCount && (
                <p className="text-amber-700 text-[11px] leading-tight font-medium">
                  Notice: You still have {totalQuestionsCount - answeredCount} unanswered question(s).
                </p>
              )}
            </div>

            <p className="text-xs text-dark-black/65 leading-relaxed">
              Once submitted, your choices will be finalized. You will not be able to modify your answers afterwards.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 rounded-xl bg-pure-white border border-soft-cream text-xs font-bold text-dark-black/70 hover:text-dark-black hover:bg-soft-cream transition-colors cursor-pointer"
              >
                Continue Reviewing
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-orange hover:bg-soft-orange text-pure-white hover:text-dark-black text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-pure-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Yes, Submit Exam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Learner Bottom Navigation */}
      <LearnerBottomNavigation />
    </div>
  );
}

export default function OpenExamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <div className="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OpenExamPageContent />
    </Suspense>
  );
}

