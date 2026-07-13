import emailjs from '@emailjs/browser';
import type { Order } from '@/types';
import { formatPrice } from './utils';

// Set these in your .env file — see .env.example. Create a free
// EmailJS account, connect Gmail as the "service", and create a
// template using the variables sent below (template shown in
// CHANGES-README.md).
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export function isEmailConfigured(): boolean {
  return !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('EmailJS is not configured — skipping order confirmation email.');
    return;
  }
  if (!order.email) return;

  const trackingUrl = `${window.location.origin}/tracker?order=${order.order_id}`;
  const itemsSummary = order.items
    .map(i => `${i.qty} x ${i.title} — ${formatPrice(i.price * i.qty)}`)
    .join('\n');

  const params = {
    to_email: order.email,
    to_name: order.customer_name,
    order_id: order.order_id,
    order_items: itemsSummary,
    order_subtotal: formatPrice(order.subtotal),
    order_delivery_fee: order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : 'FREE',
    order_total: formatPrice(order.total),
    payment_method: order.payment_method,
    tracking_url: trackingUrl,
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, { publicKey: PUBLIC_KEY });
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
  }
}
