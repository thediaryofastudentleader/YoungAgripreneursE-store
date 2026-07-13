import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Moon, Sun, Search, X, Heart, Home, Package,
  UserCircle, Bell, Star, Plus, Minus, Trash2, ChevronRight,
  LogIn, LogOut, User, MapPin, Phone, Mail, AlertTriangle,
  Clock, ScrollText, ArrowRight, UserPlus
} from 'lucide-react';
import { useApp } from '@/App';
import { products, categories, getDeliveryFee } from '@/lib/data';
import { getGreeting, formatPrice } from '@/lib/utils';
import type { Product, FormData } from '@/types';

export default function HomePage() {
  const app = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(p => {
    const matchesCategory = app.selectedCategory === 'all' || p.category === app.selectedCategory;
    const matchesSearch = !app.searchQuery ||
      p.title.toLowerCase().includes(app.searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(app.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartSubtotal = app.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = getDeliveryFee(cartSubtotal, app.user ? (app.user as any).location || 'lower' : 'lower');
  const cartTotal = cartSubtotal + deliveryFee;
  const cartCount = app.cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        app.dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'
      } backdrop-blur-xl border-b`}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">YAF</span>
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Young Agripreneurs</h1>
              <p className={`text-xs ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{getGreeting()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => app.setShowSearch(!app.showSearch)} className={`p-2 rounded-full ${app.dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}>
              <Search size={20} />
            </button>
            <button onClick={() => app.setShowNotifications(!app.showNotifications)} className={`p-2 rounded-full relative ${app.dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}>
              <Bell size={20} />
              {app.notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <button onClick={() => app.setShowCart(true)} className={`p-2 rounded-full relative ${app.dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </button>
            <button onClick={() => app.setDark(!app.dark)} className={`p-2 rounded-full ${app.dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}>
              {app.dark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {app.showSearch && (
          <div className={`px-4 pb-3 ${app.dark ? 'bg-slate-900/95' : 'bg-white/95'}`}>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${app.dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} border`}>
              <Search size={18} className={app.dark ? 'text-slate-400' : 'text-slate-500'} />
              <input
                type="text"
                placeholder="Search products..."
                value={app.searchQuery}
                onChange={e => app.setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-sm ${app.dark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
                autoFocus
              />
              {app.searchQuery && (
                <button onClick={() => app.setSearchQuery('')}>
                  <X size={16} className={app.dark ? 'text-slate-400' : 'text-slate-500'} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto pt-20 pb-24 px-4">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 mb-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-semibold mb-3">
              <Star size={14} /> Campus Delivery
            </div>
            <h2 className="text-2xl font-extrabold mb-1">Everything You Need</h2>
            <p className="text-sm opacity-85 mb-4">Delivered to your res in 1-8 business days</p>
            <div className="flex gap-4 text-xs opacity-70">
              <span className="flex items-center gap-1"><Clock size={14} /> 1-8 Days</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> On Campus</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        {!app.searchQuery && (
          <div className="mb-6">
            <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => app.setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-none cursor-pointer whitespace-nowrap snap-start transition-all ${
                    app.selectedCategory === cat.id
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-105'
                      : app.dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <span className="text-xs font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">
              {app.searchQuery ? 'Search Results' : app.selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === app.selectedCategory)?.label}
            </h3>
            <span className={`text-xs ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{filteredProducts.length} items</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className={`mx-auto mb-4 ${app.dark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className="font-semibold">No products found</p>
              <p className={`text-sm ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>Try a different search or category</p>
            </div>
          )}
        </div>
      </main>

      {/* Cart Drawer */}
      {app.showCart && <CartDrawer cartSubtotal={cartSubtotal} deliveryFee={deliveryFee} cartTotal={cartTotal} cartCount={cartCount} />}

      {/* Notifications Panel */}
      {app.showNotifications && <NotificationsPanel />}

      {/* Account Modal */}
      {app.showAccount && <AccountModal />}

      {/* Orders Modal */}
      {app.showOrders && <OrdersModal />}

      {/* Profile Modal */}
      {app.showProfile && <ProfileModal />}

      {/* NOTE: Login/Register modals are now rendered globally in App.tsx
          (via @/components/AuthModals) so they're available from any page
          and share one async auth flow. Do not re-render them here. */}

      {/* Review Modal */}
      {app.showReview && app.pendingReviewOrder && <ReviewModal order={app.pendingReviewOrder} />}

      {/* Terms Modal */}
      {app.showTerms && <TermsModal />}

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 ${app.dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'} backdrop-blur-xl border-t`}>
        <div className="max-w-lg mx-auto flex justify-around py-2">
          <NavButton icon={Home} label="Home" isActive={app.activeTab === 'home'} onClick={() => app.setActiveTab('home')} />
          <NavButton icon={Heart} label="Liked" isActive={false} onClick={() => {}} badge={app.liked.length} />
          <NavButton icon={ShoppingCart} label="Cart" isActive={app.showCart} onClick={() => app.setShowCart(true)} badge={cartCount} />
          <NavButton icon={Package} label="Orders" isActive={app.showOrders} onClick={() => app.setShowOrders(true)} />
          <NavButton icon={app.user ? UserCircle : LogIn} label={app.user ? 'Profile' : 'Login'} isActive={app.showProfile || app.showAccount} onClick={() => app.user ? app.setShowProfile(true) : app.setShowAccount(true)} />
        </div>
      </nav>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const app = useApp();
  const isLiked = app.liked.includes(product.id);

  return (
    <div className={`rounded-2xl overflow-hidden transition-all hover:scale-[1.02] ${
      app.dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    } border shadow-sm`}>
      <div className="relative aspect-square bg-slate-100 dark:bg-slate-700">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        {product.special && (
          <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold shadow-lg">SALE</span>
        )}
        {product.new && (
          <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold shadow-lg">NEW</span>
        )}
        <button
          onClick={() => app.toggleLike(product.id)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md"
        >
          <Heart size={16} className={isLiked ? 'text-red-500 fill-red-500' : 'text-slate-400'} />
        </button>
        {product.originalPrice && (
          <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold shadow-lg">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm leading-tight mb-1 truncate">{product.title}</h4>
        <p className={`text-xs mb-2 line-clamp-2 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{product.description}</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-emerald-600 text-base">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className={`text-xs line-through ${app.dark ? 'text-slate-500' : 'text-slate-400'}`}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs ${product.stock > 5 ? 'text-emerald-500' : product.stock > 0 ? 'text-amber-500' : 'text-red-500'} font-medium`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
          <button
            onClick={() => app.addToCart(product)}
            disabled={product.stock <= 0}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, isActive, onClick, badge }: { icon: any, label: string, isActive: boolean, onClick: () => void, badge?: number }) {
  const app = useApp();
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
        isActive ? 'text-emerald-500 scale-110' : app.dark ? 'text-slate-500' : 'text-slate-400'
      }`}
    >
      <div className="relative">
        <Icon size={22} />
        {!!badge && badge > 0 && (
          <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center px-1 font-bold">{badge}</span>
        )}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

function CartDrawer({ cartSubtotal, deliveryFee, cartTotal, cartCount }: { cartSubtotal: number; deliveryFee: number; cartTotal: number; cartCount: number }) {
  const app = useApp();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: app.user?.username || '', email: app.user?.email || '', phone: app.user?.phone || '',
    address: app.user?.address || '', location: 'lower', pay: 'PayShap', comm: 'WhatsApp', notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (app.cart.length === 0) { app.showToast('Cart is empty', 'error'); return; }

    if (!app.user) {
      app.showToast('Please login or create an account to check out', 'error');
      app.setShowCart(false);
      app.setShowAccount(true);
      return;
    }

    setIsProcessing(true);
    const orderId = await app.finalizeOrder(formData);
    setIsProcessing(false);

    if (orderId) {
      app.setShowCart(false);
      if (formData.pay === 'Online Payment') {
        navigate(`/bank-confirm?order=${orderId}`);
      } else {
        navigate(`/tracker?order=${orderId}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { app.setShowCart(false); setShowCheckout(false); }} />
      <div className={`absolute bottom-0 left-0 right-0 max-h-[85vh] ${app.dark ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl overflow-hidden flex flex-col`}>
        {/* Cart Content */}
        {!showCheckout ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg flex items-center gap-2"><ShoppingCart size={22} /> Your Cart ({cartCount})</h3>
              <button onClick={() => app.setShowCart(false)} className="p-1"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {app.cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className={`mx-auto mb-4 ${app.dark ? 'text-slate-600' : 'text-slate-300'}`} />
                  <p className={app.dark ? 'text-slate-400' : 'text-slate-500'}>Your cart is empty</p>
                </div>
              ) : (
                app.cart.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-2xl mb-2 ${app.dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{item.title}</div>
                      <div className="text-emerald-500 font-bold text-sm">{formatPrice(item.price * item.qty)}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => app.updateQty(item.id, -1)} className={`w-7 h-7 rounded-full flex items-center justify-center ${app.dark ? 'bg-slate-700' : 'bg-slate-200'}`}><Minus size={14} /></button>
                      <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                      <button onClick={() => app.updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => app.removeFromCart(item.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>
            {app.cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm"><span className={app.dark ? 'text-slate-400' : 'text-slate-500'}>Subtotal</span><span className="font-semibold">{formatPrice(cartSubtotal)}</span></div>
                  {deliveryFee > 0 ? (
                    <div className="flex justify-between text-sm"><span className={app.dark ? 'text-slate-400' : 'text-slate-500'}>Delivery ({formData.location === 'upper' ? 'Upper' : 'Lower'} Campus)</span><span className="font-semibold">{formatPrice(deliveryFee)}</span></div>
                  ) : (
                    <div className="flex justify-between text-sm"><span className="text-emerald-500 font-medium">Delivery</span><span className="text-emerald-500 font-bold">FREE</span></div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Total</span><span className="text-emerald-500">{formatPrice(cartTotal)}</span>
                  </div>
                </div>
                {cartSubtotal < 150 && (
                  <div className={`text-xs p-2.5 rounded-xl ${app.dark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'} font-medium`}>
                    Add {formatPrice(150 - cartSubtotal)} more for FREE delivery!
                  </div>
                )}
                <button onClick={() => setShowCheckout(true)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base shadow-lg shadow-emerald-500/30">
                  Checkout <ArrowRight size={18} className="inline ml-1" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Checkout Form */
          <div className="flex-1 overflow-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Checkout</h3>
              <button onClick={() => setShowCheckout(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="space-y-3">
              <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
              <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
              <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
              <input type="text" placeholder="Res Name & Room Number" required value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />

              <div>
                <label className="text-xs font-medium mb-1.5 block opacity-70">Campus Location</label>
                <select value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value as 'lower' | 'upper' }))}
                  className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                  <option value="lower">Lower Campus (R{deliveryFee} delivery)</option>
                  <option value="upper">Upper Campus (R{deliveryFee} delivery)</option>
                </select>
              </div>

              <div className={`p-3 rounded-xl text-xs font-medium ${cartSubtotal >= 150 ? (app.dark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (app.dark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                {cartSubtotal >= 150 ? 'Delivery is FREE for orders over R150!' : `Delivery fee: R${formData.location === 'upper' ? '25' : '20'}. Add ${formatPrice(150 - cartSubtotal)} more for FREE delivery!`}
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block opacity-70">Payment Method</label>
                <select value={formData.pay} onChange={e => setFormData(p => ({ ...p, pay: e.target.value as 'PayShap' | 'Online Payment' }))}
                  className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                  <option value="PayShap">PayShap (0631917709)</option>
                  <option value="Online Payment">Online Payment (Bank Transfer)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block opacity-70">Communication</label>
                <select value={formData.comm} onChange={e => setFormData(p => ({ ...p, comm: e.target.value as any }))}
                  className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                  <option>WhatsApp</option>
                  <option>Phone Call</option>
                  <option>SMS</option>
                </select>
              </div>

              <textarea placeholder="Delivery notes (optional)" rows={2} value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm resize-none ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />

              <div className="pt-2">
                <div className="flex justify-between font-bold text-lg mb-3">
                  <span>Total</span><span className="text-emerald-500">{formatPrice(cartTotal)}</span>
                </div>
                <button type="submit" disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 disabled:opacity-70">
                  {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(cartTotal)}`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const app = useApp();
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => app.setShowNotifications(false)} />
      <div className={`absolute top-16 left-4 right-4 max-w-lg mx-auto max-h-[60vh] ${app.dark ? 'bg-slate-800' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold">Notifications</h3>
          <button onClick={() => app.setShowNotifications(false)}><X size={20} /></button>
        </div>
        <div className="overflow-auto max-h-[50vh]">
          {app.notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={32} className={`mx-auto mb-2 ${app.dark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`text-sm ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>No notifications yet</p>
            </div>
          ) : (
            app.notifications.map(n => (
              <button key={n.id} onClick={() => app.markNotificationRead(n.id)}
                className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700/50 transition-colors ${!n.read ? (app.dark ? 'bg-emerald-500/5' : 'bg-emerald-50/50') : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-emerald-500' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className={`text-xs mt-0.5 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{n.message}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AccountModal() {
  const app = useApp();
  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-sm ${app.dark ? 'bg-slate-800' : 'bg-white'} rounded-3xl p-6 shadow-2xl`}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
            <User size={28} className="text-white" />
          </div>
          <h3 className="font-bold text-xl">Welcome</h3>
          <p className={`text-sm mt-1 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to access your account</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => { app.setShowAccount(false); app.setShowLogin(true); }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center gap-2">
            <LogIn size={18} /> Login
          </button>
          <button onClick={() => { app.setShowAccount(false); app.setShowRegister(true); }}
            className={`w-full py-3.5 rounded-2xl border font-bold flex items-center justify-center gap-2 ${app.dark ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'} transition-colors`}>
            <UserPlus size={18} /> Create Account
          </button>
          <button onClick={() => app.setShowAccount(false)}
            className={`w-full py-3 text-sm font-medium ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersModal() {
  const app = useApp();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => app.setShowOrders(false)} />
      <div className={`absolute bottom-0 left-0 right-0 max-h-[80vh] ${app.dark ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2"><Package size={22} /> My Orders</h3>
          <button onClick={() => app.setShowOrders(false)}><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {app.orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className={`mx-auto mb-4 ${app.dark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={app.dark ? 'text-slate-400' : 'text-slate-500'}>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {app.orders.map(order => (
                <div key={order.id} className={`p-4 rounded-2xl ${app.dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm">{order.order_id}</p>
                      <p className={`text-xs ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>{order.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className={`text-sm mb-3 ${app.dark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {order.items.length} item(s) - {formatPrice(order.total)}
                  </div>
                  <button onClick={() => { app.setShowOrders(false); navigate(`/tracker?order=${order.order_id}`); }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold">
                    Track Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileModal() {
  const app = useApp();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: app.user?.username || '',
    email: app.user?.email || '',
    phone: app.user?.phone || '',
    address: app.user?.address || '',
  });

  const handleSave = () => {
    app.updateProfile(formData);
    setEditMode(false);
  };

  if (!app.user) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => app.setShowProfile(false)} />
      <div className={`absolute bottom-0 left-0 right-0 max-h-[85vh] ${app.dark ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2"><UserCircle size={22} /> Profile</h3>
          <button onClick={() => app.setShowProfile(false)}><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Profile Header */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl font-bold">{app.user.username.charAt(0).toUpperCase()}</span>
            </div>
            <h4 className="font-bold text-lg">{app.user.username}</h4>
            <p className={`text-sm ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>{app.user.email}</p>
          </div>

          {/* Edit Form */}
          {editMode ? (
            <div className="space-y-3">
              <input value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
              <input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
              <input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
              <input value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm">Save</button>
                <button onClick={() => setEditMode(false)} className={`flex-1 py-3 rounded-xl border font-bold text-sm ${app.dark ? 'border-slate-600' : 'border-slate-200'}`}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl p-4 space-y-3 ${app.dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3"><Mail size={16} className="text-slate-400" /> <span className="text-sm">{app.user.email}</span></div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-slate-400" /> <span className="text-sm">{app.user.phone}</span></div>
              <div className="flex items-center gap-3"><MapPin size={16} className="text-slate-400" /> <span className="text-sm">{app.user.address}</span></div>
              <button onClick={() => setEditMode(true)} className="w-full py-2.5 rounded-xl border text-sm font-bold mt-2">Edit Profile</button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            <button onClick={() => { app.setShowProfile(false); app.setShowOrders(true); }}
              className={`w-full p-4 rounded-2xl flex items-center justify-between ${app.dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <span className="flex items-center gap-3 font-medium"><Package size={18} /> My Orders</span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
            <button onClick={() => app.setShowTerms(true)}
              className={`w-full p-4 rounded-2xl flex items-center justify-between ${app.dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <span className="flex items-center gap-3 font-medium"><ScrollText size={18} /> Terms & Conditions</span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Danger Zone */}
          <div className={`rounded-2xl p-4 border ${app.dark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
            <h4 className="font-bold text-red-500 flex items-center gap-2 mb-3"><AlertTriangle size={16} /> Danger Zone</h4>
            {app.user.delete_requested_at ? (
              <div>
                <p className="text-sm mb-3">Account deletion requested. Will be deleted in 2 days.</p>
                <button onClick={app.cancelAccountDelete} className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm">
                  Cancel Deletion
                </button>
              </div>
            ) : (
              <button onClick={app.requestAccountDelete} className="w-full py-2.5 rounded-xl border border-red-300 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-colors">
                Delete Account
              </button>
            )}
          </div>

          {/* Logout */}
          <button onClick={() => { app.logout(); app.setShowProfile(false); }}
            className="w-full py-3.5 rounded-2xl border border-red-300 text-red-500 font-bold flex items-center justify-center gap-2">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ order }: { order: any }) {
  const app = useApp();
  const [productRatings, setProductRatings] = useState(order.items.map((item: any) => ({
    productId: item.id || '',
    productName: item.title,
    rating: 5,
    wouldRecommend: true,
  })));
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [recommendScore, setRecommendScore] = useState(8);

  const handleSubmit = () => {
    app.submitReview({
      order_id: order.order_id,
      product_ratings: productRatings,
      delivery_rating: deliveryRating,
      recommend_score: recommendScore,
    });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-sm ${app.dark ? 'bg-slate-800' : 'bg-white'} rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-auto`}>
        <h3 className="font-bold text-xl mb-1">Rate Your Order</h3>
        <p className={`text-sm mb-4 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>Order {order.order_id}</p>

        <div className="space-y-4 mb-6">
          {productRatings.map((pr: any, idx: number) => (
            <div key={idx} className={`p-3 rounded-xl ${app.dark ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <p className="font-medium text-sm mb-2">{pr.productName}</p>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => {
                    const newRatings = [...productRatings];
                    newRatings[idx].rating = star;
                    setProductRatings(newRatings);
                  }}>
                    <Star size={20} className={star <= pr.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Recommend?</span>
                <button onClick={() => {
                  const newRatings = [...productRatings];
                  newRatings[idx].wouldRecommend = !newRatings[idx].wouldRecommend;
                  setProductRatings(newRatings);
                }} className={`text-xs px-3 py-1 rounded-full font-bold ${pr.wouldRecommend ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {pr.wouldRecommend ? 'Yes' : 'No'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={`p-3 rounded-xl mb-4 ${app.dark ? 'bg-slate-700' : 'bg-slate-50'}`}>
          <p className="font-medium text-sm mb-2">Delivery Service</p>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setDeliveryRating(star)}>
                <Star size={20} className={star <= deliveryRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
              </button>
            ))}
          </div>
          <p className="text-xs mb-2">How likely are you to recommend us? (0-10)</p>
          <input type="range" min="0" max="10" value={recommendScore} onChange={e => setRecommendScore(Number(e.target.value))}
            className="w-full accent-emerald-500" />
          <p className="text-center font-bold text-emerald-500 mt-1">{recommendScore}/10</p>
        </div>

        <button onClick={handleSubmit} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">
          Submit Review
        </button>
      </div>
    </div>
  );
}

function TermsModal() {
  const app = useApp();
  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-sm ${app.dark ? 'bg-slate-800' : 'bg-white'} rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl flex items-center gap-2"><ScrollText size={22} /> Terms & Conditions</h3>
          <button onClick={() => app.setShowTerms(false)}><X size={24} /></button>
        </div>
        <div className={`text-sm space-y-3 ${app.dark ? 'text-slate-300' : 'text-slate-600'}`}>
          <p><strong>1. Orders:</strong> All orders are subject to product availability. Delivery takes 1-8 business days.</p>
          <p><strong>2. Delivery:</strong> Free delivery for orders above R150. Lower Campus R20, Upper Campus R25.</p>
          <p><strong>3. Payment:</strong> We accept PayShap (0631917709) and Online Payment (Account: 2081845985, MR Ragedi NG).</p>
          <p><strong>4. Returns:</strong> Items may be returned within 7 days if unused and in original packaging.</p>
          <p><strong>5. Delays:</strong> If delivery exceeds 9 business days, you will receive R50 off your next purchase.</p>
          <p><strong>6. Account:</strong> You are responsible for maintaining the confidentiality of your account.</p>
          <p><strong>7. Privacy:</strong> We collect your data solely for order processing and delivery.</p>
          <p><strong>8. Changes:</strong> We reserve the right to modify these terms at any time.</p>
        </div>
        <button onClick={() => app.setShowTerms(false)} className="w-full mt-4 py-3 rounded-2xl bg-emerald-500 text-white font-bold">
          I Understand
        </button>
      </div>
    </div>
  );
}
