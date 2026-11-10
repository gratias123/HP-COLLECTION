import {
  Product,
  Order,
  PromoCode,
  DeliveryZone,
  StoreSettings,
  StockMovement,
  OrderFulfillmentStatus,
  OrderPaymentStatus,
  CategoryInfo,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_STORE_SETTINGS,
  CATEGORIES,
} from '../data/initialData';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || 'Une erreur est survenue lors de la communication avec le serveur.', response.status);
  }

  return data as T;
}

export const api = {
  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    featured?: boolean;
    sort?: string;
  }): Promise<{ products: Product[]; total: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.search) query.set('search', params.search);
      if (params?.minPrice) query.set('minPrice', params.minPrice.toString());
      if (params?.maxPrice) query.set('maxPrice', params.maxPrice.toString());
      if (params?.status) query.set('status', params.status);
      if (params?.featured) query.set('featured', 'true');
      if (params?.sort) query.set('sort', params.sort);

      const qs = query.toString();
      const res = await request<{ products: Product[]; total: number }>(`/products${qs ? `?${qs}` : ''}`);
      if (res && Array.isArray(res.products) && res.products.length > 0) {
        return res;
      }
      return { products: INITIAL_PRODUCTS, total: INITIAL_PRODUCTS.length };
    } catch (err) {
      console.warn('API getProducts unavailable, using local catalog data fallback:', err);
      let items = [...INITIAL_PRODUCTS];
      if (params?.category && params.category !== 'all') {
        items = items.filter((p) => p.category === params.category);
      }
      if (params?.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        items = items.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }
      if (params?.minPrice && !isNaN(params.minPrice)) {
        items = items.filter((p) => (p.salePrice || p.price) >= params.minPrice!);
      }
      if (params?.maxPrice && !isNaN(params.maxPrice)) {
        items = items.filter((p) => (p.salePrice || p.price) <= params.maxPrice!);
      }
      return { products: items, total: items.length };
    }
  },

  async getProduct(id: string): Promise<{ product: Product }> {
    return request<{ product: Product }>(`/products/${id}`);
  },

  async createProduct(data: Partial<Product>, token: string): Promise<{ product: Product; message: string }> {
    return request<{ product: Product; message: string }>('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: Partial<Product>, token: string): Promise<{ product: Product; message: string }> {
    return request<{ product: Product; message: string }>(`/products/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async adjustStock(
    id: string,
    variantId: string,
    adjustment: number,
    reason: string,
    token: string
  ): Promise<{ product: Product; message: string }> {
    return request<{ product: Product; message: string }>(`/products/${id}/adjust-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ variantId, adjustment, reason }),
    });
  },

  async deleteProduct(id: string, token: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updateProductStatus(
    id: string,
    status: 'published' | 'draft' | 'archived',
    token: string
  ): Promise<{ product: Product; message: string }> {
    return request<{ product: Product; message: string }>(`/products/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  },

  async uploadImage(
    file: File,
    token: string
  ): Promise<{ url: string; filename: string; message: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await request<{ url: string; filename: string; message: string }>('/admin/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ filename: file.name, base64Data }),
          });
          resolve(res);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsDataURL(file);
    });
  },

  // Categories
  async getCategories(): Promise<{ categories: CategoryInfo[] }> {
    try {
      const res = await request<{ categories: CategoryInfo[] }>('/categories');
      if (res && res.categories && res.categories.length > 0) return res;
      return { categories: CATEGORIES };
    } catch {
      return { categories: CATEGORIES };
    }
  },

  async createCategory(
    data: Partial<CategoryInfo>,
    token: string
  ): Promise<{ category: CategoryInfo; message: string }> {
    return request<{ category: CategoryInfo; message: string }>('/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async updateCategory(
    id: string,
    data: Partial<CategoryInfo>,
    token: string
  ): Promise<{ category: CategoryInfo; message: string }> {
    return request<{ category: CategoryInfo; message: string }>(`/categories/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string, token: string): Promise<{ message: string; category: CategoryInfo }> {
    return request<{ message: string; category: CategoryInfo }>(`/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Delivery Zones
  async getDeliveryZones(): Promise<{ zones: DeliveryZone[] }> {
    try {
      const res = await request<{ zones: DeliveryZone[] }>('/delivery-zones');
      if (res && res.zones && res.zones.length > 0) return res;
      return { zones: INITIAL_DELIVERY_ZONES };
    } catch {
      return { zones: INITIAL_DELIVERY_ZONES };
    }
  },

  async createDeliveryZone(zone: Partial<DeliveryZone>, token: string): Promise<{ zone: DeliveryZone; message: string }> {
    return request<{ zone: DeliveryZone; message: string }>('/delivery-zones', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(zone),
    });
  },

  async updateDeliveryZone(id: string, data: Partial<DeliveryZone>, token: string): Promise<{ zone: DeliveryZone; message: string }> {
    return request<{ zone: DeliveryZone; message: string }>(`/delivery-zones/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async deleteDeliveryZone(id: string, token: string): Promise<{ message: string; zone: DeliveryZone }> {
    return request<{ message: string; zone: DeliveryZone }>(`/delivery-zones/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Promo Codes
  async validateCoupon(code: string, cartSubtotal: number): Promise<{
    valid: boolean;
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    message: string;
  }> {
    return request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartSubtotal }),
    });
  },

  async getCoupons(token?: string): Promise<{ coupons: PromoCode[] }> {
    return request<{ coupons: PromoCode[] }>('/coupons', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async createCoupon(data: Partial<PromoCode>, token: string): Promise<{ coupon: PromoCode; message: string }> {
    return request<{ coupon: PromoCode; message: string }>('/coupons', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async updateCoupon(id: string, data: Partial<PromoCode>, token: string): Promise<{ coupon: PromoCode; message: string }> {
    return request<{ coupon: PromoCode; message: string }>(`/coupons/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async deleteCoupon(id: string, token: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/coupons/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Orders
  async createOrder(payload: {
    customer: any;
    items: any[];
    promoCode?: string;
    deliveryZoneId: string;
    paymentMethod: string;
    idempotencyKey?: string;
  }): Promise<{ order: Order; message: string; duplicateDetected?: boolean }> {
    return request<{ order: Order; message: string; duplicateDetected?: boolean }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async trackOrder(orderNumber: string, phone: string): Promise<{ order: Order }> {
    const qs = new URLSearchParams({ orderNumber, phone }).toString();
    return request<{ order: Order }>(`/orders/track?${qs}`);
  },

  async getOrders(
    params: { fulfillmentStatus?: string; paymentStatus?: string; search?: string },
    token: string
  ): Promise<{ orders: Order[]; total: number }> {
    const query = new URLSearchParams();
    if (params.fulfillmentStatus) query.set('fulfillmentStatus', params.fulfillmentStatus);
    if (params.paymentStatus) query.set('paymentStatus', params.paymentStatus);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return request<{ orders: Order[]; total: number }>(`/orders${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updateOrderStatus(
    id: string,
    payload: {
      fulfillmentStatus?: OrderFulfillmentStatus;
      paymentStatus?: OrderPaymentStatus;
      note?: string;
    },
    token: string
  ): Promise<{ order: Order; message: string }> {
    return request<{ order: Order; message: string }>(`/orders/${id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  // Payments
  async initFedaPay(orderId: string): Promise<{
    mode: 'live' | 'demo';
    isSandbox?: boolean;
    paymentUrl?: string;
    transactionId?: string;
    message?: string;
    order?: any;
  }> {
    return request('/payments/fedapay/create-transaction', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  async confirmFedaPayDemo(orderId: string, success: boolean): Promise<{ order: Order; success: boolean }> {
    return request('/payments/fedapay/confirm-demo', {
      method: 'POST',
      body: JSON.stringify({ orderId, success }),
    });
  },

  // Admin Auth & Stats
  async getAdminStatus(): Promise<{ hasAdmin: boolean; adminCount: number }> {
    return request('/admin/status');
  },

  async setupAdmin(data: { email: string; password: string; fullName: string }): Promise<{
    token: string;
    admin: { id: string; email: string; fullName: string };
    message: string;
  }> {
    return request('/admin/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async loginAdmin(data: { email: string; password: string }): Promise<{
    token: string;
    admin: { id: string; email: string; fullName: string };
  }> {
    return request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyAdmin(token: string): Promise<{ valid: boolean; admin: any }> {
    return request('/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getAdminStats(token: string): Promise<{
    kpis: {
      totalOrders: number;
      pendingOrders: number;
      inProgressOrders: number;
      deliveredOrders: number;
      cancelledOrders: number;
      totalRevenue: number;
      averageBasket: number;
    };
    bestSellers: Array<{ name: string; sku: string; unitsSold: number; revenue: number; image: string }>;
    lowStockProducts: Array<{ id: string; name: string; sku: string; totalStock: number; lowStockThreshold: number; criticalVariants: any[] }>;
    totalProducts: number;
  }> {
    return request('/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getStockHistory(token: string): Promise<{ movements: StockMovement[] }> {
    return request('/admin/stock-history', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Store Settings
  async getSettings(): Promise<{ settings: StoreSettings }> {
    try {
      const res = await request<{ settings: StoreSettings }>('/settings');
      if (res && res.settings) return res;
      return { settings: INITIAL_STORE_SETTINGS };
    } catch {
      return { settings: INITIAL_STORE_SETTINGS };
    }
  },

  async updateSettings(settings: Partial<StoreSettings>, token: string): Promise<{ settings: StoreSettings; message: string }> {
    return request('/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    });
  },

  async resetDemoData(token: string): Promise<{ message: string }> {
    return request('/admin/reset-data', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // AI Chatbot
  async sendChatMessage(
    message: string,
    history?: Array<{ role: 'user' | 'model'; text: string }>
  ): Promise<{ reply: string }> {
    return request<{ reply: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history: history || [] }),
    });
  },

  // -------------------------------------------------------------
  // NOTIFICATIONS & AUTOMATION (CLIENT & ADMIN)
  // -------------------------------------------------------------
  async getNotifications(
    token: string,
    params?: {
      eventType?: string;
      status?: string;
      channel?: string;
      search?: string;
      limit?: number;
    }
  ): Promise<{
    notifications: any[];
    total: number;
    stats: {
      total: number;
      sent: number;
      failed: number;
      pending: number;
      blocked: number;
      successRate: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params?.eventType) query.set('eventType', params.eventType);
    if (params?.status) query.set('status', params.status);
    if (params?.channel) query.set('channel', params.channel);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return request(`/admin/notifications${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async retryNotification(id: string, token: string): Promise<{ notification: any; message: string }> {
    return request(`/admin/notifications/${id}/retry`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getNotificationConfig(token: string): Promise<{ config: any }> {
    return request('/admin/notifications/config', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updateNotificationConfig(config: any, token: string): Promise<{ config: any; message: string }> {
    return request('/admin/notifications/config', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(config),
    });
  },

  async sendTestNotification(
    data: { channel: 'whatsapp' | 'email'; target: string; eventType: string },
    token: string
  ): Promise<{ notification: any; message: string }> {
    return request('/admin/notifications/test', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async clearNotificationLogs(token: string): Promise<{ message: string }> {
    return request('/admin/notifications', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // -------------------------------------------------------------
  // CRM & GESTION DE LA CLIENTÈLE
  // -------------------------------------------------------------
  async getCustomers(
    params?: { search?: string; tier?: string; status?: string },
    token?: string
  ): Promise<{
    customers: any[];
    total: number;
    stats: {
      totalCustomers: number;
      regularCustomers: number;
      vipCustomers: number;
      totalRevenuePaid: number;
      pendingOrdersCount: number;
      pendingInquiriesCount: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.tier) query.set('tier', params.tier);
    if (params?.status) query.set('status', params.status);

    const qs = query.toString();
    return request(`/admin/customers${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getCustomerDetail(
    id: string,
    token: string
  ): Promise<{ customer: any; orders: any[]; inquiries: any[]; rewards: any[] }> {
    return request(`/admin/customers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async createCustomerCustomPromo(
    customerId: string,
    data: {
      code?: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      minOrderAmount?: number;
      expiryDays?: number;
      note?: string;
    },
    token: string
  ): Promise<{ promoCode: any; message: string }> {
    return request(`/admin/customers/${customerId}/promo-code`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async adjustCustomerLoyaltyPoints(
    customerId: string,
    data: { pointsDelta: number; reason: string },
    token: string
  ): Promise<{ customer: any; message: string }> {
    return request(`/admin/customers/${customerId}/loyalty-points`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async getLoyaltyConfig(token: string): Promise<{ config: any; stats: any }> {
    return request('/admin/loyalty-config', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updateLoyaltyConfig(config: any, token: string): Promise<{ config: any; message: string }> {
    return request('/admin/loyalty-config', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(config),
    });
  },

  async getLoyaltyHistory(token: string): Promise<{ history: any[] }> {
    return request('/admin/loyalty-history', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getContactInquiries(
    params?: { search?: string; status?: string; type?: string },
    token?: string
  ): Promise<{ inquiries: any[]; stats: { total: number; pending: number; resolved: number } }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);

    const qs = query.toString();
    return request(`/admin/contact-inquiries${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updateContactInquiry(
    id: string,
    data: { status: string; adminNotes?: string },
    token: string
  ): Promise<{ inquiry: any; message: string }> {
    return request(`/admin/contact-inquiries/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async anonymizeCustomer(customerId: string, token: string): Promise<{ message: string }> {
    return request(`/admin/customers/${customerId}/anonymize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Public contact submission
  async submitContactInquiry(data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    type: string;
    orderNumber?: string;
    subject: string;
    message: string;
  }): Promise<{ inquiry: any; message: string }> {
    return request('/contact-inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // -------------------------------------------------------------
  // DOCUMENTS COMMERCIAUX (FACTURES & REÇUS)
  // -------------------------------------------------------------
  async getCommercialDocument(
    orderId: string,
    type?: string,
    phone?: string
  ): Promise<{ document: any }> {
    const query = new URLSearchParams();
    if (type) query.set('type', type);
    if (phone) query.set('phone', phone);
    const qs = query.toString();
    return request(`/orders/${orderId}/document${qs ? `?${qs}` : ''}`);
  },

  // -------------------------------------------------------------
  // GESTION DES RETOURS & RÉCLAMATIONS
  // -------------------------------------------------------------
  async getReturnPolicy(): Promise<{ policy: any }> {
    return request('/returns/policy');
  },

  async lookupOrderForReturn(orderNumber: string, phone: string): Promise<{ order: any }> {
    const query = new URLSearchParams({ orderNumber, phone });
    return request(`/returns/lookup-order?${query.toString()}`);
  },

  async submitReturnRequest(data: {
    orderNumber: string;
    customerPhone: string;
    customerName?: string;
    customerEmail?: string;
    items: any[];
    reason: string;
    description: string;
    photoUrls?: string[];
    pickupAddress?: string;
  }): Promise<{ returnRequest: any; message: string }> {
    return request('/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async trackReturn(ref: string): Promise<{ returnRequest: any }> {
    return request(`/returns/track/${encodeURIComponent(ref)}`);
  },

  async getAdminReturns(
    params?: { search?: string; status?: string; reason?: string },
    token?: string
  ): Promise<{ returns: any[]; stats: any }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.reason) query.set('reason', params.reason);

    const qs = query.toString();
    return request(`/admin/returns${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getAdminReturnDetail(
    id: string,
    token: string
  ): Promise<{ returnRequest: any; order: any }> {
    return request(`/admin/returns/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updateReturnStatus(
    id: string,
    data: {
      status?: string;
      note?: string;
      resolutionProposed?: string;
      resolutionNotes?: string;
      rejectionReason?: string;
      pickupScheduledDate?: string;
    },
    token: string
  ): Promise<{ returnRequest: any; message: string }> {
    return request(`/admin/returns/${id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async authorizeReturnRefund(
    id: string,
    data: {
      confirmed: boolean;
      refundAmount: number;
      authorizationRef: string;
      note?: string;
    },
    token: string
  ): Promise<{ returnRequest: any; message: string }> {
    return request(`/admin/returns/${id}/authorize-refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async updateReturnPolicy(policy: any, token: string): Promise<{ policy: any; message: string }> {
    return request('/admin/returns/policy', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(policy),
    });
  },
};
