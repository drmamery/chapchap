# 🛒 ChapChap — Marketplace Multi-Vendeur de Bouaké

> La première marketplace e-commerce de Bouaké, Côte d'Ivoire. Conçue pour rivaliser avec Jumia CI.

![ChapChap Banner](public/og-image.jpg)

---

## 🚀 Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | Next.js 14 (App Router) + React 18 |
| **Styles** | TailwindCSS + CSS Variables |
| **Animations** | Framer Motion |
| **Backend** | Next.js API Routes (Node.js) |
| **Base de données** | PostgreSQL via Supabase |
| **Auth** | Supabase Auth + JWT + Google OAuth (admin) |
| **Stockage** | Supabase Storage |
| **Paiement** | Orange Money CI · MTN MoMo · Wave · Stripe |
| **Emails** | Nodemailer (SMTP Gmail) |
| **Push Notifs** | Web Push (VAPID) |
| **Temps réel** | Supabase Realtime (WebSockets) |
| **State** | Zustand + React Query |
| **Graphiques** | Recharts |
| **Cartes** | Mapbox GL |
| **Déploiement** | Vercel / Netlify |

---

## 📁 Structure du Projet

```
chapchap/
├── src/
│   ├── app/                          # Pages Next.js (App Router)
│   │   ├── page.tsx                  # Accueil
│   │   ├── layout.tsx                # Layout racine
│   │   ├── products/                 # Catalogue produits
│   │   │   ├── page.tsx              # Liste produits avec filtres
│   │   │   └── [id]/page.tsx         # Détail produit
│   │   ├── shops/                    # Boutiques
│   │   ├── cart/page.tsx             # Panier
│   │   ├── checkout/page.tsx         # Commande + paiement
│   │   ├── messages/page.tsx         # Chat temps réel
│   │   ├── auth/                     # Authentification
│   │   │   ├── login/page.tsx        # Connexion + Google OAuth
│   │   │   ├── register/page.tsx     # Inscription
│   │   │   └── verify/page.tsx       # Vérification email
│   │   ├── buyer/                    # Espace acheteur
│   │   │   ├── orders/               # Commandes
│   │   │   ├── wishlist/             # Favoris
│   │   │   ├── profile/              # Profil
│   │   │   └── notifications/        # Notifications
│   │   ├── seller/                   # Espace vendeur
│   │   │   ├── dashboard/            # Tableau de bord
│   │   │   ├── products/             # Gestion produits
│   │   │   ├── orders/               # Gestion commandes
│   │   │   ├── shop/                 # Configuration boutique
│   │   │   ├── analytics/            # Statistiques
│   │   │   └── promotions/           # Promotions & ventes flash
│   │   ├── admin/                    # Espace admin (Google OAuth requis)
│   │   │   ├── page.tsx              # Dashboard admin complet
│   │   │   ├── users/                # Gestion utilisateurs
│   │   │   ├── shops/                # Gestion boutiques
│   │   │   ├── orders/               # Gestion commandes
│   │   │   ├── security/             # Logs sécurité & audit
│   │   │   └── promotions/           # Codes promo & flash sales
│   │   └── api/                      # API Routes
│   │       ├── auth/                 # signup, login, google, logout, me
│   │       ├── products/             # CRUD produits + recherche
│   │       ├── orders/               # Commandes
│   │       ├── payments/             # Mobile Money + Stripe
│   │       ├── chat/                 # Messagerie
│   │       ├── notifications/        # Notifications
│   │       └── admin/                # Endpoints admin
│   ├── components/
│   │   ├── layout/                   # Navbar, Footer, MobileNav, MainLayout
│   │   ├── admin/                    # AdminLayout + composants admin
│   │   ├── seller/                   # SellerLayout + composants vendeur
│   │   ├── product/                  # ProductCard, ProductGrid...
│   │   ├── shop/                     # ShopCard, ShopGrid...
│   │   ├── cart/                     # Cart components
│   │   ├── checkout/                 # Checkout steps
│   │   ├── chat/                     # Chat components
│   │   ├── ui/                       # Composants génériques
│   │   └── providers/                # Auth, Cart, Notification providers
│   ├── lib/
│   │   ├── supabase.ts               # Client Supabase
│   │   ├── auth.ts                   # JWT, hashing, OAuth
│   │   ├── email.ts                  # Emails transactionnels
│   │   ├── notifications.ts          # Push + BDD notifications
│   │   └── utils.ts                  # Utilitaires (formatCFA, dates...)
│   ├── hooks/
│   │   ├── useAuth.ts                # Hook authentification
│   │   ├── useCart.ts                # Hook panier
│   │   ├── useNotifications.ts       # Hook notifications temps réel
│   │   └── useClickOutside.ts        # Hook click extérieur
│   ├── store/
│   │   └── index.ts                  # Zustand stores (auth, cart, notifs, UI)
│   ├── types/
│   │   └── index.ts                  # Types TypeScript complets
│   └── styles/
│       └── globals.css               # Styles globaux + design system
├── supabase/
│   ├── migrations/
│   │   └── 001_schema.sql            # Schéma BDD complet avec RLS
│   └── seed/
│       └── 001_seed.sql              # Données de démo
├── public/
│   └── manifest.json                 # PWA manifest
├── .env.example                      # Variables d'environnement
├── next.config.js                    # Config Next.js + sécurité headers
├── tailwind.config.js                # Thème ChapChap
└── package.json
```

