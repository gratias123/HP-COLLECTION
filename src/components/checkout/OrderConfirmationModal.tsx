import React, { useState } from 'react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  PhoneCall,
  Share2,
  X,
  Printer,
  Copy,
  Check,
  ArrowRight,
  MessageCircle,
  FileText,
} from 'lucide-react';
import { CommercialDocumentModal } from '../common/CommercialDocumentModal';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { formatCurrency, settings, setCurrentPage, showToast } = useStore();
  const [copied, setCopied] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  if (!isOpen || !order) return null;

  const whatsappPhone = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || '22997000000';
  const whatsappMessage = encodeURIComponent(
    `Bonjour HP COLLECTION ! Je viens de valider la commande #${order.orderNumber} d'un montant de ${formatCurrency(
      order.total
    )} pour livraison à ${order.customer.city} (${order.customer.district}). Merci de me confirmer la prise en charge.`
  );

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    showToast(`Numéro #${order.orderNumber} copié !`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToTracking = () => {
    onClose();
    setCurrentPage('order-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#171717] border border-[#2e2e2e] shadow-2xl p-4 sm:p-6 md:p-8 overflow-hidden my-auto max-h-[92vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#777D86] hover:text-[#F4F1E9] transition-colors rounded-full hover:bg-[#202020]"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center pb-6 border-b border-[#242424]">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#C7A747] font-bold">
            COMMANDE ENREGISTRÉE AVEC SUCCÈS
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F1E9] mt-1">
            Merci pour votre commande !
          </h2>
          <p className="text-xs text-[#777D86] mt-2 max-w-md mx-auto">
            Votre colis est désormais en préparation par notre équipe logistique. Notre service de livraison vous appellera pour convenir de la remise.
          </p>

          {/* Order reference pill with 1-click copy */}
          <div className="mt-4 inline-flex items-center gap-2 p-1.5 px-3 bg-[#1e1e1e] border border-[#333] rounded-xs">
            <span className="text-xs text-[#888] font-mono">Référence :</span>
            <strong className="text-[#C7A747] font-mono text-sm tracking-wider">
              {order.orderNumber}
            </strong>
            <button
              onClick={handleCopyOrderNumber}
              className="p-1 text-[#888] hover:text-[#F4F1E9] transition-colors"
              title="Copier le numéro"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="py-5 space-y-5">
          {/* Status Alert Box */}
          <div className="p-3.5 bg-[#1f1f1f] border border-[#2b2b2b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-[#777D86] block text-[10px] uppercase tracking-wider">
                État du paiement :
              </span>
              <span className="font-bold text-xs text-[#F4F1E9] flex items-center gap-1.5 mt-0.5">
                {order.paymentStatus === 'paid' ? (
                  <span className="text-[#4ade80]">✓ Règlement validé en ligne</span>
                ) : (
                  <span className="text-[#fbbf24]">⏳ En attente de règlement à la réception</span>
                )}
              </span>
            </div>

            <div>
              <span className="text-[#777D86] block text-[10px] uppercase tracking-wider">
                Mode de livraison :
              </span>
              <span className="font-semibold text-xs text-[#F4F1E9]">
                {order.shippingZone}
              </span>
            </div>
          </div>

          {/* Delivery Coordinates */}
          <div className="p-4 bg-[#141414] border border-[#242424] space-y-2 text-xs">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#C7A747] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Coordonnées de livraison au Bénin</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#777D86] font-mono">
              <div>
                <span className="text-[#F4F1E9] font-medium block">{order.customer.fullName}</span>
                <span>Tél : <strong className="text-[#F4F1E9]">{order.customer.phone}</strong></span>
              </div>
              <div>
                <p className="text-[#F4F1E9]">
                  {order.customer.city}, {order.customer.district}
                </p>
                {order.customer.address && (
                  <p className="text-[11px] italic text-[#888]">{order.customer.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div>
            <h4 className="font-heading text-xs uppercase tracking-wider text-[#777D86] font-bold mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#C7A747]" />
              <span>Articles commandés ({order.items.length})</span>
            </h4>

            <div className="divide-y divide-[#242424] border-y border-[#242424]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-10 h-12 object-cover bg-[#141414] border border-[#2a2a2a]"
                    />
                    <div>
                      <h5 className="font-semibold text-[#F4F1E9] line-clamp-1">{item.productName}</h5>
                      <span className="text-[11px] text-[#777D86] font-mono">
                        Taille : {item.size} • Qté : {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#F4F1E9]">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="pt-3 space-y-1 text-xs text-[#777D86] font-mono">
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span className="text-[#F4F1E9]">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#C7A747]">
                  <span>Réduction appliquée :</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frais de livraison :</span>
                <span className="text-[#F4F1E9]">{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="pt-2 border-t border-[#242424] flex justify-between font-bold text-base text-[#F4F1E9]">
                <span className="font-heading">Total à régler :</span>
                <span className="font-heading text-[#C7A747] text-lg">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Action Suite (WhatsApp, Tracking, Print) */}
          <div className="pt-4 border-t border-[#242424] space-y-2.5">
            <a
              href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[46px] py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-[#121212] font-heading font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Notifier notre service client sur WhatsApp</span>
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleGoToTracking}
                className="py-3 px-3 bg-[#242424] hover:bg-[#2e2e2e] text-[#F4F1E9] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#333]"
              >
                <span>Suivre mon colis</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C7A747]" />
              </button>

              <button
                type="button"
                onClick={() => setIsDocModalOpen(true)}
                className="py-3 px-3 bg-[#242424] hover:bg-[#2e2e2e] text-[#C7A747] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#C7A747]/40 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Facture / Reçu</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Document Modal */}
      {isDocModalOpen && order && (
        <CommercialDocumentModal
          order={order}
          isOpen={true}
          onClose={() => setIsDocModalOpen(false)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};
