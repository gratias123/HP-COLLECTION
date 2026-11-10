import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/products/ProductCard';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const {
    products,
    wishlist,
    setCurrentPage,
    setCategoryFilter,
    openProductDetail,
    formatCurrency,
  } = useStore();

  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="border-b border-[#242424] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#C7A747] font-semibold block mb-1">
            SÉLECTION PERSONNELLE
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#F4F1E9]">
            Vos Coups de Cœur ({favoriteProducts.length})
          </h1>
          <p className="text-xs text-[#777D86] mt-1 font-light">
            Retrouvez facilement les pièces repérées pour votre vestiaire urbain.
          </p>
        </div>

        <button
          onClick={() => {
            setCategoryFilter('all');
            setCurrentPage('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xs font-mono font-bold text-[#C7A747] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Continuer mes achats</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-[#181818] border border-[#262626] space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#202020] border border-[#333333] flex items-center justify-center text-[#777D86]">
            <Heart className="w-6 h-6 text-[#C7A747]" />
          </div>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#F4F1E9]">
            Votre liste de favoris est vide
          </h3>
          <p className="text-xs text-[#777D86] max-w-sm mx-auto leading-relaxed font-light">
            Cliquez sur le petit cœur présent sur chaque modèle pour sauvegarder vos pièces préférées et les commander quand vous le souhaitez.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setCategoryFilter('all');
                setCurrentPage('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
            >
              Explorer le vestiaire
            </button>
            <button
              onClick={() => {
                setCategoryFilter('sneakers');
                setCurrentPage('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-3 border border-[#333333] hover:border-[#F4F1E9] text-[#F4F1E9] text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Voir les Sneakers
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
};