---

## ⚡ Installation Rapide

### 1. Cloner et installer

```bash
git clone https://github.com/votre-compte/chapchap.git
cd chapchap
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Copiez l'URL et les clés API
3. Exécutez le schéma dans l'éditeur SQL Supabase :

```bash
# Copier et coller le contenu de supabase/migrations/001_schema.sql
# dans l'éditeur SQL de votre dashboard Supabase

# Puis les données de démo :
# supabase/seed/001_seed.sql
```

### 3. Variables d'environnement

```bash
cp .env.example .env.local
# Remplir toutes les valeurs dans .env.local
```

**Variables obligatoires :**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin Google OAuth
GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET
ADMIN_EMAIL=dr.mamery@gmail.com
```

### 4. Lancer en développement

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔐 Authentification

### Comptes de test (après seed)

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| **Acheteur** | acheteur1@chapchap.ci | ChapChap2024! |
| **Acheteur 2** | acheteur2@chapchap.ci | ChapChap2024! |
| **Vendeur** | vendeur1@chapchap.ci | ChapChap2024! |
| **Vendeur 2** | vendeur2@chapchap.ci | ChapChap2024! |
| **Admin** | dr.mamery@gmail.com | Google OAuth uniquement |

### Google OAuth Admin

L'accès admin est **exclusivement via Google OAuth** avec l'email `dr.mamery@gmail.com`.

