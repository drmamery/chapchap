// ============================================================
//  ChapChap - Types TypeScript
// ============================================================

// --- Enums ---
export type UserRole = 'buyer' | 'seller' | 'admin' | 'courier';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'orange_money' | 'mtn_momo' | 'wave' | 'stripe' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type DeliveryStatus = 'unassigned' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
export type NotificationType = 'order' | 'message' | 'promotion' | 'security' | 'system' | 'review';
export type ShopStatus = 'active' | 'suspended' | 'pending_review' | 'closed';
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'deleted';

// --- Utilisateur ---
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  profile_pic?: string;
  is_verified: boolean;
  is_active: boolean;
  google_id?: string;
  preferences: UserPreferences;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  notifications: boolean;
  dark_mode: boolean;
  language: string;
}

export interface AuthUser extends User {
  access_token?: string;
}

// --- Catégorie ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
}

// --- Boutique ---
export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  category_id?: string;
  category?: Category;
  location: ShopLocation;
  contact: ShopContact;
  status: ShopStatus;
  is_verified: boolean;
  rating: number;
  review_count: number;
  total_sales: number;
  total_revenue: number;
  commission_rate: number;
  delivery_zones: string[];
  min_order_amount: number;
  estimated_delivery_time: string;
  owner?: User;
  products?: Product[];
  created_at: string;
  updated_at: string;
}

export interface ShopLocation {
  city: string;
  quarter: string;
  address: string;
  lat: number;
  lng: number;
}

export interface ShopContact {
  phone: string;
  whatsapp: string;
  email: string;
}

// --- Produit ---
export interface Product {
  id: string;
  shop_id: string;
  shop?: Shop;
  category_id?: string;
  category?: Category;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock: number;
  sku?: string;
  images: string[];
  thumbnail?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  tags: string[];
  attributes: Record<string, string | string[]>;
  status: ProductStatus;
  rating: number;
  review_count: number;
  view_count: number;
  order_count: number;
  is_featured: boolean;
  discount_percentage?: number;  // From active promotions
  created_at: string;
  updated_at: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

// --- Commande ---
export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  buyer?: User;
  shop_id: string;
  shop?: Shop;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  total_price: number;
  currency: string;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference?: string;
  shipping_address: ShippingAddress;
  tracking_code?: string;
  delivery_code?: string;
  notes?: string;
  promo_code?: string;
  estimated_delivery?: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  items?: OrderItem[];
  delivery?: Delivery;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  shop_id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
  attributes: Record<string, string>;
}

// --- Livraison ---
export interface Delivery {
  id: string;
  order_id: string;
  courier_id?: string;
  courier?: User;
  status: DeliveryStatus;
  pickup_address?: ShippingAddress;
  delivery_address: ShippingAddress;
  estimated_time?: string;
  actual_pickup_time?: string;
  actual_delivery_time?: string;
  gps_location?: GPSLocation;
  tracking_history: TrackingEvent[];
  delivery_photo?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GPSLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface TrackingEvent {
  status: DeliveryStatus;
  location?: string;
  message: string;
  timestamp: string;
}

// --- Paiement ---
export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  phone_number?: string;
  initiated_at: string;
  completed_at?: string;
  error_message?: string;
}

// --- Avis ---
export interface Review {
  id: string;
  user_id: string;
  user?: User;
  product_id?: string;
  product?: Product;
  shop_id?: string;
  shop?: Shop;
  order_id?: string;
  rating: number;
  comment?: string;
  images: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  reply?: string;
  reply_at?: string;
  is_visible: boolean;
  created_at: string;
}

// --- Panier ---
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  attributes: Record<string, string>;
  added_at: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  item_count: number;
  shops: {
    shop: Shop;
    items: CartItem[];
    subtotal: number;
  }[];
}

// --- Conversation & Messages ---
export interface Conversation {
  id: string;
  buyer_id: string;
  buyer?: User;
  seller_id: string;
  seller?: User;
  shop_id?: string;
  shop?: Shop;
  product_id?: string;
  product?: Product;
  order_id?: string;
  last_message?: string;
  last_message_at?: string;
  buyer_unread: number;
  seller_unread: number;
  is_active: boolean;
  messages?: Message[];
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: User;
  content: string;
  message_type: 'text' | 'image' | 'file';
  attachment_url?: string;
  is_read: boolean;
  read_at?: string;
  is_deleted: boolean;
  created_at: string;
}

// --- Notification ---
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  icon?: string;
  created_at: string;
}

// --- Promotion ---
export interface Promotion {
  id: string;
  shop_id?: string;
  product_id?: string;
  type: 'percentage' | 'fixed' | 'flash_sale';
  name: string;
  discount_percentage?: number;
  discount_amount?: number;
  min_order_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
}

// --- Admin ---
export interface AdminLog {
  id: string;
  admin_id: string;
  admin?: User;
  action: string;
  target_type?: string;
  target_id?: string;
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_sellers: number;
  total_buyers: number;
  total_shops: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  today_orders: number;
  today_revenue: number;
  pending_orders: number;
  monthly_revenue: MonthlyRevenue[];
  popular_categories: CategoryStat[];
  top_sellers: SellerStat[];
  order_status_distribution: OrderStatusStat[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryStat {
  name: string;
  count: number;
  revenue: number;
}

export interface SellerStat {
  shop: Shop;
  orders: number;
  revenue: number;
}

export interface OrderStatusStat {
  status: OrderStatus;
  count: number;
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// --- Formulaires ---
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone?: string;
  role: 'buyer' | 'seller';
  accept_terms: boolean;
}

export interface CreateShopForm {
  name: string;
  description: string;
  category_id: string;
  location: ShopLocation;
  contact: ShopContact;
}

export interface CreateProductForm {
  name: string;
  description: string;
  price: number;
  compare_price?: number;
  stock: number;
  category_id: string;
  tags: string[];
  images: File[];
  attributes: Record<string, string>;
}

export interface CheckoutForm {
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  phone_number?: string;  // Pour Mobile Money
  notes?: string;
  promo_code?: string;
}

// --- Filtres ---
export interface ProductFilters {
  query?: string;
  category_id?: string;
  shop_id?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  page?: number;
  limit?: number;
  tags?: string[];
  in_stock?: boolean;
  is_featured?: boolean;
  location?: string;
}

export interface ShopFilters {
  query?: string;
  category_id?: string;
  city?: string;
  min_rating?: number;
  sort_by?: 'rating' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}
