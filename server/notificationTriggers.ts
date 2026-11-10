import { NotificationEngine } from './notificationEngine';
import {
  NotificationLog,
  Order,
  Product,
  NotificationEventType,
} from '../src/types';

export class NotificationOrchestrator {
  private engine: NotificationEngine;

  constructor(engine: NotificationEngine) {
    this.engine = engine;
  }

  // --------------------------------------------------------------------------
  // CLIENT NOTIFICATIONS
  // --------------------------------------------------------------------------

  /**
   * 1. Confirmation de réception de commande (Client)
   */
  public async notifyClientOrderReceived(
    order: Order,
    customerConsentProvided: boolean = true
  ): Promise<NotificationLog[]> {
    const config = this.engine.getConfig();
    if (!config.notifyClientOrderReceived) return [];

    const logs: NotificationLog[] = [];
    const title = `HP COLLECTION — Réception de votre commande #${order.orderNumber}`;
    const itemsList = order.items
      .map((it) => `• ${it.quantity}x ${it.productName} (Taille ${it.size}) - ${it.total.toLocaleString('fr-FR')} FCFA`)
      .join('\n');

    const content = `Bonjour ${order.customer.fullName},\n\nNous avons bien reçu votre commande #${order.orderNumber} d’un montant de ${order.total.toLocaleString('fr-FR')} FCFA pour livraison à ${order.customer.city} (${order.customer.district}).\n\nArticles commandés :\n${itemsList}\n\nMode : ${order.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Mobile Money'}\nNotre coursier vous contactera avant la livraison.\n\nHP COLLECTION — Ton style. Tes règles.`;

    // WhatsApp
    if (order.customer.phone) {
      const log = await this.engine.dispatchNotification({
        eventType: 'client_order_received',
        recipientType: 'customer',
        recipient: {
          name: order.customer.fullName,
          phone: order.customer.phone,
        },
        channel: 'whatsapp',
        title,
        content,
        consentLegalBasis: 'contractual_order_fulfillment',
        customerConsentProvided,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.total,
          deliveryZone: order.shippingZone,
          paymentMethod: order.paymentMethod,
        },
      });
      logs.push(log);
    }

