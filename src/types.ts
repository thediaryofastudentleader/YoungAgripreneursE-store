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

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  location?: 'lower' | 'upper';
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
}

export interface Review {
  id: string;
  order_id: string;
  product_id?: string;
  rating: number;
  comment: string;
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
