// Dual-theme engine — "Campus" (default: white / green / black, golden-ratio
// layout) vs "Luxury" (ink / porcelain / brass — wealth & celebration).
// Luxury switches ON automatically every Friday (SAST) for Mr George's Walk
// Friday, and during graduation season when the CEO rings the graduation
// bell (site_settings.graduation_mode = 'true').
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';

export type ThemeName = 'campus' | 'luxury';

const SAST_OFFSET_MS = 2 * 60 * 60 * 1000; // UTC+2, no daylight saving

function nowSAST(): Date {
  return new Date(Date.now() + SAST_OFFSET_MS);
}

/** Friday in Grahamstown time — Mr George's Walk Friday. */
export function isFridaySAST(d: Date = nowSAST()): boolean {
  return d.getUTCDay() === 5; // nowSAST is shifted, so read UTC fields
}

export interface Celebration {
  active: boolean;         // graduation decorations on
  year: string;            // "Class of {year}"
}

let graduationCache: Celebration = { active: false, year: String(new Date().getFullYear()) };
let settingsFetched = false;

/** Fetch graduation bell state (cached per page load, realtime-refreshed). */
export async function loadCelebration(): Promise<Celebration> {
  const supabase = getSupabase();
  if (!supabase) return graduationCache;
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['graduation_mode', 'graduation_year']);
  if (data) {
    const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
    graduationCache = {
      active: map.graduation_mode === 'true',
      year: map.graduation_year || String(new Date().getFullYear()),
    };
  }
  settingsFetched = true;
  return graduationCache;
}

/** The theme that should be active right now. */
export function resolveTheme(celebration: Celebration = graduationCache): ThemeName {
  if (celebration.active) return 'luxury';           // graduation bell rings: luxury non-stop
  if (isFridaySAST()) return 'luxury';               // Mr George's Walk Friday
  return 'campus';
}

/** Apply theme to <html data-theme="..."> and return it. */
export function applyTheme(theme: ThemeName): ThemeName {
  document.documentElement.dataset.theme = theme;
  return theme;
}

/** React hook: resolves + applies the theme, keeps it fresh (checks hourly,
 *  realtime when site_settings changes). Returns { theme, celebration }. */
export function useTheme(): { theme: ThemeName; celebration: Celebration } {
  const [celebration, setCelebration] = useState<Celebration>(graduationCache);
  const [theme, setTheme] = useState<ThemeName>(() => applyTheme(resolveTheme()));

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const c = await loadCelebration();
      if (cancelled) return;
      setCelebration(c);
      setTheme(applyTheme(resolveTheme(c)));
    };
    if (!settingsFetched) refresh(); else setTheme(applyTheme(resolveTheme()));

    // Re-check on the hour (Friday rollover at midnight SAST)
    const interval = setInterval(() => setTheme(applyTheme(resolveTheme())), 60 * 60 * 1000);

    // Realtime: graduation bell rings → theme flips live
    const supabase = getSupabase();
    const channel = supabase
      ? supabase
          .channel('site-settings-theme')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, refresh)
          .subscribe()
      : null;

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  return { theme, celebration };
}
