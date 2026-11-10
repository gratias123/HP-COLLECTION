import React from 'react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { setCurrentPage, settings } = useStore();

  const handleNav = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const storePhone = settings?.phone || '+229 97 00 00 00';
  const whatsappNumber = settings?.whatsappNumber || '+229 97 00 00 00';
  const storeAddress = settings?.address || 'Cotonou, République du Bénin';

  return (
    <footer className="bg-[#101010] border-t border-[#222222] text-[#777D86] text-xs mt-20">
      {/* Main Footer Minimal Brand & Care Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-heading text-2xl font-extrabold text-[#F4F1E9] tracking-wider">
                HP<span className="text-[#C7A747]">.</span> COLLECTION
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-[#C7A747]">
                « Ton style. Tes règles. »
              </span>
            </div>
            <p className="text-xs text-[#777D86] leading-relaxed max-w-xl">
              Maison de mode urbaine contemporaine au Bénin. Vestes varsity, denim déstructuré,
              chemises et sneakers pour ceux qui imposent leur allure.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-mono text-[#F4F1E9]/70">
              <span>Service client : {storePhone}</span>
              <span>•</span>
              <span>contact@hpcollection.bj</span>
            </div>
          </div>

          {/* Quick Direct Actions */}
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-[#333333] hover:border-[#C7A747] text-[#F4F1E9] hover:text-[#C7A747] font-mono text-xs uppercase tracking-wider transition-colors"
            >
              Assistance WhatsApp
            </a>
            <button
              onClick={() => handleNav('admin')}
              className="px-3 py-2 text-[#666] hover:text-[#C7A747] transition-colors font-mono text-[10px] uppercase tracking-wider"
            >
              Portail Admin
            </button>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-8 pt-6 border-t border-[#1a1a1a] flex items-center justify-between text-[11px] font-mono">
          <p>© {new Date().getFullYear()} HP COLLECTION. Bénin.</p>
        </div>
      </div>
    </footer>
  );
};
