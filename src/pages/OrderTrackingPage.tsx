import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Order, OrderFulfillmentStatus } from '../types';
import {
  PackageCheck,
  Search,
  Phone,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
} from 'lucide-react';

const STATUS_STEPS: Array<{ key: OrderFulfillmentStatus; label: string }> = [
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmée' },
  { key: 'processing', label: 'En préparation' },
  { key: 'shipped', label: 'En cours de livraison' },
  { key: 'delivered', label: 'Livrée' },
];

export const OrderTrackingPage: React.FC = () => {
  const { formatCurrency, settings } = useStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setErrorMsg('Veuillez saisir votre numéro de commande et votre téléphone.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setFoundOrder(null);

    try {
      const res = await api.trackOrder(orderNumber.trim(), phone.trim());
      setFoundOrder(res.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Aucune commande trouvée avec ces identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status: OrderFulfillmentStatus): number => {
    if (status === 'cancelled') return -1;
    const index = STATUS_STEPS.findIndex((s) => s.key === status);
    return index !== -1 ? index : 0;
  };

  const currentStepIndex = foundOrder ? getStepIndex(foundOrder.fulfillmentStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#202020] border border-[#C7A747]/40 flex items-center justify-center text-[#C7A747] mx-auto mb-3">
          <PackageCheck className="w-6 h-6" />
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-[#F4F1E9]">
          Suivi de Commande & Livraison
        </h1>
        <p className="text-xs sm:text-sm text-[#777D86] leading-relaxed">
          Suivez en direct l’acheminement de votre colis à Cotonou, Calavi ou partout en République du Bénin.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-6 rounded-xs shadow-xl max-w-2xl mx-auto">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#777D86] font-medium block mb-1">
                Numéro de commande :
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="Ex : HPC-2026-8942"
                className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-3 py-2.5 text-xs text-[#F4F1E9] uppercase outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-[#777D86] font-medium block mb-1">
                Téléphone de livraison :
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex : 97000000"
                className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-3 py-2.5 text-xs text-[#F4F1E9] outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#3d1919] border border-[#8a2424] rounded-xs text-xs text-[#ffb4b4] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recherche en cours...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Consulter le statut du colis</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Found Order Card */}
      {foundOrder && (
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#282828] gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#C7A747] font-bold">
                COMMANDE IDENTIFIÉE
              </span>
              <h2 className="font-heading text-2xl font-extrabold text-[#F4F1E9]">
                #{foundOrder.orderNumber}
              </h2>
              <span className="text-xs text-[#777D86]">
                Enregistrée le {new Date(foundOrder.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-xs text-[#777D86]">Montant total de la commande :</span>
              <span className="font-heading text-xl font-bold text-[#C7A747]">
                {formatCurrency(foundOrder.total)}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#242424] text-[#F4F1E9] font-medium border border-[#333333]">
                {foundOrder.paymentStatus === 'paid' ? '✓ Règlement Payé' : '⏳ Règlement à la livraison'}
              </span>
            </div>
          </div>

          {/* Stepper Progress */}
          {foundOrder.fulfillmentStatus === 'cancelled' ? (
            <div className="p-4 bg-[#3a1919] border border-[#6b2525] rounded text-xs text-[#ff9999] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Cette commande a été annulée. Contactez le service client pour toute question.</span>
            </div>
          ) : (
            <div className="py-4">
              <span className="text-xs font-semibold text-[#777D86] uppercase tracking-wider block mb-4">
                Progression de l'expédition :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-xs border text-center transition-all ${
                        isCurrent
                          ? 'border-[#C7A747] bg-[#C7A747]/10 text-[#C7A747]'
                          : isDone
                          ? 'border-[#2d4a2d] bg-[#1a291a] text-[#4ade80]'
                          : 'border-[#282828] bg-[#161616] text-[#555]'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold mb-1">
                        ÉTAPE {idx + 1}
                      </div>
                      <div className="text-xs font-semibold">{step.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Destination Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#282828] text-xs">
            <div className="p-4 bg-[#181818] border border-[#262626] rounded-xs space-y-1 text-[#777D86]">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F4F1E9] flex items-center gap-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5 text-[#C7A747]" />
                <span>Adresse de livraison au Bénin</span>
              </h4>
              <p className="text-[#F4F1E9] font-medium">{foundOrder.customer.fullName}</p>
              <p>Tél : {foundOrder.customer.phone}</p>
              <p>Ville : {foundOrder.customer.city} ({foundOrder.customer.district})</p>
              {foundOrder.customer.address && <p>Précision : {foundOrder.customer.address}</p>}
            </div>

            <div className="p-4 bg-[#181818] border border-[#262626] rounded-xs space-y-1 text-[#777D86]">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F4F1E9] flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-[#C7A747]" />
                <span>Détails & Assistance</span>
              </h4>
              <p>Zone de livraison : <strong className="text-[#F4F1E9]">{foundOrder.shippingZone}</strong></p>
              <p>Mode : {foundOrder.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Mobile Money'}</p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${settings?.whatsappNumber?.replace(/[^0-9]/g, '') || '22997000000'}?text=${encodeURIComponent(
                    `Bonjour HP COLLECTION, je souhaite avoir une mise à jour sur ma commande #${foundOrder.orderNumber}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#25D366] hover:underline font-bold text-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Contacter le support WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Items list */}
          <div className="pt-4 border-t border-[#282828]">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#777D86] mb-3">
              Articles inclus dans ce colis :
            </h4>
            <div className="space-y-2">
              {foundOrder.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-[#171717] border border-[#262626] rounded-xs text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img src={it.image} alt="" className="w-10 h-12 object-cover rounded-xs bg-[#111]" />
                    <div>
                      <span className="font-medium text-[#F4F1E9] block">{it.productName}</span>
                      <span className="text-[11px] text-[#777D86]">Taille : {it.size} • Qté : {it.quantity}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#F4F1E9]">{formatCurrency(it.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
