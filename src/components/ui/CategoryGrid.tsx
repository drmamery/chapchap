'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Électronique', slug: 'electronique', icon: '📱', color: 'from-blue-400 to-blue-600', count: 450 },
  { name: 'Mode & Wax', slug: 'mode-vetements', icon: '👗', color: 'from-pink-400 to-pink-600', count: 820 },
  { name: 'Alimentation', slug: 'alimentation', icon: '🥘', color: 'from-green-400 to-green-600', count: 320 },
  { name: 'Beauté & Santé', slug: 'beaute-sante', icon: '💄', color: 'from-purple-400 to-purple-600', count: 280 },
  { name: 'Maison & Déco', slug: 'maison-deco', icon: '🏠', color: 'from-amber-400 to-amber-600', count: 195 },
  { name: 'Auto & Moto', slug: 'auto-moto', icon: '🚗', color: 'from-red-400 to-red-600', count: 145 },
  { name: 'Agriculture', slug: 'agriculture', icon: '🌾', color: 'from-lime-400 to-lime-600', count: 210 },
  { name: 'Bâtiment', slug: 'batiment', icon: '🔨', color: 'from-stone-400 to-stone-600', count: 160 },
  { name: 'Sport & Loisirs', slug: 'sport-loisirs', icon: '⚽', color: 'from-cyan-400 to-cyan-600', count: 120 },
  { name: 'Enfants & Bébé', slug: 'enfants-bebe', icon: '🧸', color: 'from-yellow-400 to-yellow-600', count: 185 },
  { name: 'Livres & Éducation', slug: 'livres-education', icon: '📚', color: 'from-indigo-400 to-indigo-600', count: 95 },
  { name: 'Services', slug: 'services', icon: '🛠️', color: 'from-teal-400 to-teal-600', count: 75 },
];

interface CategoryGridProps {
  showCount?: boolean;
  maxItems?: number;
}

export function CategoryGrid({ showCount = true, maxItems = 12 }: CategoryGridProps) {
  const displayCategories = CATEGORIES.slice(0, maxItems);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
      {displayCategories.map((cat, i) => (
        <motion.div
          key={cat.slug}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.04 }}
        >
          <Link
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-chapchap hover:-translate-y-1 transition-all duration-300 text-center border border-transparent hover:border-chapchap-primary/20"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl md:text-3xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
              {cat.icon}
            </div>
            <div>
              <p className="text-xs md:text-sm font-semibold text-chapchap-secondary dark:text-white group-hover:text-chapchap-primary transition-colors leading-tight">
                {cat.name}
              </p>
              {showCount && (
                <p className="text-2xs text-chapchap-muted mt-0.5">{cat.count} produits</p>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
