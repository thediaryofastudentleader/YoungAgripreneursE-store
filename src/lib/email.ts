import type { Order } from '@/types';
import { formatPrice } from './utils';
import { CEO_EMAIL } from './site';

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

async function brevoSend(to: { email: string; name?: string }[], subject: string, htmlContent: string): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Brevo is not configured — skipping email:', subject);
    return;
  }
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
        to,
        subject,
        htmlContent,
      }),
    });
    if (!res.ok) {
      console.error('Brevo responded with', res.status, await res.text());
    }
  } catch (err) {
    console.error('Failed to send email via Brevo:', err);
  }
}

function itemsTable(items: Order['items']): string {
  return items
    .map(i => `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;">${i.qty} × ${i.title}${i.selectedSize ? ` (Size: ${i.selectedSize})` : ''}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(i.price * i.qty)}</td>
      </tr>`)
    .join('');
}

/** Order placed → confirmation to the CUSTOMER (register call pending). */
export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  if (!order.email) return;

  const trackingUrl = `${window.location.origin}/tracker?order=${order.order_id}`;
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0B1D1F;">
      <h2 style="color:#0B1D1F;">Thank you for your order, ${order.customer_name}!</h2>
      <p>Your order <strong>${order.order_id}</strong> has been received and is now with our CEO for a quick
      <em>register call</em> — we phone the supplier to personally confirm every item and size before you pay.
      You will receive another email as soon as it is approved.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${itemsTable(order.items)}</table>
      <p style="margin-top:12px;">
        Subtotal: ${formatPrice(order.subtotal)}<br/>
        Delivery: ${order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : 'FREE'}<br/>
        <strong>Estimated total: ${formatPrice(order.total)}</strong> (final total confirmed after review)
      </p>
      <p>Payment method: ${order.payment_method}</p>
      <p>
        <a href="${trackingUrl}" style="display:inline-block;background:#C8A96A;color:#0B1D1F;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:6px;">
          Track your order
        </a>
      </p>
      <p style="color:#64748b;font-size:12px;margin-top:24px;">
        Young Agripreneurs Store · Campus delivery in Grahamstown/Makhanda
      </p>
    </div>`;

  await brevoSend(
    [{ email: order.email, name: order.customer_name }],
    `Order Confirmation — ${order.order_id}`,
    htmlContent
  );
}

/**
 * Order placed → formal review request to the CEO ONLY.
 * Structured like a plain business email (proper greeting, signature,
 * no shouty subject, single link) so spam filters leave it alone.
 */
export async function sendOrderReviewRequestEmail(order: Order): Promise<void> {
  const adminUrl = `${window.location.origin}/admin`;
  const rows = order.items
    .map(i => `<tr>
        <td style="padding:8px 12px;border:1px solid #ddd;">${i.qty} × ${i.title}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;">${i.selectedSize || '—'}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:right;">${formatPrice(i.price * i.qty)}</td>
      </tr>`)
    .join('');

  const htmlContent = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
      <p>Dear CEO,</p>
      <p>A new order has been placed on Young Agripreneurs Store and is awaiting your register call
      (supplier stock confirmation). Please review it at your earliest convenience — the customer has
      been told to expect an email and a WhatsApp message once approved.</p>
      <p>
        <strong>Order:</strong> ${order.order_id}<br/>
        <strong>Customer:</strong> ${order.customer_name}<br/>
        <strong>Phone:</strong> ${order.phone}<br/>
        <strong>Delivery:</strong> ${order.address} (${order.location === 'upper' ? 'Upper' : 'Lower'} Campus)<br/>
        <strong>Payment method:</strong> ${order.payment_method}
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;font-family:Arial,sans-serif;">
        <tr style="background:#f5f2ea;">
          <th style="padding:8px 12px;border:1px solid #ddd;text-align:left;">Item</th>
          <th style="padding:8px 12px;border:1px solid #ddd;text-align:left;">Size</th>
          <th style="padding:8px 12px;border:1px solid #ddd;text-align:right;">Amount</th>
        </tr>
        ${rows}
      </table>
      <p style="font-family:Arial,sans-serif;">
        Subtotal: ${formatPrice(order.subtotal)} · Delivery: ${order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : 'FREE'} ·
        <strong>Total: ${formatPrice(order.total)}</strong>
      </p>
      <p>Review and approve it here: <a href="${adminUrl}">${adminUrl}</a></p>
      <p>Kind regards,<br/>Young Agripreneurs Store<br/><span style="color:#666;font-size:12px;">Automated order notification</span></p>
    </div>`;

  await brevoSend(
    [{ email: CEO_EMAIL, name: 'CEO' }],
    `New order for review — ${order.order_id} (${order.customer_name})`,
    htmlContent
  );
}

/** Register call complete → approval to the CUSTOMER with the net total. */
export async function sendOrderApprovedEmail(order: Order, netTotal: number, notes?: string): Promise<void> {
  if (!order.email) return;
  const trackingUrl = `${window.location.origin}/tracker?order=${order.order_id}`;
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0B1D1F;">
      <h2 style="color:#0B1D1F;">Good news, ${order.customer_name} — your order is approved! ✅</h2>
      <p>Our CEO has completed the register call for order <strong>${order.order_id}</strong>.
      Every confirmed item is reserved with the supplier.</p>
      ${notes ? `<p style="background:#f5f2ea;padding:12px;border-radius:8px;">${notes}</p>` : ''}
      <p><strong>Amount to pay: ${formatPrice(netTotal)}</strong> (${order.payment_method})</p>
      <p>You will also receive a WhatsApp message from us shortly.</p>
      <p>
        <a href="${trackingUrl}" style="display:inline-block;background:#0B1D1F;color:#F2EFE6;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:6px;">
          View your order
        </a>
      </p>
      <p style="color:#64748b;font-size:12px;margin-top:24px;">
        Young Agripreneurs Store · Campus delivery in Grahamstown/Makhanda
      </p>
    </div>`;

  await brevoSend(
    [{ email: order.email, name: order.customer_name }],
    `Your order is approved — ${order.order_id}`,
    htmlContent
  );
}
