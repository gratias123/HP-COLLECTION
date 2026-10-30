import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data/initialData';
import { ProductCard } from '../components/products/ProductCard';
import { Search, X, RotateCcw } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const {
    products,
    categoryFilter,
    setCategoryFilter,
    formatCurrency,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'featured' | 'price_asc' | 'price_desc' | 'newest'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(100000);

  // Collect all available sizes in current catalog
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Search
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

    // In stock only
    if (onlyInStock) {
      result = result.filter((p) => p.totalStock > 0);
    }

    // Size filter
    if (selectedSizeFilter !== 'all') {
      result = result.filter((p) => p.sizes.includes(selectedSizeFilter));
    }

    // Price Max
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
      // Featured first
      result.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
    }

    return result;
  }, [products, categoryFilter, searchQuery, onlyInStock, selectedSizeFilter, priceMax, selectedSort]);

  const resetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setOnlyInStock(false);
    setSelectedSizeFilter('all');
    setPriceMax(100000);
    setSelectedSort('featured');
  };

  const hasActiveFilters =
    categoryFilter !== 'all' ||
    searchQuery.trim().length > 0 ||
    onlyInStock ||
    selectedSizeFilter !== 'all' ||
    priceMax < 100000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#242424] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C7A747] font-semibold block mb-1">
            CATALOGUE OFFICIEL
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#F4F1E9]">
            Vestiaire & Silhouettes
          </h1>
          <p className="text-xs text-[#777D86] mt-1 font-light">
            Découvrez nos vestes, denims, sneakers et accessoires streetwear disponibles à Cotonou.
          </p>
        </div>

        {/* Clean Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-[#777D86] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un modèle, denim, varsity..."
            className="w-full bg-[#171717] border border-[#2b2b2b] focus:border-[#C7A747] rounded-none pl-9 pr-9 py-2 text-xs text-[#F4F1E9] outline-none placeholder:text-[#555] font-light"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[#777D86] hover:text-[#F4F1E9]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Minimalist Horizontal Pills (All visible directly, no horizontal scrollbar) */}
      <div className="flex flex-wrap items-center gap-2 pb-2 font-mono text-xs uppercase tracking-wider">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3.5 py-1.5 whitespace-nowrap transition-all border ${
            categoryFilter === 'all'
              ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
              : 'bg-[#171717] text-[#777D86] hover:text-[#F4F1E9] border-[#282828]'
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
              className={`px-3.5 py-1.5 whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#C7A747] text-[#171717] border-[#C7A747] font-bold'
                  : 'bg-[#171717] text-[#777D86] hover:text-[#F4F1E9] border-[#282828]'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] ml-1.5 ${isActive ? 'text-[#171717]/80' : 'text-[#555]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter toolbar & Sort */}
      <div className="p-3.5 bg-[#171717] border border-[#242424] rounded-none flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          {/* In stock toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-[#F4F1E9]/80 select-none">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="accent-[#C7A747]"
            />
            <span>En stock</span>
          </label>

          {/* Size filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#777D86]">Taille :</span>
            <select
              value={selectedSizeFilter}
              onChange={(e) => setSelectedSizeFilter(e.target.value)}
              className="bg-[#202020] border border-[#2e2e2e] text-[#F4F1E9] text-[11px] px-2 py-1 outline-none"
            >
              <option value="all">Toutes</option>
              {allSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Price Max Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[#777D86]">Max :</span>
            <input
              type="range"
              min={15000}
              max={100000}
              step={5000}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="accent-[#C7A747] w-24 sm:w-28 cursor-pointer"
            />
            <span className="font-bold text-[#F4F1E9]">
              {formatCurrency(priceMax)}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[#C7A747] hover:underline flex items-center gap-1 font-semibold ml-2 text-[10px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[#777D86]">Tri :</span>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as any)}
            className="bg-[#202020] border border-[#2e2e2e] text-[#F4F1E9] text-[11px] px-2.5 py-1 outline-none font-medium"
          >
            <option value="featured">En vedette</option>
            <option value="newest">Nouveautés</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* Products Counter */}
      <div className="text-[11px] font-mono text-[#777D86]">
        {filteredProducts.length} article(s) trouvé(s)
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-[#171717] border border-[#242424] space-y-4">
          <h3 className="font-heading text-lg font-bold text-[#F4F1E9]">
            Aucun article ne correspond à ces critères
          </h3>
          <p className="text-xs text-[#777D86] max-w-sm mx-auto">
            Modifiez votre recherche ou réinitialisez les filtres pour consulter la totalité du catalogue.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider transition-colors font-heading"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
