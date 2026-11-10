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
  Shield,
  ArrowRight,
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
    cartPulsing,
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

  // Live search filtering with strict deduplication
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    const seenIds = new Set<string>();
    const seenImages = new Set<string>();
    const matches: typeof products = [];

    for (const p of products) {
      if (seenIds.has(p.id) || (p.images[0] && seenImages.has(p.images[0]))) continue;
      const match =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      if (match) {
        seenIds.add(p.id);
        if (p.images[0]) seenImages.add(p.images[0]);
        matches.push(p);
        if (matches.length >= 6) break;
      }
    }
    return matches;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Mobile Menu & Search Triggers (Mobile & Tablet < lg) */}
          <div className="flex items-center lg:hidden gap-1 flex-shrink-0">
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

          {/* 2. Brand Wordmark & Monogram Logo (Protected width, clean typography, no collision) */}
          <div className="flex items-center flex-shrink-0 mr-4">
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-3 group focus:outline-none text-left flex-shrink-0"
            >
              {/* Haute Couture Fashion Insignia */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 relative flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105">
                <svg
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="hpFashionGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F5DF95" />
                      <stop offset="45%" stopColor="#C7A747" />
                      <stop offset="100%" stopColor="#967724" />
                    </linearGradient>
                    <linearGradient id="hpDarkMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E1E22" />
                      <stop offset="100%" stopColor="#0E0E10" />
                    </linearGradient>
                    <linearGradient id="hpSheen" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Octagonal Faceted Atelier Shield / Hallmark */}
                  <polygon
                    points="9,2 35,2 42,9 42,35 35,42 9,42 2,35 2,9"
                    fill="url(#hpDarkMetal)"
                    stroke="url(#hpFashionGold)"
                    strokeWidth="1.2"
                    className="transition-all duration-300 group-hover:stroke-[#F5DF95]"
                  />

                  {/* High-Fashion Sheen Overlay on Top Half */}
                  <polygon
                    points="9,3 35,3 41,9 41,22 3,22 3,9"
                    fill="url(#hpSheen)"
                  />

                  {/* Inner Couturier Hairline Border */}
                  <polygon
                    points="11,5.5 33,5.5 38.5,11 38.5,33 33,38.5 11,38.5 5.5,33 5.5,11"
                    fill="none"
                    stroke="#C7A747"
                    strokeWidth="0.6"
                    strokeOpacity="0.35"
                  />

                  {/* Haute Couture Atelier Star (Top Center Jewel) */}
                  <path
                    d="M 22 5.5 L 22.8 7.2 L 24.5 8 L 22.8 8.8 L 22 10.5 L 21.2 8.8 L 19.5 8 L 21.2 7.2 Z"
                    fill="url(#hpFashionGold)"
                  />

                  {/* Couturier Needle (Left Pillar of H) */}
                  <path
                    d="M 13.5 13.5 L 16.5 13.5 L 16.5 28.5 L 15 31.5 L 13.5 28.5 Z"
                    fill="url(#hpFashionGold)"
                  />
                  {/* Eyelet of the needle */}
                  <circle cx="15" cy="15.5" r="0.8" fill="#141416" />

                  {/* Crossbar connecting H to P */}
                  <rect x="16.5" y="20.5" width="6.5" height="2" fill="#F4F1E9" />

                  {/* Shared Central Pillar of H and P */}
                  <rect x="22" y="13.5" width="2.8" height="17" rx="0.5" fill="url(#hpFashionGold)" />

                  {/* Serifs at top and bottom of central pillar */}
                  <rect x="20.5" y="13" width="5.8" height="1" fill="url(#hpFashionGold)" />
                  <rect x="20.5" y="29.5" width="5.8" height="1" fill="url(#hpFashionGold)" />

                  {/* Sculpted Haute Couture Loop of P */}
                  <path
                    d="M 24.8 13.8 C 29.5 13.8 33 16 33 19.2 C 33 22.4 29.5 24.6 24.8 24.6"
                    fill="none"
                    stroke="url(#hpFashionGold)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Inner loop contour for dimensional depth */}
                  <path
                    d="M 24.8 16 C 27.8 16 30.2 17.2 30.2 19.2 C 30.2 21.2 27.8 22.4 24.8 22.4"
                    fill="none"
                    stroke="#F4F1E9"
                    strokeWidth="0.8"
                    strokeOpacity="0.85"
                  />

                  {/* Atelier Tailor Stitching Marks at Bottom */}
                  <line x1="17" y1="35.5" x2="27" y2="35.5" stroke="#C7A747" strokeWidth="0.8" strokeDasharray="1.5 1.5" strokeOpacity="0.6" />
                </svg>
              </div>

              {/* Brand typography */}
              <div className="flex flex-col flex-shrink-0">
                <span className="font-heading text-lg sm:text-xl font-black text-[#F4F1E9] tracking-[0.14em] whitespace-nowrap group-hover:text-white transition-colors leading-none">
                  HP COLLECTION
                </span>
                <span className="text-[9px] uppercase tracking-[0.28em] text-[#777D86] group-hover:text-[#C7A747] transition-colors font-mono whitespace-nowrap mt-1 leading-none">
                  MAISON DE MODE
                </span>
              </div>
            </button>
          </div>

          {/* 3. Desktop Navigation Menu (Floating Luxury Capsule Dock) */}
          <nav className="hidden lg:flex items-center justify-center flex-1 px-2">
            <div className="flex items-center gap-1 xl:gap-1.5 bg-[#17171a]/90 border border-[#27272b] p-1 rounded-full shadow-[0_2px_14px_rgba(0,0,0,0.5)] backdrop-blur-xl text-[11px] font-mono tracking-[0.14em] uppercase font-medium">
              {/* Accueil */}
              <button
                onClick={() => handleNav('home')}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  currentPage === 'home'
                    ? 'bg-[#C7A747]/15 text-[#C7A747] font-bold border border-[#C7A747]/30 shadow-xs'
                    : 'text-[#9CA3AF] hover:text-[#F4F1E9] hover:bg-[#222226]'
                }`}
              >
                Accueil
              </button>

              {/* Rayons Dropdown */}
              <div
                className="relative flex-shrink-0"
                onMouseEnter={() => setCategoriesDropdownOpen(true)}
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
              >
                <button
                  onClick={() => handleNav('catalog', 'all')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    currentPage === 'catalog'
                      ? 'bg-[#C7A747]/15 text-[#C7A747] font-bold border border-[#C7A747]/30 shadow-xs'
                      : 'text-[#9CA3AF] hover:text-[#F4F1E9] hover:bg-[#222226]'
                  }`}
                >
                  <span>Rayons</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 text-[#777D86] ${
                      categoriesDropdownOpen ? 'rotate-180 text-[#C7A747]' : ''
                    }`}
                  />
                </button>

                {categoriesDropdownOpen && (
                  <div className="absolute top-full -left-12 mt-2 w-[520px] bg-[#161616]/98 backdrop-blur-2xl border border-[#2d2d2d] shadow-2xl p-5 rounded-xs animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
                      <span className="text-[10px] font-mono tracking-[0.25em] text-[#C7A747] uppercase font-bold">
                        Rayons du Vestiaire ({products.length} pièces)
                      </span>
                      <button
                        onClick={() => handleNav('catalog', 'all')}
                        className="text-[10px] text-[#777D86] hover:text-[#C7A747] transition-colors flex items-center gap-1 font-mono tracking-wider"
                      >
                        Tout afficher
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
                      <span className="text-[#C7A747]">
                        Disponibilité immédiate en stock
                      </span>
                      <span className="text-[#777]">Paiement à la livraison</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Elegant micro-divider */}
              <span className="w-px h-3.5 bg-[#2d2d33] mx-1 shrink-0" aria-hidden="true" />

              {/* Direct Streetwear Lines Shortcuts */}
              <button
                onClick={() => handleNav('catalog', 'sneakers')}
                className="px-3 py-1.5 rounded-full text-[#9CA3AF] hover:text-[#F4F1E9] hover:bg-[#222226] transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                Sneakers
              </button>

              <button
                onClick={() => handleNav('catalog', 'survetements')}
                className="px-3 py-1.5 rounded-full text-[#9CA3AF] hover:text-[#F4F1E9] hover:bg-[#222226] transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                Joggings
              </button>

              <button
                onClick={() => handleNav('catalog', 'varsity')}
                className="px-3 py-1.5 rounded-full text-[#9CA3AF] hover:text-[#F4F1E9] hover:bg-[#222226] transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                Vestes
              </button>

              {/* Elegant micro-divider */}
              <span className="w-px h-3.5 bg-[#2d2d33] mx-1 shrink-0" aria-hidden="true" />

              {/* Lookbook */}
              <button
                onClick={handleLookbookScroll}
                className="px-3.5 py-1.5 rounded-full text-[#9CA3AF] hover:text-[#C7A747] hover:bg-[#222226] transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                Lookbook
              </button>

              {/* Suivi Colis */}
              <button
                onClick={() => handleNav('order-tracking')}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  currentPage === 'order-tracking'
                    ? 'bg-[#C7A747]/15 text-[#C7A747] font-bold border border-[#C7A747]/30 shadow-xs'
                    : 'text-[#9CA3AF] hover:text-[#F4F1E9] hover:bg-[#222226]'
                }`}
              >
                Suivi
              </button>
            </div>
          </nav>

          {/* 4. Right Action Suite (Clean, aligned, perfectly proportioned) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Search Trigger Button */}
            <button
              onClick={() => setSearchOverlayOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-[#1b1b1b] hover:bg-[#222222] border border-[#2b2b2b] hover:border-[#C7A747] rounded-xs text-[#777D86] hover:text-[#F4F1E9] transition-all flex-shrink-0"
              title="Rechercher un article"
              aria-label="Recherche"
            >
              <Search className="w-3.5 h-3.5 text-[#C7A747]" />
              <span className="hidden xl:inline text-[11px] font-mono tracking-wider">
                Rechercher
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

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className={`relative flex items-center gap-2 px-3 py-1.5 bg-[#1c1c1c] hover:bg-[#242424] border rounded-xs text-[#F4F1E9] transition-all group flex-shrink-0 ${
                cartPulsing
                  ? 'animate-subtle-pulse border-[#C7A747] ring-1 ring-[#C7A747]/70 bg-[#252525]'
                  : 'border-[#2c2c2c] hover:border-[#C7A747]/70'
              }`}
              aria-label="Panier"
            >
              <div className="relative">
                <ShoppingBag className={`w-4 h-4 transition-transform group-hover:scale-105 ${cartPulsing ? 'text-[#C7A747] scale-110' : 'text-[#C7A747]'}`} />
                {cartCount > 0 && (
                  <span className={`absolute -top-1.5 -right-2 flex items-center justify-center min-w-[15px] h-[15px] px-0.5 text-[8.5px] font-mono font-black text-[#171717] bg-[#C7A747] rounded-full transition-transform ${cartPulsing ? 'scale-110' : ''}`}>
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left border-l border-[#2e2e2e] pl-2 whitespace-nowrap">
                <span className="text-[7.5px] font-mono uppercase tracking-wider text-[#777D86] leading-none">
                  Panier
                </span>
                <span className="text-[11px] font-mono font-bold tracking-tight text-[#F4F1E9]">
                  {cartCount > 0 ? formatCurrency(cartSubtotal) : '0 FCFA'}
                </span>
              </div>
            </button>

            {/* Admin Entry Pill */}
            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase px-2.5 py-1.5 border transition-all rounded-xs flex-shrink-0 whitespace-nowrap ${
                isAdminAuthenticated
                  ? 'border-[#C7A747] text-[#C7A747] bg-[#C7A747]/10'
                  : 'border-[#2c2c2c] text-[#777D86] hover:text-[#F4F1E9] hover:border-[#444] hover:bg-[#202020]'
              }`}
              title="Accès Administrateur HP Collection"
            >
              <Shield className="w-3 h-3 text-[#C7A747]" />
              <span className="hidden xl:inline">Admin</span>
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
        <div className="lg:hidden bg-[#161616] border-b border-[#242424] px-5 py-5 space-y-1">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left py-2.5 text-xs font-mono font-semibold uppercase tracking-[0.16em] transition-colors ${
              currentPage === 'home' ? 'text-[#C7A747]' : 'text-[#F4F1E9] hover:text-[#C7A747]'
            }`}
          >
            Accueil
          </button>

          <button
            onClick={() => handleNav('catalog', 'all')}
            className={`w-full text-left py-2.5 text-xs font-mono font-semibold uppercase tracking-[0.16em] transition-colors ${
              currentPage === 'catalog' ? 'text-[#C7A747]' : 'text-[#F4F1E9] hover:text-[#C7A747]'
            }`}
          >
            Boutique
          </button>

          <button
            onClick={handleLookbookScroll}
            className="w-full text-left py-2.5 text-xs font-mono font-semibold uppercase tracking-[0.16em] text-[#A1A1AA] hover:text-[#C7A747] transition-colors"
          >
            Lookbook
          </button>

          <button
            onClick={() => handleNav('order-tracking')}
            className={`w-full text-left py-2.5 text-xs font-mono font-semibold uppercase tracking-[0.16em] transition-colors ${
              currentPage === 'order-tracking' ? 'text-[#C7A747]' : 'text-[#A1A1AA] hover:text-[#C7A747]'
            }`}
          >
            Suivi de Commande
          </button>

          <button
            onClick={() => handleNav('wishlist')}
            className={`w-full text-left py-2.5 text-xs font-mono font-semibold uppercase tracking-[0.16em] transition-colors ${
              currentPage === 'wishlist' ? 'text-[#C7A747]' : 'text-[#A1A1AA] hover:text-[#C7A747]'
            }`}
          >
            Mes Favoris
          </button>

          <button
            onClick={() => handleNav('contact')}
            className={`w-full text-left py-2.5 text-xs font-mono font-semibold uppercase tracking-[0.16em] transition-colors ${
              currentPage === 'contact' ? 'text-[#C7A747]' : 'text-[#A1A1AA] hover:text-[#C7A747]'
            }`}
          >
            Service Client
          </button>
        </div>
      )}
    </header>
  );
};
