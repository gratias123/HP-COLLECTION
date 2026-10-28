import React, { useState } from 'react';
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
  Sparkles,
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

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Cotonou');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(() => deliveryZones[0]?.id || 'zone-cotonou');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'fedapay_mobile_money'>('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success & Payment modals
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isFedaPayOpen, setIsFedaPayOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  if (!isCheckoutOpen && !isSuccessOpen && !isFedaPayOpen) return null;

  // Selected Zone
  const currentZone = deliveryZones.find((z) => z.id === selectedZoneId) || deliveryZones[0];
  let shippingFee = currentZone ? currentZone.fee : 1500;
  if (currentZone?.freeDeliveryThreshold && cartSubtotal >= currentZone.freeDeliveryThreshold) {
    shippingFee = 0;
  }

  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMessage('Veuillez renseigner votre nom complet.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Veuillez renseigner un numéro de téléphone valide au Bénin (ex: 97 00 00 00).');
      return;
    }

    if (!district.trim()) {
      setErrorMessage('Veuillez préciser votre quartier (ex: Cadjehoun, Akpakpa, Tankpè...).');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim() || undefined,
          city,
          district: district.trim(),
          address: address.trim(),
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
      };

      const res = await api.createOrder(payload);
      const order = res.order;

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
      setErrorMessage(err.message || 'Impossible de valider votre commande. Veuillez vérifier vos articles et réessayer.');
      showToast(err.message || 'Erreur lors de la validation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl bg-[#1a1a1a] border border-[#2e2e2e] rounded-sm shadow-2xl p-6 sm:p-8 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeCheckout}
              className="absolute top-4 right-4 p-2 text-[#777D86] hover:text-[#F4F1E9] transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="pb-5 border-b border-[#282828] mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#C7A747] font-semibold block">
                Finalisation de votre commande
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#F4F1E9] mt-0.5">
                Coordonnées de Livraison & Paiement au Bénin
              </h2>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3 bg-[#3d1919] border border-[#8a2424] rounded-xs text-xs text-[#ffb4b4] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Customer details */}
                <div className="space-y-4">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#C7A747] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>1. Vos Coordonnées</span>
                  </h3>

                  <div>
                    <label className="text-xs text-[#777D86] font-medium block mb-1">
                      Nom & Prénom <span className="text-[#C7A747]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex : Koffi Sègla"
                      className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#777D86] font-medium block mb-1">
                      Téléphone pour la livraison <span className="text-[#C7A747]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#777D86] absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex : 97 00 00 00 / 95 00 00 00"
                        className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs pl-9 pr-3 py-2 text-xs text-[#F4F1E9] outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-[#777D86] mt-0.5 block">
                      Le coursier vous appellera sur ce numéro avant son départ.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-[#777D86] font-medium block mb-1">
                      Adresse email (facultatif pour le reçu)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#777D86] absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nom@exemple.bj"
                        className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs pl-9 pr-3 py-2 text-xs text-[#F4F1E9] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Destination details */}
                <div className="space-y-4">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#C7A747] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>2. Lieu de Livraison</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[#777D86] font-medium block mb-1">
                        Ville / Commune <span className="text-[#C7A747]">*</span>
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-2.5 py-2 text-xs text-[#F4F1E9] outline-none"
                      >
                        {BENIN_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-[#777D86] font-medium block mb-1">
                        Quartier <span className="text-[#C7A747]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Ex : Cadjehoun, Tankpè..."
                        className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#777D86] font-medium block mb-1">
                      Repère ou Rue précise (pour faciliter la livraison)
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex : En face de la pharmacie, maison portail bleu..."
                      className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                    />
                  </div>

                  {/* Delivery Zone selection */}
                  <div>
                    <label className="text-xs text-[#777D86] font-medium block mb-1">
                      Option de livraison :
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-2.5 py-2 text-xs text-[#F4F1E9] outline-none"
                    >
                      {deliveryZones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} — {z.fee > 0 ? `${formatCurrency(z.fee)}` : 'Gratuit'} ({z.estimatedTime})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method Choice */}
              <div className="pt-4 border-t border-[#282828] space-y-3">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#C7A747] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>3. Mode de Règlement</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Cash on Delivery */}
                  <label
                    className={`p-3.5 rounded-xs border cursor-pointer flex items-start gap-3 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#C7A747] bg-[#242424]'
                        : 'border-[#333333] bg-[#1a1a1a] hover:border-[#444]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-0.5 accent-[#C7A747]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#F4F1E9] block">
                        💵 Paiement à la Livraison (Cash ou MoMo)
                      </span>
                      <p className="text-[11px] text-[#777D86] leading-relaxed mt-0.5">
                        Réglez en espèces ou par Mobile Money directement au coursier moto lors de la réception de votre colis.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: FedaPay Mobile Money */}
                  <label
                    className={`p-3.5 rounded-xs border cursor-pointer flex items-start gap-3 transition-all ${
                      paymentMethod === 'fedapay_mobile_money'
                        ? 'border-[#C7A747] bg-[#242424]'
                        : 'border-[#333333] bg-[#1a1a1a] hover:border-[#444]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="fedapay_mobile_money"
                      checked={paymentMethod === 'fedapay_mobile_money'}
                      onChange={() => setPaymentMethod('fedapay_mobile_money')}
                      className="mt-0.5 accent-[#C7A747]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#F4F1E9] block">
                        ⚡ Mobile Money en Ligne (FedaPay)
                      </span>
                      <p className="text-[11px] text-[#777D86] leading-relaxed mt-0.5">
                        Paiement instantané par MTN Mobile Money, Moov Money ou Celtiis Cash avec validation USSD sur votre téléphone.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Final Summary */}
              <div className="p-4 bg-[#141414] border border-[#282828] rounded-xs space-y-2 text-xs text-[#777D86]">
                <div className="flex justify-between">
                  <span>Total articles ({cart.length}) :</span>
                  <span className="text-[#F4F1E9]">{formatCurrency(cartSubtotal)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-[#C7A747]">
                    <span>Réduction code ({appliedPromo.code}) :</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Livraison ({currentZone?.name}) :</span>
                  <span className="text-[#F4F1E9]">
                    {shippingFee === 0 ? <strong className="text-[#4ade80]">Offerte</strong> : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#262626] flex justify-between font-bold text-sm sm:text-base text-[#F4F1E9]">
                  <span className="font-heading">Total définitif :</span>
                  <span className="font-heading text-[#C7A747] text-lg">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-extrabold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xl active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement sécurisé de votre commande...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirmer la commande ({formatCurrency(finalTotal)})</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#777D86]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C7A747]" />
                <span>Stocks vérifiés en direct • Aucun paiement débité par avance en mode livraison</span>
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
