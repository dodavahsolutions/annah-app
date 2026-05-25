'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, FileText, X, Upload } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestionChip } from './SuggestionChip';
import { LeadCaptureDialog } from './lead/LeadCaptureDialog';
import { useLeadTrigger } from '@/hooks/useLeadTrigger';
import { Badge } from '@/components/ui/badge';
import { streamFromAnna, buildDocContext, extractCitations, cleanText } from '@/lib/anna';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { Message } from '@/types';
import type { UploadedDoc } from '@/lib/anna';

const MAX_USER_MESSAGE_CHARS = 2000;

const suggestions = [
  "How much deposit do I need in Scotland?",
  "What's the LBTT threshold for first-time buyers?",
  "Best new build areas near Edinburgh?",
  "Help to Buy Scotland eligibility?",
  "Walk me through the Scottish buying process",
  "What is the LIFT Shared Equity scheme?",
];

const initialMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi, I'm Annah – your Scotland-wide mortgage advisor for first-time buyers.\n\nI cover the whole of Scotland – from Edinburgh and Glasgow to Aberdeen, Dundee, Inverness and everywhere in between. I can help with Scottish government schemes, LBTT, new build developments, the buying process, and more.\n\nI have interactive calculators on the right panel, and you can upload mortgage guides or scheme PDFs using the paperclip button below.",
  timestamp: new Date(),
};

interface ChatAreaProps {
  externalMessage?: string;
  onExternalHandled?: () => void;
  exportTrigger?: number;
}

