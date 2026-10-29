import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageUrl';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    openProductDetail,
    toggleWishlist,
    isInWishlist,
    formatCurrency,
  } = useStore();

  const [currentImageIndex] = useState(0);

  const isFavorite = isInWishlist(product.id);
  const isOutOfStock = product.totalStock <= 0;
  const isLowStock = !isOutOfStock && product.totalStock <= product.lowStockThreshold;
  const isOnSale = !!product.salePrice && product.salePrice < product.price;

  const currentPrice = isOnSale && product.salePrice ? product.salePrice : product.price;
  const discountPercent = isOnSale && product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const rawImage = product.images[currentImageIndex] || product.images[0];
  const optimizedImage = getOptimizedImageUrl(rawImage, { width: 500, quality: 80 });

  return (
    <div
      onClick={() => openProductDetail(product)}
      className="group relative bg-[#181818] border border-[#242424] hover:border-[#C7A747]/80 transition-all duration-300 rounded-xs overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] bg-[#121212] overflow-hidden">
        <img
          src={optimizedImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          decoding="async"
        />

        {/* Minimal Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 font-mono text-[9px] uppercase tracking-wider">
          {isOnSale && (
            <span className="px-2 py-0.5 font-bold bg-[#C7A747] text-[#171717]">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && !isOnSale && (
            <span className="px-2 py-0.5 font-bold bg-[#141414]/90 text-[#F4F1E9] border border-[#333333]">
              Nouveau
            </span>
          )}
        </div>

        {/* Availability Indicator Badge (Discrete, luxury feel) */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#141414]/90 backdrop-blur-md border border-[#ff6666]/40 text-[#ff8b8b] text-[8.5px] font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5555]" />
              Épuisé
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#141414]/90 backdrop-blur-md border border-[#f59e0b]/40 text-[#fbbf24] text-[8.5px] font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
              {product.totalStock} restants
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#141414]/85 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[8.5px] font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              En stock
            </span>
          )}
        </div>

        {/* Wishlist Button (Discrete) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isFavorite
              ? 'bg-[#C7A747] text-[#171717]'
              : 'bg-[#171717]/70 hover:bg-[#171717] text-[#F4F1E9]/70 hover:text-[#F4F1E9]'
          }`}
          title="Ajouter aux favoris"
          aria-label="Favoris"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Action Overlay on Desktop Hover */}
        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block z-10">
          <div className="w-full py-2 bg-[#171717]/95 text-[#F4F1E9] text-[11px] font-bold uppercase tracking-widest border border-[#333333] hover:border-[#C7A747] hover:text-[#C7A747] text-center transition-all shadow-xl">
            Voir la fiche
          </div>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#777D86] uppercase tracking-wider mb-1">
            <span>{product.sku}</span>
            <span className="text-[#C7A747] font-semibold">{product.category}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-heading text-xs sm:text-sm font-semibold text-[#F4F1E9] group-hover:text-[#C7A747] transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Sizes & Colors preview */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            {/* Sizes */}
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 4).map((size) => (
                <span
                  key={size}
                  className="px-1.5 py-0.5 text-[9px] font-mono bg-[#202020] text-[#9ca3af] border border-[#2b2b2b]"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-[9px] font-mono text-[#666] self-center">
                  +{product.sizes.length - 4}
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

        {/* Pricing */}
        <div className="mt-3 pt-2.5 border-t border-[#242424] flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs sm:text-sm font-bold text-[#F4F1E9]">
              {formatCurrency(currentPrice)}
            </span>
            {isOnSale && (
              <span className="text-[10px] text-[#777D86] line-through font-mono">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <span className="text-[10px] text-[#777D86] group-hover:text-[#C7A747] transition-colors font-mono uppercase tracking-wider">
            Commander →
          </span>
        </div>
      </div>
    </div>
  );
};
