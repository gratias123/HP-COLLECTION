import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle2,
  Truck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartCount,
    isCartOpen,
    closeCart,
    updateCartQuantity,
    removeFromCart,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    openCheckout,
    formatCurrency,
    settings,
    setCurrentPage,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings?.freeShippingThreshold || 75000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const estimatedTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsValidatingPromo(true);
    await applyPromoCode(promoInput.trim());
    setIsValidatingPromo(false);
    setPromoInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={closeCart} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#181818] border-l border-[#282828] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#282828] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C7A747]" />
              <h2 className="font-heading text-lg font-bold text-[#F4F1E9] tracking-wide">
                Votre Panier ({cartCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-[#777D86] hover:text-[#F4F1E9] transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping banner */}
          <div className="px-5 py-3 bg-[#1f1f1f] border-b border-[#282828] text-xs">
            {remainingForFreeShipping > 0 ? (
              <div>
                <p className="text-[#777D86] flex items-center gap-1.5 mb-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C7A747]" />
                  <span>
                    Plus que <strong className="text-[#F4F1E9]">{formatCurrency(remainingForFreeShipping)}</strong> pour la livraison offerte au Bénin !
                  </span>
                </p>
                <div className="w-full bg-[#141414] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C7A747] h-full transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-[#4ade80] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Félicitations ! Livraison standard offerte sur cette commande !</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#777D86]">
                <ShoppingBag className="w-14 h-14 mb-4 text-[#333333]" />
                <h3 className="font-heading text-lg font-semibold text-[#F4F1E9] mb-1">
                  Votre panier est vide
                </h3>
                <p className="text-xs max-w-xs mb-6">
                  Découvrez nos nouvelles vestes varsity, sneakers urbaines et ensembles de jogging.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    setCurrentPage('catalog');
                  }}
                  className="px-6 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
                >
                  Explorer la collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3.5 p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xs"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-xs bg-[#141414] shrink-0 border border-[#2c2c2c]"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-[#F4F1E9] line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-[#777D86] hover:text-[#ff7878] transition-colors p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#777D86] mt-0.5 space-x-2">
                        <span>Taille : <strong className="text-[#F4F1E9]">{item.size}</strong></span>
                        {item.color && (
                          <span>• Couleur : <strong className="text-[#F4F1E9]">{item.color}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#282828]">
                      {/* Quantity selector */}
                      <div className="flex items-center border border-[#333333] bg-[#161616] rounded-xs">
                        <button
                          onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:text-[#C7A747] text-[#777D86] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-[#F4F1E9]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 hover:text-[#C7A747] text-[#777D86] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-heading text-xs sm:text-sm font-bold text-[#F4F1E9]">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer / Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#282828] bg-[#1a1a1a] space-y-4">
              {/* Promo Code Input */}
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 bg-[#C7A747]/10 border border-[#C7A747]/30 rounded-xs text-xs">
                  <div className="flex items-center gap-1.5 text-[#C7A747] font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Code « {appliedPromo.code} » appliqué (-{formatCurrency(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-xs text-[#777D86] hover:text-[#ff7878] underline"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Code promo (ex: WELCOME10)"
                    className="flex-1 bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] uppercase outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isValidatingPromo || !promoInput.trim()}
                    className="px-3 py-2 bg-[#282828] hover:bg-[#333333] text-xs font-semibold text-[#F4F1E9] rounded-xs transition-colors disabled:opacity-50"
                  >
                    {isValidatingPromo ? '...' : 'Appliquer'}
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#777D86]">
                <div className="flex justify-between">
                  <span>Sous-total articles :</span>
                  <span className="text-[#F4F1E9] font-medium">{formatCurrency(cartSubtotal)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-[#C7A747]">
                    <span>Réduction promo :</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frais de livraison :</span>
                  <span className="text-[#777D86] italic">Calculés à la validation</span>
                </div>
                <div className="pt-2 border-t border-[#262626] flex justify-between text-sm sm:text-base font-bold text-[#F4F1E9]">
                  <span className="font-heading">Total estimé :</span>
                  <span className="font-mono text-[#C7A747] text-base">{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={openCheckout}
                className="w-full py-4 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-extrabold text-xs uppercase tracking-widest rounded-none transition-colors flex items-center justify-center gap-2 shadow-xl active:scale-[0.99]"
              >
                <span>Passer la Commande</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] font-mono text-center text-[#777D86]">
                Paiement à la livraison accepté • Bénin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
