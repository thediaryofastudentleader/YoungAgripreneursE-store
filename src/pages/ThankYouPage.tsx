import { useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import { products } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { SOCIAL_LINKS, CEO_QUOTE, CEO_IMAGE, SUPPORT_EMAIL } from '@/lib/site';
import { ChevronLeft, Youtube, Music2, ShoppingBag, Mail } from 'lucide-react';

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const app = useApp();
  const navigate = useNavigate();

  // Pick 3 products the customer didn't already buy on this order.
  const order = app.orders.find(o => o.order_id === orderId);
  const boughtIds = new Set((order?.items || []).map(i => i.id));
  const suggestions = useMemo(() => {
    const pool = products.filter(p => !boughtIds.has(p.id));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className={`min-h-screen ${app.dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <header className={`sticky top-0 z-50 ${app.dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'} backdrop-blur-xl border-b`}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-base">Thank You</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* CEO message */}
        <div className={`text-center rounded-3xl p-8 mb-8 ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-sm`}>
          <img
            src={CEO_IMAGE}
            alt="Young Agripreneurs CEO"
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-emerald-500 shadow-lg"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h2 className="text-xl font-extrabold mb-1">Delivered! 🎉</h2>
          <p className={`text-xs uppercase tracking-wide font-bold text-emerald-500 mb-4`}>Message from our CEO</p>
          <p className={`text-sm leading-relaxed italic ${app.dark ? 'text-slate-300' : 'text-slate-600'}`}>
            "{CEO_QUOTE}"
          </p>
        </div>

        {/* Social links */}
        <div className="flex gap-3 mb-8">
          <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-lg">
            <Youtube size={18} /> YouTube
          </a>
          <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-black text-white font-bold text-sm shadow-lg">
            <Music2 size={18} /> TikTok
          </a>
        </div>
        <p className={`text-center text-xs mb-8 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>
          Follow us — Young Agripreneurs
        </p>

        {/* Suggested products */}
        {suggestions.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-base mb-4">You might also like</h3>
            <div className="grid grid-cols-3 gap-3">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  onClick={() => { navigate('/'); }}
                  className={`rounded-2xl overflow-hidden text-left ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-sm`}
                >
                  <div className="aspect-square bg-slate-100 dark:bg-slate-700">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold leading-tight line-clamp-2 mb-1">{p.title}</p>
                    <p className="text-xs font-bold text-emerald-600">{formatPrice(p.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 mb-4"
        >
          <ShoppingBag size={18} /> Continue Shopping
        </button>

        <a href={`mailto:${SUPPORT_EMAIL}`} className={`flex items-center justify-center gap-2 text-sm font-medium ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
          <Mail size={14} /> Want us to stock something? {SUPPORT_EMAIL}
        </a>
      </div>
    </div>
  );
}
