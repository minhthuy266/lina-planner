
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Trash2, Camera, Zap, Plus } from 'lucide-react';
import { generateVisionImage } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { VisionItem } from '../types';
import { format } from 'date-fns';

const VisionBoard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = async () => {
    setIsLoading(true);
    const items = await dataService.getVisionItems();
    setVisionItems(items);
    setIsLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const imageUrl = await generateVisionImage(prompt);
    if (imageUrl) {
      const newItem: Partial<VisionItem> = { content: imageUrl, category: 'Dream', label: prompt.toUpperCase() };
      await dataService.saveVisionItem(newItem);
      await loadItems();
      setPrompt('');
    }
    setIsGenerating(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Archive this vision?')) {
      setVisionItems(prev => prev.filter(v => v.id !== id));
      await dataService.deleteVisionItem(id);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
        <p className="text-rose-600 font-black uppercase tracking-widest text-[10px]">Manifesting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <section className="bg-slate-950 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden text-white border-none shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]"></div>
        
        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Manifestation Lab</h2>
        <p className="text-slate-400 text-sm md:text-lg mb-12 font-bold uppercase tracking-[0.2em]">Dream it. Describe it. Generate it.</p>
        
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto bg-white/10 p-3 rounded-[2rem] border border-white/10 backdrop-blur-md">
          <input 
            type="text"
            placeholder="Describe your 2026 goal (e.g., 'Luxury workspace in Paris')..."
            className="flex-1 bg-transparent px-8 py-5 text-lg font-bold focus:outline-none placeholder:text-slate-500 text-white"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="bg-rose-600 text-white px-10 py-5 rounded-2xl text-[12px] font-black flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 hover:bg-rose-700 uppercase tracking-widest"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            Generate Vision
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {visionItems.length === 0 ? (
          <div className="col-span-full py-40 text-center border-2 border-dashed border-rose-200 dark:border-rose-500/20 rounded-[3rem] bg-rose-50/30 dark:bg-rose-500/5">
            <Sparkles size={48} className="mx-auto text-rose-300 dark:text-rose-700 mb-6" />
            <p className="text-slate-400 dark:text-slate-700 font-black uppercase tracking-widest text-xs">Your future is a blank canvas</p>
          </div>
        ) : visionItems.map(item => (
          <div key={item.id} className="bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-50 dark:border-white/5 group">
            <div className="aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-black/20">
              <img src={item.content} alt={item.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="p-8 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-full">
                  {item.category}
                </span>
                <button onClick={() => handleDelete(item.id)} className="text-slate-300 dark:text-slate-700 hover:text-rose-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-4 tracking-tight uppercase">{item.label}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                <Zap size={12} className="text-amber-400 fill-amber-400" />
                Manifested {format(new Date(item.created_at || Date.now()), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisionBoard;
