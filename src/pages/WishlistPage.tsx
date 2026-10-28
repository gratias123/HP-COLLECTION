import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/products/ProductCard';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { products, wishlist, setCurrentPage, setCategoryFilter } = useStore();

  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#282828] pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#C7A747] font-bold block mb-1">
            Mes Articles Sauvegardés
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-[#F4F1E9]">
            Vos Favoris ({favoriteProducts.length})
          </h1>
        </div>

        <button
          onClick={() => {
            setCategoryFilter('all');
            setCurrentPage('catalog');
          }}
          className="text-xs font-bold text-[#C7A747] hover:underline flex items-center gap-1"
        >
          <span>Continuer mes achats</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="p-16 text-center bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4">
          <Heart className="w-12 h-12 text-[#333333] mx-auto" />
          <h3 className="font-heading text-lg font-bold text-[#F4F1E9]">
            Vous n'avez pas encore d'articles favoris
          </h3>
          <p className="text-xs text-[#777D86] max-w-sm mx-auto">
            Cliquez sur l'icône de cœur sur n'importe quel modèle pour le retrouver rapidement ici.
          </p>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setCurrentPage('catalog');
            }}
            className="px-6 py-3 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-colors"
          >
            Explorer la collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
