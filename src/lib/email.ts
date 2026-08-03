import type { Order } from '@/types';
import { formatPrice } from './utils';

// ------------------------------------------------------------------
// Brevo (formerly Sendinblue) transactional email.
// Set these in your .env file (see .env.example):
//   VITE_BREVO_API_KEY     — Brevo API key (Brevo → SMTP & API → API Keys)
//   VITE_BREVO_SENDER_EMAIL— verified sender address, e.g. store@gmail.com
//   VITE_BREVO_SENDER_NAME — optional sender display name
// NOTE: calling Brevo directly from the browser exposes the API key to
// anyone who opens DevTools (same trade-off the old EmailJS public key
// had). For a small store this is acceptable; for higher volume move
// this call into a Supabase Edge Function.
// ------------------------------------------------------------------
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || '';
const SENDER_EMAIL = import.meta.env.VITE_BREVO_SENDER_EMAIL || '';
const SENDER_NAME = import.meta.env.VITE_BREVO_SENDER_NAME || 'Young Agripreneurs Store';

export function isEmailConfigured(): boolean {
  return !!(BREVO_API_KEY && SENDER_EMAIL);
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Brevo is not configured — skipping order confirmation email.');
    return;
  }
  if (!order.email) return;

  const trackingUrl = `${window.location.origin}/tracker?order=${order.order_id}`;
  const itemsRows = order.items
    .map(i => `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;">${i.qty} × ${i.title}${i.selectedSize ? ` (Size: ${i.selectedSize})` : ''}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(i.price * i.qty)}</td>
      </tr>`)
    .join('');

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0B1D1F;">
      <h2 style="color:#0B1D1F;">Thank you for your order, ${order.customer_name}!</h2>
      <p>Your order <strong>${order.order_id}</strong> has been received.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${itemsRows}</table>
      <p style="margin-top:12px;">
        Subtotal: ${formatPrice(order.subtotal)}<br/>
        Delivery: ${order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : 'FREE'}<br/>
        <strong>Total: ${formatPrice(order.total)}</strong>
      </p>
      <p>Payment method: ${order.payment_method}</p>
      <p>
        <a href="${trackingUrl}" style="display:inline-block;background:#C8A96A;color:#0B1D1F;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:6px;">
          Track your order
        </a>
      </p>
      <p style="color:#777;font-size:12px;">Young Agripreneurs Store — Cultivating style, naturally.</p>
    </div>`;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: order.email, name: order.customer_name }],
        subject: `Order Confirmation — ${order.order_id}`,
        htmlContent,
      }),
    });
    if (!res.ok) {
      console.error('Brevo responded with', res.status, await res.text());
    }
  } catch (err) {
    console.error('Failed to send order confirmation email via Brevo:', err);
  }
}
