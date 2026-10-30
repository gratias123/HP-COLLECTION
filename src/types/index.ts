export type ProductCategory =
  | 'survetements'
  | 'sneakers'
  | 'basket'
  | 'tshirts'
  | 'hoodies'
  | 'varsity'
  | 'pantalons'
  | 'accessoires';

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  description: string;
  iconName: string;
}

export interface LookbookOutfit {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  productIds: string[];
  description: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string;
  details?: string[];
  materials?: string;
  careAdvice?: string;
  price: number; // in XOF (FCFA)
  salePrice?: number; // optional promo price in XOF
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  status: 'published' | 'draft' | 'archived';
  isFeatured?: boolean;
  isNewArrival?: boolean;
  lowStockThreshold: number;
  totalStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
  maxStock: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (e.g. 10 for 10%) or fixed XOF (e.g. 5000)
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  expiryDate?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  cities: string[];
  fee: number; // in XOF
  estimatedTime: string; // e.g. "24h - 48h"
  freeDeliveryThreshold?: number; // order amount for free delivery
  description?: string;
  active: boolean;
}

export type OrderFulfillmentStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderPaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export type PaymentMethod =
  | 'cod' // Cash on Delivery (Paiement à la livraison)
  | 'fedapay_mobile_money'; // FedaPay (MTN, Moov, Celtiis)

export interface CustomerInfo {
  fullName: string;
  phone: string; // Bénin phone number
  email?: string;
  city: string; // Cotonou, Calavi, Porto-Novo, etc.
  district: string; // Quartier: Cadjehoun, Akpakpa, Haie Vive, Tankpè, etc.
  address: string; // Rue, repère ou point de livraison
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  variantId: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  total: number;
  image: string;
}

export interface StatusHistoryEntry {
  status: OrderFulfillmentStatus | OrderPaymentStatus;
  type: 'fulfillment' | 'payment';
  timestamp: string;
  note?: string;
  updatedBy: string;
}

export interface Order {
  id: string; // e.g. "HPC-2026-8942"
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  shippingFee: number;
  shippingZone: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  fedapayTransactionId?: string;
  idempotencyKey?: string;
  statusHistory: StatusHistoryEntry[];
}

export interface StockMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  variantId: string;
  variantSku: string;
  change: number; // + for restock, - for order or loss
  newStock: number;
  type: 'order' | 'restock' | 'adjustment';
  orderId?: string;
  reason?: string;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  announcementText: string;
  announcementActive: boolean;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  fedapayPublicKey?: string;
  fedapaySecretKey?: string;
  fedapaySandbox: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
}
