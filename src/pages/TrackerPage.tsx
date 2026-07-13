import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { STATUS_STEPS } from '@/lib/data';
import { useApp } from '@/App';
import { formatPrice } from '@/lib/utils';
import ChatWidget from '@/components/ChatWidget';
import type { Order } from '@/types';
import {
  Package, Truck, Clock, MapPin, CheckCircle, AlertTriangle,
  ChevronLeft, CreditCard, ArrowRight
} from 'lucide-react';

const CHAT_POP_STATUSES = ['order_received', 'driver_nearby'];

export default function TrackerPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const app = useApp();
  const navigate = useNavigate();

    // Fetch order + subscribe to realtime updates
  useEffect(() => {
    if (!orderId || !supabase || !app.user) {
      setLoading(false);
      return;
    }

    // Initial fetch
    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .eq('user_id', app.user!.id)
        .single();
      if (data) setOrder(data as unknown as Order);
      setLoading(false);
    };
    fetchOrder();

    // Realtime subscription for live status updates
    const channel = supabase
      .channel(`order-tracker-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newOrder = payload.new as unknown as Order;
          const oldStatus = order?.status;
          const newStatus = newOrder.status;

          // Show toast if status changed
          if (oldStatus && oldStatus !== newStatus) {
            app.showToast(`Order status updated: ${newStatus.replace(/_/g, ' ')}`, 'info');
          }

          setOrder(newOrder);
        }
      )
      .subscribe();

    // Cleanup: unsubscribe when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, app.user]);

  // Not logged in — no guest tracking allowed.
  if (!app.authLoading && !app.user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`w-full max-w-sm text-center p-6 rounded-3xl border ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <AlertTriangle size={40} className="mx-auto mb-3 text-amber-500" />
          <h2 className="font-bold text-lg mb-2">Please login to track your order</h2>
          <p className={`text-sm mb-4 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Order tracking is only available to signed-in accounts.
          </p>
          <div className="space-y-2">
            <button onClick={() => app.setShowLogin(true)} className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold">Login</button>
            <button onClick={() => app.setShowRegister(true)} className={`w-full py-3 rounded-2xl border font-bold ${app.dark ? 'border-slate-600' : 'border-slate-200'}`}>Create Account</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || app.authLoading) return (
    <div className={`min-h-screen flex items-center justify-center ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="text-center">
        <Package size={48} className={`mx-auto mb-4 animate-pulse ${app.dark ? 'text-slate-600' : 'text-slate-300'}`} />
        <p className={app.dark ? 'text-slate-400' : 'text-slate-500'}>Loading order...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className={`min-h-screen flex items-center justify-center ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="text-center max-w-sm px-4">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <p className={`mb-4 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>We could not find order {orderId}</p>
        <Link to="/" className="text-emerald-500 font-bold">Back to Store</Link>
      </div>
    </div>
  );

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status);
  const isDelivered = order.status === 'delivered';
  const history = order.status_history || [];
  const shouldShowChat = CHAT_POP_STATUSES.includes(order.status) || true; // button always available, auto-pop gated below

  return (
    <div className={`min-h-screen ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${app.dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'} backdrop-blur-xl border-b`}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="font-bold text-base">Order Tracking</h1>
            <p className={`text-xs ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>#{order.order_id}</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Status Hero */}
        <div className={`text-center p-8 rounded-3xl mb-6 ${
          app.dark ? 'bg-gradient-to-b from-emerald-500/10 to-slate-800 border-emerald-500/20' : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-100'
        } border`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDelivered ? 'bg-emerald-500' : 'bg-amber-500'
          }`}>
            {isDelivered ? <CheckCircle size={40} className="text-white" /> : <Truck size={40} className="text-white" />}
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {isDelivered ? 'Delivered!' : STATUS_STEPS[currentStepIndex]?.label || 'Processing'}
          </h2>
          <p className={`text-sm ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isDelivered ? 'Your order has been delivered successfully.' : STATUS_STEPS[currentStepIndex]?.description}
          </p>
          {!isDelivered && (
            <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-bold ${
              app.dark ? 'bg-slate-700 text-emerald-400' : 'bg-white text-emerald-600'
            } shadow-sm`}>
              <Clock size={16} /> Estimated: 1-8 business days
            </div>
          )}
        </div>

        {isDelivered && (
          <button
            onClick={() => navigate(`/thank-you?order=${order.order_id}`)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 mb-6 flex items-center justify-center gap-2"
          >
            See what's next <ArrowRight size={18} />
          </button>
        )}

        {/* Delay Notice */}
        {!isDelivered && (
          <div className={`p-4 rounded-2xl mb-6 ${
            app.dark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
          } border text-sm`}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <p>If delivery exceeds 9 business days, you will receive R50 off your next purchase as our apology.</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className={`rounded-3xl p-6 mb-6 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-sm`}>
          <h3 className="font-bold text-lg mb-6">Delivery Progress</h3>
          <div className="relative pl-8">
            <div className={`absolute left-[11px] top-3 bottom-3 w-0.5 ${app.dark ? 'bg-slate-700' : 'bg-slate-200'}`} />

            {STATUS_STEPS.map((step, i) => {
              const isCompleted = i <= currentStepIndex || isDelivered;
              const isCurrent = i === currentStepIndex && !isDelivered;
              const historyItem = history.find((h) => h.status === step.id);
              const timeStr = historyItem ? new Date(historyItem.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <div key={step.id} className={`relative pb-8 last:pb-0 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`absolute left-[-25px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted ? 'border-emerald-500 bg-emerald-500' : isCurrent ? 'border-emerald-500 bg-white dark:bg-slate-800' : app.dark ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-white'
                  }`}>
                    {isCompleted && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <div className={isCurrent ? 'text-emerald-500' : ''}>
                    <p className="font-bold text-sm">{step.label}</p>
                    <p className={`text-xs mt-0.5 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{step.description}</p>
                    {timeStr && <p className="text-xs text-slate-400 mt-1">{timeStr}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className={`rounded-3xl p-6 mb-6 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-sm`}>
          <h3 className="font-bold text-lg mb-4">Order Details</h3>
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between py-2 text-sm border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span><span className={app.dark ? 'text-slate-400' : 'text-slate-500'}>{item.qty}x</span> {item.title}</span>
              <span className="font-semibold">{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-sm"><span className={app.dark ? 'text-slate-400' : 'text-slate-500'}>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.delivery_fee > 0 ? (
              <div className="flex justify-between text-sm"><span className={app.dark ? 'text-slate-400' : 'text-slate-500'}>Delivery</span><span>{formatPrice(order.delivery_fee)}</span></div>
            ) : (
              <div className="flex justify-between text-sm"><span className="text-emerald-500 font-medium">Delivery</span><span className="text-emerald-500 font-bold">FREE</span></div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total</span><span className="text-emerald-500">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className={`rounded-3xl p-6 mb-6 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-sm`}>
          <h3 className="font-bold text-lg mb-4">Delivery Address</h3>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-emerald-500 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{order.customer_name}</p>
              <p className={`text-sm ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{order.address}</p>
              <p className="text-emerald-500 text-sm font-medium mt-1">{order.location === 'upper' ? 'Upper Campus' : 'Lower Campus'}</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className={`rounded-3xl p-6 mb-6 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-sm`}>
          <h3 className="font-bold text-lg mb-4">Payment</h3>
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-emerald-500" />
            <div>
              <p className="text-sm font-medium">{order.payment_method}</p>
              <p className={`text-xs ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {order.paid ? 'Paid' : order.payment_status || 'Pending'}
              </p>
            </div>
          </div>
          {!order.paid && order.payment_method === 'Online Payment' && (
            <Link to={`/bank-confirm?order=${order.order_id}`} className="block w-full mt-4 py-3 rounded-xl bg-emerald-500 text-white text-center text-sm font-bold">
              Complete Payment
            </Link>
          )}
        </div>

        <Link to="/" className="block w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-center shadow-lg shadow-emerald-500/30 mb-8">
          Back to Store
        </Link>
      </div>

      {shouldShowChat && <ChatWidget orderId={order.order_id} popTrigger={CHAT_POP_STATUSES.includes(order.status) ? order.status : undefined} />}
    </div>
  );
}
