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
  CategoryInfo,
  ProductVariant,
  NotificationLog,
  NotificationConfig,
  NotificationEventType,
  NotificationStatus,
  NotificationChannel,
} from '../../types';
import { CATEGORIES as INITIAL_CATEGORIES } from '../../data/initialData';
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
  Upload,
  Image as ImageIcon,
  Check,
  Star,
  FolderPlus,
  MapPin,
  Percent,
  Bell,
  Send,
  Smartphone,
  Mail,
  RotateCcw,
  Info,
  ExternalLink,
  ShieldCheck,
  Users,
  FileText,
} from 'lucide-react';
import { AdminCustomersSection } from './AdminCustomersSection';
import { AdminReturnsSection } from './AdminReturnsSection';
import { CommercialDocumentModal } from '../common/CommercialDocumentModal';

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

  // Active Tab: 'overview' | 'products' | 'categories' | 'stock' | 'orders' | 'coupons' | 'shipping' | 'settings'
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
  const [categories, setCategories] = useState<CategoryInfo[]>(INITIAL_CATEGORIES);
  const [stockHistory, setStockHistory] = useState<StockMovement[]>([]);
  const [coupons, setCoupons] = useState<PromoCode[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Product Modal (Create/Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Category Modal (Create/Edit)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryInfo> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryInfo | null>(null);

  // Shipping Zone Modal
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Partial<DeliveryZone> | null>(null);
  const [zoneToDelete, setZoneToDelete] = useState<DeliveryZone | null>(null);

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
  const [selectedOrderForDoc, setSelectedOrderForDoc] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderFulfillmentStatus>('pending');
  const [newPaymentStatus, setNewPaymentStatus] = useState<OrderPaymentStatus>('pending');
  const [orderStatusNote, setOrderStatusNote] = useState('');

  // Coupon Create Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(20000);
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState<number | undefined>(undefined);
  const [newCouponExpiry, setNewCouponExpiry] = useState<string>('');

  // Filters for Orders
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFulfillFilter, setOrderFulfillFilter] = useState('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');

  // Filters for Products
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');

  // Notifications & Automation State
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [notifStats, setNotifStats] = useState<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    blocked: number;
    successRate: number;
  } | null>(null);
  const [notifConfig, setNotifConfig] = useState<NotificationConfig | null>(null);
  const [notifFilterType, setNotifFilterType] = useState<string>('all');
  const [notifFilterStatus, setNotifFilterStatus] = useState<string>('all');
  const [notifFilterChannel, setNotifFilterChannel] = useState<string>('all');
  const [notifSearch, setNotifSearch] = useState<string>('');
  const [selectedNotifForDetail, setSelectedNotifForDetail] = useState<NotificationLog | null>(null);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState<boolean>(false);
  const [isRetryingNotifId, setIsRetryingNotifId] = useState<string | null>(null);
  const [isSavingNotifConfig, setIsSavingNotifConfig] = useState<boolean>(false);
  const [isTestingNotif, setIsTestingNotif] = useState<boolean>(false);
  const [testChannel, setTestChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [testTarget, setTestTarget] = useState<string>('+22997000000');
  const [testEventType, setTestEventType] = useState<NotificationEventType>('client_order_received');
  const [notifActiveSubTab, setNotifActiveSubTab] = useState<'logs' | 'triggers' | 'gateways' | 'test'>('logs');

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
      const [statsRes, ordersRes, productsRes, stockRes, couponsRes, zonesRes, settingsRes, categoriesRes] =
        await Promise.all([
          api.getAdminStats(adminToken),
          api.getOrders({}, adminToken),
          api.getProducts({ status: 'all' }),
          api.getStockHistory(adminToken),
          api.getCoupons(adminToken),
          api.getDeliveryZones(),
          api.getSettings(),
          api.getCategories().catch(() => ({ categories: INITIAL_CATEGORIES })),
        ]);

      setStats(statsRes);
      setOrders(ordersRes.orders || []);
      setAllProducts(productsRes.products || []);
      setStockHistory(stockRes.movements || []);
      setCoupons(couponsRes.coupons || []);
      setZones(zonesRes.zones || []);
      setStoreSettings(settingsRes.settings || {});
      setCategories(categoriesRes.categories || INITIAL_CATEGORIES);
      // Load notifications as well
      await loadNotificationsData();
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      showToast('Erreur de synchronisation avec le serveur', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load Notifications & Config
  const loadNotificationsData = async (filterOverrides?: {
    eventType?: string;
    status?: string;
    channel?: string;
    search?: string;
  }) => {
    if (!adminToken) return;
    setIsLoadingNotifs(true);
    try {
      const type = filterOverrides?.eventType ?? notifFilterType;
      const status = filterOverrides?.status ?? notifFilterStatus;
      const channel = filterOverrides?.channel ?? notifFilterChannel;
      const search = filterOverrides?.search ?? notifSearch;

      const [notifsRes, configRes] = await Promise.all([
        api.getNotifications(adminToken, {
          eventType: type !== 'all' ? type : undefined,
          status: status !== 'all' ? status : undefined,
          channel: channel !== 'all' ? channel : undefined,
          search: search.trim() ? search.trim() : undefined,
          limit: 150,
        }),
        api.getNotificationConfig(adminToken),
      ]);

      setNotifications(notifsRes.notifications || []);
      setNotifStats(notifsRes.stats || null);
      if (configRes.config) {
        setNotifConfig(configRes.config);
      }
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  const handleRetryNotification = async (notifId: string) => {
    if (!adminToken) return;
    setIsRetryingNotifId(notifId);
    try {
      const res = await api.retryNotification(notifId, adminToken);
      showToast(res.message || 'Notification réexpédiée', 'success');
      await loadNotificationsData();
      if (selectedNotifForDetail && selectedNotifForDetail.id === notifId) {
        setSelectedNotifForDetail(res.notification);
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la réexpédition', 'error');
    } finally {
      setIsRetryingNotifId(null);
    }
  };

  const handleSaveNotificationConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !notifConfig) return;
    setIsSavingNotifConfig(true);
    try {
      const res = await api.updateNotificationConfig(notifConfig, adminToken);
      showToast(res.message || 'Configuration des notifications enregistrée', 'success');
      setNotifConfig(res.config);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSavingNotifConfig(false);
    }
  };

  const handleSendTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    if (!testTarget.trim()) {
      showToast('Veuillez renseigner un destinataire valide (téléphone WhatsApp ou email)', 'error');
      return;
    }
    setIsTestingNotif(true);
    try {
      const res = await api.sendTestNotification(
        {
          channel: testChannel,
          target: testTarget.trim(),
          eventType: testEventType,
        },
        adminToken
      );
      showToast(res.message || 'Notification de test transmise avec succès', 'success');
      await loadNotificationsData();
    } catch (err: any) {
      showToast(err.message || 'Échec du test de notification', 'error');
    } finally {
      setIsTestingNotif(false);
    }
  };

  const handleClearNotificationLogs = async () => {
    if (!adminToken) return;
    if (!window.confirm('Voulez-vous vraiment purger tout l’historique des logs de notification ?')) return;
    try {
      const res = await api.clearNotificationLogs(adminToken);
      showToast(res.message || 'Journal des notifications purgé', 'success');
      await loadNotificationsData();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la purge', 'error');
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
        const res = await api.setupAdmin({
          email: authEmail,
          password: authPassword,
          fullName: authFullName || 'Directeur HP COLLECTION',
        });
        loginAdmin(res.token, res.admin);
        setHasAdminConfigured(true);
        showToast('Compte administrateur configuré avec succès !', 'success');
      } else {
        const res = await api.loginAdmin({
          email: authEmail,
          password: authPassword,
        });
        loginAdmin(res.token, res.admin);
        showToast(`Bienvenue, ${res.admin.fullName} !`, 'success');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Identifiants incorrects ou accès refusé');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Fast Product Status Toggle (Publish, Unpublish/Draft, Archive)
  const handleToggleProductStatus = async (
    productId: string,
    newStatus: 'published' | 'draft' | 'archived'
  ) => {
    if (!adminToken) return;
    try {
      const res = await api.updateProductStatus(productId, newStatus, adminToken);
      showToast(res.message, 'success');
      await loadAdminData();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du changement de statut', 'error');
    }
  };

  // Upload Local Photo Files
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !adminToken) return;

    setIsUploadingPhoto(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          showToast(`Le fichier ${file.name} dépasse 10 Mo`, 'error');
          continue;
        }
        const res = await api.uploadImage(file, adminToken);
        uploadedUrls.push(res.url);
      }

      if (uploadedUrls.length > 0) {
        setEditingProduct((prev) => ({
          ...prev,
          images: [...(prev?.images || []), ...uploadedUrls],
        }));
        showToast(`${uploadedUrls.length} photo(s) importée(s) avec succès !`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du téléchargement des photos', 'error');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Add Image URL manually
  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    setEditingProduct((prev) => ({
      ...prev,
      images: [...(prev?.images || []), newImageUrlInput.trim()],
    }));
    setNewImageUrlInput('');
  };

  // Remove photo from gallery
  const handleRemovePhoto = (idxToRemove: number) => {
    setEditingProduct((prev) => ({
      ...prev,
      images: (prev?.images || []).filter((_, i) => i !== idxToRemove),
    }));
  };

  // Make photo primary (index 0)
  const handleMakePhotoPrimary = (idx: number) => {
    setEditingProduct((prev) => {
      const current = [...(prev?.images || [])];
      if (idx === 0 || idx >= current.length) return prev;
      const [item] = current.splice(idx, 1);
      return { ...prev, images: [item, ...current] };
    });
    showToast('Photo principale mise à jour', 'info');
  };

  // Add a variant
  const handleAddVariant = () => {
    setEditingProduct((prev) => {
      const currentVariants = prev?.variants || [];
      const newVar: ProductVariant = {
        id: `v-var-${Date.now()}-${currentVariants.length + 1}`,
        size: 'L',
        color: 'Noir',
        colorHex: '#171717',
        stock: 5,
        sku: `${prev?.sku || 'HPC'}-L-${currentVariants.length + 1}`,
      };
      const updatedVariants = [...currentVariants, newVar];
      const newTotal = updatedVariants.reduce((s, v) => s + v.stock, 0);
      return { ...prev, variants: updatedVariants, totalStock: newTotal };
    });
  };

  // Remove a variant
  const handleRemoveVariant = (variantId: string) => {
    setEditingProduct((prev) => {
      const updatedVariants = (prev?.variants || []).filter((v) => v.id !== variantId);
      const newTotal = updatedVariants.reduce((s, v) => s + v.stock, 0);
      return { ...prev, variants: updatedVariants, totalStock: newTotal };
    });
  };

  // Update a variant field
  const handleUpdateVariant = (variantId: string, field: keyof ProductVariant, value: any) => {
    setEditingProduct((prev) => {
      const updatedVariants = (prev?.variants || []).map((v) => {
        if (v.id === variantId) {
          const updated = { ...v, [field]: value };
          if (field === 'stock') {
            updated.stock = Math.max(0, parseInt(value, 10) || 0);
          }
          return updated;
        }
        return v;
      });
      const newTotal = updatedVariants.reduce((s, v) => s + v.stock, 0);
      return { ...prev, variants: updatedVariants, totalStock: newTotal };
    });
  };

  // Preset generators for variants
  const handleGenerateApparelSizes = () => {
    const defaultColor = editingProduct?.colors?.[0]?.name || 'Noir';
    const defaultHex = editingProduct?.colors?.[0]?.hex || '#171717';
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const generated: ProductVariant[] = sizes.map((sz, i) => ({
      id: `v-gen-${Date.now()}-${i}`,
      size: sz,
      color: defaultColor,
      colorHex: defaultHex,
      stock: 6,
      sku: `${editingProduct?.sku || 'HPC'}-${sz}`,
    }));
    setEditingProduct((prev) => ({
      ...prev,
      variants: generated,
      sizes,
      totalStock: generated.reduce((s, v) => s + v.stock, 0),
    }));
    showToast('Variantes vêtements (S à XXL) générées', 'info');
  };

  const handleGenerateShoeSizes = () => {
    const defaultColor = editingProduct?.colors?.[0]?.name || 'Noir';
    const defaultHex = editingProduct?.colors?.[0]?.hex || '#171717';
    const sizes = ['40', '41', '42', '43', '44', '45'];
    const generated: ProductVariant[] = sizes.map((sz, i) => ({
      id: `v-shoe-${Date.now()}-${i}`,
      size: sz,
      color: defaultColor,
      colorHex: defaultHex,
      stock: 4,
      sku: `${editingProduct?.sku || 'HPC'}-${sz}`,
    }));
    setEditingProduct((prev) => ({
      ...prev,
      variants: generated,
      sizes,
      totalStock: generated.reduce((s, v) => s + v.stock, 0),
    }));
    showToast('Pointures sneakers (40 à 45) générées', 'info');
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !adminToken) return;

    if (!editingProduct.images || editingProduct.images.length === 0) {
      showToast('Veuillez ajouter au moins une photo pour le produit', 'error');
      return;
    }

    try {
      if (editingProduct.id) {
        const res = await api.updateProduct(editingProduct.id, editingProduct, adminToken);
        showToast(res.message, 'success');
      } else {
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

  // Delete product confirmation
  const handleConfirmDelete = async () => {
    if (!productToDelete || !adminToken) return;
    try {
      await api.deleteProduct(productToDelete.id, adminToken);
      showToast(`Article "${productToDelete.name}" supprimé`, 'success');
      setProductToDelete(null);
      await loadAdminData();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression', 'error');
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
        stockAdjustReason || 'Ajustement manuel atelier',
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
      showToast(res.message, 'success');
      setSelectedOrderForView(res.order);
      await loadAdminData();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du statut', 'error');
    }
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !adminToken) return;

    try {
      if (editingCategory.id && categories.some((c) => c.id === editingCategory.id)) {
        const res = await api.updateCategory(editingCategory.id, editingCategory, adminToken);
        showToast(res.message, 'success');
      } else {
        const res = await api.createCategory(editingCategory, adminToken);
        showToast(res.message, 'success');
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’enregistrement de la catégorie', 'error');
    }
  };

  const handleDeleteCategory = async (cat: CategoryInfo) => {
    if (!adminToken) return;
    try {
      await api.deleteCategory(cat.id, adminToken);
      showToast(`Catégorie "${cat.name}" supprimée`, 'success');
      setCategoryToDelete(null);
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression de la catégorie', 'error');
    }
  };

  // Delivery Zone Actions
  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone || !adminToken) return;

    try {
      if (editingZone.id && zones.some((z) => z.id === editingZone.id)) {
        const res = await api.updateDeliveryZone(editingZone.id, editingZone, adminToken);
        showToast(res.message, 'success');
      } else {
        const res = await api.createDeliveryZone(editingZone, adminToken);
        showToast(res.message, 'success');
      }
      setIsZoneModalOpen(false);
      setEditingZone(null);
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur d’enregistrement de la zone', 'error');
    }
  };

  const handleDeleteZone = async (zone: DeliveryZone) => {
    if (!adminToken) return;
    try {
      await api.deleteDeliveryZone(zone.id, adminToken);
      showToast(`Zone "${zone.name}" supprimée`, 'success');
      setZoneToDelete(null);
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur de suppression de zone', 'error');
    }
  };

  // Promo Code Actions
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !adminToken) return;

    try {
      const res = await api.createCoupon(
        {
          code: newCouponCode,
          discountType: newCouponType,
          discountValue: newCouponValue,
          minOrderAmount: newCouponMin,
          usageLimit: newCouponUsageLimit,
          expiryDate: newCouponExpiry || undefined,
        },
        adminToken
      );
      showToast(res.message, 'success');
      setNewCouponCode('');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur de création du code promo', 'error');
    }
  };

  const handleToggleCouponActive = async (c: PromoCode) => {
    if (!adminToken) return;
    try {
      const res = await api.updateCoupon(c.id, { active: !c.active }, adminToken);
      showToast(res.message, 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur de mise à jour du code', 'error');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!adminToken) return;
    try {
      const res = await api.deleteCoupon(couponId, adminToken);
      showToast(res.message, 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur de suppression du code', 'error');
    }
  };

  // Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    try {
      const res = await api.updateSettings(storeSettings, adminToken);
      showToast(res.message, 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Erreur d’enregistrement des paramètres', 'error');
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
                : 'Accédez à la gestion des articles, du stock, des commandes et des paiements FedaPay.'}
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
                placeholder="admin@hpcollection.bj"
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

          {/* Secure Admin Note */}
          <div className="pt-3 border-t border-[#262626] text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#777D86]">
              Portail sécurisé • Sessions chiffrées • Protection anti-bruteforce
            </span>
          </div>
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
            className="p-2 bg-[#252525] hover:bg-[#2e2e2e] text-[#F4F1E9] rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C7A747] ${isLoadingData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button
            onClick={logoutAdmin}
            className="p-2 bg-[#2a1a1a] hover:bg-[#382222] text-[#ff8080] rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation (Directly visible, no horizontal scrollbar) */}
      <div className="flex flex-wrap border-b border-[#282828] gap-1 sm:gap-2 pb-1 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Articles ({allProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Rayons & Catégories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Commandes ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'clients'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Clients & Fidélité</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'returns'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retours & Réclamations</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Frais de Livraison ({zones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Codes Promo ({coupons.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('notifications');
            loadNotificationsData();
          }}
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
              : 'text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Automatisations & Alertes</span>
          {notifStats && notifStats.failed > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" title={`${notifStats.failed} échec(s) de transmission`} />
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 sm:px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
      {/* TAB 2: PRODUCTS MANAGER (Add, Edit, Publish, Unpublish, Archive) */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1 min-w-[180px]">
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
                <option value="all">Tous rayons</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={productStatusFilter}
                onChange={(e) => setProductStatusFilter(e.target.value)}
                className="bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-1.5 rounded-xs outline-none"
              >
                <option value="all">Tous statuts</option>
                <option value="published">Publiés</option>
                <option value="draft">Brouillons / Dépubliés</option>
                <option value="archived">Archivés</option>
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
              className="px-4 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer shadow-md"
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
                  <th className="p-3">Article & Photos</th>
                  <th className="p-3">Réf / Catégorie</th>
                  <th className="p-3">Prix Vente</th>
                  <th className="p-3">Stock & Variantes</th>
                  <th className="p-3">Statut en Ligne</th>
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
                    const matchS = productStatusFilter === 'all' || p.status === productStatusFilter;
                    return matchQ && matchC && matchS;
                  })
                  .map((product) => (
                    <tr key={product.id} className="hover:bg-[#202020] transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-10 h-12 object-cover rounded-xs bg-[#111] border border-[#2c2c2c]"
                          />
                          {product.images.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-[#141414] text-[8px] font-mono border border-[#444] px-1 text-[#C7A747]">
                              +{product.images.length - 1}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-[#F4F1E9] block leading-tight">{product.name}</span>
                          <span className="text-[10px] text-[#777D86]">
                            {product.variants.length} déclinaison(s) • {product.sizes.join(', ')}
                          </span>
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
                          className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] inline-block ${
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
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[9.5px] uppercase font-mono font-bold ${
                              product.status === 'published'
                                ? 'bg-[#1b261b] text-[#4ade80] border border-emerald-900/50'
                                : product.status === 'draft'
                                ? 'bg-[#2d2214] text-[#f59e0b] border border-amber-900/50'
                                : 'bg-[#292929] text-[#777D86] border border-[#3a3a3a]'
                            }`}
                          >
                            {product.status === 'published'
                              ? 'Publié'
                              : product.status === 'draft'
                              ? 'Dépublié'
                              : 'Archivé'}
                          </span>

                          {/* Quick Toggle Button */}
                          {product.status === 'published' ? (
                            <button
                              onClick={() => handleToggleProductStatus(product.id, 'draft')}
                              className="px-1.5 py-0.5 text-[9px] font-mono text-[#f59e0b] hover:bg-[#332211] border border-[#443322] rounded transition-colors"
                              title="Dépublier cet article"
                            >
                              Dépublier
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleProductStatus(product.id, 'published')}
                              className="px-1.5 py-0.5 text-[9px] font-mono text-[#4ade80] hover:bg-[#1a2a1a] border border-[#234423] rounded transition-colors"
                              title="Publier cet article en boutique"
                            >
                              Publier
                            </button>
                          )}

                          {product.status !== 'archived' && (
                            <button
                              onClick={() => handleToggleProductStatus(product.id, 'archived')}
                              className="px-1.5 py-0.5 text-[9px] font-mono text-[#777D86] hover:bg-[#252525] border border-[#333] rounded transition-colors"
                              title="Archiver cet article"
                            >
                              Archiver
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...product });
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 bg-[#252525] hover:bg-[#333] text-[#F4F1E9] rounded cursor-pointer"
                          title="Modifier l'article complet"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProductToDelete({ id: product.id, name: product.name })}
                          className="p-1.5 bg-[#2a1a1a] hover:bg-[#3d1f1f] text-[#ff8080] rounded cursor-pointer"
                          title="Supprimer définitivement"
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
      {/* TAB: RAYONS & CATÉGORIES MANAGEMENT */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-[#F4F1E9]">
                Gestion des Rayons & Catégories du Vestiaire
              </h2>
              <p className="text-xs text-[#777D86]">
                Configurez les capsules et rayons présentés dans les menus et filtres de la boutique.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory({
                  id: '' as any,
                  name: '',
                  description: '',
                  iconName: 'Tag',
                });
                setIsCategoryModalOpen(true);
              }}
              className="px-4 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Rayon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const productCount = allProducts.filter((p) => p.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#C7A747] uppercase font-bold block">
                        ID : {cat.id}
                      </span>
                      <h3 className="font-heading text-base font-bold text-[#F4F1E9] mt-0.5">
                        {cat.name}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 bg-[#252525] border border-[#333] text-[10px] font-mono text-[#888]">
                      {productCount} article(s)
                    </span>
                  </div>

                  <p className="text-xs text-[#777D86] line-clamp-2 leading-relaxed">
                    {cat.description || 'Aucune description saisie.'}
                  </p>

                  <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                    <span className="text-[10px] text-[#555] font-mono">Icône : {cat.iconName}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingCategory({ ...cat });
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1 bg-[#242424] hover:bg-[#333] text-[#F4F1E9] rounded text-[11px] flex items-center gap-1 px-2"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-1 bg-[#2d1818] hover:bg-[#3d1f1f] text-[#ff8080] rounded text-[11px] flex items-center gap-1 px-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 3: STOCK & INVENTORY AUDIT */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-[#F4F1E9]">
              Suivi et Mouvements de Stock
            </h2>
            <span className="text-xs text-[#777D86]">
              {stockHistory.length} mouvement(s) audité(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allProducts.map((product) => (
              <div key={product.id} className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-[#F4F1E9]">{product.name}</h3>
                    <span className="text-[10px] font-mono text-[#777D86]">{product.sku}</span>
                  </div>
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      product.totalStock <= product.lowStockThreshold
                        ? 'bg-[#3d2f13] text-[#f59e0b]'
                        : 'bg-[#1e2a1e] text-[#4ade80]'
                    }`}
                  >
                    Total : {product.totalStock}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#262626]">
                  {product.variants.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between text-xs py-1 px-2 bg-[#161616] rounded-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: v.colorHex || '#171717' }}
                        />
                        <span className="font-semibold text-[#F4F1E9]">{v.size}</span>
                        <span className="text-[10px] text-[#777D86] font-mono">({v.sku})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono font-bold ${
                            v.stock <= 1 ? 'text-[#ff8080]' : v.stock <= 3 ? 'text-[#f59e0b]' : 'text-[#F4F1E9]'
                          }`}
                        >
                          {v.stock} en stock
                        </span>
                        <button
                          onClick={() => {
                            setStockAdjustTarget({
                              productId: product.id,
                              productName: product.name,
                              variantId: v.id,
                              variantSku: v.sku,
                              currentStock: v.stock,
                            });
                            setStockAdjustQty(0);
                            setIsStockAdjustOpen(true);
                          }}
                          className="px-2 py-0.5 text-[10px] bg-[#252525] hover:bg-[#333333] text-[#C7A747] rounded cursor-pointer transition-colors"
                        >
                          Ajuster
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 4: ORDERS & STATUS UPDATES */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-[#777D86] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Numéro, client, téléphone, ville..."
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs pl-8 pr-3 py-1.5 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <select
                value={orderFulfillFilter}
                onChange={(e) => setOrderFulfillFilter(e.target.value)}
                className="bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-1.5 rounded-xs outline-none"
              >
                <option value="all">Tous statuts logistiques</option>
                <option value="pending">En attente (Pending)</option>
                <option value="confirmed">Confirmée</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédiée (En cours)</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>

              <select
                value={orderPaymentFilter}
                onChange={(e) => setOrderPaymentFilter(e.target.value)}
                className="bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-1.5 rounded-xs outline-none"
              >
                <option value="all">Tous paiements</option>
                <option value="pending">En attente de règlement</option>
                <option value="paid">Payé / Encaissé</option>
                <option value="failed">Échec</option>
              </select>
            </div>

            <span className="text-xs font-mono text-[#777D86]">
              {orders.length} commande(s) au total
            </span>
          </div>

          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs overflow-x-auto">
            <table className="w-full text-left text-xs text-[#777D86]">
              <thead className="bg-[#161616] border-b border-[#282828] text-[11px] font-mono uppercase tracking-wider text-[#F4F1E9]">
                <tr>
                  <th className="p-3">Commande</th>
                  <th className="p-3">Client & Téléphone</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Total FCFA</th>
                  <th className="p-3">Statut Logistique</th>
                  <th className="p-3">Paiement</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {orders
                  .filter((o) => {
                    const matchQ =
                      !orderSearchQuery ||
                      o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                      o.customer.fullName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                      o.customer.phone.includes(orderSearchQuery) ||
                      o.customer.city.toLowerCase().includes(orderSearchQuery.toLowerCase());
                    const matchF = orderFulfillFilter === 'all' || o.fulfillmentStatus === orderFulfillFilter;
                    const matchP = orderPaymentFilter === 'all' || o.paymentStatus === orderPaymentFilter;
                    return matchQ && matchF && matchP;
                  })
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-[#202020] transition-colors">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-[#C7A747] block">#{order.orderNumber}</span>
                        <span className="text-[10px] text-[#777D86]">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-[#F4F1E9] block">{order.customer.fullName}</span>
                        <span className="text-[11px] text-[#777D86] font-mono">{order.customer.phone}</span>
                      </td>

                      <td className="p-3">
                        <span className="text-[#F4F1E9] block">{order.customer.city}</span>
                        <span className="text-[10px] text-[#777D86]">{order.customer.district}</span>
                      </td>

                      <td className="p-3 font-mono font-bold text-[#F4F1E9]">
                        {formatCurrency(order.total)}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                            order.fulfillmentStatus === 'delivered'
                              ? 'bg-[#1b2a1b] text-[#4ade80]'
                              : order.fulfillmentStatus === 'shipped'
                              ? 'bg-[#192b3a] text-[#38bdf8]'
                              : order.fulfillmentStatus === 'confirmed'
                              ? 'bg-[#2b2b18] text-[#facc15]'
                              : order.fulfillmentStatus === 'cancelled'
                              ? 'bg-[#3d1818] text-[#ff8080]'
                              : 'bg-[#292929] text-[#777D86]'
                          }`}
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-[#1b2a1b] text-[#4ade80]'
                              : order.paymentStatus === 'failed'
                              ? 'bg-[#3d1818] text-[#ff8080]'
                              : 'bg-[#292929] text-[#777D86]'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForDoc(order)}
                            className="p-1.5 bg-[#252525] hover:bg-[#333333] text-[#C7A747] rounded text-[11px] font-semibold cursor-pointer"
                            title="Générer Facture / Reçu Commercial (PDF)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrderForView(order);
                              setNewOrderStatus(order.fulfillmentStatus);
                              setNewPaymentStatus(order.paymentStatus);
                              setOrderStatusNote('');
                            }}
                            className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#333333] text-[#F4F1E9] rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C7A747]" />
                            <span>Détails & Statut</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 5: SHIPPING / DELIVERY ZONES MANAGEMENT */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'shipping' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-[#F4F1E9]">
                Frais et Zones de Livraison au Bénin
              </h2>
              <p className="text-xs text-[#777D86]">
                Configurez les tarifs des coursiers par commune, délais indicatifs et paliers de livraison gratuite.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingZone({
                  name: '',
                  cities: ['Cotonou'],
                  fee: 1500,
                  estimatedTime: '24h express',
                  active: true,
                });
                setIsZoneModalOpen(true);
              }}
              className="px-4 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une Zone</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <div key={zone.id} className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#F4F1E9] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C7A747]" />
                      <span>{zone.name}</span>
                    </h3>
                    <span className="text-[11px] font-mono text-[#777D86]">
                      Délai : <strong className="text-[#F4F1E9]">{zone.estimatedTime}</strong>
                    </span>
                  </div>
                  <span className="font-mono text-base font-bold text-[#C7A747]">
                    {formatCurrency(zone.fee)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                  {zone.cities.map((city, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-[#141414] border border-[#333] text-[#aaa]">
                      {city}
                    </span>
                  ))}
                </div>

                {zone.freeDeliveryThreshold && (
                  <p className="text-[11px] text-emerald-400 font-mono">
                    ✓ Livraison offerte dès {formatCurrency(zone.freeDeliveryThreshold)} d'achats
                  </p>
                )}

                <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-xs">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      zone.active ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {zone.active ? 'Zone Active' : 'Zone Désactivée'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingZone({ ...zone });
                        setIsZoneModalOpen(true);
                      }}
                      className="p-1.5 bg-[#252525] hover:bg-[#333] text-[#F4F1E9] rounded text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => setZoneToDelete(zone)}
                      className="p-1.5 bg-[#2a1a1a] hover:bg-[#3d1f1f] text-[#ff8080] rounded text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 6: PROMO CODES */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Coupon Form */}
            <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#C7A747]">
                Créer un Nouveau Code Promo
              </h3>

              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#777D86] block mb-1">Code Promo :</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="Ex : HPVIP20"
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono uppercase outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#777D86] block mb-1">Type de remise :</label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as any)}
                      className="w-full bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] p-2 rounded-xs outline-none"
                    >
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Montant Fixe (FCFA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#777D86] block mb-1">Valeur de remise :</label>
                    <input
                      type="number"
                      required
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#777D86] block mb-1">Montant d’achat minimum (FCFA) :</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#777D86] block mb-1">Nombre d’utilisations max (optionnel) :</label>
                  <input
                    type="number"
                    value={newCouponUsageLimit || ''}
                    onChange={(e) => setNewCouponUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex : 50"
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                >
                  Enregistrer le Code Promo
                </button>
              </form>
            </div>

            {/* List Coupons */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F4F1E9]">
                Codes Promo Actifs & Historiques
              </h3>

              <div className="divide-y divide-[#262626] bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs">
                {coupons.map((c) => (
                  <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#C7A747]">{c.code}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9.5px] uppercase font-mono ${
                            c.active ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {c.active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-[#777D86]">
                        Remise :{' '}
                        <strong className="text-[#F4F1E9]">
                          {c.discountType === 'percentage' ? `${c.discountValue}%` : `${formatCurrency(c.discountValue)}`}
                        </strong>{' '}
                        • Dès {formatCurrency(c.minOrderAmount || 0)} d'achats
                      </p>
                      <span className="text-[10px] text-[#666] font-mono block">
                        Utilisé {c.usedCount} fois {c.usageLimit ? `/ ${c.usageLimit} max` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleToggleCouponActive(c)}
                        className="px-2.5 py-1 bg-[#242424] hover:bg-[#333] text-[#F4F1E9] text-[11px] rounded"
                      >
                        {c.active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1.5 bg-[#2a1a1a] hover:bg-[#3d1f1f] text-[#ff8080] rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 7: SETTINGS & FEDAPAY */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'settings' && (
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#777D86] text-xs">Bandeau d’annonce public :</label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#F4F1E9]">
                  <input
                    type="checkbox"
                    checked={storeSettings.announcementActive !== false}
                    onChange={(e) => setStoreSettings({ ...storeSettings, announcementActive: e.target.checked })}
                    className="accent-[#C7A747] rounded-xs cursor-pointer"
                  />
                  <span className="text-[11px] text-[#A1A1AA]">Afficher sur le site</span>
                </label>
              </div>
              <input
                type="text"
                value={storeSettings.announcementText || ''}
                onChange={(e) => setStoreSettings({ ...storeSettings, announcementText: e.target.value })}
                placeholder="Ex : NOUVEL ARRIVAGE 2026 • LIVRAISON 24H COTONOU • PAIEMENT À LA LIVRAISON"
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
                Pour activer le mode de paiement réel en production, renseignez vos clés d'API FedaPay Bénin. Si ces champs sont vides, la boutique fonctionne en Sandbox de démonstration.
              </p>

              <div>
                <label className="text-[#777D86] block mb-1">Clé Publique FedaPay :</label>
                <input
                  type="text"
                  value={storeSettings.fedapayPublicKey || ''}
                  onChange={(e) => setStoreSettings({ ...storeSettings, fedapayPublicKey: e.target.value })}
                  placeholder="Clé publique FedaPay (ex: pk_...)"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Clé Secrète FedaPay :</label>
                <input
                  type="password"
                  value={storeSettings.fedapaySecretKey || ''}
                  onChange={(e) => setStoreSettings({ ...storeSettings, fedapaySecretKey: e.target.value })}
                  placeholder="Clé secrète FedaPay (ex: sk_...)"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              Enregistrer les Paramètres
            </button>
          </form>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 8: AUTOMATISATIONS & NOTIFICATIONS (WHATSAPP & EMAIL) */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Header & Quick Actions */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-5 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#C7A747] font-semibold block mb-0.5">
                Notifications Transactionnelles
              </span>
              <h2 className="font-heading text-lg sm:text-xl font-extrabold text-[#F4F1E9] mt-0.5">
                Notifications WhatsApp Business & Email
              </h2>
              <p className="text-xs text-[#777D86] max-w-2xl leading-relaxed">
                Suivi certifié côté serveur des alertes client et administrateur. Accusés de réception confirmés par Meta / Passerelle béninoise (+229) et respect strict du consentement légal (Loi Bénin n° 2017-20 / RGPD).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadNotificationsData()}
                disabled={isLoadingNotifs}
                className="px-3 py-2 bg-[#252525] hover:bg-[#2e2e2e] text-[#F4F1E9] rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#C7A747] ${isLoadingNotifs ? 'animate-spin' : ''}`} />
                <span>Actualiser le journal</span>
              </button>
              <button
                type="button"
                onClick={handleClearNotificationLogs}
                className="px-3 py-2 bg-[#2a1a1a] hover:bg-[#382222] text-[#ff8080] rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purger le journal</span>
              </button>
            </div>
          </div>

          {/* 4 Top KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider">Taux de Succès</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-heading text-2xl font-black text-emerald-400">
                {notifStats ? `${notifStats.successRate}%` : '100%'}
              </div>
              <span className="text-[10px] text-[#777D86] block">
                Accusé de réception positif certifié
              </span>
            </div>

            <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider">Envoyées & Confirmées</span>
                <CheckCircle2 className="w-4 h-4 text-[#C7A747]" />
              </div>
              <div className="font-heading text-2xl font-black text-[#F4F1E9]">
                {notifStats?.sent ?? 0}
                <span className="text-xs font-normal text-[#666] ml-1.5">/ {notifStats?.total ?? 0}</span>
              </div>
              <span className="text-[10px] text-[#777D86] block">
                Confirmées par prestataire
              </span>
            </div>

            <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider">Échecs & Erreurs</span>
                <AlertTriangle className={`w-4 h-4 ${notifStats && notifStats.failed > 0 ? 'text-red-400' : 'text-[#666]'}`} />
              </div>
              <div className={`font-heading text-2xl font-black ${notifStats && notifStats.failed > 0 ? 'text-red-400' : 'text-[#F4F1E9]'}`}>
                {notifStats?.failed ?? 0}
              </div>
              <span className="text-[10px] text-[#777D86] block">
                Erreurs réseau ou rejet passerelle
              </span>
            </div>

            <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider">Non-Consentement</span>
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="font-heading text-2xl font-black text-purple-400">
                {notifStats?.blocked ?? 0}
              </div>
              <span className="text-[10px] text-[#777D86] block">
                Conforme Loi Bénin n° 2017-20
              </span>
            </div>
          </div>

          {/* Sub-Navigation Switcher */}
          <div className="flex border-b border-[#282828] gap-1 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setNotifActiveSubTab('logs')}
              className={`px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-2 cursor-pointer ${
                notifActiveSubTab === 'logs'
                  ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
                  : 'text-[#777D86] hover:text-[#F4F1E9]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Journal d'Audit ({notifications.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setNotifActiveSubTab('triggers')}
              className={`px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-2 cursor-pointer ${
                notifActiveSubTab === 'triggers'
                  ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
                  : 'text-[#777D86] hover:text-[#F4F1E9]'
              }`}
            >
              <span>Règles & Déclencheurs (10)</span>
            </button>

            <button
              type="button"
              onClick={() => setNotifActiveSubTab('gateways')}
              className={`px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-2 cursor-pointer ${
                notifActiveSubTab === 'gateways'
                  ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
                  : 'text-[#777D86] hover:text-[#F4F1E9]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Passerelles & Prestataires</span>
            </button>

            <button
              type="button"
              onClick={() => setNotifActiveSubTab('test')}
              className={`px-4 py-2.5 rounded-t-xs transition-all flex items-center gap-2 cursor-pointer ${
                notifActiveSubTab === 'test'
                  ? 'bg-[#1c1c1c] text-[#C7A747] border-t-2 border-x border-[#282828] border-t-[#C7A747]'
                  : 'text-[#777D86] hover:text-[#F4F1E9]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simulateur de Test</span>
            </button>
          </div>

          {/* SUBTAB 1: AUDIT LOGS TABLE */}
          {notifActiveSubTab === 'logs' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-4 rounded-xs flex flex-wrap items-center gap-3 text-xs">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-[#777D86] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={notifSearch}
                    onChange={(e) => {
                      setNotifSearch(e.target.value);
                      loadNotificationsData({ search: e.target.value });
                    }}
                    placeholder="Recherche par nom, n° WhatsApp, email ou commande..."
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs pl-8 pr-3 py-2 text-xs text-[#F4F1E9] outline-none focus:border-[#C7A747]"
                  />
                </div>

                {/* Event Type Filter */}
                <div className="w-full sm:w-auto">
                  <select
                    value={notifFilterType}
                    onChange={(e) => {
                      setNotifFilterType(e.target.value);
                      loadNotificationsData({ eventType: e.target.value });
                    }}
                    className="w-full sm:w-auto bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none cursor-pointer"
                  >
                    <option value="all">Tous les événements</option>
                    <optgroup label="Notifications Client">
                      <option value="client_order_received">Client : Réception commande</option>
                      <option value="client_order_confirmed">Client : Confirmation commande</option>
                      <option value="client_order_processing">Client : En préparation</option>
                      <option value="client_order_shipped">Client : Expédiée / Coursier</option>
                      <option value="client_order_delivered">Client : Livrée</option>
                    </optgroup>
                    <optgroup label="Alertes Administrateur">
                      <option value="admin_new_order">Admin : Nouvelle commande</option>
                      <option value="admin_stock_low">Admin : Stock faible</option>
                      <option value="admin_stock_out">Admin : Rupture de stock</option>
                      <option value="admin_payment_confirmed">Admin : Paiement certifié</option>
                      <option value="admin_payment_failed">Admin : Paiement échoué</option>
                    </optgroup>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="w-full sm:w-auto">
                  <select
                    value={notifFilterStatus}
                    onChange={(e) => {
                      setNotifFilterStatus(e.target.value);
                      loadNotificationsData({ status: e.target.value });
                    }}
                    className="w-full sm:w-auto bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none cursor-pointer"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="sent">Envoyé & Confirmé prestataire</option>
                    <option value="failed">Échec de transmission</option>
                    <option value="pending">En cours / Attente</option>
                    <option value="blocked_no_consent">Bloqué sans consentement</option>
                  </select>
                </div>

                {/* Channel Filter */}
                <div className="w-full sm:w-auto">
                  <select
                    value={notifFilterChannel}
                    onChange={(e) => {
                      setNotifFilterChannel(e.target.value);
                      loadNotificationsData({ channel: e.target.value });
                    }}
                    className="w-full sm:w-auto bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none cursor-pointer"
                  >
                    <option value="all">Tous les canaux</option>
                    <option value="whatsapp">WhatsApp Business (+229)</option>
                    <option value="email">Email Transactionnel</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#141414] border-b border-[#282828] text-[10.5px] uppercase font-mono tracking-wider text-[#777D86]">
                        <th className="p-3">Horodatage</th>
                        <th className="p-3">Événement</th>
                        <th className="p-3">Destinataire</th>
                        <th className="p-3">Canal</th>
                        <th className="p-3">Statut & Accusé Prestataire</th>
                        <th className="p-3">Base Légale</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#242424]">
                      {isLoadingNotifs ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-[#777D86]">
                            <RefreshCw className="w-5 h-5 mx-auto text-[#C7A747] animate-spin mb-2" />
                            <span>Chargement du journal des notifications...</span>
                          </td>
                        </tr>
                      ) : notifications.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-[#777D86]">
                            <Bell className="w-6 h-6 mx-auto text-[#444] mb-2" />
                            <p className="font-semibold text-[#F4F1E9]">Aucune notification trouvée</p>
                            <span className="text-[11px] text-[#666]">
                              Passez une commande ou effectuez un test pour générer des événements automatisés.
                            </span>
                          </td>
                        </tr>
                      ) : (
                        notifications.map((n) => {
                          const isSent = n.status === 'sent';
                          const isFailed = n.status === 'failed';
                          const isBlocked = n.status === 'blocked_no_consent';

                          return (
                            <tr key={n.id} className="hover:bg-[#202020] transition-colors">
                              {/* Date */}
                              <td className="p-3 font-mono text-[11px] text-[#888] whitespace-nowrap">
                                <div>{new Date(n.createdAt).toLocaleDateString('fr-BJ')}</div>
                                <div className="text-[10px] text-[#555]">{new Date(n.createdAt).toLocaleTimeString('fr-BJ')}</div>
                              </td>

                              {/* Event */}
                              <td className="p-3">
                                <div className="font-semibold text-[#F4F1E9]">{n.title}</div>
                                <span className="font-mono text-[10px] text-[#C7A747] block">{n.eventType}</span>
                                {n.metadata?.orderId && (
                                  <span className="text-[10px] text-[#666] font-mono">Cmd #{n.metadata.orderId.slice(-6)}</span>
                                )}
                              </td>

                              {/* Recipient */}
                              <td className="p-3">
                                <div className="font-medium text-[#F4F1E9]">{n.recipient?.name || 'Client HP'}</div>
                                <div className="font-mono text-[11px] text-[#777D86] flex items-center gap-1">
                                  {n.channel === 'whatsapp' ? (
                                    <Smartphone className="w-3 h-3 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                                  )}
                                  <span>{n.recipient?.phone || n.recipient?.email || 'N/A'}</span>
                                </div>
                              </td>

                              {/* Channel */}
                              <td className="p-3 whitespace-nowrap">
                                {n.channel === 'whatsapp' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                                    <Smartphone className="w-3 h-3" /> WhatsApp
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-800">
                                    <Mail className="w-3 h-3" /> Email
                                  </span>
                                )}
                              </td>

                              {/* Status & Provider ID */}
                              <td className="p-3">
                                {isSent && (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                                      <CheckCircle2 className="w-3 h-3" /> Confirmé Prestataire
                                    </span>
                                    {n.providerMessageId && (
                                      <div className="text-[10px] font-mono text-[#666] truncate max-w-[160px]" title={n.providerMessageId}>
                                        Réf: {n.providerMessageId}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {isFailed && (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-950/80 text-rose-400 border border-rose-800">
                                      <AlertTriangle className="w-3 h-3" /> Échec de délivrance
                                    </span>
                                    {n.error && (
                                      <div className="text-[10px] text-rose-300 truncate max-w-[160px]" title={n.error}>
                                        {n.error}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {isBlocked && (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-950/80 text-purple-400 border border-purple-800">
                                      <Lock className="w-3 h-3" /> Non Consenti
                                    </span>
                                    <div className="text-[9.5px] text-[#777D86]">
                                      Loi Bénin 2017-20
                                    </div>
                                  </div>
                                )}
                                {n.status === 'pending' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/80 text-amber-400 border border-amber-800">
                                    <Clock className="w-3 h-3" /> En cours
                                  </span>
                                )}
                              </td>

                              {/* Legal Basis */}
                              <td className="p-3 text-[10.5px]">
                                {n.consentLegalBasis === 'contractual_order_fulfillment' ? (
                                  <span className="text-[#999] block font-mono">Exécution commande</span>
                                ) : (
                                  <span className="text-purple-300 block font-mono">Consentement explicite</span>
                                )}
                                <span className="text-[9.5px] text-[#555] block">
                                  Tentatives : {n.attempts}/{n.maxAttempts}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedNotifForDetail(n)}
                                  className="px-2.5 py-1 bg-[#252525] hover:bg-[#333] text-[#F4F1E9] text-[11px] rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                                  title="Examiner la notification"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Détails</span>
                                </button>
                                {isFailed && (
                                  <button
                                    type="button"
                                    onClick={() => handleRetryNotification(n.id)}
                                    disabled={isRetryingNotifId === n.id}
                                    className="px-2.5 py-1 bg-[#8a2424] hover:bg-[#a62b2b] text-white text-[11px] font-semibold rounded transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                                    title="Tenter une réexpédition"
                                  >
                                    <RotateCcw className={`w-3 h-3 ${isRetryingNotifId === n.id ? 'animate-spin' : ''}`} />
                                    <span>{isRetryingNotifId === n.id ? 'Envoi...' : 'Réessayer'}</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: AUTOMATION TRIGGERS & RULES */}
          {notifActiveSubTab === 'triggers' && notifConfig && (
            <form onSubmit={handleSaveNotificationConfig} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Notifications Rules */}
                <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#282828]">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#C7A747]" />
                      <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F4F1E9]">
                        Notifications Clients (5 Événements)
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-[#C7A747]">Parcours d'achat</span>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 bg-[#151515] border border-[#262626] rounded-xs cursor-pointer hover:border-[#383838] transition-colors">
                      <input
                        type="checkbox"
                        checked={notifConfig.notifyClientOrderReceived}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            notifyClientOrderReceived: e.target.checked,
                          })
                        }
                        className="accent-[#C7A747] mt-0.5"
                      />
                      <div>
                        <strong className="text-[#F4F1E9] block">1. Confirmation de réception de commande</strong>
                        <span className="text-[#777D86] text-[11px] block leading-relaxed">
                          Envoyée immédiatement au client dès validation du panier avec son récapitulatif et numéro de suivi.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-[#151515] border border-[#262626] rounded-xs cursor-pointer hover:border-[#383838] transition-colors">
                      <input
                        type="checkbox"
                        checked={notifConfig.notifyClientOrderConfirmed}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            notifyClientOrderConfirmed: e.target.checked,
                          })
                        }
                        className="accent-[#C7A747] mt-0.5"
                      />
                      <div>
                        <strong className="text-[#F4F1E9] block">2. Notification de confirmation de commande</strong>
                        <span className="text-[#777D86] text-[11px] block leading-relaxed">
                          Déclenchée lorsque la commande est formellement validée par la direction HP COLLECTION.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-[#151515] border border-[#262626] rounded-xs cursor-pointer hover:border-[#383838] transition-colors">
                      <input
                        type="checkbox"
                        checked={notifConfig.notifyClientOrderProcessing}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            notifyClientOrderProcessing: e.target.checked,
                          })
                        }
                        className="accent-[#C7A747] mt-0.5"
                      />
                      <div>
                        <strong className="text-[#F4F1E9] block">3. Notification commande en préparation</strong>
                        <span className="text-[#777D86] text-[11px] block leading-relaxed">
                          Avertit le client que ses articles (sneakers / vêtements) sont inspectés et emballés à Cotonou.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-[#151515] border border-[#262626] rounded-xs cursor-pointer hover:border-[#383838] transition-colors">
                      <input
                        type="checkbox"
                        checked={notifConfig.notifyClientOrderShipped}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            notifyClientOrderShipped: e.target.checked,
                          })
                        }
                        className="accent-[#C7A747] mt-0.5"
                      />
                      <div>
                        <strong className="text-[#F4F1E9] block">4. Notification commande expédiée / coursier en route</strong>
                        <span className="text-[#777D86] text-[11px] block leading-relaxed">
                          Transmet les détails du coursier et rappelle l’option d’essayage au déballage.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-[#151515] border border-[#262626] rounded-xs cursor-pointer hover:border-[#383838] transition-colors">
                      <input
                        type="checkbox"
                        checked={notifConfig.notifyClientOrderDelivered}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            notifyClientOrderDelivered: e.target.checked,
                          })
                        }
                        className="accent-[#C7A747] mt-0.5"
                      />
                      <div>
                        <strong className="text-[#F4F1E9] block">5. Notification commande livrée</strong>
                        <span className="text-[#777D86] text-[11px] block leading-relaxed">
                          Remerciement officiel et lien direct vers le service après-vente pour échange de taille sous 48h.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-[11px]">
                    <span className="text-[#777D86]">Canaux autorisés :</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.whatsappEnabled}
                          onChange={(e) =>
                            setNotifConfig({
                              ...notifConfig,
                              whatsappEnabled: e.target.checked,
                            })
                          }
                          className="accent-[#C7A747]"
                        />
                        <span className="text-[#F4F1E9]">WhatsApp</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.emailEnabled}
                          onChange={(e) =>
                            setNotifConfig({
                              ...notifConfig,
                              emailEnabled: e.target.checked,
                            })
                          }
                          className="accent-[#C7A747]"
                        />
                        <span className="text-[#F4F1E9]">Email</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Admin Alerts Rules */}
                <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#282828]">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#C7A747]" />
                      <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F4F1E9]">
                        Alertes Administrateur (5 Événements)
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-[#C7A747]">Opérations & Sécurité</span>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 bg-[#151515] border border-[#262626] rounded-xs cursor-pointer hover:border-[#383838] transition-colors">
                      <input
                        type="checkbox"
                        checked={notifConfig.alertAdminNewOrder}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            alertAdminNewOrder: e.target.checked,
                          })
                        }
                        className="accent-[#C7A747] mt-0.5"
                      />
                      <div>
                        <strong className="text-[#F4F1E9] block">1. Alerte à chaque nouvelle commande</strong>
                        <span className="text-[#777D86] text-[11px] block leading-relaxed">
                          Alerte push instantanée avec le montant total, le quartier de livraison et le téléphone du client.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-[#151515] border border-[#262626] rounded-xs cursor-pointer hover:border-[#383838] transition-colors">
                      <input
                        type="checkbox"
                        checked={notifConfig.alertAdminStockLow}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            alertAdminStockLow: e.target.checked,
                          })
                        }
                        className="accent-[#C7A747] mt-0.5"
                      />
                      <div>
                        <strong className="text-[#F4F1E9] block">2. Alerte de stock faible</strong>
                        <span className="text-[#777D86] text-[11px] block leading-relaxed">
                          Déclenchée automatiquement dès qu'une variante passe sous son seuil de réapprovisionnement.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-[#151515] border border-[#262626] rounded-xs cursor-pointer hover:border-[#383838] transition-colors">
                      <input
                        type="checkbox"
                        checked={notifConfig.alertAdminStockOut}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            alertAdminStockOut: e.target.checked,
                          })
                        }
                        className="accent-[#C7A747] mt-0.5"
                      />
                      <div>
                        <strong className="text-[#F4F1E9] block">3. Alerte de rupture de stock</strong>
                        <span className="text-[#777D86] text-[11px] block leading-relaxed">
                          Alerte critique d'urgence quand une pointure ou taille atteint 0 exemplaire en magasin.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-[#151515] border border-[#262626] rounded-xs cursor-pointer hover:border-[#383838] transition-colors">
                      <input
                        type="checkbox"
                        checked={notifConfig.alertAdminPaymentConfirmed}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            alertAdminPaymentConfirmed: e.target.checked,
                          })
                        }
                        className="accent-[#C7A747] mt-0.5"
                      />
                      <div>
                        <strong className="text-[#F4F1E9] block">4. Notification des paiements confirmés (FedaPay / Mobile Money)</strong>
                        <span className="text-[#777D86] text-[11px] block leading-relaxed">
                          Certifiée obligatoirement côté serveur après validation du webhook sécurisé FedaPay.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-[#151515] border border-[#262626] rounded-xs cursor-pointer hover:border-[#383838] transition-colors">
                      <input
                        type="checkbox"
                        checked={notifConfig.alertAdminPaymentFailed}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            alertAdminPaymentFailed: e.target.checked,
                          })
                        }
                        className="accent-[#C7A747] mt-0.5"
                      />
                      <div>
                        <strong className="text-[#F4F1E9] block">5. Signalement des paiements échoués ou interrompus</strong>
                        <span className="text-[#777D86] text-[11px] block leading-relaxed">
                          Signalement avec motif d’échec permettant à l'équipe commerciale de proposer une alternative au client.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Admin destination contacts */}
                  <div className="pt-3 border-t border-[#262626] space-y-3">
                    <h4 className="font-heading text-xs font-bold uppercase text-[#F4F1E9]">
                      Coordonnées de Réception Administrateur :
                    </h4>
                    <div>
                      <label className="text-[#777D86] text-[11px] block mb-1">Numéro WhatsApp Administrateur (Format Bénin +229) :</label>
                      <input
                        type="text"
                        value={notifConfig.adminPhone || ''}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            adminPhone: e.target.value,
                          })
                        }
                        placeholder="+22997000000"
                        className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#777D86] text-[11px] block mb-1">Email Administrateur :</label>
                      <input
                        type="email"
                        value={notifConfig.adminEmail || ''}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            adminEmail: e.target.value,
                          })
                        }
                        placeholder="direction@hpcollection.bj"
                        className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNotifConfig}
                  className="px-6 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingNotifConfig ? 'Enregistrement...' : 'Enregistrer les Règles d’Automatisation'}</span>
                </button>
              </div>
            </form>
          )}

          {/* SUBTAB 3: GATEWAYS & PROVIDERS CONFIG */}
          {notifActiveSubTab === 'gateways' && notifConfig && (
            <form onSubmit={handleSaveNotificationConfig} className="max-w-3xl space-y-6">
              {/* WhatsApp Gateway Settings */}
              <div className="p-6 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#282828]">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F4F1E9]">
                    Passerelle WhatsApp Business Cloud API (Meta)
                  </h3>
                </div>

                <div className="p-3 bg-[#151515] border border-[#282828] rounded-xs space-y-1 text-[#777D86]">
                  <p className="text-[11px] text-[#F4F1E9] font-medium">
                    Gestion des numéros béninois (+229 MTN Bénin, Moov Africa Bénin, Celtiis)
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    En mode réel, les messages sont transmis via l'API officielle Graph Meta v19.0. En l'absence de jeton Meta, le moteur bascule automatiquement sur le simulateur vérifié haute fidélité avec accusé de réception certifié.
                  </p>
                </div>

                <div>
                  <label className="text-[#777D86] block mb-1">Mode d'exécution WhatsApp :</label>
                  <select
                    value={notifConfig.whatsappProvider}
                    onChange={(e) =>
                      setNotifConfig({
                        ...notifConfig,
                        whatsappProvider: e.target.value as 'meta_cloud_api' | 'verified_simulator',
                      })
                    }
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                  >
                    <option value="verified_simulator">Simulateur certifié Sandbox Bénin (MTN / Moov / Celtiis)</option>
                    <option value="meta_cloud_api">Production : Meta WhatsApp Cloud API v19.0</option>
                  </select>
                </div>

                {notifConfig.whatsappProvider === 'meta_cloud_api' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[#777D86] block mb-1">WhatsApp Phone Number ID :</label>
                      <input
                        type="text"
                        value={notifConfig.metaPhoneNumberId || ''}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            metaPhoneNumberId: e.target.value,
                          })
                        }
                        placeholder="Ex : 109876543210987"
                        className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[#777D86] block mb-1">Jeton d'Accès Permanent (Access Token) :</label>
                      <input
                        type="password"
                        value={notifConfig.metaWhatsappToken || ''}
                        onChange={(e) =>
                          setNotifConfig({
                            ...notifConfig,
                            metaWhatsappToken: e.target.value,
                          })
                        }
                        placeholder="EAAB..."
                        className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Email Gateway Settings */}
              <div className="p-6 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#282828]">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F4F1E9]">
                    Passerelle Email Transactionnel
                  </h3>
                </div>

                <div className="p-3 bg-[#151515] border border-[#282828] rounded-xs space-y-1 text-[#777D86]">
                  <p className="text-[11px] text-[#F4F1E9] font-medium">
                    Serveur SMTP / Passerelle de délivrance certifiée
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Les emails de confirmation de commande et de suivi sont envoyés avec gabarits HTML responsifs et headers anti-spam.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={notifConfig.smtpConfigured || false}
                    onChange={(e) =>
                      setNotifConfig({
                        ...notifConfig,
                        smtpConfigured: e.target.checked,
                      })
                    }
                    className="accent-[#C7A747]"
                  />
                  <span className="text-[#F4F1E9]">Serveur SMTP actif en production</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNotifConfig}
                  className="px-6 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingNotifConfig ? 'Enregistrement...' : 'Enregistrer la Configuration des Passerelles'}
                </button>
              </div>
            </form>
          )}

          {/* SUBTAB 4: LIVE TEST SIMULATOR */}
          {notifActiveSubTab === 'test' && (
            <div className="max-w-2xl bg-[#1c1c1c] border border-[#2a2a2a] p-6 rounded-xs space-y-5 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-[#282828]">
                <Send className="w-4 h-4 text-[#C7A747]" />
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F4F1E9]">
                  Banc de Test Transactionnel en Direct
                </h3>
              </div>

              <p className="text-xs text-[#777D86] leading-relaxed">
                Déclenchez une transmission test pour vérifier le bon fonctionnement de la passerelle WhatsApp ou Email, tester les accusés de réception du prestataire et visualiser le format du message envoyé au client ou à l'administrateur.
              </p>

              <form onSubmit={handleSendTestNotification} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#777D86] block mb-1">Canal à tester :</label>
                    <select
                      value={testChannel}
                      onChange={(e) => {
                        const ch = e.target.value as 'whatsapp' | 'email';
                        setTestChannel(ch);
                        if (ch === 'whatsapp' && !testTarget.startsWith('+')) {
                          setTestTarget('+22997000000');
                        } else if (ch === 'email' && !testTarget.includes('@')) {
                          setTestTarget('test@hpcollection.bj');
                        }
                      }}
                      className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                    >
                      <option value="whatsapp">WhatsApp (+229 Bénin)</option>
                      <option value="email">Email Transactionnel</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#777D86] block mb-1">Événement simulé :</label>
                    <select
                      value={testEventType}
                      onChange={(e) => setTestEventType(e.target.value as NotificationEventType)}
                      className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                    >
                      <option value="client_order_received">Client : Réception commande</option>
                      <option value="client_order_confirmed">Client : Confirmation commande</option>
                      <option value="client_order_processing">Client : En préparation</option>
                      <option value="client_order_shipped">Client : Expédiée / Coursier</option>
                      <option value="client_order_delivered">Client : Livrée</option>
                      <option value="admin_new_order">Admin : Alerte nouvelle commande</option>
                      <option value="admin_stock_low">Admin : Alerte stock faible</option>
                      <option value="admin_stock_out">Admin : Alerte rupture stock</option>
                      <option value="admin_payment_confirmed">Admin : Paiement certifié FedaPay</option>
                      <option value="admin_payment_failed">Admin : Paiement échoué</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[#777D86] block mb-1">
                    {testChannel === 'whatsapp'
                      ? 'Numéro WhatsApp de réception (avec indicatif +229) :'
                      : 'Adresse Email de réception :'}
                  </label>
                  <input
                    type="text"
                    required
                    value={testTarget}
                    onChange={(e) => setTestTarget(e.target.value)}
                    placeholder={testChannel === 'whatsapp' ? '+22997000000' : 'client@hpcollection.bj'}
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isTestingNotif}
                    className="px-6 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isTestingNotif ? 'animate-bounce' : ''}`} />
                    <span>{isTestingNotif ? 'Transmission en cours...' : 'Déclencher l’envoi de test'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB: CLIENTS & GESTION CLIENTÈLE (CRM) */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'clients' && (
        <AdminCustomersSection
          adminToken={adminToken!}
          formatCurrency={formatCurrency}
          showToast={showToast}
        />
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB: RETOURS & RÉCLAMATIONS */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'returns' && (
        <AdminReturnsSection
          adminToken={adminToken!}
          formatCurrency={formatCurrency}
          showToast={showToast}
        />
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PRODUCT WITH MULTI-IMAGE & VARIANTS */}
      {/* --------------------------------------------------------- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#C7A747] tracking-wider font-bold">
                FICHE PRODUIT & STOCK
              </span>
              <h3 className="font-heading text-xl font-bold text-[#F4F1E9]">
                {editingProduct.id ? 'Modifier l’Article' : 'Ajouter un Nouvel Article au Catalogue'}
              </h3>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              {/* 1. Basic details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#777D86] block mb-1">Nom du modèle (Titre) :</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Ex : Veste Varsity Racing Noir & Or"
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#777D86] block mb-1">Référence (SKU) :</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="Ex : HPC-VAR-015"
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                  />
                </div>
              </div>

              {/* 2. Category, Prices, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[#777D86] block mb-1">Rayon / Catégorie :</label>
                  <select
                    value={editingProduct.category || 'sneakers'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-2 rounded-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#777D86] block mb-1">Statut en Boutique :</label>
                  <select
                    value={editingProduct.status || 'published'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-2 rounded-xs outline-none font-semibold"
                  >
                    <option value="published">Publié (En ligne)</option>
                    <option value="draft">Brouillon (Dépublié)</option>
                    <option value="archived">Archivé</option>
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
                  <label className="text-[#777D86] block mb-1">Prix Promo (optionnel) :</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ex : 30000"
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                  />
                </div>
              </div>

              {/* 3. Description & Materials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#777D86] block mb-1">Description éditoriale :</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs p-2 text-xs text-[#F4F1E9] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[#777D86] block mb-1">Matières & Composition :</label>
                    <input
                      type="text"
                      value={editingProduct.materials || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, materials: e.target.value })}
                      placeholder="Ex : 100% Coton peigné lourd 240 GSM"
                      className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-1.5 text-xs text-[#F4F1E9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#777D86] block mb-1">Conseils d'entretien :</label>
                    <input
                      type="text"
                      value={editingProduct.careAdvice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, careAdvice: e.target.value })}
                      placeholder="Ex : Lavage en machine 30°C à l'envers"
                      className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-1.5 text-xs text-[#F4F1E9] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. PHOTO MANAGEMENT (Upload & Multi-Gallery) */}
              <div className="p-4 bg-[#161616] border border-[#2a2a2a] rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#C7A747] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Galerie Photos de l'Article ({editingProduct.images?.length || 0})</span>
                  </span>
                  <span className="text-[10px] text-[#777D86]">
                    La première photo est l'image principale de la vitrine.
                  </span>
                </div>

                {/* Upload Buttons & Add URL */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#252525] hover:bg-[#333333] text-[#F4F1E9] border border-[#444] rounded-xs cursor-pointer transition-colors w-full sm:w-auto">
                    <Upload className="w-4 h-4 text-[#C7A747]" />
                    <span>{isUploadingPhoto ? 'Envoi en cours...' : 'Télécharger des photos (depuis l\'appareil)'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={isUploadingPhoto}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2 flex-1 w-full">
                    <input
                      type="url"
                      value={newImageUrlInput}
                      onChange={(e) => setNewImageUrlInput(e.target.value)}
                      placeholder="Ou coller une URL d'image (https://...)"
                      className="flex-1 bg-[#121212] border border-[#333333] rounded-xs px-3 py-1.5 text-xs text-[#F4F1E9] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 bg-[#252525] hover:bg-[#333] text-[#C7A747] text-xs font-semibold rounded-xs transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Thumbnails visual strip */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {(editingProduct.images || []).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-24 bg-[#121212] border border-[#333] rounded-xs overflow-hidden group"
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-[#C7A747] text-[#141414] text-[8px] font-bold font-mono px-1 py-0.2 rounded-xs shadow">
                          Principale
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleMakePhotoPrimary(idx)}
                            className="text-[9px] text-[#C7A747] hover:underline flex items-center gap-0.5"
                            title="Définir comme principale"
                          >
                            <Star className="w-3 h-3" />
                            <span>Principale</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="text-[9px] text-[#ff8080] hover:underline flex items-center gap-0.5"
                          title="Supprimer cette photo"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Retirer</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. VARIANTS & STOCKS MANAGER */}
              <div className="p-4 bg-[#161616] border border-[#2a2a2a] rounded-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#C7A747] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Déclinaisons, Tailles & Stocks ({editingProduct.variants?.length || 0})</span>
                    </span>
                    <span className="text-[10px] text-[#777D86]">
                      Stock total calculé : <strong className="text-[#4ade80] font-mono">{editingProduct.totalStock || 0} pièces</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateApparelSizes}
                      className="px-2 py-1 bg-[#222] hover:bg-[#2c2c2c] text-[10px] text-[#F4F1E9] border border-[#333] rounded transition-colors"
                    >
                      + Tailles Vêtements (S-XXL)
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateShoeSizes}
                      className="px-2 py-1 bg-[#222] hover:bg-[#2c2c2c] text-[10px] text-[#F4F1E9] border border-[#333] rounded transition-colors"
                    >
                      + Pointures Sneakers (40-45)
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-2.5 py-1 bg-[#C7A747] hover:bg-[#b8973b] text-[#141414] text-[10px] font-bold uppercase rounded transition-colors"
                    >
                      + Ajouter Variante
                    </button>
                  </div>
                </div>

                {/* Variants List Table */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {(editingProduct.variants || []).map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-2 p-2 bg-[#121212] border border-[#2b2b2b] rounded-xs text-xs"
                    >
                      <div className="w-20">
                        <label className="text-[9px] text-[#666] block">Taille :</label>
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => handleUpdateVariant(v.id, 'size', e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#333] rounded px-1.5 py-0.5 text-xs text-[#F4F1E9] font-mono"
                        />
                      </div>

                      <div className="flex-1 min-w-[100px]">
                        <label className="text-[9px] text-[#666] block">Couleur :</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={v.colorHex || '#171717'}
                            onChange={(e) => handleUpdateVariant(v.id, 'colorHex', e.target.value)}
                            className="w-6 h-6 border border-[#333] rounded bg-transparent cursor-pointer p-0"
                          />
                          <input
                            type="text"
                            value={v.color}
                            onChange={(e) => handleUpdateVariant(v.id, 'color', e.target.value)}
                            className="flex-1 bg-[#1c1c1c] border border-[#333] rounded px-1.5 py-0.5 text-xs text-[#F4F1E9]"
                          />
                        </div>
                      </div>

                      <div className="w-24">
                        <label className="text-[9px] text-[#666] block">Stock dispo :</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => handleUpdateVariant(v.id, 'stock', e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#333] rounded px-1.5 py-0.5 text-xs text-[#F4F1E9] font-mono font-bold"
                        />
                      </div>

                      <div className="w-28 hidden sm:block">
                        <label className="text-[9px] text-[#666] block">SKU Variante :</label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleUpdateVariant(v.id, 'sku', e.target.value)}
                          className="w-full bg-[#1c1c1c] border border-[#333] rounded px-1.5 py-0.5 text-[10px] text-[#888] font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="p-1.5 text-[#ff8080] hover:bg-[#331111] rounded mt-3"
                        title="Supprimer cette déclinaison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Settings Toggles */}
              <div className="flex flex-wrap items-center gap-5 pt-1 text-xs">
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

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[#777D86]">Seuil d'alerte stock faible :</span>
                  <input
                    type="number"
                    value={editingProduct.lowStockThreshold || 3}
                    onChange={(e) => setEditingProduct({ ...editingProduct, lowStockThreshold: Number(e.target.value) })}
                    className="w-16 bg-[#141414] border border-[#333333] rounded px-2 py-1 text-xs text-[#F4F1E9] font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#282828] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 bg-[#282828] hover:bg-[#333] text-[#F4F1E9] rounded-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold uppercase tracking-wider rounded-xs cursor-pointer shadow-lg"
                >
                  Enregistrer l'Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: CATEGORY CREATE / EDIT */}
      {/* --------------------------------------------------------- */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm p-6 space-y-4">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-base font-bold text-[#F4F1E9]">
              {editingCategory.id && categories.some((c) => c.id === editingCategory.id)
                ? 'Modifier le Rayon'
                : 'Créer un Nouveau Rayon / Catégorie'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-[#777D86] block mb-1">Identifiant technique (slug) :</label>
                <input
                  type="text"
                  required
                  value={editingCategory.id || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') as any })}
                  placeholder="Ex : bonnets"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Nom affiché :</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="Ex : Bonnets & Bérets"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Description :</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Ex : Accessoires de tête en maille côtelée et broderies..."
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs p-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Icône :</label>
                <select
                  value={editingCategory.iconName || 'Tag'}
                  onChange={(e) => setEditingCategory({ ...editingCategory, iconName: e.target.value })}
                  className="w-full bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] p-2 rounded-xs outline-none"
                >
                  <option value="Tag">Étiquette (Tag)</option>
                  <option value="Flame">Flamme (Flame)</option>
                  <option value="Footprints">Empreinte (Footprints)</option>
                  <option value="Trophy">Trophée (Trophy)</option>
                  <option value="Shirt">Chemise / T-shirt (Shirt)</option>
                  <option value="Sparkles">Étoiles (Sparkles)</option>
                  <option value="Crown">Couronne (Crown)</option>
                  <option value="Layers">Couches / Pantalons (Layers)</option>
                  <option value="ShoppingBag">Sac (ShoppingBag)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-2 bg-[#282828] text-[#F4F1E9] rounded-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold uppercase rounded-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: SHIPPING ZONE CREATE / EDIT */}
      {/* --------------------------------------------------------- */}
      {isZoneModalOpen && editingZone && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm p-6 space-y-4">
            <button
              onClick={() => setIsZoneModalOpen(false)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-base font-bold text-[#F4F1E9]">
              {editingZone.id && zones.some((z) => z.id === editingZone.id)
                ? 'Modifier la Zone de Livraison'
                : 'Ajouter une Zone de Livraison'}
            </h3>

            <form onSubmit={handleSaveZone} className="space-y-3 text-xs">
              <div>
                <label className="text-[#777D86] block mb-1">Nom de la zone :</label>
                <input
                  type="text"
                  required
                  value={editingZone.name || ''}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  placeholder="Ex : Cotonou Express"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Villes / Quartiers (séparés par virgule) :</label>
                <input
                  type="text"
                  required
                  value={editingZone.cities?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingZone({
                      ...editingZone,
                      cities: e.target.value.split(',').map((s) => s.trim()).filter((s) => s.length > 0),
                    })
                  }
                  placeholder="Ex : Cotonou, Haie Vive, Cadjèhoun, Akpakpa"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#777D86] block mb-1">Tarif coursier (FCFA) :</label>
                  <input
                    type="number"
                    required
                    value={editingZone.fee || 0}
                    onChange={(e) => setEditingZone({ ...editingZone, fee: Number(e.target.value) })}
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#777D86] block mb-1">Délai indicatif :</label>
                  <input
                    type="text"
                    required
                    value={editingZone.estimatedTime || ''}
                    onChange={(e) => setEditingZone({ ...editingZone, estimatedTime: e.target.value })}
                    placeholder="Ex : 24h express"
                    className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Seuil gratuité (optionnel, en FCFA) :</label>
                <input
                  type="number"
                  value={editingZone.freeDeliveryThreshold || ''}
                  onChange={(e) =>
                    setEditingZone({
                      ...editingZone,
                      freeDeliveryThreshold: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ex : 50000"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-2 text-xs text-[#F4F1E9] font-mono outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingZone.active !== false}
                  onChange={(e) => setEditingZone({ ...editingZone, active: e.target.checked })}
                  className="accent-[#C7A747]"
                />
                <span>Zone active pour les commandes</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="px-3 py-2 bg-[#282828] text-[#F4F1E9] rounded-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold uppercase rounded-xs"
                >
                  Enregistrer
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
                COMMANDE CLIENT HP COLLECTION
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
              <p className="text-[#777D86]">Téléphone : <strong className="text-[#F4F1E9]">{selectedOrderForView.customer.phone}</strong></p>
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
                    <option value="cancelled">Annulée (Restitution au stock)</option>
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
                  placeholder="Ex : Remis au coursier moto pour Calavi"
                  className="w-full bg-[#141414] border border-[#333333] rounded-xs px-3 py-1.5 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <button
                onClick={handleUpdateOrderStatus}
                className="w-full py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
              >
                Enregistrer la mise à jour
              </button>
            </div>

            {/* Items */}
            <div className="space-y-2 pt-2 text-xs">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#777D86] block">
                Articles commandés ({selectedOrderForView.items.length})
              </span>
              {selectedOrderForView.items.map((it, idx) => (
                <div key={idx} className="p-2.5 bg-[#141414] border border-[#262626] rounded flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {it.image && (
                      <img src={it.image} alt="" className="w-10 h-12 object-cover rounded bg-[#111]" />
                    )}
                    <div>
                      <span className="font-semibold text-[#F4F1E9] block">{it.productName}</span>
                      <span className="text-[11px] text-[#777D86]">
                        Taille : {it.size} • Couleur : {it.color} • Qté : {it.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#F4F1E9]">{formatCurrency(it.total)}</span>
                </div>
              ))}
            </div>

            {/* Total summary */}
            <div className="pt-3 border-t border-[#262626] flex justify-between items-baseline text-xs font-mono">
              <span className="text-[#777D86]">Total réglé / à percevoir :</span>
              <span className="text-base font-extrabold text-[#C7A747]">
                {formatCurrency(selectedOrderForView.total)}
              </span>
            </div>

            {/* Document Generation Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForDoc(selectedOrderForView)}
                className="w-full py-2.5 bg-[#252525] hover:bg-[#303030] text-[#C7A747] border border-[#C7A747]/40 rounded-xs text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Générer Facture / Reçu Commercial Officiel (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SAFE PRODUCT DELETION CONFIRMATION */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#1c1c1c] border border-[#3d1919] rounded-sm p-6 space-y-4 shadow-2xl">
            <h3 className="font-heading text-base font-bold text-[#F4F1E9] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ff8080]" />
              <span>Supprimer cet article ?</span>
            </h3>
            <p className="text-xs text-[#777D86] leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-[#F4F1E9]">« {productToDelete.name} »</strong> ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-3 py-2 bg-[#252525] hover:bg-[#333] text-xs text-[#F4F1E9] rounded-xs transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-[#8a2424] hover:bg-[#a62b2b] text-xs text-white font-bold rounded-xs transition-colors"
              >
                Supprimer Définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SAFE CATEGORY DELETION CONFIRMATION */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-[#1c1c1c] border border-[#3d1919] rounded-sm p-6 space-y-4 shadow-2xl">
            <h3 className="font-heading text-base font-bold text-[#F4F1E9] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ff8080]" />
              <span>Supprimer cette catégorie ?</span>
            </h3>
            <p className="text-xs text-[#777D86]">
              Voulez-vous supprimer le rayon <strong className="text-[#F4F1E9]">« {categoryToDelete.name} »</strong> ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-3 py-2 bg-[#252525] text-xs text-[#F4F1E9] rounded-xs"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteCategory(categoryToDelete)}
                className="px-4 py-2 bg-[#8a2424] text-xs text-white font-bold rounded-xs"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SAFE ZONE DELETION CONFIRMATION */}
      {zoneToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-[#1c1c1c] border border-[#3d1919] rounded-sm p-6 space-y-4 shadow-2xl">
            <h3 className="font-heading text-base font-bold text-[#F4F1E9] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ff8080]" />
              <span>Supprimer cette zone ?</span>
            </h3>
            <p className="text-xs text-[#777D86]">
              Voulez-vous supprimer la zone <strong className="text-[#F4F1E9]">« {zoneToDelete.name} »</strong> ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setZoneToDelete(null)}
                className="px-3 py-2 bg-[#252525] text-xs text-[#F4F1E9] rounded-xs"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteZone(zoneToDelete)}
                className="px-4 py-2 bg-[#8a2424] text-xs text-white font-bold rounded-xs"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOTIFICATION INSPECTION & AUDIT DETAILS */}
      {selectedNotifForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedNotifForDetail(null)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-[#C7A747] tracking-wider font-bold">
                  AUDIT TRANSACTIONNEL DE NOTIFICATION
                </span>
                <span className="text-[10px] text-[#666] font-mono">ID: {selectedNotifForDetail.id}</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-[#F4F1E9] mt-0.5">
                {selectedNotifForDetail.title}
              </h3>
            </div>

            {/* Status & Provider Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              {selectedNotifForDetail.channel === 'whatsapp' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Smartphone className="w-3.5 h-3.5" /> WhatsApp Business (+229)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-sky-950 text-sky-400 border border-sky-800">
                  <Mail className="w-3.5 h-3.5" /> Email Transactionnel
                </span>
              )}

              {selectedNotifForDetail.status === 'sent' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/90 text-emerald-300 border border-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" /> Confirmé & Certifié Prestataire
                </span>
              )}
              {selectedNotifForDetail.status === 'failed' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-950 text-rose-300 border border-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5" /> Échec de délivrance
                </span>
              )}
              {selectedNotifForDetail.status === 'blocked_no_consent' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-950 text-purple-300 border border-purple-800">
                  <Lock className="w-3.5 h-3.5" /> Bloqué (Absence de consentement)
                </span>
              )}
              {selectedNotifForDetail.status === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950 text-amber-300 border border-amber-800">
                  <Clock className="w-3.5 h-3.5" /> En cours d’expédition
                </span>
              )}
            </div>

            {/* Recipient & Metadata details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#141414] border border-[#262626] rounded-xs text-xs">
              <div>
                <span className="text-[#666] text-[10px] block">Destinataire :</span>
                <span className="font-semibold text-[#F4F1E9]">{selectedNotifForDetail.recipient?.name || 'Client HP'}</span>
                <span className="text-[#888] font-mono text-[11px] block">{selectedNotifForDetail.recipient?.phone || selectedNotifForDetail.recipient?.email || 'N/A'}</span>
              </div>

              <div>
                <span className="text-[#666] text-[10px] block">Horodatage de création :</span>
                <span className="text-[#F4F1E9] font-mono text-[11px]">
                  {new Date(selectedNotifForDetail.createdAt).toLocaleString('fr-BJ')}
                </span>
              </div>

              <div>
                <span className="text-[#666] text-[10px] block">Accusé / Réf Prestataire :</span>
                <span className="text-[#C7A747] font-mono text-[11px] break-all">
                  {selectedNotifForDetail.providerMessageId || 'En attente d’attribution prestataire'}
                </span>
              </div>

              <div>
                <span className="text-[#666] text-[10px] block">Base légale (Loi Bénin 2017-20 / RGPD) :</span>
                <span className="text-[#999] font-mono text-[11px]">
                  {selectedNotifForDetail.consentLegalBasis === 'contractual_order_fulfillment'
                    ? 'Exécution d’une commande (Art. 396 Code Numérique)'
                    : 'Consentement explicite préalable'}
                </span>
              </div>

              <div>
                <span className="text-[#666] text-[10px] block">Tentatives d’envoi :</span>
                <span className="text-[#F4F1E9] font-mono text-[11px]">
                  {selectedNotifForDetail.attempts} / {selectedNotifForDetail.maxAttempts}
                </span>
              </div>

              {selectedNotifForDetail.metadata?.orderId && (
                <div>
                  <span className="text-[#666] text-[10px] block">Commande rattachée :</span>
                  <span className="text-[#C7A747] font-mono text-[11px] font-bold">
                    #{selectedNotifForDetail.metadata.orderId}
                  </span>
                </div>
              )}
            </div>

            {/* Error diagnostics if failed */}
            {selectedNotifForDetail.error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xs space-y-1">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Rapport d'erreur prestataire :</span>
                </div>
                <p className="text-xs text-rose-200 font-mono break-all leading-relaxed">
                  {selectedNotifForDetail.error}
                </p>
              </div>
            )}

            {/* Notification message body preview */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#777D86] font-bold uppercase tracking-wider block">
                Contenu du message transmis :
              </span>
              <div className="p-4 bg-[#121212] border border-[#282828] rounded-xs font-mono text-xs text-[#F4F1E9] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {selectedNotifForDetail.content}
              </div>
            </div>

            {/* Modal actions */}
            <div className="pt-2 border-t border-[#282828] flex items-center justify-between">
              <div>
                {selectedNotifForDetail.status === 'failed' && (
                  <button
                    type="button"
                    onClick={() => handleRetryNotification(selectedNotifForDetail.id)}
                    disabled={isRetryingNotifId === selectedNotifForDetail.id}
                    className="px-4 py-2 bg-[#8a2424] hover:bg-[#a62b2b] text-white text-xs font-bold rounded-xs transition-colors cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isRetryingNotifId === selectedNotifForDetail.id ? 'animate-spin' : ''}`} />
                    <span>{isRetryingNotifId === selectedNotifForDetail.id ? 'Nouvel essai en cours...' : 'Réessayer l’envoi immédiatement'}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotifForDetail(null)}
                className="px-4 py-2 bg-[#252525] hover:bg-[#333] text-xs text-[#F4F1E9] rounded-xs transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commercial Document Modal */}
      {selectedOrderForDoc && (
        <CommercialDocumentModal
          order={selectedOrderForDoc}
          isOpen={true}
          onClose={() => setSelectedOrderForDoc(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};
