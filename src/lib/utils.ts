import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================================
// CSS Classes
// ============================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// Formatage monétaire (FCFA / XOF)
// ============================================================

const CURRENCY_FORMATTER = new Intl.NumberFormat('fr-CI', {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCFA(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0 FCFA';
  return `${CURRENCY_FORMATTER.format(amount)} FCFA`;
}

export function formatCFACompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M FCFA`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K FCFA`;
  }
  return formatCFA(amount);
}

export function parseCFA(value: string): number {
  return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
}

// ============================================================
// Dates
// ============================================================

export function formatDate(date: string | Date | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, fmt, { locale: fr });
  } catch {
    return '';
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, 'dd MMM yyyy à HH:mm');
}

export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true, locale: fr });
  } catch {
    return '';
  }
}

export function formatCountdown(ms: number): { hours: string; minutes: string; seconds: string } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}

// ============================================================
// Slugs
// ============================================================

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ============================================================
// Validation
// ============================================================

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateCIPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+?225|00225)?0[5-9]\d{8}$/.test(clean);
}

export function formatCIPhone(phone: string): string {
  const clean = phone.replace(/[\s\-\(\)]/g, '').replace(/^(\+225|00225)/, '');
  if (clean.length === 10) {
    return `+225 ${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 8)} ${clean.slice(8)}`;
  }
  return phone;
}

// ============================================================
// Texte
// ============================================================

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join('');
}

// ============================================================
// Couleurs statuts commandes
// ============================================================

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  pending: { label: 'En attente', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '⏳' },
  confirmed: { label: 'Confirmée', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: '✅' },
  preparing: { label: 'En préparation', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '📦' },
  shipped: { label: 'Expédiée', color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: '🚚' },
  delivered: { label: 'Livrée', color: 'text-green-700', bgColor: 'bg-green-100', icon: '🎉' },
  cancelled: { label: 'Annulée', color: 'text-red-700', bgColor: 'bg-red-100', icon: '❌' },
  refunded: { label: 'Remboursée', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: '↩️' },
};

export const PAYMENT_METHOD_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  orange_money: { label: 'Orange Money', icon: '🟠', color: '#FF7900' },
  mtn_momo: { label: 'MTN MoMo', icon: '🟡', color: '#FFCB00' },
  wave: { label: 'Wave', icon: '🔵', color: '#0CB9F2' },
  stripe: { label: 'Carte bancaire', icon: '💳', color: '#635BFF' },
  cash_on_delivery: { label: 'Paiement à la livraison', icon: '💵', color: '#10B981' },
};

// ============================================================
// Images
// ============================================================

export function getImageUrl(path: string | null | undefined, fallback = '/images/placeholder.jpg'): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
}

export function getAvatarUrl(user: { profile_pic?: string | null; name: string }): string | null {
  if (user.profile_pic) return getImageUrl(user.profile_pic);
  return null;
}

// ============================================================
// Calculs prix
// ============================================================

export function calculateDiscountedPrice(price: number, discountPercentage: number): number {
  return Math.round(price * (1 - discountPercentage / 100));
}

export function calculateDiscount(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function calculateShipping(subtotal: number): number {
  if (subtotal >= 50000) return 0; // Livraison gratuite
  if (subtotal >= 20000) return 1000;
  return 1500;
}

// ============================================================
// Divers
// ============================================================

export function generateOrderNumber(): string {
  return `CC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getRatingStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + '½'.repeat(half) + '☆'.repeat(empty);
}
