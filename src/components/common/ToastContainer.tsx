import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'bg-[#2a1414]/95 border-[#8a2424] text-[#ffd6d6]'
              : toast.type === 'info'
              ? 'bg-[#1b232c]/95 border-[#3b5266] text-[#cde4f7]'
              : 'bg-[#181f18]/95 border-[#3d613d] text-[#d6f5d6]'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-[#f87171]" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-[#60a5fa]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />
            )}
          </div>
          <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
