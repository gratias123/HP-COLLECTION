import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('hp_announcement_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  if (isDismissed) {
    return null;
  }

  if (settings && settings.announcementActive === false) {
    return null;
  }

  const text =
    settings?.announcementText ||
    'NOUVEL ARRIVAGE 2026 • LIVRAISON DIRECTE À DOMICILE & EXPÉDITION PARTOUT • PAIEMENT À LA RÉCEPTION';

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('hp_announcement_dismissed', 'true');
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  return (
    <aside
      role="region"
      aria-label="Bandeau d'information et annonces"
      className="bg-[#0D0D0E] border-b border-[#222225] text-[10.5px] sm:text-[11px] py-2 px-3 sm:px-6 tracking-wide text-[#9CA3AF] transition-all duration-300 relative z-40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Discreet Brand Pill */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0 text-[#71717A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7A747]" />
          <span className="text-[#C7A747] font-semibold tracking-widest text-[10px] uppercase">
            HP COLLECTION
          </span>
          <span className="text-[#3F3F46]">•</span>
          <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">
            MAISON DE MODE
          </span>
        </div>

        {/* Center: Editorial Announcement Text */}
        <div className="flex-1 text-center truncate px-2">
          <p className="text-[#E4E4E7] font-normal tracking-wide text-[11px] sm:text-[11.5px] truncate inline-block">
            {text}
          </p>
        </div>

        {/* Right: WhatsApp link & Dismiss / Close button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {settings?.whatsappNumber && (
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-[10.5px] text-[#A1A1AA] hover:text-[#C7A747] transition-colors"
            >
              <span className="text-[#71717A]">WhatsApp:</span>
              <span className="font-mono text-[#F4F1E9]">{settings.whatsappNumber}</span>
            </a>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Fermer le bandeau d'annonce"
            title="Masquer cette annonce"
            className="p-1 -mr-1 rounded-sm text-[#71717A] hover:text-[#F4F1E9] hover:bg-[#1E1E22] transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

