import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useApp } from '@/App';
import { fetchMessages, sendMessage, subscribeToMessages } from '@/lib/chat';
import type { ChatMessage } from '@/types';

export default function ChatWidget({ orderId, popTrigger }: { orderId: string; popTrigger?: string }) {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-pop once per order per trigger (e.g. once when the order is
  // received, again once when the driver is nearby).
  useEffect(() => {
    if (!popTrigger) return;
    const key = `yaf_chat_popped_${orderId}_${popTrigger}`;
    if (!localStorage.getItem(key)) {
      setOpen(true);
      localStorage.setItem(key, 'true');
    }
  }, [orderId, popTrigger]);

  useEffect(() => {
    fetchMessages(orderId).then(setMessages);
    const unsub = subscribeToMessages(orderId, msg => setMessages(prev => [...prev, msg]));
    return unsub;
  }, [orderId]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text;
    setText('');
    await sendMessage(orderId, 'customer', app.user?.username || 'Customer', content, app.user?.id);
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Order chat"
        className="fixed bottom-24 right-4 z-[250] w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className={`fixed bottom-40 right-4 left-4 sm:left-auto z-[250] sm:w-[380px] h-[420px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="p-4 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <div>
              <p className="font-bold text-sm">Order Support</p>
              <p className="text-xs opacity-80">#{orderId}</p>
            </div>
            <button onClick={() => setOpen(false)}><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className={`text-center text-sm mt-8 px-4 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                Have a question about your order (or don't use WhatsApp)? Send us a message here and we'll reply as soon as we can.
              </p>
            ) : messages.map(m => (
              <div key={m.id} className={`flex ${m.sender_role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  m.sender_role === 'customer'
                    ? 'bg-emerald-500 text-white rounded-br-sm'
                    : app.dark ? 'bg-slate-700 text-white rounded-bl-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                }`}>
                  {m.sender_role !== 'customer' && <p className="text-[10px] font-bold opacity-70 mb-0.5">{m.sender_name}</p>}
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type a message..."
              className={`flex-1 px-3 py-2 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`}
            />
            <button type="submit" className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
