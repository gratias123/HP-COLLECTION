import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, LOOKBOOK_OUTFITS } from '../data/initialData';
import { ProductCard } from '../components/products/ProductCard';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Camera,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUrl';

export const HomePage: React.FC = () => {
  const { products, setCurrentPage, setCategoryFilter, openProductDetail, formatCurrency } = useStore();

  // Hero Slider with multiple articles & smooth transitions
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isRandomMode, setIsRandomMode] = useState(true);

  // Helper to pick next slide (random or sequential)
  const getNextSlideIndex = (current: number, total: number, random: boolean) => {
    if (total <= 1) return 0;
    if (random) {
      let next = Math.floor(Math.random() * total);
      while (next === current && total > 1) {
        next = Math.floor(Math.random() * total);
      }
      return next;
    }
    return (current + 1) % total;
  };

  // Auto transition for hero slider every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => getNextSlideIndex(prev, LOOKBOOK_OUTFITS.length, isRandomMode));
    }, 6000);
    return () => clearInterval(timer);
  }, [isRandomMode]);

  const nextSlide = () => {
    setCurrentSlide((prev) => getNextSlideIndex(prev, LOOKBOOK_OUTFITS.length, isRandomMode));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + LOOKBOOK_OUTFITS.length) % LOOKBOOK_OUTFITS.length);
  };

  const triggerRandomSlide = () => {
    setCurrentSlide((prev) => getNextSlideIndex(prev, LOOKBOOK_OUTFITS.length, true));
  };

  const activeLook = LOOKBOOK_OUTFITS[currentSlide];

  // Find exact product for active look
  const activeProduct =
    (activeLook.productId && products.find((p) => p.id === activeLook.productId)) ||
    products.find((p) => p.category === activeLook.category) ||
    products[0];

  const handleCategoryClick = (catId: string) => {
    setCategoryFilter(catId);
    setCurrentPage('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProduct = (productId?: string) => {
    const target = (productId && products.find((p) => p.id === productId)) || activeProduct;
    if (target) {
      openProductDetail(target);
    } else {
      handleCategoryClick(activeLook.category);
    }
  };

  // Interactive filter on HomePage grid
  const [homeFilter, setHomeFilter] = useState<string>('all');

  const filteredHomeDrops = products.filter((p) => {
    if (homeFilter === 'all') return true;
    if (homeFilter === 'survetements') return p.category === 'survetements';
    if (homeFilter === 'sneakers') return p.category === 'sneakers';
    if (homeFilter === 'basket') return p.category === 'basket';
    if (homeFilter === 'tshirts') return p.category === 'tshirts';
    if (homeFilter === 'varsity') return p.category === 'varsity';
    if (homeFilter === 'pantalons') return p.category === 'pantalons';
    if (homeFilter === 'accessoires') return p.category === 'accessoires';
    return true;
  }).slice(0, 24);

  // The 6 essential product lines requested by user
  const ESSENTIAL_LINES = [
    {
      id: 'survetements',
      title: 'Joggings & Survêtements',
      subtitle: 'Ensembles en molleton lourd 420 GSM & trackpants confort',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      minPrice: 38000,
    },
    {
      id: 'sneakers',
      title: 'Sneakers Lifestyle',
      subtitle: 'Silhouettes rétro, chunky sole & paires basses exclusives',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      minPrice: 42000,
    },
    {
      id: 'basket',
      title: 'Chaussures de Basket',
      subtitle: 'Silhouettes montantes, maintien cheville & street court',
      image: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=800&q=80',
      minPrice: 48000,
    },
    {
      id: 'tshirts',
      title: 'Tee-shirts & Polos',
      subtitle: 'Coton peigné lourd 240 GSM, coupes oversize & graphismes',
      image: '/assets/aistudio/1793196179671_1__fa78fa1f.jpg',
      minPrice: 18000,
    },
    {
      id: 'varsity',
      title: 'Vestes Varsity & Blousons',
      subtitle: 'Teddy cuir vegan texturé, vestes de course & denim épais',
      image: '/assets/aistudio/1793196195794_1__83aad193.jpg',
      minPrice: 45000,
    },
    {
      id: 'accessoires',
      title: 'Accessoires & Sacoches',
      subtitle: 'Sacoches box crossbody, casquettes brodées & ceintures',
      image: '/assets/aistudio/1793196164363_1__528b35f1.jpg',
      minPrice: 15000,
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION: BOLD URBAN PHOTOGRAPHY, CLEAN SHORT HOOK & DECISIVE BUY CTA */}
      <section className="relative min-h-[80vh] lg:min-h-[85vh] bg-[#0d0d0d] overflow-hidden border-b border-[#242424] flex items-end">
        {/* Full-bleed high-fashion urban photography */}
        {LOOKBOOK_OUTFITS.map((look, index) => (
          <div
            key={look.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={getOptimizedImageUrl(look.image, { width: 1400, quality: 85 })}
              alt={`${look.title} - Mode urbaine et streetwear HP COLLECTION Cotonou Bénin`}
              className="w-full h-full object-cover object-top sm:object-center filter brightness-95 contrast-105"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding={index === 0 ? 'sync' : 'async'}
            />
            {/* Subtle, soft edge vignette preserving 90% of photo visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-black/30 lg:to-transparent" />
          </div>
        ))}

        {/* Hero Overlay Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 sm:py-16 flex flex-col justify-between min-h-[80vh] lg:min-h-[85vh]">
          {/* Top Bar: Drop Metadata & Slide Mode */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 px-3 py-1 bg-[#141414]/85 backdrop-blur-md border border-[#2e2e2e]">
              <span className="w-2 h-2 rounded-full bg-[#C7A747] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C7A747] font-semibold">
                Drop Réel 2026
              </span>
              <span className="text-[10px] font-mono text-[#777D86] border-l border-[#333] pl-2">
                0{currentSlide + 1} / 0{LOOKBOOK_OUTFITS.length}
              </span>
            </div>

            {/* Random / Sequential Mode Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRandomMode(!isRandomMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider backdrop-blur-md border transition-all ${
                  isRandomMode
                    ? 'bg-[#C7A747]/20 text-[#C7A747] border-[#C7A747]/60 shadow-sm'
                    : 'bg-[#141414]/85 text-[#777D86] border-[#2e2e2e] hover:text-[#F4F1E9]'
                }`}
                title="Activer ou désactiver le défilement aléatoire"
              >
                <Shuffle className={`w-3 h-3 ${isRandomMode ? 'text-[#C7A747]' : ''}`} />
                <span className="hidden sm:inline">{isRandomMode ? 'Défilement Aléatoire' : 'Séquentiel'}</span>
              </button>

              <button
                onClick={triggerRandomSlide}
                className="p-1.5 bg-[#141414]/85 hover:bg-[#202020] text-[#C7A747] border border-[#2e2e2e] transition-colors"
                title="Tirer un look au hasard"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Hero Hook & Purchase Action */}
          <div className="space-y-6 max-w-2xl mt-auto pb-4">
            <div className="inline-block px-3 py-1 bg-[#C7A747] text-[#141414] text-[10px] font-mono font-black uppercase tracking-widest">
              {activeLook.tag}
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-[#F4F1E9] tracking-tight leading-[1.05] drop-shadow-md">
                {activeLook.title}
              </h1>
              <p className="text-sm sm:text-base text-[#F4F1E9]/90 max-w-lg font-light leading-relaxed drop-shadow">
                {activeLook.subtitle} — Pièces authentiques sélectionnées et livrées sous 24h à Cotonou.
              </p>
            </div>

            {/* Decisive Purchase & Explore Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {activeProduct && (
                <button
                  onClick={() => openProductDetail(activeProduct)}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-black text-xs sm:text-sm uppercase tracking-widest transition-all inline-flex items-center gap-3 shadow-2xl group cursor-pointer"
                >
                  <span>Commander cette pièce ({formatCurrency(activeProduct.price)})</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}

              <button
                onClick={() => handleCategoryClick('all')}
                className="px-6 py-3.5 sm:py-4 bg-[#141414]/90 hover:bg-[#1f1f1f] border border-[#333333] hover:border-[#C7A747] text-[#F4F1E9] font-mono text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2"
              >
                <span>Explorer le Vestiaire</span>
              </button>
            </div>
          </div>

          {/* Bottom Thumbnails & Slide Controls */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Visual miniatures of the looks (Directly visible, no scrollbar) */}
            <div className="flex flex-wrap items-center gap-2">
              {LOOKBOOK_OUTFITS.map((look, idx) => (
                <button
                  key={look.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`relative w-12 h-14 sm:w-14 sm:h-16 flex-shrink-0 border-2 overflow-hidden transition-all duration-300 ${
                    idx === currentSlide
                      ? 'border-[#C7A747] scale-105 shadow-lg'
                      : 'border-[#2d2d2d] opacity-50 hover:opacity-100 hover:border-[#666]'
                  }`}
                  title={look.title}
                >
                  <img
                    src={look.image}
                    alt={`${look.title} aperçu silhouette`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  {idx === currentSlide && (
                    <div className="absolute inset-0 border border-[#C7A747] bg-[#C7A747]/10" />
                  )}
                </button>
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={prevSlide}
                className="p-2.5 bg-[#141414]/90 hover:bg-[#202020] text-[#F4F1E9] border border-[#2e2e2e] transition-colors"
                aria-label="Article précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2.5 bg-[#141414]/90 hover:bg-[#202020] text-[#F4F1E9] border border-[#2e2e2e] transition-colors"
                aria-label="Article suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 6 ESSENTIAL PRODUCT LINES: JOGGINGS, SNEAKERS, BASKET, TEE-SHIRTS, VESTES, ACCESSOIRES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 pb-4 border-b border-[#242424] flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C7A747] font-semibold block mb-1">
              RAYONS DU VESTIAIRE
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F1E9]">
              Les 6 Lignes Essentielles
            </h2>
          </div>
          <button
            onClick={() => handleCategoryClick('all')}
            className="text-xs font-mono uppercase tracking-wider text-[#777D86] hover:text-[#C7A747] transition-colors flex items-center gap-1"
          >
            Voir toute la collection ({products.length} pièces) →
          </button>
        </div>

        {/* 6 Elegant Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ESSENTIAL_LINES.map((line) => {
            const count = products.filter((p) => p.category === line.id).length;

            return (
              <div
                key={line.id}
                onClick={() => handleCategoryClick(line.id)}
                className="group relative h-64 sm:h-72 overflow-hidden rounded-xs border border-[#262626] hover:border-[#C7A747] transition-all duration-300 text-left flex flex-col justify-end p-5 bg-[#141414] cursor-pointer"
              >
                {/* Background image */}
                <img
                  src={getOptimizedImageUrl(line.image, { width: 700, quality: 80 })}
                  alt={`${line.title} au Bénin - Rayon HP COLLECTION`}
                  className="absolute inset-0 w-full h-full object-cover object-center filter brightness-65 group-hover:scale-108 group-hover:brightness-80 transition-all duration-700 ease-out"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />

                {/* Content */}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#C7A747] font-semibold">
                    <span>{count} pièces en stock</span>
                    <span>Dès {formatCurrency(line.minPrice)}</span>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-white group-hover:text-[#C7A747] transition-colors leading-tight">
                    {line.title}
                  </h3>
                  <p className="text-xs text-[#9ca3af] font-light line-clamp-1">
                    {line.subtitle}
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-[11px] font-mono text-[#C7A747] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explorer le rayon</span>
                    <ArrowRight className="w-3 h-3 -translate-x-1 group-hover:translate-x-0 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CURATED PRODUCT CATALOG: REGULAR, ELEGANT GRID OF ARTICLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#242424]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C7A747] font-semibold block mb-1">
              DISPONIBLE EN BOUTIQUE • COTONOU & CALAVI
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F1E9]">
              Derniers Arrivages & Drops
            </h2>
          </div>

          {/* Quick Category Filters */}
          <div className="flex flex-wrap gap-1.5 text-xs font-mono uppercase tracking-wider">
            <button
              onClick={() => setHomeFilter('all')}
              className={`px-3 py-1.5 transition-colors border text-[11px] ${
                homeFilter === 'all'
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#F4F1E9] border-[#2b2b2b]'
              }`}
            >
              Tous ({products.length})
            </button>
            <button
              onClick={() => setHomeFilter('survetements')}
              className={`px-3 py-1.5 transition-colors border text-[11px] ${
                homeFilter === 'survetements'
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#F4F1E9] border-[#2b2b2b]'
              }`}
            >
              Joggings
            </button>
            <button
              onClick={() => setHomeFilter('sneakers')}
              className={`px-3 py-1.5 transition-colors border text-[11px] ${
                homeFilter === 'sneakers'
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#F4F1E9] border-[#2b2b2b]'
              }`}
            >
              Sneakers
            </button>
            <button
              onClick={() => setHomeFilter('basket')}
              className={`px-3 py-1.5 transition-colors border text-[11px] ${
                homeFilter === 'basket'
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#F4F1E9] border-[#2b2b2b]'
              }`}
            >
              Basket
            </button>
            <button
              onClick={() => setHomeFilter('tshirts')}
              className={`px-3 py-1.5 transition-colors border text-[11px] ${
                homeFilter === 'tshirts'
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#F4F1E9] border-[#2b2b2b]'
              }`}
            >
              Tee-shirts
            </button>
            <button
              onClick={() => setHomeFilter('varsity')}
              className={`px-3 py-1.5 transition-colors border text-[11px] ${
                homeFilter === 'varsity'
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#F4F1E9] border-[#2b2b2b]'
              }`}
            >
              Vestes
            </button>
            <button
              onClick={() => setHomeFilter('accessoires')}
              className={`px-3 py-1.5 transition-colors border text-[11px] ${
                homeFilter === 'accessoires'
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#F4F1E9] border-[#2b2b2b]'
              }`}
            >
              Accessoires
            </button>
          </div>
        </div>

        {/* Big regular product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredHomeDrops.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Direct Link to full catalog */}
        <div className="mt-10 text-center">
          <button
            onClick={() => handleCategoryClick('all')}
            className="px-8 py-3.5 bg-[#1b1b1b] hover:bg-[#242424] border border-[#C7A747]/50 hover:border-[#C7A747] text-[#F4F1E9] hover:text-[#C7A747] font-mono text-xs uppercase tracking-widest transition-all inline-flex items-center gap-3 shadow-lg"
          >
            <span>Explorer l'ensemble du vestiaire ({products.length} articles)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. REAL STREET LOOKS & SILHOUETTES GALLERY (ID: lookbook) */}
      <section id="lookbook" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-3 border-b border-[#242424]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C7A747] font-semibold block mb-1">
              LOOKBOOK ÉDITION 2026
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#F4F1E9]">
              Silhouettes & Tenues Complètes
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#777D86]">
            Cliquez sur un look pour commander la pièce portée
          </span>
        </div>

        {/* 3 Large High-Fashion Outfit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LOOKBOOK_OUTFITS.slice(0, 3).map((outfit) => {
            const outfitProduct = products.find((p) => p.id === outfit.productId);

            return (
              <div
                key={outfit.id}
                onClick={() => handleOpenProduct(outfit.productId)}
                className="group relative bg-[#151515] border border-[#262626] hover:border-[#C7A747] transition-all duration-300 rounded-xs overflow-hidden cursor-pointer"
              >
                {/* Photo with subtle zoom on hover */}
                <div className="relative aspect-[3/4] bg-[#101010] overflow-hidden">
                  <img
                    src={outfit.image}
                    alt={`${outfit.title} - Look streetwear HP COLLECTION Bénin`}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-95"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-75" />

                  {/* Discrete tag badge */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#141414]/90 border border-[#2e2e2e] text-[9px] font-mono uppercase tracking-widest text-[#C7A747]">
                    {outfit.tag}
                  </div>

                  {/* Floating price pill directly on image */}
                  {outfitProduct && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#141414]/90 backdrop-blur-md border border-[#C7A747]/60 text-right">
                      <span className="text-[11px] font-mono font-bold text-[#C7A747] block">
                        {formatCurrency(outfitProduct.price)}
                      </span>
                      <span className="text-[8px] font-mono uppercase text-[#999] tracking-wider">
                        Acheter ce look →
                      </span>
                    </div>
                  )}
                </div>

                {/* Minimal title footer */}
                <div className="p-3.5 bg-[#151515] border-t border-[#222222]">
                  <h3 className="font-heading text-sm font-bold text-[#F4F1E9] group-hover:text-[#C7A747] transition-colors truncate">
                    {outfit.title}
                  </h3>
                  <p className="text-[11px] text-[#777D86] line-clamp-1 mt-0.5">
                    {outfit.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. LOCAL SERVICE ASSURANCES: REALISTIC, BÉNIN-FOCUSED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#262626] bg-[#151515] p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 bg-[#1d1d1d] border border-[#2e2e2e] flex items-center justify-center flex-shrink-0 text-[#C7A747]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[#F4F1E9]">
                Livraison Express 24h
              </h4>
              <p className="text-xs text-[#777D86] mt-0.5 leading-relaxed font-light">
                À Cotonou, Calavi et Porto-Novo par coursier moto dédié avec suivi téléphonique.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 bg-[#1d1d1d] border border-[#2e2e2e] flex items-center justify-center flex-shrink-0 text-[#C7A747]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[#F4F1E9]">
                Paiement à la Livraison
              </h4>
              <p className="text-xs text-[#777D86] mt-0.5 leading-relaxed font-light">
                Réglez au déballage en espèces, Moov Money ou MTN Mobile Money sans frais cachés.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 bg-[#1d1d1d] border border-[#2e2e2e] flex items-center justify-center flex-shrink-0 text-[#C7A747]">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[#F4F1E9]">
                Essayage & Échange 48h
              </h4>
              <p className="text-xs text-[#777D86] mt-0.5 leading-relaxed font-light">
                Essayez directement au passage du livreur. Échange de taille gratuit sous 48h.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
