// AI Concierge engine — session state, greeting composer, idle engine.
// The Director (deterministic routing) lives in agents.ts; DeepSeek only SPEAKS via the edge function.
import { getSupabase } from '@/lib/supabaseClient';
import { direct, STYLISTS } from '@/lib/ai/agents';
import type { AIPrefs, AIAgent } from '@/lib/ai/agents';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  at: number;
}

export interface ConciergeState {
  conversationId: string | null;
  agent: AIAgent | null;
  messages: ChatMessage[];
  busy: boolean;
  escalated: boolean;
  standby: boolean;
}

let messageCounter = 0;
const msgId = () => `m_${Date.now()}_${messageCounter++}`;

/** Greeting composer — language × tone × staff gender. Pre-written, zero tokens. */
export function composeGreeting(prefs: AIPrefs, agent: AIAgent, customerName?: string | null): string {
  const isFemale = agent.gender === 'Female';
  const formalTitle = isFemale ? 'Madam' : 'Sir';
  const nameBit = customerName ? `, ${customerName.split(' ')[0]}` : '';
  const intro = `I'm ${agent.name}, your ${agent.role.toLowerCase()}`;

  if (prefs.tone === 'Formal') {
    switch (prefs.language) {
      case 'Sepedi':
        return `Dumela mohlompegi${nameBit}. ${intro}. Which product interests you today?`;
      case 'IsiZulu':
        return `Sawubona${nameBit}. ${intro}. Ungangitshela ukuthi ufunani namuhla — ngizokusiza.`;
      case 'IsiXhosa':
        return `Molo${nameBit}. ${intro}. Ndicinga ukuba ufuna ntoni namhlanje? Ndivula ukukunceda.`;
      case 'Afrikaans':
        return `Goeie dag${nameBit}. ${intro}. Vertel my waarna u soek, dan help ek u graag.`;
      case 'Setswana':
        return `Dumela${nameBit}. ${intro}. Ke eng seo o se batlang gompieno? Ke tla go thusa.`;
      default:
        return `Hello ${formalTitle}${nameBit}, ${intro}. How can I be of assistance to you today?`;
    }
  }
  // Friendly
  switch (prefs.language) {
    case 'Sepedi':
      return `Heita${nameBit}! ${intro}. O ka rata go reka kobo efe? (Which item catches your eye?)`;
    case 'IsiZulu':
      return `Yebo${nameBit}! ${intro}. Khuluma nami — sizothola okulungile kuwe!`;
    case 'IsiXhosa':
      return `Eita${nameBit}! ${intro}. Masithethe — yintoni ofunayo namhlanje?`;
    case 'Afrikaans':
      return `Haai${nameBit}! ${intro}. Kom ons kyk — wat vang jou oog vandag?`;
    case 'Setswana':
      return `Dumela${nameBit}! ${intro}. A re bueng — ke eng se o se ratang?`;
    default:
      return `Hey${nameBit}! ${intro} 🌿 What are we looking for today — groceries, gear, or gifts?`;
  }
}

/** Cart-progress encouragement — pre-written lines, throttled, zero tokens. */
const ENCOURAGEMENTS = [
  'Great choice! That one is fire 🔥 — it sells out fast on campus.',
  'Solid pick! Customers love that one — want me to suggest something that pairs with it?',
  'Nice taste! 🌿 Pop it in your cart before stock runs low.',
  'Ooh, good eye! That is one of our best-sellers this week.',
];

export function composeEncouragement(productName?: string): string {
  const line = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
  return productName ? line.replace('That one', productName) : line;
}

/** Idle engine: 3-min nudge, 10-min standby, 4-min logistics rule. All client-side, zero tokens. */
export interface IdleTimers {
  cancel: () => void;
}

export function startIdleEngine(opts: {
  agent: AIAgent;
  onNudge: (msg: ChatMessage) => void;
  onStandby: () => void;
}): IdleTimers {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const { agent, onNudge, onStandby } = opts;

  if (agent.id === 'logistics_manager') {
    // Dr. Swift's 4-minute rule
    timers.push(setTimeout(() => {
      onNudge({
        id: msgId(), sender: 'agent', at: Date.now(),
        content: "I have to rush somewhere, but your order is safe! 🚚 Let me know if you need anything else — I'm one tap away.",
      });
      onStandby();
    }, 4 * 60 * 1000));
  } else {
    timers.push(setTimeout(() => {
      onNudge({
        id: msgId(), sender: 'agent', at: Date.now(),
        content: 'Take your time! 😊 I can help you make your shopping decisions whenever you are ready — just type below.',
      });
    }, 3 * 60 * 1000));
    timers.push(setTimeout(() => {
      onNudge({
        id: msgId(), sender: 'agent', at: Date.now(),
        content: 'Hey, do you still need help? I will step away for now, but I will be right back when you message me. 🌱',
      });
      onStandby();
    }, 10 * 60 * 1000));
  }
  return { cancel: () => timers.forEach(clearTimeout) };
}

/** Send a customer message to the ai-chat edge function. */
export async function sendToAI(opts: {
  message: string;
  agent: AIAgent;
  prefs: AIPrefs;
  page: string;
  cart: { count: number; total: number; items: string[] };
  conversationId: string | null;
}): Promise<{ reply: string; agentId: string; conversationId: string; escalated?: boolean; busy?: boolean }> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      reply: "Hey! Our AI team is almost ready — the store isn't connected to the server yet, so I can't chat right now. Please try again soon! 🌱",
      agentId: opts.agent.id,
      conversationId: opts.conversationId ?? '',
      busy: true,
    };
  }
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: {
      message: opts.message,
      agent_id: opts.agent.id,
      conversation_id: opts.conversationId,
      context: {
        page: opts.page,
        cart: opts.cart,
        prefs: { language: opts.prefs.language, tone: opts.prefs.tone },
      },
    },
  });
  if (error) {
    // Graceful client-side busy fallback
    return {
      reply: "Hey! All our style curators are currently styling other clients. We'll be with you in a short — grab a drink! ☕",
      agentId: opts.agent.id,
      conversationId: opts.conversationId ?? '',
      busy: true,
    };
  }
  return {
    reply: data?.reply ?? '…',
    agentId: data?.agent?.id ?? opts.agent.id,
    conversationId: data?.conversation_id ?? opts.conversationId ?? '',
    escalated: data?.escalated,
    busy: data?.busy,
  };
}

/** Pick a deterministic stylist for this session (used when no previous agent). */
export function pickAgentForSession(opts: {
  page: string;
  staffGender: AIPrefs['staffGender'];
  previousAgentId?: string | null;
}): AIAgent {
  return direct({ page: opts.page, staffGender: opts.staffGender, previousAgentId: opts.previousAgentId });
}

export { STYLISTS };
