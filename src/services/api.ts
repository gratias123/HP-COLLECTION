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
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.minPrice) query.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice) query.set('maxPrice', params.maxPrice.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.featured) query.set('featured', 'true');
    if (params?.sort) query.set('sort', params.sort);

    const qs = query.toString();
    return request<{ products: Product[]; total: number }>(`/products${qs ? `?${qs}` : ''}`);
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
    return request<{ categories: CategoryInfo[] }>('/categories');
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
    return request<{ zones: DeliveryZone[] }>('/delivery-zones');
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
  }): Promise<{ order: Order; message: string }> {
    return request<{ order: Order; message: string }>('/orders', {
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
    return request('/settings');
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
};
