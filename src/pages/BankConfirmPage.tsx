import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import { supabase, PROOFS_BUCKET } from '@/lib/supabaseClient';
import { BANK_DETAILS } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';
import {
  Banknote, Smartphone, Copy, CheckCircle, ChevronLeft,
  AlertCircle, Upload, Clock, Loader2,
} from 'lucide-react';

export default function BankConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const app = useApp();
  const orderId = searchParams.get('order');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [proofStatus, setProofStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  const fetchOrder = useCallback(async () => {
    if (!orderId || !supabase || !app.user) { setLoading(false); return; }
    const { data } = await supabase.from('orders').select('*').eq('order_id', orderId).eq('user_id', app.user.id).single();
    if (data) {
      setOrder(data as unknown as Order);
      if ((data as any).paid) {
        setProofStatus('approved');
      }
    }
    const { data: pop } = await supabase.from('proof_of_payments').select('*').eq('order_id', orderId).maybeSingle();
    if (pop) setProofStatus(pop.status);
    setLoading(false);
  }, [orderId, app.user]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  // Once approved, hand off to the tracker automatically.
  useEffect(() => {
    if (proofStatus === 'approved' && order) {
      const t = setTimeout(() => navigate(`/tracker?order=${order.order_id}`), 2000);
      return () => clearTimeout(t);
    }
  }, [proofStatus, order, navigate]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.size > 5 * 1024 * 1024) { app.showToast('File too large. Max 5MB.', 'error'); return; }
    setFile(f || null);
  };

  const uploadProof = async () => {
    if (!order || !supabase) return;
    setUploading(true);
    try {
      let filePath: string | undefined;
      let publicUrl: string | undefined;

      if (file) {
        const fileExt = file.name.split('.').pop();
        filePath = `${order.order_id}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from(PROOFS_BUCKET)
          .upload(filePath, file, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from(PROOFS_BUCKET).getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      const { error: dbError } = await supabase.from('proof_of_payments').upsert(
        {
          order_id: order.order_id,
          file_path: filePath,
          file_url: publicUrl,
          file_name: file?.name,
          file_type: file?.type,
          status: 'pending',
        },
        { onConflict: 'order_id' }
      );
      if (dbError) throw dbError;

      await supabase.from('orders').update({ payment_status: 'proof_uploaded' }).eq('order_id', order.order_id);

      setProofStatus('pending');
      app.showToast('Proof submitted! Waiting for us to confirm your payment.', 'success');
    } catch (err) {
      console.error(err);
      app.showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (!app.user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`w-full max-w-sm text-center p-6 rounded-3xl border ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <AlertCircle size={40} className="mx-auto mb-3 text-amber-500" />
          <h2 className="font-bold text-lg mb-2">Please login</h2>
          <p className={`text-sm mb-4 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>You need to be logged in to confirm payment for your order.</p>
          <button onClick={() => app.setShowLogin(true)} className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold">Login</button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <p className={app.dark ? 'text-slate-400' : 'text-slate-500'}>Loading...</p>
    </div>
  );

  if (!order) return (
    <div className={`min-h-screen flex items-center justify-center ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="text-center">
        <p className={app.dark ? 'text-slate-400' : 'text-slate-500'}>Order not found.</p>
        <Link to="/" className="text-emerald-500 font-bold">Back to Store</Link>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <header className={`sticky top-0 z-50 ${app.dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'} backdrop-blur-xl border-b`}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-base">Complete Payment</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <p className={`text-sm mb-1 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>Amount Due</p>
          <p className="text-4xl font-extrabold text-emerald-500">{formatPrice(order.total)}</p>
          <p className={`text-xs mt-1 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>Order #{order.order_id}</p>
        </div>

        {proofStatus === 'approved' && (
          <div className={`p-4 rounded-2xl mb-6 text-center ${app.dark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'} border`}>
            <CheckCircle size={28} className="mx-auto mb-2 text-emerald-500" />
            <p className="font-bold text-emerald-500">Payment confirmed! Redirecting to tracker...</p>
          </div>
        )}
        {proofStatus === 'pending' && (
          <div className={`p-4 rounded-2xl mb-6 text-center ${app.dark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'} border`}>
            <Clock size={24} className="mx-auto mb-2 text-amber-500" />
            <p className="font-bold text-amber-500 text-sm">Waiting for us to confirm your payment. This page updates automatically.</p>
          </div>
        )}
        {proofStatus === 'rejected' && (
          <div className={`p-4 rounded-2xl mb-6 text-center ${app.dark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'} border`}>
            <AlertCircle size={24} className="mx-auto mb-2 text-red-500" />
            <p className="font-bold text-red-500 text-sm">We couldn't confirm this payment. Please double check the details below and re-upload proof, or contact us.</p>
          </div>
        )}

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
                <p>Use your banking app to send payment to {BANK_DETAILS.payshapNumber}. Use your Order ID as reference.</p>
              </div>
            </div>
          </div>
        )}

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

        {proofStatus !== 'approved' && (
          <div className={`rounded-3xl p-6 mb-6 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-sm`}>
            <h3 className="font-bold mb-4 flex items-center gap-2"><Upload size={18} /> Upload Proof of Payment</h3>
            <label className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer relative ${
              file ? 'border-emerald-500' : app.dark ? 'border-slate-600' : 'border-slate-300'
            }`}>
              <Upload size={28} className={`mx-auto mb-2 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`} />
              <p className={`text-sm ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {file ? file.name : 'Tap to upload screenshot or PDF'}
              </p>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>

            <button
              onClick={uploadProof}
              disabled={uploading}
              className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {uploading ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "I've Paid — Submit for Review"}
            </button>
          </div>
        )}

        <p className={`text-center text-xs ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>
          If you have any trouble, use the chat button on your tracking page or contact us at agrisciencesmatriculants@gmail.com
        </p>
      </div>
    </div>
  );
}
