import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageUrl';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const {
    openProductDetail,
    toggleWishlist,
    isInWishlist,
    addToCart,
    formatCurrency,
  } = useStore();

  const [imageIndex, setImageIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [quickAddFeedback, setQuickAddFeedback] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const isOutOfStock = product.totalStock <= 0;
  const isLowStock = !isOutOfStock && product.totalStock <= product.lowStockThreshold;
  const isOnSale = !!product.salePrice && product.salePrice < product.price;

  const currentPrice = isOnSale && product.salePrice ? product.salePrice : product.price;
  const discountPercent = isOnSale && product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Identify specific new styles requested by user (t-shirts, ceintures, polos, jeans, casquettes)
  const isBelt = product.sku.startsWith('HPC-BEL-') || product.name.toLowerCase().includes('ceinture');
  const isTshirt = product.sku.startsWith('HPC-TSH-') || product.name.toLowerCase().includes('t-shirt');
  const isPolo = product.sku.startsWith('HPC-POL-') || product.name.toLowerCase().includes('polo');
  const isJean = product.sku.startsWith('HPC-JNS-') || product.name.toLowerCase().includes('jean');
  const isCap = product.sku.startsWith('HPC-CAP-') || product.name.toLowerCase().includes('casquette');

  const isSpecialStyle = isBelt || isTshirt || isPolo || isJean || isCap;
  const isNewDropStyle = isSpecialStyle || product.isNewArrival;

  const styleBadgeLabel = isBelt
    ? 'Ceinture'
    : isTshirt
    ? 'T-Shirt 2026'
    : isPolo
    ? 'Polo Sport-Chic'
    : isJean
    ? 'Jean Denim'
    : isCap
    ? 'Casquette'
    : 'Nouveau';

  const rawImage = !useFallback ? (product.images[imageIndex] || product.images[0] || '') : '';
  const optimizedImage = getOptimizedImageUrl(rawImage, {
    width: 500,
    quality: 85,
    category: product.category,
  });

  const handleImageError = () => {
    if (product.images && product.images.length > imageIndex + 1) {
      setImageIndex((prev) => prev + 1);
    } else {
      setUseFallback(true);
    }
  };

  // Quick add to cart using the first in-stock variant
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const availableVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];
    if (availableVariant) {
      const added = addToCart(product, availableVariant.id, 1);
      if (added) {
        setQuickAddFeedback(true);
        setTimeout(() => setQuickAddFeedback(false), 2000);
      }
    } else {
      openProductDetail(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: isSpecialStyle ? 0.6 : 0.45,
        delay: Math.min((index % 4) * 0.07, 0.28),
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={() => openProductDetail(product)}
      className="group relative bg-[#181818] border border-[#242424] hover:border-[#C7A747]/80 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer select-none"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] bg-[#121212] overflow-hidden">
        <img
          src={optimizedImage}
          alt={`${product.name} (${product.category}) - HP COLLECTION Bénin`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          decoding="async"
          width="400"
          height="533"
          onError={handleImageError}
        />

        {/* Minimal Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 font-mono text-[9px] uppercase tracking-wider">
          {isOnSale && (
            <span className="px-2 py-0.5 font-bold bg-[#C7A747] text-[#171717]">
              -{discountPercent}%
            </span>
          )}
          {isSpecialStyle && !isOnSale && (
            <span className="px-2 py-0.5 font-bold bg-[#141414]/90 text-[#C7A747] border border-[#C7A747]/50">
              {styleBadgeLabel}
            </span>
          )}
          {product.isNewArrival && !isSpecialStyle && !isOnSale && (
            <span className="px-2 py-0.5 font-bold bg-[#141414]/90 text-[#F4F1E9] border border-[#333333]">
              Nouveau
            </span>
          )}
        </div>

        {/* Quiet availability notice strictly when depleted or low */}
        {isOutOfStock ? (
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
            <span className="px-2 py-0.5 bg-[#141414]/90 border border-[#ff5555]/40 text-[#ff8b8b] text-[8.5px] font-mono uppercase tracking-wider">
              Épuisé
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
            <span className="px-2 py-0.5 bg-[#141414]/90 border border-[#f59e0b]/40 text-[#fbbf24] text-[8.5px] font-mono uppercase tracking-wider">
              {product.totalStock} restants
            </span>
          </div>
        ) : null}

        {/* Wishlist Button (Min touch target 44px) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-all z-20 ${
            isFavorite
              ? 'text-[#171717]'
              : 'text-[#F4F1E9]/70 hover:text-[#F4F1E9]'
          }`}
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-label="Favoris"
        >
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md ${
              isFavorite
                ? 'bg-[#C7A747] text-[#171717] scale-105'
                : 'bg-[#171717]/70 hover:bg-[#171717] text-[#F4F1E9]/80'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </span>
        </button>

        {/* Quick Add Overlay on hover for desktop */}
        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex gap-2 z-10">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-center transition-all shadow-xl font-mono flex items-center justify-center gap-1 ${
              isOutOfStock
                ? 'bg-[#222222] text-[#666] cursor-not-allowed border border-[#333]'
                : quickAddFeedback
                ? 'bg-emerald-500 text-[#171717] border border-emerald-500'
                : 'bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] border border-[#C7A747]'
            }`}
          >
            {quickAddFeedback ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Ajouté !</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? 'Épuisé' : 'Ajout Panier'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openProductDetail(product);
            }}
            className="w-9 py-2 bg-[#171717]/90 text-[#F4F1E9] border border-[#333333] hover:border-[#C7A747] flex items-center justify-center shadow-xl transition-all"
            title="Aperçu rapide"
          >
            <Eye className="w-3.5 h-3.5 text-[#C7A747]" />
          </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#777D86] uppercase tracking-wider mb-1">
            <span className="truncate max-w-[100px]">{product.sku}</span>
            <span className="text-[#C7A747] font-semibold">{product.category}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-heading text-xs sm:text-sm font-semibold text-[#F4F1E9] group-hover:text-[#C7A747] transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Sizes & Colors preview */}
          <div className="mt-2 flex items-center justify-between gap-1">
            {/* Sizes */}
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 3).map((size) => (
                <span
                  key={size}
                  className="px-1.5 py-0.5 text-[9px] font-mono bg-[#202020] text-[#9ca3af] border border-[#2b2b2b]"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-[9px] font-mono text-[#666] self-center">
                  +{product.sizes.length - 3}
                </span>
              )}
            </div>

            {/* Color swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                {product.colors.slice(0, 3).map((col, idx) => (
                  <span
                    key={idx}
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Mobile Quick Action */}
        <div className="mt-2.5 pt-2 border-t border-[#242424] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-xs sm:text-sm text-[#F4F1E9]">
              {formatCurrency(currentPrice)}
            </span>
            {isOnSale && (
              <span className="text-[10px] text-[#777D86] line-through font-mono">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Touch-friendly quick-add on mobile screen */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`sm:hidden min-h-[38px] px-2.5 flex items-center justify-center font-mono text-[10px] font-bold uppercase tracking-wider transition-colors border ${
              isOutOfStock
                ? 'border-[#262626] text-[#555] bg-[#141414] cursor-not-allowed'
                : quickAddFeedback
                ? 'bg-emerald-500 text-[#171717] border-emerald-500'
                : 'border-[#333333] bg-[#202020] text-[#C7A747] active:bg-[#C7A747] active:text-[#171717]'
            }`}
            aria-label="Ajouter au panier"
          >
            {quickAddFeedback ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
