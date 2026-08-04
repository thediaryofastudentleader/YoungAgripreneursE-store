import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllSpecials, setSpecial, removeSpecial } from '@/lib/specials';
import { products, getProductSizes } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { sendOrderApprovedEmail } from '@/lib/email';
import type { ProductSpecial, Order, ChatMessage, VogueDraft } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Shield, ShieldCheck, LogOut, Package, TrendingUp, MessageSquare,
  CheckCircle, XCircle, Search, ChevronLeft,
  Percent, Trash2, AlertTriangle, RefreshCw, Truck,
  ShieldAlert, Ban, Undo2, Sparkles, Settings, Check, X, Phone, GraduationCap
} from 'lucide-react';

// An AI alert raised by the CSO / CEO-escalation pipeline (schema_ai.sql).
interface AIAlert {
  id: string;
  created_at: string;
  user_id: string | null;
  conversation_id: string | null;
  kind: 'misbehavior' | 'security' | 'support';
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'dismissed';
  customer_name?: string | null;
  customer_email?: string | null;
  suspended?: boolean;
}

// A deliverer is either the admin (delivers himself) or a driver account.
interface Deliverer {
  id: string;
  label: string;
}

// A CSO security event row (schema_ai.sql security_events table).
interface SecurityEvent {
  id: string;
  created_at: string;
  user_id: string | null;
  kind: string;
  detail: string | null;
  action: string;
}

// Per-item register-call draft while the CEO is phoning the supplier.
interface RegisterItemDraft {
  status: 'confirmed' | 'size_mismatch' | 'unavailable' | null;
  offered: string[];
  freeText: string;
}

// Admin password is validated server-side via Supabase Edge Function
// or via a secure RPC call. For this implementation, we use a simple
// client-side gate with a server-verified password.
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD || '';

