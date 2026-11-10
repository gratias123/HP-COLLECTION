import React, { useState, useEffect } from 'react';
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
  Truck,
  ArrowRight,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { CommercialDocumentModal } from '../components/common/CommercialDocumentModal';

const STATUS_STEPS: Array<{ key: OrderFulfillmentStatus; label: string; desc: string }> = [
  { key: 'pending', label: 'En attente', desc: 'Commande enregistrée dans notre système' },
  { key: 'confirmed', label: 'Confirmée', desc: 'Validée par le service commercial' },
  { key: 'processing', label: 'En préparation', desc: 'Emballage soigné & vérification qualité' },
  { key: 'shipped', label: 'En cours de livraison', desc: 'En route avec notre coursier moto dédié' },
  { key: 'delivered', label: 'Livrée', desc: 'Colis remis en main propre avec succès' },
];

export const OrderTrackingPage: React.FC = () => {
  const { formatCurrency, settings, setCurrentPage } = useStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Recent orders stored on this device
  const [recentOrders, setRecentOrders] = useState<Array<{ orderNumber: string; phone: string; date: string; total: number }>>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hp_recent_orders');
      if (saved) {
        setRecentOrders(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleTrackDirect = async (targetOrderNumber: string, targetPhone: string) => {
    setOrderNumber(targetOrderNumber);
    setPhone(targetPhone);
    setIsLoading(true);
    setErrorMsg(null);
    setFoundOrder(null);

    try {
      const res = await api.trackOrder(targetOrderNumber.trim(), targetPhone.trim());
      setFoundOrder(res.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Aucune commande trouvée avec ces identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setErrorMsg('Veuillez saisir votre numéro de commande (ex: HPC-2026-XXXX).');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Veuillez renseigner le numéro de téléphone utilisé pour la commande.');
      return;
    }

    handleTrackDirect(orderNumber.trim(), phone.trim());
  };

  const getStepIndex = (status: OrderFulfillmentStatus): number => {
    if (status === 'cancelled') return -1;
    const index = STATUS_STEPS.findIndex((s) => s.key === status);
    return index !== -1 ? index : 0;
  };

  const currentStepIndex = foundOrder ? getStepIndex(foundOrder.fulfillmentStatus) : 0;

  const whatsappPhone = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || '22997000000';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C7A747] font-semibold block">
          Expédition & Coursier • Bénin
        </span>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F1E9]">
          Suivi de Commande
        </h1>
        <p className="text-xs sm:text-sm text-[#777D86] leading-relaxed font-light">
          Consultez en temps réel l’acheminement de vos pièces directement vers votre adresse de destination.
        </p>
      </div>

      {/* 1-Tap Recent Orders on this device */}
      {recentOrders.length > 0 && !foundOrder && (
        <div className="bg-[#181818] border border-[#2b2b2b] p-4 sm:p-5 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C7A747] font-semibold block">
            Vos Commandes Récentes sur cet Appareil
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recentOrders.map((rec) => (
              <button
                key={rec.orderNumber}
                type="button"
                onClick={() => handleTrackDirect(rec.orderNumber, rec.phone)}
                className="p-3 bg-[#202020] hover:bg-[#262626] border border-[#2e2e2e] hover:border-[#C7A747] text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="font-mono font-bold text-xs text-[#F4F1E9] block">
                    #{rec.orderNumber}
                  </span>
                  <span className="text-[10px] text-[#777D86] font-mono">
                    {formatCurrency(rec.total)} • {new Date(rec.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="text-[#C7A747] text-xs font-mono flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Suivre</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Lookup Form */}
      <div className="bg-[#181818] border border-[#262626] p-5 sm:p-6 shadow-xl max-w-2xl mx-auto space-y-4">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#888] font-mono block mb-1">
                Numéro de commande :
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="Ex : HPC-2026-8942"
                className="w-full min-h-[44px] bg-[#121212] border border-[#333333] focus:border-[#C7A747] px-3.5 py-2 text-xs text-[#F4F1E9] uppercase outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-[#888] font-mono block mb-1">
                Téléphone de livraison :
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex : 97000000"
                className="w-full min-h-[44px] bg-[#121212] border border-[#333333] focus:border-[#C7A747] px-3.5 py-2 text-xs text-[#F4F1E9] outline-none font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#3d1919] border border-[#8a2424] text-xs text-[#ffb4b4] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#ff7878]" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[46px] py-3 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recherche de votre colis...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Vérifier le statut du colis</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Found Order Card */}
      {foundOrder && (
        <div className="bg-[#181818] border border-[#282828] p-5 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#242424] gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C7A747] font-bold">
                COMMANDE IDENTIFIÉE
              </span>
              <h2 className="font-heading text-2xl font-extrabold text-[#F4F1E9]">
                #{foundOrder.orderNumber}
              </h2>
              <span className="text-xs text-[#777D86] font-mono">
                Enregistrée le {new Date(foundOrder.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex flex-col sm:items-end gap-1 font-mono">
              <span className="text-xs text-[#777D86]">Total commande :</span>
              <span className="font-heading text-xl font-bold text-[#C7A747]">
                {formatCurrency(foundOrder.total)}
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-[#242424] text-[#F4F1E9] border border-[#333]">
                {foundOrder.paymentStatus === 'paid' ? 'Règlement validé en ligne' : 'Règlement à la livraison'}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-4">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F4F1E9] mb-4">
              Progression de la livraison
            </h3>

            <div className="relative">
              {/* Stepper line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#242424] -z-0" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-[#C7A747] -z-0 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              />

              <div className="grid grid-cols-5 relative z-10 text-center gap-1">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-[#C7A747] text-[#171717] ring-4 ring-[#171717]'
                            : 'bg-[#222] text-[#666] border border-[#333]'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-mono mt-2 uppercase tracking-tight block ${
                          isCurrent
                            ? 'text-[#C7A747] font-bold'
                            : isDone
                            ? 'text-[#F4F1E9]'
                            : 'text-[#666]'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-[9px] text-[#777D86] hidden sm:block mt-0.5 leading-tight">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Destination & Items details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#242424] text-xs font-mono">
            <div className="p-4 bg-[#141414] border border-[#242424] space-y-2">
              <span className="text-[#C7A747] font-bold block uppercase text-[10px]">
                Lieu de déballage
              </span>
              <p className="text-[#F4F1E9] font-medium">{foundOrder.customer.fullName}</p>
              <p className="text-[#777D86]">
                {foundOrder.customer.city}, {foundOrder.customer.district}
              </p>
              {foundOrder.customer.address && (
                <p className="text-[#777D86] italic text-[11px]">{foundOrder.customer.address}</p>
              )}
              <p className="text-[#F4F1E9] pt-1">Tél : {foundOrder.customer.phone}</p>
            </div>

            <div className="p-4 bg-[#141414] border border-[#242424] space-y-2">
              <span className="text-[#C7A747] font-bold block uppercase text-[10px]">
                Articles ({foundOrder.items.length})
              </span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {foundOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="text-[#F4F1E9] truncate mr-2">
                      {it.quantity}x {it.productName} ({it.size})
                    </span>
                    <span className="text-[#777D86] shrink-0">{formatCurrency(it.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Courier Contact Button & Commercial Documents / Returns */}
          <div className="pt-2 space-y-2.5">
            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                `Bonjour HP COLLECTION ! J'aimerais avoir des nouvelles précises sur l'acheminement de ma commande #${foundOrder.orderNumber}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#202020] hover:bg-[#262626] text-[#F4F1E9] border border-[#333333] hover:border-[#25D366] text-xs font-mono flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Contacter l'assistance coursier sur WhatsApp</span>
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsDocModalOpen(true)}
                className="py-3 px-4 bg-[#252525] hover:bg-[#2e2e2e] text-[#C7A747] border border-[#333] hover:border-[#C7A747]/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Télécharger Facture / Reçu PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('returns');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-3 px-4 bg-[#202020] hover:bg-[#262626] text-[#F4F1E9] border border-[#333] text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#C7A747]" />
                <span>Demander un Retour / Échange</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commercial Document Modal */}
      {isDocModalOpen && foundOrder && (
        <CommercialDocumentModal
          order={foundOrder}
          isOpen={true}
          onClose={() => setIsDocModalOpen(false)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};
