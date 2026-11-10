import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import {
  RotateCcw,
  Search,
  Package,
  CheckCircle,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  HelpCircle,
  X,
  ChevronRight,
} from 'lucide-react';
import { ReturnRequest, ReturnPolicyConfig, ReturnReason } from '../../types';

export const CustomerReturnsSection: React.FC = () => {
  const { formatCurrency, showToast } = useStore();

  const [activeTab, setActiveTab] = useState<'request' | 'track' | 'policy'>('request');

  // Policy state
  const [policy, setPolicy] = useState<ReturnPolicyConfig | null>(null);

  // Step 1: Order Lookup
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [foundOrder, setFoundOrder] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Step 2: Items Selection & Return Details
  const [selectedItems, setSelectedItems] = useState<{
    [variantId: string]: {
      selected: boolean;
      quantity: number;
      desiredExchangeSize?: string;
    };
  }>({});
  const [reason, setReason] = useState<ReturnReason>('size_unfit');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReturn, setSubmittedReturn] = useState<ReturnRequest | null>(null);

  // Tracking state
  const [trackRefInput, setTrackRefInput] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedReturn, setTrackedReturn] = useState<ReturnRequest | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getReturnPolicy()
      .then((res) => setPolicy(res.policy))
      .catch(() => {});
  }, []);

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupOrderNumber.trim() || !lookupPhone.trim()) {
      setLookupError('Veuillez renseigner votre numéro de commande et votre téléphone.');
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setFoundOrder(null);

    try {
      const res = await api.lookupOrderForReturn(lookupOrderNumber.trim(), lookupPhone.trim());
      setFoundOrder(res.order);
      // Pre-select first item
      if (res.order.items && res.order.items.length > 0) {
        const initSelection: any = {};
        res.order.items.forEach((it: any, idx: number) => {
          initSelection[it.variantId] = {
            selected: idx === 0,
            quantity: 1,
            desiredExchangeSize: it.size,
          };
        });
        setSelectedItems(initSelection);
      }
    } catch (err: any) {
      setLookupError(err.message || 'Aucune commande correspondante trouvée.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length >= 4) {
      showToast('Vous pouvez joindre au maximum 4 photographies.', 'info');
      return;
    }

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      showToast('La taille de la photo ne doit pas dépasser 5 Mo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotos((prev) => [...prev, reader.result as string]);
        showToast('Photo ajoutée avec succès.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundOrder) return;

    const itemsToReturn = foundOrder.items
      .filter((it: any) => selectedItems[it.variantId]?.selected)
      .map((it: any) => ({
        productId: it.productId,
        productName: it.productName,
        variantId: it.variantId,
        size: it.size,
        color: it.color,
        quantity: selectedItems[it.variantId]?.quantity || 1,
        unitPrice: it.unitPrice,
        image: it.image,
        desiredExchangeSize: selectedItems[it.variantId]?.desiredExchangeSize,
      }));

    if (itemsToReturn.length === 0) {
      showToast('Veuillez sélectionner au moins un article à retourner.', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Veuillez décrire brièvement le problème rencontré.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitReturnRequest({
        orderNumber: foundOrder.orderNumber,
        customerPhone: foundOrder.customerPhone,
        customerName: foundOrder.customerName,
        items: itemsToReturn,
        reason,
        description: description.trim(),
        photoUrls: photos,
      });

      setSubmittedReturn(res.returnRequest);
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Échec de la transmission du dossier.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRefInput.trim()) return;

    setIsTracking(true);
    setTrackError(null);
    setTrackedReturn(null);

    try {
      const res = await api.trackReturn(trackRefInput.trim());
      setTrackedReturn(res.returnRequest);
    } catch (err: any) {
      setTrackError(err.message || 'Dossier de retour introuvable.');
    } finally {
      setIsTracking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold uppercase">Nouvelle Demande</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-mono font-bold uppercase">En cours d'examen</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">Acceptée / Coursier Mandaté</span>;
      case 'received':
        return <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] font-mono font-bold uppercase">Retour Reçu au Dépôt</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold uppercase">Refusée</span>;
      case 'closed':
        return <span className="px-2.5 py-1 bg-zinc-600/30 text-zinc-300 border border-zinc-500/40 text-[10px] font-mono font-bold uppercase">Dossier Clôturé</span>;
      default:
        return <span className="px-2.5 py-1 bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex flex-wrap border-b border-[#282828] gap-4 sm:gap-6 pb-2 text-xs font-mono uppercase tracking-wider font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('request')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'request'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Déposer une demande de retour</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('track')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'track'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Consulter l'état de ma demande</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policy')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'policy'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Règles de retour & remboursement</span>
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: FORMULAIRE DE DEMANDE DE RETOUR / ÉCHANGE */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'request' && (
        <div className="space-y-8">
          {submittedReturn ? (
            /* Confirmation card after submission */
            <div className="p-8 bg-[#181818] border border-emerald-500/40 rounded-xs space-y-5 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono text-[#777] uppercase tracking-wider block">
                  Demande enregistrée avec succès
                </span>
                <h3 className="font-heading text-2xl font-bold text-[#F4F1E9]">
                  Dossier N° {submittedReturn.returnNumber}
                </h3>
              </div>

              <p className="text-xs text-[#aaa] max-w-lg mx-auto leading-relaxed">
                Votre demande de retour pour la commande <strong>{submittedReturn.orderNumber}</strong> a été transmise au service réclamations HP COLLECTION. Notre équipe prendra contact avec vous sous 24h ouvrées.
              </p>

              <div className="pt-3 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTrackRefInput(submittedReturn.returnNumber);
                    setActiveTab('track');
                    setTrackedReturn(submittedReturn);
                  }}
                  className="px-5 py-2.5 bg-[#C7A747] text-[#141414] font-heading font-black text-xs uppercase tracking-wider"
                >
                  Suivre ce dossier →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReturn(null);
                    setFoundOrder(null);
                    setLookupOrderNumber('');
                    setDescription('');
                    setPhotos([]);
                  }}
                  className="px-4 py-2.5 bg-[#222] text-[#888] hover:text-[#F4F1E9] border border-[#333] font-mono text-xs uppercase tracking-wider"
                >
                  Nouveau retour
                </button>
              </div>
            </div>
          ) : !foundOrder ? (
            /* STEP 1: ORDER LOOKUP */
            <div className="p-6 sm:p-8 bg-[#181818] border border-[#282828] space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#C7A747] uppercase tracking-wider font-bold">
                  Étape 1 sur 2
                </span>
                <h3 className="font-heading text-xl font-bold text-[#F4F1E9]">
                  Retrouver votre commande HP COLLECTION
                </h3>
                <p className="text-xs text-[#888]">
                  Saisissez la référence de commande reçue par SMS/WhatsApp et le numéro de téléphone utilisé lors de l'achat.
                </p>
              </div>

              <form onSubmit={handleLookupOrder} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-[#777] font-semibold block">
                    Numéro de commande *
                  </label>
                  <input
                    type="text"
                    required
                    value={lookupOrderNumber}
                    onChange={(e) => setLookupOrderNumber(e.target.value)}
                    placeholder="Ex: HPC-2026-8942"
                    className="w-full bg-[#121212] border border-[#2d2d2d] focus:border-[#C7A747] px-3.5 py-2.5 text-xs text-[#F4F1E9] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-[#777] font-semibold block">
                    Téléphone béninois *
                  </label>
                  <input
                    type="tel"
                    required
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    placeholder="Ex: 01 97 00 00 00"
                    className="w-full bg-[#121212] border border-[#2d2d2d] focus:border-[#C7A747] px-3.5 py-2.5 text-xs text-[#F4F1E9] outline-none font-mono"
                  />
                </div>

                {lookupError && (
                  <div className="sm:col-span-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{lookupError}</span>
                  </div>
                )}

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className="px-6 py-3 bg-[#C7A747] hover:bg-[#b8973b] text-[#141414] font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isLookingUp ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Rechercher la commande</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: SELECT ITEMS & FILL RETURN FORM */
            <form onSubmit={handleSubmitReturn} className="p-6 sm:p-8 bg-[#181818] border border-[#282828] space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#282828] gap-3">
                <div>
                  <span className="text-xs font-mono text-[#C7A747] uppercase tracking-wider font-bold">
                    Étape 2 sur 2
                  </span>
                  <h3 className="font-heading text-xl font-bold text-[#F4F1E9]">
                    Sélection des articles & Motif
                  </h3>
                  <p className="text-xs text-[#888]">
                    Commande <strong>{foundOrder.orderNumber}</strong> ({foundOrder.items?.length || 0} article(s))
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFoundOrder(null)}
                  className="text-xs text-[#777] hover:text-[#C7A747] underline font-mono"
                >
                  Changer de commande
                </button>
              </div>

              {/* Items Selection */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-[#777] font-semibold block">
                  1. Cochez le ou les articles concernés par le retour *
                </span>
                <div className="divide-y divide-[#282828] border border-[#282828] bg-[#141414]">
                  {foundOrder.items.map((item: any) => {
                    const isChecked = !!selectedItems[item.variantId]?.selected;
                    return (
                      <div
                        key={item.variantId}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                          isChecked ? 'bg-[#C7A747]/5 border-l-2 border-l-[#C7A747]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              setSelectedItems((prev) => ({
                                ...prev,
                                [item.variantId]: {
                                  selected: e.target.checked,
                                  quantity: prev[item.variantId]?.quantity || 1,
                                  desiredExchangeSize: prev[item.variantId]?.desiredExchangeSize || item.size,
                                },
                              }));
                            }}
                            className="w-4 h-4 accent-[#C7A747] cursor-pointer"
                          />
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-12 h-14 object-cover border border-[#333]"
                            />
                          )}
                          <div>
                            <p className="font-heading font-bold text-xs sm:text-sm text-[#F4F1E9]">
                              {item.productName}
                            </p>
                            <p className="text-[10px] text-[#777] font-mono">
                              Taille actuelle : <strong className="text-[#C7A747]">{item.size}</strong> | Réf: {item.sku}
                            </p>
                          </div>
                        </div>

                        {isChecked && (
                          <div className="flex items-center gap-3 pl-7 sm:pl-0">
                            <div>
                              <label className="text-[10px] font-mono text-[#888] uppercase block">
                                Nouvelle taille souhaitée
                              </label>
                              <input
                                type="text"
                                placeholder="Ex: L ou 43"
                                value={selectedItems[item.variantId]?.desiredExchangeSize || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSelectedItems((prev) => ({
                                    ...prev,
                                    [item.variantId]: {
                                      ...prev[item.variantId],
                                      desiredExchangeSize: val,
                                    },
                                  }));
                                }}
                                className="bg-[#1a1a1a] border border-[#333] px-2 py-1 text-xs text-[#F4F1E9] w-24 outline-none font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reason dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-[#777] font-semibold block">
                    2. Motif principal de la demande *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReturnReason)}
                    className="w-full bg-[#121212] border border-[#2d2d2d] focus:border-[#C7A747] px-3.5 py-2.5 text-xs text-[#F4F1E9] outline-none font-mono cursor-pointer"
                  >
                    <option value="size_unfit">Taille non adaptée (Échange de taille)</option>
                    <option value="defective">Défaut de fabrication ou couture</option>
                    <option value="wrong_item">Article ou couleur différent de la commande</option>
                    <option value="not_as_described">Non conforme à la description</option>
                    <option value="damaged_in_transit">Endommagé pendant le transport</option>
                    <option value="change_of_mind">Changement d'avis</option>
                    <option value="other">Autre motif</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-[#777] font-semibold block">
                    Adresse de reprise par coursier
                  </label>
                  <input
                    type="text"
                    defaultValue={foundOrder.shippingZone || foundOrder.city || ''}
                    placeholder="Quartier, point de repère et ville"
                    className="w-full bg-[#121212] border border-[#2d2d2d] focus:border-[#C7A747] px-3.5 py-2.5 text-xs text-[#F4F1E9] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-[#777] font-semibold block">
                  3. Description détaillée du problème rencontré *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Précisez votre situation (ex: La sneaker taille trop petit, je souhaite l'échanger contre une pointure 43 lors du prochain passage du coursier...)"
                  className="w-full bg-[#121212] border border-[#2d2d2d] focus:border-[#C7A747] p-3 text-xs text-[#F4F1E9] outline-none font-mono resize-none leading-relaxed"
                />
              </div>

              {/* Photo Upload Attachment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-[#777] font-semibold block">
                    4. Photographies justificatives (Optionnel mais recommandé)
                  </label>
                  <span className="text-[10px] text-[#666] font-mono">{photos.length} / 4 photos</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {photos.map((src, idx) => (
                    <div key={idx} className="relative w-20 h-20 border border-[#333] rounded-xs overflow-hidden group">
                      <img src={src} alt="Justificatif" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute inset-0 bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer la photo"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 4 && (
                    <label className="w-20 h-20 border border-dashed border-[#3a3a3a] hover:border-[#C7A747] flex flex-col items-center justify-center text-[#777] hover:text-[#C7A747] cursor-pointer transition-colors text-center p-2 rounded-xs">
                      <Upload className="w-4 h-4 mb-1" />
                      <span className="text-[9px] font-mono leading-tight">Ajouter photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#282828] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFoundOrder(null)}
                  className="px-5 py-2.5 bg-[#202020] text-[#888] hover:text-[#F4F1E9] border border-[#333] font-mono text-xs uppercase"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#C7A747] hover:bg-[#b8973b] text-[#141414] font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? <Clock className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  <span>Transmettre ma demande de retour</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: CONSULTATION DE L'ÉTAT DE LA DEMANDE */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#181818] border border-[#282828] space-y-4">
            <h3 className="font-heading text-lg font-bold text-[#F4F1E9]">
              Rechercher un dossier de retour
            </h3>
            <form onSubmit={handleTrackReturn} className="flex gap-2 max-w-md">
              <input
                type="text"
                required
                value={trackRefInput}
                onChange={(e) => setTrackRefInput(e.target.value)}
                placeholder="Ex: RET-2026-8942"
                className="flex-1 bg-[#121212] border border-[#2d2d2d] focus:border-[#C7A747] px-3.5 py-2.5 text-xs text-[#F4F1E9] outline-none font-mono"
              />
              <button
                type="submit"
                disabled={isTracking}
                className="px-5 py-2.5 bg-[#C7A747] hover:bg-[#b8973b] text-[#141414] font-heading font-black text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {isTracking ? <Clock className="w-4 h-4 animate-spin" /> : 'Consulter'}
              </button>
            </form>

            {trackError && (
              <p className="text-xs text-red-400 font-mono">{trackError}</p>
            )}
          </div>

          {trackedReturn && (
            <div className="p-6 sm:p-8 bg-[#181818] border border-[#282828] space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#282828] gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading text-xl font-bold text-[#F4F1E9]">
                      Dossier {trackedReturn.returnNumber}
                    </span>
                    {getStatusBadge(trackedReturn.status)}
                  </div>
                  <p className="text-xs text-[#888] font-mono">
                    Lié à la commande <strong>{trackedReturn.orderNumber}</strong> • Déposé le {new Date(trackedReturn.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Solution / Instructions Card */}
              {trackedReturn.status === 'accepted' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Demande acceptée par HP COLLECTION</span>
                  </p>
                  <p className="text-xs text-[#aaa]">
                    Notre coursier passera à votre adresse pour procéder à la reprise de l'article avec étiquette intacte. {trackedReturn.resolutionNotes || ''}
                  </p>
                </div>
              )}

              {trackedReturn.status === 'rejected' && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Demande non acceptée</span>
                  </p>
                  <p className="text-xs text-[#aaa]">
                    Motif : {trackedReturn.rejectionReason || 'Non conforme aux conditions générales de retour.'}
                  </p>
                </div>
              )}

              {/* Status History Timeline */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-[#777] font-semibold block">
                  Historique du traitement en direct
                </span>
                <div className="space-y-2 border-l border-[#2e2e2e] pl-4 ml-2">
                  {trackedReturn.statusHistory.map((step, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#C7A747] border-2 border-[#181818]" />
                      <p className="text-xs font-bold text-[#F4F1E9]">
                        {step.note}
                      </p>
                      <span className="text-[10px] text-[#777] font-mono">
                        {new Date(step.timestamp).toLocaleString('fr-FR')} • {step.updatedBy}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 3: RÈGLES DE RETOUR & REMBOURSEMENT CONFIGURABLES */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'policy' && (
        <div className="p-6 sm:p-8 bg-[#181818] border border-[#282828] space-y-6">
          <div className="space-y-1">
            <h3 className="font-heading text-xl font-bold text-[#F4F1E9]">
              Politique Officielle des Retours & Échanges
            </h3>
            <p className="text-xs text-[#888]">
              Consultez les conditions garanties par HP COLLECTION pour vos commandes au Bénin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#141414] border border-[#282828] space-y-1.5">
              <span className="text-xs font-mono text-[#C7A747] font-bold block uppercase">
                Délai de rétractation
              </span>
              <p className="font-heading text-xl font-bold text-[#F4F1E9]">
                {policy?.delayDays || 7} Jours
              </p>
              <p className="text-[11px] text-[#888]">
                À compter de la remise en main propre par le coursier.
              </p>
            </div>

            <div className="p-4 bg-[#141414] border border-[#282828] space-y-1.5">
              <span className="text-xs font-mono text-[#C7A747] font-bold block uppercase">
                Échange de taille
              </span>
              <p className="font-heading text-xl font-bold text-[#F4F1E9]">
                100% Gratuit
              </p>
              <p className="text-[11px] text-[#888]">
                Prise en charge directe et déplacement du coursier à votre adresse.
              </p>
            </div>

            <div className="p-4 bg-[#141414] border border-[#282828] space-y-1.5">
              <span className="text-xs font-mono text-[#C7A747] font-bold block uppercase">
                Remboursement
              </span>
              <p className="font-heading text-xl font-bold text-[#F4F1E9]">
                24h à 48h
              </p>
              <p className="text-[11px] text-[#888]">
                En espèces ou Mobile Money après inspection de l'article.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-heading font-bold text-sm text-[#F4F1E9] uppercase tracking-wider">
              Conditions obligatoires d'acceptation :
            </h4>
            <ul className="space-y-2 text-xs text-[#aaa] font-light">
              {(policy?.conditionRequirements || [
                "L'article doit être dans son état d'origine, non porté, non lavé avec ses étiquettes scellées.",
                "Les sneakers et chaussures doivent être restituées dans leur boîte d'origine intacte sans scotch direct.",
                "L'essayage est autorisé au moment de la livraison en présence du coursier.",
                "Les retours pour défaut de fabrication sont pris en charge à 100% par HP COLLECTION sans aucun frais.",
              ]).map((cond, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#C7A747] shrink-0 mt-0.5" />
                  <span>{cond}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