    // Email (if customer provided email)
    if (order.customer.email) {
      const log = await this.engine.dispatchNotification({
        eventType: 'client_order_received',
        recipientType: 'customer',
        recipient: {
          name: order.customer.fullName,
          email: order.customer.email,
        },
        channel: 'email',
        title,
        content,
        consentLegalBasis: 'contractual_order_fulfillment',
        customerConsentProvided,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.total,
          deliveryZone: order.shippingZone,
          paymentMethod: order.paymentMethod,
        },
      });
      logs.push(log);
    }

    return logs;
  }

  /**
   * 2. Notifications de changement d'état logistique pour le client
   * - Confirmation de commande
   * - En préparation
   * - Expédiée
   * - Livrée
   */
  public async notifyClientFulfillmentStatus(
    order: Order,
    newStatus: string
  ): Promise<NotificationLog[]> {
    const config = this.engine.getConfig();
    let eventType: NotificationEventType | null = null;
    let title = '';
    let message = '';

    if (newStatus === 'confirmed' && config.notifyClientOrderConfirmed) {
      eventType = 'client_order_confirmed';
      title = `HP COLLECTION — Votre commande #${order.orderNumber} est Confirmée !`;
      message = `Bonjour ${order.customer.fullName},\n\nBonne nouvelle : votre commande #${order.orderNumber} a été validée par notre équipe commerciale à Cotonou. Elle passe maintenant au pôle préparation.\n\nAdresse de livraison : ${order.customer.city}, ${order.customer.district}.\nMontant total : ${order.total.toLocaleString('fr-FR')} FCFA.`;
    } else if (newStatus === 'processing' && config.notifyClientOrderProcessing) {
      eventType = 'client_order_processing';
      title = `HP COLLECTION — Préparation en cours pour la commande #${order.orderNumber}`;
      message = `Bonjour ${order.customer.fullName},\n\nVotre commande #${order.orderNumber} est actuellement minutieusement préparée, inspectée et emballée dans notre atelier à Cotonou.\n\nProchaine étape : remise au coursier moto pour la livraison.`;
    } else if (newStatus === 'shipped' && config.notifyClientOrderShipped) {
      eventType = 'client_order_shipped';
      title = `HP COLLECTION — Votre colis #${order.orderNumber} est en cours de livraison !`;
      message = `Bonjour ${order.customer.fullName},\n\nVotre colis #${order.orderNumber} est en route ! Notre coursier dédié a pris en charge votre commande et se dirige vers ${order.customer.city} (${order.customer.district}).\n\nMerci de garder votre téléphone (${order.customer.phone}) allumé. En cas de besoin, vous pouvez également essayer vos articles au déballage.`;
    } else if (newStatus === 'delivered' && config.notifyClientOrderDelivered) {
      eventType = 'client_order_delivered';
      title = `HP COLLECTION — Colis #${order.orderNumber} Livré ! Merci de votre confiance`;
      message = `Bonjour ${order.customer.fullName},\n\nVotre commande #${order.orderNumber} a été remise en main propre avec succès. Nous espérons que vos nouvelles pièces HP COLLECTION vous apporteront entière satisfaction !\n\nN’hésitez pas à partager votre look sur Instagram en nous taguant @hpcollection.bj. Ton style. Tes règles.`;
    }

    if (!eventType) return [];

    const logs: NotificationLog[] = [];

    // Send WhatsApp
    if (order.customer.phone) {
      const log = await this.engine.dispatchNotification({
        eventType,
        recipientType: 'customer',
        recipient: {
          name: order.customer.fullName,
          phone: order.customer.phone,
        },
        channel: 'whatsapp',
        title,
        content: message,
        consentLegalBasis: 'contractual_order_fulfillment',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.total,
          deliveryZone: order.shippingZone,
        },
      });
      logs.push(log);
    }

    // Send Email if email exists
    if (order.customer.email) {
      const log = await this.engine.dispatchNotification({
        eventType,
        recipientType: 'customer',
        recipient: {
          name: order.customer.fullName,
          email: order.customer.email,
        },
        channel: 'email',
        title,
        content: message,
        consentLegalBasis: 'contractual_order_fulfillment',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.total,
          deliveryZone: order.shippingZone,
        },
      });
      logs.push(log);
    }

    return logs;
  }

  // --------------------------------------------------------------------------
  // ADMIN ALERTS & NOTIFICATIONS
  // --------------------------------------------------------------------------

  /**
   * Alerte administrateur à chaque nouvelle commande
   */
  public async alertAdminNewOrder(order: Order): Promise<NotificationLog[]> {
    const config = this.engine.getConfig();
    if (!config.alertAdminNewOrder) return [];

    const title = `🚨 [ADMIN HP] Nouvelle Commande #${order.orderNumber}`;
    const itemsSummary = order.items
      .map((i) => `${i.quantity}x ${i.productName} (${i.size} - ${i.color})`)
      .join(', ');

    const content = `Nouvelle commande enregistrée sur HP COLLECTION !\n\n• Référence : #${order.orderNumber}\n• Client : ${order.customer.fullName} (${order.customer.phone})\n• Destination : ${order.customer.city} (${order.customer.district})\n• Montant : ${order.total.toLocaleString('fr-FR')} FCFA\n• Mode : ${order.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Mobile Money'}\n• Articles : ${itemsSummary}\n\nVérifiez la commande dans le tableau de bord administrateur.`;

    const logs: NotificationLog[] = [];

    // Admin WhatsApp
    if (config.adminPhone) {
      const log = await this.engine.dispatchNotification({
        eventType: 'admin_new_order',
        recipientType: 'admin',
        recipient: {
          name: 'Direction HP COLLECTION',
          phone: config.adminPhone,
        },
        channel: 'whatsapp',
        title,
        content,
        consentLegalBasis: 'legitimate_interest',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.total,
          deliveryZone: order.shippingZone,
          paymentMethod: order.paymentMethod,
        },
      });
      logs.push(log);
    }

    // Admin Email
    if (config.adminEmail) {
      const log = await this.engine.dispatchNotification({
        eventType: 'admin_new_order',
        recipientType: 'admin',
        recipient: {
          name: 'Direction HP COLLECTION',
          email: config.adminEmail,
        },
        channel: 'email',
        title,
        content,
        consentLegalBasis: 'legitimate_interest',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.total,
          deliveryZone: order.shippingZone,
          paymentMethod: order.paymentMethod,
        },
      });
      logs.push(log);
    }

    return logs;
  }

  /**
   * Alerte stock faible & rupture de stock
   */
  public async alertAdminStockLevels(
    product: Product,
    variant: { id: string; size: string; color: string; stock: number; sku: string }
  ): Promise<NotificationLog[]> {
    const config = this.engine.getConfig();
    const logs: NotificationLog[] = [];

    if (variant.stock <= 0 && config.alertAdminStockOut) {
      // Stockout Alert
      const title = `🛑 [RUPTURE STOCK] ${product.name} (${variant.size})`;
      const content = `Alerte Critique : Rupture de stock immédiate sur HP COLLECTION !\n\nProduit : ${product.name}\nVariante : Taille ${variant.size} - Couleur ${variant.color}\nSKU : ${variant.sku}\nStock actuel : 0 exemplaire.\n\nAction : Réapprovisionner ou dépublier cette taille dans le catalogue.`;

      const log = await this.engine.dispatchNotification({
        eventType: 'admin_stock_out',
        recipientType: 'admin',
        recipient: {
          name: 'Direction HP COLLECTION',
          phone: config.adminPhone,
          email: config.adminEmail,
        },
        channel: 'whatsapp',
        title,
        content,
        consentLegalBasis: 'legitimate_interest',
        metadata: {
          productId: product.id,
          productName: product.name,
          sku: variant.sku,
          currentStock: 0,
        },
      });
      logs.push(log);
    } else if (variant.stock <= product.lowStockThreshold && config.alertAdminStockLow) {
      // Low Stock Alert
      const title = `⚠️ [STOCK FAIBLE] ${product.name} (${variant.size})`;
      const content = `Attention : Stock faible détecté sur HP COLLECTION.\n\nProduit : ${product.name}\nVariante : Taille ${variant.size} - Couleur ${variant.color}\nSKU : ${variant.sku}\nStock restant : ${variant.stock} exemplaire(s) (Seuil d'alerte : ${product.lowStockThreshold}).\n\nPrévoyez le réapprovisionnement.`;

      const log = await this.engine.dispatchNotification({
        eventType: 'admin_stock_low',
        recipientType: 'admin',
        recipient: {
          name: 'Direction HP COLLECTION',
          phone: config.adminPhone,
          email: config.adminEmail,
        },
        channel: 'whatsapp',
        title,
        content,
        consentLegalBasis: 'legitimate_interest',
        metadata: {
          productId: product.id,
          productName: product.name,
          sku: variant.sku,
          currentStock: variant.stock,
          threshold: product.lowStockThreshold,
        },
      });
      logs.push(log);
    }

    return logs;
  }

  /**
   * Notification des paiements confirmés (serveur fiable)
   */
  public async alertAdminPaymentConfirmed(
    order: Order,
    source: string = 'FedaPay Mobile Money Webhook'
  ): Promise<NotificationLog[]> {
    const config = this.engine.getConfig();
    if (!config.alertAdminPaymentConfirmed) return [];

    const title = `✅ [PAIEMENT VALIDÉ] Commande #${order.orderNumber}`;
    const content = `Paiement certifié côté serveur pour la commande #${order.orderNumber}.\n\n• Montant certifié : ${order.total.toLocaleString('fr-FR')} FCFA\n• Client : ${order.customer.fullName} (${order.customer.phone})\n• Source de validation : ${source}\n• Transaction ID : ${order.fedapayTransactionId || 'N/A'}\n\nLa commande peut être préparée et expédiée.`;

    const logs: NotificationLog[] = [];

    if (config.adminPhone) {
      const log = await this.engine.dispatchNotification({
        eventType: 'admin_payment_confirmed',
        recipientType: 'admin',
        recipient: {
          name: 'Direction HP COLLECTION',
          phone: config.adminPhone,
        },
        channel: 'whatsapp',
        title,
        content,
        consentLegalBasis: 'legitimate_interest',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.total,
          paymentMethod: order.paymentMethod,
        },
      });
      logs.push(log);
    }

    return logs;
  }

  /**
   * Signalement des paiements échoués
   */
  public async alertAdminPaymentFailed(
    order: Order,
    reason: string = 'Refus opérateur Mobile Money ou solde insuffisant'
  ): Promise<NotificationLog[]> {
    const config = this.engine.getConfig();
    if (!config.alertAdminPaymentFailed) return [];

    const title = `❌ [ÉCHEC PAIEMENT] Commande #${order.orderNumber}`;
    const content = `Alerte : Le paiement pour la commande #${order.orderNumber} a échoué.\n\n• Montant : ${order.total.toLocaleString('fr-FR')} FCFA\n• Client : ${order.customer.fullName} (${order.customer.phone})\n• Motif de l'échec : ${reason}\n\nUne relance client manuelle ou proposition de paiement à la livraison est recommandée.`;

    const logs: NotificationLog[] = [];

    if (config.adminPhone) {
      const log = await this.engine.dispatchNotification({
        eventType: 'admin_payment_failed',
        recipientType: 'admin',
        recipient: {
          name: 'Direction HP COLLECTION',
          phone: config.adminPhone,
        },
        channel: 'whatsapp',
        title,
        content,
        consentLegalBasis: 'legitimate_interest',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.total,
          failureReason: reason,
        },
      });
      logs.push(log);
    }

    return logs;
  }
}
