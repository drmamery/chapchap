'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  MapPin, Phone, User, ChevronRight, Lock, CheckCircle,
  ArrowLeft, CreditCard, Smartphone, Tag
} from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCartStore } from '@/store';
import { formatCFA, calculateShipping, PAYMENT_METHOD_CONFIG } from '@/lib/utils';
import type { PaymentMethod } from '@/types';

const STEPS = ['Livraison', 'Paiement', 'Confirmation'];

const ShippingSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().default('Bouaké'),
  notes: z.string().optional(),
});

type ShippingForm = z.infer<typeof ShippingSchema>;

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: string; color: string; available: boolean; description: string }[] = [
  {
    id: 'orange_money',
    label: 'Orange Money',
    icon: '🟠',
    color: '#FF7900',
    available: true,
    description: 'Paiement via votre compte Orange Money CI',
  },
  {
    id: 'mtn_momo',
    label: 'MTN Mobile Money',
    icon: '🟡',
    color: '#FFCB00',
    available: true,
    description: 'Paiement via votre compte MTN MoMo',
  },
  {
    id: 'wave',
    label: 'Wave',
    icon: '🔵',
    color: '#0CB9F2',
    available: true,
    description: 'Paiement rapide avec l\'application Wave',
  },
  {
    id: 'stripe',
    label: 'Carte bancaire',
    icon: '💳',
    color: '#635BFF',
    available: true,
    description: 'Visa, Mastercard, carte internationale',
  },
  {
    id: 'cash_on_delivery',
    label: 'Paiement à la livraison',
    icon: '💵',
    color: '#10B981',
    available: true,
    description: 'Payez en espèces à la réception',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('orange_money');
  const [mobilePhone, setMobilePhone] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState<ShippingForm | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>({
    resolver: zodResolver(ShippingSchema),
    defaultValues: { city: 'Bouaké' },
  });

  const subtotal = getTotal();
  const shipping = calculateShipping(subtotal);
  const discount = promoApplied?.discount || 0;
  const total = subtotal + shipping - discount;

  if (items.length === 0 && !orderId) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
          <p className="text-chapchap-muted mb-6">Ajoutez des produits pour continuer</p>
          <Link href="/products" className="btn-primary">Parcourir les produits</Link>
        </div>
      </MainLayout>
    );
  }

  const handleShippingSubmit = (data: ShippingForm) => {
    setShippingData(data);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch(`/api/promo?code=${promoCode}&amount=${subtotal}`);
      const data = await res.json();
      if (data.success) {
        setPromoApplied({ code: promoCode, discount: data.data.discount_amount });
        toast.success(`Code promo appliqué ! -${formatCFA(data.data.discount_amount)}`);
      } else {
        toast.error(data.error || 'Code invalide');
      }
    } catch {
      toast.error('Erreur vérification code promo');
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingData) return;
    setIsLoading(true);
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, attributes: i.attributes })),
          shipping_address: shippingData,
          payment_method: selectedPayment,
          phone_number: mobilePhone,
          promo_code: promoApplied?.code,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        toast.error(orderData.error);
        return;
      }

      const createdOrderId = orderData.data.id;
      setOrderId(createdOrderId);

      // Initier le paiement selon méthode
      if (selectedPayment === 'cash_on_delivery') {
        setStep(2);
        clearCart();
        return;
      }

      if (['orange_money', 'mtn_momo', 'wave'].includes(selectedPayment)) {
        const payRes = await fetch('/api/payments/mobilemoney', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: createdOrderId,
            phone_number: mobilePhone,
            provider: selectedPayment,
          }),
        });
        const payData = await payRes.json();

        if (payData.success) {
          if (payData.data.payment_url) {
            window.open(payData.data.payment_url, '_blank');
          }
          setStep(2);
          clearCart();
          toast.success('Commande passée ! Finalisez le paiement sur votre téléphone.');
        } else {
          toast.error(payData.error);
        }
        return;
      }

      setStep(2);
      clearCart();

    } catch (error) {
      toast.error('Erreur lors de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 2) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={48} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="text-3xl font-display font-bold text-chapchap-secondary dark:text-white mb-3">
              Commande confirmée ! 🎉
            </h1>
            <p className="text-chapchap-muted mb-6">
              Votre commande a été reçue. Vous allez recevoir un email de confirmation.
            </p>
            <div className="card p-6 text-left mb-6">
              <p className="text-sm text-chapchap-muted">Montant total</p>
              <p className="text-2xl font-display font-bold text-chapchap-primary">{formatCFA(total)}</p>
              {selectedPayment !== 'cash_on_delivery' && (
                <p className="text-sm text-chapchap-muted mt-2">
                  Finalisez le paiement {PAYMENT_METHOD_CONFIG[selectedPayment]?.label} sur votre téléphone.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Link href={`/buyer/orders/${orderId}`} className="btn-primary w-full">
                Suivre ma commande
              </Link>
              <Link href="/products" className="btn-outline w-full">
                Continuer les achats
              </Link>
            </div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back button */}
        <Link href="/cart" className="flex items-center gap-2 text-chapchap-muted hover:text-chapchap-primary mb-6 text-sm">
          <ArrowLeft size={16} /> Retour au panier
        </Link>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-chapchap-primary' : 'text-chapchap-muted'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  i < step ? 'bg-chapchap-primary border-chapchap-primary text-white' :
                  i === step ? 'border-chapchap-primary text-chapchap-primary' :
                  'border-gray-300 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-2 ${i < step ? 'bg-chapchap-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 0: Shipping */}
              {step === 0 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="card p-6">
                    <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                      <MapPin className="text-chapchap-primary" size={20} />
                      Adresse de livraison
                    </h2>
                    <form onSubmit={handleSubmit(handleShippingSubmit)} className="space-y-4">
                      <div>
                        <label className="label">Nom complet *</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input {...register('name')} className="input pl-10" placeholder="Votre nom complet" />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="label">Numéro de téléphone *</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input {...register('phone')} className="input pl-10" placeholder="07 XX XX XX XX" />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Ville *</label>
                          <input {...register('city')} className="input" defaultValue="Bouaké" />
                        </div>
                        <div>
                          <label className="label">Quartier</label>
                          <input className="input" placeholder="Ex: Koko, Commerce..." />
                        </div>
                      </div>
                      <div>
                        <label className="label">Adresse précise *</label>
                        <input {...register('address')} className="input" placeholder="Rue, numéro, point de repère..." />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                      </div>
                      <div>
                        <label className="label">Instructions de livraison (optionnel)</label>
                        <textarea {...register('notes')} className="input h-20 resize-none" placeholder="Informations supplémentaires pour le livreur..." />
                      </div>
                      <button type="submit" className="btn-primary w-full py-3.5 text-base">
                        Continuer vers le paiement <ChevronRight size={18} />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="card p-6">
                    <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                      <CreditCard className="text-chapchap-primary" size={20} />
                      Mode de paiement
                    </h2>
                    <div className="space-y-3">
                      {PAYMENT_OPTIONS.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedPayment(option.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                            selectedPayment === option.id
                              ? 'border-chapchap-primary bg-orange-50 dark:bg-orange-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-chapchap-primary/50'
                          }`}
                        >
                          <span className="text-2xl">{option.icon}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-chapchap-secondary dark:text-white">{option.label}</p>
                            <p className="text-sm text-chapchap-muted">{option.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedPayment === option.id ? 'border-chapchap-primary' : 'border-gray-300'
                          }`}>
                            {selectedPayment === option.id && (
                              <div className="w-3 h-3 bg-chapchap-primary rounded-full" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Mobile phone input */}
                    {['orange_money', 'mtn_momo', 'wave'].includes(selectedPayment) && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-4 overflow-hidden">
                        <label className="label flex items-center gap-2">
                          <Smartphone size={15} />
                          Numéro {PAYMENT_METHOD_CONFIG[selectedPayment]?.label} *
                        </label>
                        <input
                          type="tel"
                          value={mobilePhone}
                          onChange={e => setMobilePhone(e.target.value)}
                          className="input"
                          placeholder="07 XX XX XX XX"
                        />
                      </motion.div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setStep(0)} className="btn-outline flex-1">
                        <ArrowLeft size={16} /> Retour
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isLoading || (!mobilePhone && ['orange_money', 'mtn_momo', 'wave'].includes(selectedPayment))}
                        className="btn-primary flex-1 py-3.5"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Traitement...
                          </span>
                        ) : (
                          <>
                            <Lock size={16} />
                            Confirmer {formatCFA(total)}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-display font-bold text-chapchap-secondary dark:text-white mb-4">
                Récapitulatif
              </h3>
              <div className="space-y-3 mb-4">
                {items.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      {item.product?.thumbnail && (
                        <img src={item.product.thumbnail} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-chapchap-secondary dark:text-white truncate">
                        {item.product?.name || 'Produit'}
                      </p>
                      <p className="text-xs text-chapchap-muted">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-chapchap-secondary dark:text-white">
                      {formatCFA((item.product?.price || 0) * item.quantity)}
                    </p>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-chapchap-muted text-center">+{items.length - 3} autres articles</p>
                )}
              </div>

              {/* Promo code */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                <label className="label text-xs">Code promo</label>
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Ex: CHAPCHAP10"
                    className="input text-sm flex-1"
                    disabled={!!promoApplied}
                  />
                  <button onClick={applyPromoCode} disabled={!!promoApplied} className="btn-outline btn-sm">
                    <Tag size={14} />
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> -{formatCFA(promoApplied.discount)} appliqué
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-chapchap-muted">Sous-total</span>
                  <span>{formatCFA(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-chapchap-muted">Livraison</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'Gratuite ✓' : formatCFA(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span>-{formatCFA(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-chapchap-primary">{formatCFA(total)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-chapchap-muted">
                <Lock size={12} className="text-green-600" />
                Paiement 100% sécurisé
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