**Configuration Google Cloud Console :**
1. Projet: [console.cloud.google.com](https://console.cloud.google.com)
2. Client ID: `GOOGLE_CLIENT_ID`
3. Ajouter `http://localhost:3000` aux origines JavaScript autorisées
4. Ajouter `http://localhost:3000/api/auth/google` aux URI de redirection

---

## 💳 Paiements Mobile Money

ChapChap supporte les 3 méthodes de paiement Mobile Money de Côte d'Ivoire :

| Provider | API | Documentation |
|----------|-----|---------------|
| 🟠 Orange Money CI | Orange Money Web Pay | [api.orange.com](https://developer.orange.com) |
| 🟡 MTN Mobile Money | MTN MoMo API | [momodeveloper.mtn.com](https://momodeveloper.mtn.com) |
| 🔵 Wave | Wave Checkout API | [docs.wave.com](https://docs.wave.com) |
| 💳 Stripe | Stripe Payments | [stripe.com/docs](https://stripe.com/docs) |

> **Note :** En développement, les paiements Mobile Money sont simulés. Configurez les vraies clés API en production.

---

## 🗄️ Base de Données

### Tables principales
- `users` — Utilisateurs (acheteurs, vendeurs, admin, livreurs)
- `shops` — Boutiques des vendeurs
- `products` — Produits avec full-text search
- `orders` + `order_items` — Commandes
- `deliveries` — Suivi livraison GPS
- `payments` — Transactions financières
- `reviews` — Avis et notations
- `conversations` + `messages` — Chat chiffré
- `notifications` — Push et email
- `promotions` + `promo_codes` — Marketing
- `admin_logs` + `security_logs` — Audit

### Row Level Security (RLS)
Toutes les tables sensibles ont des politiques RLS Supabase pour garantir que chaque utilisateur n'accède qu'à ses propres données.

---

## 🚢 Déploiement

### Vercel (Recommandé)

```bash
npm install -g vercel
vercel --prod
```

Ajouter toutes les variables `.env.example` dans le dashboard Vercel.

### Netlify

```bash
npm run build
netlify deploy --prod --dir=.next
```

---

## 🎨 Design System

### Couleurs

| Variable | Hex | Usage |
|----------|-----|-------|
| `chapchap-primary` | `#FF6B2C` | Orange vif — CTA, liens |
| `chapchap-secondary` | `#1A1A2E` | Bleu nuit — textes, fond dark |
| `chapchap-accent` | `#FFD700` | Or africain — étoiles, badges |
| `chapchap-light` | `#FFF7F3` | Fond chaud — arrière-plan |

### Typographie
- **Display** : `Syne` (titres, prix, chiffres)
- **Body** : `Plus Jakarta Sans` (texte courant)
- **Mono** : `JetBrains Mono` (codes, tracking)

---

## 📱 PWA

ChapChap est une Progressive Web App :
- Installable sur Android/iOS depuis le navigateur
- Notifications push web
- Mode hors ligne pour navigation produits
- Icônes adaptatives

---

## 🔒 Sécurité

- ✅ JWT avec expiration + refresh tokens
- ✅ Mots de passe hashés avec bcrypt (cost 12)
- ✅ Rate limiting (100 req/15min par IP)
- ✅ Validation et sanitisation côté serveur (zod)
- ✅ Protection XSS via Content Security Policy
- ✅ Headers de sécurité (HSTS, X-Frame-Options, etc.)
- ✅ Row Level Security sur toutes les tables Supabase
- ✅ Google OAuth uniquement pour l'admin
- ✅ Logs d'audit complets (actions admin + sécurité)
- ✅ Verrouillage de compte après 5 tentatives échouées
- ✅ Alertes email pour activités suspectes

---

## 📊 Fonctionnalités par rôle

### 🛒 Acheteur
- Inscription/connexion + vérification email
- Recherche avancée produits et boutiques
- Filtres prix, catégorie, note, localisation
- Panier persistant (local + serveur)
- Checkout multi-étapes (livraison → paiement → confirmation)
- Paiement Mobile Money (Orange, MTN, Wave) + Carte Stripe
- Suivi commande temps réel + code confirmation livraison
- Historique commandes + factures téléchargeables
- Wishlist / Favoris
- Avis et notations (achat vérifié)
- Chat temps réel avec vendeurs
- Notifications push et email

### 🏪 Vendeur
- Dashboard avec statistiques de ventes (Recharts)
- CRUD produits (images, stock, prix, promotions)
- Gestion commandes (accepter/refuser/expédier)
- Statistiques CA, produits populaires, taux conversion
- Créer ventes flash avec compte à rebours
- Gestion retours et remboursements
- Chat temps réel avec acheteurs
- Notifications nouvelles commandes

### 👑 Admin (dr.mamery@gmail.com — Google OAuth)
- Dashboard temps réel (CA, commandes, utilisateurs)
- Graphiques interactifs (Recharts AreaChart, PieChart)
- Gestion CRUD utilisateurs (suspendre, supprimer, contacter)
- Validation/refus boutiques
- Gestion toutes les commandes + assign livreurs
- Statistiques globales + export CSV/PDF
- Codes promo et promotions globaux
- Logs sécurité temps réel
- Alertes fraude et activités suspectes

---

## 🌍 Localisation Côte d'Ivoire

- Monnaie : **FCFA (XOF)** — formatage français
- Numéros de téléphone : format **CI** (07 XX XX XX XX)
- Paiements : **Orange Money, MTN MoMo, Wave CI**
- Zone de livraison : **Bouaké et région du Bandama**
- Langue : **Français**
- Produits locaux : pagnes wax, attiéké, boubous, etc.

---

## 🛠️ Scripts

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linting
npm run db:migrate   # Exécuter migrations
npm run db:seed      # Charger données de démo
npm run db:reset     # Réinitialiser la base
```

---

## 📝 Licence

Projet universitaire — ChapChap CI © 2025

---

*Fait avec ❤️ à Bouaké, Côte d'Ivoire 🇨🇮*
