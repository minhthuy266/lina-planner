
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Layout, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  LayoutDashboard,
  Home,
  Zap,
  Columns,
  Share,
  PlusSquare,
  X,
  Plus
} from 'lucide-react';
import { ViewType } from './types';
import Dashboard from './components/Dashboard';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import YearView from './components/YearView';
import VisionBoard from './components/VisionBoard';
import { format, addMonths } from 'date-fns';
import { vi } from 'date-fns/locale/vi';

const IOSInstallPrompt: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-x-4 bottom-24 z-[200] animate-in slide-in-from-bottom-full duration-700">
    <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-2xl border border-white/20 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 p-1">
        <X size={20} />
      </button>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
          <Zap size={24} className="fill-white" />
        </div>
        <div>
          <h3 className="text-[15px] font-black text-slate-900 leading-tight">Cài đặt Lumina</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trải nghiệm như App thật</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl">
          <Share size={16} className="text-blue-500" />
          <p className="text-[11px] font-bold text-slate-600 text-left">Bấm nút <span className="text-slate-900">Chia sẻ</span> ở Safari.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl">
          <PlusSquare size={16} className="text-slate-700" />
          <p className="text-[11px] font-bold text-slate-600 text-left">Chọn <span className="text-slate-900">Thêm vào MH chính</span>.</p>
        </div>
      </div>
    </div>
  </div>
);

const MobileTab: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void; label: string }> = ({ icon, active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`flex-1 flex flex-col items-center justify-center pt-2 pb-1 transition-all ios-tap ${active ? 'text-rose-500' : 'text-slate-400'}`}
  >
    <div className="relative mb-1">
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 22, strokeWidth: active ? 2.5 : 2 }) : icon}
      {active && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full"></div>}
    </div>
    <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const handleNavigate = (view: ViewType, date?: Date) => {
    if (date) setCurrentDate(new Date(date));
    setCurrentView(view);
  };

  useEffect(() => {
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isStandalone && !localStorage.getItem('lumina_install_prompted')) {
      setTimeout(() => setShowInstallPrompt(true), 4000);
    }
  }, []);

  const getTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Today';
      case 'month': return format(currentDate, 'MMMM', { locale: vi });
      case 'week': return `Week ${format(currentDate, 'ww')}`;
      case 'day': return format(currentDate, 'eeee', { locale: vi });
      case 'vision': return 'Vision';
      default: return 'Lumina';
    }
  };

  return (
    <div className="flex h-full w-full bg-ios-bg flex-col lg:flex-row overflow-hidden">
      {showInstallPrompt && <IOSInstallPrompt onClose={() => { setShowInstallPrompt(false); localStorage.setItem('lumina_install_prompted', 'true'); }} />}
      
      {/* Desktop Sidebar (Giữ nguyên) */}
      <aside className="hidden lg:flex w-20 flex-col items-center py-10 bg-white border-r border-slate-100 z-50">
        <div className="mb-14"><Zap size={28} className="text-rose-500 fill-rose-500" /></div>
        <nav className="flex-1 flex flex-col gap-6">
          <button onClick={() => handleNavigate('dashboard')} className={`p-3 rounded-2xl ${currentView === 'dashboard' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}><Home size={22} /></button>
          <button onClick={() => handleNavigate('month')} className={`p-3 rounded-2xl ${currentView === 'month' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}><Calendar size={22} /></button>
          <button onClick={() => handleNavigate('week')} className={`p-3 rounded-2xl ${currentView === 'week' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}><Columns size={22} /></button>
          <button onClick={() => handleNavigate('day', new Date())} className={`p-3 rounded-2xl ${currentView === 'day' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}><Layout size={22} /></button>
          <button onClick={() => handleNavigate('vision')} className={`p-3 rounded-2xl ${currentView === 'vision' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}><LayoutDashboard size={22} /></button>
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Mobile Header - Ultra Thin & Glassy */}
        <header className="lg:hidden shrink-0 apple-glass px-5 border-b border-black/5 flex items-center justify-between sticky top-0 z-50" 
                style={{ height: 'calc(44px + var(--sat))', paddingTop: 'var(--sat)' }}>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-rose-500 fill-rose-500" />
            <h1 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-900">{getTitle()}</h1>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setRefreshKey(k => k+1)} className="p-1.5 text-slate-400 ios-tap"><RefreshCw size={16} /></button>
             <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden border border-black/5">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
          <div className="scroll-container custom-scrollbar" 
               style={{ paddingBottom: 'calc(80px + var(--sab))' }}>
            <div className="max-w-6xl mx-auto px-4 pt-4 lg:p-10" key={refreshKey}>
              {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} onUpdate={() => setRefreshKey(k => k+1)} />}
              {currentView === 'year' && <YearView onSelectDate={(d) => { setCurrentDate(d); handleNavigate('month'); }} refreshKey={refreshKey} />}
              {currentView === 'month' && <MonthView date={currentDate} onSelectDate={(d) => { setCurrentDate(d); handleNavigate('day'); }} refreshKey={refreshKey} onUpdate={() => setRefreshKey(k => k+1)} />}
              {currentView === 'week' && <WeekView date={currentDate} onSelectDate={(d) => { setCurrentDate(d); handleNavigate('day'); }} onUpdate={() => setRefreshKey(k => k+1)} refreshKey={refreshKey} />}
              {currentView === 'day' && <DayView date={currentDate} onUpdate={() => setRefreshKey(k => k+1)} refreshKey={refreshKey} />}
              {currentView === 'vision' && <VisionBoard />}
            </div>
          </div>
        </main>

        {/* Floating Action Button for Mobile */}
        {currentView === 'day' && (
          <button className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-rose-500 text-white rounded-full shadow-2xl flex items-center justify-center ios-tap z-[100]">
            <Plus size={28} strokeWidth={3} />
          </button>
        )}

        {/* iOS Style Floating Tab Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-[var(--sab)] mb-2">
           <nav className="apple-glass rounded-[2rem] h-[64px] flex items-center justify-around px-2 shadow-2xl border border-white/40 ring-1 ring-black/5">
              <MobileTab icon={<Home />} label="Home" active={currentView === 'dashboard'} onClick={() => handleNavigate('dashboard')} />
              <MobileTab icon={<Calendar />} label="Month" active={currentView === 'month'} onClick={() => handleNavigate('month')} />
              <MobileTab icon={<Columns />} label="Week" active={currentView === 'week'} onClick={() => handleNavigate('week')} />
              <MobileTab icon={<Layout />} label="Day" active={currentView === 'day'} onClick={() => handleNavigate('day', new Date())} />
              <MobileTab icon={<LayoutDashboard />} label="Vision" active={currentView === 'vision'} onClick={() => handleNavigate('vision')} />
           </nav>
        </div>
      </div>
    </div>
  );
}
