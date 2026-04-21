'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, FileText, X, Upload } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestionChip } from './SuggestionChip';
import { LeadCaptureModal } from './LeadCaptureModal';
import { Badge } from '@/components/ui/badge';
import { sendToAnna, buildDocContext, extractCitations, cleanText } from '@/lib/anna';
import type { Message } from '@/types';
import type { UploadedDoc } from '@/lib/anna';

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
  content: "Hi, I'm Anna – your Scotland-wide mortgage advisor for first-time buyers.\n\nI cover the whole of Scotland – from Edinburgh and Glasgow to Aberdeen, Dundee, Inverness and everywhere in between. I can help with Scottish government schemes, LBTT, new build developments, the buying process, and more.\n\nI have interactive calculators on the right panel, and you can upload mortgage guides or scheme PDFs using the paperclip button below.",
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
  const [msgCount, setMsgCount] = useState(0);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Handle nav sidebar clicks
  useEffect(() => {
    if (externalMessage) { handleSend(externalMessage); onExternalHandled?.(); }
  }, [externalMessage]);

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
  }, [exportTrigger]);

  const processFile = useCallback(async (file: File) => {
    const id = Date.now() + Math.random();
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    setDocs(prev => [...prev, { id, name: file.name, type: ext, size: file.size, status: 'processing', text: '', progress: 0 }]);
    try {
      if (ext === 'pdf') {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
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
    } catch { setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'error' } : d)); }
  }, []);

  const handleFiles = (files: FileList | null) => { if (files) Array.from(files).forEach(processFile); };

  const callAnna = async (hist: { role: 'user' | 'assistant'; content: string }[]) => {
    setIsTyping(true);
    try {
      const raw = await sendToAnna(hist, buildDocContext(docs));
      const citations = extractCitations(raw);
      const cleaned = cleanText(raw);
      const aiMsg: Message = { id: Date.now().toString(), role: 'assistant', content: cleaned, timestamp: new Date(), citations: citations.length ? citations : undefined };
      setMessages(prev => [...prev, aiMsg]);
      setHistory(prev => [...prev, { role: 'assistant', content: raw }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.', timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  const handleSend = async (content: string) => {
    const newCount = msgCount + 1;
    setMsgCount(newCount);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }]);
    const newHist = [...history, { role: 'user' as const, content }];
    setHistory(newHist);
    if (newCount === 3 && !leadCaptured) { setPendingMsg(content); setShowLeadModal(true); return; }
    await callAnna(newHist);
  };

  const handleLeadComplete = async (name?: string) => {
    setLeadCaptured(true);
    setShowLeadModal(false);
    let hist = history;
    if (name) {
      hist = [...history, { role: 'user' as const, content: `[System: User is ${name}. Greet them warmly by first name.]` }];
      setHistory(hist);
    }
    if (pendingMsg) { setPendingMsg(null); await callAnna(hist); }
  };

  const readyDocs = docs.filter(d => d.status === 'ready');
  const hasMessages = messages.length > 1;
  const fmtSize = (b: number) => b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(1)}MB`;

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
        ref={scrollRef}
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
              Anna is referencing {readyDocs.length} uploaded document{readyDocs.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-border/50 flex-shrink-0">
        <ChatInput onSend={handleSend} disabled={isTyping} onFileUpload={handleFiles} docCount={readyDocs.length} />
      </div>

      <LeadCaptureModal open={showLeadModal} onComplete={handleLeadComplete} />
    </div>
  );
}
