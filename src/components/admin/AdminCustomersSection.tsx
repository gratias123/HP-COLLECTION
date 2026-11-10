import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  CustomerRecord,
  ContactInquiry,
  LoyaltyProgramConfig,
  LoyaltyRewardHistory,
  Order,
} from '../../types';
import {
  Search,
  Users,
  Award,
  DollarSign,
  ShoppingBag,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Tag,
  Gift,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  X,
  Plus,
  RefreshCw,
  Sliders,
  FileText,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { CommercialDocumentModal } from '../common/CommercialDocumentModal';

interface AdminCustomersSectionProps {
  adminToken: string;
  formatCurrency: (amount: number) => string;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminCustomersSection: React.FC<AdminCustomersSectionProps> = ({
  adminToken,
  formatCurrency,
  showToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'inquiries' | 'loyalty-settings'>('customers');
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyProgramConfig | null>(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyRewardHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'regular' | 'vip' | 'pending_orders' | 'claims'>('all');

  // Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Promo Code Generation Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(10);
  const [promoMinOrderAmount, setPromoMinOrderAmount] = useState<number>(15000);
  const [promoValidDays, setPromoValidDays] = useState<number>(30);
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);

  // Points Adjustment Modal
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [pointsAdjustment, setPointsAdjustment] = useState<number>(50);
  const [pointsReason, setPointsReason] = useState<string>('Geste commercial fidélité');
  const [isAdjustingPoints, setIsAdjustingPoints] = useState(false);

  // Anonymization Confirmation
  const [isAnonymizeModalOpen, setIsAnonymizeModalOpen] = useState(false);
  const [isAnonymizing, setIsAnonymizing] = useState(false);

  // Commercial Document Modal for an order clicked inside customer history
  const [documentOrder, setDocumentOrder] = useState<Order | null>(null);

  // Inquiry Response Modal
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [inquiryAdminNotes, setInquiryAdminNotes] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState<ContactInquiry['status']>('resolved');
  const [isUpdatingInquiry, setIsUpdatingInquiry] = useState(false);

  // Loyalty Config Form
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [editableConfig, setEditableConfig] = useState<LoyaltyProgramConfig | null>(null);

  const loadAll = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      const [custRes, inqRes, cfgRes, histRes] = await Promise.all([
        api.getCustomers({}, adminToken),
        api.getContactInquiries({}, adminToken),
        api.getLoyaltyConfig(adminToken),
        api.getLoyaltyHistory(adminToken),
      ]);
      setCustomers(custRes.customers || []);
      setInquiries(inqRes.inquiries || []);
      if (cfgRes.config) {
        setLoyaltyConfig(cfgRes.config);
        setEditableConfig(cfgRes.config);
      }
      setLoyaltyHistory(histRes.history || []);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du chargement des données clients', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [adminToken]);

  // KPIs strictly calculated from real records
  const totalCustomers = customers.length;
  const totalEncaisse = customers.reduce((acc, c) => acc + (c.totalPaidAmount || 0), 0);
  const regularCount = customers.filter((c) => c.tags.includes('regulier')).length;
  const activePendingOrdersCount = customers.reduce((acc, c) => acc + (c.pendingOrdersCount || 0), 0);
  const activeInquiriesCount = inquiries.filter((i) => i.status === 'pending' || i.status === 'in_progress').length;

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      c.cities.some((ct) => ct.toLowerCase().includes(q)) ||
      c.districts.some((dt) => dt.toLowerCase().includes(q)) ||
      c.addresses.some((addr) => addr.toLowerCase().includes(q));

    if (!matchQuery) return false;

    if (segmentFilter === 'regular') return c.tags.includes('regulier');
    if (segmentFilter === 'vip') return c.loyaltyTier === 'vip' || c.loyaltyTier === 'gold';
    if (segmentFilter === 'pending_orders') return (c.pendingOrdersCount || 0) > 0;
    if (segmentFilter === 'claims') return inquiries.some((inq) => inq.customerPhone === c.phone);

    return true;
  });

  const handleOpenCustomer = async (cust: CustomerRecord) => {
    setSelectedCustomer(cust);
    setIsDetailOpen(true);
  };

  const handleGeneratePromo = async () => {
    if (!selectedCustomer || !adminToken) return;
    setIsGeneratingPromo(true);
    try {
      const res = await api.createCustomerCustomPromo(selectedCustomer.id, {
        discountType: 'percentage',
        discountValue: promoDiscountPercent,
        minOrderAmount: promoMinOrderAmount,
        expiryDays: promoValidDays,
      }, adminToken);
      showToast(`Code promo personnel créé : ${res.promoCode.code} (-${res.promoCode.discountValue}%)`, 'success');
      setIsPromoModalOpen(false);
      await loadAll();
      if (selectedCustomer) {
        const updated = await api.getCustomerDetail(selectedCustomer.id, adminToken);
        setSelectedCustomer(updated.customer);
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la génération du code promo', 'error');
    } finally {
      setIsGeneratingPromo(false);
    }
  };

  const handleAdjustPoints = async () => {
    if (!selectedCustomer || !adminToken) return;
    setIsAdjustingPoints(true);
    try {
      const res = await api.adjustCustomerLoyaltyPoints(
        selectedCustomer.id,
        {
          pointsDelta: pointsAdjustment,
          reason: pointsReason,
        },
        adminToken
      );
      showToast(res.message, 'success');
      setIsPointsModalOpen(false);
      await loadAll();
      if (selectedCustomer) {
        const updated = await api.getCustomerDetail(selectedCustomer.id, adminToken);
        setSelectedCustomer(updated.customer);
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’ajustement des points', 'error');
    } finally {
      setIsAdjustingPoints(false);
    }
  };

  const handleAnonymize = async () => {
    if (!selectedCustomer || !adminToken) return;
    setIsAnonymizing(true);
    try {
      const res = await api.anonymizeCustomer(selectedCustomer.id, adminToken);
      showToast(res.message, 'success');
      setIsAnonymizeModalOpen(false);
      setIsDetailOpen(false);
      await loadAll();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’anonymisation', 'error');
    } finally {
      setIsAnonymizing(false);
    }
  };

  const handleSaveInquiry = async () => {
    if (!selectedInquiry || !adminToken) return;
    setIsUpdatingInquiry(true);
    try {
      await api.updateContactInquiry(selectedInquiry.id, {
        status: inquiryStatus,
        adminNotes: inquiryAdminNotes,
      }, adminToken);
      showToast('Demande mise à jour avec succès', 'success');
      setSelectedInquiry(null);
      await loadAll();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setIsUpdatingInquiry(false);
    }
  };

  const handleSaveLoyaltyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableConfig || !adminToken) return;
    setIsSavingConfig(true);
    try {
      const res = await api.updateLoyaltyConfig(editableConfig, adminToken);
      showToast(res.message, 'success');
      setLoyaltyConfig(res.config);
      await loadAll();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour de la fidélité', 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-5 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C7A747]">
            <Users className="w-3.5 h-3.5" />
            <span>GESTION CLIENTÈLE & PROGRAMME FIDÉLITÉ (CRM)</span>
          </div>
          <h2 className="font-heading text-lg sm:text-xl font-extrabold text-[#F4F1E9] mt-0.5">
            Répertoire Clients, Commandes & Fidélisation
          </h2>
          <p className="text-xs text-[#777D86] max-w-2xl leading-relaxed">
            Données authentiques calculées d'après les commandes réelles et paiements effectifs. Protection de la vie privée conforme aux normes de l'APDP Bénin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            disabled={isLoading}
            className="px-3 py-2 bg-[#252525] hover:bg-[#2e2e2e] text-[#F4F1E9] rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C7A747] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* 4 Real Data KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider">Clients Référencés</span>
            <Users className="w-4 h-4 text-[#C7A747]" />
          </div>
          <div className="font-heading text-2xl font-black text-[#F4F1E9]">
            {totalCustomers}
          </div>
          <span className="text-[10px] text-[#777D86] block">
            Clients uniques identifiés au Bénin
          </span>
        </div>

        <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider">Achats Réellement Encaissés</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading text-2xl font-black text-emerald-400">
            {formatCurrency(totalEncaisse)}
          </div>
          <span className="text-[10px] text-[#777D86] block">
            Paiements 'paid' strictement vérifiés
          </span>
        </div>

        <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider">Clients Réguliers & VIP</span>
            <Award className="w-4 h-4 text-[#facc15]" />
          </div>
          <div className="font-heading text-2xl font-black text-[#F4F1E9]">
            {regularCount}
          </div>
          <span className="text-[10px] text-[#777D86] block">
            Commandes répétées ou seuils atteints
          </span>
        </div>

        <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider">Commandes en cours / Réclamations</span>
            <ShoppingBag className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="font-heading text-2xl font-black text-[#F4F1E9]">
            {activePendingOrdersCount} <span className="text-xs font-normal text-[#777D86]">/ {activeInquiriesCount} récl.</span>
          </div>
          <span className="text-[10px] text-[#777D86] block">
            En préparation ou acheminement
          </span>
        </div>
      </div>

      {/* Sub-tabs: Customers / Inquiries / Loyalty Settings */}
      <div className="flex flex-wrap border-b border-[#282828] gap-4 text-xs font-bold uppercase tracking-wider pb-2">
        <button
          onClick={() => setActiveSubTab('customers')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'customers'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Fichier Clients ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inquiries')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'inquiries'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Demandes & Réclamations ({inquiries.length})</span>
          {activeInquiriesCount > 0 && (
            <span className="px-1.5 py-0.2 bg-red-900/60 text-red-300 rounded text-[10px] font-mono">
              {activeInquiriesCount} active(s)
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('loyalty-settings')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'loyalty-settings'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Programme Fidélité & Paliers</span>
        </button>
      </div>

      {/* SUB-TAB 1: CUSTOMERS DIRECTORY */}
      {activeSubTab === 'customers' && (
        <div className="space-y-4">
          {/* Search bar & filter pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-[#777D86] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, téléphone (+229), email, quartier..."
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs pl-8 pr-3 py-1.5 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value as any)}
                className="bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-1.5 rounded-xs outline-none"
              >
                <option value="all">Tous les profils</option>
                <option value="regular">Clients réguliers (2+ commandes)</option>
                <option value="vip">Membres VIP & Gold</option>
                <option value="pending_orders">Avec commande(s) en cours</option>
                <option value="claims">Avec réclamation enregistrée</option>
              </select>
            </div>

            <span className="text-xs font-mono text-[#777D86]">
              {filteredCustomers.length} client(s) affiché(s)
            </span>
          </div>

          {/* Table */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs overflow-x-auto">
            <table className="w-full text-left text-xs text-[#777D86]">
              <thead className="bg-[#161616] border-b border-[#282828] text-[11px] font-mono uppercase tracking-wider text-[#F4F1E9]">
                <tr>
                  <th className="p-3">Client</th>
                  <th className="p-3">Contact (+229)</th>
                  <th className="p-3">Statut & Palier</th>
                  <th className="p-3">Commandes</th>
                  <th className="p-3">Encaissé Réel</th>
                  <th className="p-3">Points Fidélité</th>
                  <th className="p-3">En cours</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#777D86]">
                      Aucun client ne correspond aux critères de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const tierLabel = cust.loyaltyTier.toUpperCase();
                    const isVip = cust.loyaltyTier === 'vip' || cust.loyaltyTier === 'gold';

                    return (
                      <tr key={cust.id} className="hover:bg-[#202020] transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#252525] border border-[#333] flex items-center justify-center font-bold text-[#C7A747] text-xs">
                              {cust.fullName ? cust.fullName.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <span className="font-semibold text-[#F4F1E9] block">
                                {cust.fullName || 'Client Anonymisé'}
                              </span>
                              <span className="text-[10px] text-[#777D86] font-mono">
                                Premier achat : {new Date(cust.firstOrderDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-mono">
                          <span className="text-[#F4F1E9] block">{cust.phone}</span>
                          {cust.email && <span className="text-[10px] text-[#777D86] block">{cust.email}</span>}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                isVip
                                  ? 'bg-[#3d2f13] text-[#facc15] border border-[#facc15]/30'
                                  : cust.loyaltyTier === 'silver'
                                  ? 'bg-[#252830] text-[#93c5fd]'
                                  : cust.loyaltyTier === 'bronze'
                                  ? 'bg-[#2b1f14] text-[#fdba74]'
                                  : 'bg-[#222] text-[#888]'
                              }`}
                            >
                              {tierLabel}
                            </span>
                            {cust.tags.includes('regulier') && (
                              <span className="px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 text-[9px] font-mono font-bold border border-emerald-500/30">
                                RÉGULIER
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 font-mono">
                          <span className="font-bold text-[#F4F1E9]">{cust.totalOrdersCount}</span>
                          <span className="text-[10px] text-[#777D86] ml-1">cmd</span>
                        </td>

                        <td className="p-3 font-mono font-bold text-emerald-400">
                          {formatCurrency(cust.totalPaidAmount || 0)}
                        </td>

                        <td className="p-3 font-mono">
                          <span className="text-[#C7A747] font-bold">{cust.loyaltyPoints}</span>
                          <span className="text-[10px] text-[#777D86] ml-1">pts</span>
                        </td>

                        <td className="p-3 font-mono">
                          {cust.pendingOrdersCount > 0 ? (
                            <span className="px-2 py-0.5 bg-sky-950/80 text-sky-400 rounded text-[10px] font-bold border border-sky-500/30">
                              {cust.pendingOrdersCount} en cours
                            </span>
                          ) : (
                            <span className="text-[#555] text-[11px]">—</span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleOpenCustomer(cust)}
                            className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#333333] text-[#F4F1E9] rounded text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C7A747]" />
                            <span>Fiche 360°</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INQUIRIES & CLAIMS */}
      {activeSubTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">
              Demandes de Contact, Réclamations & Questions Clients
            </h3>
            <span className="text-xs font-mono text-[#777D86]">
              {inquiries.length} demande(s) enregistrée(s)
            </span>
          </div>

          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs overflow-x-auto">
            <table className="w-full text-left text-xs text-[#777D86]">
              <thead className="bg-[#161616] border-b border-[#282828] text-[11px] font-mono uppercase tracking-wider text-[#F4F1E9]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Sujet & Message</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#777D86]">
                      Aucune réclamation ou demande de contact n'a été reçue pour le moment.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-[#202020] transition-colors">
                      <td className="p-3 font-mono text-[11px]">
                        {new Date(inq.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-[#F4F1E9] block">{inq.customerName}</span>
                        <span className="font-mono text-[10px] text-[#777D86]">{inq.customerPhone}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-[#252525] text-[#C7A747] text-[10px] font-mono uppercase">
                          {inq.type}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs">
                        <strong className="text-[#F4F1E9] block text-[11px] truncate">{inq.subject}</strong>
                        <p className="text-[11px] text-[#888] truncate">{inq.message}</p>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            inq.status === 'resolved'
                              ? 'bg-emerald-950 text-emerald-400'
                              : inq.status === 'in_progress'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-red-950 text-red-400'
                          }`}
                        >
                          {inq.status === 'resolved'
                            ? 'Résolue'
                            : inq.status === 'in_progress'
                            ? 'En cours'
                            : 'Nouvelle'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setInquiryStatus(inq.status);
                            setInquiryAdminNotes(inq.adminNotes || '');
                          }}
                          className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#333] text-[#F4F1E9] rounded text-[11px] cursor-pointer"
                        >
                          Traiter
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LOYALTY SETTINGS & RULES */}
      {activeSubTab === 'loyalty-settings' && editableConfig && (
        <form onSubmit={handleSaveLoyaltyConfig} className="bg-[#1c1c1c] border border-[#2a2a2a] p-6 rounded-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#282828] pb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-[#F4F1E9]">
                Règles de Calcul & Paliers du Programme Fidélité
              </h3>
              <p className="text-xs text-[#777D86]">
                Configurez l'attribution automatique des points, les réductions réservées et les privilèges VIP.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editableConfig.enabled}
                onChange={(e) => setEditableConfig({ ...editableConfig, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#C7A747]"
              />
              <span className="text-xs font-mono font-bold text-[#F4F1E9]">
                {editableConfig.enabled ? 'Programme Actif' : 'Programme Désactivé'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#777D86] block mb-1">
                Points attribués par tranche de 1 000 FCFA réellement payés :
              </label>
              <input
                type="number"
                min="1"
                value={editableConfig.pointsPer1000FCFA}
                onChange={(e) =>
                  setEditableConfig({ ...editableConfig, pointsPer1000FCFA: Number(e.target.value) })
                }
                className="w-full bg-[#141414] border border-[#333] p-2 text-xs font-mono text-[#F4F1E9] outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-[#777D86] block mb-1">
                Programme de fidélité actif :
              </label>
              <div className="p-2 text-xs text-[#F4F1E9] font-mono bg-[#141414] border border-[#333]">
                {editableConfig.enabled ? '✓ Activé en boutique' : 'Désactivé'}
              </div>
            </div>
          </div>

          {/* Tiers configuration */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-mono font-bold uppercase text-[#C7A747] block">
              Paliers de Dépenses Cumulées & Réductions Automatiques
            </span>

            <div className="space-y-3">
              {editableConfig.tiers.map((tier, idx) => (
                <div
                  key={tier.tier}
                  className="p-4 bg-[#141414] border border-[#2a2a2a] rounded-xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-[#F4F1E9] block">{tier.name}</span>
                    <span className="text-[10px] font-mono text-[#777D86] uppercase">{tier.tier}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777D86] block">Dépenses minimum requises :</span>
                    <span className="font-mono font-bold text-[#F4F1E9]">
                      {tier.minSpent === 0 ? 'Dès le 1er achat' : formatCurrency(tier.minSpent)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777D86] block">Remise exclusive réservée :</span>
                    <span className="font-mono font-bold text-[#C7A747]">
                      {tier.discountPercentage > 0 ? `${tier.discountPercentage}% sur toute commande` : 'Aucune'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777D86] block">Avantage :</span>
                    <span className="text-[11px] text-[#aaa]">
                      {tier.freeShipping ? '✓ Livraison offerte' : 'Tarif standard'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingConfig}
            className="px-6 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            {isSavingConfig ? 'Enregistrement...' : 'Enregistrer la configuration fidélité'}
          </button>
        </form>
      )}

      {/* ======================================================== */}
      {/* MODAL: FICHE CLIENT 360° */}
      {/* ======================================================== */}
      {isDetailOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#171717] border border-[#2e2e2e] shadow-2xl p-6 sm:p-8 rounded-sm my-auto max-h-[92vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-5 right-5 text-[#777D86] hover:text-[#F4F1E9] p-1.5 rounded-full hover:bg-[#252525] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Customer Identity Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#282828] gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#C7A747]/10 border border-[#C7A747]/40 flex items-center justify-center text-xl font-black text-[#C7A747] font-heading">
                  {selectedCustomer.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-[#F4F1E9]">
                      {selectedCustomer.fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#3d2f13] text-[#facc15] border border-[#facc15]/30">
                      {selectedCustomer.loyaltyTier.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#777D86] font-mono mt-0.5">
                    <span className="text-[#F4F1E9] font-semibold">{selectedCustomer.phone}</span>
                    {selectedCustomer.email && <span>• {selectedCustomer.email}</span>}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(true)}
                  className="px-3 py-1.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Offrir un Code Promo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPointsModalOpen(true)}
                  className="px-3 py-1.5 bg-[#252525] hover:bg-[#333] text-[#F4F1E9] font-mono text-xs rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5 text-[#C7A747]" />
                  <span>Ajuster Points</span>
                </button>
              </div>
            </div>

            {/* Financial & Delivery Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#141414] border border-[#262626]">
                <span className="text-[#777D86] block text-[10px]">TOTAL PAYÉ / ENCAISSÉ</span>
                <span className="font-heading text-base font-bold text-emerald-400 mt-1 block">
                  {formatCurrency(selectedCustomer.totalPaidAmount || 0)}
                </span>
                <span className="text-[9px] text-[#666]">Paiements certifiés</span>
              </div>

              <div className="p-3 bg-[#141414] border border-[#262626]">
                <span className="text-[#777D86] block text-[10px]">TOTAL COMMANDES</span>
                <span className="font-heading text-base font-bold text-[#F4F1E9] mt-1 block">
                  {selectedCustomer.totalOrdersCount}
                </span>
                <span className="text-[9px] text-[#666]">
                  {selectedCustomer.pendingOrdersCount} en cours d'acheminement
                </span>
              </div>

              <div className="p-3 bg-[#141414] border border-[#262626]">
                <span className="text-[#777D86] block text-[10px]">POINTS FIDÉLITÉ</span>
                <span className="font-heading text-base font-bold text-[#C7A747] mt-1 block">
                  {selectedCustomer.loyaltyPoints} pts
                </span>
                <span className="text-[9px] text-[#666]">Solde disponible</span>
              </div>

              <div className="p-3 bg-[#141414] border border-[#262626]">
                <span className="text-[#777D86] block text-[10px]">PANIER MOYEN</span>
                <span className="font-heading text-base font-bold text-[#F4F1E9] mt-1 block">
                  {selectedCustomer.totalOrdersCount > 0
                    ? formatCurrency(Math.round(selectedCustomer.totalPaidAmount / selectedCustomer.totalOrdersCount))
                    : '0 FCFA'}
                </span>
                <span className="text-[9px] text-[#666]">Par commande payée</span>
              </div>
            </div>

            {/* Saved Delivery Addresses & Quarters */}
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F4F1E9] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C7A747]" />
                <span>Adresses & Quartiers de Livraison Enregistrés</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedCustomer.cities.map((city, idx) => (
                  <div key={idx} className="p-3 bg-[#141414] border border-[#262626] rounded-xs space-y-1">
                    <span className="font-bold text-[#F4F1E9] block">
                      {city} {selectedCustomer.districts[idx] ? `• ${selectedCustomer.districts[idx]}` : ''}
                    </span>
                    {selectedCustomer.addresses[idx] && (
                      <p className="text-[#777D86] text-[11px]">{selectedCustomer.addresses[idx]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Real Orders History */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F4F1E9] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C7A747]" />
                  <span>Historique des Commandes Réelles ({selectedCustomer.orders?.length || 0})</span>
                </span>
              </h4>

              <div className="border border-[#262626] rounded-xs overflow-hidden">
                <table className="w-full text-left text-xs text-[#777D86]">
                  <thead className="bg-[#141414] border-b border-[#262626] text-[10px] font-mono uppercase text-[#F4F1E9]">
                    <tr>
                      <th className="p-2.5">N° Commande</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Articles</th>
                      <th className="p-2.5">Statut Logistique</th>
                      <th className="p-2.5">Paiement</th>
                      <th className="p-2.5">Total</th>
                      <th className="p-2.5 text-right">Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {(selectedCustomer.orders || []).map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#1f1f1f]">
                        <td className="p-2.5 font-mono font-bold text-[#C7A747]">#{ord.orderNumber}</td>
                        <td className="p-2.5 font-mono text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-2.5 text-[11px] text-[#F4F1E9]">
                          {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#242424] text-[#F4F1E9]">
                            {ord.fulfillmentStatus}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              ord.paymentStatus === 'paid'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-stone-800 text-stone-300'
                            }`}
                          >
                            {ord.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#F4F1E9]">
                          {formatCurrency(ord.total)}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => setDocumentOrder(ord)}
                            className="px-2 py-1 bg-[#252525] hover:bg-[#333] text-[#C7A747] text-[10px] font-mono font-bold rounded flex items-center gap-1 ml-auto cursor-pointer"
                            title="Générer Facture / Reçu Commercial"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Facture / Reçu</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confidentiality & Anonymization compliant with Beninese digital laws */}
            <div className="pt-4 border-t border-[#282828] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-[#777D86] text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Conformité APDP Bénin : Vos clients peuvent exercer leur droit à l'oubli et à l'effacement.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAnonymizeModalOpen(true)}
                className="px-3 py-1.5 bg-[#2a1717] hover:bg-[#3d1e1e] text-[#ff8080] rounded text-[11px] font-mono flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Anonymiser ce client (Droit à l'oubli)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE CUSTOM PROMO CODE */}
      {isPromoModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm p-6 space-y-4">
            <button
              onClick={() => setIsPromoModalOpen(false)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-base font-bold text-[#F4F1E9] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C7A747]" />
              <span>Générer un Code Promo Personnalisé</span>
            </h3>
            <p className="text-xs text-[#777D86]">
              Destiné à <strong className="text-[#F4F1E9]">{selectedCustomer.fullName}</strong> ({selectedCustomer.phone}). Le code sera automatiquement créé dans le catalogue et valable pour ses futurs achats.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#777D86] block mb-1">Pourcentage de remise (%) :</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={promoDiscountPercent}
                  onChange={(e) => setPromoDiscountPercent(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs font-mono text-[#F4F1E9] outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Montant minimum d'achat (FCFA) :</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={promoMinOrderAmount}
                  onChange={(e) => setPromoMinOrderAmount(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs font-mono text-[#F4F1E9] outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Durée de validité (jours) :</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={promoValidDays}
                  onChange={(e) => setPromoValidDays(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs font-mono text-[#F4F1E9] outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="px-3 py-2 bg-[#252525] text-[#F4F1E9] text-xs rounded-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isGeneratingPromo}
                onClick={handleGeneratePromo}
                className="px-5 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase rounded-xs"
              >
                {isGeneratingPromo ? 'Création...' : 'Créer et activer le code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST POINTS */}
      {isPointsModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm p-6 space-y-4">
            <button
              onClick={() => setIsPointsModalOpen(false)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-base font-bold text-[#F4F1E9] flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#C7A747]" />
              <span>Ajuster les Points Fidélité</span>
            </h3>
            <p className="text-xs text-[#777D86]">
              Solde actuel : <strong className="text-[#C7A747]">{selectedCustomer.loyaltyPoints} points</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#777D86] block mb-1">Variation de points (+ ou -) :</label>
                <input
                  type="number"
                  value={pointsAdjustment}
                  onChange={(e) => setPointsAdjustment(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs font-mono text-[#F4F1E9] outline-none"
                />
                <span className="text-[10px] text-[#777D86] mt-1 block">
                  Nouveau solde : {Math.max(0, selectedCustomer.loyaltyPoints + pointsAdjustment)} points
                </span>
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Motif de la récompense / ajustement :</label>
                <input
                  type="text"
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  placeholder="Ex : Récompense client fidèle Cotonou"
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPointsModalOpen(false)}
                className="px-3 py-2 bg-[#252525] text-[#F4F1E9] text-xs rounded-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isAdjustingPoints}
                onClick={handleAdjustPoints}
                className="px-5 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase rounded-xs"
              >
                {isAdjustingPoints ? 'Ajustement...' : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ANONYMIZATION CONFIRMATION */}
      {isAnonymizeModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#1c1c1c] border border-[#3d1919] rounded-sm p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-[#ff8080] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ff8080]" />
              <span>Anonymiser ce client ?</span>
            </h3>
            <p className="text-xs text-[#777D86] leading-relaxed">
              Cette action remplace le nom, prénom, email et numéro de téléphone de <strong className="text-[#F4F1E9]">{selectedCustomer.fullName}</strong> par des valeurs pseudonymisées, conformément au droit à l'effacement. L'historique comptable est conservé sans lien personnel identifiable.
            </p>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAnonymizeModalOpen(false)}
                className="px-3 py-2 bg-[#252525] text-[#F4F1E9] rounded-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isAnonymizing}
                onClick={handleAnonymize}
                className="px-4 py-2 bg-[#ff5555] hover:bg-[#e04545] text-white font-bold uppercase rounded-xs"
              >
                {isAnonymizing ? 'Traitement...' : 'Confirmer l’anonymisation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INQUIRY TREATMENT */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm p-6 space-y-4">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-base font-bold text-[#F4F1E9]">
              Traitement de la Demande #{selectedInquiry.id.slice(-6)}
            </h3>

            <div className="p-3 bg-[#141414] border border-[#262626] rounded-xs text-xs space-y-1">
              <span className="font-bold text-[#F4F1E9] block">{selectedInquiry.customerName} ({selectedInquiry.customerPhone})</span>
              <span className="text-[10px] text-[#C7A747] font-mono uppercase block">{selectedInquiry.type} • {selectedInquiry.subject}</span>
              <p className="text-[#888] pt-1">{selectedInquiry.message}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#777D86] block mb-1">Nouveau Statut :</label>
                <select
                  value={inquiryStatus}
                  onChange={(e) => setInquiryStatus(e.target.value as any)}
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs text-[#F4F1E9] outline-none"
                >
                  <option value="new">Nouvelle</option>
                  <option value="in_progress">En cours de traitement</option>
                  <option value="resolved">Résolue</option>
                  <option value="closed">Clôturée</option>
                </select>
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Notes internes & Solution apportée :</label>
                <textarea
                  rows={3}
                  value={inquiryAdminNotes}
                  onChange={(e) => setInquiryAdminNotes(e.target.value)}
                  placeholder="Ex : Contacté par téléphone, colis relivré à Akpakpa sans frais..."
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs text-[#F4F1E9] outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-3 py-2 bg-[#252525] text-[#F4F1E9] rounded-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isUpdatingInquiry}
                onClick={handleSaveInquiry}
                className="px-5 py-2 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold uppercase rounded-xs"
              >
                {isUpdatingInquiry ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMMERCIAL DOCUMENT VIEW */}
      {documentOrder && (
        <CommercialDocumentModal
          order={documentOrder}
          isOpen={true}
          onClose={() => setDocumentOrder(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};
