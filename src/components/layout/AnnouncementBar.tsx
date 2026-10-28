import React from 'react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore();

  if (settings && !settings.announcementActive) {
    return null;
  }

  const text =
    settings?.announcementText ||
    'NOUVELLE COLLECTION URBAN SNEAKERS & STREETWEAR • LIVRAISON 24H COTONOU & CALAVI • PAIEMENT À LA LIVRAISON';

  return (
    <div className="bg-[#111111] border-b border-[#222222] text-[11px] py-2 px-4 tracking-wider text-[#777D86] font-mono">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-[#C7A747] font-semibold">HP COLLECTION</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#F4F1E9] text-[10px] tracking-wider uppercase">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};