export default function AdminPage() {
  const app = useApp();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'specials' | 'chat' | 'alerts' | 'vogue' | 'security' | 'settings'>('orders');
  const [aiAlerts, setAiAlerts] = useState<AIAlert[]>([]);

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [specials, setSpecials] = useState<ProductSpecial[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
  const [ordersEmpty, setOrdersEmpty] = useState(false);

  // Register call (CEO supplier-stock confirmation) drafts, keyed by order_id
  const [registerDrafts, setRegisterDrafts] = useState<Record<string, RegisterItemDraft[]>>({});
  const [reviewSubmitting, setReviewSubmitting] = useState<Record<string, boolean>>({});
  const [reviewMessages, setReviewMessages] = useState<Record<string, string>>({});

  // Dr. Vogue weekly special drafts
  const [vogueDrafts, setVogueDrafts] = useState<VogueDraft[]>([]);
  const [vogueLoading, setVogueLoading] = useState(false);
  const [vogueError, setVogueError] = useState('');

  // CSO security analytics (last 30 days)
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);

  // Graduation bell site settings
  const [graduationMode, setGraduationMode] = useState(false);
  const [graduationYear, setGraduationYear] = useState(String(new Date().getFullYear()));
  const [graduationYearInput, setGraduationYearInput] = useState(String(new Date().getFullYear()));

  // Specials form
  const [selectedProductId, setSelectedProductId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const refreshData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      // Fetch all orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (ordersData) {
        setOrders(ordersData as unknown as Order[]);
        setOrdersEmpty(ordersData.length === 0);
      }

      // Fetch specials
      const specialsData = await fetchAllSpecials();
      setSpecials(specialsData);

      // Fetch deliverers (admin himself + driver accounts) via SECURITY DEFINER RPC
      const { data: driversData, error: driversError } = await supabase.rpc('get_deliverers');
      if (!driversError && Array.isArray(driversData)) {
        setDeliverers(driversData as Deliverer[]);
      }

      // Fetch AI alerts (CEO escalation inbox) — open first, with customer context
      const { data: alertsData, error: alertsError } = await supabase
        .from('ai_alerts')
        .select('*')
        .order('status', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(100);
      if (!alertsError && Array.isArray(alertsData)) {
        const userIds = [...new Set(alertsData.map(a => a.user_id).filter(Boolean))] as string[];
        let profileMap: Record<string, { username: string; email: string; suspended_at: string | null }> = {};
        if (userIds.length) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, username, email, suspended_at')
            .in('id', userIds);
          if (profs) {
            profileMap = Object.fromEntries(profs.map(p => [p.id, p]));
          }
        }
        setAiAlerts(alertsData.map(a => ({
          ...(a as AIAlert),
          customer_name: a.user_id ? profileMap[a.user_id]?.username ?? null : null,
          customer_email: a.user_id ? profileMap[a.user_id]?.email ?? null : null,
          suspended: a.user_id ? !!profileMap[a.user_id]?.suspended_at : false,
        })));
      }

      // Dr. Vogue weekly special drafts (latest 20; pending are floated to the top at render time)
      const { data: vogueData, error: vogueErr } = await supabase
        .from('vogue_drafts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!vogueErr && Array.isArray(vogueData)) {
        setVogueDrafts(vogueData as VogueDraft[]);
      }

      // CSO security events (last 30 days, chronological for the per-day chart)
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: secData, error: secErr } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: true });
      if (!secErr && Array.isArray(secData)) {
        setSecurityEvents(secData as SecurityEvent[]);
      }

      // Graduation bell site settings
      const { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['graduation_mode', 'graduation_year']);
      if (!settingsErr && Array.isArray(settingsData)) {
        for (const row of settingsData as { key: string; value: string }[]) {
          if (row.key === 'graduation_mode') {
            setGraduationMode(row.value === 'true');
          } else if (row.key === 'graduation_year') {
            setGraduationYear(row.value);
            // Don't clobber the year input while the CEO is typing in it.
            setGraduationYearInput(prev =>
              prev === String(new Date().getFullYear()) ? row.value : prev
            );
          }
        }
      }
    } catch (e) {
      console.error('Failed to refresh admin data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    // Simple password check — in production, use Supabase Edge Function or RPC
    if (password === ADMIN_PASSWORD_HASH && ADMIN_PASSWORD_HASH.length > 0) {
      setIsAuthenticated(true);
    } else {
      setAuthError('Invalid admin password');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return;
    const order = orders.find(o => o.order_id === orderId);
    if (!order) return;

    const newHistory = [
      ...(order.status_history || []),
      { status: newStatus, time: new Date().toISOString() }
    ];

    await supabase
      .from('orders')
      .update({ status: newStatus, status_history: newHistory })
      .eq('order_id', orderId);

    refreshData();
  };

  // Allocate an order to the admin himself or to a driver (SECURITY DEFINER RPC).
  // Pass null driverId to unassign. Resets driver_accepted so the new assignee must accept.
  const assignDriver = async (orderId: string, driverId: string | null) => {
    if (!supabase) return;
    const { error } = await supabase.rpc('assign_driver', {
      p_order_id: orderId,
      p_driver_id: driverId,
    });
    if (error) {
      app.showToast('Failed to assign driver — are you signed in as admin?', 'error');
    } else {
      app.showToast(driverId ? 'Delivery allocated' : 'Delivery unassigned', 'success');
    }
    refreshData();
  };

  const approvePayment = async (orderId: string) => {
    if (!supabase) return;
    await supabase
      .from('proof_of_payments')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('order_id', orderId);
    refreshData();
  };

  const rejectPayment = async (orderId: string) => {
    if (!supabase) return;
    await supabase
      .from('proof_of_payments')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('order_id', orderId);
    refreshData();
  };

  const addSpecial = async () => {
    if (!selectedProductId || discountPercent < 5 || discountPercent > 50) return;
    try {
      await setSpecial(selectedProductId, discountPercent);
      app.showToast('Special offer added!', 'success');
      setSelectedProductId('');
      setDiscountPercent(10);
      refreshData();
    } catch (e) {
      app.showToast('Failed to add special', 'error');
    }
  };

  const deleteSpecial = async (productId: string) => {
    try {
      await removeSpecial(productId);
      app.showToast('Special removed', 'success');
      refreshData();
    } catch (e) {
      app.showToast('Failed to remove special', 'error');
    }
  };

  const fetchChatForOrder = async (orderId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (data) setChatMessages(data as unknown as ChatMessage[]);
    setSelectedOrder(orders.find(o => o.order_id === orderId) || null);

    // Clear the NEW CHAT badge for this order (B7)
    const { error } = await supabase.rpc('mark_order_chat_as_read', { p_order_id: orderId });
    if (!error) {
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, has_new_chat: false } : o));
    }
  };

  const sendAdminReply = async (orderId: string, content: string) => {
    if (!supabase || !content.trim()) return;
    await supabase.from('chat_messages').insert({
      order_id: orderId,
      sender_role: 'admin',
      sender_name: 'Admin',
      content: content.trim(),
    });
    fetchChatForOrder(orderId);
  };

  // ---------- Register call (CEO supplier-stock confirmation) ----------

  const getRegisterDraft = (order: Order): RegisterItemDraft[] => {
    const existing = registerDrafts[order.order_id];
    if (existing && existing.length === order.items.length) return existing;
    return order.items.map(() => ({ status: null, offered: [], freeText: '' }));
  };

  const updateRegisterItem = (order: Order, index: number, patch: Partial<RegisterItemDraft>) => {
    const draft = getRegisterDraft(order);
    const next = draft.map((d, i) => (i === index ? { ...d, ...patch } : d));
    setRegisterDrafts(prev => ({ ...prev, [order.order_id]: next }));
  };

  // Items NOT marked unavailable still count at full price — size mismatches
  // may be kept by the customer, so the admin cannot know the final total yet.
  const registerNet = (order: Order, draft: RegisterItemDraft[]) => {
    const netSubtotal = order.items.reduce(
      (sum, item, i) => (draft[i]?.status === 'unavailable' ? sum : sum + item.price * item.qty),
      0
    );
    return { netSubtotal, netTotal: netSubtotal + order.delivery_fee };
  };

  const parseOffered = (d: RegisterItemDraft): string[] =>
    d.offered.length ? d.offered : d.freeText.split(',').map(s => s.trim()).filter(Boolean);

  const submitRegisterCall = async (order: Order) => {
    if (!supabase) return;
    const draft = getRegisterDraft(order);
    const { netSubtotal, netTotal } = registerNet(order, draft);
    const p_reviews = order.items.map((item, i) => {
      const d = draft[i];
      return {
        item_index: i,
        title: item.title,
        requested_size: item.selectedSize ?? null,
        status: d.status,
        offered_sizes: d.status === 'size_mismatch' ? parseOffered(d) : null,
      };
    });

    setReviewSubmitting(prev => ({ ...prev, [order.order_id]: true }));
    try {
      const { data, error } = await supabase.rpc('submit_order_review', {
        p_order_id: order.order_id,
        p_reviews,
        p_net_subtotal: netSubtotal,
        p_net_total: netTotal,
      });
      if (error) {
        app.showToast('Register call failed — are you signed in as admin?', 'error');
      } else if (data === 'approved') {
        // Fire-and-forget approval email; the WhatsApp button appears after refresh.
        void sendOrderApprovedEmail(order, netTotal);
        if (app.showToast) {
          app.showToast('Register call complete — order approved!', 'success');
        } else {
          setReviewMessages(prev => ({ ...prev, [order.order_id]: 'Register call complete — order approved!' }));
        }
      } else if (data === 'awaiting_customer') {
        setReviewMessages(prev => ({ ...prev, [order.order_id]: "Waiting for the customer's size choice." }));
      }
    } finally {
      setReviewSubmitting(prev => ({ ...prev, [order.order_id]: false }));
    }
    refreshData();
  };

  // SA phone → wa.me format: strip spaces/plus, a leading 0 becomes 27.
  const whatsAppLink = (order: Order): string => {
    let phone = (order.phone || '').replace(/[\s+]/g, '');
    if (phone.startsWith('0')) phone = '27' + phone.slice(1);
    const net = order.net_total ?? order.total;
    const text = `Hi ${order.customer_name}, your order ${order.order_id} has been approved! Amount to pay: R${net.toFixed(2)}. Thank you for shopping with Young Agripreneurs 🌱`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // ---------- Dr. Vogue (weekly special drafts) ----------

  const askVogue = async () => {
    if (!supabase) return;
    setVogueLoading(true);
    setVogueError('');
    try {
      const { data, error } = await supabase.functions.invoke('vogue-specials', {
        body: {
          catalog: products.map(p => ({ id: p.id, title: p.title, price: p.price, category: p.category })),
        },
      });
      if (error) {
        setVogueError(error.message || 'Dr. Vogue is unavailable right now.');
      } else if (data?.error) {
        setVogueError(String(data.error));
      } else {
        app.showToast("Dr. Vogue has filed this week's picks", 'success');
        refreshData();
      }
    } catch (e) {
      setVogueError('Dr. Vogue is unavailable right now.');
    } finally {
      setVogueLoading(false);
    }
  };

  const approveVogueDraft = async (draft: VogueDraft) => {
    if (!supabase) return;
    try {
      await setSpecial(draft.product_id, draft.discount_percent, 'dr-vogue');
      await supabase.from('vogue_drafts').update({ status: 'approved' }).eq('id', draft.id);
      app.showToast('Special approved and live!', 'success');
    } catch (e) {
      app.showToast('Failed to approve the special', 'error');
    }
    refreshData();
  };

  const dismissVogueDraft = async (draft: VogueDraft) => {
    if (!supabase) return;
    await supabase.from('vogue_drafts').update({ status: 'dismissed' }).eq('id', draft.id);
    refreshData();
  };

  // ---------- Settings (graduation bell) ----------

  const saveSiteSetting = async (key: string, value: string, successMsg: string) => {
    if (!supabase) return;
    const { error } = await supabase.rpc('set_site_setting', { p_key: key, p_value: value });
    if (error) {
      app.showToast('Failed to save setting — are you signed in as admin?', 'error');
    } else {
      app.showToast(successMsg, 'success');
    }
    refreshData();
  };

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`w-full max-w-sm p-8 rounded-3xl border shadow-2xl ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-white" />
            </div>
            <h2 className="font-bold text-xl">Admin Access</h2>
            <p className={`text-sm mt-1 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Enter the admin password to continue
            </p>
          </div>
          <form onSubmit={handleAuth} className="space-y-3">
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm ${
                app.dark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'
              }`}
            />
            {authError && <p className="text-red-500 text-xs font-medium">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold"
            >
              Access Dashboard
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            className={`w-full mt-3 py-2 text-sm font-medium ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <span className="inline-flex items-center gap-1.5"><ChevronLeft size={14} /> Back to Store</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o =>
    o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingPayments = orders.filter(o => o.payment_status === 'proof_uploaded' && !o.paid);

  return (
    <div className={`min-h-screen ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${app.dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'} backdrop-blur-xl border-b`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <h1 className="font-bold text-base">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshData} className={`p-2 rounded-full ${app.dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => { setIsAuthenticated(false); navigate('/'); }} className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`max-w-5xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto`}>
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={Package} label="Orders" badge={orders.length} />
          <TabButton active={activeTab === 'specials'} onClick={() => setActiveTab('specials')} icon={Percent} label="Specials" />
          <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={MessageSquare} label="Chat" badge={orders.filter(o => o.has_new_chat).length} />
          <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={ShieldAlert} label="AI Alerts" badge={aiAlerts.filter(a => a.status === 'open').length} />
          <TabButton active={activeTab === 'vogue'} onClick={() => setActiveTab('vogue')} icon={Sparkles} label="Vogue" badge={vogueDrafts.filter(d => d.status === 'pending').length} />
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={ShieldCheck} label="Security" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="Settings" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Search */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <Search size={18} className={app.dark ? 'text-slate-500' : 'text-slate-400'} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-sm ${app.dark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
              />
            </div>

            {/* C2: RLS hint — dashboard reads require a signed-in Supabase admin account */}
            {ordersEmpty && !loading && (
              <div className={`p-4 rounded-2xl border text-sm ${app.dark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                <p className="font-bold mb-1">No orders visible?</p>
                <p className="text-xs opacity-90">
                  Row-level security only shows all orders to a <b>signed-in admin account</b>. This password gate alone is not enough —
                  also sign in to the store (top-right login) with an account whose profile has <code>is_admin = true</code> in Supabase.
                </p>
              </div>
            )}

            {/* Pending Payments Alert */}
            {pendingPayments.length > 0 && (
              <div className={`p-4 rounded-2xl border ${app.dark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <span className="font-bold text-sm text-amber-500">{pendingPayments.length} payment(s) awaiting approval</span>
                </div>
              </div>
            )}

            {/* Orders List */}
            <div className="space-y-3">
              {filteredOrders.map(order => (
                <div key={order.id} className={`rounded-2xl border p-4 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">#{order.order_id}</span>
                        <StatusBadge status={order.status} />
                        {order.paid ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">PAID</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold">UNPAID</span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {order.customer_name} · {new Date(order.created_at).toLocaleDateString()} · {formatPrice(order.total)}
                      </p>
                    </div>
                    {order.has_new_chat && (
                      <span className="px-2 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold">NEW CHAT</span>
                    )}
                  </div>

                  {/* Items */}
                  <div className={`text-xs mb-3 ${app.dark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {order.items?.map((item: any, i: number) => (
                      <span key={i}>{item.qty}x {item.title}{i < (order.items?.length || 0) - 1 ? ', ' : ''}</span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {/* Status update dropdown */}
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.order_id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <option value="order_received">Order Received</option>
                      <option value="shipped">Shipped</option>
                      <option value="arrived_storage">At Storage</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="driver_nearby">Driver Nearby</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {order.payment_status === 'proof_uploaded' && !order.paid && (
                      <>
                        <button onClick={() => approvePayment(order.order_id)} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button onClick={() => rejectPayment(order.order_id)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold flex items-center gap-1">
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}

                    <button onClick={() => { setActiveTab('chat'); fetchChatForOrder(order.order_id); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${app.dark ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <MessageSquare size={12} className="inline mr-1" /> Chat
                    </button>
                  </div>

                  {/* Driver allocation — once the order arrives in Grahamstown the admin
                      allocates it to himself or to a driver (Driver 1 / Driver 2) */}
                  {!['delivered', 'cancelled'].includes(order.status) && (
                    <div className={`mt-3 flex flex-wrap items-center gap-2 p-2.5 rounded-xl ${app.dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <span className={`flex items-center gap-1 text-xs font-bold ${app.dark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <Truck size={14} className="text-emerald-500" /> Delivery:
                      </span>
                      <select
                        value={order.assigned_driver || ''}
                        onChange={e => assignDriver(order.order_id, e.target.value || null)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                      >
                        <option value="">Not allocated</option>
                        {deliverers.map(d => (
                          <option key={d.id} value={d.id}>{d.label}</option>
                        ))}
                      </select>
                      {order.assigned_driver_label && (
                        <span className={`text-[11px] font-medium ${order.driver_accepted ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {order.assigned_driver_label} · {order.driver_accepted ? 'Accepted' : 'Awaiting acceptance'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Register call — CEO supplier-stock confirmation (schema_growth.sql) */}
                  {order.review_status !== 'approved' && (() => {
                    const draft = getRegisterDraft(order);
                    const { netSubtotal, netTotal } = registerNet(order, draft);
                    const isPending = !order.review_status || order.review_status === 'pending';
                    const overdue = isPending && !!order.review_due_at && new Date(order.review_due_at).getTime() < Date.now();
                    const allChosen = draft.every(d =>
                      d.status !== null &&
                      (d.status !== 'size_mismatch' || parseOffered(d).length > 0)
                    );
                    return (
                      <div className={`mt-3 p-3 rounded-xl border ${app.dark ? 'bg-slate-700/40 border-slate-600' : 'bg-amber-50/70 border-amber-200'}`}>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="text-xs font-bold flex items-center gap-1.5"><Phone size={13} /> Register Call — supplier stock confirmation</p>
                          {order.review_status === 'awaiting_customer' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-bold">AWAITING CUSTOMER</span>
                          )}
                          {order.review_due_at && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${overdue ? 'bg-red-500/15 text-red-500' : app.dark ? 'bg-slate-600 text-slate-300' : 'bg-white text-slate-500'}`}>
                              Due {new Date(order.review_due_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {overdue && (
                          <p className={`mb-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${app.dark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                            Overdue — customer has been told to check back later
                          </p>
                        )}

                        {order.items.map((item, i) => {
                          const d = draft[i];
                          const product = products.find(p => p.id === item.id);
                          const sizeOptions = product ? getProductSizes(product) : undefined;
                          const offeredList = parseOffered(d);
                          return (
                            <div key={i} className={`py-2 ${i > 0 ? `border-t ${app.dark ? 'border-slate-600' : 'border-amber-200'}` : ''}`}>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-xs font-medium flex-1 min-w-[140px] ${app.dark ? 'text-slate-200' : 'text-slate-700'}`}>
                                  {item.qty}× {item.title}
                                  <span className={app.dark ? 'text-slate-400' : 'text-slate-500'}> · size {item.selectedSize || '—'}</span>
                                </span>
                                <button
                                  onClick={() => updateRegisterItem(order, i, { status: 'confirmed' })}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
                                    d.status === 'confirmed'
                                      ? 'bg-emerald-500 text-white border-emerald-500'
                                      : app.dark ? 'border-slate-600 text-emerald-400 hover:bg-slate-600' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                >
                                  <Check size={11} /> Available
                                </button>
                                <button
                                  onClick={() => updateRegisterItem(order, i, { status: 'size_mismatch' })}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${
                                    d.status === 'size_mismatch'
                                      ? 'bg-amber-500 text-white border-amber-500'
                                      : app.dark ? 'border-slate-600 text-amber-400 hover:bg-slate-600' : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                  }`}
                                >
                                  ? Size mismatch
                                </button>
                                <button
                                  onClick={() => updateRegisterItem(order, i, { status: 'unavailable' })}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
                                    d.status === 'unavailable'
                                      ? 'bg-red-500 text-white border-red-500'
                                      : app.dark ? 'border-slate-600 text-red-400 hover:bg-slate-600' : 'border-red-200 text-red-600 hover:bg-red-50'
                                  }`}
                                >
                                  <X size={11} /> Not in stock
                                </button>
                              </div>

                              {d.status === 'size_mismatch' && (
                                <div className="mt-2 space-y-1.5">
                                  {sizeOptions && sizeOptions.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {sizeOptions.map(size => (
                                        <label
                                          key={size}
                                          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                                            d.offered.includes(size)
                                              ? 'bg-amber-500 text-white border-amber-500'
                                              : app.dark ? 'border-slate-600 text-slate-300' : 'border-slate-200 text-slate-600 bg-white'
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={d.offered.includes(size)}
                                            onChange={e => updateRegisterItem(order, i, {
                                              offered: e.target.checked ? [...d.offered, size] : d.offered.filter(s => s !== size),
                                            })}
                                            className="hidden"
                                          />
                                          {size}
                                        </label>
                                      ))}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder="Sizes we DO have, comma-separated (e.g. M, L)"
                                      value={d.freeText}
                                      onChange={e => updateRegisterItem(order, i, { freeText: e.target.value })}
                                      className={`w-full max-w-xs px-3 py-1.5 rounded-lg border text-xs ${app.dark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                                    />
                                  )}
                                  <p className={`text-[11px] italic ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Customer will be asked: we apologise, we have {offeredList.join(', ') || '…'} not {item.selectedSize || '—'} — keep or remove?
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <div className={`mt-2 pt-2 border-t ${app.dark ? 'border-slate-600' : 'border-amber-200'}`}>
                          <p className="text-xs font-bold">
                            Net subtotal {formatPrice(netSubtotal)} · Net total {formatPrice(netTotal)}
                            <span className={`font-normal ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}> (incl. delivery {formatPrice(order.delivery_fee)})</span>
                          </p>
                          <p className={`text-[11px] italic ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Final total adjusts if the customer removes an item.
                          </p>
                          {reviewMessages[order.order_id] && (
                            <p className="mt-1 text-[11px] font-bold text-amber-500">{reviewMessages[order.order_id]}</p>
                          )}
                          <button
                            onClick={() => submitRegisterCall(order)}
                            disabled={!allChosen || !!reviewSubmitting[order.order_id]}
                            className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold disabled:opacity-50"
                          >
                            {reviewSubmitting[order.order_id] ? 'Submitting…' : 'Complete register call'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Register call complete — net total + WhatsApp deep link to the customer */}
                  {order.review_status === 'approved' && (
                    <div className={`mt-3 flex flex-wrap items-center gap-2 p-2.5 rounded-xl ${app.dark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                      <span className="text-xs font-bold text-emerald-500">
                        Register call complete · net {formatPrice(order.net_total ?? order.total)}
                      </span>
                      {order.phone && (
                        <a
                          href={whatsAppLink(order)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Phone size={12} /> Message customer (WhatsApp)
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package size={48} className={`mx-auto mb-4 ${app.dark ? 'text-slate-600' : 'text-slate-300'}`} />
                  <p className={app.dark ? 'text-slate-400' : 'text-slate-500'}>No orders found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'specials' && (
          <div className="space-y-4">
            {/* Add Special Form */}
            <div className={`rounded-2xl border p-4 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm mb-3">Add Special Offer</h3>
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className={`flex-1 min-w-[200px] px-3 py-2 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({formatPrice(p.price)})</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={discountPercent}
                    onChange={e => setDiscountPercent(Number(e.target.value))}
                    className={`w-20 px-3 py-2 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                  <span className="text-sm font-medium">% off</span>
                </div>
                <button
                  onClick={addSpecial}
                  disabled={!selectedProductId}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold disabled:opacity-50"
                >
                  <TrendingUp size={14} className="inline mr-1" /> Add
                </button>
              </div>
            </div>

            {/* Active Specials */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm">Active Specials</h3>
              {specials.filter(s => s.active).map(special => {
                const product = products.find(p => p.id === special.product_id);
                return (
                  <div key={special.id} className={`flex items-center justify-between p-4 rounded-2xl border ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div>
                      <p className="font-semibold text-sm">{product?.title || special.product_id}</p>
                      <p className="text-xs text-emerald-500 font-bold">{special.discount_percent}% OFF</p>
                    </div>
                    <button onClick={() => deleteSpecial(special.product_id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
              {specials.filter(s => s.active).length === 0 && (
                <p className={`text-sm text-center py-8 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>No active specials</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            {!selectedOrder ? (
              <div className="space-y-3">
                <h3 className="font-bold text-sm">Select an order to view chat</h3>
                {orders.filter(o => o.has_new_chat).map(order => (
                  <button
                    key={order.id}
                    onClick={() => fetchChatForOrder(order.order_id)}
                    className={`w-full text-left p-4 rounded-2xl border ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">#{order.order_id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">NEW</span>
                    </div>
                    <p className={`text-xs mt-1 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{order.customer_name}</p>
                  </button>
                ))}
                {orders.filter(o => o.has_new_chat).length === 0 && (
                  <p className={`text-sm text-center py-8 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>No new chat messages</p>
                )}
              </div>
            ) : (
              <div>
                <button onClick={() => setSelectedOrder(null)} className={`text-sm font-medium mb-3 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="inline-flex items-center gap-1.5"><ChevronLeft size={14} /> Back to orders</span>
                </button>
                <div className={`rounded-2xl border p-4 mb-4 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <p className="font-bold text-sm">#{selectedOrder.order_id}</p>
                  <p className={`text-xs ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedOrder.customer_name}</p>
                </div>
                <div className={`rounded-2xl border p-4 h-[400px] overflow-auto mb-4 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`mb-3 ${msg.sender_role === 'admin' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block px-3 py-2 rounded-2xl text-sm max-w-[80%] ${
                        msg.sender_role === 'admin'
                          ? 'bg-emerald-500 text-white rounded-br-sm'
                          : app.dark ? 'bg-slate-700 text-white rounded-bl-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                      }`}>
                        <p className="text-[10px] font-bold opacity-70 mb-0.5">{msg.sender_name}</p>
                        {msg.content}
                      </div>
                      <p className={`text-[10px] mt-0.5 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <p className={`text-sm text-center py-8 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>No messages yet</p>
                  )}
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as HTMLFormElement).elements.namedItem('reply') as HTMLInputElement;
                  if (input.value.trim()) {
                    sendAdminReply(selectedOrder.order_id, input.value);
                    input.value = '';
                  }
                }} className="flex gap-2">
                  <input
                    name="reply"
                    placeholder="Type a reply..."
                    className={`flex-1 px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                  <button type="submit" className="px-4 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold">
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* AI ALERTS — CEO escalation inbox (misbehaving customers, security events) */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 ${app.dark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold flex items-center gap-2"><ShieldAlert size={18} className="text-red-500" /> AI Escalation Inbox</h3>
              <p className={`text-xs mt-1 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                Raised by Agent Shield (CSO) and the CEO-escalation flow. Critical security events auto-suspend the account; you can lift or enforce suspensions here.
              </p>
            </div>

            {aiAlerts.length === 0 && (
              <div className={`text-center py-12 rounded-2xl border ${app.dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <CheckCircle size={28} className="mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-medium">No AI alerts — the floor is behaving.</p>
              </div>
            )}

            {aiAlerts.map(alert => (
              <div key={alert.id} className={`rounded-2xl border p-4 space-y-3 ${
                alert.status !== 'open' ? 'opacity-60' : ''
              } ${app.dark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                    alert.severity === 'critical' ? 'bg-red-500/15 text-red-500' :
                    alert.severity === 'high' ? 'bg-orange-500/15 text-orange-500' :
                    'bg-amber-500/15 text-amber-600'
                  }`}>{alert.severity}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${app.dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{alert.kind}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                    alert.status === 'open' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-500'
                  }`}>{alert.status}</span>
                  <span className={`ml-auto text-[11px] ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm font-medium">{alert.reason}</p>

                <div className={`text-xs ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Customer: <span className="font-semibold">{alert.customer_name || 'Unknown'}</span>
                  {alert.customer_email ? ` · ${alert.customer_email}` : ''}
                  {alert.suspended && <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 font-bold">SUSPENDED</span>}
                </div>

                {alert.status === 'open' && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={async () => { await supabase?.rpc('resolve_ai_alert', { p_alert_id: alert.id }); refreshData(); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white">
                      Resolve
                    </button>
                    {alert.user_id && !alert.suspended && (
                      <button
                        onClick={async () => { await supabase?.rpc('set_user_suspension', { p_user_id: alert.user_id, p_suspend: true }); refreshData(); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white flex items-center gap-1">
                        <Ban size={12} /> Suspend account
                      </button>
                    )}
                    {alert.user_id && alert.suspended && (
                      <button
                        onClick={async () => { await supabase?.rpc('set_user_suspension', { p_user_id: alert.user_id, p_suspend: false }); refreshData(); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-500 text-white flex items-center gap-1">
                        <Undo2 size={12} /> Lift suspension
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VOGUE — Dr. Vogue's weekly special drafts awaiting CEO approval */}
        {activeTab === 'vogue' && (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm flex items-center gap-2"><Sparkles size={16} className="text-fuchsia-500" /> Dr. Vogue — Weekly Specials</h3>
              <p className={`text-xs mt-1 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                Dr. Vogue studies the catalogue and drafts this week's special picks. Approve a draft to make it live instantly.
              </p>
              <button
                onClick={askVogue}
                disabled={vogueLoading}
                className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-bold disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles size={14} /> {vogueLoading ? 'Dr. Vogue is thinking…' : "Ask Dr. Vogue for this week's picks"}
              </button>
              {vogueError && <p className="mt-2 text-xs font-medium text-red-500">{vogueError}</p>}
            </div>

            {[...vogueDrafts]
              .sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1))
              .map(draft => {
                const product = products.find(p => p.id === draft.product_id);
                return (
                  <div key={draft.id} className={`rounded-2xl border p-4 ${draft.status !== 'pending' ? 'opacity-60' : ''} ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm">{product?.title || draft.product_id}</p>
                      <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-500 text-[10px] font-bold">{draft.discount_percent}% OFF</span>
                      <span className={`ml-auto text-[11px] ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {new Date(draft.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {draft.rationale && (
                      <p className={`text-xs italic mt-1 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>"{draft.rationale}"</p>
                    )}
                    {draft.status === 'pending' ? (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => approveVogueDraft(draft)} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button onClick={() => dismissVogueDraft(draft)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${app.dark ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                          Dismiss
                        </button>
                      </div>
                    ) : (
                      <p className={`mt-2 text-[11px] font-bold uppercase ${draft.status === 'approved' ? 'text-emerald-500' : app.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {draft.status}
                      </p>
                    )}
                  </div>
                );
              })}
            {vogueDrafts.length === 0 && (
              <p className={`text-sm text-center py-8 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                No drafts yet — ask Dr. Vogue for this week's picks.
              </p>
            )}
          </div>
        )}

        {/* SECURITY — CSO analytics from the security_events table */}
        {activeTab === 'security' && (() => {
          const perDay: Record<string, number> = {};
          securityEvents.forEach(e => {
            const day = e.created_at.slice(0, 10);
            perDay[day] = (perDay[day] || 0) + 1;
          });
          const chartData = Object.entries(perDay).map(([date, count]) => ({ date: date.slice(5), count }));
          const suspensions = securityEvents.filter(e => e.action === 'suspended').length;
          const flaggedCount = securityEvents.filter(e => e.action === 'flagged').length;
          const recent = [...securityEvents].slice(-10).reverse();
          return (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <h3 className="font-bold text-sm flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" /> Agent Shield — last 30 days</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.dark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                    {securityEvents.length} events
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-500">
                    {suspensions} suspensions
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600">
                    {flaggedCount} flagged
                  </span>
                </div>
              </div>

              {securityEvents.length === 0 ? (
                <div className={`text-center py-12 rounded-2xl border ${app.dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <ShieldCheck size={28} className="mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm font-medium">No security events — Agent Shield is happy.</p>
                </div>
              ) : (
                <>
                  <div className={`rounded-2xl border p-4 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <h4 className="font-bold text-xs mb-3">Events per day</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={app.dark ? '#64748b' : '#94a3b8'} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke={app.dark ? '#64748b' : '#94a3b8'} width={24} />
                          <Tooltip
                            contentStyle={{
                              background: app.dark ? '#1e293b' : '#ffffff',
                              border: 'none',
                              borderRadius: 12,
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={`rounded-2xl border p-4 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <h4 className="font-bold text-xs mb-2">Most recent</h4>
                    <div className="space-y-2">
                      {recent.map(e => (
                        <div key={e.id} className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${e.action === 'suspended' ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-600'}`}>
                            {e.kind}
                          </span>
                          <span className={`flex-1 truncate ${app.dark ? 'text-slate-400' : 'text-slate-600'}`}>{e.detail || '—'}</span>
                          <span className={app.dark ? 'text-slate-500' : 'text-slate-400'}>{new Date(e.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* SETTINGS — graduation bell + site settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm flex items-center gap-2"><Settings size={16} className="text-amber-500" /> Site Settings</h3>

              <div className="mt-4">
                <button
                  onClick={() => saveSiteSetting('graduation_mode', graduationMode ? 'false' : 'true', graduationMode ? 'Graduation bell turned off' : 'Graduation bell is ringing!')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold ${
                    graduationMode
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900'
                      : app.dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="inline-flex items-center gap-2"><GraduationCap size={16} /> Graduation Bell · {graduationMode ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <label className={`text-xs font-bold ${app.dark ? 'text-slate-300' : 'text-slate-600'}`}>Class of</label>
                <input
                  type="text"
                  value={graduationYearInput}
                  onChange={e => setGraduationYearInput(e.target.value)}
                  className={`w-24 px-3 py-2 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
                <button
                  onClick={() => saveSiteSetting('graduation_year', graduationYearInput.trim() || String(new Date().getFullYear()), 'Graduation year saved')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold"
                >
                  Save year
                </button>
              </div>

              <p className={`text-xs mt-4 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                When the bell rings, the store turns to its luxury gold theme non-stop and celebrates the Class of {graduationYear} — from two weeks before graduation through graduation week. Turn it off after the celebrations.
              </p>
              <p className={`text-xs mt-2 italic ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                Luxury theme also switches on automatically every Friday (Mr George's Walk Friday).
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, badge }: { active: boolean; onClick: () => void; icon: any; label: string; badge?: number }) {
  const app = useApp();
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
        active
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
          : app.dark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon size={14} />
      {label}
      {!!badge && badge > 0 && (
        <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">{badge}</span>
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    order_received: 'bg-blue-100 text-blue-600',
    shipped: 'bg-purple-100 text-purple-600',
    arrived_storage: 'bg-indigo-100 text-indigo-600',
    out_for_delivery: 'bg-amber-100 text-amber-600',
    ready_for_pickup: 'bg-cyan-100 text-cyan-600',
    driver_nearby: 'bg-orange-100 text-orange-600',
    delivered: 'bg-emerald-100 text-emerald-600',
    cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
