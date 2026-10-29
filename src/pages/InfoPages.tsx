import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from 'lucide-react';

interface InfoPagesProps {
  initialTab?: 'contact' | 'delivery' | 'cgv' | 'privacy' | 'mentions';
}

export const InfoPages: React.FC<InfoPagesProps> = ({ initialTab = 'contact' }) => {
  const { settings, deliveryZones, formatCurrency } = useStore();
  const [tab, setTab] = useState<'contact' | 'delivery' | 'cgv' | 'privacy' | 'mentions'>(initialTab);

  // FAQ accordions state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const storePhone = settings?.phone || '+229 97 00 00 00';
  const whatsappNumber = settings?.whatsappNumber || '+229 97 00 00 00';
  const storeAddress = settings?.address || 'Cotonou, République du Bénin';

  const FAQS = [
    {
      q: 'Comment passer une commande sur HP COLLECTION ?',
      a: 'Sélectionnez votre modèle, choisissez votre taille et cliquez sur « Ajouter au panier » ou « Commander Maintenant ». Renseignez votre ville (Cotonou, Calavi, etc.) et votre numéro de téléphone béninois. Vous pourrez choisir entre le paiement à la livraison ou le Mobile Money.',
    },
    {
      q: 'Puis-je payer en espèces ou Mobile Money à la réception du colis ?',
      a: 'Oui, absolument ! Le paiement à la livraison est disponible sur toutes nos destinations au Bénin. Vous payez directement au coursier après vérification de votre paquet.',
    },
    {
      q: 'Quels sont les délais de livraison à Cotonou et Calavi ?',
      a: 'Pour Cotonou et Abomey-Calavi, nous livrons en moins de 24 heures (le jour même si votre commande est validée avant 14h). Pour Porto-Novo et les autres départements, comptez 48h à 72h.',
    },
    {
      q: 'Que faire si la taille de sneaker ou de vêtement ne convient pas ?',
      a: 'Nous offrons la possibilité d’essayer rapidement à la livraison. Si la taille ne convient pas, nous effectuons un échange de taille sous 48 heures sans aucun frais supplémentaire tant que le produit est intact.',
    },
    {
      q: 'Les articles vendus sont-ils authentiques ?',
      a: 'Tous les produits HP COLLECTION font l’objet d’un contrôle qualité rigoureux (grammages de tissus épais, finitions de broderies, cuirs et semelles durables). Nous ne commercialisons aucun produit de qualité médiocre.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Tab navigation */}
      <div className="flex border-b border-[#282828] overflow-x-auto scrollbar-none gap-6 pb-2 text-sm font-semibold">
        <button
          onClick={() => setTab('contact')}
          className={`pb-2 border-b-2 whitespace-nowrap transition-all ${
            tab === 'contact'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          Contact & FAQ
        </button>
        <button
          onClick={() => setTab('delivery')}
          className={`pb-2 border-b-2 whitespace-nowrap transition-all ${
            tab === 'delivery'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          Livraison & Retours au Bénin
        </button>
        <button
          onClick={() => setTab('cgv')}
          className={`pb-2 border-b-2 whitespace-nowrap transition-all ${
            tab === 'cgv'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          Conditions Générales (CGV)
        </button>
        <button
          onClick={() => setTab('privacy')}
          className={`pb-2 border-b-2 whitespace-nowrap transition-all ${
            tab === 'privacy'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          Confidentialité des Données
        </button>
        <button
          onClick={() => setTab('mentions')}
          className={`pb-2 border-b-2 whitespace-nowrap transition-all ${
            tab === 'mentions'
              ? 'border-[#C7A747] text-[#C7A747]'
              : 'border-transparent text-[#777D86] hover:text-[#F4F1E9]'
          }`}
        >
          Mentions Légales & Infos
        </button>
      </div>

      {/* 1. Contact & FAQ */}
      {tab === 'contact' && (
        <div className="space-y-10">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F1E9] mb-2">
              Contactez le Service Client HP COLLECTION
            </h2>
            <p className="text-xs sm:text-sm text-[#777D86]">
              Notre équipe à Cotonou est disponible du Lundi au Samedi de 8h30 à 20h00.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-2">
              <div className="w-9 h-9 rounded-full bg-[#C7A747]/10 flex items-center justify-center text-[#C7A747] mb-2">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">Téléphone Direct</h3>
              <p className="text-xs text-[#777D86]">Appels vocaux pour suivi & conseils :</p>
              <a href={`tel:${storePhone}`} className="text-xs font-mono font-bold text-[#C7A747] block">
                {storePhone}
              </a>
            </div>

            <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-2">
              <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] mb-2">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">WhatsApp Express</h3>
              <p className="text-xs text-[#777D86]">Commandes directes & photos produits :</p>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#25D366] hover:underline block"
              >
                Discuter sur WhatsApp →
              </a>
            </div>

            <div className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-2">
              <div className="w-9 h-9 rounded-full bg-[#C7A747]/10 flex items-center justify-center text-[#C7A747] mb-2">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">Siège & Stockage</h3>
              <p className="text-xs text-[#777D86]">{storeAddress}</p>
              <span className="text-[11px] text-[#777D86] block">République du Bénin</span>
            </div>
          </div>

          {/* FAQ Accordions */}
          <div className="pt-6 border-t border-[#282828] space-y-4">
            <h3 className="font-heading text-xl font-bold text-[#F4F1E9]">
              Foire Aux Questions (FAQ)
            </h3>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#2a2a2a] bg-[#1c1c1c] rounded-xs overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 text-left font-heading text-xs sm:text-sm font-semibold text-[#F4F1E9] flex items-center justify-between gap-4"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#C7A747] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#777D86] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-[#777D86] leading-relaxed border-t border-[#262626] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Delivery & Returns */}
      {tab === 'delivery' && (
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F1E9] mb-2">
              Politique de Livraison & Retours au Bénin
            </h2>
            <p className="text-xs sm:text-sm text-[#777D86]">
              Nous livrons quotidiennement sur l'ensemble du territoire béninois grâce à nos coursiers dédiés et nos transporteurs partenaires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveryZones.map((zone) => (
              <div key={zone.id} className="p-5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">{zone.name}</h3>
                  <span className="font-mono font-bold text-[#C7A747] text-xs">
                    {zone.fee === 0 ? 'Gratuit' : formatCurrency(zone.fee)}
                  </span>
                </div>
                <p className="text-xs text-[#777D86] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C7A747]" />
                  <span>Délai moyen constaté : {zone.estimatedTime}</span>
                </p>
                {zone.freeDeliveryThreshold && (
                  <p className="text-[11px] text-[#4ade80]">
                    ✓ Livraison offerte dès {formatCurrency(zone.freeDeliveryThreshold)} d'achats
                  </p>
                )}
                {zone.description && (
                  <p className="text-xs text-[#777D86] pt-1">{zone.description}</p>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#161616] border border-[#262626] rounded-xs space-y-3 text-xs text-[#777D86] leading-relaxed">
            <h4 className="font-heading text-sm font-bold text-[#F4F1E9] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#C7A747]" />
              <span>Modalités d'Échange et Retours</span>
            </h4>
            <p>
              • <strong>Essayage lors de la livraison :</strong> Nos coursiers à Cotonou et Calavi patientent pendant que vous vérifiez la conformité de l'article et essayez la taille.
            </p>
            <p>
              • <strong>Échange sous 48h :</strong> Si après coup la pointure ne vous convient pas, contactez notre service client WhatsApp avec votre référence de commande pour planifier un passage d'échange.
            </p>
            <p>
              • <strong>Conditions :</strong> L'article doit être rendu neuf, non lavé, sans parfum, avec ses étiquettes d'origine et dans sa boîte d'origine pour les sneakers.
            </p>
          </div>
        </div>
      )}

      {/* 3. CGV */}
      {tab === 'cgv' && (
        <div className="space-y-6 text-xs text-[#777D86] leading-relaxed">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-[#F4F1E9] mb-2">
              Conditions Générales de Vente (CGV)
            </h2>
            <p className="text-[11px] text-[#C7A747]">Dernière mise à jour : Mars 2026</p>
          </div>

          <div className="space-y-4 bg-[#1c1c1c] p-6 border border-[#2a2a2a] rounded-xs">
            <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">Article 1 — Objet</h3>
            <p>
              Les présentes Conditions Générales de Vente régissent l'ensemble des relations contractuelles entre la boutique HP COLLECTION, immatriculée en République du Bénin, et toute personne effectuant un achat sur notre plateforme web ou via nos canaux de commande directe.
            </p>

            <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">Article 2 — Prix et Devises</h3>
            <p>
              Tous les prix affichés sur notre catalogue sont exprimés en Francs CFA (XOF), toutes taxes comprises. HP COLLECTION se réserve le droit de modifier ses prix à tout moment, étant toutefois entendu que le prix figurant sur la confirmation de commande au moment de l'achat sera le seul applicable.
            </p>

            <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">Article 3 — Modalités de Paiement</h3>
            <p>
              Le client peut régler sa commande par : (1) Paiement en espèces ou Mobile Money directement à la livraison lors de la remise du colis par le coursier, ou (2) Paiement en ligne sécurisé via FedaPay (MTN Mobile Money, Moov Money, Celtiis Cash).
            </p>

            <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">Article 4 — Réserve de Propriété</h3>
            <p>
              Les produits demeurent la propriété intégrale de HP COLLECTION jusqu'au paiement complet du montant de la commande et des frais de livraison afférents.
            </p>
          </div>
        </div>
      )}

      {/* 4. Privacy */}
      {tab === 'privacy' && (
        <div className="space-y-6 text-xs text-[#777D86] leading-relaxed">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-[#F4F1E9] mb-2">
              Politique de Confidentialité et Protection des Données
            </h2>
            <p className="text-[11px] text-[#C7A747]">Conformité Loi Numérique de la République du Bénin</p>
          </div>

          <div className="space-y-4 bg-[#1c1c1c] p-6 border border-[#2a2a2a] rounded-xs">
            <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">Données Collectées</h3>
            <p>
              HP COLLECTION ne collecte que les informations strictement indispensables à la livraison de vos commandes (Nom, prénom, numéro de téléphone, quartier et adresse de livraison). Aucune donnée bancaire sensible n'est enregistrée sur nos serveurs.
            </p>

            <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">Utilisation des Données</h3>
            <p>
              Vos coordonnées sont uniquement transmises au livreur en charge de votre colis et utilisées pour vous envoyer les alertes de suivi de commande. Nous ne vendons ni ne cédons vos coordonnées personnelles à aucun tiers commercial.
            </p>

            <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">Vos Droits</h3>
            <p>
              Vous disposez d'un droit permanent de modification, de consultation et de suppression de vos données personnelles sur simple demande adressée à contact@hpcollection.bj ou par WhatsApp.
            </p>
          </div>
        </div>
      )}

      {/* 5. Mentions Légales & Informations Commerciales */}
      {tab === 'mentions' && (
        <div className="space-y-6 text-xs text-[#777D86] leading-relaxed">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-[#F4F1E9] mb-2">
              Mentions Légales & Informations Commerciales
            </h2>
            <p className="text-[11px] text-[#C7A747]">Informations réglementaires et identification de l'éditeur</p>
          </div>

          <div className="space-y-4 bg-[#1c1c1c] p-6 border border-[#2a2a2a] rounded-xs">
            <h3 className="font-heading font-bold text-sm text-[#F4F1E9]">Éditeur de la plateforme</h3>
            <div className="space-y-1">
              <p><strong>Enseigne commerciale :</strong> HP COLLECTION</p>
              <p><strong>Activité :</strong> Vente au détail de vêtements streetwear, sneakers et accessoires de mode urbaine</p>
              <p><strong>Siège d'exploitation :</strong> {storeAddress}, République du Bénin</p>
              <p><strong>Service Commercial & Clientèle :</strong> {storePhone} (Appels et WhatsApp direct)</p>
              <p><strong>Courriel officiel :</strong> contact@hpcollection.bj</p>
              <p><strong>Directeur de la publication :</strong> Direction Commerciale HP COLLECTION</p>
            </div>

            <h3 className="font-heading font-bold text-sm text-[#F4F1E9] pt-2">Hébergement & Infrastructure</h3>
            <p>
              La plateforme HP COLLECTION est hébergée sur une infrastructure infonuagique sécurisée haute disponibilité, avec chiffrement SSL/TLS des flux de bout en bout et isolation étanche des données de gestion.
            </p>

            <h3 className="font-heading font-bold text-sm text-[#F4F1E9] pt-2">Propriété Intellectuelle & Droits d'Auteur</h3>
            <p>
              L'ensemble des éléments visuels, photographies de lookbook, logos, dénominations de collections et éléments textuels présents sur cette plateforme sont la propriété exclusive de HP COLLECTION ou font l'objet d'une licence d'exploitation autorisée. Toute reproduction totale ou partielle sans accord préalable écrit est formellement interdite.
            </p>

            <h3 className="font-heading font-bold text-sm text-[#F4F1E9] pt-2">Sécurité des Transactions Financières</h3>
            <p>
              Les règlements en ligne par Mobile Money (MTN, Moov, Celtiis) sont opérés via l'intermédiaire financier certifié FedaPay. HP COLLECTION n'a à aucun moment accès aux codes secrets, codes OTP ou identifiants bancaires des clients.
            </p>

            <h3 className="font-heading font-bold text-sm text-[#F4F1E9] pt-2">Droit Applicable & Juridiction</h3>
            <p>
              Les présentes mentions et les relations commerciales qui en découlent sont soumises au droit en vigueur en République du Bénin. En cas de contestation ou de litige non résolu à l'amiable, compétence expresse est attribuée aux tribunaux compétents de Cotonou.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
