import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import { BANK_DETAILS } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import {
  Banknote, Smartphone, Copy, CheckCircle, ChevronLeft,
  Clock, AlertCircle, Upload
} from 'lucide-react';

export default function BankConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const app = useApp();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [uploaded, setUploaded] = useState(false);

  // Find order
  useEffect(() => {
    if (!orderId) return;
    const orders = JSON.parse(localStorage.getItem('yaf_orders') || '[]');
    const found = orders.find((o: any) => o.order_id === orderId);
    if (found) setOrder(found);
  }, [orderId]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePaid = () => {
    // Update order status
    const orders = JSON.parse(localStorage.getItem('yaf_orders') || '[]');
    const idx = orders.findIndex((o: any) => o.order_id === orderId);
    if (idx >= 0) {
      orders[idx].paid = true;
      orders[idx].payment_status = 'paid';
      localStorage.setItem('yaf_orders', JSON.stringify(orders));
    }
    navigate(`/tracker?order=${orderId}`);
  };

  if (!order) return (
    <div className={`min-h-screen flex items-center justify-center ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <p className={app.dark ? 'text-slate-400' : 'text-slate-500'}>Loading...</p>
    </div>
  );

  return (
    <div className={`min-h-screen ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${app.dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'} backdrop-blur-xl border-b`}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-base">Complete Payment</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Payment Amount */}
        <div className="text-center mb-6">
          <p className={`text-sm mb-1 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>Amount Due</p>
          <p className="text-4xl font-extrabold text-emerald-500">{formatPrice(order.total)}</p>
          <p className={`text-xs mt-1 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>Order #{order.order_id}</p>
        </div>

        {/* Timer for PayShap */}
        {order.payment_method === 'PayShap' && (
          <div className={`p-4 rounded-2xl mb-6 text-center ${
            timeLeft > 0
              ? app.dark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
              : app.dark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'
          } border`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock size={18} className={timeLeft > 0 ? 'text-amber-500' : 'text-red-500'} />
              <span className={`font-bold text-lg ${timeLeft > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                {timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}
              </span>
            </div>
            <p className={`text-sm ${timeLeft > 0 ? (app.dark ? 'text-amber-400' : 'text-amber-600') : 'text-red-500'}`}>
              {timeLeft > 0 ? 'Please complete payment within 5 minutes' : 'Payment window has expired. Please contact support.'}
            </p>
          </div>
        )}

        {/* PayShap Payment */}
        {order.payment_method === 'PayShap' && (
          <div className={`rounded-3xl p-6 mb-6 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                <Smartphone size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold">PayShap Payment</h3>
                <p className={`text-xs ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>Send payment request</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl mb-4 ${app.dark ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <p className="text-xs mb-1 opacity-70">Capitec PayShap Number</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg">{BANK_DETAILS.payshapNumber}</span>
                <button onClick={() => copyToClipboard(BANK_DETAILS.payshapNumber, 'payshap')} className="text-emerald-500">
                  {copied === 'payshap' ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className={`p-4 rounded-2xl text-sm ${app.dark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>Use the Capitec banking app to send payment to 0631917709. Use your Order ID as reference.</p>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Payment */}
        {order.payment_method === 'Online Payment' && (
          <div className={`rounded-3xl p-6 mb-6 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Banknote size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold">Bank Transfer</h3>
                <p className={`text-xs ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>Transfer to our account</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`p-4 rounded-2xl ${app.dark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs opacity-70">Bank</span>
                  <span className="font-bold">{BANK_DETAILS.bank}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs opacity-70">Account Name</span>
                  <span className="font-bold">{BANK_DETAILS.accountName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs opacity-70">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-500">{BANK_DETAILS.accountNumber}</span>
                    <button onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, 'acc')} className="text-emerald-500">
                      {copied === 'acc' ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs opacity-70">Branch Code</span>
                  <span className="font-mono font-bold">{BANK_DETAILS.branchCode}</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl ${app.dark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                <p className="text-xs opacity-70 mb-1">Reference</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{order.order_id}</span>
                  <button onClick={() => copyToClipboard(order.order_id, 'ref')} className="text-purple-500">
                    {copied === 'ref' ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proof Upload */}
        <div className={`rounded-3xl p-6 mb-6 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-sm`}>
          <h3 className="font-bold mb-4 flex items-center gap-2"><Upload size={18} /> Upload Proof (Optional)</h3>
          <div className={`border-2 border-dashed rounded-2xl p-6 text-center ${
            uploaded ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : app.dark ? 'border-slate-600' : 'border-slate-300'
          }`}>
            {uploaded ? (
              <div>
                <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-emerald-500">Proof uploaded!</p>
              </div>
            ) : (
              <div>
                <Upload size={32} className={`mx-auto mb-2 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`} />
                <p className={`text-sm ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>Tap to upload screenshot</p>
                <input type="file" accept="image/*" onChange={() => setUploaded(true)} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            )}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handlePaid}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 mb-4"
        >
          <CheckCircle size={20} className="inline mr-2" /> I Have Paid
        </button>

        <p className={`text-center text-xs ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>
          If you did not receive the payment request, contact us at agrisciencesmatriculants@gmail.com
        </p>
      </div>
    </div>
  );
}
