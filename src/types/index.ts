export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  trending?: boolean;
  new?: boolean;
  special?: boolean;
  rating: number;
  reviews: number;
  /** Available sizes for apparel/footwear — shown in the product detail modal. */
  sizes?: string[];
}

export interface CartItem extends Product {
  qty: number;
  /** Size chosen by the customer for sized items (clothes, shoes, bras…). */
  selectedSize?: string;
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  location: 'lower' | 'upper';
  pay: string;
  comm: string;
  notes: string;
}

// Backed by Supabase Auth + the `profiles` table now — no password
// field, since Supabase Auth owns credentials.
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  location?: 'lower' | 'upper';
  is_admin?: boolean;
  /** 'customer' | 'admin' | 'driver' — mirrors the profiles.role column. */
  role?: string;
  /** Display label for delivery staff, e.g. 'Driver 1'. */
  driver_label?: string;
  created_at: string;
  delete_requested_at?: string | null;
}

export interface OrderStatusHistoryItem {
  status: string;
  time: string;
}

export interface Order {
  id: string;
  order_id: string;
  user_id?: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  location: 'lower' | 'upper';
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  communication_method: string;
  notes: string;
  status: string;
  status_history: OrderStatusHistoryItem[];
  paid: boolean;
  created_at: string;
  payment_status: string;
  has_new_chat?: boolean;
  /** UUID of the profiles row for the assigned delivery person (admin or driver). */
  assigned_driver?: string | null;
  /** Snapshot label shown to the customer, e.g. 'Admin', 'Driver 1', 'Driver 2'. */
  assigned_driver_label?: string | null;
  /** Register call (CEO supplier-stock verification) state. */
  review_status?: 'pending' | 'awaiting_customer' | 'approved';
  review_due_at?: string;
  reviewed_at?: string | null;
  /** Confirmed totals after the register call (customer pays these). */
  net_subtotal?: number | null;
  net_total?: number | null;
  driver_accepted?: boolean;
}

/** One line of the CEO's register call on an order. */
export interface OrderItemReview {
  id: string;
  order_id: string;
  item_index: number;
  title: string;
  requested_size?: string | null;
  status: 'pending' | 'confirmed' | 'size_mismatch' | 'unavailable';
  offered_sizes?: string[] | null;
  customer_choice?: string | null;
  resolved_at?: string | null;
}

/** Dr. Vogue's weekly special draft awaiting CEO approval. */
export interface VogueDraft {
  id: string;
  created_at: string;
  product_id: string;
  discount_percent: number;
  rationale?: string | null;
  status: 'pending' | 'approved' | 'dismissed';
}

export interface ProductRating {
  productId: string;
  productName: string;
  rating: number;
  wouldRecommend: boolean;
}

export interface Review {
  id: string;
  order_id: string;
  product_ratings: ProductRating[];
  delivery_rating: number;
  recommend_score: number;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  orderId?: string;
  created_at: string;
}

export interface ProductSpecial {
  id: string;
  product_id: string;
  discount_percent: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id?: string;
  order_id: string;
  sender_id?: string | null;
  sender_name: string;
  sender_role: 'customer' | 'admin';
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ProofOfPayment {
  id: string;
  order_id: string;
  file_path?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
}
