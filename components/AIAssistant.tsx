import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { MenuItem, AIRecommendation } from '../types';
import { getUpsellRecommendation } from '../services/geminiService';

interface AIAssistantProps {
  currentOrder: MenuItem[];
  onAddItem: (item: MenuItem) => void;
  allItems: MenuItem[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ currentOrder, onAddItem, allItems }) => {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  // --- Feature Toggle ---
  const ENABLE_AI = false; // Set to true when API Key is ready

  useEffect(() => {
    if (!ENABLE_AI) return;

    const fetchRec = async () => {
      if (currentOrder.length > 0 && currentOrder.length % 2 === 0) { // Trigger logic
        setLoading(true);
        const res = await getUpsellRecommendation(currentOrder, allItems);
        setLoading(false);
        if (res) {
          setRecommendation(res);
          setVisible(true);
        }
      }
    };
    
    const timer = setTimeout(() => {
        fetchRec();
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentOrder.length, ENABLE_AI]); 

  if (!ENABLE_AI || (!visible && !loading)) return null;

  return (
    <div className={`fixed bottom-24 left-6 z-40 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
       <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 w-80 max-w-full relative overflow-hidden">
          
          {/* Close Button */}
          <button 
            onClick={() => setVisible(false)}
            className="absolute top-2 left-2 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-3">
             <div className="bg-purple-600 p-2 rounded-lg shrink-0 shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
             </div>
             <div className="flex-1">
                <h4 className="font-bold text-sm mb-1 text-purple-300">המלצת השף (AI)</h4>
                {loading ? (
                    <p className="text-xs text-slate-400">מנתח העדפות...</p>
                ) : (
                    <>
                        <p className="text-xs text-slate-300 mb-3 italic">"{recommendation?.reason}"</p>
                        <div className="flex flex-col gap-2">
                            {recommendation?.itemIds.map(id => {
                                const item = allItems.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <button 
                                        key={id}
                                        onClick={() => {
                                            onAddItem(item);
                                            setVisible(false);
                                        }}
                                        className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs transition-colors"
                                    >
                                        <span>{item.name}</span>
                                        <span className="font-bold">₪{item.price} +</span>
                                    </button>
                                )
                            })}
                        </div>
                    </>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};