import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import {
  Product,
  Order,
  PromoCode,
  DeliveryZone,
  StockMovement,
  OrderFulfillmentStatus,
  OrderPaymentStatus,
  ProductCategory,
} from '../../types';
import { CATEGORIES } from '../../data/initialData';
import {
  Shield,
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Tag,
  Truck,
  Settings,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  LogOut,
  RefreshCw,
  Lock,
  User,
  ArrowRight,
  X,
  History,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    adminToken,
    adminUser,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    formatCurrency,
    showToast,
    refreshProducts,
  } = useStore();

  // Tab: 'overview' | 'products' | 'stock' | 'orders' | 'coupons' | 'shipping' | 'settings'
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Admin Auth / Setup state
  const [hasAdminConfigured, setHasAdminConfigured] = useState<boolean | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard Data states
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [stockHistory, setStockHistory] = useState<StockMovement[]>([]);
  const [coupons, setCoupons] = useState<PromoCode[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Product Modal (Create/Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Stock Adjust Modal
  const [isStockAdjustOpen, setIsStockAdjustOpen] = useState(false);
  const [stockAdjustTarget, setStockAdjustTarget] = useState<{
    productId: string;
    productName: string;
    variantId: string;
    variantSku: string;
    currentStock: number;
  } | null>(null);
  const [stockAdjustQty, setStockAdjustQty] = useState<number>(0);
  const [stockAdjustReason, setStockAdjustReason] = useState<string>('');

  // Order Details Modal
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderFulfillmentStatus>('pending');
  const [newPaymentStatus, setNewPaymentStatus] = useState<OrderPaymentStatus>('pending');
  const [orderStatusNote, setOrderStatusNote] = useState('');

  // Coupon Create Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(20000);

  // Filters for Orders
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFulfillFilter, setOrderFulfillFilter] = useState('all');

  // Filters for Products
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');

  // Check admin status on load
  useEffect(() => {
    api
      .getAdminStatus()
      .then((res) => {
        setHasAdminConfigured(res.hasAdmin);
      })
      .catch((err) => {
        console.error('Failed to check admin status', err);
      });
  }, []);

  // Fetch admin dashboard data when authenticated
  const loadAdminData = async () => {
    if (!adminToken) return;
    setIsLoadingData(true);
    try {
      const [statsRes, ordersRes, productsRes, stockRes, couponsRes, zonesRes, settingsRes] =
        await Promise.all([
          api.getAdminStats(adminToken),
          api.getOrders({}, adminToken),
          api.getProducts({ status: 'all' }),
          api.getStockHistory(adminToken),
          api.getCoupons(adminToken),
          api.getDeliveryZones(),
          api.getSettings(),
        ]);

      setStats(statsRes);
      setOrders(ordersRes.orders || []);
      setAllProducts(productsRes.products || []);
      setStockHistory(stockRes.movements || []);
      setCoupons(couponsRes.coupons || []);
      setZones(zonesRes.zones || []);
      setStoreSettings(settingsRes.settings || {});
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      showToast('Erreur de chargement des données administrateur', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated && adminToken) {
      loadAdminData();
    }
  }, [isAdminAuthenticated, adminToken]);

  // Auth Submit (Setup or Login)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      if (!hasAdminConfigured) {
        // First-time setup
        const res = await api.setupAdmin({
          email: authEmail,
          password: authPassword,
          fullName: authFullName || 'Administrateur HP COLLECTION',
        });
        loginAdmin(res.token, res.admin);
        setHasAdminConfigured(true);
        showToast('Compte administrateur initial créé avec succès !', 'success');
      } else {
        // Standard Login
        const res = await api.loginAdmin({
          email: authEmail,
          password: authPassword,
        });
        loginAdmin(res.token, res.admin);
        showToast(`Bienvenue, ${res.admin.fullName} !`, 'success');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Échec de connexion administrateur');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !adminToken) return;

    try {
      if (editingProduct.id) {
        // Update
        const res = await api.updateProduct(editingProduct.id, editingProduct, adminToken);
        showToast(res.message, 'success');
      } else {
        // Create
        const res = await api.createProduct(editingProduct, adminToken);
        showToast(res.message, 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await loadAdminData();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’enregistrement du produit', 'error');
    }
  };

  // Quick Stock Adjustment
  const handleCommitStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustTarget || !adminToken) return;

    try {
      await api.adjustStock(
        stockAdjustTarget.productId,
        stockAdjustTarget.variantId,
        stockAdjustQty,
        stockAdjustReason || 'Ajustement manuel',
        adminToken
      );
      showToast('Stock mis à jour avec succès', 'success');
      setIsStockAdjustOpen(false);
      setStockAdjustTarget(null);
      await loadAdminData();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Erreur de mise à jour du stock', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!adminToken) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement « ${name} » ?`)) return;

    try {
      await api.deleteProduct(id, adminToken);
      showToast(`Produit « ${name} » supprimé`, 'info');
      await loadAdminData();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Erreur de suppression', 'error');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrderForView || !adminToken) return;

    try {
      const res = await api.updateOrderStatus(
        selectedOrderForView.id,
        {
          fulfillmentStatus: newOrderStatus,
          paymentStatus: newPaymentStatus,
          note: orderStatusNote,
        },
        adminToken
      );

      setSelectedOrderForView(res.order);
      setOrderStatusNote('');
      showToast('Statut de la commande mis à jour avec succès', 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur de mise à jour du statut', 'error');
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !newCouponCode.trim()) return;

    try {
      await api.createCoupon(
        {
          code: newCouponCode.trim().toUpperCase(),
          discountType: newCouponType,
          discountValue: Number(newCouponValue),
          minOrderAmount: Number(newCouponMin),
        },
        adminToken
      );
      setNewCouponCode('');
      showToast('Code promo créé avec succès !', 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création du code promo', 'error');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!adminToken) return;
    try {
      await api.deleteCoupon(id, adminToken);
      showToast('Code promo supprimé', 'info');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error');
    }
  };

  // Reset Demo Data
  const handleResetDemoData = async () => {
    if (!adminToken) return;
    if (!window.confirm('Voulez-vous réinitialiser le catalogue de démo avec les articles officiels ?')) return;

    try {
      await api.resetDemoData(adminToken);
      showToast('Catalogue réinitialisé avec succès', 'success');
      await loadAdminData();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !storeSettings) return;

    try {
      await api.updateSettings(storeSettings, adminToken);
      showToast('Paramètres de la boutique enregistrés avec succès !', 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error');
    }
  };

  // -------------------------------------------------------------
  // If NOT Authenticated: Render Setup or Login Form
  // -------------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1c1c1c] border border-[#2e2e2e] rounded-xs p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#C7A747]/10 border border-[#C7A747]/30 flex items-center justify-center text-[#C7A747] mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#C7A747] font-bold">
              PORTAIL ADMINISTRATEUR SÉCURISÉ
            </span>
            <h1 className="font-heading text-2xl font-extrabold text-[#F4F1E9]">
              {hasAdminConfigured === false ? 'Configuration Administrateur' : 'Connexion Espace Admin'}
            </h1>
            <p className="text-xs text-[#777D86] leading-relaxed">
              {hasAdminConfigured === false
                ? 'Aucun compte administrateur n’est configuré. Créez les identifiants du premier super-administrateur HP COLLECTION.'
                : 'Accédez à la gestion des produits, du stock, des commandes et des paiements FedaPay.'}
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-[#3d1919] border border-[#8a2424] rounded-xs text-xs text-[#ffb4b4] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {hasAdminConfigured === false && (
              <div>
                <label className="text-xs text-[#777D86] font-medium block mb-1">
                  Nom complet de l’administrateur :
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#777D86] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="Ex : Responsable HP COLLECTION"
                    className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs pl-9 pr-3 py-2 text-xs text-[#F4F1E9] outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-[#777D86] font-medium block mb-1">
                Adresse email :
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin@hpcollection.bj ou semakodeogratias64@gmail.com"
                className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-[#777D86] font-medium block mb-1">
                Mot de passe :
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#777D86] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs pl-9 pr-3 py-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isAuthLoading ? (
                <span>Vérification en cours...</span>
              ) : hasAdminConfigured === false ? (
                <span>Initialiser le Super Admin</span>
              ) : (
                <span>Se Connecter au Dashboard</span>
              )}
            </button>
          </form>

          {hasAdminConfigured && (
            <div className="text-[11px] text-center text-[#777D86] pt-2 border-t border-[#262626]">
              Authentification sécurisée avec hachage salé PBKDF2 et sessions expirables.
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // If Authenticated: Full Management Tabs
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Admin Header */}
      <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-5 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C7A747]">
            <Shield className="w-3.5 h-3.5" />
            <span>SESSION ADMINISTRATEUR ACTIVE</span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#F4F1E9] mt-0.5">
            Tableau de Bord HP COLLECTION
          </h1>
          <span className="text-xs text-[#777D86]">
            Connecté en tant que <strong className="text-[#F4F1E9]">{adminUser?.fullName}</strong> ({adminUser?.email})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            disabled={isLoadingData}
            className="p-2 bg-[#252525] hover:bg-[#2e2e2e] text-[#F4F1E9] rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C7A747] ${isLoadingData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button
            onClick={logoutAdmin}
            className="p-2 bg-[#2a1a1a] hover:bg-[#382222] text-[#ff8080] rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#282828] overflow-x-auto scrollbar-none gap-2 pb-1 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Vue d'ensemble</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Articles ({allProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'stock'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Gestion des Stocks</span>
          {stats?.lowStockProducts?.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Commandes ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'coupons'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Codes Promo</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Paramètres & FedaPay</span>
        </button>
      </div>

      {/* --------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & KPIS */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
              <span className="text-xs text-[#777D86] uppercase tracking-wider block">Chiffre d’Affaires Réalisé</span>
              <span className="font-heading text-xl sm:text-2xl font-extrabold text-[#C7A747] block">
                {formatCurrency(stats?.kpis?.totalRevenue || 0)}
              </span>
              <span className="text-[10px] text-[#777D86]">Commandes payées ou livrées</span>
            </div>

            <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
              <span className="text-xs text-[#777D86] uppercase tracking-wider block">Commandes en Cours</span>
              <span className="font-heading text-xl sm:text-2xl font-extrabold text-[#F4F1E9] block">
                {(stats?.kpis?.pendingOrders || 0) + (stats?.kpis?.inProgressOrders || 0)}
              </span>
              <span className="text-[10px] text-[#f59e0b] font-medium">
                {stats?.kpis?.pendingOrders || 0} en attente de validation
              </span>
            </div>

            <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
              <span className="text-xs text-[#777D86] uppercase tracking-wider block">Panier Moyen</span>
              <span className="font-heading text-xl sm:text-2xl font-extrabold text-[#F4F1E9] block">
                {formatCurrency(stats?.kpis?.averageBasket || 0)}
              </span>
              <span className="text-[10px] text-[#777D86]">Par commande finalisée</span>
            </div>

            <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
              <span className="text-xs text-[#777D86] uppercase tracking-wider block">Articles Référencés</span>
              <span className="font-heading text-xl sm:text-2xl font-extrabold text-[#F4F1E9] block">
                {stats?.totalProducts || allProducts.length}
              </span>
              <span className="text-[10px] text-[#4ade80]">Streetwear & Sneakers</span>
            </div>
          </div>

          {/* Best sellers & Low stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Sellers */}
            <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F4F1E9] flex items-center justify-between">
                <span>Top Ventes Réelles</span>
                <TrendingUp className="w-4 h-4 text-[#C7A747]" />
              </h3>

              {stats?.bestSellers?.length > 0 ? (
                <div className="divide-y divide-[#262626]">
                  {stats.bestSellers.map((item: any, i: number) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-xs bg-[#111]" />
                        <div>
                          <span className="font-semibold text-[#F4F1E9] block line-clamp-1">{item.name}</span>
                          <span className="text-[10px] text-[#777D86] font-mono">{item.sku}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#C7A747] block">{item.unitsSold} vendus</span>
                        <span className="text-[10px] text-[#777D86]">{formatCurrency(item.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#777D86] py-6 text-center">
                  Aucune vente enregistrée pour le moment.
                </p>
              )}
            </div>

            {/* Low stock alerts */}
            <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F4F1E9] flex items-center justify-between">
                <span>Alertes de Stock Faible</span>
                <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
              </h3>

              {stats?.lowStockProducts?.length > 0 ? (
                <div className="divide-y divide-[#262626]">
                  {stats.lowStockProducts.map((p: any) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#F4F1E9] block">{p.name}</span>
                        <span className="text-[10px] text-[#777D86] font-mono">{p.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-[#3d2f13] text-[#f59e0b] font-bold text-[11px]">
                          Stock : {p.totalStock} restant(s)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#4ade80] flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8" />
                  <span>Tous les stocks sont au-dessus du seuil d'alerte.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 2: PRODUCTS MANAGER */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#777D86] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom ou SKU..."
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs pl-8 pr-3 py-1.5 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <select
                value={productCatFilter}
                onChange={(e) => setProductCatFilter(e.target.value)}
                className="bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-1.5 rounded-xs outline-none"
              >
                <option value="all">Toutes catégories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  sku: '',
                  category: 'sneakers',
                  description: '',
                  price: 35000,
                  status: 'published',
                  sizes: ['41', '42', '43'],
                  colors: [{ name: 'Noir', hex: '#171717' }],
                  variants: [
                    { id: 'v-new-1', size: '41', color: 'Noir', colorHex: '#171717', stock: 5, sku: 'HPC-SNK-41' },
                    { id: 'v-new-2', size: '42', color: 'Noir', colorHex: '#171717', stock: 5, sku: 'HPC-SNK-42' },
                  ],
                  images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80'],
                  lowStockThreshold: 3,
                });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Article</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs overflow-x-auto">
            <table className="w-full text-left text-xs text-[#777D86]">
              <thead className="bg-[#161616] border-b border-[#282828] text-[11px] font-mono uppercase tracking-wider text-[#F4F1E9]">
                <tr>
                  <th className="p-3">Article</th>
                  <th className="p-3">Réf / Catégorie</th>
                  <th className="p-3">Prix Vente</th>
                  <th className="p-3">Stock Total</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {allProducts
                  .filter((p) => {
                    const matchQ =
                      !productSearchQuery ||
                      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      p.sku.toLowerCase().includes(productSearchQuery.toLowerCase());
                    const matchC = productCatFilter === 'all' || p.category === productCatFilter;
                    return matchQ && matchC;
                  })
                  .map((product) => (
                    <tr key={product.id} className="hover:bg-[#202020] transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-10 h-12 object-cover rounded-xs bg-[#111] border border-[#2c2c2c]"
                        />
                        <div>
                          <span className="font-semibold text-[#F4F1E9] block">{product.name}</span>
                          <span className="text-[10px] text-[#777D86]">{product.variants.length} variante(s)</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-mono text-[11px] text-[#C7A747] block">{product.sku}</span>
                        <span className="text-[11px] capitalize">{product.category}</span>
                      </td>

                      <td className="p-3 font-mono font-bold text-[#F4F1E9]">
                        {formatCurrency(product.salePrice || product.price)}
                        {product.salePrice && (
                          <span className="text-[10px] text-[#777D86] line-through block font-normal">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                            product.totalStock <= 0
                              ? 'bg-[#3d1919] text-[#ff8080]'
                              : product.totalStock <= product.lowStockThreshold
                              ? 'bg-[#3d2f13] text-[#f59e0b]'
                              : 'bg-[#1a291a] text-[#4ade80]'
                          }`}
                        >
                          {product.totalStock} pièces
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold ${
                            product.status === 'published'
                              ? 'bg-[#1b261b] text-[#4ade80]'
                              : 'bg-[#292929] text-[#777D86]'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...product });
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 bg-[#252525] hover:bg-[#333] text-[#F4F1E9] rounded"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1.5 bg-[#2a1a1a] hover:bg-[#3d1f1f] text-[#ff8080] rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 3: STOCK & INVENTORY AUDIT */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-2">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#C7A747]">
              Matrice de Stock par Déclinaison
            </h3>
            <p className="text-xs text-[#777D86]">
              Ajustez instantanément les quantités par taille et couleur. Chaque modification est consignée dans le journal d'audit ci-dessous.
            </p>
          </div>

          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs overflow-x-auto">
            <table className="w-full text-left text-xs text-[#777D86]">
              <thead className="bg-[#161616] border-b border-[#282828] text-[11px] font-mono uppercase tracking-wider text-[#F4F1E9]">
                <tr>
                  <th className="p-3">Produit</th>
                  <th className="p-3">SKU Déclinaison</th>
                  <th className="p-3">Taille</th>
                  <th className="p-3">Couleur</th>
                  <th className="p-3">Stock Actuel</th>
                  <th className="p-3 text-right">Action Rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {allProducts.flatMap((p) =>
                  p.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-[#202020] transition-colors">
                      <td className="p-3 font-semibold text-[#F4F1E9]">{p.name}</td>
                      <td className="p-3 font-mono text-[11px] text-[#C7A747]">{v.sku}</td>
                      <td className="p-3 font-mono font-bold text-[#F4F1E9]">{v.size}</td>
                      <td className="p-3">{v.color}</td>
                      <td className="p-3">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded ${
                            v.stock <= 0
                              ? 'bg-[#3d1919] text-[#ff8080]'
                              : v.stock <= 2
                              ? 'bg-[#3d2f13] text-[#f59e0b]'
                              : 'bg-[#1a291a] text-[#4ade80]'
                          }`}
                        >
                          {v.stock}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setStockAdjustTarget({
                              productId: p.id,
                              productName: p.name,
                              variantId: v.id,
                              variantSku: v.sku,
                              currentStock: v.stock,
                            });
                            setStockAdjustQty(0);
                            setStockAdjustReason('Réapprovisionnement atelier');
                            setIsStockAdjustOpen(true);
                          }}
                          className="px-2.5 py-1 bg-[#282828] hover:bg-[#333] text-[#C7A747] font-semibold rounded text-[11px]"
                        >
                          Ajuster le stock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Audit trail */}
          <div className="space-y-3 pt-4">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F4F1E9] flex items-center gap-2">
              <History className="w-4 h-4 text-[#C7A747]" />
              <span>Historique des Mouvements de Stock</span>
            </h3>

            <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs divide-y divide-[#262626] max-h-80 overflow-y-auto text-xs">
              {stockHistory.length === 0 ? (
                <div className="p-6 text-center text-[#777D86]">Aucun mouvement enregistré.</div>
              ) : (
                stockHistory.map((m) => (
                  <div key={m.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#F4F1E9]">{m.productName}</span>
                      <div className="text-[11px] text-[#777D86] space-x-2">
                        <span>Réf : {m.variantSku}</span>
                        <span>• Motif : {m.reason}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold block ${
                          m.change > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                        }`}
                      >
                        {m.change > 0 ? `+${m.change}` : m.change} (Nouveau stock: {m.newStock})
                      </span>
                      <span className="text-[10px] text-[#777D86]">
                        {new Date(m.timestamp).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 4: ORDERS MANAGER */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-[#777D86] absolute left-3 top-2.5" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Rechercher par n° de commande, nom client ou téléphone..."
                className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs pl-8 pr-3 py-1.5 text-xs text-[#F4F1E9] outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#777D86]">Filtrer état :</span>
              <select
                value={orderFulfillFilter}
                onChange={(e) => setOrderFulfillFilter(e.target.value)}
                className="bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-1.5 rounded-xs outline-none"
              >
                <option value="all">Tous les états</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs overflow-x-auto">
            <table className="w-full text-left text-xs text-[#777D86]">
              <thead className="bg-[#161616] border-b border-[#282828] text-[11px] font-mono uppercase tracking-wider text-[#F4F1E9]">
                <tr>
                  <th className="p-3">N° Commande</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Destinataire (Bénin)</th>
                  <th className="p-3">Articles</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3">Paiement</th>
                  <th className="p-3">Livraison</th>
                  <th className="p-3 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {orders
                  .filter((o) => {
                    const matchQ =
                      !orderSearchQuery ||
                      o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                      o.customer.fullName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                      o.customer.phone.includes(orderSearchQuery);
                    const matchS = orderFulfillFilter === 'all' || o.fulfillmentStatus === orderFulfillFilter;
                    return matchQ && matchS;
                  })
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-[#202020] transition-colors">
                      <td className="p-3 font-mono font-bold text-[#C7A747]">
                        #{order.orderNumber}
                      </td>

                      <td className="p-3 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-[#F4F1E9] block">{order.customer.fullName}</span>
                        <span className="text-[10px] text-[#777D86]">{order.customer.city} ({order.customer.phone})</span>
                      </td>

                      <td className="p-3">
                        {order.items.length} article(s)
                      </td>

                      <td className="p-3 font-mono font-bold text-[#F4F1E9]">
                        {formatCurrency(order.total)}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-[#1b261b] text-[#4ade80]'
                              : 'bg-[#2b2413] text-[#f59e0b]'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold ${
                            order.fulfillmentStatus === 'delivered'
                              ? 'bg-[#1b261b] text-[#4ade80]'
                              : order.fulfillmentStatus === 'cancelled'
                              ? 'bg-[#331717] text-[#ff8080]'
                              : 'bg-[#292929] text-[#F4F1E9]'
                          }`}
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrderForView(order);
                            setNewOrderStatus(order.fulfillmentStatus);
                            setNewPaymentStatus(order.paymentStatus);
                          }}
                          className="px-2.5 py-1 bg-[#252525] hover:bg-[#333] text-[#F4F1E9] rounded text-[11px] font-semibold"
                        >
                          Gérer
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 5: COUPONS & DISCOUNTS */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coupon creation */}
          <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#C7A747]">
              Créer un Code Promo
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="text-[#777D86] block mb-1">Code promo :</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="EX: COTONOU10"
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] uppercase font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Type de remise :</label>
                <select
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value as any)}
                  className="w-full bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-2 rounded-xs outline-none"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (FCFA)</option>
                </select>
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">
                  Valeur {newCouponType === 'percentage' ? '(%)' : '(FCFA)'} :
                </label>
                <input
                  type="number"
                  required
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Montant minimum d'achat (FCFA) :</label>
                <input
                  type="number"
                  value={newCouponMin}
                  onChange={(e) => setNewCouponMin(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors"
              >
                Activer ce code
              </button>
            </form>
          </div>

          {/* Active Coupons List */}
          <div className="md:col-span-2 p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F4F1E9]">
              Codes Promotionnels Actifs ({coupons.length})
            </h3>

            <div className="divide-y divide-[#262626]">
              {coupons.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#C7A747] text-sm block">
                      {c.code}
                    </span>
                    <span className="text-[11px] text-[#777D86]">
                      {c.discountType === 'percentage' ? `-${c.discountValue}%` : `-${formatCurrency(c.discountValue)}`}
                      {c.minOrderAmount ? ` dès ${formatCurrency(c.minOrderAmount)}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#777D86]">
                      {c.usedCount} utilisation(s)
                    </span>
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1.5 bg-[#2a1a1a] hover:bg-[#3d1f1f] text-[#ff8080] rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 6: SETTINGS & FEDAPAY */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'settings' && storeSettings && (
        <div className="max-w-2xl space-y-6">
          <form onSubmit={handleSaveSettings} className="p-6 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4 text-xs">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#C7A747]">
              Paramètres Généraux de la Boutique
            </h3>

            <div>
              <label className="text-[#777D86] block mb-1">Nom commercial :</label>
              <input
                type="text"
                value={storeSettings.storeName || ''}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
              />
            </div>

            <div>
              <label className="text-[#777D86] block mb-1">Slogan officiel :</label>
              <input
                type="text"
                value={storeSettings.slogan || ''}
                onChange={(e) => setStoreSettings({ ...storeSettings, slogan: e.target.value })}
                className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
              />
            </div>

            <div>
              <label className="text-[#777D86] block mb-1">Bandeau d’annonce public :</label>
              <input
                type="text"
                value={storeSettings.announcementText || ''}
                onChange={(e) => setStoreSettings({ ...storeSettings, announcementText: e.target.value })}
                className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
              />
            </div>

            <div>
              <label className="text-[#777D86] block mb-1">Numéro WhatsApp Support Bénin :</label>
              <input
                type="text"
                value={storeSettings.whatsappNumber || ''}
                onChange={(e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
              />
            </div>

            {/* FedaPay Credentials Section */}
            <div className="pt-4 border-t border-[#282828] space-y-3">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F4F1E9] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C7A747]" />
                <span>Configuration FedaPay (Mobile Money MTN / Moov / Celtiis)</span>
              </h4>
              <p className="text-[11px] text-[#777D86]">
                Pour activer le mode de paiement réel en production, renseignez vos clés d'API FedaPay Bénin. Si ces champs sont vides, la boutique fonctionne en Sandbox Sandbox de démonstration.
              </p>

              <div>
                <label className="text-[#777D86] block mb-1">Clé Publique FedaPay :</label>
                <input
                  type="text"
                  value={storeSettings.fedapayPublicKey || ''}
                  onChange={(e) => setStoreSettings({ ...storeSettings, fedapayPublicKey: e.target.value })}
                  placeholder="pk_live_..."
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Clé Secrète FedaPay :</label>
                <input
                  type="password"
                  value={storeSettings.fedapaySecretKey || ''}
                  onChange={(e) => setStoreSettings({ ...storeSettings, fedapaySecretKey: e.target.value })}
                  placeholder="sk_live_..."
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors"
            >
              Enregistrer les Paramètres
            </button>
          </form>

          {/* Reset Demo Data Button */}
          <div className="p-4 bg-[#241a1a] border border-[#442222] rounded-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-[#ff9999] block">Réinitialisation Démo</span>
              <span className="text-[11px] text-[#777D86]">
                Restaure le catalogue d'origine avec toutes les pièces et sneakers de test.
              </span>
            </div>
            <button
              onClick={handleResetDemoData}
              className="px-3 py-1.5 bg-[#3a1a1a] hover:bg-[#4d2222] text-[#ff8080] text-xs font-bold rounded-xs transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* --------------------------------------------------------- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-lg font-bold text-[#F4F1E9]">
              {editingProduct.id ? 'Modifier l’Article' : 'Ajouter un Nouvel Article'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#777D86] block mb-1">Nom du modèle :</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#777D86] block mb-1">Référence commerciale (SKU) :</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="Ex: HPC-SNK-009"
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#777D86] block mb-1">Catégorie :</label>
                  <select
                    value={editingProduct.category || 'sneakers'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-2 rounded-xs outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#777D86] block mb-1">Prix de vente (FCFA) :</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#777D86] block mb-1">Prix Promo (facultatif) :</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Description éditoriale :</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs p-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">URL de l’image principale :</label>
                <input
                  type="url"
                  required
                  value={editingProduct.images?.[0] || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="accent-[#C7A747]"
                  />
                  <span>Mettre en avant sur la page d'accueil</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isNewArrival || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })}
                    className="accent-[#C7A747]"
                  />
                  <span>Badge « Nouveau »</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#282828] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-[#282828] text-[#F4F1E9] rounded-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold uppercase tracking-wider rounded-xs"
                >
                  Enregistrer l'Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: QUICK STOCK ADJUST */}
      {/* --------------------------------------------------------- */}
      {isStockAdjustOpen && stockAdjustTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm p-6 space-y-4">
            <button
              onClick={() => setIsStockAdjustOpen(false)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-base font-bold text-[#F4F1E9]">
              Ajuster le Stock : {stockAdjustTarget.productName}
            </h3>
            <p className="text-xs text-[#777D86]">
              Déclinaison : <strong className="text-[#C7A747]">{stockAdjustTarget.variantSku}</strong> • Stock actuel :{' '}
              <strong className="text-[#F4F1E9]">{stockAdjustTarget.currentStock}</strong>
            </p>

            <form onSubmit={handleCommitStockAdjust} className="space-y-4 text-xs">
              <div>
                <label className="text-[#777D86] block mb-1">
                  Quantité à ajouter (+) ou déduire (-) :
                </label>
                <input
                  type="number"
                  required
                  value={stockAdjustQty}
                  onChange={(e) => setStockAdjustQty(Number(e.target.value))}
                  placeholder="Ex : +10 ou -2"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                />
                <span className="text-[10px] text-[#777D86] mt-1 block">
                  Nouveau stock après validation :{' '}
                  <strong className="text-[#4ade80]">
                    {Math.max(0, stockAdjustTarget.currentStock + stockAdjustQty)}
                  </strong>
                </span>
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Motif de l'ajustement :</label>
                <input
                  type="text"
                  required
                  value={stockAdjustReason}
                  onChange={(e) => setStockAdjustReason(e.target.value)}
                  placeholder="Ex : Réception atelier Cotonou"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockAdjustOpen(false)}
                  className="px-3 py-2 bg-[#282828] text-[#F4F1E9] rounded-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold uppercase rounded-xs"
                >
                  Valider l'ajustement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: ORDER DETAILS & STATUS UPDATE */}
      {/* --------------------------------------------------------- */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrderForView(null)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#282828] pb-4">
              <span className="text-[10px] font-mono uppercase text-[#C7A747] font-bold">
                COMMANDE CLIENT
              </span>
              <h3 className="font-heading text-xl font-bold text-[#F4F1E9]">
                #{selectedOrderForView.orderNumber}
              </h3>
              <span className="text-xs text-[#777D86]">
                Enregistrée le {new Date(selectedOrderForView.createdAt).toLocaleString('fr-FR')}
              </span>
            </div>

            {/* Customer & Address */}
            <div className="p-4 bg-[#141414] border border-[#262626] rounded-xs space-y-1 text-xs">
              <span className="font-bold text-[#F4F1E9] block">
                {selectedOrderForView.customer.fullName}
              </span>
              <p className="text-[#777D86]">Téléphone : {selectedOrderForView.customer.phone}</p>
              <p className="text-[#777D86]">
                Destination : {selectedOrderForView.customer.city} ({selectedOrderForView.customer.district})
              </p>
              {selectedOrderForView.customer.address && (
                <p className="text-[#777D86]">Repère : {selectedOrderForView.customer.address}</p>
              )}
            </div>

            {/* Status Update Form */}
            <div className="p-4 bg-[#222222] border border-[#2e2e2e] rounded-xs space-y-3 text-xs">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#C7A747] block">
                Mise à Jour des Statuts
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#777D86] block mb-1">Statut Logistique :</label>
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] p-2 rounded-xs outline-none"
                  >
                    <option value="pending">En attente de confirmation</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="processing">En préparation</option>
                    <option value="shipped">Expédiée (En cours)</option>
                    <option value="delivered">Livrée au client</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#777D86] block mb-1">Statut Règlement (Paiement) :</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] p-2 rounded-xs outline-none"
                  >
                    <option value="pending">En attente d'encaissement</option>
                    <option value="paid">Payé et encaissé</option>
                    <option value="failed">Échec de paiement</option>
                    <option value="refunded">Remboursé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Note de changement (facultatif) :</label>
                <input
                  type="text"
                  value={orderStatusNote}
                  onChange={(e) => setOrderStatusNote(e.target.value)}
                  placeholder="Ex : Colis remis au coursier moto"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-1.5 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <button
                onClick={handleUpdateOrderStatus}
                className="w-full py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold uppercase tracking-wider rounded-xs transition-colors"
              >
                Enregistrer la mise à jour
              </button>
            </div>

            {/* Items */}
            <div className="space-y-2 pt-2 text-xs">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#777D86] block">
                Articles ({selectedOrderForView.items.length})
              </span>
              {selectedOrderForView.items.map((it, idx) => (
                <div key={idx} className="p-2 bg-[#141414] rounded flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#F4F1E9] block">{it.productName}</span>
                    <span className="text-[11px] text-[#777D86]">
                      Taille : {it.size} • Qté : {it.quantity} • Prix : {formatCurrency(it.unitPrice)}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#F4F1E9]">{formatCurrency(it.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
