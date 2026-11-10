import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Home,
  LayoutGrid,
  Heart,
  ShoppingBag,
  PackageCheck,
} from 'lucide-react';

export const BottomTabBar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    setCategoryFilter,
    cartCount,
    cartPulsing,
    wishlist,
    openCart,
  } = useStore();

  const handleNav = (page: string, category: string = 'all') => {
    setCurrentPage(page);
    setCategoryFilter(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHomeActive = currentPage === 'home';
  const isCatalogActive = currentPage === 'catalog';
  const isWishlistActive = currentPage === 'wishlist';
  const isTrackingActive = currentPage === 'order-tracking';

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141414]/95 backdrop-blur-xl border-t border-[#262626] pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigation principale mobile"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {/* 1. Accueil */}
        <button
          onClick={() => handleNav('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all ${
            isHomeActive
              ? 'text-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
          aria-label="Accueil"
        >
          <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 font-mono uppercase">
            Accueil
          </span>
        </button>

        {/* 2. Catalogue */}
        <button
          onClick={() => handleNav('catalog')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all ${
            isCatalogActive
              ? 'text-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
          aria-label="Catalogue"
        >
          <LayoutGrid className={`w-5 h-5 ${isCatalogActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 font-mono uppercase">
            Boutique
          </span>
        </button>

        {/* 3. Favoris */}
        <button
          onClick={() => handleNav('wishlist')}
          className={`relative flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all ${
            isWishlistActive
              ? 'text-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
          aria-label={`Favoris (${wishlist.length})`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${isWishlistActive ? 'fill-[#C7A747] stroke-[2]' : 'stroke-2'}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#C7A747] text-[#171717] font-bold text-[9px] flex items-center justify-center font-mono">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1 font-mono uppercase">
            Favoris
          </span>
        </button>

        {/* 4. Panier */}
        <button
          onClick={openCart}
          className={`relative flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all ${
            cartPulsing ? 'animate-subtle-pulse text-[#C7A747]' : 'text-[#777D86] hover:text-[#C7A747]'
          }`}
          aria-label={`Panier (${cartCount})`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 stroke-2 transition-transform ${cartPulsing ? 'scale-115 text-[#C7A747]' : ''}`} />
            {cartCount > 0 && (
              <span className={`absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#C7A747] text-[#171717] font-bold text-[9px] flex items-center justify-center font-mono transition-transform ${cartPulsing ? 'scale-115' : ''}`}>
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1 font-mono uppercase">
            Panier
          </span>
        </button>

        {/* 5. Suivi / Contact */}
        <button
          onClick={() => handleNav('order-tracking')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all ${
            isTrackingActive
              ? 'text-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
          aria-label="Suivi de colis"
        >
          <PackageCheck className={`w-5 h-5 ${isTrackingActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 font-mono uppercase">
            Suivi
          </span>
        </button>
      </div>
    </nav>
  );
};
