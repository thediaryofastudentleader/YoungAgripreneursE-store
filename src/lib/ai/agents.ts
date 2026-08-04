// ============================================================
// AI STAFF ROSTER + THE DIRECTOR
// Seeded from the CEO's agents.json, extended to the full floor:
// 6 managers (06:00–18:00 SAST) + 20 Gen Z sales stylists (24/7 shifts).
// The Director is deterministic code — instant, free, reliable.
// DeepSeek only speaks; the Director decides WHO speaks.
// ============================================================

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  gender: 'Male' | 'Female' | 'N/A';
  avatar: string;
  /** 'manager' works 06:00–18:00 SAST; 'stylist' works 24/7 shifts; 'system' never chats. */
  kind: 'manager' | 'stylist' | 'system' | 'ceo';
  tagline: string;
}

const dicebear = (seed: string, style: 'avataaars' | 'identicon') =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;

export const MANAGERS: AIAgent[] = [
  {
    id: 'hr_manager', name: 'Prof. Tom', role: 'HR Manager', gender: 'Male',
    avatar: dicebear('ProfTom', 'identicon'), kind: 'manager',
    tagline: 'Doctorate in Human Resources · keeps the floor happy',
  },
  {
    id: 'cso', name: 'Agent Shield', role: 'Chief Security Officer', gender: 'Male',
    avatar: dicebear('AgentShield', 'identicon'), kind: 'system',
    tagline: 'Doctorate in Cybersecurity · never sleeps, never chats',
  },
  {
    id: 'tech_manager', name: 'Dr. Tech', role: 'Technical Manager', gender: 'Male',
    avatar: dicebear('DrTech', 'identicon'), kind: 'manager',
    tagline: 'Doctorate in Computer Science · payments & bugs',
  },
  {
    id: 'ops_manager', name: 'Dr. Ops', role: 'Operations Manager', gender: 'Female',
    avatar: dicebear('DrOps', 'identicon'), kind: 'manager',
    tagline: 'Doctorate in Supply Chain · stock & inventory',
  },
  {
    id: 'logistics_manager', name: 'Dr. Swift', role: 'Inventory & Logistics Manager', gender: 'Female',
    avatar: dicebear('DrSwift', 'identicon'), kind: 'manager',
    tagline: 'Doctorate in Logistics · your order, her mission 🚚',
  },
  {
    id: 'marketing_manager', name: 'Dr. Vogue', role: 'Marketing & Sales Manager', gender: 'Female',
    avatar: dicebear('DrVogue', 'identicon'), kind: 'manager',
    tagline: 'PhD in Marketing (France) · leads the styling floor',
  },
];

const STYLIST_NAMES: Array<[string, 'Male' | 'Female']> = [
  ['Chloe', 'Female'], ['Liam', 'Male'], ['Zanele', 'Female'], ['Sipho', 'Male'], ['Mia', 'Female'],
  ['Kagiso', 'Male'], ['Lerato', 'Female'], ['Thabo', 'Male'], ['Ayesha', 'Female'], ['Daniel', 'Male'],
  ['Naledi', 'Female'], ['Pieter', 'Male'], ['Amahle', 'Female'], ['Bongani', 'Male'], ['Emma', 'Female'],
  ['Tshepo', 'Male'], ['Kayla', 'Female'], ['Lwazi', 'Male'], ['Sarah', 'Female'], ['Katlego', 'Male'],
];

export const STYLISTS: AIAgent[] = STYLIST_NAMES.map(([name, gender], i) => ({
  id: `sales_${String(i + 1).padStart(2, '0')}`,
  name,
  role: 'Sales Stylist',
  gender,
  avatar: dicebear(name, 'avataaars'),
  kind: 'stylist',
  tagline: 'Gen Z stylist · PhD-level product sense',
}));

export const ALL_AGENTS: AIAgent[] = [...MANAGERS, ...STYLISTS];

export function getAgent(id: string): AIAgent | undefined {
  return ALL_AGENTS.find(a => a.id === id);
}

// ---------- Working hours (SAST = UTC+2, no DST) ----------
function sastHour(): number {
  return (new Date().getUTCHours() + 2) % 24;
}
export function managersOnDuty(): boolean {
  const h = sastHour();
  return h >= 6 && h < 18;
}

// ---------- THE DIRECTOR ----------
export interface DirectorContext {
  page: string;                       // '/', '/tracker', '/bank-confirm', ...
  staffGender?: 'Any' | 'Male' | 'Female';
  previousAgentId?: string | null;    // keep the same agent within a session
}

/**
 * Deterministic routing:
 *  /tracker      → Dr. Swift (Logistics)
 *  /bank-confirm → Dr. Tech (payment help)
 *  everything else → a Sales Stylist (gender preference → shift rotation)
 */
export function direct(ctx: DirectorContext): AIAgent {
  // Session continuity: keep the same agent within a session.
  if (ctx.previousAgentId) {
    const prev = getAgent(ctx.previousAgentId);
    if (prev && prev.kind !== 'system' && prev.kind !== 'ceo') return prev;
  }

  // Managers work 06:00–18:00 SAST; outside those hours the 24/7
  // stylist floor covers for them (the stylist says so in chat).
  if (managersOnDuty()) {
    if (ctx.page.startsWith('/tracker')) return MANAGERS.find(a => a.id === 'logistics_manager')!;
    if (ctx.page.startsWith('/bank-confirm')) return MANAGERS.find(a => a.id === 'tech_manager')!;
  }

  // Sales floor: filter by gender preference, then rotate by 8-hour shift.
  let floor = STYLISTS;
  if (ctx.staffGender === 'Male') floor = STYLISTS.filter(a => a.gender === 'Male');
  if (ctx.staffGender === 'Female') floor = STYLISTS.filter(a => a.gender === 'Female');
  if (!floor.length) floor = STYLISTS;

  // Shift rotation: the stylist "on shift" changes every 8 hours,
  // day-of-year seeded so it feels like a real roster.
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000);
  const shift = Math.floor(sastHour() / 8); // 0, 1, 2
  const idx = (dayOfYear * 3 + shift) % floor.length;
  return floor[idx];
}

// ---------- Preferences ----------
export interface AIPrefs {
  language: 'English' | 'IsiZulu' | 'IsiXhosa' | 'Afrikaans' | 'Sepedi' | 'Setswana';
  staffGender: 'Any' | 'Male' | 'Female';
  tone: 'Friendly' | 'Formal';
  assistance: 'Yes' | 'No';
}

export const DEFAULT_PREFS: AIPrefs = { language: 'English', staffGender: 'Any', tone: 'Friendly', assistance: 'Yes' };

export function loadPrefs(): AIPrefs {
  try {
    const raw = localStorage.getItem('yaf_ai_prefs');
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_PREFS;
}

export function savePrefs(p: AIPrefs) {
  try { localStorage.setItem('yaf_ai_prefs', JSON.stringify(p)); } catch { /* ignore */ }
}
