-- ============================================================
--  ChapChap Database Schema - PostgreSQL / Supabase
--  Marketplace Multi-Vendeur - Bouaké, Côte d'Ivoire
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Full-text search
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- Search sans accents

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin', 'courier');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_method AS ENUM ('orange_money', 'mtn_momo', 'wave', 'stripe', 'cash_on_delivery');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE delivery_status AS ENUM ('unassigned', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed');
CREATE TYPE notification_type AS ENUM ('order', 'message', 'promotion', 'security', 'system', 'review');
CREATE TYPE shop_status AS ENUM ('active', 'suspended', 'pending_review', 'closed');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out_of_stock', 'deleted');

-- ============================================================
-- TABLES PRINCIPALES
-- ============================================================

-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),  -- NULL si OAuth uniquement
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role user_role DEFAULT 'buyer',
  profile_pic TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  verification_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_token_expires TIMESTAMPTZ,
  google_id VARCHAR(255) UNIQUE,
  push_subscription JSONB,  -- Web Push subscription
  preferences JSONB DEFAULT '{"notifications": true, "dark_mode": false, "language": "fr"}',
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  failed_login_count INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Catégories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  image TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boutiques
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  logo TEXT,
  banner TEXT,
  category_id UUID REFERENCES categories(id),
  location JSONB DEFAULT '{"city": "Bouaké", "quarter": "", "address": "", "lat": 7.6897, "lng": -5.0312}',
  contact JSONB DEFAULT '{"phone": "", "whatsapp": "", "email": ""}',
  status shop_status DEFAULT 'pending_review',
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,  -- % ChapChap prend
  delivery_zones JSONB DEFAULT '[]',
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  estimated_delivery_time VARCHAR(50) DEFAULT '24-48h',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shops_owner ON shops(owner_id);
CREATE INDEX idx_shops_status ON shops(status);
CREATE INDEX idx_shops_name_search ON shops USING gin(name gin_trgm_ops);

-- Produits
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),  -- Prix barré
  cost_price DECIMAL(10,2),  -- Prix d'achat (vendeur)
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  images JSONB DEFAULT '[]',  -- Array d'URLs
  thumbnail TEXT,
  weight DECIMAL(8,2),  -- kg
  dimensions JSONB DEFAULT '{"length": 0, "width": 0, "height": 0}',
  tags TEXT[] DEFAULT '{}',
  attributes JSONB DEFAULT '{}',  -- couleur, taille, etc.
  status product_status DEFAULT 'active',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  requires_shipping BOOLEAN DEFAULT TRUE,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, slug)
);

CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_search ON products USING gin(search_vector);
CREATE INDEX idx_products_name_search ON products USING gin(name gin_trgm_ops);

-- Mise à jour automatique du vecteur de recherche
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('french', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_search
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Commandes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  buyer_id UUID REFERENCES users(id),
  shop_id UUID REFERENCES shops(id),
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  payment_method payment_method,
  payment_status payment_status DEFAULT 'pending',
  payment_reference VARCHAR(255),
  shipping_address JSONB NOT NULL,
  tracking_code VARCHAR(20) UNIQUE,
  delivery_code VARCHAR(6),  -- Code secret confirmation livraison
  notes TEXT,
  promo_code VARCHAR(50),
  estimated_delivery TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_tracking ON orders(tracking_code);

-- Articles de commande
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  shop_id UUID REFERENCES shops(id),
  name VARCHAR(200) NOT NULL,  -- Snapshot nom produit
  image TEXT,  -- Snapshot image
  price DECIMAL(10,2) NOT NULL,  -- Prix au moment de l'achat
  quantity INTEGER NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  attributes JSONB DEFAULT '{}',  -- couleur, taille choisies
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Livraison
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  courier_id UUID REFERENCES users(id),
  status delivery_status DEFAULT 'unassigned',
  pickup_address JSONB,
  delivery_address JSONB NOT NULL,
  estimated_time VARCHAR(50),
  actual_pickup_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  gps_location JSONB,  -- {lat, lng, timestamp}
  tracking_history JSONB DEFAULT '[]',
  delivery_photo TEXT,  -- Photo confirmation livraison
  signature TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paiements
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  reference VARCHAR(255),  -- ID externe (Stripe, Orange Money, etc.)
  provider_data JSONB DEFAULT '{}',
  phone_number VARCHAR(20),  -- Pour Mobile Money
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Avis et notations
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  shop_id UUID REFERENCES shops(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  images JSONB DEFAULT '[]',
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  reply TEXT,  -- Réponse du vendeur
  reply_at TIMESTAMPTZ,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_shop ON reviews(shop_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Panier
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  attributes JSONB DEFAULT '{}',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Favoris / Wishlist
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Chat / Messages
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  shop_id UUID REFERENCES shops(id),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  buyer_unread INTEGER DEFAULT 0,
  seller_unread INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  content_encrypted TEXT,  -- Version chiffrée
  message_type VARCHAR(20) DEFAULT 'text',  -- text, image, file
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',  -- Données contextuelles
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- Promotions
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id),
  product_id UUID REFERENCES products(id),
  type VARCHAR(20) DEFAULT 'percentage',  -- percentage, fixed, flash_sale
  name VARCHAR(100) NOT NULL,
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Codes promo
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  shop_id UUID REFERENCES shops(id),  -- NULL = global ChapChap
  discount_type VARCHAR(20) DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs admin
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),  -- user, shop, product, order
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);

