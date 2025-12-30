
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Tag, Trash2, ExternalLink } from 'lucide-react';
import { generateVisionImage } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { VisionItem } from '../types';
// Import format from date-fns to fix the "Cannot find name 'format'" error
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
      const newItem: Partial<VisionItem> = { 
        content: imageUrl, 
        category: 'Personal',
        label: prompt
      };
      await dataService.saveVisionItem(newItem);
      await loadItems(); // Refresh from DB
      setPrompt('');
    }
    setIsGenerating(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this vision from your board?')) {
      setVisionItems(prev => prev.filter(v => v.id !== id));
      await dataService.deleteVisionItem(id);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Manifesting Vision...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-white rounded-3xl p-6 md:p-12 border border-slate-200 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-2">2026 Vision Board</h2>
        <p className="text-slate-500 text-sm mb-8 font-medium">Describe your dreams for 2026 and let Lumina's AI visualize your path.</p>
        
        <div className="flex flex-col md:flex-row gap-2 max-w-2xl mx-auto bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
          <input 
            type="text"
            placeholder="A successful tech startup office in Tokyo..."
            className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none font-medium"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Visualize
          </button>
        </div>
      </section>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {visionItems.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <p className="text-slate-400 font-medium">Your vision board is empty. Start manifesting your 2026!</p>
          </div>
        ) : visionItems.map(item => (
          <div key={item.id} className="relative group rounded-2xl overflow-hidden shadow-sm border border-slate-200 break-inside-avoid hover:shadow-xl transition-all bg-white transform hover:-translate-y-1 duration-300">
            <img src={item.content} alt={item.label} className="w-full h-auto object-cover" />
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 px-2.5 py-1 bg-indigo-50 rounded-full">
                  {item.category}
                </span>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {item.label && <p className="text-sm font-bold text-slate-800 leading-tight">{item.label}</p>}
              {/* Using format function which is now imported above */}
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Manifested {format(new Date(item.created_at || Date.now()), 'MMM d, yyyy')}</p>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg cursor-pointer hover:bg-white">
                  <ExternalLink size={14} className="text-indigo-600" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisionBoard;
