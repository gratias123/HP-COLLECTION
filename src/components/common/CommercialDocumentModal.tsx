import React, { useRef, useState } from 'react';
import { CommercialDocument, CommercialDocumentType, Order } from '../../types';
import {
  X,
  Printer,
  Download,
  CheckCircle,
  Clock,
  ShieldCheck,
  FileText,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
} from 'lucide-react';

interface CommercialDocumentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  initialType?: CommercialDocumentType;
  storeSettings?: any;
}

export const CommercialDocumentModal: React.FC<CommercialDocumentModalProps> = ({
  order,
  isOpen,
  onClose,
  formatCurrency,
  initialType,
  storeSettings,
}) => {
  const isPaid = order.paymentStatus === 'paid';
  const [docType, setDocType] = useState<CommercialDocumentType>(
    initialType || (isPaid ? 'receipt' : 'proforma')
  );
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const orderNumPart = order.orderNumber.replace(/[^0-9]/g, '').slice(-4) || '0001';
  let prefix = 'FAC';
  let title = 'FACTURE COMMERCIALE DE VENTE';

  if (docType === 'receipt') {
    prefix = 'REC';
    title = 'REÇU OFFICIEL DE CAISSE / FACTURE ACQUITTÉE';
  } else if (docType === 'proforma') {
    prefix = 'PRO';
    title = 'FACTURE PROFORMA (DEVIS COMMANDE)';
  } else if (docType === 'order_summary') {
    prefix = 'BC';
    title = 'RÉCAPITULATIF & BON DE COMMANDE';
  }

  const documentNumber = `${prefix}-2026-${orderNumPart}`;
  const storeName = storeSettings?.storeName || 'HP COLLECTION';
  const storeSlogan = storeSettings?.slogan || 'Ton style. Tes règles.';
  const storePhone = storeSettings?.phone || '+229 97 00 00 00';
  const storeEmail = storeSettings?.email || 'contact@hpcollection.bj';
  const storeAddress = storeSettings?.address || 'Cotonou, République du Bénin';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDocNum = () => {
    navigator.clipboard.writeText(documentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#141414] border border-[#2e2e2e] shadow-2xl flex flex-col my-auto max-h-[94vh] overflow-hidden"
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#282828] bg-[#1a1a1a] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
            <span className="text-xs font-mono font-bold text-[#C7A747] uppercase tracking-wider hidden sm:inline">
              Document :
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDocType(isPaid ? 'receipt' : 'invoice')}
                className={`px-2.5 py-1 rounded-xs border transition-all ${
                  docType === 'receipt' || docType === 'invoice'
                    ? 'bg-[#C7A747] text-[#141414] border-[#C7A747] font-bold'
                    : 'bg-[#222] text-[#888] border-[#333] hover:text-[#F4F1E9]'
                }`}
              >
                {isPaid ? 'Reçu Acquitté' : 'Facture de Vente'}
              </button>
              <button
                type="button"
                onClick={() => setDocType('proforma')}
                className={`px-2.5 py-1 rounded-xs border transition-all ${
                  docType === 'proforma'
                    ? 'bg-[#C7A747] text-[#141414] border-[#C7A747] font-bold'
                    : 'bg-[#222] text-[#888] border-[#333] hover:text-[#F4F1E9]'
                }`}
              >
                Proforma
              </button>
              <button
                type="button"
                onClick={() => setDocType('order_summary')}
                className={`px-2.5 py-1 rounded-xs border transition-all ${
                  docType === 'order_summary'
                    ? 'bg-[#C7A747] text-[#141414] border-[#C7A747] font-bold'
                    : 'bg-[#222] text-[#888] border-[#333] hover:text-[#F4F1E9]'
                }`}
              >
                Bon de commande
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#141414] font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer rounded-xs"
              title="Télécharger en PDF ou imprimer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#888] hover:text-[#F4F1E9] bg-[#222] hover:bg-[#2b2b2b] border border-[#333] rounded-xs cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container (Printable Area) */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-[#121212] flex-1 text-[#F4F1E9]">
          <div
            ref={printAreaRef}
            className="printable-document bg-[#171717] border border-[#2a2a2a] p-6 sm:p-10 max-w-3xl mx-auto shadow-xl space-y-8 font-sans print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
          >
            {/* Header: Store Identity & Document Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-[#2b2b2b] pb-6 print:border-gray-300">
              <div className="space-y-1">
                <span className="font-heading text-2xl sm:text-3xl font-black text-[#F4F1E9] print:text-black tracking-tight block">
                  {storeName}
                </span>
                <span className="text-[11px] font-mono text-[#C7A747] print:text-amber-800 uppercase tracking-widest font-bold block">
                  {storeSlogan}
                </span>
                <div className="text-xs text-[#888] print:text-gray-600 space-y-0.5 pt-2 font-light">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C7A747] print:text-gray-700 shrink-0" />
                    <span>{storeAddress}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C7A747] print:text-gray-700 shrink-0" />
                    <span>Tél / WhatsApp : {storePhone}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#C7A747] print:text-gray-700 shrink-0" />
                    <span>Email : {storeEmail}</span>
                  </p>
                </div>
              </div>

              {/* Document Identity Badge */}
              <div className="text-left sm:text-right space-y-1 sm:self-start">
                <span className="inline-block px-3 py-1 bg-[#C7A747]/15 text-[#C7A747] print:bg-gray-100 print:text-gray-900 border border-[#C7A747]/30 print:border-gray-300 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                  {docType === 'receipt'
                    ? 'Reçu de Caisse Acquitté'
                    : docType === 'proforma'
                    ? 'Facture Proforma'
                    : 'Facture de Vente'}
                </span>
                <div className="flex items-center sm:justify-end gap-1.5 font-mono text-sm font-bold text-[#F4F1E9] print:text-black">
                  <span>N° : {documentNumber}</span>
                  <button
                    type="button"
                    onClick={handleCopyDocNum}
                    className="print:hidden text-[#777] hover:text-[#C7A747]"
                    title="Copier le numéro"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-[#888] print:text-gray-600 font-mono">
                  Date d'émission : {new Date().toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-[#888] print:text-gray-600 font-mono">
                  Commande : <strong className="text-[#C7A747] print:text-black">{order.orderNumber}</strong>
                </p>
              </div>
            </div>

            {/* Client Coordinates & Delivery Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#1a1a1a] print:bg-gray-50 p-4 sm:p-5 border border-[#282828] print:border-gray-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C7A747] print:text-gray-700 font-bold block mb-1.5">
                  Destinataire / Client
                </span>
                <p className="font-heading font-bold text-sm text-[#F4F1E9] print:text-black">
                  {order.customer.fullName}
                </p>
                <p className="text-xs text-[#aaa] print:text-gray-700 font-mono mt-0.5">
                  Tél : {order.customer.phone}
                </p>
                {order.customer.email && (
                  <p className="text-xs text-[#888] print:text-gray-600 font-mono">
                    Email : {order.customer.email}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C7A747] print:text-gray-700 font-bold block mb-1.5">
                  Destination de Livraison (Bénin)
                </span>
                <p className="text-xs text-[#F4F1E9] print:text-black font-semibold">
                  {order.customer.city} — {order.customer.district}
                </p>
                <p className="text-xs text-[#aaa] print:text-gray-600 mt-0.5">
                  {order.customer.address || 'Livraison avec remise en main propre'}
                </p>
                {order.customer.notes && (
                  <p className="text-[11px] text-[#C7A747] print:text-amber-800 mt-1 italic">
                    Note coursier : « {order.customer.notes} »
                  </p>
                )}
              </div>
            </div>

            {/* Products Table (Immutable Snapshot from Order) */}
            <div>
              <div className="border border-[#282828] print:border-gray-300 overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#202020] print:bg-gray-100 text-[#F4F1E9] print:text-black border-b border-[#282828] print:border-gray-300">
                    <tr>
                      <th className="p-3">Désignation de l'Article</th>
                      <th className="p-3 text-center">Taille</th>
                      <th className="p-3 text-center">Qté</th>
                      <th className="p-3 text-right">Prix Unitaire</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626] print:divide-gray-200">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#1a1a1a] print:hover:bg-white">
                        <td className="p-3">
                          <p className="font-heading font-semibold text-[#F4F1E9] print:text-black text-xs">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-[#777] print:text-gray-500 font-mono">
                            RÉF : {item.sku} {item.color ? `• ${item.color}` : ''}
                          </p>
                        </td>
                        <td className="p-3 text-center text-[#C7A747] print:text-black font-bold">
                          {item.size}
                        </td>
                        <td className="p-3 text-center text-[#ddd] print:text-black">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right text-[#aaa] print:text-gray-700">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="p-3 text-right font-bold text-[#F4F1E9] print:text-black">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals & Payment Proof Stamp */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4 border-t border-[#282828] print:border-gray-300">
              {/* Payment Proof Badge */}
              <div className="p-4 bg-[#1a1a1a] print:bg-gray-50 border border-[#2b2b2b] print:border-gray-200 max-w-sm w-full space-y-1.5">
                <div className="flex items-center gap-2">
                  {isPaid ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#C7A747] print:text-amber-700" />
                  )}
                  <span
                    className={`font-heading font-black text-xs uppercase tracking-wider ${
                      isPaid
                        ? 'text-emerald-400 print:text-emerald-800'
                        : 'text-[#C7A747] print:text-amber-800'
                    }`}
                  >
                    {isPaid ? 'RÈGLEMENT CONFIRMÉ' : 'EN ATTENTE DE PAIEMENT'}
                  </span>
                </div>
                <p className="text-xs text-[#888] print:text-gray-600 font-mono leading-relaxed">
                  Mode de règlement :{' '}
                  <strong className="text-[#F4F1E9] print:text-black">
                    {order.paymentMethod === 'fedapay_mobile_money'
                      ? 'Mobile Money Bénin (MTN / Moov / Celtiis)'
                      : 'Espèces au coursier à la livraison'}
                  </strong>
                </p>
                {order.fedapayTransactionId && (
                  <p className="text-[10px] text-[#777] print:text-gray-500 font-mono">
                    Réf. Transaction : {order.fedapayTransactionId}
                  </p>
                )}
              </div>

              {/* Total Calculation Grid */}
              <div className="w-full sm:w-72 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#888] print:text-gray-600">
                  <span>Sous-total articles :</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-[#C7A747] print:text-emerald-700 font-bold">
                    <span>Remise {order.promoCode ? `(${order.promoCode})` : ''} :</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#888] print:text-gray-600">
                  <span>Frais de livraison ({order.shippingZone}) :</span>
                  <span>
                    {order.shippingFee === 0 ? 'Gratuit' : formatCurrency(order.shippingFee)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#333] print:border-gray-400 flex justify-between items-baseline">
                  <span className="font-heading font-black text-sm text-[#F4F1E9] print:text-black uppercase">
                    Total Net (XOF) :
                  </span>
                  <span className="font-heading font-black text-lg text-[#C7A747] print:text-black">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Commercial & Fiscal Notice for Benin */}
            <div className="pt-6 border-t border-[#262626] print:border-gray-200 text-[10px] text-[#777] print:text-gray-600 font-mono leading-relaxed text-center sm:text-left space-y-1">
              <p>
                • Justificatif commercial émis par HP COLLECTION conformément aux règles de la vente au détail en République du Bénin.
              </p>
              <p>
                • <strong>Mention réglementaire DGI Bénin :</strong> Le présent document constitue une pièce commerciale et un reçu de livraison interne. Il ne remplace pas une facture normalisée e-MCF (Machine Électronique Certifiée de Facturation) de la Direction Générale des Impôts. Aucun identifiant fiscal fictif n'est apposé.
              </p>
              <p>
                • Service après-vente : Échange de taille garanti sous 7 jours sur présentation de cette référence et restitution de l'article neuf avec étiquettes d'origine.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions for screen view */}
        <div className="print:hidden p-3.5 bg-[#181818] border-t border-[#262626] flex items-center justify-between text-xs font-mono text-[#777]">
          <span>Format A4 standard prêt pour impression ou archivage comptable</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#222] hover:bg-[#2c2c2c] text-[#F4F1E9] border border-[#333] rounded-xs font-bold uppercase tracking-wider"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
