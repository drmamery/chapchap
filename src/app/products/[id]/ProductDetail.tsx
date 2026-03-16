'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star, Heart, Share2, ShoppingCart, MessageSquare, Shield,
  Truck, RotateCcw, MapPin, ChevronRight, Minus, Plus,
  Check, ArrowLeft, Store
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { formatCFA, calculateDiscount, formatTimeAgo, getInitials } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

const MOCK_PRODUCTS: Record<string, any> = {
  'prod-001': { id:'prod-001', name:'Samsung Galaxy A55 5G - 128Go', price:285000, compare_price:320000, stock:15, rating:4.6, review_count:23, images:['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800'], thumbnail:'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', description:'Smartphone Samsung Galaxy A55 5G avec 8Go RAM, 128Go stockage, triple caméra 50MP, batterie 5000mAh. Garantie 1 an.', tags:['samsung','smartphone','5g'], shop:{id:'shop-001',name:'TechZone Bouaké',slug:'techzone-bouake',is_verified:true,rating:4.7,review_count:89,location:{city:'Bouaké',quarter:'Commerce'}}, category:{name:'Téléphones',slug:'telephones'}, attributes:{Couleur:['Noir','Bleu'],Stockage:['128Go','256Go']} },
  'prod-002': { id:'prod-002', name:'iPhone 15 - 128Go Noir', price:520000, compare_price:580000, stock:8, rating:4.8, review_count:12, images:['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'], thumbnail:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', description:'Apple iPhone 15, 128Go, Puce A16 Bionic, Dynamic Island, USB-C. Caméra 48MP. Neuf, scellé.', tags:['iphone','apple'], shop:{id:'shop-001',name:'TechZone Bouaké',slug:'techzone-bouake',is_verified:true,rating:4.7,review_count:89,location:{city:'Bouaké',quarter:'Commerce'}}, category:{name:'Téléphones',slug:'telephones'}, attributes:{Couleur:['Noir','Blanc']} },
  'prod-005': { id:'prod-005', name:'Robe Pagne Wax Africain', price:35000, compare_price:45000, stock:30, rating:4.9, review_count:67, images:['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800'], thumbnail:'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', description:'Magnifique robe en pagne wax 100% coton, fabrication ivoirienne. Disponible en plusieurs motifs.', tags:['robe','wax','pagne'], shop:{id:'shop-002',name:'Fashion Wax by Fatou',slug:'fashion-wax-fatou',is_verified:true,rating:4.9,review_count:156,location:{city:'Bouaké',quarter:'Koko'}}, category:{name:'Mode & Vêtements',slug:'mode-vetements'}, attributes:{Taille:['38','40','42','44','46']} },
  'prod-007': { id:'prod-007', name:'Attiéké Frais - 1kg', price:1500, compare_price:null, stock:200, rating:4.7, review_count:89, images:['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'], thumbnail:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', description:"Attiéké frais de qualité, préparé artisanalement. Livré frais le jour même.", tags:['attiéké','ivoirien'], shop:{id:'shop-003',name:'Saveurs du Centre',slug:'saveurs-du-centre',is_verified:true,rating:4.5,review_count:67,location:{city:'Bouaké',quarter:'Kennedy'}}, category:{name:'Alimentation',slug:'alimentation'}, attributes:{} },
};

const MOCK_REVIEWS = [
  { id:'r1', user:{name:'Diabaté Marie'}, rating:5, comment:'Excellent produit ! Livraison rapide, vendeur sérieux. Je recommande !', created_at:new Date(Date.now()-2*86400000).toISOString(), is_verified_purchase:true },
  { id:'r2', user:{name:'Ouattara Jean'}, rating:4, comment:'Très bon produit, conforme à la description.', created_at:new Date(Date.now()-5*86400000).toISOString(), is_verified_purchase:true },
];

export default function ProductDetail({ id }: { id: string }) {
  const product = MOCK_PRODUCTS[id] || MOCK_PRODUCTS['prod-001'];
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string,string>>({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description'|'reviews'>('description');
  const { addToCart } = useCart();
  const discount = calculateDiscount(product.price, product.compare_price);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-orange-500">Accueil</Link>
          <ChevronRight size={14} />
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-orange-500">{product.category.name}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}>
            <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 mb-3" style={{aspectRatio:'1/1'}}>
              <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" priority />
              {discount > 0 && <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">-{discount}%</div>}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 hover:opacity-100 transition-opacity">
                <button onClick={() => { setIsWishlisted(!isWishlisted); toast.success(isWishlisted ? 'Retiré des favoris' : 'Ajouté aux favoris ❤️'); }} className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`}><Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} /></button>
                <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Lien copié !'); }} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md text-gray-400 hover:text-orange-500"><Share2 size={18} /></button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-orange-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-5">
            <Link href={`/shops/${product.shop.slug}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500">
              <Store size={14} /> {product.shop.name} {product.shop.is_verified && <span className="text-green-600 text-xs">✅</span>}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} />)}<span className="font-bold text-sm ml-1">{product.rating}</span></div>
              <span className="text-sm text-gray-400">({product.review_count} avis)</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.stock > 0 ? `✓ En stock (${product.stock})` : '✗ Rupture de stock'}</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-orange-500">{formatCFA(product.price)}</span>
              {product.compare_price && <><span className="text-xl text-gray-400 line-through">{formatCFA(product.compare_price)}</span><span className="bg-orange-100 text-orange-700 text-sm font-bold px-2 py-1 rounded-full">-{discount}%</span></>}
            </div>

            {Object.entries(product.attributes || {}).map(([key, values]) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{key}</label>
                <div className="flex flex-wrap gap-2">
                  {(values as string[]).map(v => (
                    <button key={v} onClick={() => setSelectedAttributes(prev => ({...prev,[key]:v}))}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${selectedAttributes[key] === v ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1,quantity-1))} className="w-11 h-11 flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"><Minus size={16} /></button>
                <span className="w-12 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock,quantity+1))} className="w-11 h-11 flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"><Plus size={16} /></button>
              </div>
              <button onClick={() => addToCart(product, quantity, selectedAttributes)} disabled={product.stock === 0}
                className="flex-1 py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <ShoppingCart size={20} /> Ajouter au panier
              </button>
              <button onClick={() => { setIsWishlisted(!isWishlisted); toast.success(isWishlisted ? 'Retiré des favoris':'Ajouté aux favoris ❤️'); }}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${isWishlisted ? 'border-red-300 text-red-500 bg-red-50':'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'}`}>
                <Heart size={20} fill={isWishlisted ? 'currentColor':'none'} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[{icon:<Truck size={18}/>,l:'Livraison',s:'24-48h'},{icon:<RotateCcw size={18}/>,l:'Retours',s:'7 jours'},{icon:<Shield size={18}/>,l:'Garantie',s:'1 an'}].map((item,i) => (
                <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-orange-500 mb-1">{item.icon}</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.l}</span>
                  <span className="text-xs text-gray-400">{item.s}</span>
                </div>
              ))}
            </div>

            <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">{product.shop.name[0]}</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{product.shop.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10}/>{product.shop.location?.quarter}, {product.shop.location?.city}</p>
                  <div className="flex items-center gap-1 text-xs"><Star size={11} className="text-yellow-400 fill-current"/><span className="font-semibold">{product.shop.rating}</span><span className="text-gray-400">({product.shop.review_count})</span></div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link href={`/shops/${product.shop.slug}`} className="px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-xl text-xs font-semibold hover:bg-orange-500 hover:text-white transition-colors">Visiter</Link>
                <Link href={`/messages`} className="px-4 py-2 text-gray-400 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"><MessageSquare size={12}/>Contacter</Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-12">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
            {[['description','Description'],['reviews',`Avis (${product.review_count})`]].map(([tab,label]) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`flex-shrink-0 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab ? 'border-orange-500 text-orange-500':'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
          {activeTab === 'description' && (
            <div className="text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">{product.description}</div>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {MOCK_REVIEWS.map(review => (
                <div key={review.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">{getInitials(review.user.name)}</div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{review.user.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">{[1,2,3,4,5].map(s=><Star key={s} size={12} className={s<=review.rating?'text-yellow-400 fill-current':'text-gray-300'}/>)}</div>
                          {review.is_verified_purchase && <span className="text-xs text-green-600 flex items-center gap-0.5"><Check size={10}/>Achat vérifié</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{formatTimeAgo(review.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
