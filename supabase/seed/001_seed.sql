-- ============================================================
--  ChapChap - Données de Seed
--  Données initiales pour tests et démonstration
-- ============================================================

-- ============================================================
-- CATÉGORIES
-- ============================================================

INSERT INTO categories (id, name, slug, description, icon, sort_order) VALUES
  ('cat-001', 'Électronique', 'electronique', 'Téléphones, ordinateurs, accessoires tech', '📱', 1),
  ('cat-002', 'Mode & Vêtements', 'mode-vetements', 'Tenues africaines, wax, mode internationale', '👗', 2),
  ('cat-003', 'Alimentation', 'alimentation', 'Vivres, épices, boissons locales', '🥘', 3),
  ('cat-004', 'Beauté & Santé', 'beaute-sante', 'Cosmétiques, soins, pharmacie', '💄', 4),
  ('cat-005', 'Maison & Déco', 'maison-deco', 'Mobilier, décoration, articles ménagers', '🏠', 5),
  ('cat-006', 'Auto & Moto', 'auto-moto', 'Pièces auto, accessoires, véhicules', '🚗', 6),
  ('cat-007', 'Agriculture', 'agriculture', 'Semences, outils, produits agricoles', '🌾', 7),
  ('cat-008', 'Bâtiment & Construction', 'batiment', 'Matériaux, outils, quincaillerie', '🔨', 8),
  ('cat-009', 'Sport & Loisirs', 'sport-loisirs', 'Équipements sportifs, jeux, divertissement', '⚽', 9),
  ('cat-010', 'Enfants & Bébé', 'enfants-bebe', 'Jouets, vêtements enfants, puériculture', '🧸', 10),
  ('cat-011', 'Livres & Éducation', 'livres-education', 'Manuels scolaires, livres, fournitures', '📚', 11),
  ('cat-012', 'Services', 'services', 'Livraison, réparation, consultation', '🛠️', 12);

-- Sous-catégories Électronique
INSERT INTO categories (id, name, slug, description, icon, parent_id, sort_order) VALUES
  ('cat-001-1', 'Téléphones', 'telephones', 'Smartphones et téléphones', '📱', 'cat-001', 1),
  ('cat-001-2', 'Ordinateurs', 'ordinateurs', 'Laptops, desktops, tablettes', '💻', 'cat-001', 2),
  ('cat-001-3', 'Accessoires Tech', 'accessoires-tech', 'Câbles, chargeurs, housses', '🔌', 'cat-001', 3),
  ('cat-001-4', 'TV & Audio', 'tv-audio', 'Télévisions, enceintes, écouteurs', '📺', 'cat-001', 4);

-- ============================================================
-- ADMIN USER
-- ============================================================

INSERT INTO users (id, email, name, role, is_verified, is_active, google_id) VALUES
  ('admin-001', 'dr.mamery@gmail.com', 'Dr. Mamery Admin', 'admin', TRUE, TRUE, '474335933735');

-- ============================================================
-- UTILISATEURS TEST
-- ============================================================

