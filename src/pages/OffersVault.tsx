import React, { useEffect, useState, useRef } from 'react';
import { subscribeToActiveOffers, incrementOfferViews, incrementOfferClicks } from '../lib/offerService';
import { Offer } from '../types';
import { motion } from 'motion/react';
import { ExternalLink, Flame, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export function OffersVault() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const incrementedOffersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = subscribeToActiveOffers((fetchedOffers) => {
      setOffers(fetchedOffers);
      setLoading(false);
      
      fetchedOffers.forEach(o => {
        if (!incrementedOffersRef.current.has(o.id)) {
          incrementedOffersRef.current.add(o.id);
          incrementOfferViews(o.id).catch(console.error);
        }
      });
    }, (err) => {
      console.error('[OffersVault] Subscription failed:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOfferClick = async (offer: Offer) => {
    await incrementOfferClicks(offer.id).catch(console.error);
    window.open(offer.url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-[#0a0a0c]">
        <div className="max-w-4xl mx-auto px-4 h-[60vh] rounded-3xl bg-[#121216] animate-pulse">
           <div className="flex items-center justify-center h-full">
             <div className="flex flex-col items-center gap-4">
                <Sparkles className="w-8 h-8 text-brand-cyan/50 animate-bounce" />
                <p className="text-white/50 font-bold tracking-widest uppercase text-xs">Unlocking Vault...</p>
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0c] min-h-screen text-white pt-24 pb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-purple/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-6">
            <Flame className="w-3.5 h-3.5" /> Premium Partner Resources
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold mb-6 tracking-tight text-white leading-tight">
            The Digital Vault
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed font-medium">
            Exclusive tools, financial software, and premier partner campaigns curated by our network. Unlocking advanced capabilities for professionals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group glass-panel border border-white/5 bg-[#121216]/50 rounded-[2rem] overflow-hidden hover-glass transition-all duration-500 hover:-translate-y-2 flex flex-col relative"
            >
              {offer.imageUrl && (
                <div className="h-48 relative overflow-hidden bg-black/40">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121216]/80 via-transparent to-transparent z-10" />
                  <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  
                  {offer.provider && (
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 text-brand-cyan" /> {offer.provider}
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col relative">
                {offer.payout && (
                  <div className="absolute -top-5 right-6 z-20 bg-brand-cyan text-black font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-lg shadow-brand-cyan/20 border border-brand-cyan flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> {offer.payout}
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-brand-cyan transition-colors">{offer.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 font-medium flex-1">{offer.description}</p>
                
                <button 
                  onClick={() => handleOfferClick(offer)}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 rounded-[1rem] text-xs font-bold uppercase tracking-widest transition-all duration-300 group/btn shadow-lg"
                >
                  Access Offer 
                  <ExternalLink className="w-4 h-4 text-brand-cyan" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {offers.length === 0 && (
          <div className="text-center py-20 glass-panel border border-dashed border-white/10 rounded-[2rem] mx-auto max-w-2xl mt-12">
            <Sparkles className="w-12 h-12 text-brand-purple/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">The Vault is currently sealed</h3>
            <p className="text-gray-400 text-sm font-medium">New premium resources and partner campaigns are being curated. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
