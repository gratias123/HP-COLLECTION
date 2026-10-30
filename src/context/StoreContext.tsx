import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  DeliveryZone,
  PromoCode,
  StoreSettings,
  Order,
} from '../types';
import { CATEGORIES } from '../data/initialData';
import { api } from '../services/api';
import { updatePageSEO } from '../utils/seo';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  // Products
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  selectedProductForDetail: Product | null;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, variantId: string, quantity?: number) => boolean;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;

  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Delivery & Settings
  deliveryZones: DeliveryZone[];
  settings: StoreSettings | null;
  refreshSettings: () => Promise<void>;

  // Promo Code
  appliedPromo: {
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  } | null;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;

  // Checkout & Modals
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;

  // Admin Auth
  adminToken: string | null;
  adminUser: { id: string; email: string; fullName: string } | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (token: string, user: { id: string; email: string; fullName: string }) => void;
  logoutAdmin: () => void;

  // Utilities
  formatCurrency: (amount: number) => string;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Navigation page state
  currentPage: string;
  setCurrentPage: (page: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hp_collection_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hp_collection_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Delivery & Settings
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Promo Code
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  } | null>(null);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Admin session
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('hp_admin_token'));
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; fullName: string } | null>(() => {
    try {
      const saved = localStorage.getItem('hp_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Page Routing (simple fast SPA router with URL sync)
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.replace(/^\//, '');
    const validPages = ['home', 'catalog', 'order-tracking', 'contact', 'delivery-info', 'legal', 'privacy', 'mentions', 'admin', 'wishlist'];
    if (validPages.includes(path)) return path;
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (pageParam && validPages.includes(pageParam)) return pageParam;
    if (params.get('category') || params.get('product')) return 'catalog';
    return 'home';
  });
  const [categoryFilter, setCategoryFilter] = useState<string>(() => {
    if (typeof window === 'undefined') return 'all';
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || 'all';
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hp_collection_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hp_collection_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Load Products
  const refreshProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const data = await api.getProducts();
      setProducts(data.products || []);
    } catch (err: any) {
      console.error('Failed to load products', err);
      showToast('Impossible de charger les produits. Vérifiez votre connexion.', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [showToast]);

  // Load Settings & Delivery Zones
  const refreshSettings = useCallback(async () => {
    try {
      const [settingsData, zonesData] = await Promise.all([api.getSettings(), api.getDeliveryZones()]);
      setSettings(settingsData.settings);
      setDeliveryZones(zonesData.zones || []);
    } catch (err) {
      console.error('Failed to load settings or delivery zones', err);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
    refreshSettings();
  }, [refreshProducts, refreshSettings]);

  // Deep-link product modal when loaded with ?product=ID
  useEffect(() => {
    if (products.length > 0 && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      if (productId && !selectedProductForDetail) {
        const found = products.find(
          (p) => p.id === productId || p.sku.toLowerCase() === productId.toLowerCase()
        );
        if (found) {
          setSelectedProductForDetail(found);
        }
      }
    }
  }, [products, selectedProductForDetail]);

  // Dynamic SEO Metadata and URL Synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (selectedProductForDetail) {
      updatePageSEO({
        product: selectedProductForDetail,
        canonicalPath: `/catalog?product=${selectedProductForDetail.id}`,
      });
      const url = new URL(window.location.href);
      url.pathname = '/catalog';
      url.searchParams.set('product', selectedProductForDetail.id);
      window.history.replaceState({}, '', url.toString());
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('product');

    if (currentPage === 'catalog') {
      const activeCat = categoryFilter !== 'all' ? CATEGORIES.find((c) => c.id === categoryFilter) : undefined;
      const categoryName = activeCat ? activeCat.name : undefined;
      url.pathname = '/catalog';
      if (categoryName) {
        url.searchParams.set('category', categoryFilter);
      } else {
        url.searchParams.delete('category');
      }

      updatePageSEO({
        title: categoryName ? `${categoryName} au Bénin` : 'Catalogue Complet & Streetwear',
        description: categoryName
          ? `Découvrez notre collection de ${categoryName.toLowerCase()} au Bénin chez HP COLLECTION. Qualité premium, essayage à la livraison et expédition express à Cotonou et Calavi.`
          : 'Découvrez notre collection exclusive de streetwear, sneakers et mode urbaine au Bénin chez HP COLLECTION. Stock disponible à Cotonou.',
        categoryName,
        canonicalPath: categoryName ? `/catalog?category=${categoryFilter}` : '/catalog',
      });
      window.history.replaceState({}, '', url.toString());
    } else {
      url.searchParams.delete('category');
      if (currentPage === 'home') {
        url.pathname = '/';
        updatePageSEO({
          title: 'Boutique de Vêtements, Streetwear & Sneakers au Bénin',
          description: 'HP COLLECTION — Boutique de référence au Bénin : vêtements streetwear, sneakers authentiques, joggings et vestes. Livraison 24h à Cotonou et paiement à la livraison.',
          canonicalPath: '/',
        });
      } else {
        url.pathname = `/${currentPage}`;
        const pageTitles: Record<string, { title: string; desc: string }> = {
          'order-tracking': {
            title: 'Suivi de Commande en direct',
            desc: 'Suivez l’état d’expédition et de livraison de votre commande HP COLLECTION en temps réel au Bénin.',
          },
          'contact': {
            title: 'Contact & Service Client',
            desc: 'Contactez le service client HP COLLECTION au Bénin via WhatsApp ou téléphone pour vos commandes et renseignements.',
          },
          'delivery-info': {
            title: 'Livraison 24h & Tarifs au Bénin',
            desc: 'Modalités de livraison express 24h à Cotonou, Calavi, Porto-Novo et dans tout le Bénin. Essayage possible et paiement à la livraison.',
          },
          'legal': {
            title: 'Mentions Légales & Conditions Générales',
            desc: 'Consultez les mentions légales, la politique de confidentialité et les conditions générales de vente de HP COLLECTION Bénin.',
          },
          'privacy': {
            title: 'Politique de Confidentialité',
            desc: 'Protection des données personnelles et respect de la vie privée chez HP COLLECTION Bénin.',
          },
          'mentions': {
            title: 'Mentions Légales',
            desc: 'Informations éditeur et mentions légales de la boutique HP COLLECTION.',
          },
          'wishlist': {
            title: 'Mes Favoris',
            desc: 'Retrouvez votre liste de souhaits et vos coups de cœur streetwear sur HP COLLECTION.',
          },
          'admin': {
            title: 'Administration Sécurisée',
            desc: 'Espace d’administration de la boutique HP COLLECTION.',
          },
        };
        const pageInfo = pageTitles[currentPage] || {
          title: 'Boutique Streetwear & Sneakers au Bénin',
          desc: 'HP COLLECTION — Boutique en ligne de mode urbaine au Bénin.',
        };
        updatePageSEO({
          title: pageInfo.title,
          description: pageInfo.desc,
          canonicalPath: `/${currentPage}`,
        });
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [currentPage, categoryFilter, selectedProductForDetail]);

  // Verify Admin Session on mount
  useEffect(() => {
    if (adminToken) {
      api
        .verifyAdmin(adminToken)
        .then((res) => {
          if (res.valid) {
            setAdminUser(res.admin);
          } else {
            logoutAdmin();
          }
        })
        .catch(() => {
          logoutAdmin();
        });
    }
  }, [adminToken]);

  // Currency Formatter
  const formatCurrency = useCallback((amount: number): string => {
    const num = Math.round(amount || 0);
    return `${num.toLocaleString('fr-FR')} FCFA`;
  }, []);

  // Cart operations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = useCallback(
    (product: Product, variantId: string, quantity: number = 1): boolean => {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        showToast('Variante de produit introuvable.', 'error');
        return false;
      }

      if (variant.stock <= 0) {
        showToast(`Désolé, la taille ${variant.size} est actuellement en rupture de stock.`, 'error');
        return false;
      }

      const existingIndex = cart.findIndex((i) => i.variantId === variantId);
      const currentQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
      const newQty = currentQty + quantity;

      if (newQty > variant.stock) {
        showToast(
          `Stock limité : il ne reste que ${variant.stock} exemplaire(s) en stock pour cette taille.`,
          'info'
        );
        return false;
      }

      const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

      if (existingIndex > -1) {
        const updated = [...cart];
        updated[existingIndex].quantity = newQty;
        setCart(updated);
      } else {
        const newItem: CartItem = {
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: effectivePrice,
          quantity,
          image: product.images[0] || '',
          maxStock: variant.stock,
        };
        setCart([...cart, newItem]);
      }

      showToast(`« ${product.name} » ajouté au panier !`, 'success');
      setIsCartOpen(true);
      return true;
    },
    [cart, showToast]
  );

  const updateCartQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.variantId === variantId) {
          const validQty = Math.min(quantity, item.maxStock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  }, []);

  const removeFromCart = useCallback((variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedPromo(null);
  }, []);

  // Promo Code Validation
  const applyPromoCode = useCallback(
    async (code: string): Promise<boolean> => {
      try {
        const res = await api.validateCoupon(code, cartSubtotal);
        if (res.valid) {
          setAppliedPromo({
            code: res.code,
            discountAmount: res.discountAmount,
            discountType: res.discountType,
            discountValue: res.discountValue,
          });
          showToast(res.message, 'success');
          return true;
        }
        return false;
      } catch (err: any) {
        showToast(err.message || 'Code promo invalide', 'error');
        return false;
      }
    },
    [cartSubtotal, showToast]
  );

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    showToast('Code promo retiré', 'info');
  }, [showToast]);

  // Dynamically synchronize promo code discount when cart changes
  useEffect(() => {
    if (appliedPromo) {
      if (cartSubtotal <= 0) {
        setAppliedPromo(null);
      } else {
        api.validateCoupon(appliedPromo.code, cartSubtotal)
          .then((res) => {
            if (res.valid) {
              setAppliedPromo((prev) => {
                if (!prev) return null;
                return {
                  code: res.code,
                  discountAmount: res.discountAmount,
                  discountType: res.discountType,
                  discountValue: res.discountValue,
                };
              });
            } else {
              setAppliedPromo(null);
              showToast('Le panier ne remplit plus les conditions du code promo.', 'info');
            }
          })
          .catch(() => {
            setAppliedPromo(null);
            showToast('Code promo retiré car le montant minimum requis n’est plus atteint.', 'info');
          });
      }
    }
  }, [cartSubtotal]);

  // Wishlist
  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          showToast('Article retiré des favoris', 'info');
          return prev.filter((id) => id !== productId);
        } else {
          showToast('Article ajouté à vos favoris !', 'success');
          return [...prev, productId];
        }
      });
    },
    [showToast]
  );

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  // Admin Auth
  const loginAdmin = useCallback((token: string, user: { id: string; email: string; fullName: string }) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('hp_admin_token', token);
    localStorage.setItem('hp_admin_user', JSON.stringify(user));
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('hp_admin_token');
    localStorage.removeItem('hp_admin_user');
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        isLoadingProducts,
        refreshProducts,
        selectedProductForDetail,
        openProductDetail: (product) => setSelectedProductForDetail(product),
        closeProductDetail: () => setSelectedProductForDetail(null),

        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,

        wishlist,
        toggleWishlist,
        isInWishlist,

        deliveryZones,
        settings,
        refreshSettings,

        appliedPromo,
        applyPromoCode,
        removePromoCode,

        isCheckoutOpen,
        openCheckout: () => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        },
        closeCheckout: () => setIsCheckoutOpen(false),
        activeOrder,
        setActiveOrder,

        adminToken,
        adminUser,
        isAdminAuthenticated: !!adminToken && !!adminUser,
        loginAdmin,
        logoutAdmin,

        formatCurrency,
        toasts,
        showToast,
        removeToast,

        currentPage,
        setCurrentPage,
        categoryFilter,
        setCategoryFilter,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
