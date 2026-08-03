import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { STATUS_STEPS } from '@/lib/data';
import { useApp } from '@/App';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';
import {
  Truck, ChevronLeft, MapPin, Package, CheckCircle, AlertTriangle,
  RefreshCw, Phone, Navigation, LogOut
} from 'lucide-react';

// Statuses a driver is allowed to set. Everything else is done by the admin.
const DRIVER_STATUSES = ['out_for_delivery', 'driver_nearby', 'delivered'] as const;

export default function DriverPage() {
  const app = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);

  const isDriver = !!app.user && (app.user.role === 'driver' || app.user.is_admin);

  const refresh = useCallback(async () => {
    if (!supabase || !app.user) return;
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('assigned_driver', app.user.id)
      .order('created_at', { ascending: false });
    if (data) {
      const all = data as unknown as Order[];
      setOrders(all.filter(o => !['delivered', 'cancelled'].includes(o.status)));
      setPastOrders(all.filter(o => ['delivered', 'cancelled'].includes(o.status)));
    }
    setLoading(false);
  }, [app.user]);

  useEffect(() => {
    if (!isDriver || !app.user || !supabase) {
      setLoading(false);
      return;
    }
    refresh();

    // Live updates when admin allocates an order to this driver
    const channel = supabase
      .channel(`driver-orders-${app.user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `assigned_driver=eq.${app.user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || (payload.new as any)?.driver_accepted === false) {
            app.showToast('New delivery allocated to you!', 'info');
          }
          refresh();
        }
      )
      .subscribe();
    return () => { supabase!.removeChannel(channel); };
  }, [isDriver, app.user, refresh]);

  // Accept an allocated delivery (SECURITY DEFINER RPC sets driver_accepted = true)
  const acceptOrder = async (orderId: string) => {
    if (!supabase) return;
    const { error } = await supabase.rpc('driver_accept_order', { p_order_id: orderId });
    if (error) {
      app.showToast('Could not accept delivery', 'error');
    } else {
      app.showToast('Delivery accepted — customer notified', 'success');
    }
    refresh();
  };

  // Driver delivery-status updates only (out_for_delivery / driver_nearby / delivered)
  const setStatus = async (orderId: string, status: string) => {
    if (!supabase) return;
    const { error } = await supabase.rpc('driver_update_status', { p_order_id: orderId, p_status: status });
    if (error) {
      app.showToast('Could not update status', 'error');
    } else {
      app.showToast(`Status updated: ${status.replace(/_/g, ' ')}`, 'success');
    }
    refresh();
  };

  // ---------- Gates ----------
  if (app.authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <Truck size={48} className={`animate-pulse ${app.dark ? 'text-slate-600' : 'text-slate-300'}`} />
      </div>
    );
  }

  if (!app.user) {
    return (
      <GateShell title="Driver Login" dark={app.dark}>
        <p className={`text-sm mb-4 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Delivery drivers sign in with the store account created for them by the admin.
        </p>
        <button onClick={() => app.setShowLogin(true)} className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold">
          Login
        </button>
        <button onClick={() => navigate('/')} className={`w-full mt-2 py-2 text-sm font-medium ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
          ← Back to Store
        </button>
      </GateShell>
    );
  }

  if (!isDriver) {
    return (
      <GateShell title="Access Denied" dark={app.dark} icon={<AlertTriangle size={28} className="text-white" />}>
        <p className={`text-sm mb-4 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
          This account (<b>{app.user.username || app.user.email}</b>) is not registered as a delivery driver.
          Ask the admin to set <code>role = 'driver'</code> on your profile in Supabase.
        </p>
        <button onClick={() => navigate('/')} className={`w-full py-2 text-sm font-medium ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
          ← Back to Store
        </button>
      </GateShell>
    );
  }

  const driverLabel = app.user.driver_label || (app.user.is_admin ? 'Admin' : 'Driver');

  return (
    <div className={`min-h-screen ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${app.dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'} backdrop-blur-xl border-b`}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Truck size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base">Driver Dashboard</h1>
              <p className={`text-xs ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{driverLabel} · Grahamstown deliveries</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className={`p-2 rounded-full ${app.dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => { app.logout(); navigate('/'); }} className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Active deliveries */}
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Navigation size={16} className="text-emerald-500" /> Allocated to you ({orders.length})
        </h2>

        {orders.length === 0 && !loading && (
          <div className={`text-center py-12 rounded-3xl border mb-8 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <Package size={48} className={`mx-auto mb-3 ${app.dark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={app.dark ? 'text-slate-400' : 'text-slate-500'}>No deliveries allocated right now.</p>
            <p className={`text-xs mt-1 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>The admin will allocate orders here once they arrive in Grahamstown.</p>
          </div>
        )}

        <div className="space-y-4 mb-10">
          {orders.map(order => {
            const stepIdx = STATUS_STEPS.findIndex(s => s.id === order.status);
            return (
              <div key={order.id} className={`rounded-3xl border p-5 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">#{order.order_id}</p>
                    <p className={`text-xs mt-0.5 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {STATUS_STEPS[stepIdx]?.label || order.status} · {formatPrice(order.total)}
                    </p>
                  </div>
                  {!order.driver_accepted ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold animate-pulse">NEW — ACCEPT?</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">ACCEPTED</span>
                  )}
                </div>

                {/* Customer + address */}
                <div className={`flex items-start gap-3 p-3 rounded-2xl mb-3 ${app.dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <MapPin size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className={app.dark ? 'text-slate-400' : 'text-slate-500'}>{order.address}</p>
                    <p className="text-emerald-500 font-medium text-xs mt-1">{order.location === 'upper' ? 'Upper Campus' : 'Lower Campus'}</p>
                    {order.phone && (
                      <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 mt-1">
                        <Phone size={12} /> {order.phone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className={`text-xs mb-4 ${app.dark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {order.items?.map((item: any, i: number) => (
                    <p key={i}>· {item.qty}x {item.title}{item.selectedSize ? ` (Size: ${item.selectedSize})` : ''}</p>
                  ))}
                </div>

                {/* Actions */}
                {!order.driver_accepted ? (
                  <button
                    onClick={() => acceptOrder(order.order_id)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Accept this delivery
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {DRIVER_STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => setStatus(order.order_id, s)}
                        disabled={order.status === s}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          order.status === s
                            ? 'bg-emerald-500 text-white'
                            : app.dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } disabled:opacity-100`}
                      >
                        {s === 'out_for_delivery' ? 'On the way' : s === 'driver_nearby' ? 'Nearby' : 'Delivered'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* History */}
        {pastOrders.length > 0 && (
          <>
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" /> Completed ({pastOrders.length})
            </h2>
            <div className="space-y-2">
              {pastOrders.map(order => (
                <div key={order.id} className={`flex items-center justify-between p-3 rounded-2xl border ${app.dark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div>
                    <p className="font-bold text-xs">#{order.order_id}</p>
                    <p className={`text-[11px] ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>{order.customer_name} · {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-emerald-500 text-xs font-bold">{formatPrice(order.total)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function GateShell({ title, dark, icon, children }: { title: string; dark: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`w-full max-w-sm p-8 rounded-3xl border shadow-2xl text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
          {icon || <Truck size={28} className="text-white" />}
        </div>
        <h2 className="font-bold text-xl mb-2">{title}</h2>
        {children}
      </div>
    </div>
  );
}
