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
  slug?: string;
  category: ProductCategory;
  description: string;
  details?: string[];
  materials?: string;
  careAdvice?: string;
  price: number; // in XOF (FCFA)
  salePrice?: number; // optional promo price in XOF
  compareAtPrice?: number; // optional original price before discount
  badge?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isNewArrival?: boolean;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  status?: 'published' | 'draft' | 'archived';
  lowStockThreshold: number;
  totalStock: number;
  createdAt: string;
  updatedAt?: string;
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
  notificationConfig?: NotificationConfig;
  loyaltyConfig?: LoyaltyProgramConfig;
  returnPolicyConfig?: ReturnPolicyConfig;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

// -------------------------------------------------------------
// CRM & GESTION DE LA CLIENTÈLE
// -------------------------------------------------------------

export type LoyaltyTier = 'standard' | 'bronze' | 'silver' | 'gold' | 'vip';

export interface LoyaltyTierConfig {
  tier: LoyaltyTier;
  name: string;
  minSpent: number; // in XOF / FCFA
  discountPercentage: number; // percentage discount (e.g. 5 for 5%)
  pointsMultiplier: number;
  freeShipping: boolean;
  perks: string;
}

export interface LoyaltyProgramConfig {
  enabled: boolean;
  pointsPer1000FCFA: number; // 1 point for every 1000 FCFA paid
  tiers: LoyaltyTierConfig[];
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  cities: string[];
  districts: string[];
  addresses: string[];
  notes?: string[];
  firstOrderDate: string;
  lastOrderDate: string;
  totalOrdersCount: number;
  completedOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  totalPaidAmount: number; // Montant des achats réellement encaissés (paymentStatus === 'paid')
  totalPendingAmount: number;
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  orderIds: string[];
  orders?: Order[];
  customPromoCodes?: string[];
  tags: ('nouveau' | 'regulier' | 'vip' | 'reclamation')[];
  inquiriesCount: number;
  lastInquiryDate?: string;
  anonymized?: boolean;
}

export type ContactInquiryType =
  | 'general'
  | 'order_inquiry'
  | 'size_exchange'
  | 'claim'
  | 'partnership';

export type ContactInquiryStatus =
  | 'pending'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface ContactInquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  type: ContactInquiryType;
  orderNumber?: string;
  subject: string;
  message: string;
  status: ContactInquiryStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface LoyaltyRewardHistory {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: 'points_earned' | 'tier_upgrade' | 'custom_promo_created' | 'manual_reward';
  description: string;
  pointsChange: number;
  promoCode?: string;
  createdAt: string;
}

// -------------------------------------------------------------
// GESTION DES RETOURS ET RÉCLAMATIONS
// -------------------------------------------------------------

export type ReturnRequestStatus =
  | 'new'           // Nouvelle demande déposée par le client
  | 'under_review'  // En cours d'examen par le service client
  | 'accepted'      // Demande acceptée (coursier mandaté pour récupération)
  | 'rejected'      // Demande refusée (motif obligatoire)
  | 'received'      // Retour physique reçu et inspecté au dépôt Cotonou
  | 'closed';       // Clôturée (échange livré ou remboursement effectué)

export type ReturnReason =
  | 'size_unfit'          // Taille trop petite ou trop grande
  | 'defective'           // Défaut textile, couture ou semelle
  | 'wrong_item'          // Mauvais article ou mauvaise couleur reçue
  | 'not_as_described'    // Non conforme aux photos / description
  | 'damaged_in_transit'  // Endommagé lors du transport par coursier
  | 'change_of_mind'      // Changement d'avis client
  | 'other';              // Autre motif

export type ReturnResolution =
  | 'exchange'      // Échange direct de taille ou modèle identique
  | 'store_credit'  // Avoir / Bon d'achat personnalisé HP COLLECTION
  | 'refund'        // Remboursement (espèces ou Mobile Money)
  | 'repair'        // Retouche ou ajustement atelier
  | 'none';

export interface ReturnItem {
  productId: string;
  productName: string;
  variantId: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  desiredExchangeSize?: string;
}

export interface ReturnHistoryEntry {
  status: ReturnRequestStatus;
  timestamp: string;
  note: string;
  updatedBy: string;
}

