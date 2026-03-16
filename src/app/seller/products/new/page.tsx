'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Upload, X, Plus, Tag, Package, DollarSign,
  Info, ChevronRight, Save, ArrowLeft, ImageIcon
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const ProductSchema = z.object({
  name: z.string().min(3, 'Nom trop court').max(200),
  description: z.string().min(20, 'Description trop courte').max(5000),
  price: z.coerce.number().positive('Prix invalide'),
  compare_price: z.coerce.number().optional(),
  cost_price: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  category_id: z.string().min(1, 'Catégorie requise'),
  weight: z.coerce.number().optional(),
  tags: z.string().optional(),
});

type ProductForm = z.infer<typeof ProductSchema>;

const CATEGORIES = [
  { id: 'cat-001', name: 'Électronique' },
  { id: 'cat-001-1', name: '→ Téléphones' },
  { id: 'cat-001-2', name: '→ Ordinateurs' },
  { id: 'cat-001-3', name: '→ Accessoires Tech' },
  { id: 'cat-002', name: 'Mode & Vêtements' },
  { id: 'cat-003', name: 'Alimentation' },
  { id: 'cat-004', name: 'Beauté & Santé' },
  { id: 'cat-005', name: 'Maison & Déco' },
  { id: 'cat-006', name: 'Auto & Moto' },
  { id: 'cat-007', name: 'Agriculture' },
];

