import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data/initialData';
import { ProductCard } from '../components/products/ProductCard';
import {
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  Check,
  ChevronDown,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const {
    products,
    isLoadingProducts,
    categoryFilter,
    setCategoryFilter,
    formatCurrency,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'featured' | 'price_asc' | 'price_desc' | 'newest'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(100000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract all available sizes in catalog
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.sizes?.forEach((s) => set.add(s));
      p.variants?.forEach((v) => {
        if (v.size && v.stock > 0) set.add(v.size);
      });
    });
    return Array.from(set).sort((a, b) => {
      // Natural sorting for clothes (S, M, L, XL) vs numbers (40, 41)
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Unique'];
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.localeCompare(b);
    });
  }, [products]);

  // Extract all unique colors from products
  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      p.colors?.forEach((c) => {
        if (!map.has(c.name)) {
          map.set(c.name, c.hex);
        }
      });
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // In stock
    if (onlyInStock) {
      result = result.filter((p) => p.totalStock > 0);
    }

    // Size (check both p.sizes and variant sizes in stock)
    if (selectedSizeFilter !== 'all') {
      result = result.filter(
        (p) =>
          p.sizes?.includes(selectedSizeFilter) ||
          p.variants?.some((v) => v.size === selectedSizeFilter && v.stock > 0)
      );
    }

    // Color
    if (selectedColorFilter !== 'all') {
      result = result.filter((p) =>
        p.colors?.some((c) => c.name.toLowerCase() === selectedColorFilter.toLowerCase())
      );
    }

    // Max Price
    result = result.filter((p) => {
      const effectivePrice = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;
      return effectivePrice <= priceMax;
    });

    // Sorting
    if (selectedSort === 'price_asc') {
      result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (selectedSort === 'price_desc') {
      result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (selectedSort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Featured
      result.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
    }

    // Strict deduplication by ID and primary image so no duplicate card ever renders
    const seenIds = new Set<string>();
    const seenImages = new Set<string>();
    return result.filter((p) => {
      if (seenIds.has(p.id)) return false;
      if (p.images[0] && seenImages.has(p.images[0])) return false;
      seenIds.add(p.id);
      if (p.images[0]) seenImages.add(p.images[0]);
      return true;
    });
  }, [
    products,
    categoryFilter,
    searchQuery,
    onlyInStock,
    selectedSizeFilter,
    selectedColorFilter,
    priceMax,
    selectedSort,
  ]);

  const resetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setOnlyInStock(false);
    setSelectedSizeFilter('all');
    setSelectedColorFilter('all');
    setPriceMax(100000);
    setSelectedSort('featured');
  };

  const activeFiltersCount =
    (categoryFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (selectedSizeFilter !== 'all' ? 1 : 0) +
    (selectedColorFilter !== 'all' ? 1 : 0) +
    (priceMax < 100000 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* 1. Header & Live Search Bar */}
      <div className="border-b border-[#242424] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C7A747] font-semibold block mb-1">
            BOUTIQUE OFFICIELLE COTONOU
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#F4F1E9]">
            Vestiaire & Silhouettes Urbaines
          </h1>
          <p className="text-xs text-[#777D86] mt-1 font-light">
            Sneakers, survêtements, vestes varsity et t-shirts en stock pour livraison 24h au Bénin.
          </p>
        </div>

        {/* Search input with instant clear */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#777D86] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher sneaker, taille, varsity..."
            className="w-full bg-[#171717] border border-[#2b2b2b] focus:border-[#C7A747] rounded-none pl-10 pr-9 py-2.5 text-xs text-[#F4F1E9] outline-none placeholder:text-[#666] font-light min-h-[44px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-[#777D86] hover:text-[#F4F1E9] p-0.5"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Categories Filter Tabs (Desktop & Tablet) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-xs uppercase tracking-wider">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`min-h-[40px] px-3.5 py-2 whitespace-nowrap transition-all border ${
            categoryFilter === 'all'
              ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold shadow-md'
              : 'bg-[#171717] text-[#777D86] hover:text-[#F4F1E9] border-[#282828] hover:border-[#444]'
          }`}
        >
          Tous ({products.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = products.filter((p) => p.category === cat.id).length;
          const isActive = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`min-h-[40px] px-3.5 py-2 whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold shadow-md'
                  : 'bg-[#171717] text-[#777D86] hover:text-[#F4F1E9] border-[#282828] hover:border-[#444]'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] ${isActive ? 'text-[#171717]/80' : 'text-[#555]'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* 2b. Quick Style Tags (Direct access to requested styles) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
        <span className="text-[#777D86] uppercase tracking-wider shrink-0 font-medium">
          Sélection :
        </span>
        {[
          { label: 'Polo & Tennis Club', query: 'polo' },
          { label: 'Denim & Jeans Baggy', query: 'jean' },
          { label: 'T-Shirts Boxy & Graphiques', query: 't-shirt' },
          { label: 'Ceintures (Western & Cobra)', query: 'ceinture' },
          { label: 'Casquettes & Snapbacks', query: 'casquette' },
          { label: 'Survêtements Molleton', query: 'survêtement' },
          { label: 'Sneakers Rétro', query: 'sneaker' },
          { label: 'Chaussures Basket', query: 'basket' },
        ].map((style) => {
          const isActive = searchQuery.toLowerCase() === style.query.toLowerCase();
          return (
            <button
              key={style.query}
              type="button"
              onClick={() => {
                if (isActive) {
                  setSearchQuery('');
                } else {
                  setSearchQuery(style.query);
                  setCategoryFilter('all');
                }
              }}
              className={`px-3 py-1.5 rounded-full border transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold shadow-sm'
                  : 'bg-[#181818] text-[#A3A8B0] hover:text-[#F4F1E9] border-[#2b2b2b] hover:border-[#444]'
              }`}
            >
              #{style.label}
            </button>
          );
        })}
      </div>

      {/* 3. Comprehensive Filter Toolbar (Price, Size, Color, Stock, Sort) */}
      <div className="p-4 bg-[#181818] border border-[#242424] space-y-4">
        {/* Top row: Quick toggles + Mobile filter button */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            {/* Mobile filter drawer trigger */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden min-h-[42px] px-3 py-2 bg-[#222222] border border-[#333333] hover:border-[#C7A747] text-[#F4F1E9] flex items-center gap-2 text-xs font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C7A747]" />
              <span>Filtres avancés</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#C7A747] text-[#171717] text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* In stock toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-[#F4F1E9] select-none min-h-[42px] px-2">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 accent-[#C7A747] cursor-pointer"
              />
              <span className="text-xs">En stock uniquement</span>
            </label>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#777D86] hidden sm:inline">Trier par :</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-[#202020] border border-[#333333] text-[#F4F1E9] text-xs px-3 py-2 outline-none font-medium min-h-[42px] cursor-pointer"
            >
              <option value="featured">En vedette</option>
              <option value="newest">Nouveautés 2026</option>
              <option value="price_asc">Prix : croissant</option>
              <option value="price_desc">Prix : décroissant</option>
            </select>
          </div>
        </div>

        {/* Desktop Detailed Filter Panels (Colors, Sizes, Price) */}
        <div className="hidden lg:grid grid-cols-3 gap-6 pt-3 border-t border-[#222222] text-xs font-mono">
          {/* A. Colors filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#777D86] uppercase font-bold text-[10px] tracking-wider">
                Couleurs ({allColors.length})
              </span>
              {selectedColorFilter !== 'all' && (
                <button
                  onClick={() => setSelectedColorFilter('all')}
                  className="text-[10px] text-[#C7A747] hover:underline"
                >
                  Toutes
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedColorFilter('all')}
                className={`px-2.5 py-1 text-[11px] border transition-colors ${
                  selectedColorFilter === 'all'
                    ? 'border-[#C7A747] bg-[#C7A747]/10 text-[#C7A747] font-bold'
                    : 'border-[#2d2d2d] bg-[#1d1d1d] text-[#888] hover:text-[#F4F1E9]'
                }`}
              >
                Toutes
              </button>
              {allColors.map((color) => {
                const isSelected = selectedColorFilter.toLowerCase() === color.name.toLowerCase();
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColorFilter(isSelected ? 'all' : color.name)}
                    className={`px-2 py-1 text-[11px] border flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'border-[#C7A747] bg-[#222222] text-[#F4F1E9] ring-1 ring-[#C7A747]'
                        : 'border-[#2d2d2d] bg-[#1d1d1d] text-[#888] hover:text-[#F4F1E9]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* B. Sizes filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#777D86] uppercase font-bold text-[10px] tracking-wider">
                Tailles / Pointures ({allSizes.length})
              </span>
              {selectedSizeFilter !== 'all' && (
                <button
                  onClick={() => setSelectedSizeFilter('all')}
                  className="text-[10px] text-[#C7A747] hover:underline"
                >
                  Toutes
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedSizeFilter('all')}
                className={`px-2.5 py-1 text-[11px] border transition-colors ${
                  selectedSizeFilter === 'all'
                    ? 'border-[#C7A747] bg-[#C7A747]/10 text-[#C7A747] font-bold'
                    : 'border-[#2d2d2d] bg-[#1d1d1d] text-[#888] hover:text-[#F4F1E9]'
                }`}
              >
                Toutes
              </button>
              {allSizes.map((size) => {
                const isSelected = selectedSizeFilter === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSizeFilter(isSelected ? 'all' : size)}
                    className={`px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                      isSelected
                        ? 'border-[#C7A747] bg-[#C7A747] text-[#171717]'
                        : 'border-[#2d2d2d] bg-[#1d1d1d] text-[#888] hover:text-[#F4F1E9]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. Price Max Slider & Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#777D86] uppercase font-bold text-[10px] tracking-wider">
                Budget maximum :
              </span>
              <span className="font-bold text-[#F4F1E9] text-xs">
                {formatCurrency(priceMax)}
              </span>
            </div>
            <input
              type="range"
              min={15000}
              max={100000}
              step={5000}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="accent-[#C7A747] w-full cursor-pointer h-2 bg-[#262626]"
            />
            <div className="flex justify-between text-[10px] text-[#666] mt-1">
              <span>15 000 F</span>
              <span>50 000 F</span>
              <span>100 000 F</span>
            </div>
          </div>
        </div>

        {/* Active Filters Summary Bar */}
        {activeFiltersCount > 0 && (
          <div className="pt-3 border-t border-[#222222] flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="text-[#777D86]">Filtres actifs :</span>

            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#202020] border border-[#333333] text-[#F4F1E9]">
                Catégorie: {CATEGORIES.find((c) => c.id === categoryFilter)?.name || categoryFilter}
                <button onClick={() => setCategoryFilter('all')} className="hover:text-[#C7A747]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedColorFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#202020] border border-[#333333] text-[#F4F1E9]">
                Couleur: {selectedColorFilter}
                <button onClick={() => setSelectedColorFilter('all')} className="hover:text-[#C7A747]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedSizeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#202020] border border-[#333333] text-[#F4F1E9]">
                Taille: {selectedSizeFilter}
                <button onClick={() => setSelectedSizeFilter('all')} className="hover:text-[#C7A747]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {priceMax < 100000 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#202020] border border-[#333333] text-[#F4F1E9]">
                Max: {formatCurrency(priceMax)}
                <button onClick={() => setPriceMax(100000)} className="hover:text-[#C7A747]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {onlyInStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#202020] border border-[#333333] text-[#F4F1E9]">
                En stock
                <button onClick={() => setOnlyInStock(false)} className="hover:text-[#C7A747]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-[#C7A747] hover:underline flex items-center gap-1 font-semibold ml-auto text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Tout réinitialiser</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Products Result Count */}
      <div className="flex items-center justify-between text-xs font-mono text-[#777D86]">
        <span>
          <strong className="text-[#F4F1E9]">{filteredProducts.length}</strong> article(s) disponible(s)
        </span>
        {searchQuery && (
          <span>
            pour « <span className="text-[#C7A747]">{searchQuery}</span> »
          </span>
        )}
      </div>

      {/* 5. Product Grid / Skeletons / Empty State */}
      {isLoadingProducts ? (
        /* Skeletons */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#181818] border border-[#242424] flex flex-col">
              <div className="aspect-[3/4] bg-[#202020]" />
              <div className="p-3.5 space-y-2">
                <div className="h-2.5 bg-[#262626] w-1/3" />
                <div className="h-3.5 bg-[#262626] w-3/4" />
                <div className="h-3 bg-[#262626] w-1/2 pt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="p-12 sm:p-16 text-center bg-[#181818] border border-[#242424] space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#202020] border border-[#333333] flex items-center justify-center text-[#777D86]">
            <Search className="w-6 h-6 text-[#C7A747]" />
          </div>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#F4F1E9]">
            Aucun article ne correspond à votre sélection
          </h3>
          <p className="text-xs text-[#777D86] max-w-md mx-auto leading-relaxed">
            Essayez de modifier votre recherche, d'augmenter le budget maximum ou de sélectionner une autre taille / couleur.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
            >
              Réinitialiser tous les filtres
            </button>
            <button
              onClick={() => {
                resetFilters();
                setCategoryFilter('sneakers');
              }}
              className="px-5 py-3 border border-[#333333] hover:border-[#F4F1E9] text-[#F4F1E9] text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Voir les Sneakers
            </button>
          </div>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      )}

      {/* 6. Mobile Filter Bottom Sheet (Optimized for Android / Mobile screens) */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-[#1a1a1a] border-t border-[#333333] rounded-t-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Sheet Handle & Header */}
            <div className="p-4 border-b border-[#282828] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#C7A747]" />
                <h3 className="font-heading font-bold text-sm text-[#F4F1E9] uppercase tracking-wider">
                  Filtres & Préférences
                </h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 text-[#777D86] hover:text-[#F4F1E9]"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-mono">
              {/* Category */}
              <div>
                <span className="text-[#777D86] uppercase font-bold text-[10px] tracking-wider block mb-2">
                  Catégories
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 border text-xs ${
                      categoryFilter === 'all'
                        ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                        : 'bg-[#222] text-[#888] border-[#333]'
                    }`}
                  >
                    Toutes
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 border text-xs ${
                        categoryFilter === cat.id
                          ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                          : 'bg-[#222] text-[#888] border-[#333]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <span className="text-[#777D86] uppercase font-bold text-[10px] tracking-wider block mb-2">
                  Couleurs
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedColorFilter('all')}
                    className={`px-3 py-1.5 border text-xs ${
                      selectedColorFilter === 'all'
                        ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                        : 'bg-[#222] text-[#888] border-[#333]'
                    }`}
                  >
                    Toutes
                  </button>
                  {allColors.map((color) => {
                    const isSelected = selectedColorFilter.toLowerCase() === color.name.toLowerCase();
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColorFilter(isSelected ? 'all' : color.name)}
                        className={`px-3 py-1.5 border text-xs flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-[#C7A747] bg-[#262626] text-[#F4F1E9]'
                            : 'border-[#333] bg-[#202020] text-[#888]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <span className="text-[#777D86] uppercase font-bold text-[10px] tracking-wider block mb-2">
                  Tailles & Pointures
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSizeFilter('all')}
                    className={`px-3 py-1.5 border text-xs ${
                      selectedSizeFilter === 'all'
                        ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                        : 'bg-[#222] text-[#888] border-[#333]'
                    }`}
                  >
                    Toutes
                  </button>
                  {allSizes.map((size) => {
                    const isSelected = selectedSizeFilter === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSizeFilter(isSelected ? 'all' : size)}
                        className={`px-3 py-1.5 border text-xs font-bold ${
                          isSelected
                            ? 'bg-[#C7A747] text-[#171717] border-[#C7A747]'
                            : 'bg-[#222] text-[#888] border-[#333]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#777D86] uppercase font-bold text-[10px]">
                    Budget Max
                  </span>
                  <span className="text-[#F4F1E9] font-bold">{formatCurrency(priceMax)}</span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={100000}
                  step={5000}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="accent-[#C7A747] w-full cursor-pointer h-2 bg-[#2a2a2a]"
                />
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="p-4 border-t border-[#282828] bg-[#141414] flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 border border-[#333] text-[#888] font-mono text-xs uppercase"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#C7A747] text-[#171717] font-heading font-bold text-xs uppercase tracking-wider"
              >
                Afficher ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
