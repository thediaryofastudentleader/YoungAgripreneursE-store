import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getDeliveryFee, generateOrderId } from '@/lib/data';
import { signUp, signIn, signOut as authSignOut, fetchProfile, updateProfileRow, insertProfileFallback } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';
import type { Product, CartItem, FormData, User, Order, Review, Notification } from '@/types';
import HomePage from '@/pages/HomePage';
import TrackerPage from '@/pages/TrackerPage';
import BankConfirmPage from '@/pages/BankConfirmPage';
import ThankYouPage from '@/pages/ThankYouPage';
import AdminPage from '@/pages/AdminPage';
import { LoginModal, RegisterModal } from '@/components/AuthModals';
import './App.css';

interface AppContextType {
  // UI State
  dark: boolean;
  setDark: (v: boolean) => void;
  activeTab: string;
  setActiveTab: (v: string) => void;
  showCart: boolean;
  setShowCart: (v: boolean) => void;
  showAccount: boolean;
  setShowAccount: (v: boolean) => void;
  showOrders: boolean;
  setShowOrders: (v: boolean) => void;
  showProfile: boolean;
  setShowProfile: (v: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  showLogin: boolean;
  setShowLogin: (v: boolean) => void;
  showRegister: boolean;
  setShowRegister: (v: boolean) => void;
  showRecovery: boolean;
  setShowRecovery: (v: boolean) => void;
  showReview: boolean;
  setShowReview: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  showTerms: boolean;
  setShowTerms: (v: boolean) => void;

  // Auth
  authLoading: boolean;

  // Data State
  cart: CartItem[];
  liked: string[];
  notifications: Notification[];
  orders: Order[];
  user: User | null;
  pendingReviewOrder: Order | null;

  // Actions
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  toggleLike: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, phone: string, address: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  requestAccountDelete: () => Promise<void>;
  cancelAccountDelete: () => Promise<void>;
  finalizeOrder: (formData: FormData) => Promise<string | null>;
  refreshOrders: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  submitReview: (review: Omit<Review, 'id' | 'created_at'>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default function App() {

  // UI State
  const [dark, setDark] = useState(() => localStorage.getItem('yaf_dark') === 'true');
  const [activeTab, setActiveTab] = useState('home');
  const [showCart, setShowCart] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTerms, setShowTerms] = useState(false);

  // Auth
  const [authLoading, setAuthLoading] = useState(true);

  // Data State — cart/liked/notifications stay device-local; user and
  // orders now come from Supabase since every order needs a real account.
  const [cart, setCart] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem('yaf_cart') || '[]'));
  const [liked, setLiked] = useState<string[]>(() => JSON.parse(localStorage.getItem('yaf_liked') || '[]'));
  const [notifications, setNotifications] = useState<Notification[]>(() => JSON.parse(localStorage.getItem('yaf_notifications') || '[]'));
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [pendingReviewOrder, setPendingReviewOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Dark mode
  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('yaf_dark', dark.toString());
  }, [dark]);

  // Persist device-local state
  useEffect(() => { localStorage.setItem('yaf_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('yaf_liked', JSON.stringify(liked)); }, [liked]);
  useEffect(() => { localStorage.setItem('yaf_notifications', JSON.stringify(notifications)); }, [notifications]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Bootstrap Supabase Auth session + keep it in sync
  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return; }
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (active) setUser(profile);
      }
      if (active) setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (active) setUser(profile);
      } else if (active) {
        setUser(null);
      }
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!supabase || !user) { setOrders([]); return; }
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setOrders(data as unknown as Order[]);
  }, [user]);

  useEffect(() => { refreshOrders(); }, [refreshOrders]);

  // Check for pending reviews
  useEffect(() => {
    const checkReviews = () => {
      const completedOrders = orders.filter(o => o.status === 'delivered');
      for (const order of completedOrders) {
        const daysSince = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= 5 && daysSince <= 12) {
          const alreadyReviewed = JSON.parse(localStorage.getItem(`yaf_reviewed_${order.order_id}`) || 'false');
          if (!alreadyReviewed) {
            setPendingReviewOrder(order);
            setShowReview(true);
            break;
          }
        }
      }
    };
    checkReviews();
    const interval = setInterval(checkReviews, 60000);
    return () => clearInterval(interval);
  }, [orders]);

  // Check account deletion
  useEffect(() => {
    if (user?.delete_requested_at) {
      const deleteDate = new Date(user.delete_requested_at);
      const now = new Date();
      if (now.getTime() - deleteDate.getTime() >= 2 * 24 * 60 * 60 * 1000) {
        (async () => {
          await authSignOut();
          setUser(null);
          showToast('Your account has been permanently deleted.', 'info');
        })();
      }
    }
  }, [user, showToast]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.title} added to cart`, 'success');
  }, [showToast]);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(c => c.id === id);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, qty: newQty } : c);
    });
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!supabase) { showToast('Store is not connected to the database yet.', 'error'); return false; }
    try {
      const result = await signIn(email, password);
      // FIX: signIn returns { user, session, weakPassword? } directly, not wrapped in { data, error }
      if (!result.user) { showToast('Invalid email or password', 'error'); return false; }
      const profile = await fetchProfile(result.user.id);
      setUser(profile);
      showToast(`Welcome back, ${profile?.username || 'friend'}!`, 'success');
      return true;
    } catch {
      showToast('Invalid email or password', 'error');
      return false;
    }
  }, [showToast]);

  const register = useCallback(async (username: string, email: string, phone: string, address: string, password: string): Promise<boolean> => {
    if (!supabase) { showToast('Store is not connected to the database yet.', 'error'); return false; }
    try {
      const { user: authUser } = await signUp(username, email, phone, address, password);
      if (!authUser) { showToast('Registration failed. Please try again.', 'error'); return false; }
      let profile = await fetchProfile(authUser.id);
      if (!profile) {
        profile = await insertProfileFallback(authUser.id, { username, email, phone, address });
      }
      setUser(profile);
      showToast('Account created successfully!', 'success');
      return true;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '';
      showToast(message.toLowerCase().includes('already') ? 'Email already registered' : 'Registration failed. Please try again.', 'error');
      return false;
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    await authSignOut();
    setUser(null);
    setOrders([]);
    setShowProfile(false);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await updateProfileRow(user.id, data);
      setUser(updated);
      showToast('Profile updated', 'success');
    } catch {
      showToast('Could not update profile', 'error');
    }
  }, [user, showToast]);

  const requestAccountDelete = useCallback(async () => {
    if (!user) return;
    await updateProfile({ delete_requested_at: new Date().toISOString() });
    showToast('Account deletion scheduled. You have 2 days to cancel.', 'info');
  }, [user, updateProfile, showToast]);

  const cancelAccountDelete = useCallback(async () => {
    if (!user) return;
    await updateProfile({ delete_requested_at: undefined });
    showToast('Account deletion cancelled', 'success');
  }, [user, updateProfile, showToast]);

  const finalizeOrder = useCallback(async (formData: FormData): Promise<string | null> => {
    if (!user) {
      showToast('Please create an account or login to place an order', 'error');
      return null;
    }
    if (!supabase) {
      showToast('Store is not connected to the database yet.', 'error');
      return null;
    }

    const orderId = generateOrderId();
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const deliveryFee = getDeliveryFee(subtotal, formData.location);
    const total = subtotal + deliveryFee;

    const order: Order = {
      id: orderId,
      order_id: orderId,
      user_id: user.id,
      customer_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      location: formData.location,
      items: [...cart],
      subtotal,
      delivery_fee: deliveryFee,
      total,
      payment_method: formData.pay,
      communication_method: formData.comm,
      notes: formData.notes,
      status: 'order_received',
      status_history: [{ status: 'order_received', time: new Date().toISOString() }],
      paid: false,
      created_at: new Date().toISOString(),
      payment_status: 'pending',
    };

    const { error } = await supabase.from('orders').insert({
      order_id: orderId,
      user_id: user.id,
      customer_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      location: formData.location,
      items: cart.map(i => ({ id: i.id, title: i.title, qty: i.qty, price: i.price, image: i.image })),
      subtotal,
      delivery_fee: deliveryFee,
      total,
      payment_method: formData.pay,
      communication_method: formData.comm,
      notes: formData.notes,
      status: 'order_received',
      status_history: [{ status: 'order_received', time: new Date().toISOString() }],
      paid: false,
      payment_status: 'pending',
    });

    if (error) {
      console.error('Failed to save order:', error);
      showToast('Could not place your order. Please try again.', 'error');
      return null;
    }

    setOrders(prev => [order, ...prev]);

    const notif: Notification = {
      id: `${Date.now()}`,
      title: 'Order Placed',
      message: `Order ${orderId} has been placed successfully.`,
      read: false,
      type: 'order',
      orderId,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    setCart([]);

    // Fire-and-forget: EmailJS confirmation with receipt + tracking link
    sendOrderConfirmationEmail(order);

    return orderId;
  }, [cart, user, showToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const submitReview = useCallback((review: Omit<Review, 'id' | 'created_at'>) => {
    const fullReview: Review = { ...review, id: `${Date.now()}`, created_at: new Date().toISOString() };
    const reviews: Review[] = JSON.parse(localStorage.getItem('yaf_reviews') || '[]');
    reviews.push(fullReview);
    localStorage.setItem('yaf_reviews', JSON.stringify(reviews));
    localStorage.setItem(`yaf_reviewed_${review.order_id}`, 'true');
    showToast('Thank you for your review!', 'success');
    setShowReview(false);
    setPendingReviewOrder(null);
  }, [showToast]);

  const ctx: AppContextType = {
    dark, setDark, activeTab, setActiveTab,
    showCart, setShowCart, showAccount, setShowAccount,
    showOrders, setShowOrders, showProfile, setShowProfile,
    showNotifications, setShowNotifications, showSearch, setShowSearch,
    showLogin, setShowLogin, showRegister, setShowRegister,
    showRecovery, setShowRecovery, showReview, setShowReview,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    showTerms, setShowTerms,
    authLoading,
    cart, liked, notifications, orders, user, pendingReviewOrder,
    addToCart, removeFromCart, updateQty, toggleLike,
    login, register, logout, updateProfile,
    requestAccountDelete, cancelAccountDelete,
    finalizeOrder, refreshOrders, markNotificationRead, submitReview, showToast,
  };

  return (
    <AppContext.Provider value={ctx}>
      <div className={dark ? 'dark' : ''}>
        <div className="min-h-screen bg-background text-foreground transition-colors">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/bank-confirm" element={<BankConfirmPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>

        {/* Rendered globally so any page (tracker, bank-confirm, admin…)
            can trigger login/register via app.setShowLogin/setShowRegister */}
        {showLogin && <LoginModal />}
        {showRegister && <RegisterModal />}

        {toast && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-xl shadow-lg font-medium text-sm transition-all ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-slate-800 text-white'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
