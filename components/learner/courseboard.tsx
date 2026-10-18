'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  MessageSquare,
  Radio,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  getBatchBoardData,
  BatchBoardData,
  BatchBoardMessage,
} from '@/lib/learnercourses';

interface CourseBoardProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  batchUuid?: string;
  batchCode?: string;
  courseTitle?: string;
}

function formatMessageTimestamp(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr || '';
  }
}

export default function CourseBoard({
  isOpen,
  onClose,
  batchId,
  batchUuid,
  batchCode,
  courseTitle,
}: CourseBoardProps) {
  const [board, setBoard] = useState<BatchBoardData | null>(null);
  const [messages, setMessages] = useState<BatchBoardMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load batch board and messages via getBatchBoardData in lib/learnercourses.ts
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchBoardAndMessages() {
      setLoading(true);
      try {
        const targetBatchId = batchUuid || batchId;
        const result = await getBatchBoardData(
          targetBatchId,
          batchCode,
          courseTitle
        );

        if (isMounted) {
          setBoard(result.board);
          setMessages(result.messages);
        }
      } catch (err) {
        console.warn('Error loading batch board data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBoardAndMessages();

    return () => {
      isMounted = false;
    };
  }, [isOpen, batchId, batchUuid, batchCode, courseTitle]);

  // Auto scroll to bottom of chatbox on message update
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, messages]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-pure-white rounded-2xl border-2 border-soft-cream shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* ============================================================== */}
        {/* HEADER: Title & Description & Close Button                     */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-5 bg-pure-white border-b border-soft-cream flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-soft-cream text-primary-orange text-[11px] font-bold uppercase tracking-wider border border-soft-orange/40">
                <Radio className="w-3 h-3 text-primary-orange animate-pulse" />
                <span>Batch Board</span>
              </span>
              {batchCode && (
                <span className="text-xs font-semibold text-dark-black/60 bg-soft-cream/60 px-2 py-0.5 rounded-md font-mono">
                  {batchCode}
                </span>
              )}
            </div>

            {/* Board Title */}
            <h2 className="text-lg sm:text-xl font-extrabold text-dark-black truncate">
              {board?.title || 'Batch Board'}
            </h2>

            {/* Board Description */}
            {board?.description && (
              <p className="text-xs text-dark-black/70 leading-relaxed line-clamp-2">
                {board.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-dark-black/50 hover:text-dark-black hover:bg-soft-cream transition-colors shrink-0 cursor-pointer"
            aria-label="Close batch board"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* CHATBOX MESSAGE FEED (Scrollable, only receives messages)       */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-soft-cream/25 [scrollbar-width:thin]">
          {loading ? (
            <div className="py-20 text-center space-y-2">
              <div className="w-8 h-8 border-2 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-dark-black/60 font-semibold">
                Loading batch announcements...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-16 px-4 text-center max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-soft-cream text-primary-orange flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-dark-black">No Messages Yet</h3>
              <p className="text-xs text-dark-black/60 leading-relaxed">
                Your mentors and batch coordinators have not posted announcements yet. All batch schedules, links, and updates will be streamed here.
              </p>
            </div>
          ) : (
            <>
              {/* Messages List: if text type = message (or text) display as text and text value with date */}
              {messages.map((msg, index) => {
                const isTextMessage =
                  msg.type === 'message' || msg.type === 'text' || !msg.type;
                const formattedDate = formatMessageTimestamp(msg.created_at);

                return (
                  <div
                    key={msg.id || index}
                    className="flex flex-col items-start gap-1 max-w-[90%] sm:max-w-[85%]"
                  >
                    {/* Sender Tag */}
                    <div className="flex items-center gap-1.5 px-1 text-[11px] text-dark-black/60 font-medium">
                      <span className="font-bold text-primary-orange">Instructor / Board</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-dark-black/40" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    {/* Chat Bubble: Text Message */}
                    {isTextMessage ? (
                      <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-xs bg-pure-white border border-soft-cream shadow-xs text-dark-black space-y-1">
                        <p className="text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-wrap break-words">
                          {msg.text_value || 'No message content'}
                        </p>
                      </div>
                    ) : (
                      /* Resource Attachment */
                      <div className="p-3.5 rounded-2xl rounded-tl-xs bg-pure-white border border-soft-cream shadow-xs text-dark-black space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary-orange">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Resource Attachment</span>
                        </div>
                        {msg.text_value && (
                          <p className="text-xs sm:text-sm text-dark-black/80 whitespace-pre-wrap break-words">
                            {msg.text_value}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ============================================================== */}
        {/* FOOTER: Chatbox read-only indicator (only receives messages)   */}
        {/* ============================================================== */}
        <div className="p-3.5 sm:p-4 bg-pure-white border-t border-soft-cream shrink-0">
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-soft-cream/60 border border-soft-cream text-xs text-dark-black/75">
            <div className="flex items-center gap-2 min-w-0">
              <Lock className="w-3.5 h-3.5 text-primary-orange shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">
                Batch board is read-only. Only receiving messages from instructors.
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-orange shrink-0 bg-pure-white px-2 py-0.5 rounded-sm border border-soft-orange/30">
              Live Feed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
