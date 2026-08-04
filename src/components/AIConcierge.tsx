// AIConcierge — the customer-facing face of the Autonomous AI-Operated Enterprise.
// Guests get a login prompt (CSO gate: no sign-in → no DeepSeek).
// Signed-in customers get: preference setup (language / staff gender / tone / assistance),
// a Director-routed agent, idle nudges, cart encouragement, busy & escalation states.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, X, Send, LogIn, ShieldAlert, Settings2, Mic, Sprout } from 'lucide-react';
import { useApp } from '@/App';
import { getSupabase } from '@/lib/supabaseClient';
import { DEFAULT_PREFS, loadPrefs, savePrefs, managersOnDuty } from '@/lib/ai/agents';
import type { AIAgent, AIPrefs } from '@/lib/ai/agents';
import {
  composeGreeting, composeEncouragement,
  startIdleEngine, sendToAI, pickAgentForSession,
} from '@/lib/ai/concierge';
import type { ChatMessage, IdleTimers } from '@/lib/ai/concierge';

const INK = '#0B1D1F';
const PORCELAIN = '#F2EFE6';
const BRASS = '#C8A96A';

type PanelView = 'guest' | 'setup' | 'chat' | 'optedOut';

// webkit types — the Web Speech API isn't in TS's DOM lib for all vendors,
// so we keep a tiny local shape and cast through `any` only at the window lookup.
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: any) => void) | null;
  start: () => void;
  stop: () => void;
}

// Preferred chat language → BCP-47 tag for speech recognition (South African locales).
const SPEECH_LANGS: Record<AIPrefs['language'], string> = {
  English: 'en-ZA',
  IsiZulu: 'zu-ZA',
  IsiXhosa: 'xh-ZA',
  Afrikaans: 'af-ZA',
  Sepedi: 'nso-ZA',
  Setswana: 'tn-ZA',
};

let msgCounter = 0;
const localId = () => `local_${Date.now()}_${msgCounter++}`;