export interface ReturnRequest {
  id: string; // e.g. "RET-2026-1042"
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: ReturnItem[];
  reason: ReturnReason;
  description: string;
  photoUrls: string[];
  status: ReturnRequestStatus;
  resolutionProposed?: ReturnResolution;
  resolutionNotes?: string;
  refundAmount?: number;
  refundAuthorized?: boolean; // Règle stricte : Ne pas effectuer de remboursement réel sans confirmation autorisée
  refundTransactionRef?: string;
  rejectionReason?: string;
  pickupScheduledDate?: string;
  pickupAddress?: string;
  statusHistory: ReturnHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ReturnPolicyConfig {
  delayDays: number; // e.g. 7 jours après livraison
  freeExchangeInCotonou: boolean;
  conditionRequirements: string[];
  refundProcessingTime: string;
  eligibleCategories: string[];
  policyText: string;
}

// -------------------------------------------------------------
// MODULE DE DOCUMENTS COMMERCIAUX (FACTURES, REÇUS, BONS)
// -------------------------------------------------------------

export type CommercialDocumentType =
  | 'order_summary' // Récapitulatif / Bon de commande
  | 'proforma'      // Facture Proforma (si paiement en attente)
  | 'invoice'       // Facture de vente commerciale
  | 'receipt';      // Reçu officiel de caisse acquitté (si paiement confirmé)

export interface CommercialDocument {
  documentNumber: string; // Numéro unique, ex: FAC-2026-0042 ou REC-2026-0042
  type: CommercialDocumentType;
  title: string;
  issuedAt: string;
  orderId: string;
  orderNumber: string;
  storeInfo: {
    name: string;
    slogan: string;
    phone: string;
    email: string;
    address: string;
    country: string;
    legalNotice: string;
  };
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  shippingFee: number;
  shippingZone: string;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  paymentReceiptNote?: string;
  paidAt?: string;
  notes?: string;
}

// -------------------------------------------------------------
// NOTIFICATIONS & AUTOMATION SYSTEM (CLIENT & ADMIN)
// -------------------------------------------------------------

export type NotificationEventType =
  // Client notifications
  | 'client_order_received'
  | 'client_order_confirmed'
  | 'client_order_processing'
  | 'client_order_shipped'
  | 'client_order_delivered'
  // Admin notifications & alerts
  | 'admin_new_order'
  | 'admin_stock_low'
  | 'admin_stock_out'
  | 'admin_payment_confirmed'
  | 'admin_payment_failed';

export type NotificationChannel = 'email' | 'whatsapp';

export type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'retrying'
  | 'blocked_no_consent';

export type NotificationLegalBasis =
  | 'contractual_order_fulfillment' // Base légale RGPD / Code Numérique Bénin : exécution du contrat de vente
  | 'explicit_opt_in'               // Consentement explicite préalable
  | 'legitimate_interest'          // Intérêt légitime sécurité & administration
  | 'none';

export interface NotificationLog {
  id: string;
  eventType: NotificationEventType;
  recipientType: 'customer' | 'admin';
  recipient: {
    name: string;
    phone?: string;
    email?: string;
  };
  channel: NotificationChannel;
  title: string;
  content: string;
  status: NotificationStatus;
  provider: string; // e.g. 'whatsapp_cloud_api', 'smtp_mailer', 'verified_simulator'
  providerMessageId?: string;
  providerResponse?: any;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  error?: string;
  consentLegalBasis: NotificationLegalBasis;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    totalAmount?: number;
    productId?: string;
    productName?: string;
    sku?: string;
    currentStock?: number;
    threshold?: number;
    paymentMethod?: string;
    deliveryZone?: string;
    failureReason?: string;
  };
  createdAt: string;
  confirmedAt?: string;
}

export interface NotificationConfig {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  adminEmail: string;
  adminPhone: string;
  notifyClientOrderReceived: boolean;
  notifyClientOrderConfirmed: boolean;
  notifyClientOrderProcessing: boolean;
  notifyClientOrderShipped: boolean;
  notifyClientOrderDelivered: boolean;
  alertAdminNewOrder: boolean;
  alertAdminStockLow: boolean;
  alertAdminStockOut: boolean;
  alertAdminPaymentConfirmed: boolean;
  alertAdminPaymentFailed: boolean;
  whatsappProvider: 'meta_cloud_api' | 'verified_simulator';
  metaWhatsappToken?: string;
  metaPhoneNumberId?: string;
  smtpConfigured?: boolean;
}
