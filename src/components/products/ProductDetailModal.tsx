import React, { useState, useEffect, useRef } from 'react';
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
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Share2,
  Clock,
} from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageUrl';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductForDetail: product,
    closeProductDetail,
    addToCart,
    openCheckout,
    toggleWishlist,
    isInWishlist,
    formatCurrency,
    showToast,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'delivery'>('details');

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Reset or select default variant when product changes
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      setIsZoomed(false);
      setIsAddedFeedback(false);
      setShowSizeGuide(false);

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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSizeGuide) {
          setShowSizeGuide(false);
        } else {
          closeProductDetail();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSizeGuide, closeProductDetail]);

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

  // Zoom mouse movement handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPosition({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - top) / height) * 100));
    setZoomPosition({ x, y });
  };

  const handleAddToCart = () => {
    if (!currentVariant || isOutOfStock) return;
    const success = addToCart(product, currentVariant.id, quantity);
    if (success) {
      setIsAddedFeedback(true);
      setTimeout(() => setIsAddedFeedback(false), 2400);
    }
  };

  const handleDirectBuy = () => {
    if (!currentVariant || isOutOfStock) return;
    const added = addToCart(product, currentVariant.id, quantity);
    if (added) {
      closeProductDetail();
      openCheckout();
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/catalog?product=${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Découvre ${product.name} sur HP COLLECTION Bénin`,
          url,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
      showToast('Lien du produit copié dans le presse-papier !', 'info');
    }
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeProductDetail();
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) closeProductDetail();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        className="relative w-full max-w-5xl bg-[#171717] border border-[#2b2b2b] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar inside modal */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-[#242424] bg-[#141414] shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-mono text-[#777D86] truncate">
            <span className="text-[#C7A747] font-bold uppercase">{product.category}</span>
            <span>•</span>
            <span className="truncate">RÉF : {currentVariant?.sku || product.sku}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-[#777D86] hover:text-[#F4F1E9] transition-colors rounded-full hover:bg-[#202020] min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
              title="Partager ce produit"
              aria-label="Partager"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`p-2 transition-colors rounded-full hover:bg-[#202020] min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer ${
                isFavorite ? 'text-[#C7A747]' : 'text-[#777D86] hover:text-[#F4F1E9]'
              }`}
              title="Ajouter aux favoris"
              aria-label="Favoris"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeProductDetail();
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeProductDetail();
              }}
              className="px-3 py-1.5 bg-[#202020] hover:bg-[#2b2b2b] active:bg-[#383838] text-[#F4F1E9] hover:text-[#C7A747] border border-[#3a3a3a] transition-all rounded-xs ml-1 min-h-[38px] flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer active:scale-95 shadow-sm"
              aria-label="Fermer la vue détaillée"
              title="Fermer cette fiche produit (Échap)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[11px] uppercase tracking-wider">Fermer</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto flex-1 pb-20 md:pb-0">
          {/* LEFT: PHOTOGRAPHIC GALLERY WITH INTERACTIVE ZOOM */}
          <div className="p-4 sm:p-6 bg-[#121212] flex flex-col gap-3 sm:gap-4 border-b md:border-b-0 md:border-r border-[#242424]">
            {/* Main Image with Zoom container */}
            <div
              ref={imageContainerRef}
              onMouseMove={isZoomed ? handleMouseMove : undefined}
              onTouchMove={isZoomed ? handleTouchMove : undefined}
              onClick={() => setIsZoomed(!isZoomed)}
              className={`relative aspect-[3/4] sm:aspect-square w-full bg-[#1c1c1c] overflow-hidden border border-[#282828] select-none ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
            >
              <img
                src={getOptimizedImageUrl(product.images[activeImageIndex] || product.images[0], {
                  width: 1200,
                  quality: 90,
                })}
                alt={`${product.name} - Vue ${activeImageIndex + 1}`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        transform: 'scale(2.4)',
                        transition: 'transform 0.15s ease-out',
                      }
                    : {
                        transition: 'transform 0.3s ease',
                      }
                }
                className="w-full h-full object-cover object-center"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = '/assets/aistudio/1793196164363_1__528b35f1.jpg';
                  if (!target.src.includes('1793196164363_1__528b35f1.jpg')) {
                    target.src = fallback;
                  }
                }}
              />

              {/* Promo badge */}
              {isOnSale && (
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#C7A747] text-[#171717] font-black text-xs uppercase tracking-wider shadow-md pointer-events-none">
                  PROMO
                </div>
              )}

              {/* Zoom control toggle badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(!isZoomed);
                  }}
                  className="px-2.5 py-1.5 bg-[#171717]/90 hover:bg-[#171717] text-[#F4F1E9] border border-[#333333] text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md transition-all shadow-lg rounded-xs"
                >
                  {isZoomed ? (
                    <>
                      <ZoomOut className="w-3.5 h-3.5 text-[#C7A747]" />
                      <span>Réduire</span>
                    </>
                  ) : (
                    <>
                      <ZoomIn className="w-3.5 h-3.5 text-[#C7A747]" />
                      <span>Zoom loupe</span>
                    </>
                  )}
                </button>
              </div>

              {/* Image counter indicator */}
              {product.images.length > 1 && (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#171717]/80 backdrop-blur-md border border-[#333333] text-[#F4F1E9] font-mono text-[10px] tracking-widest rounded-xs pointer-events-none">
                  {activeImageIndex + 1} / {product.images.length}
                </div>
              )}

              {/* Arrow navigation on main image */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[#171717]/80 hover:bg-[#171717] text-[#F4F1E9] border border-[#333333] rounded-full transition-all opacity-80 hover:opacity-100"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#171717]/80 hover:bg-[#171717] text-[#F4F1E9] border border-[#333333] rounded-full transition-all opacity-80 hover:opacity-100"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails strip */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setIsZoomed(false);
                    }}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 border transition-all overflow-hidden ${
                      activeImageIndex === idx
                        ? 'border-[#C7A747] ring-1 ring-[#C7A747]'
                        : 'border-[#2d2d2d] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getOptimizedImageUrl(img, { width: 160, quality: 75 })}
                      alt={`${product.name} miniature ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Benin reassurance points */}
            <div className="mt-2 pt-4 border-t border-[#222222] grid grid-cols-2 gap-3 text-[11px] font-mono text-[#777D86]">
              <div className="flex items-start gap-2">
                <Truck className="w-3.5 h-3.5 text-[#C7A747] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F4F1E9] font-medium block">Livraison Partout</span>
                  <span>À domicile & dans toutes les villes</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-[#C7A747] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F4F1E9] font-medium block">Paiement au déballage</span>
                  <span>Cash ou Mobile Money</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: VARIANTS, SIZES, STOCK & CTAs */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Product Title */}
              <div>
                <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#F4F1E9] leading-snug">
                  {product.name}
                </h1>
                <p className="text-xs text-[#777D86] mt-1 font-light line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* Pricing Box */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-[#242424]">
                <span className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F1E9]">
                  {formatCurrency(effectivePrice)}
                </span>
                {isOnSale && (
                  <span className="text-sm text-[#777D86] line-through font-mono">
                    {formatCurrency(product.price)}
                  </span>
                )}
                {isOnSale && product.salePrice && (
                  <span className="text-[11px] font-bold text-[#C7A747] bg-[#C7A747]/10 px-2 py-0.5 font-mono">
                    Économie : {formatCurrency(product.price - product.salePrice)}
                  </span>
                )}
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[#777D86] font-mono text-[11px]">
                      Couleur sélectionnée : <strong className="text-[#F4F1E9] font-normal">{selectedColor}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color.name)}
                          className={`min-h-[40px] px-3.5 py-2 text-xs font-medium border flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'border-[#C7A747] bg-[#222222] text-[#F4F1E9] ring-1 ring-[#C7A747]'
                              : 'border-[#333333] bg-[#1a1a1a] text-[#888] hover:border-[#555] hover:text-[#F4F1E9]'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C7A747] ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[#777D86] font-mono text-[11px]">
                    Taille / Pointure : <strong className="text-[#F4F1E9] font-normal">{selectedSize}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-[11px] text-[#C7A747] font-medium hover:underline flex items-center gap-1 font-mono"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>Guide des tailles</span>
                  </button>
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
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        disabled={stock <= 0}
                        className={`min-w-12 min-h-[44px] px-3.5 py-2 text-xs font-mono font-bold border transition-all flex items-center justify-center ${
                          stock <= 0
                            ? 'border-[#262626] text-[#444] bg-[#141414] line-through cursor-not-allowed'
                            : isSelected
                            ? 'border-[#C7A747] bg-[#C7A747] text-[#171717] shadow-md'
                            : 'border-[#333333] bg-[#1f1f1f] text-[#F4F1E9] hover:border-[#C7A747]/70'
                        }`}
                        title={stock <= 0 ? 'Taille épuisée' : `${stock} en stock`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Stock Feedback Indicator */}
                <div className="mt-3 flex items-center gap-1.5 text-xs font-mono">
                  {isOutOfStock ? (
                    <span className="text-[#ff7878] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Cette variante est momentanément épuisée.
                    </span>
                  ) : currentStock <= product.lowStockThreshold ? (
                    <span className="text-[#fbbf24] font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Attention : seulement {currentStock} exemplaire(s) restant(s) !
                    </span>
                  ) : (
                    <span className="text-[#4ade80] flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      En stock ({currentStock} disponibles) — Expédition sous 24h
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-wider text-[#777D86] font-mono text-[11px]">
                  Quantité :
                </span>
                <div className="flex items-center border border-[#333333] bg-[#1f1f1f]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-10 h-9 flex items-center justify-center text-[#F4F1E9] hover:text-[#C7A747] disabled:opacity-30 disabled:cursor-not-allowed font-mono text-base"
                    aria-label="Diminuer la quantité"
                  >
                    -
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-xs font-bold text-[#F4F1E9] font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="w-10 h-9 flex items-center justify-center text-[#F4F1E9] hover:text-[#C7A747] disabled:opacity-30 disabled:cursor-not-allowed font-mono text-base"
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons (Desktop / inline) */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full min-h-[48px] py-3.5 px-6 font-heading font-extrabold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl ${
                    isOutOfStock
                      ? 'bg-[#222222] text-[#666] cursor-not-allowed'
                      : isAddedFeedback
                      ? 'bg-emerald-500 text-[#171717] scale-[1.01]'
                      : 'bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] active:scale-[0.99]'
                  }`}
                >
                  {isAddedFeedback ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Article Ajouté au Panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isOutOfStock ? 'Rupture de Stock' : 'Ajouter au Panier'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDirectBuy}
                  disabled={isOutOfStock}
                  className={`w-full min-h-[44px] py-3 px-4 font-heading font-bold uppercase tracking-widest text-xs border transition-all flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'border-[#262626] text-[#444] cursor-not-allowed'
                      : 'border-[#F4F1E9]/40 hover:border-[#F4F1E9] bg-[#1a1a1a] text-[#F4F1E9] hover:bg-[#222222]'
                  }`}
                >
                  <span>Commander Immédiatement (1-Clic)</span>
                </button>
              </div>
            </div>

            {/* Product details tabs */}
            <div className="pt-4 border-t border-[#242424] text-xs">
              <div className="flex gap-4 border-b border-[#242424] pb-2 mb-3 font-mono text-[11px] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`pb-1 transition-colors ${
                    activeTab === 'details'
                      ? 'text-[#C7A747] border-b-2 border-[#C7A747] font-bold'
                      : 'text-[#777D86] hover:text-[#F4F1E9]'
                  }`}
                >
                  Détails & Coupe
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('care')}
                  className={`pb-1 transition-colors ${
                    activeTab === 'care'
                      ? 'text-[#C7A747] border-b-2 border-[#C7A747] font-bold'
                      : 'text-[#777D86] hover:text-[#F4F1E9]'
                  }`}
                >
                  Matière & Entretien
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('delivery')}
                  className={`pb-1 transition-colors ${
                    activeTab === 'delivery'
                      ? 'text-[#C7A747] border-b-2 border-[#C7A747] font-bold'
                      : 'text-[#777D86] hover:text-[#F4F1E9]'
                  }`}
                >
                  Livraison Bénin
                </button>
              </div>

              <div className="text-[#9ca3af] leading-relaxed text-xs">
                {activeTab === 'details' && (
                  <div className="space-y-2">
                    <p>{product.description}</p>
                    {product.details && product.details.length > 0 && (
                      <ul className="list-disc pl-4 space-y-1 text-[#777D86]">
                        {product.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === 'care' && (
                  <div className="space-y-1 text-[#777D86]">
                    <p>
                      <strong className="text-[#F4F1E9]">Matières :</strong>{' '}
                      {product.materials || 'Coton peigné lourd haute densité, finitions renforcées.'}
                    </p>
                    <p>
                      <strong className="text-[#F4F1E9]">Conseil d’entretien :</strong>{' '}
                      {product.careAdvice || 'Lavage machine à 30°C sur l’envers. Séchage naturel à l’ombre recommandé.'}
                    </p>
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div className="space-y-1 text-[#777D86]">
                    <p>
                      • <strong className="text-[#F4F1E9]">Toutes Villes & Communes :</strong> Expédition express et livraison soignée à domicile ou en point relais.
                    </p>
                    <p>
                      • <strong className="text-[#F4F1E9]">Délais :</strong> Traitement et départ le jour même pour toute commande validée avant 14h.
                    </p>
                    <p>
                      • <strong className="text-[#F4F1E9]">Règlement :</strong> En espèces ou par Mobile Money (MTN, Moov, Celtiis) à la réception.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE STICKY BOTTOM BUY BAR (Ergonomic for Android & Touchscreens) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#141414] border-t border-[#282828] p-2.5 px-3 flex items-center justify-between gap-2.5 shadow-2xl">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeProductDetail();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeProductDetail();
            }}
            className="h-[44px] px-3 text-[#F4F1E9] active:text-[#C7A747] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#383838] rounded-xs border border-[#444] flex items-center justify-center text-[12px] font-mono font-bold shrink-0 cursor-pointer shadow-sm active:scale-95"
            aria-label="Quitter le produit"
            title="Quitter"
          >
            <X className="w-4 h-4 mr-1 stroke-[2.5]" />
            <span>Quitter</span>
          </button>

          <div className="flex flex-col shrink-0 min-w-[70px]">
            <span className="text-[9px] uppercase font-mono text-[#777D86]">Total</span>
            <span className="font-heading font-extrabold text-sm sm:text-base text-[#F4F1E9] leading-tight">
              {formatCurrency(effectivePrice * quantity)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 min-h-[48px] px-4 font-heading font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-[#242424] text-[#666] cursor-not-allowed'
                : isAddedFeedback
                ? 'bg-emerald-500 text-[#171717]'
                : 'bg-[#C7A747] text-[#171717]'
            }`}
          >
            {isAddedFeedback ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Ajouté !</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Épuisé' : 'Ajouter au Panier'}</span>
              </>
            )}
          </button>
        </div>

        {/* Size Guide Modal Sub-view */}
        {showSizeGuide && (
          <div className="absolute inset-0 z-30 bg-[#171717]/95 backdrop-blur-md p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#282828]">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-[#C7A747]" />
                  <h3 className="font-heading text-lg font-bold text-[#F4F1E9]">
                    Guide des Tailles HP COLLECTION
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(false)}
                  className="p-1.5 text-[#777D86] hover:text-[#F4F1E9]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-5 space-y-6 text-xs text-[#888]">
                {/* Sneaker guide */}
                <div>
                  <h4 className="font-heading font-bold text-[#F4F1E9] uppercase tracking-wider text-xs mb-2">
                    Pointures Sneakers & Chaussures de Basket (EUR)
                  </h4>
                  <div className="border border-[#282828] overflow-hidden">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-[#202020] text-[#F4F1E9]">
                        <tr>
                          <th className="p-2 border-r border-[#282828]">EUR</th>
                          <th className="p-2 border-r border-[#282828]">US</th>
                          <th className="p-2 border-r border-[#282828]">UK</th>
                          <th className="p-2">Longueur (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#282828]">
                        <tr><td className="p-2 border-r border-[#282828]">40</td><td className="p-2 border-r border-[#282828]">7</td><td className="p-2 border-r border-[#282828]">6</td><td className="p-2">25.0 cm</td></tr>
                        <tr><td className="p-2 border-r border-[#282828]">41</td><td className="p-2 border-r border-[#282828]">8</td><td className="p-2 border-r border-[#282828]">7</td><td className="p-2">26.0 cm</td></tr>
                        <tr><td className="p-2 border-r border-[#282828]">42</td><td className="p-2 border-r border-[#282828]">8.5</td><td className="p-2 border-r border-[#282828]">7.5</td><td className="p-2">26.5 cm</td></tr>
                        <tr><td className="p-2 border-r border-[#282828]">43</td><td className="p-2 border-r border-[#282828]">9.5</td><td className="p-2 border-r border-[#282828]">8.5</td><td className="p-2">27.5 cm</td></tr>
                        <tr><td className="p-2 border-r border-[#282828]">44</td><td className="p-2 border-r border-[#282828]">10</td><td className="p-2 border-r border-[#282828]">9</td><td className="p-2">28.0 cm</td></tr>
                        <tr><td className="p-2 border-r border-[#282828]">45</td><td className="p-2 border-r border-[#282828]">11</td><td className="p-2 border-r border-[#282828]">10</td><td className="p-2">29.0 cm</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Clothing guide */}
                <div>
                  <h4 className="font-heading font-bold text-[#F4F1E9] uppercase tracking-wider text-xs mb-2">
                    Vêtements & Vestes Streetwear (Coupe Regular / Boxy)
                  </h4>
                  <div className="border border-[#282828] overflow-hidden">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-[#202020] text-[#F4F1E9]">
                        <tr>
                          <th className="p-2 border-r border-[#282828]">Taille</th>
                          <th className="p-2 border-r border-[#282828]">Tour de poitrine</th>
                          <th className="p-2 border-r border-[#282828]">Tour de taille</th>
                          <th className="p-2">Stature recommandée</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#282828]">
                        <tr><td className="p-2 border-r border-[#282828]">S</td><td className="p-2 border-r border-[#282828]">88 - 94 cm</td><td className="p-2 border-r border-[#282828]">74 - 80 cm</td><td className="p-2">1m65 - 1m72</td></tr>
                        <tr><td className="p-2 border-r border-[#282828]">M</td><td className="p-2 border-r border-[#282828]">95 - 102 cm</td><td className="p-2 border-r border-[#282828]">81 - 88 cm</td><td className="p-2">1m73 - 1m79</td></tr>
                        <tr><td className="p-2 border-r border-[#282828]">L</td><td className="p-2 border-r border-[#282828]">103 - 110 cm</td><td className="p-2 border-r border-[#282828]">89 - 96 cm</td><td className="p-2">1m80 - 1m86</td></tr>
                        <tr><td className="p-2 border-r border-[#282828]">XL</td><td className="p-2 border-r border-[#282828]">111 - 118 cm</td><td className="p-2 border-r border-[#282828]">97 - 104 cm</td><td className="p-2">1m85 - 1m92</td></tr>
                        <tr><td className="p-2 border-r border-[#282828]">XXL</td><td className="p-2 border-r border-[#282828]">119 - 126 cm</td><td className="p-2 border-r border-[#282828]">105 - 112 cm</td><td className="p-2">&gt; 1m90</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-[11px] text-[#C7A747]">
                  Conseil Taille : En cas d'hésitation entre deux tailles, un échange rapide et gratuit est garanti sous 48h.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSizeGuide(false)}
              className="w-full py-3 bg-[#C7A747] text-[#171717] font-heading font-bold text-xs uppercase tracking-wider"
            >
              Fermer le guide
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