export default function AIConcierge({ page }: { page: string }) {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PanelView>('guest');
  const [prefs, setPrefs] = useState<AIPrefs>(DEFAULT_PREFS);
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [standby, setStandby] = useState(false);
  const [listening, setListening] = useState(false);
  const idleRef = useRef<IdleTimers | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastEncourageRef = useRef(0);
  const prevCartCountRef = useRef(0);
  const greetedRef = useRef(false);

  const cartCount = useMemo(() => app.cart.reduce((s, i) => s + i.qty, 0), [app.cart]);
  const cartTotal = useMemo(() => app.cart.reduce((s, i) => s + i.price * i.qty, 0), [app.cart]);

  // ---------- boot: load prefs (profile beats localStorage) ----------
  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      const local = loadPrefs();
      if (!app.user) { if (!cancelled) { setPrefs(local); setView('guest'); } return; }
      const supabase = getSupabase();
      if (supabase) {
        const { data } = await supabase
          .from('profiles')
          .select('ai_language, ai_tone, ai_staff_gender, ai_assistance')
          .eq('id', app.user.id)
          .maybeSingle();
        if (!cancelled && data && (data as Record<string, string>).ai_language) {
          const p: AIPrefs = {
            language: (data.ai_language as AIPrefs['language']) || local.language,
            tone: (data.ai_tone as AIPrefs['tone']) || local.tone,
            staffGender: (data.ai_staff_gender as AIPrefs['staffGender']) || local.staffGender,
            assistance: (data.ai_assistance as AIPrefs['assistance']) || local.assistance,
          };
          setPrefs(p); savePrefs(p);
          setView(p.assistance === 'No' ? 'optedOut' : 'chat');
          return;
        }
      }
      if (!cancelled) { setPrefs(local); setView('setup'); }
    };
    boot();
    return () => { cancelled = true; };
  }, [app.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- idle engine ----------
  const restartIdle = useCallback((a: AIAgent) => {
    idleRef.current?.cancel();
    idleRef.current = startIdleEngine({
      agent: a,
      onNudge: (msg) => setMessages((prev) => [...prev, msg]),
      onStandby: () => setStandby(true),
    });
  }, []);

  useEffect(() => () => { idleRef.current?.cancel(); recognitionRef.current?.stop(); }, []);

  // ---------- voice input (Web Speech API) ----------
  const speechSupported =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec: SpeechRecognitionLike = new SR();
    rec.lang = SPEECH_LANGS[prefs.language] || 'en-ZA';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const transcript: string = e.results?.[0]?.[0]?.transcript || '';
      if (transcript) setInput((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
    };
    rec.onend = () => { setListening(false); recognitionRef.current = null; };
    rec.onerror = () => { setListening(false); recognitionRef.current = null; };
    recognitionRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      recognitionRef.current = null;
    }
  };

  // ---------- greeting on first open of the chat view ----------
  useEffect(() => {
    if (!open || view !== 'chat' || !app.user || greetedRef.current) return;
    const a = pickAgentForSession({ page, staffGender: prefs.staffGender });
    setAgent(a);
    greetedRef.current = true;
    const coveringManager =
      (page.startsWith('/tracker') || page.startsWith('/bank-confirm')) &&
      !managersOnDuty() && a.kind === 'stylist';
    const greet = composeGreeting(prefs, a, app.user.username);
    setMessages([{ id: localId(), sender: 'agent', at: Date.now(),
      content: coveringManager ? `${greet}\n\n(Our managers rest 18:00–06:00 — I'm covering the night shift! 🌙)` : greet }]);
    setStandby(false);
    restartIdle(a);
  }, [open, view, app.user, page, prefs, restartIdle]);

  // Reset greeting when user logs out
  useEffect(() => {
    if (!app.user) {
      greetedRef.current = false;
      setMessages([]); setAgent(null); setConversationId(null);
      setEscalated(false); setStandby(false);
      idleRef.current?.cancel();
    }
  }, [app.user]);

  // ---------- cart-progress encouragement (throttled, zero tokens) ----------
  useEffect(() => {
    const prev = prevCartCountRef.current;
    prevCartCountRef.current = cartCount;
    if (!open || view !== 'chat' || !agent || escalated) return;
    if (cartCount > prev && Date.now() - lastEncourageRef.current > 2 * 60 * 1000) {
      lastEncourageRef.current = Date.now();
      const newest = app.cart[app.cart.length - 1];
      setMessages((m) => [...m, {
        id: localId(), sender: 'agent', at: Date.now(),
        content: composeEncouragement(newest?.title),
      }]);
    }
  }, [cartCount, open, view, agent, escalated, app.cart]);

  // ---------- autoscroll ----------
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  // ---------- persist prefs ----------
  const persistPrefs = async (p: AIPrefs) => {
    savePrefs(p);
    const supabase = getSupabase();
    if (supabase && app.user) {
      await supabase.from('profiles').update({
        ai_language: p.language, ai_tone: p.tone,
        ai_staff_gender: p.staffGender, ai_assistance: p.assistance,
      }).eq('id', app.user.id);
    }
  };

  // ---------- send ----------
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !agent || !app.user || typing || escalated) return;
    setInput('');
    setStandby(false);
    setMessages((m) => [...m, { id: localId(), sender: 'user', content: text, at: Date.now() }]);
    setTyping(true);
    restartIdle(agent);
    try {
      const res = await sendToAI({
        message: text, agent, prefs, page,
        cart: { count: cartCount, total: cartTotal, items: app.cart.map((i) => `${i.qty}× ${i.title}`) },
        conversationId,
      });
      if (res.conversationId) setConversationId(res.conversationId);
      if (res.escalated) setEscalated(true);
      setMessages((m) => [...m, { id: localId(), sender: res.escalated ? 'system' : 'agent', content: res.reply, at: Date.now() }]);
    } finally {
      setTyping(false);
    }
  };

  // ---------- FAB ----------
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
        className="fixed bottom-24 right-4 z-[60] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ background: INK, border: `2px solid ${BRASS}` }}
      >
        <Sparkles size={24} color={BRASS} />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#9FE0C6] border-2 border-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-[60] w-[min(92vw,380px)] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      style={{ background: PORCELAIN, border: `1.5px solid ${INK}`, maxHeight: 'min(70vh, 560px)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: INK }}>
        {view === 'chat' && agent ? (
          <>
            <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{agent.name} <span className="font-normal opacity-60">· {agent.role}</span></p>
              <p className="text-[11px] truncate" style={{ color: BRASS }}>
                {standby ? 'Away — back when you message' : typing ? 'Typing…' : agent.tagline}
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white flex items-center gap-1.5"><Sparkles size={15} color={BRASS} /> Young Agri AI Team</p>
            <p className="text-[11px] text-white/60">Sales floor 24/7 · Managers 06:00–18:00</p>
          </div>
        )}
        {view === 'chat' && (
          <button onClick={() => setView('setup')} aria-label="AI preferences"
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70"><Settings2 size={17} /></button>
        )}
        <button onClick={() => setOpen(false)} aria-label="Close"
          className="p-1.5 rounded-full hover:bg-white/10 text-white/70"><X size={18} /></button>
      </div>

      {/* GUEST — CSO gate: no sign-in, no DeepSeek */}
      {view === 'guest' && (
        <div className="p-5 text-center space-y-3">
          <p className="flex justify-center"><Sprout size={28} color={BRASS} /></p>
          <p className="text-sm font-semibold" style={{ color: INK }}>Hey there!</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            If you log in, our team of AI specialists can help you shop, track your order and answer questions — in your language.
          </p>
          <button
            onClick={() => { setOpen(false); app.setShowLogin(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
            style={{ background: INK }}>
            <LogIn size={15} /> Log in to chat
          </button>
        </div>
      )}

      {/* OPTED OUT */}
      {view === 'optedOut' && (
        <div className="p-5 text-center space-y-3">
          <p className="text-sm font-semibold" style={{ color: INK }}>AI assistance is off</p>
          <p className="text-xs text-slate-600">You chose not to use the AI team. You can switch it back on any time.</p>
          <button
            onClick={async () => { const p = { ...prefs, assistance: 'Yes' as const }; setPrefs(p); await persistPrefs(p); setView('chat'); }}
            className="px-5 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: INK }}>
            Turn AI assistance on
          </button>
        </div>
      )}

      {/* SETUP — the 4 dropdowns (language / staff gender / tone / assistance) */}
      {view === 'setup' && (
        <div className="p-4 space-y-3 overflow-y-auto">
          <p className="text-sm font-bold" style={{ color: INK }}>Set up your AI experience</p>
          <PrefSelect label="Language" value={prefs.language}
            options={['English', 'IsiZulu', 'IsiXhosa', 'Afrikaans', 'Sepedi', 'Setswana']}
            onChange={(v) => setPrefs({ ...prefs, language: v as AIPrefs['language'] })} />
          <PrefSelect label="Preferred staff" value={prefs.staffGender}
            options={['Any', 'Male', 'Female']}
            onChange={(v) => setPrefs({ ...prefs, staffGender: v as AIPrefs['staffGender'] })} />
          <PrefSelect label="Tone" value={prefs.tone}
            options={['Friendly', 'Formal']}
            onChange={(v) => setPrefs({ ...prefs, tone: v as AIPrefs['tone'] })} />
          <PrefSelect label="Need AI assistance?" value={prefs.assistance}
            options={['Yes', 'No']}
            onChange={(v) => setPrefs({ ...prefs, assistance: v as AIPrefs['assistance'] })} />
          <button
            onClick={async () => {
              await persistPrefs(prefs);
              if (prefs.assistance === 'No') { setView('optedOut'); return; }
              if (!app.user) { setView('guest'); return; }
              greetedRef.current = false; setMessages([]); setView('chat');
            }}
            className="w-full py-2.5 rounded-full text-sm font-bold text-white" style={{ background: INK }}>
            {prefs.assistance === 'No' ? 'Save' : 'Start chatting'}
          </button>
        </div>
      )}

      {/* CHAT */}
      {view === 'chat' && agent && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-[220px]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line"
                  style={
                    m.sender === 'user'
                      ? { background: INK, color: 'white', borderBottomRightRadius: 4 }
                      : m.sender === 'system'
                        ? { background: '#FBEAEA', color: '#8B2323', border: '1px solid #E8B4B4', borderBottomLeftRadius: 4 }
                        : { background: 'white', color: INK, border: '1px solid #E4DFD2', borderBottomLeftRadius: 4 }
                  }>
                  {m.sender === 'system' && <ShieldAlert size={13} className="inline mr-1.5 -mt-0.5" />}
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white border border-[#E4DFD2] flex gap-1.5" style={{ borderBottomLeftRadius: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {escalated ? (
            <div className="px-4 py-3 text-[12px] text-center font-semibold" style={{ background: '#FBEAEA', color: '#8B2323' }}>
              This conversation has been escalated to our CEO. Please check your email — a human will follow up with you.
            </div>
          ) : (
            <div className="p-2.5 flex items-center gap-2 border-t border-[#E4DFD2] bg-white/60">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Message ${agent.name.split(' ')[0]}…`}
                maxLength={1000}
                className="flex-1 px-3.5 py-2.5 rounded-full text-[13px] bg-white border border-[#E4DFD2] outline-none focus:border-[#C8A96A]"
              />
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  aria-label={listening ? 'Stop voice input' : 'Voice input'}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={listening
                    ? { background: BRASS, color: 'white' }
                    : { background: 'white', border: '1px solid #E4DFD2', color: INK }}
                >
                  {listening && (
                    <span className="absolute inset-0 rounded-full animate-ping" style={{ background: BRASS, opacity: 0.4 }} />
                  )}
                  <Mic size={16} className="relative" />
                </button>
              )}
              <button onClick={handleSend} disabled={!input.trim() || typing} aria-label="Send"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40"
                style={{ background: INK }}>
                <Send size={16} />
              </button>
            </div>
          )}
          <p className="text-[10px] text-center text-slate-400 pb-1.5 bg-white/60">
            AI team by DeepSeek · Abusive or malicious messages are reported to the CEO
          </p>
        </>
      )}
    </div>
  );
}

function PrefSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-xl text-[13px] bg-white border border-[#E4DFD2] outline-none focus:border-[#C8A96A]">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
