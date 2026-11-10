import React, { useState } from 'react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Shield,
  X,
} from 'lucide-react';

interface FedaPaySimulatorModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

export const FedaPaySimulatorModal: React.FC<FedaPaySimulatorModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { formatCurrency, showToast } = useStore();
  const [operator, setOperator] = useState<'mtn' | 'moov' | 'celtiis'>('mtn');
  const [phone, setPhone] = useState(order.customer.phone);
  const [step, setStep] = useState<'input' | 'push_sent' | 'success' | 'failed'>('input');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSendPrompt = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('push_sent');
    }, 1200);
  };

  const handleConfirmPin = async (approved: boolean) => {
    setIsProcessing(true);
    try {
      const res = await api.confirmFedaPayDemo(order.id, approved);
      setIsProcessing(false);
      if (approved) {
        setStep('success');
        showToast('Paiement Mobile Money validé avec succès !', 'success');
        setTimeout(() => {
          onSuccess(res.order);
        }, 1500);
      } else {
        setStep('failed');
        showToast('Paiement refusé ou annulé.', 'error');
      }
    } catch (err: any) {
      setIsProcessing(false);
      showToast(err.message || 'Erreur de paiement', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#1c1c1c] border border-[#2e2e2e] rounded-sm shadow-2xl p-6 overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#777D86] hover:text-[#F4F1E9]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* FedaPay Header */}
        <div className="flex items-center gap-3 border-b border-[#282828] pb-4 mb-5">
          <div className="w-10 h-10 rounded-sm bg-[#252525] border border-[#383838] flex items-center justify-center text-[#C7A747]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base font-bold text-[#F4F1E9]">
                Paiement Mobile Money Bénin
              </h3>
              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#C7A747]/20 text-[#C7A747] border border-[#C7A747]/30 rounded">
                FedaPay Sandbox
              </span>
            </div>
            <p className="text-xs text-[#777D86]">
              Commande #{order.orderNumber} • Montant : <strong className="text-[#F4F1E9]">{formatCurrency(order.total)}</strong>
            </p>
          </div>
        </div>

        {step === 'input' && (
          <div className="space-y-4">
            <p className="text-xs text-[#777D86] leading-relaxed">
              Sélectionnez votre opérateur Mobile Money au Bénin pour déclencher l’invitation de paiement sur votre téléphone.
            </p>

            {/* Operator choice */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOperator('mtn')}
                className={`p-3 rounded-xs border text-center transition-all flex flex-col items-center gap-1.5 ${
                  operator === 'mtn'
                    ? 'border-[#fbbf24] bg-[#fbbf24]/10 text-[#fbbf24]'
                    : 'border-[#333333] bg-[#222222] text-[#777D86]'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#fbbf24] text-[#171717] font-black text-[10px] flex items-center justify-center">
                  M
                </div>
                <span className="text-xs font-bold">MTN MoMo</span>
              </button>

              <button
                type="button"
                onClick={() => setOperator('moov')}
                className={`p-3 rounded-xs border text-center transition-all flex flex-col items-center gap-1.5 ${
                  operator === 'moov'
                    ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]'
                    : 'border-[#333333] bg-[#222222] text-[#777D86]'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#3b82f6] text-white font-black text-[10px] flex items-center justify-center">
                  M
                </div>
                <span className="text-xs font-bold">Moov Money</span>
              </button>

              <button
                type="button"
                onClick={() => setOperator('celtiis')}
                className={`p-3 rounded-xs border text-center transition-all flex flex-col items-center gap-1.5 ${
                  operator === 'celtiis'
                    ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[#06b6d4]'
                    : 'border-[#333333] bg-[#222222] text-[#777D86]'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#06b6d4] text-white font-black text-[10px] flex items-center justify-center">
                  C
                </div>
                <span className="text-xs font-bold">Celtiis Cash</span>
              </button>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs text-[#777D86] font-medium block mb-1">
                Numéro Mobile Money (Bénin) :
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+229 97 XX XX XX"
                className="w-full bg-[#141414] border border-[#333333] focus:border-[#C7A747] rounded-xs px-3 py-2.5 text-xs text-[#F4F1E9] outline-none"
              />
            </div>

            <button
              onClick={handleSendPrompt}
              disabled={isProcessing || !phone}
              className="w-full py-3 bg-[#C7A747] hover:bg-[#b8973b] text-[#171717] font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Envoi du push USSD...</span>
                </>
              ) : (
                <>
                  <span>Payer {formatCurrency(order.total)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#777D86]">
              <Lock className="w-3 h-3 text-[#C7A747]" />
              <span>Paiement crypté et certifié FedaPay Bénin</span>
            </div>
          </div>
        )}

        {step === 'push_sent' && (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#C7A747]/10 border border-[#C7A747]/30 flex items-center justify-center text-[#C7A747] animate-pulse">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold text-[#F4F1E9] mb-1">
                Notification USSD envoyée au {phone}
              </h4>
              <p className="text-xs text-[#777D86] leading-relaxed max-w-xs mx-auto">
                Veuillez valider le débit de <strong className="text-[#F4F1E9]">{formatCurrency(order.total)}</strong> sur votre compte {operator.toUpperCase()} Money.
              </p>
            </div>

            {/* Simulation controls */}
            <div className="p-3 bg-[#242424] border border-[#333333] rounded text-left space-y-2 text-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#C7A747] block">
                Simulateur de validation Mobile Money :
              </span>
              <p className="text-[11px] text-[#777D86]">
                En environnement de test, confirmez ou annulez la transaction pour tester la réponse :
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleConfirmPin(true)}
                  disabled={isProcessing}
                  className="flex-1 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold rounded-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirmer le code PIN</span>
                </button>
                <button
                  onClick={() => handleConfirmPin(false)}
                  disabled={isProcessing}
                  className="px-3 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Refuser</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#22c55e]/20 border border-[#22c55e] flex items-center justify-center text-[#22c55e]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-heading text-base font-bold text-[#F4F1E9]">
              Paiement Confirmé !
            </h4>
            <p className="text-xs text-[#777D86]">
              Votre règlement a été validé avec succès par FedaPay. Redirection en cours...
            </p>
          </div>
        )}

        {step === 'failed' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#ef4444]/20 border border-[#ef4444] flex items-center justify-center text-[#ef4444]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[#F4F1E9] mb-1">
                Paiement non abouti
              </h4>
              <p className="text-xs text-[#777D86]">
                La transaction n’a pas pu être validée. Vous pouvez réessayer ou opter pour le paiement à la livraison.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('input')}
                className="flex-1 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-xs font-semibold text-[#F4F1E9] rounded-xs"
              >
                Réessayer
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-[#C7A747] text-[#171717] text-xs font-bold rounded-xs"
              >
                Payer à la livraison
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
