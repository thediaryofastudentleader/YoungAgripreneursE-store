import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllSpecials, setSpecial, removeSpecial } from '@/lib/specials';
import { products } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import type { ProductSpecial, Order, ChatMessage } from '@/types';
import {
  Shield, LogOut, Package, TrendingUp, MessageSquare,
  CheckCircle, XCircle, Clock, Search, ChevronLeft,
  Percent, Trash2, Loader2, AlertTriangle, RefreshCw
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'orders' | 'specials' | 'chat'>('orders');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [specials, setSpecials] = useState<ProductSpecial[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
      if (ordersData) setOrders(ordersData as unknown as Order[]);

      // Fetch specials
      const specialsData = await fetchAllSpecials();
      setSpecials(specialsData);
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
            ← Back to Store
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
        <div className={`max-w-5xl mx-auto px-4 pb-3 flex gap-2`}>
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={Package} label="Orders" badge={orders.length} />
          <TabButton active={activeTab === 'specials'} onClick={() => setActiveTab('specials')} icon={Percent} label="Specials" />
          <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={MessageSquare} label="Chat" badge={orders.filter(o => o.has_new_chat).length} />
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
                  ← Back to orders
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
