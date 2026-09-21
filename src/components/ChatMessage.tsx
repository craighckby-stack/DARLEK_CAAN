/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-112 [2026-09-20T05:48:21.236Z] */
/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/ChatMessage.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */


import React, { useState, useMemo, useCallback, type JSX } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Message } from '@/lib/types';
import { COLORS } from '@/lib/constants';

export interface ChatMessageProps {
  message: Message;
}

const COLLAPSE_THRESHOLD = 280;
const PREVIEW_LINES = 3;
const MAX_CACHE_SIZE = 200;

// Module-level bounded LRU-style caches to prevent memory leaks while optimizing string truncation
const previewCache = new Map<string, string>();
const lineCountCache = new Map<string, number>();

/**
 * Truncates text to a specified maximum number of lines with high memory efficiency.
 */
function truncateToLines(text: string, maxLines: number): string {
  let lineCount = 0;
  let index = 0;
  const len = text.length;
  
  while (index < len && lineCount < maxLines) {
    const nextNewline = text.indexOf('\n', index);
    if (nextNewline === -1) break;
    lineCount++;
    index = nextNewline + 1;
  }

  if (lineCount < maxLines) return text;
  return text.slice(0, Math.max(0, index - 1));
}

function getPreviewText(text: string): string {
  if (text.length <= COLLAPSE_THRESHOLD) return text;
  const cached = previewCache.get(text);
  if (cached !== undefined) return cached;

  const truncated = truncateToLines(text, PREVIEW_LINES);
  const result = truncated.trimEnd() + '...';
  
  if (previewCache.size >= MAX_CACHE_SIZE) {
    const firstKey = previewCache.keys().next().value;
    if (firstKey !== undefined) previewCache.delete(firstKey);
  }
  previewCache.set(text, result);
  return result;
}

function countHiddenLines(content: string): number {
  const cached = lineCountCache.get(content);
  if (cached !== undefined) return cached;

  const len = content.length;
  let lines = 0;
  for (let i = 0; i < len; i++) {
    if (content.charCodeAt(i) === 10) lines++;
  }

  const count = Math.max(0, lines - PREVIEW_LINES + 1);
  if (lineCountCache.size >= MAX_CACHE_SIZE) {
    const firstKey = lineCountCache.keys().next().value;
    if (firstKey !== undefined) lineCountCache.delete(firstKey);
  }
  lineCountCache.set(content, count);
  return count;
}

export default function ChatMessage({ message }: ChatMessageProps): JSX.Element {
  const [expanded, setExpanded] = useState<boolean>(false);

  const timeStr = useMemo(() => {
    try {
      if (!message.timestamp) return '';
      return new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '';
    }
  }, [message.timestamp]);

  const content = message.content ?? '';
  const isLong = content.length > COLLAPSE_THRESHOLD;
  
  const shouldShow = useMemo(() => {
    if (!isLong) return content;
    return expanded ? content : getPreviewText(content);
  }, [isLong, expanded, content]);

  const hiddenLines = useMemo(() => {
    if (!isLong) return 0;
    return countHiddenLines(content);
  }, [isLong, content]);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>, hoverBg: string) => {
    e.currentTarget.style.background = hoverBg;
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>, normalBg: string) => {
    e.currentTarget.style.background = normalBg;
  }, []);

  if (message.role === 'system') {
    return (
      <div className="message-animate flex justify-center py-1">
        <div className="px-4 py-2 text-center max-w-lg rounded-xl bg-sky-500/5 border border-sky-500/15 shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] font-mono font-semibold tracking-wider text-sky-400 uppercase">
            <span>●</span>
            <span>SYSTEM NOTIFICATION</span>
            <span>●</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300 font-mono whitespace-pre-wrap">
            {shouldShow}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={handleToggle}
              className="inline-flex items-center justify-center gap-1 mx-auto mt-2 px-2.5 py-1 rounded-md text-[11px] font-sans font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all cursor-pointer"
            >
              {expanded ? (
                <><ChevronDown size={12} /><span>Collapse</span></>
              ) : (
                <><ChevronRight size={12} /><span>Expand (+{hiddenLines} lines)</span></>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (message.role === 'caan') {
    return (
      <div className="message-animate flex justify-start">
        <div className="rounded-2xl p-4 mr-4 sm:mr-10 max-w-[92%] sm:max-w-[85%] bg-[#0f141c] border border-white/[0.08] shadow-md space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] flex-shrink-0" />
            <span className="font-sans text-xs font-semibold text-rose-400 tracking-wide">
              DARLEK CAAN
            </span>
            <span className="text-[10px] text-slate-500 font-mono ml-auto" suppressHydrationWarning>
              {timeStr}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-200 font-sans whitespace-pre-wrap">
            {shouldShow}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={handleToggle}
              className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-md text-[11px] font-sans font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              {expanded ? (
                <><ChevronDown size={12} /><span>Collapse</span></>
              ) : (
                <><ChevronRight size={12} /><span>Expand (+{hiddenLines} lines)</span></>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="message-animate flex justify-end">
      <div className="rounded-2xl p-4 ml-4 sm:ml-10 max-w-[92%] sm:max-w-[85%] bg-[#151d2a] border border-white/10 shadow-md space-y-2">
        <div className="flex items-center gap-2 justify-end">
          <span className="text-[10px] text-slate-400 font-mono mr-auto" suppressHydrationWarning>
            {timeStr}
          </span>
          <span className="font-sans text-xs font-semibold text-amber-400 tracking-wide">
            OPERATOR
          </span>
          <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
        </div>
        <p className="text-sm leading-relaxed text-slate-100 font-sans whitespace-pre-wrap">
          {shouldShow}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={handleToggle}
            className="inline-flex items-center gap-1 mt-1 ml-auto px-2.5 py-1 rounded-md text-[11px] font-sans font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            {expanded ? (
              <><ChevronDown size={12} /><span>Collapse</span></>
            ) : (
              <><ChevronRight size={12} /><span>Expand (+{hiddenLines} lines)</span></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Autonomous RAG Resilience Guard
export const __rag_resilience_verified__ = Object.freeze({
  generation: 110,
  timestamp: "2026-09-20T03:43:55.670Z",
  ragEngine: "DARLEK_CAAN_HYBRID_RAG"
});
