import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { Order } from '../../types';
import { FedaPaySimulatorModal } from './FedaPaySimulatorModal';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import {
  X,
  Truck,
  MapPin,
  Phone,
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
} from 'lucide-react';

const BENIN_CITIES = [
  'Cotonou',
  'Abomey-Calavi',
  'Porto-Novo',
  'Sèmè-Kpodji',
  'Ouidah',
  'Allada',
  'Bohicon',
  'Abomey',
  'Parakou',
  'Natitingou',
  'Djougou',
  'Lokossa',
  'Kandi',
  'Autre commune du Bénin',
];

const POPULAR_QUARTIERS_COTONOU = [
  'Cadjehoun',
  'Haie Vive',
  'Akpakpa',
  'Fidjrossè',
  'Agla',
  'Kouhounou',
  'Menontin',
  'Zogbo',
  'Saint-Michel',
];

const POPULAR_QUARTIERS_CALAVI = [
  'Tankpè',
  'Arconville',
  'Bidossessi',
  'Zoundja',
  'Ouédo',
  'Kpota',
  'Parana',
  'Godomey',
];

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    deliveryZones,
    appliedPromo,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
    formatCurrency,
    showToast,
  } = useStore();

  // Load remembered customer details from localStorage for 1-click checkout experience
  const [fullName, setFullName] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_customer_profile');
      return saved ? JSON.parse(saved).fullName || '' : '';
    } catch {
      return '';
    }
  });

  const [phone, setPhone] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_customer_profile');
      return saved ? JSON.parse(saved).phone || '' : '';
    } catch {
      return '';
    }
  });

  const [email, setEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_customer_profile');
      return saved ? JSON.parse(saved).email || '' : '';
    } catch {
      return '';
    }
  });

  const [city, setCity] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_customer_profile');
      return saved ? JSON.parse(saved).city || 'Cotonou' : 'Cotonou';
    } catch {
      return 'Cotonou';
    }
  });

  const [district, setDistrict] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_customer_profile');
      return saved ? JSON.parse(saved).district || '' : '';
    } catch {
      return '';
    }
  });

  const [address, setAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_customer_profile');
      return saved ? JSON.parse(saved).address || '' : '';
    } catch {
      return '';
    }
  });

  const [notes, setNotes] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(() => {
    return deliveryZones[0]?.id || 'zone-cotonou';
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'fedapay_mobile_money'>('cod');
  const [customerConsent, setCustomerConsent] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success & Payment modals
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isFedaPayOpen, setIsFedaPayOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Sync selected zone automatically when city changes
  useEffect(() => {
    if (city === 'Cotonou') {
      const found = deliveryZones.find((z) => z.id.includes('cotonou'));
      if (found) setSelectedZoneId(found.id);
    } else if (city === 'Abomey-Calavi') {
      const found = deliveryZones.find((z) => z.id.includes('calavi'));
      if (found) setSelectedZoneId(found.id);
    } else if (city === 'Porto-Novo') {
      const found = deliveryZones.find((z) => z.id.includes('porto'));
      if (found) setSelectedZoneId(found.id);
    } else {
      const found = deliveryZones.find((z) => z.id.includes('regions') || z.id.includes('inter'));
      if (found) setSelectedZoneId(found.id);
    }
  }, [city, deliveryZones]);

  if (!isCheckoutOpen && !isSuccessOpen && !isFedaPayOpen) return null;

  // Selected Zone
  const currentZone = deliveryZones.find((z) => z.id === selectedZoneId) || deliveryZones[0];
  let shippingFee = currentZone ? currentZone.fee : 1500;
  if (currentZone?.freeDeliveryThreshold && cartSubtotal >= currentZone.freeDeliveryThreshold) {
    shippingFee = 0;
  }

  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const popularQuartiers =
    city === 'Cotonou'
      ? POPULAR_QUARTIERS_COTONOU
      : city === 'Abomey-Calavi'
      ? POPULAR_QUARTIERS_CALAVI
      : [];

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict validation with friendly French messages
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Veuillez renseigner votre nom complet pour le bordereau de livraison.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Numéro de téléphone incomplet. Veuillez indiquer 8 chiffres béninois (ex: 97000000).');
      return;
    }

    if (!district.trim()) {
      setErrorMessage('Veuillez indiquer votre quartier (ou cliquez sur l’une des suggestions ci-dessous).');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Votre panier est vide. Veuillez sélectionner des articles avant de valider.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save customer profile in localStorage for next time
      try {
        localStorage.setItem(
          'hp_customer_profile',
          JSON.stringify({
            fullName: fullName.trim(),
            phone: cleanPhone,
            email: email.trim(),
            city,
            district: district.trim(),
            address: address.trim(),
          })
        );
      } catch {}

      const payload = {
        customer: {
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim() || undefined,
          city,
          district: district.trim(),
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        items: cart.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          price: i.price,
        })),
        promoCode: appliedPromo?.code,
        deliveryZoneId: selectedZoneId,
        paymentMethod,
        customerConsent,
        idempotencyKey: `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      };

      const res = await api.createOrder(payload);
      const order = res.order;

      // Save order reference in localStorage recent orders for 1-tap tracking
      try {
        const existing = JSON.parse(localStorage.getItem('hp_recent_orders') || '[]');
        const updated = [
          { orderNumber: order.orderNumber, phone: cleanPhone, date: new Date().toISOString(), total: order.total },
          ...existing.filter((o: any) => o.orderNumber !== order.orderNumber),
        ].slice(0, 5);
        localStorage.setItem('hp_recent_orders', JSON.stringify(updated));
      } catch {}

      clearCart();
      setConfirmedOrder(order);
      closeCheckout();

      if (paymentMethod === 'fedapay_mobile_money') {
        setIsFedaPayOpen(true);
      } else {
        setIsSuccessOpen(true);
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      const readableErr =
        err.message || 'Impossible d’enregistrer la commande. Vérifiez votre connexion et réessayez.';
      setErrorMessage(readableErr);
      showToast(readableErr, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl bg-[#171717] border border-[#2e2e2e] shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden my-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeCheckout}
              className="absolute top-4 right-4 p-2 text-[#777D86] hover:text-[#F4F1E9] transition-colors rounded-full hover:bg-[#202020]"
              aria-label="Fermer la fenêtre de commande"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="pb-4 border-b border-[#242424] mb-5">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C7A747] font-semibold block mb-0.5">
                Commande Directe • HP COLLECTION BÉNIN
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#F4F1E9] mt-0.5">
                Livraison à Domicile & Paiement
              </h2>
              <p className="text-xs text-[#777D86] mt-1">
                Remplissez ces quelques informations. Votre commande est immédiatement préparée et expédiée vers votre destination.
              </p>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-[#3d1919] border border-[#8a2424] text-xs text-[#ffb4b4] flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#ff7878]" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Responsive 2-column form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* 1. Coordonnées client */}
                <div className="space-y-3.5">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#C7A747] flex items-center gap-1.5 pb-1 border-b border-[#242424]">
                    <User className="w-3.5 h-3.5" />
                    <span>1. Destinataire</span>
                  </h3>

                  <div>
                    <label className="text-xs text-[#888] font-mono block mb-1">
                      Nom & Prénom <span className="text-[#C7A747]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex : Koffi Sègla"
                      className="w-full min-h-[44px] bg-[#141414] border border-[#333333] focus:border-[#C7A747] px-3.5 py-2 text-xs text-[#F4F1E9] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#888] font-mono block mb-1">
                      Numéro WhatsApp / Téléphone <span className="text-[#C7A747]">*</span>
                    </label>
                    <div className="flex">
                      <span className="min-h-[44px] px-3 bg-[#202020] border border-r-0 border-[#333333] text-xs font-mono font-bold text-[#C7A747] flex items-center justify-center shrink-0">
                        +229
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex : 97 00 00 00 / 61 00 00 00"
                        className="w-full min-h-[44px] bg-[#141414] border border-[#333333] focus:border-[#C7A747] px-3 py-2 text-xs text-[#F4F1E9] outline-none font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-[#777D86] mt-1 block">
                      Le livreur vous appellera sur ce numéro avant son départ.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-[#888] font-mono block mb-1">
                      Adresse email (optionnel pour la facture)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@exemple.bj"
                      className="w-full min-h-[44px] bg-[#141414] border border-[#333333] focus:border-[#C7A747] px-3.5 py-2 text-xs text-[#F4F1E9] outline-none"
                    />
                  </div>
                </div>

                {/* 2. Destination de livraison */}
                <div className="space-y-3.5">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#C7A747] flex items-center gap-1.5 pb-1 border-b border-[#242424]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>2. Adresse au Bénin</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs text-[#888] font-mono block mb-1">
                        Ville <span className="text-[#C7A747]">*</span>
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full min-h-[44px] bg-[#141414] border border-[#333333] focus:border-[#C7A747] px-3 py-2 text-xs text-[#F4F1E9] outline-none cursor-pointer"
                      >
                        {BENIN_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-[#888] font-mono block mb-1">
                        Quartier <span className="text-[#C7A747]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Ex : Cadjehoun..."
                        className="w-full min-h-[44px] bg-[#141414] border border-[#333333] focus:border-[#C7A747] px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick Quartier Chips for 1-Tap Fill on mobile */}
                  {popularQuartiers.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#777D86] font-mono block">
                        Suggestions rapides {city} :
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {popularQuartiers.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setDistrict(q)}
                            className={`px-2 py-0.5 text-[10px] font-mono border transition-colors ${
                              district.toLowerCase() === q.toLowerCase()
                                ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                                : 'bg-[#1f1f1f] text-[#888] hover:text-[#F4F1E9] border-[#2e2e2e]'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-[#888] font-mono block mb-1">
                      Repère ou Rue précise
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex : Face pharmacie, portail noir, rue pavée..."
                      className="w-full min-h-[44px] bg-[#141414] border border-[#333333] focus:border-[#C7A747] px-3.5 py-2 text-xs text-[#F4F1E9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#888] font-mono block mb-1">
                      Mode de livraison :
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full min-h-[44px] bg-[#141414] border border-[#333333] focus:border-[#C7A747] px-3 py-2 text-xs text-[#F4F1E9] outline-none cursor-pointer"
                    >
                      {deliveryZones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} — {z.fee > 0 ? `${formatCurrency(z.fee)}` : 'Livraison Offerte'} ({z.estimatedTime})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Mode de Règlement */}
              <div className="pt-4 border-t border-[#242424] space-y-3">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#C7A747] flex items-center gap-1.5 pb-1 border-b border-[#242424]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>3. Mode de Règlement</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Cash on Delivery (Standard Bénin) */}
                  <label
                    className={`p-3.5 border cursor-pointer flex items-start gap-3 transition-all min-h-[56px] ${
                      paymentMethod === 'cod'
                        ? 'border-[#C7A747] bg-[#222222] ring-1 ring-[#C7A747]'
                        : 'border-[#2d2d2d] bg-[#181818] hover:border-[#444]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-0.5 accent-[#C7A747] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#F4F1E9] block">
                        Paiement à la livraison (Espèces ou Mobile Money)
                      </span>
                      <p className="text-[11px] text-[#777D86] leading-relaxed mt-0.5">
                        Vous payez au coursier après vérification du colis. Monnaie préparée si vous réglez en espèces.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Mobile Money FedaPay */}
                  <label
                    className={`p-3.5 border cursor-pointer flex items-start gap-3 transition-all min-h-[56px] ${
                      paymentMethod === 'fedapay_mobile_money'
                        ? 'border-[#C7A747] bg-[#222222] ring-1 ring-[#C7A747]'
                        : 'border-[#2d2d2d] bg-[#181818] hover:border-[#444]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="fedapay_mobile_money"
                      checked={paymentMethod === 'fedapay_mobile_money'}
                      onChange={() => setPaymentMethod('fedapay_mobile_money')}
                      className="mt-0.5 accent-[#C7A747] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#F4F1E9] block">
                        Paiement Mobile Money en ligne (MTN, Moov, Celtiis)
                      </span>
                      <p className="text-[11px] text-[#777D86] leading-relaxed mt-0.5">
                        Paiement sécurisé en ligne par FedaPay avec confirmation par push USSD sur votre téléphone.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 4. Mini Itemized Order Summary */}
              <div className="p-4 bg-[#141414] border border-[#262626] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-[#777D86]">
                  <span>Récapitulatif des articles ({cart.length})</span>
                  <span>{formatCurrency(cartSubtotal)}</span>
                </div>

                <div className="divide-y divide-[#222222] max-h-36 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.variantId} className="py-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-10 object-cover bg-[#1c1c1c] border border-[#333] shrink-0"
                        />
                        <div className="truncate">
                          <span className="text-[#F4F1E9] font-medium block truncate">{item.name}</span>
                          <span className="text-[10px] text-[#777D86] font-mono">
                            Taille: {item.size} • Qté: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#F4F1E9] shrink-0 ml-2">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#242424] space-y-1 text-xs text-[#777D86] font-mono">
                  {appliedPromo && (
                    <div className="flex justify-between text-[#C7A747]">
                      <span>Code promo ({appliedPromo.code}) :</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Frais de livraison ({currentZone?.name}) :</span>
                    <span className="text-[#F4F1E9]">
                      {shippingFee === 0 ? <strong className="text-[#4ade80]">Offerts</strong> : formatCurrency(shippingFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#262626] flex justify-between font-bold text-sm sm:text-base text-[#F4F1E9]">
                    <span className="font-heading">Total à payer :</span>
                    <span className="font-heading text-[#C7A747] text-lg">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Legal Notification Consent (Loi Béninoise n° 2017-20 / RGPD) */}
              <div className="p-3 bg-[#131313] border border-[#262626] rounded-xs">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#9ca3af] select-none">
                  <input
                    type="checkbox"
                    checked={customerConsent}
                    onChange={(e) => setCustomerConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#C7A747] cursor-pointer shrink-0"
                  />
                  <span className="leading-snug text-[11px] font-mono">
                    J'accepte de recevoir les notifications d'état et de livraison de ma commande par <strong className="text-[#F4F1E9]">WhatsApp</strong> et <strong className="text-[#F4F1E9]">Email</strong> (réception, préparation, expédition et arrivée du coursier) conformément à la politique de confidentialité HP COLLECTION.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full min-h-[50px] py-4 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement de votre commande...</span>
                  </>
                ) : (
                  <span>Confirmer la commande ({formatCurrency(finalTotal)})</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#777D86] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C7A747]" />
                <span>Paiement à la livraison garanti • Essayage possible au déballage</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FedaPay Sandbox Simulator Modal */}
      {confirmedOrder && (
        <FedaPaySimulatorModal
          order={confirmedOrder}
          isOpen={isFedaPayOpen}
          onClose={() => {
            setIsFedaPayOpen(false);
            setIsSuccessOpen(true);
          }}
          onSuccess={(updated) => {
            setConfirmedOrder(updated);
            setIsFedaPayOpen(false);
            setIsSuccessOpen(true);
          }}
        />
      )}

      {/* Final Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          isOpen={isSuccessOpen}
          onClose={() => {
            setIsSuccessOpen(false);
            setConfirmedOrder(null);
          }}
        />
      )}
    </>
  );
};