export default function NewProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<{ url: string; file?: File }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'pricing' | 'inventory' | 'media' | 'seo'>('basic');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(ProductSchema),
    defaultValues: { stock: 0 },
  });

  const price = watch('price');
  const comparePrice = watch('compare_price');
  const discountPct = comparePrice && price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    const toUpload = Array.from(files).slice(0, 8 - images.length);
    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) { toast.error('Fichier non supporté'); continue; }
      if (file.size > 10 * 1024 * 1024) { toast.error('Image trop lourde (max 10MB)'); continue; }
      const url = URL.createObjectURL(file);
      setImages(prev => [...prev, { url, file }]);
    }
  };

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const onSubmit = async (data: ProductForm) => {
    if (images.length === 0) { toast.error('Ajoutez au moins une image'); return; }
    setIsLoading(true);
    try {
      // Upload images vers Supabase Storage
      const uploadedUrls: string[] = [];
      for (const img of images) {
        if (img.file) {
          const ext = img.file.name.split('.').pop();
          const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { data: uploaded, error } = await supabase.storage.from('products').upload(path, img.file, { cacheControl: '3600' });
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path);
          uploadedUrls.push(publicUrl);
        } else {
          uploadedUrls.push(img.url);
        }
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images: uploadedUrls,
          thumbnail: uploadedUrls[0],
          tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('Produit créé avec succès !');
        router.push('/seller/products');
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Erreur lors de la création');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const SECTIONS = [
    { id: 'basic', label: 'Informations', icon: <Info size={15} /> },
    { id: 'pricing', label: 'Prix', icon: <DollarSign size={15} /> },
    { id: 'inventory', label: 'Stock', icon: <Package size={15} /> },
    { id: 'media', label: 'Images', icon: <ImageIcon size={15} /> },
    { id: 'seo', label: 'Tags & SEO', icon: <Tag size={15} /> },
  ];

  return (
    <SellerLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="btn-ghost p-2 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white">Nouveau produit</h1>
            <p className="text-chapchap-muted text-sm">Remplissez les informations de votre produit</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Section nav */}
          <div className="flex overflow-x-auto gap-2 mb-6 pb-1">
            {SECTIONS.map(s => (
              <button key={s.id} type="button" onClick={() => setActiveSection(s.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${
                  activeSection === s.id ? 'bg-chapchap-primary text-white shadow-chapchap' : 'bg-white dark:bg-gray-800 text-chapchap-muted border border-gray-200 dark:border-gray-700'
                }`}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              {activeSection === 'basic' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-5">
                  <h2 className="font-display font-bold text-chapchap-secondary dark:text-white">Informations générales</h2>
                  <div>
                    <label className="label">Nom du produit *</label>
                    <input {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Ex: Samsung Galaxy A55 5G 128Go Noir" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    <p className="text-xs text-chapchap-muted mt-1">Un nom clair et précis améliore le référencement</p>
                  </div>
                  <div>
                    <label className="label">Description *</label>
                    <textarea {...register('description')} rows={8}
                      className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                      placeholder="Décrivez votre produit en détail : caractéristiques, dimensions, matériaux, utilisation...&#10;&#10;Plus la description est complète, plus vous vendrez !" />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                  </div>
                  <div>
                    <label className="label">Catégorie *</label>
                    <select {...register('category_id')} className={`input ${errors.category_id ? 'input-error' : ''}`}>
                      <option value="">Sélectionnez une catégorie</option>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
                  </div>
                </motion.div>
              )}

              {/* Pricing */}
              {activeSection === 'pricing' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-5">
                  <h2 className="font-display font-bold text-chapchap-secondary dark:text-white">Prix et marges</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Prix de vente * (FCFA)</label>
                      <input {...register('price')} type="number" step="100" className={`input ${errors.price ? 'input-error' : ''}`} placeholder="0" />
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                      <label className="label">Prix barré (FCFA) <span className="text-chapchap-muted">(optionnel)</span></label>
                      <input {...register('compare_price')} type="number" step="100" className="input" placeholder="0" />
                      {discountPct > 0 && <p className="text-green-600 text-xs mt-1">-{discountPct}% de réduction affiché</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label">Prix d&apos;achat (FCFA) <span className="text-chapchap-muted">(privé, pour vos marges)</span></label>
                    <input {...register('cost_price')} type="number" step="100" className="input" placeholder="0" />
                    <p className="text-xs text-chapchap-muted mt-1">Non visible par les acheteurs. Aide à calculer votre bénéfice.</p>
                  </div>
                  {price && comparePrice && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">💰 Votre marge</p>
                      <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
                        <div><span className="text-chapchap-muted">Prix vente</span><br /><strong>{price?.toLocaleString('fr-CI')} FCFA</strong></div>
                        <div><span className="text-chapchap-muted">Commission (5%)</span><br /><strong className="text-red-500">-{(price * 0.05).toLocaleString('fr-CI')} FCFA</strong></div>
                        <div><span className="text-chapchap-muted">Vous recevez</span><br /><strong className="text-green-700">{(price * 0.95).toLocaleString('fr-CI')} FCFA</strong></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Inventory */}
              {activeSection === 'inventory' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-5">
                  <h2 className="font-display font-bold text-chapchap-secondary dark:text-white">Stock et inventaire</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Quantité en stock *</label>
                      <input {...register('stock')} type="number" min="0" className="input" placeholder="0" />
                    </div>
                    <div>
                      <label className="label">SKU / Référence</label>
                      <input {...register('sku')} className="input" placeholder="Ex: SAM-A55-BLK-128" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Poids (kg) <span className="text-chapchap-muted">(optionnel)</span></label>
                    <input {...register('weight')} type="number" step="0.1" min="0" className="input" placeholder="0.5" />
                    <p className="text-xs text-chapchap-muted mt-1">Pour le calcul des frais de livraison</p>
                  </div>
                </motion.div>
              )}

              {/* Media */}
              {activeSection === 'media' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-4">
                  <h2 className="font-display font-bold text-chapchap-secondary dark:text-white">Images du produit</h2>
                  <p className="text-sm text-chapchap-muted">Ajoutez jusqu&apos;à 8 photos. La première sera la photo principale.</p>

                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => { e.preventDefault(); setIsDragging(false); handleImageUpload(e.dataTransfer.files); }}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                      isDragging ? 'border-chapchap-primary bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-chapchap-primary hover:bg-orange-50/50'
                    }`}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload size={32} className="text-chapchap-muted mx-auto mb-3" />
                    <p className="font-semibold text-chapchap-secondary dark:text-white">Cliquez ou glissez vos images ici</p>
                    <p className="text-sm text-chapchap-muted mt-1">PNG, JPG, WebP — Max 10 MB par image</p>
                    <input id="image-upload" type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(e.target.files)} />
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {images.map((img, i) => (
                        <div key={i} className={`relative rounded-xl overflow-hidden aspect-square ${i === 0 ? 'ring-2 ring-chapchap-primary' : ''}`}>
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          {i === 0 && <div className="absolute bottom-1 left-1 text-2xs bg-chapchap-primary text-white rounded px-1">Principal</div>}
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {images.length < 8 && (
                        <button type="button" onClick={() => document.getElementById('image-upload')?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 hover:border-chapchap-primary hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all">
                          <Plus size={20} className="text-chapchap-muted" />
                          <span className="text-2xs text-chapchap-muted">Ajouter</span>
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tags */}
              {activeSection === 'seo' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-5">
                  <h2 className="font-display font-bold text-chapchap-secondary dark:text-white">Tags et référencement</h2>
                  <div>
                    <label className="label">Tags (séparés par des virgules)</label>
                    <input {...register('tags')} className="input" placeholder="Ex: samsung, smartphone, android, 5g, téléphone" />
                    <p className="text-xs text-chapchap-muted mt-1">Les tags améliorent la visibilité dans la recherche</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Conseils SEO</p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Utilisez des mots-clés que les acheteurs recherchent</li>
                      <li>• Incluez la marque, le modèle, la couleur</li>
                      <li>• 5 à 10 tags bien choisis suffisent</li>
                      <li>• Évitez les tags irrelevants</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar summary */}
            <div className="space-y-4">
              <div className="card p-5 sticky top-24">
                <h3 className="font-semibold text-chapchap-secondary dark:text-white mb-4">Résumé</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-chapchap-muted">Images</span>
                    <span className={images.length === 0 ? 'text-red-500' : 'text-green-600'}>{images.length}/8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-chapchap-muted">Prix</span>
                    <span>{price ? `${price.toLocaleString('fr-CI')} FCFA` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-chapchap-muted">Stock</span>
                    <span>{watch('stock') || '0'} unités</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Réduction</span>
                      <span>-{discountPct}%</span>
                    </div>
                  )}
                </div>

                {/* Sections completed */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
                  <p className="text-xs font-semibold text-chapchap-muted uppercase tracking-wider mb-2">Complétude</p>
                  {SECTIONS.map(s => (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        (s.id === 'media' && images.length > 0) || s.id !== 'media' ? 'bg-green-500' : 'bg-gray-200'
                      }`}>
                        <span className="text-white text-2xs">✓</span>
                      </div>
                      <span className="text-chapchap-muted">{s.label}</span>
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6 py-3.5 gap-2">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publication...
                    </span>
                  ) : <><Save size={18} /> Publier le produit</>}
                </button>
                <button type="button" disabled={isLoading} className="btn-ghost w-full mt-2 text-sm">
                  Enregistrer brouillon
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}
