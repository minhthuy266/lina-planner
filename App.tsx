import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Layout, 
  ChevronLeft, 
  ChevronRight,
  Search,
  RefreshCw,
  LayoutDashboard,
  Home,
  Layers,
  Zap,
  Bell,
  Columns,
  Share,
  PlusSquare,
  X
} from 'lucide-react';
import { ViewType } from './types';
import Dashboard from './components/Dashboard';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import YearView from './components/YearView';
import VisionBoard from './components/VisionBoard';
import { dataService } from './services/dataService';
import { format, addMonths } from 'date-fns';
import { vi } from 'date-fns/locale/vi';

const IOSInstallPrompt: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-x-0 bottom-0 z-[150] p-4 animate-in slide-in-from-bottom-full duration-500">
    <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-300">
        <X size={20} />
      </button>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
          <Zap size={24} className="fill-white" />
        </div>
        <div>
          <h3 className="text-md font-black text-slate-900 leading-tight">Cài đặt Lumina</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toàn màn hình như App</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
          <Share size={16} className="text-blue-500" />
          <p className="text-[11px] font-bold text-slate-600 text-left">Bấm nút <span className="text-slate-900">Chia sẻ (Share)</span> ở Safari.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
          <PlusSquare size={16} className="text-slate-700" />
          <p className="text-[11px] font-bold text-slate-600 text-left">Chọn <span className="text-slate-900">Thêm vào MH chính (Add to Home Screen)</span>.</p>
        </div>
      </div>
    </div>
  </div>
);

const NavBtn: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void; label: string }> = ({ icon, active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`p-3 rounded-2xl transition-all relative group ${active ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
  >
    {icon}
  </button>
);

const MobileTab: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex-1 flex flex-col items-center justify-center h-full transition-all ${active ? 'text-rose-500' : 'text-slate-400'}`}
  >
    <div className={`p-2 rounded-xl ${active ? 'bg-rose-50' : ''}`}>
      {/* Fix: Casting icon to React.ReactElement<any> to resolve TypeScript error when passing 'size' prop */}
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 24 }) : icon}
    </div>
  </button>
);

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const handleNavigate = (view: ViewType, date?: Date) => {
    if (date) setCurrentDate(new Date(date));
    setCurrentView(view);
  };

  useEffect(() => {
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS && !isStandalone && !localStorage.getItem('lumina_install_prompted')) {
      setTimeout(() => setShowInstallPrompt(true), 3000);
    }
  }, [refreshKey]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (currentView === 'month') {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : addMonths(prev, -1));
    } else if (currentView === 'week') {
      const delta = direction === 'next' ? 7 : -7;
      setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + delta);
        return d;
      });
    } else {
      const delta = direction === 'next' ? 1 : -1;
      setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + delta);
        return d;
      });
    }
  };

  const getTitle = () => {
    switch(currentView) {
      case 'dashboard': return `Hôm nay`;
      case 'year': return 'Lộ trình 2026';
      case 'month': return format(currentDate, 'MMMM, yyyy', { locale: vi });
      case 'week': return `Tuần ${format(currentDate, 'ww')}`;
      case 'day': return format(currentDate, 'eeee, dd/MM', { locale: vi });
      case 'vision': return 'Vision Board';
      default: return 'Lumina';
    }
  };

  return (
    <div className="flex h-full w-full bg-[#fcfcfd] text-slate-900 overflow-hidden flex-col lg:flex-row">
      {showInstallPrompt && <IOSInstallPrompt onClose={() => { setShowInstallPrompt(false); localStorage.setItem('lumina_install_prompted', 'true'); }} />}
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-20 flex-col items-center py-10 bg-white border-r border-slate-100 z-50">
        <div className="mb-14"><Zap size={28} className="text-rose-500 fill-rose-500" /></div>
        <nav className="flex-1 flex flex-col gap-6">
          <NavBtn icon={<Home size={22} />} active={currentView === 'dashboard'} onClick={() => handleNavigate('dashboard')} label="Home" />
          <NavBtn icon={<Calendar size={22} />} active={currentView === 'month'} onClick={() => handleNavigate('month')} label="Month" />
          <NavBtn icon={<Columns size={22} />} active={currentView === 'week'} onClick={() => handleNavigate('week')} label="Week" />
          <NavBtn icon={<Layout size={22} />} active={currentView === 'day'} onClick={() => handleNavigate('day', new Date())} label="Day" />
          <NavBtn icon={<LayoutDashboard size={22} />} active={currentView === 'vision'} onClick={() => handleNavigate('vision')} label="Vision" />
        </nav>
        <button onClick={triggerRefresh} className="p-2 text-slate-300"><RefreshCw size={20} /></button>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-5 shrink-0 z-40">
          <div className="flex items-center gap-3">
            <div className="lg:hidden text-rose-500"><Zap size={20} className="fill-rose-500" /></div>
            <h1 className="text-sm font-black capitalize flex items-center gap-2">
              {getTitle()}
              {['day', 'month', 'week'].includes(currentView) && (
                <div className="flex items-center gap-0.5 ml-1">
                  <button onClick={() => navigateDate('prev')} className="p-1 text-slate-400"><ChevronLeft size={14} /></button>
                  <button onClick={() => navigateDate('next')} className="p-1 text-slate-400"><ChevronRight size={14} /></button>
                </div>
              )}
            </h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden">
          {/* pb-[calc(54px+env(safe-area-inset-bottom)+1rem)] : Đảm bảo scroll không bị khuất bởi tab bar và không thừa quá nhiều */}
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 lg:p-10 pb-[calc(70px+env(safe-area-inset-bottom))] lg:pb-10">
            <div className="max-w-6xl mx-auto" key={refreshKey}>
              {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} onUpdate={triggerRefresh} />}
              {currentView === 'year' && <YearView onSelectDate={(d) => { setCurrentDate(d); setCurrentView('month'); }} refreshKey={refreshKey} />}
              {currentView === 'month' && <MonthView date={currentDate} onSelectDate={(d) => { setCurrentDate(d); setCurrentView('day'); }} refreshKey={refreshKey} onUpdate={triggerRefresh} />}
              {currentView === 'week' && <WeekView date={currentDate} onSelectDate={(d) => { setCurrentDate(d); setCurrentView('day'); }} onUpdate={triggerRefresh} refreshKey={refreshKey} />}
              {currentView === 'day' && <DayView date={currentDate} onUpdate={triggerRefresh} refreshKey={refreshKey} />}
              {currentView === 'vision' && <VisionBoard />}
            </div>
          </div>
        </main>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 mobile-nav-glass">
          <nav className="flex items-center justify-around w-full px-2 h-full">
            <MobileTab icon={<Home />} active={currentView === 'dashboard'} onClick={() => handleNavigate('dashboard')} />
            <MobileTab icon={<Calendar />} active={currentView === 'month'} onClick={() => handleNavigate('month')} />
            <MobileTab icon={<Columns />} active={currentView === 'week'} onClick={() => handleNavigate('week')} />
            <MobileTab icon={<Layout />} active={currentView === 'day'} onClick={() => handleNavigate('day', new Date())} />
            <MobileTab icon={<LayoutDashboard />} active={currentView === 'vision'} onClick={() => handleNavigate('vision')} />
          </nav>
        </div>
      </div>
    </div>
  );
}