'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Surfaces the lead-capture dialog once the user has engaged meaningfully
// (plan §2.4: "typically 5+ messages or a completed calculator"). Once the
// user dismisses or submits, we remember that in localStorage so we never nag
// them again on this browser.

const STORAGE_KEY = 'annah:lead:status';
const DEFAULT_MESSAGE_THRESHOLD = 5;

type LeadStatus = 'pending' | 'dismissed' | 'submitted';

function readStatus(): LeadStatus {
  if (typeof window === 'undefined') return 'pending';
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'dismissed' || v === 'submitted' ? v : 'pending';
  } catch {
    return 'pending';
  }
}

function writeStatus(status: LeadStatus): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, status);
  } catch {
    // Private mode / storage disabled — degrade to in-memory only.
  }
}

interface UseLeadTriggerOptions {
  /** Count of user messages sent in this conversation. */
  userMessageCount: number;
  /** How many messages before the dialog auto-opens. */
  messageThreshold?: number;
}

interface UseLeadTriggerResult {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /** Imperatively open the dialog (e.g. after a calculator produces a result). */
  trigger: () => void;
  /** Call after a successful submission so the dialog never reappears. */
  markSubmitted: () => void;
}

export function useLeadTrigger({
  userMessageCount,
  messageThreshold = DEFAULT_MESSAGE_THRESHOLD,
}: UseLeadTriggerOptions): UseLeadTriggerResult {
  const [open, setOpen] = useState(false);
  // null until resolved on the client — avoids reading localStorage during
  // render (which would risk an SSR hydration mismatch).
  const statusRef = useRef<LeadStatus | null>(null);

  // Auto-open when the engagement threshold is crossed, unless the user has
  // already dismissed or submitted on this browser.
  useEffect(() => {
    if (statusRef.current === null) {
      statusRef.current = readStatus();
    }
    if (statusRef.current === 'pending' && userMessageCount >= messageThreshold) {
      // Reacting to a prop crossing the engagement threshold — fires at most
      // once before status flips to dismissed/submitted.
      setOpen(true);
    }
  }, [userMessageCount, messageThreshold]);

  const trigger = useCallback(() => {
    if (statusRef.current === 'pending') setOpen(true);
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    // Closing the dialog without submitting counts as a dismissal.
    if (!next && statusRef.current === 'pending') {
      statusRef.current = 'dismissed';
      writeStatus('dismissed');
    }
  }, []);

  const markSubmitted = useCallback(() => {
    statusRef.current = 'submitted';
    writeStatus('submitted');
    setOpen(false);
  }, []);

  return { open, onOpenChange, trigger, markSubmitted };
}
