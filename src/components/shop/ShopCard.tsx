'use client';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import type { Shop } from '@/types';

interface ShopCardProps { shop: Shop; }

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link href={`/shops/${shop.slug}`} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden p-5 flex flex-col gap-3 group">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
          {shop.logo ? <img src={shop.logo} alt="" className="w-full h-full rounded-xl object-cover" /> : shop.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors truncate">{shop.name}</h3>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin size={10} /> {shop.location?.quarter}, {shop.location?.city}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="text-yellow-400 fill-current" />
            <span className="text-xs font-semibold">{shop.rating}</span>
            <span className="text-xs text-gray-400">({shop.review_count} avis)</span>
          </div>
        </div>
        {shop.is_verified && <span className="text-green-500 text-sm flex-shrink-0">✅</span>}
      </div>
      <p className="text-xs text-gray-400 line-clamp-2">{shop.description}</p>
    </Link>
  );
}
