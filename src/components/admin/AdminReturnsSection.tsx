import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ReturnRequest,
  ReturnPolicyConfig,
  ReturnRequestStatus,
  ReturnResolution,
} from '../../types';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  X,
  RefreshCw,
  Sliders,
  DollarSign,
  Package,
  Phone,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface AdminReturnsSectionProps {
  adminToken: string;
  formatCurrency: (amount: number) => string;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminReturnsSection: React.FC<AdminReturnsSectionProps> = ({
  adminToken,
  formatCurrency,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'returns-list' | 'policy-editor'>('returns-list');
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [policy, setPolicy] = useState<ReturnPolicyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Return for Review Modal
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [newStatus, setNewStatus] = useState<ReturnRequestStatus>('under_review');
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [proposedSolution, setProposedSolution] = useState<ReturnResolution>('exchange');
  const [solutionDetails, setSolutionDetails] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Strict Refund Authorization Modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundAuthCode, setRefundAuthCode] = useState('');
  const [operatorConfirmation, setOperatorConfirmation] = useState(false);
  const [isAuthorizingRefund, setIsAuthorizingRefund] = useState(false);

  // Policy Form state
  const [policyForm, setPolicyForm] = useState<ReturnPolicyConfig | null>(null);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  const loadData = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      const [returnsRes, policyRes] = await Promise.all([
        api.getAdminReturns({}, adminToken),
        api.getReturnPolicy(),
      ]);
      setReturns(returnsRes.returns || []);
      if (policyRes.policy) {
        setPolicy(policyRes.policy);
        setPolicyForm(policyRes.policy);
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du chargement des retours', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminToken]);

  const filteredReturns = returns.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      r.returnNumber.toLowerCase().includes(q) ||
      r.orderNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerPhone.includes(q);

    const matchS = statusFilter === 'all' || r.status === statusFilter;
    return matchQ && matchS;
  });

  const countNew = returns.filter((r) => r.status === 'new').length;
  const countReviewing = returns.filter((r) => r.status === 'under_review').length;
  const countAccepted = returns.filter((r) => r.status === 'accepted').length;
  const countReceived = returns.filter((r) => r.status === 'received').length;

  const handleOpenDetail = (ret: ReturnRequest) => {
    setSelectedReturn(ret);
    setNewStatus(ret.status);
    setAdminNote('');
    setRejectionReason(ret.rejectionReason || '');
    setProposedSolution(ret.resolutionProposed || 'exchange');
    setSolutionDetails(ret.resolutionNotes || '');
    setRefundAmount(ret.refundAmount || ret.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0));
  };

  const handleSaveStatus = async () => {
    if (!selectedReturn || !adminToken) return;

    if (newStatus === 'rejected' && !rejectionReason.trim()) {
      showToast('Veuillez obligatoirement renseigner un motif explicite de refus', 'error');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await api.updateReturnStatus(
        selectedReturn.id,
        {
          status: newStatus,
          note: adminNote,
          rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined,
          resolutionProposed: proposedSolution,
          resolutionNotes: solutionDetails,
        },
        adminToken
      );
      showToast(res.message, 'success');
      setSelectedReturn(res.returnRequest);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du dossier', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Strictly authorized refund commit
  const handleConfirmAuthorizedRefund = async () => {
    if (!selectedReturn || !adminToken) return;
    if (!operatorConfirmation) {
      showToast("Veuillez cocher l'engagement de vérification de l'opération", 'error');
      return;
    }
    if (refundAmount <= 0) {
      showToast('Le montant à rembourser doit être supérieur à zéro', 'error');
      return;
    }
    if (!refundAuthCode.trim()) {
      showToast("Veuillez saisir la référence ou le code d'autorisation de la transaction", 'error');
      return;
    }

    setIsAuthorizingRefund(true);
    try {
      const res = await api.authorizeReturnRefund(
        selectedReturn.id,
        {
          confirmed: operatorConfirmation,
          refundAmount,
          authorizationRef: refundAuthCode,
          note: 'Remboursement validé avec référence bancaire / Mobile Money',
        },
        adminToken
      );
      showToast(res.message, 'success');
      setIsRefundModalOpen(false);
      setSelectedReturn(res.returnRequest);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Échec de l’autorisation de remboursement', 'error');
    } finally {
      setIsAuthorizingRefund(false);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyForm || !adminToken) return;
    setIsSavingPolicy(true);
    try {
      const res = await api.updateReturnPolicy(policyForm, adminToken);
      showToast(res.message, 'success');
      setPolicy(res.policy);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la sauvegarde de la politique', 'error');
    } finally {
      setIsSavingPolicy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-5 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C7A747]">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>MODULE GESTION DES RETOURS & RÉCLAMATIONS CLIENTS</span>
          </div>
          <h2 className="font-heading text-lg sm:text-xl font-extrabold text-[#F4F1E9] mt-0.5">
            Suivi des Échanges de Tailles, Réclamations & Remboursements
          </h2>
          <p className="text-xs text-[#777D86] max-w-2xl leading-relaxed">
            Audit complet du cycle de vie du retour. Aucune opération de remboursement réel n'est effectuée sans confirmation explicite et code d'autorisation certifié.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3 py-2 bg-[#252525] hover:bg-[#2e2e2e] text-[#F4F1E9] rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C7A747] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* 4 Status KPI metric counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
          <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider block">
            Nouvelles Demandes
          </span>
          <div className="font-heading text-2xl font-black text-amber-400">
            {countNew}
          </div>
          <span className="text-[10px] text-[#777D86] block">
            À examiner en priorité
          </span>
        </div>

        <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
          <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider block">
            En Cours d'Examen
          </span>
          <div className="font-heading text-2xl font-black text-[#38bdf8]">
            {countReviewing}
          </div>
          <span className="text-[10px] text-[#777D86] block">
            Diagnostic atelier ou contact
          </span>
        </div>

        <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
          <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider block">
            Acceptées / En Route
          </span>
          <div className="font-heading text-2xl font-black text-emerald-400">
            {countAccepted}
          </div>
          <span className="text-[10px] text-[#777D86] block">
            En attente de reprise coursier
          </span>
        </div>

        <div className="p-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-1">
          <span className="text-[11px] font-mono text-[#777D86] uppercase tracking-wider block">
            Colis Reçus à l'Atelier
          </span>
          <div className="font-heading text-2xl font-black text-[#C7A747]">
            {countReceived}
          </div>
          <span className="text-[10px] text-[#777D86] block">
            Prêts pour réexpédition ou clôture
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap border-b border-[#282828] gap-4 text-xs font-bold uppercase tracking-wider pb-2">
        <button
          onClick={() => setActiveTab('returns-list')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'returns-list'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Liste des Dossiers de Retour ({returns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('policy-editor')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'policy-editor'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Politique & Règles de Remboursement Bénin</span>
        </button>
      </div>

      {/* SUB-TAB 1: RETURNS LIST */}
      {activeTab === 'returns-list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-[#777D86] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="N° dossier (RET-...), commande, nom, tél..."
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs pl-8 pr-3 py-1.5 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#141414] border border-[#333333] text-xs text-[#F4F1E9] px-2 py-1.5 rounded-xs outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="new">Nouvelle demande</option>
                <option value="under_review">En cours d'examen</option>
                <option value="accepted">Acceptée</option>
                <option value="rejected">Refusée</option>
                <option value="received">Retour reçu</option>
                <option value="closed">Clôturée</option>
              </select>
            </div>

            <span className="text-xs font-mono text-[#777D86]">
              {filteredReturns.length} dossier(s)
            </span>
          </div>

          {/* Table */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs overflow-x-auto">
            <table className="w-full text-left text-xs text-[#777D86]">
              <thead className="bg-[#161616] border-b border-[#282828] text-[11px] font-mono uppercase tracking-wider text-[#F4F1E9]">
                <tr>
                  <th className="p-3">Dossier & Date</th>
                  <th className="p-3">Commande</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Articles</th>
                  <th className="p-3">Motif</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#777D86]">
                      Aucun dossier de retour correspondant.
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-[#202020] transition-colors">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-[#C7A747] block">#{ret.returnNumber}</span>
                        <span className="text-[10px] text-[#777D86]">
                          {new Date(ret.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </td>

                      <td className="p-3 font-mono font-bold text-[#F4F1E9]">
                        #{ret.orderNumber}
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-[#F4F1E9] block">{ret.customerName}</span>
                        <span className="text-[10px] text-[#777D86] font-mono">{ret.customerPhone}</span>
                      </td>

                      <td className="p-3">
                        <span className="text-[#F4F1E9] block">
                          {ret.items.map((it) => it.productName).join(', ')}
                        </span>
                        <span className="text-[10px] text-[#777D86]">
                          {ret.items.reduce((s, it) => s + it.quantity, 0)} pièce(s)
                        </span>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-[#aaa]">
                        {ret.reason === 'size_unfit'
                          ? 'Échange pointure'
                          : ret.reason === 'defective'
                          ? 'Défaut constaté'
                          : ret.reason === 'wrong_item'
                          ? 'Erreur article'
                          : ret.reason}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            ret.status === 'accepted'
                              ? 'bg-emerald-950 text-emerald-400'
                              : ret.status === 'received'
                              ? 'bg-sky-950 text-sky-400'
                              : ret.status === 'closed'
                              ? 'bg-stone-800 text-stone-300'
                              : ret.status === 'rejected'
                              ? 'bg-red-950 text-red-400'
                              : ret.status === 'under_review'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-purple-950 text-purple-300'
                          }`}
                        >
                          {ret.status === 'new'
                            ? 'Nouvelle'
                            : ret.status === 'under_review'
                            ? 'En examen'
                            : ret.status === 'accepted'
                            ? 'Acceptée'
                            : ret.status === 'rejected'
                            ? 'Refusée'
                            : ret.status === 'received'
                            ? 'Retour reçu'
                            : 'Clôturée'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenDetail(ret)}
                          className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#333] text-[#F4F1E9] rounded text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C7A747]" />
                          <span>Instruire</span>
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

      {/* SUB-TAB 2: RETURN POLICY EDITOR */}
      {activeTab === 'policy-editor' && policyForm && (
        <form onSubmit={handleSavePolicy} className="bg-[#1c1c1c] border border-[#2a2a2a] p-6 rounded-xs space-y-6">
          <div className="border-b border-[#282828] pb-4">
            <h3 className="font-heading text-base font-bold text-[#F4F1E9]">
              Configuration des Règles de Retour & Remboursement (Bénin)
            </h3>
            <p className="text-xs text-[#777D86]">
              Ces informations sont directement accessibles et lisibles par vos clients sur leur espace public.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[#777D86] block mb-1">Délai limite de retour (jours après réception) :</label>
              <input
                type="number"
                min="1"
                max="30"
                value={policyForm.delayDays}
                onChange={(e) =>
                  setPolicyForm({ ...policyForm, delayDays: Number(e.target.value) })
                }
                className="w-full bg-[#141414] border border-[#333] p-2 text-xs font-mono text-[#F4F1E9] outline-none"
              />
            </div>

            <div>
              <label className="text-[#777D86] block mb-1">Délai moyen de traitement du remboursement :</label>
              <input
                type="text"
                value={policyForm.refundProcessingTime}
                onChange={(e) =>
                  setPolicyForm({ ...policyForm, refundProcessingTime: e.target.value })
                }
                className="w-full bg-[#141414] border border-[#333] p-2 text-xs text-[#F4F1E9] outline-none"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyForm.freeExchangeInCotonou}
                  onChange={(e) =>
                    setPolicyForm({ ...policyForm, freeExchangeInCotonou: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#C7A747]"
                />
                <span className="text-[#F4F1E9] font-bold">Échange de taille sans frais à domicile</span>
              </label>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-[#777D86] block">Conditions exigées pour l'acceptation :</label>
            <div className="space-y-1.5">
              {policyForm.conditionRequirements.map((cond, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={cond}
                  onChange={(e) => {
                    const updated = [...policyForm.conditionRequirements];
                    updated[idx] = e.target.value;
                    setPolicyForm({ ...policyForm, conditionRequirements: updated });
                  }}
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs text-[#F4F1E9] outline-none"
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-[#777D86] block">Notice explicative de la procédure :</label>
            <textarea
              rows={3}
              value={policyForm.policyText}
              onChange={(e) => setPolicyForm({ ...policyForm, policyText: e.target.value })}
              className="w-full bg-[#141414] border border-[#333] p-2 text-xs text-[#F4F1E9] outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingPolicy}
            className="px-6 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            {isSavingPolicy ? 'Enregistrement...' : 'Enregistrer la politique'}
          </button>
        </form>
      )}

      {/* ======================================================== */}
      {/* MODAL: DETAIL, ACCEPTATION/REFUS & SUIVI DU RETOUR */}
      {/* ======================================================== */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#171717] border border-[#2e2e2e] shadow-2xl p-6 sm:p-8 rounded-sm my-auto max-h-[92vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedReturn(null)}
              className="absolute top-5 right-5 text-[#777D86] hover:text-[#F4F1E9] p-1.5 rounded-full hover:bg-[#252525] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-[#282828] pb-4">
              <span className="text-[10px] font-mono uppercase text-[#C7A747] font-bold">
                DOSSIER DE RETOUR & RÉCLAMATION
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-[#F4F1E9]">
                  #{selectedReturn.returnNumber}
                </h3>
                <span className="text-xs font-mono text-[#777D86]">
                  Enregistré le {new Date(selectedReturn.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>

            {/* Client and Order Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-[#141414] border border-[#262626] rounded-xs space-y-1">
                <span className="text-[#C7A747] font-bold text-[10px] block uppercase">Client demandeur</span>
                <p className="text-[#F4F1E9] font-medium">{selectedReturn.customerName}</p>
                <p className="text-[#888]">Tél : {selectedReturn.customerPhone}</p>
                {selectedReturn.customerEmail && <p className="text-[#888]">Email : {selectedReturn.customerEmail}</p>}
              </div>

              <div className="p-4 bg-[#141414] border border-[#262626] rounded-xs space-y-1">
                <span className="text-[#C7A747] font-bold text-[10px] block uppercase">Commande associée</span>
                <p className="text-[#F4F1E9] font-bold">#{selectedReturn.orderNumber}</p>
                <p className="text-[#888]">Motif déclaré : <strong className="text-[#F4F1E9]">{selectedReturn.reason}</strong></p>
                <p className="text-[#888] line-clamp-2">Problème : "{selectedReturn.description}"</p>
              </div>
            </div>

            {/* Photos & proof inspection */}
            {selectedReturn.photoUrls && selectedReturn.photoUrls.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-[#F4F1E9] block uppercase tracking-wider">
                  Photographies jointes ({selectedReturn.photoUrls.length})
                </span>
                <div className="flex flex-wrap gap-3">
                  {selectedReturn.photoUrls.map((ph, idx) => (
                    <a
                      key={idx}
                      href={ph}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-24 h-24 rounded border border-[#333] overflow-hidden bg-[#111] hover:border-[#C7A747] transition-all"
                    >
                      <img src={ph} alt="Preuve" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Items to return */}
            <div className="space-y-2 text-xs">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#F4F1E9] block">
                Articles concernés par la demande
              </span>
              <div className="space-y-2">
                {selectedReturn.items.map((it, idx) => (
                  <div key={idx} className="p-3 bg-[#141414] border border-[#262626] rounded flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#F4F1E9] block">{it.productName}</span>
                      <span className="text-[11px] text-[#777D86]">
                        Taille commandée : {it.size} • Quantité : {it.quantity}
                        {it.desiredExchangeSize && (
                          <strong className="text-[#C7A747] ml-2">
                            → Échange souhaité contre la taille : {it.desiredExchangeSize}
                          </strong>
                        )}
                      </span>
                    </div>
                    <span className="font-mono text-[#F4F1E9] font-bold">{formatCurrency(it.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing & Decision Form */}
            <div className="p-5 bg-[#202020] border border-[#2e2e2e] rounded-xs space-y-4 text-xs">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#C7A747] block">
                Instruction & Décision Commerciale
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#777D86] block mb-1">Statut du dossier :</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333] p-2 text-xs text-[#F4F1E9] outline-none"
                  >
                    <option value="new">Nouvelle demande</option>
                    <option value="under_review">En cours d'examen atelier</option>
                    <option value="accepted">Acceptée (Prise en charge validée)</option>
                    <option value="rejected">Refusée (Motif obligatoire)</option>
                    <option value="received">Retour physique reçu à l'atelier</option>
                    <option value="closed">Clôturée avec succès</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#777D86] block mb-1">Solution retenue :</label>
                  <select
                    value={proposedSolution}
                    onChange={(e) => setProposedSolution(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333] p-2 text-xs text-[#F4F1E9] outline-none"
                  >
                    <option value="exchange">Échange de taille ou d'article</option>
                    <option value="store_credit">Avoir commercial / Bon d'achat</option>
                    <option value="refund">Remboursement Mobile Money / Virement</option>
                    <option value="repair">Réparation / Reprise en atelier</option>
                    <option value="none">Aucune (Refus)</option>
                  </select>
                </div>
              </div>

              {newStatus === 'rejected' && (
                <div>
                  <label className="text-[#ff8080] font-bold block mb-1">
                    Motif explicite du refus (visible par le client) * :
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ex : Article lavé ou dépourvu de ses étiquettes d'origine..."
                    className="w-full bg-[#141414] border border-red-900/60 p-2 text-xs text-[#F4F1E9] outline-none resize-none"
                  />
                </div>
              )}

              <div>
                <label className="text-[#777D86] block mb-1">Détails de la solution / Modalités proposées :</label>
                <input
                  type="text"
                  value={solutionDetails}
                  onChange={(e) => setSolutionDetails(e.target.value)}
                  placeholder="Ex : Coursier planifié pour échange le 4 mars à Cadjèhoun"
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">Note pour l'historique d'audit :</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ex : Photos vérifiées par le responsable logistique"
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs text-[#F4F1E9] outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={handleSaveStatus}
                  className="px-5 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                >
                  {isUpdatingStatus ? 'Mise à jour...' : 'Enregistrer le statut & la décision'}
                </button>

                {/* Strict Authorized Refund Trigger */}
                {proposedSolution === 'refund' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRefundAmount(
                        selectedReturn.refundAmount ||
                          selectedReturn.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
                      );
                      setOperatorConfirmation(false);
                      setRefundAuthCode('');
                      setIsRefundModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-emerald-200" />
                    <span>Autoriser le remboursement réel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="space-y-2 text-xs">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#777D86] block">
                Historique des modifications & Audit ({selectedReturn.statusHistory?.length || 0})
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(selectedReturn.statusHistory || []).map((h, idx) => (
                  <div key={idx} className="p-2 bg-[#141414] border border-[#222] rounded flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#C7A747] font-semibold">{h.status.toUpperCase()}</span>
                    <span className="text-[#F4F1E9] truncate mx-2">{h.note}</span>
                    <span className="text-[#666] shrink-0">
                      {new Date(h.timestamp).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: STRICT REFUND CONFIRMATION & AUTHORIZATION */}
      {/* ======================================================== */}
      {isRefundModalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#181818] border-2 border-emerald-500/50 rounded-sm p-6 space-y-4 shadow-2xl">
            <button
              onClick={() => setIsRefundModalOpen(false)}
              className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-[#F4F1E9]">
                Autorisation de Remboursement Réel
              </h3>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded text-xs text-emerald-200 leading-relaxed">
              <strong>Règle de sécurité stricte :</strong> Aucun virement ou décaissement Mobile Money ne doit être déclenché sans validation conjointe et traçabilité d'une référence d'opération financière.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#777D86] block mb-1">Montant à rembourser (FCFA) :</label>
                <input
                  type="number"
                  min="1"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-[#333] p-2 text-sm font-mono font-bold text-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[#777D86] block mb-1">
                  Référence d'opération financière ou ID Transaction * :
                </label>
                <input
                  type="text"
                  required
                  value={refundAuthCode}
                  onChange={(e) => setRefundAuthCode(e.target.value)}
                  placeholder="Ex : MM-TX-98421038 ou VIRT-2026-004"
                  className="w-full bg-[#141414] border border-[#333] p-2 text-xs font-mono text-[#F4F1E9] outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer p-2.5 bg-[#141414] border border-[#2a2a2a] rounded">
                  <input
                    type="checkbox"
                    checked={operatorConfirmation}
                    onChange={(e) => setOperatorConfirmation(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-emerald-500"
                  />
                  <span className="text-[11px] text-[#ddd] leading-tight">
                    Je certifie avoir vérifié le motif, la restitution physique ou l'accord préalable et confirme l'exécution de ce remboursement pour la somme de{' '}
                    <strong className="text-emerald-400 font-mono">{formatCurrency(refundAmount)}</strong>.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="px-3 py-2 bg-[#252525] text-[#F4F1E9] rounded-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isAuthorizingRefund || !operatorConfirmation || !refundAuthCode.trim()}
                onClick={handleConfirmAuthorizedRefund}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold uppercase rounded-xs transition-colors cursor-pointer"
              >
                {isAuthorizingRefund ? 'Validation...' : 'Valider & Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