-- Logs sécurité
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,  -- login_success, login_fail, password_reset, etc.
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  details JSONB DEFAULT '{}',
  severity VARCHAR(20) DEFAULT 'info',  -- info, warning, critical
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_logs_user ON security_logs(user_id);
CREATE INDEX idx_security_logs_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_severity ON security_logs(severity);

-- Historique navigation
CREATE TABLE product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  session_id VARCHAR(100),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recherches
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  query VARCHAR(255) NOT NULL,
  results_count INTEGER DEFAULT 0,
  clicked_product UUID REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions financières (comptabilité)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  shop_id UUID REFERENCES shops(id),
  buyer_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  seller_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  status VARCHAR(20) DEFAULT 'pending',
  payout_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================

-- Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Générer numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'CC-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(NEXTVAL('order_seq')::TEXT, 5, '0');
  NEW.tracking_code = 'TRK' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 8));
  NEW.delivery_code = LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_seq START 1;
CREATE TRIGGER trigger_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Mettre à jour la note moyenne des produits
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET 
    rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id AND is_visible = TRUE),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_visible = TRUE)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_rating AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Mettre à jour la note moyenne des boutiques
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shops SET 
    rating = (SELECT AVG(rating) FROM reviews WHERE shop_id = NEW.shop_id AND is_visible = TRUE),
    review_count = (SELECT COUNT(*) FROM reviews WHERE shop_id = NEW.shop_id AND is_visible = TRUE)
  WHERE id = NEW.shop_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shop_rating AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_shop_rating();

-- Décrémenter stock après commande
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
  UPDATE products SET order_count = order_count + 1 WHERE id = NEW.product_id;
  IF (SELECT stock FROM products WHERE id = NEW.product_id) <= 0 THEN
    UPDATE products SET status = 'out_of_stock' WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_stock AFTER INSERT ON order_items FOR EACH ROW EXECUTE FUNCTION decrement_product_stock();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques utilisateurs
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id OR role = 'admin');
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- Politiques boutiques (publiques en lecture)
CREATE POLICY "shops_select_all" ON shops FOR SELECT USING (status = 'active' OR owner_id = auth.uid());
CREATE POLICY "shops_insert_seller" ON shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "shops_update_owner" ON shops FOR UPDATE USING (auth.uid() = owner_id);

-- Politiques produits
CREATE POLICY "products_select_all" ON products FOR SELECT USING (status = 'active' OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "products_manage_seller" ON products FOR ALL USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- Politiques commandes
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (buyer_id = auth.uid() OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "orders_insert_buyer" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Panier privé
CREATE POLICY "cart_own" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Wishlist privée
CREATE POLICY "wishlist_own" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- Notifications privées
CREATE POLICY "notifications_own" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "messages_conversation" ON messages FOR SELECT USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
  )
);
