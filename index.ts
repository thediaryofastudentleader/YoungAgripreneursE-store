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
}

export interface CartItem extends Product {
  qty: number;
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
  created_at: string;
  delete_requested_at?: string;
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
