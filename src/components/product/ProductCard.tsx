'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '@/types';
import { formatCFA } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discountedPrice = product.discount_percentage
    ? product.price * (1 - product.discount_percentage / 100)
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group relative flex flex-col">
      <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-700" style={{aspectRatio:'1/1'}}>
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        {product.discount_percentage && (
          <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discount_percentage}%
          </div>
        )}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md text-gray-400 hover:text-red-500 transition-colors">
            <Heart size={14} />
          </button>
          <button
            onClick={() => onAddToCart?.(product)}
            className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-md text-white hover:bg-orange-600 transition-colors"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <p className="text-xs text-gray-400 mb-1">{product.shop?.name}</p>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star size={11} className="text-yellow-400 fill-current" />
          <span className="text-xs font-semibold">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.review_count})</span>
        </div>
        <div className="mt-auto flex items-center gap-2">
          <span className="font-bold text-orange-500 text-base">
            {formatCFA(discountedPrice || product.price)}
          </span>
          {product.compare_price && (
            <span className="text-gray-400 text-xs line-through">{formatCFA(product.compare_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
