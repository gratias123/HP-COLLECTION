import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductForDetail: product,
    closeProductDetail,
    addToCart,
    openCheckout,
    toggleWishlist,
    isInWishlist,
    formatCurrency,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'shipping'>('details');

  // Reset or select default variant when product changes
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);

      // Find first variant in stock
      const firstInStock = product.variants.find((v) => v.stock > 0) || product.variants[0];
      if (firstInStock) {
        setSelectedSize(firstInStock.size);
        setSelectedColor(firstInStock.color);
      } else {
        setSelectedSize(product.sizes[0] || 'Unique');
        setSelectedColor(product.colors[0]?.name || 'Standard');
      }
    }
  }, [product]);

  if (!product) return null;

  // Find variant matching selected size & color
  const currentVariant = product.variants.find(
    (v) =>
      v.size === selectedSize &&
      (!product.colors || product.colors.length === 0 || v.color === selectedColor)
  ) || product.variants.find((v) => v.size === selectedSize) || product.variants[0];

  const currentStock = currentVariant ? currentVariant.stock : 0;
  const isOutOfStock = currentStock <= 0;
  const isFavorite = isInWishlist(product.id);
  const isOnSale = !!product.salePrice && product.salePrice < product.price;
  const effectivePrice = isOnSale && product.salePrice ? product.salePrice : product.price;

  const handleAddToCart = () => {
    if (!currentVariant || isOutOfStock) return;
    addToCart(product, currentVariant.id, quantity);
  };

  const handleDirectBuy = () => {
    if (!currentVariant || isOutOfStock) return;
    const added = addToCart(product, currentVariant.id, quantity);
    if (added) {
      closeProductDetail();
      openCheckout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#1a1a1a] border border-[#2e2e2e] rounded-sm shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeProductDetail}
          className="absolute top-4 right-4 z-20 p-2 bg-[#171717]/80 hover:bg-[#171717] text-[#F4F1E9] hover:text-[#C7A747] rounded-full border border-[#333333] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Left: Images Gallery */}
          <div className="p-4 sm:p-6 bg-[#141414] flex flex-col gap-4">
            <div className="relative aspect-square w-full bg-[#1c1c1c] rounded-xs overflow-hidden border border-[#2a2a2a]">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {isOnSale && (
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#C7A747] text-[#171717] font-black text-xs uppercase tracking-wider rounded-xs shadow-md">
                  PROMO
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xs overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#C7A747] opacity-100'
                        : 'border-[#2e2e2e] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Reassurance notes */}
            <div className="mt-2 pt-4 border-t border-[#242424] space-y-2 text-xs font-mono text-[#777D86]">
              <div className="border-l-2 border-[#C7A747] pl-2.5">
                <span className="text-[#F4F1E9] block font-semibold">Livraison 24h Cotonou & Calavi</span>
                <span className="text-[11px]">Remise en main propre par coursier moto</span>
              </div>
              <div className="border-l-2 border-[#C7A747] pl-2.5">
                <span className="text-[#F4F1E9] block font-semibold">Paiement à la réception</span>
                <span className="text-[11px]">Espèces ou Mobile Money accepté au déballage</span>
              </div>
              <div className="border-l-2 border-[#C7A747] pl-2.5">
                <span className="text-[#F4F1E9] block font-semibold">Échange de taille 48h</span>
                <span className="text-[11px]">Essayage possible lors du passage du livreur</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Controls */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-[#777D86] uppercase tracking-wider mb-2">
                <span className="text-[#C7A747] font-semibold tracking-widest">{product.category}</span>
                <span>RÉF : {currentVariant?.sku || product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#F4F1E9] leading-tight mb-3">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-[#282828]">
                <span className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F1E9]">
                  {formatCurrency(effectivePrice)}
                </span>
                {isOnSale && (
                  <span className="text-sm text-[#777D86] line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
                {isOnSale && product.salePrice && (
                  <span className="text-xs font-bold text-[#C7A747] bg-[#C7A747]/10 px-2 py-0.5 rounded">
                    Économisez {formatCurrency(product.price - product.salePrice)}
                  </span>
                )}
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#777D86] block mb-2">
                    Couleur : <span className="text-[#F4F1E9]">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-xs border flex items-center gap-2 transition-all ${
                          selectedColor === color.name
                            ? 'border-[#C7A747] bg-[#242424] text-[#F4F1E9]'
                            : 'border-[#333333] bg-[#1a1a1a] text-[#777D86] hover:border-[#555]'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <label className="font-semibold uppercase tracking-wider text-[#777D86]">
                    Taille / Pointure : <span className="text-[#F4F1E9]">{selectedSize}</span>
                  </label>
                  <span className="text-[11px] text-[#C7A747] font-medium cursor-pointer hover:underline">
                    Guide des tailles
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const variant = product.variants.find(
                      (v) =>
                        v.size === size &&
                        (!selectedColor || !product.colors || product.colors.length === 0 || v.color === selectedColor)
                    );
                    const stock = variant ? variant.stock : 0;
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={stock <= 0}
                        className={`min-w-11 px-3 py-2 text-xs font-mono font-semibold rounded-xs border transition-all ${
                          stock <= 0
                            ? 'border-[#282828] text-[#444] bg-[#141414] line-through cursor-not-allowed'
                            : isSelected
                            ? 'border-[#C7A747] bg-[#C7A747] text-[#171717]'
                            : 'border-[#333333] bg-[#202020] text-[#F4F1E9] hover:border-[#C7A747]/70'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Stock info for selected variant */}
                <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                  {isOutOfStock ? (
                    <span className="text-[#ff7878] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Cette taille est momentanément en rupture de stock.
                    </span>
                  ) : currentStock <= product.lowStockThreshold ? (
                    <span className="text-[#f59e0b] font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Plus que {currentStock} exemplaire(s) disponible(s) !
                    </span>
                  ) : (
                    <span className="text-[#4ade80] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      En stock ({currentStock} disponibles) — Expédition immédiate
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6 flex items-center gap-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#777D86]">
                  Quantité :
                </label>
                <div className="flex items-center border border-[#333333] bg-[#202020] rounded-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3 py-1.5 text-[#F4F1E9] hover:text-[#C7A747] disabled:opacity-30 disabled:cursor-not-allowed font-mono text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-[#F4F1E9] min-w-8 text-center font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="px-3 py-1.5 text-[#F4F1E9] hover:text-[#C7A747] disabled:opacity-30 disabled:cursor-not-allowed font-mono text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 font-heading uppercase tracking-widest text-xs">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-4 px-6 font-bold transition-all flex items-center justify-center gap-2 rounded-none shadow-lg ${
                    isOutOfStock
                      ? 'bg-[#2a2a2a] text-[#666] cursor-not-allowed'
                      : 'bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] active:scale-[0.99]'
                  }`}
                >
                  <span>{isOutOfStock ? 'Rupture de Stock' : 'Ajouter au Panier'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleDirectBuy}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3.5 px-4 font-bold border transition-all rounded-none flex items-center justify-center ${
                      isOutOfStock
                        ? 'border-[#262626] text-[#444] cursor-not-allowed'
                        : 'border-[#F4F1E9]/40 hover:border-[#F4F1E9] bg-[#1a1a1a] text-[#F4F1E9]'
                    }`}
                  >
                    <span>Commander Immédiatement</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3.5 border rounded-none transition-colors ${
                      isFavorite
                        ? 'border-[#C7A747] bg-[#C7A747]/10 text-[#C7A747]'
                        : 'border-[#333333] hover:border-[#555] text-[#777D86] hover:text-[#F4F1E9]'
                    }`}
                    title="Ajouter aux favoris"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Collapsible Tabs for Description & Specs */}
            <div className="pt-4 border-t border-[#282828] text-xs">
              <div className="flex gap-4 border-b border-[#282828] pb-2 mb-3">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'details'
                      ? 'border-[#C7A747] text-[#C7A747]'
                      : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'materials'
                      ? 'border-[#C7A747] text-[#C7A747]'
                      : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
                  }`}
                >
                  Matières & Entretien
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'shipping'
                      ? 'border-[#C7A747] text-[#C7A747]'
                      : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
                  }`}
                >
                  Livraison Bénin
                </button>
              </div>

              {activeTab === 'details' && (
                <div className="space-y-3 text-[#777D86] leading-relaxed">
                  <p className="text-[#F4F1E9]/90">{product.description}</p>
                  {product.details && product.details.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1">
                      {product.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="space-y-2 text-[#777D86]">
                  {product.materials && (
                    <p>
                      <strong className="text-[#F4F1E9]">Composition :</strong> {product.materials}
                    </p>
                  )}
                  {product.careAdvice && (
                    <p>
                      <strong className="text-[#F4F1E9]">Entretien :</strong> {product.careAdvice}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-1.5 text-[#777D86] leading-relaxed">
                  <p>• Cotonou & Calavi : Livraison express en 24h par coursier moto dédié.</p>
                  <p>• Porto-Novo & Sèmè-Kpodji : Livraison en 48h.</p>
                  <p>• Parakou, Bohicon, Ouidah, etc. : Expédition sécurisée 48-72h avec suivi.</p>
                  <p className="text-[#C7A747] font-medium pt-1">
                    ✓ Possibilité de payer en espèces ou Mobile Money directement au livreur.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
