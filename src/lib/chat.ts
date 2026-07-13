import { supabase } from './supabaseClient';
import type { ChatMessage } from '@/types';

export async function ensureConversation(orderId: string) {
  if (!supabase) return null;
  const { data: existing } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();
  if (existing) return existing;
  const { data } = await supabase
    .from('chat_conversations')
    .insert({ order_id: orderId })
    .select()
    .single();
  return data;
}

export async function fetchMessages(orderId: string): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as ChatMessage[];
}

export async function sendMessage(
  orderId: string,
  senderRole: 'customer' | 'admin',
  senderName: string,
  content: string,
  senderId?: string
): Promise<ChatMessage | null> {
  if (!supabase || !content.trim()) return null;
  await ensureConversation(orderId);
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      order_id: orderId,
      sender_id: senderId || null,
      sender_role: senderRole,
      sender_name: senderName,
      content: content.trim(),
    })
    .select()
    .single();
  if (error) return null;
  return data as ChatMessage;
}

// Returns an unsubscribe function.
export function subscribeToMessages(orderId: string, onMessage: (msg: ChatMessage) => void): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`chat-${orderId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `order_id=eq.${orderId}` },
      payload => onMessage(payload.new as ChatMessage)
    )
    .subscribe();
  return () => {
    // FIX: supabase could be null here if module was tree-shaken oddly
    if (supabase) {
      supabase.removeChannel(channel);
    }
  };
}

export async function markChatRead(orderId: string) {
  if (!supabase) return;
  await supabase.rpc('mark_order_chat_as_read', { p_order_id: orderId });
}