export function ChatArea({ externalMessage, onExternalHandled, exportTrigger }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // In-flight guard: prevents two parallel ensureSession calls from inserting
  // duplicate session rows when the user sends messages rapidly.
  const sessionPromiseRef = useRef<Promise<string | null> | null>(null);
  const { user } = useAuth();

  // Derive Anna's greeting hint from the signed-up user's metadata. The
  // sanitisation that used to live in the lead-capture flow now lives
  // server-side in /api/anna/route.ts.
  const firstName = useMemo<string | undefined>(() => {
    const full = (user?.user_metadata?.full_name as string | undefined) ?? '';
    const trimmed = full.trim().split(/\s+/)[0];
    return trimmed ? trimmed.slice(0, 60) : undefined;
  }, [user]);

  const ensureSession = useCallback(
    (firstMessageContent: string): Promise<string | null> => {
      if (!user) return Promise.resolve(null);
      if (sessionId) return Promise.resolve(sessionId);
      if (sessionPromiseRef.current) return sessionPromiseRef.current;

      const p = (async () => {
        try {
          const supabase = createClient();
          if (!supabase) return null;
          const title = firstMessageContent.slice(0, 80);
          const { data, error } = await supabase
            .from('sessions')
            .insert({ user_id: user.id, title })
            .select('id')
            .single();
          if (error || !data) {
            // Persistence failure is non-fatal — chat still works in-memory.
            return null;
          }
          const id = data.id as string;
          setSessionId(id);
          return id;
        } finally {
          sessionPromiseRef.current = null;
        }
      })();

      sessionPromiseRef.current = p;
      return p;
    },
    [user, sessionId]
  );

  const persistMessage = useCallback(
    async (sid: string, role: 'user' | 'assistant', content: string) => {
      try {
        const supabase = createClient();
        if (!supabase) return;
        await supabase.from('messages').insert({ session_id: sid, role, content });
        // Bump session.updated_at so the "most recent session" query on the
        // next page load returns this conversation. Best-effort — failures
        // are silently ignored to avoid leaking schema details.
        await supabase
          .from('sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sid);
      } catch {
        // ignore
      }
    },
    []
  );

  // Auto-scroll to bottom — scrollIntoView on a sentinel is cheaper than
  // forcing a layout read of scrollHeight every render.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  // Load the user's most recent chat session on mount so refresh doesn't wipe
  // history. RLS on `sessions` and `messages` ensures we only ever see rows
  // belonging to auth.uid(). If the user has no prior sessions, we fall back
  // to the welcome message (initialMessage).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        if (!supabase) return;
        const { data: sess } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (cancelled || !sess) return;

        const { data: rows } = await supabase
          .from('messages')
          .select('id, role, content, created_at')
          .eq('session_id', sess.id)
          .order('created_at', { ascending: true });
        if (cancelled || !rows || rows.length === 0) return;

        const restored: Message[] = rows.map((r) => ({
          id: String(r.id),
          role: r.role as 'user' | 'assistant',
          content: r.content as string,
          timestamp: new Date(r.created_at as string),
        }));
        setSessionId(sess.id as string);
        setMessages([initialMessage, ...restored]);
        setHistory(
          restored.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))
        );
      } catch {
        // ignore — fall back to the welcome message
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const callAnna = useCallback(
    async (hist: { role: 'user' | 'assistant'; content: string }[], sid: string | null) => {
      setIsTyping(true);
      const assistantId = Date.now().toString();
      // Seed an empty assistant message and append streamed tokens to it.
      setMessages(prev => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
      ]);

      let raw = '';
      try {
        for await (const delta of streamFromAnna(hist, buildDocContext(docs), firstName)) {
          raw += delta;
          const cleanedSoFar = cleanText(raw);
          setMessages(prev =>
            prev.map(m => (m.id === assistantId ? { ...m, content: cleanedSoFar } : m))
          );
          // Hide the typing indicator once the first token arrives.
          setIsTyping(false);
        }

        const citations = extractCitations(raw);
        const cleaned = cleanText(raw);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: cleaned, citations: citations.length ? citations : undefined }
              : m
          )
        );
        setHistory(prev => [...prev, { role: 'assistant', content: raw }]);
        if (sid && cleaned) await persistMessage(sid, 'assistant', cleaned);
      } catch {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: 'Sorry, I had trouble connecting. Please try again.' }
              : m
          )
        );
      } finally {
        setIsTyping(false);
      }
    },
    [docs, persistMessage, firstName]
  );

  const handleSend = useCallback(
    async (rawContent: string) => {
      const content = rawContent.slice(0, MAX_USER_MESSAGE_CHARS).trim();
      if (!content) return;

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content, timestamp: new Date() },
      ]);
      const newHist = [...history, { role: 'user' as const, content }];
      setHistory(newHist);
      const sid = await ensureSession(content);
      if (sid) await persistMessage(sid, 'user', content);
      await callAnna(newHist, sid);
    },
    [history, ensureSession, persistMessage, callAnna]
  );

  // Handle nav sidebar clicks — now correctly depends on handleSend so the
  // latest closure is used (no stale docs/history).
  useEffect(() => {
    if (externalMessage) {
      handleSend(externalMessage);
      onExternalHandled?.();
    }
  }, [externalMessage, handleSend, onExternalHandled]);

  // Export
  useEffect(() => {
    if (!exportTrigger) return;
    const lines = ['ANNA — SCOTLAND MORTGAGE ADVISOR', '='.repeat(50), `Exported: ${new Date().toLocaleString('en-GB')}`, ''];
    messages.forEach(m => { lines.push(m.role === 'user' ? 'YOU:' : 'ANNA:'); lines.push(m.content); lines.push(''); });
    lines.push('—'.repeat(50), 'For general information only. Not regulated financial advice.');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
    a.download = `anna-chat-${Date.now()}.txt`;
    a.click();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportTrigger]);

  const processFile = useCallback(async (file: File) => {
    const id = Date.now() + Math.random();
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    setDocs(prev => [...prev, { id, name: file.name, type: ext, size: file.size, status: 'processing', text: '', progress: 0 }]);
    try {
      if (ext === 'pdf') {
        const pdfjsLib = await import('pdfjs-dist');
        // Self-hosted same-origin worker — pinned to the version installed via
        // package.json. Eliminates supply-chain risk from third-party CDN.
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const arr = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arr }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const ct = await page.getTextContent();
          text += (ct.items as Array<{ str?: string }>).map(s => s.str || '').join(' ') + '\n';
          setDocs(prev => prev.map(d => d.id === id ? { ...d, progress: Math.round(i / pdf.numPages * 100) } : d));
        }
        setDocs(prev => prev.map(d => d.id === id ? { ...d, text: text.substring(0, 60000), status: 'ready', progress: 100 } : d));
      } else {
        const text = await file.text();
        setDocs(prev => prev.map(d => d.id === id ? { ...d, text: text.substring(0, 40000), status: 'ready', progress: 100 } : d));
      }
    } catch {
      // PDF parse failure surfaces via the per-doc 'error' badge — no console
      // leak (a malicious PDF could otherwise probe parser internals).
      setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'error' } : d));
    }
  }, []);

  const handleFiles = (files: FileList | null) => { if (files) Array.from(files).forEach(processFile); };

  const readyDocs = docs.filter(d => d.status === 'ready');
  const hasMessages = messages.length > 1;
  const fmtSize = (b: number) => b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(1)}MB`;

  // Surface the broker lead-capture dialog once the user has sent enough
  // messages to signal genuine intent (plan §2.4).
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const lead = useLeadTrigger({ userMessageCount });

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* Doc bar */}
      {docs.length > 0 && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="px-4 py-2 border-b border-border/50 bg-secondary/20 flex items-center gap-2 flex-wrap flex-shrink-0">
          {docs.map(doc => (
            <motion.div key={doc.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
              className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-lg text-xs">
              <FileText className="w-3 h-3 text-emerald-400" />
              <span className="text-foreground font-medium max-w-[100px] truncate">{doc.name}</span>
              <span className="text-muted-foreground">{fmtSize(doc.size)}</span>
              {doc.status === 'processing' && <span className="text-yellow-400">{doc.progress}%</span>}
              {doc.status === 'ready' && <Badge variant="outline" className="text-[9px] py-0 px-1 border-emerald-500/30 text-emerald-400">✓</Badge>}
              {doc.status === 'error' && <span className="text-red-400">✗</span>}
              <button onClick={() => setDocs(prev => prev.filter(d => d.id !== doc.id))} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
            </motion.div>
          ))}
          <label className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-400 transition-colors px-2 py-1 cursor-pointer">
            <Upload className="w-3 h-3" /><span>Add</span>
            <input type="file" accept=".pdf,.txt" multiple onChange={e => handleFiles(e.target.files)} className="hidden" />
          </label>
        </motion.div>
      )}

      {/* Messages — THIS is the scrollable area */}
      <div
        style={{ flex:1, minHeight:0, overflowY:'scroll', overflowX:'hidden', padding:'24px 16px' }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((msg, i) => <ChatMessage key={msg.id} message={msg} index={i} />)}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-background" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-5 py-4">
                <div className="flex gap-1.5">
                  {[0,150,300].map(d => <span key={d} className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing-dot" style={{ animationDelay:`${d}ms` }} />)}
                </div>
              </div>
            </motion.div>
          )}

          {!hasMessages && !isTyping && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }} className="pt-8">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <Sparkles className="w-4 h-4" /><span className="text-sm">Suggested questions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((s, i) => <SuggestionChip key={i} text={s} onClick={() => handleSend(s)} index={i} />)}
              </div>
            </motion.div>
          )}

          {readyDocs.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-emerald-400/60 justify-center">
              <FileText className="w-3 h-3" />
              Annah is referencing {readyDocs.length} uploaded document{readyDocs.length > 1 ? 's' : ''}
            </div>
          )}

          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-border/50 flex-shrink-0">
        <ChatInput onSend={handleSend} disabled={isTyping} onFileUpload={handleFiles} docCount={readyDocs.length} />
      </div>

      <LeadCaptureDialog
        open={lead.open}
        onOpenChange={lead.onOpenChange}
        engagementMessages={userMessageCount}
        hasUploadedDoc={readyDocs.length > 0}
        onSubmitted={lead.markSubmitted}
      />
    </div>
  );
}
