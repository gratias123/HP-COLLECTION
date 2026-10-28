import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, LOOKBOOK_OUTFITS } from '../data/initialData';
import { ProductCard } from '../components/products/ProductCard';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  ShoppingBag,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products, setCurrentPage, setCategoryFilter, openProductDetail, formatCurrency } = useStore();

  // Hero Slider with multiple articles & random shuffle transition mode
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

  // Auto transition for hero slider every 5.5 seconds (random or sequential)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => getNextSlideIndex(prev, LOOKBOOK_OUTFITS.length, isRandomMode));
    }, 5500);
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
    if (homeFilter === 'varsity') return p.category === 'varsity';
    if (homeFilter === 'pantalons') return p.category === 'pantalons';
    if (homeFilter === 'sneakers') return p.category === 'sneakers' || p.category === 'basket';
    if (homeFilter === 'survetements') return p.category === 'survetements';
    if (homeFilter === 'accessoires') return p.category === 'accessoires';
    return true;
  }).slice(0, 12);

  // Representative image mapping for visual category capsules
  const categoryImages: Record<string, string> = {
    survetements: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    sneakers: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    basket: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=800&q=80',
    tshirts: '/assets/aistudio/1793196179671_1__fa78fa1f.jpg',
    hoodies: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    varsity: '/assets/aistudio/1793196195794_1__83aad193.jpg',
    pantalons: '/assets/aistudio/1793196164363_1__528b35f1.jpg',
    accessoires: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* 1. PRODUCT-FIRST VISUAL HERO: THE ARTICLES ARE THE MAIN ATTRACTION */}
      <section className="relative min-h-[75vh] lg:min-h-[82vh] bg-[#0d0d0d] overflow-hidden border-b border-[#222222]">
        {/* Full-bleed photography without heavy text masking gradients */}
        {LOOKBOOK_OUTFITS.map((look, index) => (
          <div
            key={look.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={look.image}
              alt={look.title}
              className="w-full h-full object-cover object-top sm:object-center filter brightness-95 contrast-105"
            />
            {/* Subtle, soft edge vignette - preserves 90% of the photograph visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/70 via-transparent to-black/40 lg:to-transparent" />
          </div>
        ))}

        {/* Content Container: Clean, discrete overlay that highlights the article */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[75vh] lg:min-h-[82vh] flex flex-col justify-between py-8 lg:py-12">
          {/* Top Info Bar: Discrete metadata & Shuffle Mode Switch */}
          <div className="flex items-center justify-between">
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
                    ? 'bg-[#C7A747]/20 text-[#C7A747] border-[#C7A747]/50 shadow-sm'
                    : 'bg-[#141414]/80 text-[#777D86] border-[#2e2e2e] hover:text-[#F4F1E9]'
                }`}
                title="Activer ou désactiver le défilement aléatoire"
              >
                <Shuffle className={`w-3 h-3 ${isRandomMode ? 'text-[#C7A747]' : ''}`} />
                <span className="hidden sm:inline">{isRandomMode ? 'Défilement Aléatoire' : 'Séquentiel'}</span>
              </button>

              <button
                onClick={triggerRandomSlide}
                className="p-1.5 bg-[#141414]/85 hover:bg-[#202020] text-[#C7A747] border border-[#2e2e2e] transition-colors"
                title="Tirer un article au hasard"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center-Bottom Split: Discreet Caption (Left) & Floating Article Shop Card (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mt-auto pt-12">
            {/* Left: Minimal, refined editorial label (no oversized wall of text) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="inline-block px-2.5 py-0.5 bg-[#C7A747] text-[#141414] text-[9px] font-mono font-black uppercase tracking-widest">
                {activeLook.tag}
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[#F4F1E9] tracking-tight leading-tight drop-shadow-md">
                {activeLook.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#F4F1E9]/80 max-w-md font-light leading-relaxed drop-shadow">
                {activeLook.subtitle}
              </p>
            </div>

            {/* Right: FLOATING INTERACTIVE PRODUCT PILL / CARD (The article is the star!) */}
            <div className="lg:col-span-6 lg:flex lg:justify-end">
              {activeProduct && (
                <div
                  onClick={() => handleOpenProduct(activeProduct.id)}
                  className="group bg-[#151515]/95 hover:bg-[#1a1a1a] backdrop-blur-xl border border-[#C7A747]/40 hover:border-[#C7A747] p-3.5 sm:p-4 rounded-xs shadow-2xl transition-all duration-300 cursor-pointer max-w-md w-full"
                >
                  <div className="flex items-center justify-between text-[9px] font-mono text-[#777D86] uppercase tracking-wider mb-2 border-b border-[#242424] pb-2">
                    <span className="text-[#C7A747] flex items-center gap-1 font-semibold">
                      <ShoppingBag className="w-3 h-3" /> PIÈCE DU DROP
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1 font-sans">
                      <CheckCircle className="w-2.5 h-2.5" /> En stock
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    {/* Thumbnail of product */}
                    <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-[#1e1e1e] border border-[#2d2d2d] group-hover:border-[#C7A747]/70 overflow-hidden flex-shrink-0">
                      <img
                        src={activeProduct.images[0]}
                        alt={activeProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-heading font-bold text-[#F4F1E9] group-hover:text-[#C7A747] transition-colors truncate">
                        {activeProduct.name}
                      </h3>
                      <p className="text-[11px] text-[#777D86] line-clamp-1 mt-0.5">
                        {activeProduct.description}
                      </p>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-mono text-sm sm:text-base font-extrabold text-[#C7A747]">
                          {formatCurrency(activeProduct.price)}
                        </span>
                        {activeProduct.salePrice && (
                          <span className="font-mono text-[10px] text-[#777D86] line-through">
                            {formatCurrency(activeProduct.salePrice)}
                          </span>
                        )}
                      </div>

                      {/* Sizes badges */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {activeProduct.sizes.slice(0, 4).map((sz) => (
                          <span
                            key={sz}
                            className="text-[8.5px] font-mono px-1.5 py-0.2 bg-[#222] border border-[#333] text-[#aaa]"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Immediate CTA Button */}
                  <div className="mt-3 pt-2.5 border-t border-[#242424] flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#C7A747] font-semibold group-hover:underline">
                      Voir la fiche & Commander →
                    </span>
                    <span className="text-[10px] font-mono text-[#777D86]">
                      Réf: {activeProduct.sku}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Visual Navigation: Visual Thumbnails of all 7 Articles */}
          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Miniature visual previews of the 7 outfits */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {LOOKBOOK_OUTFITS.map((look, idx) => (
                <button
                  key={look.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`relative w-11 h-14 sm:w-14 sm:h-16 flex-shrink-0 border-2 overflow-hidden transition-all duration-300 ${
                    idx === currentSlide
                      ? 'border-[#C7A747] scale-105 shadow-lg'
                      : 'border-[#2d2d2d] opacity-50 hover:opacity-100 hover:border-[#666]'
                  }`}
                  title={look.title}
                >
                  <img
                    src={look.image}
                    alt={look.title}
                    className="w-full h-full object-cover"
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

      {/* 2. DIRECT PRODUCT CATALOG: PUTTING ARTICLES FRONT & CENTER */}
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
              onClick={() => setHomeFilter('varsity')}
              className={`px-3 py-1.5 transition-colors border text-[11px] ${
                homeFilter === 'varsity'
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#F4F1E9] border-[#2b2b2b]'
              }`}
            >
              Vestes & Blousons
            </button>
            <button
              onClick={() => setHomeFilter('pantalons')}
              className={`px-3 py-1.5 transition-colors border text-[11px] ${
                homeFilter === 'pantalons'
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#F4F1E9] border-[#2b2b2b]'
              }`}
            >
              Denim & Cargos
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
              onClick={() => setHomeFilter('survetements')}
              className={`px-3 py-1.5 transition-colors border text-[11px] ${
                homeFilter === 'survetements'
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#F4F1E9] border-[#2b2b2b]'
              }`}
            >
              Survêtements
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

        {/* Big visual product grid */}
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

      {/* 3. VISUAL CATEGORY CAPSULES: REAL PRODUCT IMAGES, NOT TEXT BOXES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 pb-3 border-b border-[#242424] flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C7A747] font-semibold block mb-1">
              PARCOURS VISUEL
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#F4F1E9]">
              Explorer par Rayon
            </h2>
          </div>
          <button
            onClick={() => handleCategoryClick('all')}
            className="text-xs font-mono uppercase tracking-wider text-[#777D86] hover:text-[#C7A747] transition-colors"
          >
            Tout voir →
          </button>
        </div>

        {/* Visual Tiles with Product Photography */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            const bgImage = categoryImages[cat.id] || products.find((p) => p.category === cat.id)?.images[0];

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="group relative h-40 sm:h-48 overflow-hidden rounded-xs border border-[#262626] hover:border-[#C7A747] transition-all text-left flex flex-col justify-end p-4 bg-[#141414]"
              >
                {/* Background product photo */}
                {bgImage && (
                  <img
                    src={bgImage}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover object-center filter brightness-65 group-hover:scale-110 group-hover:brightness-85 transition-all duration-700 ease-out"
                  />
                )}
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Content */}
                <div className="relative z-10">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#C7A747] block font-semibold">
                    {count} {count > 1 ? 'articles' : 'article'}
                  </span>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-white group-hover:text-[#C7A747] transition-colors leading-tight mt-0.5">
                    {cat.name}
                  </h3>
                </div>
              </button>
            );
          })}
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
            Cliquez sur un look pour afficher la pièce portée
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
                {/* Photo with zoom on hover */}
                <div className="relative aspect-[3/4] bg-[#101010] overflow-hidden">
                  <img
                    src={outfit.image}
                    alt={outfit.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-95"
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

      {/* 5. SLIM ELEGANT PRIVILEGE RIBBON (NO GIANT TEXT BOX) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#181818] border border-[#C7A747]/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C7A747]/10 border border-[#C7A747]/40 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[#C7A747]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#F4F1E9]">
                Privilège Nouveau Client : 10% offerts avec le code{' '}
                <span className="font-mono text-[#C7A747] font-extrabold px-1.5 py-0.5 bg-[#202020] border border-[#333]">
                  WELCOME10
                </span>
              </p>
              <p className="text-[11px] text-[#777D86] mt-0.5">
                Valable dès 25 000 FCFA d'achats sur tout le catalogue streetwear
              </p>
            </div>
          </div>

          <button
            onClick={() => handleCategoryClick('all')}
            className="px-5 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#141414] font-heading font-extrabold text-[11px] uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span>Profiter de l'offre</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
