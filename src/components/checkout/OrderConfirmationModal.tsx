import React from 'react';
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
  ShoppingBag,
} from 'lucide-react';

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
  const { formatCurrency, settings, setCurrentPage } = useStore();

  if (!isOpen || !order) return null;

  const whatsappPhone = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || '22997000000';
  const whatsappMessage = encodeURIComponent(
    `Bonjour HP COLLECTION ! Je viens de valider la commande #${order.orderNumber} d'un montant de ${formatCurrency(
      order.total
    )} pour livraison à ${order.customer.city} (${order.customer.district}). Merci de me confirmer la prise en charge.`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm shadow-2xl p-6 sm:p-8 overflow-hidden my-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#777D86] hover:text-[#F4F1E9] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center pb-6 border-b border-[#282828]">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#C7A747]/10 border border-[#C7A747]/30 flex items-center justify-center text-[#C7A747] mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#C7A747] font-semibold">
            Commande Confirmée
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F1E9] mt-1">
            Merci pour votre commande !
          </h2>
          <p className="text-xs sm:text-sm text-[#777D86] mt-2">
            Numéro de référence : <strong className="text-[#C7A747] font-mono text-base">{order.orderNumber}</strong>
          </p>
        </div>

        {/* Order Details Body */}
        <div className="py-6 space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          {/* Status Box */}
          <div className="p-4 bg-[#222222] border border-[#2e2e2e] rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#777D86] block text-[11px] uppercase tracking-wider">État du règlement :</span>
              <span className="font-bold text-sm text-[#F4F1E9] flex items-center gap-1.5 mt-0.5">
                {order.paymentStatus === 'paid' ? (
                  <span className="text-[#4ade80]">✓ Règlement validé en ligne</span>
                ) : (
                  <span className="text-[#f59e0b]">⏳ En attente de règlement à la livraison</span>
                )}
              </span>
            </div>

            <div>
              <span className="text-[#777D86] block text-[11px] uppercase tracking-wider">Mode choisi :</span>
              <span className="font-semibold text-xs text-[#F4F1E9]">
                {order.paymentMethod === 'cod' ? 'Paiement à la livraison (Cash/MoMo)' : 'Mobile Money (FedaPay)'}
              </span>
            </div>
          </div>

          {/* Delivery coordinates */}
          <div className="p-4 bg-[#181818] border border-[#262626] rounded-xs space-y-2 text-xs">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#C7A747] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Coordonnées de livraison au Bénin</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#777D86]">
              <div>
                <span className="text-[#F4F1E9] font-medium block">{order.customer.fullName}</span>
                <span>Tél : <strong className="text-[#F4F1E9]">{order.customer.phone}</strong></span>
              </div>
              <div>
                <span>Zone : <strong className="text-[#F4F1E9]">{order.shippingZone}</strong></span>
                <p className="text-[#F4F1E9]/80 mt-0.5">
                  {order.customer.city}, {order.customer.district}
                </p>
                {order.customer.address && (
                  <p className="text-[11px] italic text-[#777D86]">{order.customer.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div>
            <h4 className="font-heading text-xs uppercase tracking-wider text-[#777D86] font-bold mb-3 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#C7A747]" />
              <span>Articles commandés ({order.items.length})</span>
            </h4>

            <div className="divide-y divide-[#282828] border-y border-[#282828]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-12 h-14 object-cover rounded-xs bg-[#141414] border border-[#2a2a2a]"
                    />
                    <div>
                      <h5 className="font-semibold text-[#F4F1E9] line-clamp-1">{item.productName}</h5>
                      <span className="text-[11px] text-[#777D86]">
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
            <div className="pt-3 space-y-1.5 text-xs text-[#777D86]">
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span className="text-[#F4F1E9]">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#C7A747]">
                  <span>Réduction appliquée ({order.promoCode}) :</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frais de livraison :</span>
                <span className="text-[#F4F1E9]">{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="pt-2 border-t border-[#282828] flex justify-between font-bold text-sm sm:text-base text-[#F4F1E9]">
                <span className="font-heading">Total à régler :</span>
                <span className="font-heading text-[#C7A747]">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-6 border-t border-[#282828] flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-[#121212] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Assistance WhatsApp Express</span>
          </a>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                setCurrentPage('order-tracking');
              }}
              className="flex-1 sm:flex-initial px-4 py-3 bg-[#282828] hover:bg-[#333333] text-xs font-semibold text-[#F4F1E9] rounded-xs transition-colors"
            >
              Suivre le colis
            </button>
            <button
              onClick={() => {
                onClose();
                setCurrentPage('catalog');
              }}
              className="flex-1 sm:flex-initial px-4 py-3 bg-[#C7A747] hover:bg-[#b8973b] text-xs font-bold text-[#171717] rounded-xs transition-colors"
            >
              Continuer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
