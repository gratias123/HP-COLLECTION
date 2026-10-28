import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../data/initialData';

export const Footer: React.FC = () => {
  const { setCurrentPage, setCategoryFilter, settings } = useStore();

  const handleNav = (page: string, category: string = 'all') => {
    setCurrentPage(page);
    setCategoryFilter(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const storePhone = settings?.phone || '+229 97 00 00 00';
  const whatsappNumber = settings?.whatsappNumber || '+229 97 00 00 00';
  const storeAddress = settings?.address || 'Cotonou, République du Bénin';

  return (
    <footer className="bg-[#101010] border-t border-[#222222] text-[#777D86] text-xs mt-20">
      {/* Sleek Reassurance Bar (Typographic, no loud icon boxes) */}
      <div className="border-b border-[#1f1f1f] bg-[#141414]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="border-l-2 border-[#C7A747] pl-3.5 space-y-1">
              <span className="text-[#F4F1E9] font-bold text-xs uppercase tracking-wider block font-heading">
                Livraison 24h
              </span>
              <p className="text-[11px] text-[#777D86] leading-relaxed">
                Cotonou & Abomey-Calavi par coursier dédié. 48-72h en région.
              </p>
            </div>

            <div className="border-l-2 border-[#C7A747] pl-3.5 space-y-1">
              <span className="text-[#F4F1E9] font-bold text-xs uppercase tracking-wider block font-heading">
                Paiement à Réception
              </span>
              <p className="text-[11px] text-[#777D86] leading-relaxed">
                Réglez en espèces ou Mobile Money au livreur lors de la remise.
              </p>
            </div>

            <div className="border-l-2 border-[#C7A747] pl-3.5 space-y-1">
              <span className="text-[#F4F1E9] font-bold text-xs uppercase tracking-wider block font-heading">
                Qualité Certifiée
              </span>
              <p className="text-[11px] text-[#777D86] leading-relaxed">
                Toiles de coton peigné lourdes, cuirs souples et finitions durables.
              </p>
            </div>

            <div className="border-l-2 border-[#C7A747] pl-3.5 space-y-1">
              <span className="text-[#F4F1E9] font-bold text-xs uppercase tracking-wider block font-heading">
                Échange de Taille 48h
              </span>
              <p className="text-[11px] text-[#777D86] leading-relaxed">
                Essayage à la livraison et remplacement de taille rapide garanti.
              </p>
            </div>
          </div>
        </div>
      </div>

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

        {/* Bottom row with payment pills */}
        <div className="mt-12 pt-7 border-t border-[#1f1f1f] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <p>© {new Date().getFullYear()} HP COLLECTION. Bénin.</p>
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="text-[#555]">Paiements :</span>
            <span className="px-2 py-0.5 bg-[#171717] border border-[#262626] text-[#F4F1E9]">
              Espèces à la livraison
            </span>
            <span className="px-2 py-0.5 bg-[#171717] border border-[#262626] text-[#F4F1E9]">
              MTN Mobile Money
            </span>
            <span className="px-2 py-0.5 bg-[#171717] border border-[#262626] text-[#F4F1E9]">
              Moov Money
            </span>
            <span className="px-2 py-0.5 bg-[#171717] border border-[#262626] text-[#F4F1E9]">
              Celtiis Cash
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
