import type { Order } from '@/types';
import { getSupabase } from './supabaseClient';

// ------------------------------------------------------------------
// Transactional email — now 100% server-side.
// All sending goes through the `send-email` Supabase Edge Function,
// which holds the Brevo API key in Supabase secrets. NO Brevo key in
// the client bundle (the old VITE_BREVO_* vars are retired).
// The exported function signatures are unchanged, so App.tsx and
// AdminPage.tsx call these exactly as before.
// ------------------------------------------------------------------

type EmailKind = 'confirmation' | 'review_request' | 'approved';

async function send(kind: EmailKind, order: Order, extra?: { netTotal?: number; notes?: string }): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Store offline — skipping email:', kind);
    return;
  }
  const { error } = await supabase.functions.invoke('send-email', {
    body: {
      kind,
      order,
      netTotal: extra?.netTotal,
      notes: extra?.notes,
      origin: window.location.origin,
    },
  });
  if (error) console.error(`send-email (${kind}) failed:`, error);
}

/** Order placed → confirmation to the CUSTOMER (register call pending). */
export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  if (!order.email) return;
  await send('confirmation', order);
}

/** Order placed → formal review request to the CEO ONLY (spam-safe layout). */
export async function sendOrderReviewRequestEmail(order: Order): Promise<void> {
  await send('review_request', order);
}

/** Register call complete → approval to the CUSTOMER with the net total. */
export async function sendOrderApprovedEmail(order: Order, netTotal: number, notes?: string): Promise<void> {
  if (!order.email) return;
  await send('approved', order, { netTotal, notes });
}
