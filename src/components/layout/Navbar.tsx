import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../data/initialData';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Shield,
  ArrowRight,
  Flame,
  Camera,
} from 'lucide-react';

interface NavbarProps {
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchClick }) => {
  const {
    products,
    openProductDetail,
    cartCount,
    cartSubtotal,
    openCart,
    wishlist,
    currentPage,
    setCurrentPage,
    setCategoryFilter,
    isAdminAuthenticated,
    formatCurrency,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery, products]);

  // Focus search input on open
  useEffect(() => {
    if (searchOverlayOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOverlayOpen]);

  // Close search on Escape or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOverlayOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOverlayOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNav = (page: string, category: string = 'all') => {
    setCurrentPage(page);
    setCategoryFilter(category);
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
    setSearchOverlayOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLookbookScroll = () => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById('lookbook');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById('lookbook');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#141414]/95 backdrop-blur-xl border-b border-[#242424] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-4">
          {/* 1. Mobile Menu Trigger (Mobile only) */}
          <div className="flex items-center lg:hidden flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#F4F1E9] hover:text-[#C7A747] transition-colors focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSearchOverlayOpen(true)}
              className="p-2 text-[#777D86] hover:text-[#F4F1E9] transition-colors"
              aria-label="Recherche"
            >
              <Search className="w-4 h-4 text-[#C7A747]" />
            </button>
          </div>

          {/* 2. Brand Wordmark & Monogram Logo (Always single-line, never wraps or collides) */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none text-left flex-shrink-0"
            >
              {/* Monogram crest */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 border border-[#C7A747]/60 bg-[#1c1c1c] group-hover:border-[#C7A747] flex items-center justify-center transition-all flex-shrink-0 relative shadow-sm">
                <span className="font-heading font-black text-xs sm:text-sm text-[#F4F1E9] tracking-tighter">
                  HP<span className="text-[#C7A747]">.</span>
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-[#C7A747]" />
              </div>

              {/* Brand typography */}
              <div className="flex flex-col flex-shrink-0">
                <span className="font-heading text-base sm:text-xl font-black text-[#F4F1E9] tracking-[0.14em] whitespace-nowrap group-hover:text-white transition-colors">
                  HP COLLECTION
                </span>
                <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.2em] text-[#777D86] group-hover:text-[#C7A747] transition-colors font-mono whitespace-nowrap">
                  <span>Bénin</span>
                  <span className="text-[#C7A747]">•</span>
                  <span>Haute Culture Urbaine</span>
                </div>
              </div>
            </button>
          </div>

          {/* 3. Desktop Navigation Menu (Spacious, centered, strict single-line without text wrapping) */}
          <nav className="hidden lg:flex items-center justify-center space-x-4 xl:space-x-7 text-[11px] font-mono tracking-[0.16em] uppercase font-semibold whitespace-nowrap flex-shrink-0">
            {/* Accueil */}
            <button
              onClick={() => handleNav('home')}
              className={`py-2 transition-colors relative whitespace-nowrap flex-shrink-0 ${
                currentPage === 'home'
                  ? 'text-[#C7A747]'
                  : 'text-[#F4F1E9]/80 hover:text-[#F4F1E9]'
              }`}
            >
              Accueil
              {currentPage === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C7A747]" />
              )}
            </button>

            {/* Rayons Mega Dropdown */}
            <div
              className="relative flex-shrink-0"
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <button
                onClick={() => handleNav('catalog', 'all')}
                className={`flex items-center gap-1 py-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  currentPage === 'catalog'
                    ? 'text-[#C7A747]'
                    : 'text-[#F4F1E9]/80 hover:text-[#F4F1E9]'
                }`}
              >
                <span>Rayons</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 text-[#777D86] ${
                    categoriesDropdownOpen ? 'rotate-180 text-[#C7A747]' : ''
                  }`}
                />
                {currentPage === 'catalog' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C7A747]" />
                )}
              </button>

              {categoriesDropdownOpen && (
                <div className="absolute top-full -left-16 w-[490px] bg-[#161616]/98 backdrop-blur-2xl border border-[#2d2d2d] shadow-2xl p-5 rounded-xs animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-[#C7A747] uppercase font-bold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      Capsules & Rayons HP ({products.length} articles)
                    </span>
                    <button
                      onClick={() => handleNav('catalog', 'all')}
                      className="text-[10px] text-[#777D86] hover:text-[#C7A747] transition-colors flex items-center gap-1 font-mono tracking-wider"
                    >
                      Tout voir
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleNav('catalog', cat.id)}
                        className="group flex flex-col p-2.5 rounded-xs hover:bg-[#202020] transition-colors text-left border border-transparent hover:border-[#2e2e2e]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#F4F1E9] group-hover:text-[#C7A747] transition-colors font-medium">
                            {cat.name}
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#555] opacity-0 group-hover:opacity-100 group-hover:text-[#C7A747] transition-all -translate-x-1 group-hover:translate-x-0" />
                        </div>
                        <span className="text-[10px] text-[#777D86] line-clamp-1 mt-0.5 font-sans normal-case">
                          {cat.description}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#242424] flex items-center justify-between text-[10px] font-mono text-[#888]">
                    <span className="flex items-center gap-1.5 text-[#C7A747]">
                      <Sparkles className="w-3 h-3" /> Nouvelle Collection 2026
                    </span>
                    <span className="text-[#666]">Livraison rapide à Cotonou & Bénin</span>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Category Shortcuts (Always on a single line) */}
            <button
              onClick={() => handleNav('catalog', 'varsity')}
              className="py-2 text-[#F4F1E9]/80 hover:text-[#C7A747] transition-colors whitespace-nowrap flex-shrink-0"
            >
              Vestes & Denim
            </button>

            <button
              onClick={() => handleNav('catalog', 'sneakers')}
              className="py-2 text-[#F4F1E9]/80 hover:text-[#C7A747] transition-colors whitespace-nowrap flex-shrink-0"
            >
              Sneakers
            </button>

            {/* Direct Lookbook jump */}
            <button
              onClick={handleLookbookScroll}
              className="py-2 text-[#F4F1E9]/80 hover:text-[#C7A747] transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <Camera className="w-3 h-3 text-[#C7A747]" />
              <span>Lookbook</span>
            </button>

            {/* Suivi Colis */}
            <button
              onClick={() => handleNav('order-tracking')}
              className={`py-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                currentPage === 'order-tracking'
                  ? 'text-[#C7A747]'
                  : 'text-[#777D86] hover:text-[#F4F1E9]'
              }`}
            >
              Suivi Colis
            </button>
          </nav>

          {/* 4. Right Action Suite (Compact, clean, responsive, never overflowed) */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Search Trigger Button */}
            <button
              onClick={() => setSearchOverlayOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-[#1b1b1b] hover:bg-[#222222] border border-[#2b2b2b] hover:border-[#C7A747] rounded-xs text-[#777D86] hover:text-[#F4F1E9] transition-all flex-shrink-0"
              title="Rechercher un article"
              aria-label="Recherche"
            >
              <Search className="w-3.5 h-3.5 text-[#C7A747]" />
              <span className="hidden xl:inline text-[11px] font-mono tracking-wider">
                Rechercher...
              </span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNav('wishlist')}
              className="relative p-2 text-[#F4F1E9]/80 hover:text-[#C7A747] hover:bg-[#202020] rounded-xs transition-colors flex-shrink-0"
              title="Mes Favoris"
              aria-label="Favoris"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-[#C7A747] text-[#C7A747]' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-3.5 h-3.5 text-[8.5px] font-mono font-bold text-[#171717] bg-[#C7A747] rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Pill */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#1c1c1c] hover:bg-[#242424] border border-[#2c2c2c] hover:border-[#C7A747]/60 rounded-xs text-[#F4F1E9] transition-all group flex-shrink-0"
              aria-label="Panier"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-[#C7A747] transition-transform group-hover:scale-105" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[15px] h-[15px] px-0.5 text-[8.5px] font-mono font-black text-[#171717] bg-[#C7A747] rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left border-l border-[#2e2e2e] pl-2 whitespace-nowrap">
                <span className="text-[7.5px] font-mono uppercase tracking-wider text-[#777D86] leading-none">
                  Panier
                </span>
                <span className="text-[10.5px] font-mono font-bold tracking-tight text-[#F4F1E9]">
                  {cartCount > 0 ? formatCurrency(cartSubtotal) : '0 FCFA'}
                </span>
              </div>
            </button>

            {/* Admin Entry Pill */}
            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-1 text-[9.5px] font-mono tracking-wider uppercase px-2 py-1.5 border transition-all rounded-xs flex-shrink-0 whitespace-nowrap ${
                isAdminAuthenticated
                  ? 'border-[#C7A747] text-[#C7A747] bg-[#C7A747]/10'
                  : 'border-[#2c2c2c] text-[#777D86] hover:text-[#F4F1E9] hover:border-[#444] hover:bg-[#202020]'
              }`}
              title="Accès Administrateur HP Collection"
            >
              <Shield className="w-3 h-3 text-[#C7A747]" />
              <span className="hidden xl:inline">Accès</span> Admin
            </button>
          </div>
        </div>
      </div>

      {/* Floating Full-Search Overlay / Modal (Instant, fast, does not squeeze the navbar) */}
      {searchOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
          <div
            ref={searchContainerRef}
            className="w-full max-w-2xl bg-[#171717] border border-[#2e2e2e] shadow-2xl rounded-xs overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-[#262626] bg-[#1a1a1a]">
              <Search className="w-4 h-4 text-[#C7A747] flex-shrink-0 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNav('catalog');
                    setSearchOverlayOpen(false);
                  }
                }}
                placeholder="Rechercher une paire, veste, denim, hoodie..."
                className="w-full bg-transparent text-[#F4F1E9] text-sm placeholder-[#666] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-[#777D86] hover:text-[#F4F1E9] mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setSearchOverlayOpen(false)}
                className="text-[11px] font-mono uppercase tracking-wider text-[#777D86] hover:text-[#C7A747] px-2 py-1 border border-[#333] hover:border-[#555] rounded-xs"
              >
                Échap
              </button>
            </div>

            {/* Results preview */}
            <div className="p-3 max-h-[60vh] overflow-y-auto">
              {searchQuery.trim().length >= 2 ? (
                searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono tracking-widest text-[#777D86] uppercase px-2 py-1">
                      Résultats correspondants ({searchResults.length})
                    </div>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          openProductDetail(product);
                          setSearchOverlayOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-3.5 p-2.5 rounded-xs hover:bg-[#222222] transition-colors text-left group"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-14 object-cover rounded-xs border border-[#2b2b2b] flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-[#F4F1E9] font-medium group-hover:text-[#C7A747] transition-colors truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono font-bold text-[#C7A747]">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="text-[10px] uppercase font-mono text-[#777D86]">
                              • {product.category}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#C7A747] -translate-x-1 group-hover:translate-x-0 transition-all flex-shrink-0" />
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        handleNav('catalog');
                        setSearchOverlayOpen(false);
                      }}
                      className="w-full text-center py-2.5 mt-2 bg-[#202020] hover:bg-[#262626] text-xs font-mono text-[#C7A747] uppercase tracking-wider transition-colors border border-[#2e2e2e]"
                    >
                      Voir tous les résultats au catalogue →
                    </button>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-[#777D86] font-mono">
                    Aucun article trouvé pour « {searchQuery} »
                  </div>
                )
              ) : (
                <div className="py-6 px-3">
                  <div className="text-[10px] font-mono tracking-widest text-[#777D86] uppercase mb-3">
                    Recherches populaires
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Sneakers', 'Varsity', 'Jean Baggy', 'Survêtement', 'Sacoche'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-[#F4F1E9] border border-[#2d2d2d] rounded-xs transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#181818] border-b border-[#282828] px-5 py-6 space-y-3">
          <button
            onClick={() => handleNav('home')}
            className="w-full text-left py-2 text-sm font-bold uppercase tracking-wider text-[#F4F1E9]"
          >
            Accueil
          </button>
          <button
            onClick={() => handleNav('catalog', 'all')}
            className="w-full text-left py-2 text-sm font-bold uppercase tracking-wider text-[#C7A747]"
          >
            Boutique complète ({products.length} pièces)
          </button>
          <div className="pl-3 py-1 space-y-1.5 border-l border-[#2e2e2e] my-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleNav('catalog', cat.id)}
                className="w-full text-left py-1 text-[#777D86] hover:text-[#C7A747]"
              >
                {cat.name}
              </button>
            ))}
          </div>
          <button
            onClick={handleLookbookScroll}
            className="w-full text-left py-2 text-xs font-semibold uppercase tracking-wider text-[#777D86]"
          >
            Lookbook Réel 2026
          </button>
          <button
            onClick={() => handleNav('order-tracking')}
            className="w-full text-left py-2 text-xs font-semibold uppercase tracking-wider text-[#777D86]"
          >
            Suivi Colis Bénin
          </button>
          <button
            onClick={() => handleNav('wishlist')}
            className="w-full text-left py-2 text-xs font-semibold uppercase tracking-wider text-[#777D86]"
          >
            Mes Favoris ({wishlist.length})
          </button>
          <button
            onClick={() => handleNav('admin')}
            className="w-full text-left py-2 text-xs font-mono uppercase tracking-wider text-[#C7A747]"
          >
            Espace Administrateur
          </button>
        </div>
      )}
    </header>
  );
};
