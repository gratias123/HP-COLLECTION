import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Sparkles,
  Truck,
  RotateCcw,
  Package,
  MessageCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: '📦 Délais & Frais de Livraison', query: 'Quels sont vos délais et frais de livraison à Cotonou et dans les autres villes ?' },
  { label: '👟 Guide des Tailles & Essayage', query: 'Comment taillent vos vêtements et sneakers ? Peut-on essayer à la livraison ?' },
  { label: '🔥 Articles Disponibles', query: 'Quels sont les articles actuellement disponibles en stock dans votre catalogue ?' },
  { label: '💵 Paiement à la Livraison', query: 'Comment fonctionne le paiement à la livraison et par Mobile Money ?' },
];

export const CustomerChatbot: React.FC = () => {
  const { settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Bonjour ! Je suis le conseiller virtuel de **HP COLLECTION**. Je suis à votre service pour répondre instantanément à vos questions sur nos **délais de livraison au Bénin**, nos **guides de tailles et pointures**, ou la **disponibilité de nos pièces en stock**. Que souhaitez-vous savoir ?',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const whatsappNumber = settings?.whatsappNumber || '+229 97 00 00 00';

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build history for context
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await api.sendChatMessage(text, history);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: res.reply || 'Je suis là pour vous aider. N\'hésitez pas si vous avez une autre question.',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Failed to get bot reply:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        text: "Désolé, une petite interruption est survenue. Pour toute assistance immédiate, nos conseillers sont également disponibles sur **WhatsApp** au +229 97 00 00 00 !",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  // Simple formatter for bold text and bullet points
  const renderFormattedText = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Replace **bold** with strong
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i} className="block min-h-[1.2em]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-[#F4F1E9]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3 bg-[#171717] hover:bg-[#202020] text-[#F4F1E9] border border-[#C7A747]/80 hover:border-[#C7A747] rounded-full shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
            aria-label="Ouvrir le conseiller virtuel HP COLLECTION"
          >
            <div className="relative w-7 h-7 rounded-full bg-[#C7A747]/10 flex items-center justify-center text-[#C7A747]">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22c55e]" />
            </div>
            <div className="text-left font-mono">
              <span className="text-[11px] font-bold uppercase tracking-wider block text-[#F4F1E9] group-hover:text-[#C7A747] transition-colors leading-tight">
                Conseiller HP
              </span>
              <span className="text-[9px] text-[#777D86] tracking-tight block">
                Livraison, tailles & stocks
              </span>
            </div>
          </button>
        ) : null}
      </div>

      {/* Chat Window Popover */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[85vh] bg-[#161616] border border-[#2e2e2e] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#141414] border-b border-[#242424] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#C7A747]/60 flex items-center justify-center text-[#C7A747]">
                <Sparkles className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22c55e]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#F4F1E9] leading-tight">
                  Conseiller HP COLLECTION
                </h3>
                <span className="text-[10px] font-mono text-[#C7A747] tracking-wider block">
                  En ligne • IA Gemini 3.8
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#777D86] hover:text-[#F4F1E9] transition-colors rounded-xs hover:bg-[#202020] cursor-pointer"
              aria-label="Fermer la discussion"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-2.5 bg-[#121212] border-b border-[#202020] flex gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.query)}
                disabled={isLoading}
                className="px-2.5 py-1 bg-[#1a1a1a] hover:bg-[#252525] hover:border-[#C7A747]/60 text-[#F4F1E9]/80 hover:text-[#C7A747] border border-[#292929] text-[10px] font-mono tracking-tight whitespace-nowrap rounded-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#C7A747] text-[#171717] font-medium'
                      : 'bg-[#1c1c1c] border border-[#2b2b2b] text-[#d6d3cd]'
                  }`}
                >
                  {renderFormattedText(msg.text)}
                </div>
                <span className="text-[9px] font-mono text-[#555] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-[#1c1c1c] border border-[#2b2b2b] p-3 rounded-xs text-[#777D86] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C7A747]" />
                  <span className="text-[11px] font-mono">Le conseiller rédige sa réponse...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Direct Reassurance */}
          <div className="px-4 py-1.5 bg-[#131313] border-t border-[#202020] flex items-center justify-between text-[10px] font-mono text-[#777D86]">
            <span>Conseiller humain disponible :</span>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:underline flex items-center gap-1 font-semibold"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Direct →</span>
            </a>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#171717] border-t border-[#262626] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Posez votre question (livraison, tailles, stocks)..."
              disabled={isLoading}
              className="flex-1 bg-[#101010] border border-[#2c2c2c] focus:border-[#C7A747] px-3 py-2.5 text-xs text-[#F4F1E9] outline-none placeholder:text-[#555] font-light rounded-xs transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 bg-[#C7A747] hover:bg-[#b8973b] disabled:bg-[#252525] disabled:text-[#555] text-[#171717] rounded-xs transition-colors cursor-pointer shrink-0"
              aria-label="Envoyer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};
