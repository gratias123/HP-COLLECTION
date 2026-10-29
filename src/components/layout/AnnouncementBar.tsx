import React from 'react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore();

  if (settings && !settings.announcementActive) {
    return null;
  }

  const text =
    settings?.announcementText ||
    'NOUVEL ARRIVAGE 2026 • LIVRAISON 24H COTONOU & CALAVI • PAIEMENT À LA LIVRAISON ACCEPTÉ';

  return (
    <div className="bg-[#111111] border-b border-[#242424] text-[10px] sm:text-[11px] py-2 px-3 sm:px-6 font-mono tracking-[0.18em] text-[#777D86] uppercase overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7A747]" />
          <span className="text-[#C7A747] font-bold">HP COLLECTION</span>
          <span className="text-[#444]">•</span>
          <span className="text-[#888]">COTONOU</span>
        </div>

        <div className="flex-1 text-center md:text-right truncate">
          <span className="text-[#F4F1E9]/90 font-medium">
            {text}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-[10px] text-[#777D86] flex-shrink-0 pl-4 border-l border-[#242424]">
          <span>WhatsApp : <strong className="text-[#F4F1E9] font-normal">+229 97 00 00 00</strong></span>
        </div>
      </div>
    </div>
  );
};