-- Mot de passe pour tous: "ChapChap2024!" (hashé avec bcrypt)
INSERT INTO users (id, email, password_hash, name, phone, role, is_verified, is_active) VALUES
  ('user-001', 'vendeur1@chapchap.ci', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMjeizHkFnSLbMFmJPP', 'Koné Amadou', '+225 07 12 34 56', 'seller', TRUE, TRUE),
  ('user-002', 'vendeur2@chapchap.ci', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMjeizHkFnSLbMFmJPP', 'Traoré Fatou', '+225 05 98 76 54', 'seller', TRUE, TRUE),
  ('user-003', 'vendeur3@chapchap.ci', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMjeizHkFnSLbMFmJPP', 'Coulibaly Ibrahim', '+225 01 23 45 67', 'seller', TRUE, TRUE),
  ('user-004', 'acheteur1@chapchap.ci', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMjeizHkFnSLbMFmJPP', 'Diabaté Marie', '+225 07 11 22 33', 'buyer', TRUE, TRUE),
  ('user-005', 'acheteur2@chapchap.ci', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMjeizHkFnSLbMFmJPP', 'Ouattara Jean', '+225 05 44 55 66', 'buyer', TRUE, TRUE),
  ('user-006', 'livreur1@chapchap.ci', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMjeizHkFnSLbMFmJPP', 'Bamba Seydou', '+225 01 77 88 99', 'courier', TRUE, TRUE);

-- ============================================================
-- BOUTIQUES
-- ============================================================

INSERT INTO shops (id, owner_id, name, slug, description, category_id, status, is_verified, rating, review_count, location, contact) VALUES
  ('shop-001', 'user-001', 'TechZone Bouaké', 'techzone-bouake', 
   'Votre spécialiste en électronique à Bouaké. Smartphones, accessoires, réparations. Produits garantis et service après-vente assuré.', 
   'cat-001', 'active', TRUE, 4.7, 89,
   '{"city": "Bouaké", "quarter": "Commerce", "address": "Rue du Commerce, face à la mairie", "lat": 7.6921, "lng": -5.0338}',
   '{"phone": "+225 07 12 34 56", "whatsapp": "+225 07 12 34 56", "email": "techzone@chapchap.ci"}'),
  
  ('shop-002', 'user-002', 'Fashion Wax by Fatou', 'fashion-wax-fatou', 
   'Créatrice de mode ivoirienne. Pagnes wax, tenues africaines modernes, couture sur mesure. Envoi dans toute la Côte d''Ivoire.', 
   'cat-002', 'active', TRUE, 4.9, 156,
   '{"city": "Bouaké", "quarter": "Koko", "address": "Marché de Koko, stand 34", "lat": 7.6875, "lng": -5.0291}',
   '{"phone": "+225 05 98 76 54", "whatsapp": "+225 05 98 76 54", "email": "fatou.wax@chapchap.ci"}'),
  
  ('shop-003', 'user-003', 'Saveurs du Centre', 'saveurs-du-centre', 
   'Épicerie locale, produits frais, épices ivoiriennes. Vivres locaux de qualité. Livraison express dans Bouaké.', 
   'cat-003', 'active', TRUE, 4.5, 67,
   '{"city": "Bouaké", "quarter": "Kennedy", "address": "Avenue Kennedy, à côté du marché central", "lat": 7.6935, "lng": -5.0312}',
   '{"phone": "+225 01 23 45 67", "whatsapp": "+225 01 23 45 67", "email": "saveurs@chapchap.ci"}');

-- ============================================================
-- PRODUITS
-- ============================================================

INSERT INTO products (id, shop_id, category_id, name, slug, description, price, compare_price, stock, images, thumbnail, tags, rating, review_count, is_featured) VALUES

-- TechZone Bouaké
('prod-001', 'shop-001', 'cat-001-1', 
 'Samsung Galaxy A55 5G - 128Go', 'samsung-galaxy-a55-5g-128go',
 'Smartphone Samsung Galaxy A55 5G avec 8Go RAM, 128Go stockage, triple caméra 50MP, batterie 5000mAh. Garantie 1 an. Neuf sous emballage.',
 285000, 320000, 15,
 '["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800", "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800"]',
 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
 ARRAY['samsung', 'smartphone', '5g', 'android', 'téléphone'],
 4.6, 23, TRUE),

('prod-002', 'shop-001', 'cat-001-1',
 'iPhone 15 - 128Go Noir', 'iphone-15-128go-noir',
 'Apple iPhone 15, 128Go, Puce A16 Bionic, Dynamic Island, USB-C. Caméra 48MP. Neuf, scellé, garantie Apple 1 an.',
 520000, 580000, 8,
 '["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"]',
 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
 ARRAY['iphone', 'apple', 'smartphone', 'ios'],
 4.8, 12, TRUE),

('prod-003', 'shop-001', 'cat-001-2',
 'Laptop Asus VivoBook 15 - Core i5', 'asus-vivobook-15-core-i5',
 'Ordinateur portable Asus VivoBook 15.6", Intel Core i5 12ème génération, 16Go RAM, SSD 512Go, Windows 11. Idéal pour étudiants et professionnels.',
 420000, 480000, 5,
 '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"]',
 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
 ARRAY['laptop', 'ordinateur', 'asus', 'intel', 'windows'],
 4.5, 8, FALSE),

('prod-004', 'shop-001', 'cat-001-3',
 'Chargeur Rapide 65W USB-C', 'chargeur-rapide-65w-usbc',
 'Chargeur rapide 65W compatible tous smartphones USB-C. Charge votre téléphone en 30 minutes. Compatible Samsung, Huawei, Xiaomi, iPhone.',
 8500, 12000, 50,
 '["https://images.unsplash.com/photo-1593941707882-a5bfad826e3?w=800"]',
 'https://images.unsplash.com/photo-1593941707882-a5bfad826e3?w=400',
 ARRAY['chargeur', 'usb-c', 'rapide', 'accessoire'],
 4.3, 45, FALSE),

-- Fashion Wax by Fatou
('prod-005', 'shop-002', 'cat-002',
 'Robe Pagne Wax Africain - Taille 40-46', 'robe-pagne-wax-africain',
 'Magnifique robe en pagne wax 100% coton, fabrication ivoirienne. Disponible en plusieurs motifs. Couture soignée, finition impeccable. Personnalisable sur mesure.',
 35000, 45000, 30,
 '["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800", "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800"]',
 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
 ARRAY['robe', 'wax', 'pagne', 'africain', 'ivoirien', 'couture'],
 4.9, 67, TRUE),

('prod-006', 'shop-002', 'cat-002',
 'Ensemble Boubou Grand Bazin - Homme', 'ensemble-boubou-grand-bazin',
 'Grand boubou en bazin riche pour homme. Tissu brodé de qualité supérieure. Idéal mariages, cérémonies, fêtes. Disponible en bleu, blanc, vert.',
 55000, 70000, 20,
 '["https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=800"]',
 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=400',
 ARRAY['boubou', 'bazin', 'homme', 'cérémonie', 'mariage'],
 4.8, 34, TRUE),

-- Saveurs du Centre
('prod-007', 'shop-003', 'cat-003',
 'Attiéké Frais - 1kg', 'attieke-frais-1kg',
 'Attiéké frais de qualité, préparé artisanalement. Livré frais le jour même. 1kg suffit pour 4-6 personnes. Idéal avec poisson braisé, alloco, viande.',
 1500, NULL, 200,
 '["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"]',
 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
 ARRAY['attiéké', 'ivoirien', 'alimentaire', 'frais'],
 4.7, 89, TRUE),

('prod-008', 'shop-003', 'cat-003',
 'Huile de palme rouge - Bidon 5L', 'huile-palme-rouge-5l',
 'Huile de palme rouge pure, non raffinée. Riche en vitamines. Extraite artisanalement dans la région. Idéale pour cuisine africaine authentique.',
 6500, 8000, 100,
 '["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800"]',
 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
 ARRAY['huile', 'palme', 'cuisine', 'ivoirien'],
 4.6, 44, FALSE),

('prod-009', 'shop-003', 'cat-003',
 'Épices Mélange Ivoirien - 250g', 'epices-melange-ivoirien',
 'Mélange d''épices authentiques ivoiriennes: poivre de Guinée, gingembre, cubèbe. Parfait pour le gnangnan, le kedjenou et la cuisine locale.',
 2500, 3000, 150,
 '["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800"]',
 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
 ARRAY['épices', 'ivoirien', 'cuisine', 'condiment'],
 4.8, 28, FALSE);

-- ============================================================
-- PROMOTIONS (Ventes flash)
-- ============================================================

INSERT INTO promotions (shop_id, product_id, type, name, discount_percentage, start_date, end_date, is_active) VALUES
  ('shop-001', 'prod-001', 'flash_sale', 'Vente Flash Samsung', 10, NOW(), NOW() + INTERVAL '2 days', TRUE),
  ('shop-002', 'prod-005', 'percentage', 'Promo Spéciale Fête', 15, NOW(), NOW() + INTERVAL '7 days', TRUE),
  ('shop-003', 'prod-007', 'percentage', 'Promo Weekend', 5, NOW(), NOW() + INTERVAL '3 days', TRUE);

-- ============================================================
-- CODES PROMO
-- ============================================================

INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, is_active, created_by) VALUES
  ('CHAPCHAP10', 'percentage', 10, 5000, 100, NOW(), NOW() + INTERVAL '30 days', TRUE, 'admin-001'),
  ('BIENVENUE', 'fixed', 2000, 10000, 500, NOW(), NOW() + INTERVAL '90 days', TRUE, 'admin-001'),
  ('BOUAKE2024', 'percentage', 15, 20000, 50, NOW(), NOW() + INTERVAL '7 days', TRUE, 'admin-001');

-- ============================================================
-- COMMANDES TEST
-- ============================================================

INSERT INTO orders (id, buyer_id, shop_id, status, subtotal, shipping_fee, total_price, currency, payment_method, payment_status, shipping_address, tracking_code, delivery_code, confirmed_at) VALUES
  ('order-001', 'user-004', 'shop-001', 'delivered', 285000, 2000, 287000, 'XOF', 'orange_money', 'completed',
   '{"name": "Diabaté Marie", "phone": "+225 07 11 22 33", "address": "Quartier Nimbo, Rue 12", "city": "Bouaké", "lat": 7.6901, "lng": -5.0321}',
   'TRKORDER001', '123456', NOW() - INTERVAL '5 days'),
  
  ('order-002', 'user-005', 'shop-002', 'shipped', 35000, 1500, 36500, 'XOF', 'wave', 'completed',
   '{"name": "Ouattara Jean", "phone": "+225 05 44 55 66", "address": "Yao Sékré, Avenue Principale", "city": "Bouaké", "lat": 7.6856, "lng": -5.0267}',
   'TRKORDER002', '654321', NOW() - INTERVAL '2 days'),

  ('order-003', 'user-004', 'shop-003', 'pending', 8500, 500, 9000, 'XOF', 'mtn_momo', 'pending',
   '{"name": "Diabaté Marie", "phone": "+225 07 11 22 33", "address": "Quartier Nimbo, Rue 12", "city": "Bouaké", "lat": 7.6901, "lng": -5.0321}',
   'TRKORDER003', '789012', NULL);

INSERT INTO order_items (order_id, product_id, shop_id, name, image, price, quantity, total) VALUES
  ('order-001', 'prod-001', 'shop-001', 'Samsung Galaxy A55 5G - 128Go', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', 285000, 1, 285000),
  ('order-002', 'prod-005', 'shop-002', 'Robe Pagne Wax Africain - Taille 40-46', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', 35000, 1, 35000),
  ('order-003', 'prod-007', 'shop-003', 'Attiéké Frais - 1kg', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 1500, 3, 4500),
  ('order-003', 'prod-009', 'shop-003', 'Épices Mélange Ivoirien - 250g', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 2500, 1, 2500);

-- ============================================================
-- AVIS ET NOTATIONS
-- ============================================================

INSERT INTO reviews (user_id, product_id, shop_id, order_id, rating, comment, is_verified_purchase, is_visible) VALUES
  ('user-004', 'prod-001', 'shop-001', 'order-001', 5, 'Excellent téléphone ! Livraison rapide, vendeur sérieux. Le Samsung est exactement comme décrit. Je recommande TechZone !', TRUE, TRUE),
  ('user-005', 'prod-005', 'shop-002', 'order-002', 5, 'La robe est magnifique ! La qualité du pagne est top, la couture est parfaite. Fatou est très professionnelle. Je reviendrai !', TRUE, TRUE),
  ('user-004', 'prod-007', 'shop-003', 'order-003', 4, 'L''attiéké est très frais et bon goût. Livraison dans les délais. Je recommande !', TRUE, TRUE);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

INSERT INTO notifications (user_id, type, title, message, data, action_url) VALUES
  ('user-001', 'order', 'Nouvelle commande reçue !', 'Vous avez reçu une nouvelle commande de 285 000 FCFA', '{"order_id": "order-001"}', '/seller/orders/order-001'),
  ('user-004', 'order', 'Commande confirmée', 'Votre commande CC-202501-00001 a été confirmée', '{"order_id": "order-001"}', '/buyer/orders/order-001'),
  ('user-004', 'order', 'Commande livrée', 'Votre commande CC-202501-00001 a été livrée. Merci de votre confiance !', '{"order_id": "order-001"}', '/buyer/orders/order-001'),
  ('user-001', 'system', 'Bienvenue sur ChapChap !', 'Votre boutique TechZone Bouaké a été approuvée. Bonne vente !', '{}', '/seller/dashboard');

-- ============================================================
-- ADMIN LOGS
-- ============================================================

INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address) VALUES
  ('admin-001', 'shop_approved', 'shop', 'shop-001', '{"shop_name": "TechZone Bouaké", "reason": "Documents valides"}', '197.234.218.1'),
  ('admin-001', 'shop_approved', 'shop', 'shop-002', '{"shop_name": "Fashion Wax by Fatou", "reason": "Vérification identité OK"}', '197.234.218.1'),
  ('admin-001', 'promo_created', 'promo', NULL, '{"code": "CHAPCHAP10", "discount": "10%"}', '197.234.218.1');

-- ============================================================
-- PAIEMENTS
-- ============================================================

INSERT INTO payments (order_id, user_id, amount, currency, method, status, reference, completed_at) VALUES
  ('order-001', 'user-004', 287000, 'XOF', 'orange_money', 'completed', 'OM-CI-2024-001', NOW() - INTERVAL '5 days'),
  ('order-002', 'user-005', 36500, 'XOF', 'wave', 'completed', 'WAVE-2024-001', NOW() - INTERVAL '2 days');
