
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
  Key,
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

// Helper component hướng dẫn cài đặt trên iOS
const IOSInstallPrompt: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-x-0 bottom-0 z-[150] p-4 ios-prompt-animation">
    <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-slate-900 transition-colors">
        <X size={20} />
      </button>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
          <Zap size={28} className="fill-white" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 leading-tight">Cài đặt Lumina</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trải nghiệm app toàn màn hình</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-500">
            <Share size={18} />
          </div>
          <p className="text-xs font-bold text-slate-600">Bấm vào nút <span className="text-slate-900 font-black">Chia sẻ (Share)</span> ở thanh dưới Safari.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-700">
            <PlusSquare size={18} />
          </div>
          <p className="text-xs font-bold text-slate-600">Chọn <span className="text-slate-900 font-black">Thêm vào MH chính (Add to Home Screen)</span>.</p>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="w-full mt-6 bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
      >
        Đã hiểu, thưa má!
      </button>
    </div>
  </div>
);

const NavBtn: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void; label: string }> = ({ icon, active, onClick, label }) => (
  <button 
    onClick={onClick} 
    title={label}
    className={`p-3 rounded-2xl transition-all relative group ${active ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
  >
    {icon}
    <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] uppercase tracking-widest">
      {label}
    </span>
  </button>
);

const MobileTab: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'text-rose-500 bg-rose-50' : 'text-slate-400'}`}>{icon}</button>
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
    
    const hasPromptedInstall = localStorage.getItem('lumina_install_prompted');
    if (isIOS && !isStandalone && !hasPromptedInstall) {
      setTimeout(() => setShowInstallPrompt(true), 3000);
    }

    const hasPromptedNotif = localStorage.getItem('lumina_notif_prompted');
    if ("Notification" in window) {
      if (Notification.permission === "default" && !hasPromptedNotif) {
        setTimeout(() => setShowNotificationPrompt(true), 5000);
      } else if (Notification.permission === "granted") {
        checkDiscipline();
      }
    }
  }, [refreshKey]);

  const checkDiscipline = async () => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const habits = await dataService.getHabits();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const undoneHabits = habits.filter(h => h.lastCompleted !== todayStr);
    if (undoneHabits.length > 0) {
      try {
        new Notification("Lumina Discipline", {
          body: `Má ơi! Má còn ${undoneHabits.length} thói quen chưa hoàn thành hôm nay.`,
          icon: "https://img.icons8.com/fluency/192/000000/calendar-external-link.png"
        });
      } catch (e) { console.error("Notif failed:", e); }
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem('lumina_notif_prompted', 'true');
      if (permission === "granted") {
        setShowNotificationPrompt(false);
        checkDiscipline();
      } else {
        setShowNotificationPrompt(false);
      }
    } catch (error) { console.error("Notif req failed:", error); }
  };

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
      case 'dashboard': return `Tổng quan hôm nay`;
      case 'year': return 'Lộ trình năm 2026';
      case 'month': return format(currentDate, 'MMMM, yyyy', { locale: vi });
      case 'week': return `Tuần ${format(currentDate, 'ww')} • ${format(currentDate, 'yyyy')}`;
      case 'day': return format(currentDate, 'eeee, dd/MM/yyyy', { locale: vi });
      case 'vision': return 'Bảng tầm nhìn';
      default: return 'Lumina Planner';
    }
  };

  return (
    <div className="flex h-full w-full bg-[#fcfcfd] text-slate-900 overflow-hidden flex-col lg:flex-row">
      {showInstallPrompt && <IOSInstallPrompt onClose={() => { setShowInstallPrompt(false); localStorage.setItem('lumina_install_prompted', 'true'); }} />}
      
      {showNotificationPrompt && (
        <div className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><Bell size={32} /></div>
            <h3 className="text-xl font-black mb-2">Bật Nhắc nhở Kỷ luật?</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Lumina sẽ nhắc má khi má quên thực hiện thói quen.</p>
            <div className="flex flex-col gap-3">
              <button onClick={requestNotificationPermission} className="bg-rose-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg">Kích hoạt ngay</button>
              <button onClick={() => { setShowNotificationPrompt(false); localStorage.setItem('lumina_notif_prompted', 'true'); }} className="text-slate-400 font-black py-2 text-[10px] uppercase tracking-widest">Để sau</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-20 flex-col items-center py-10 bg-white shrink-0 border-r border-slate-100 shadow-sm z-50">
        <div className="mb-14"><Zap size={28} className="text-rose-500 fill-rose-500" /></div>
        <nav className="flex-1 flex flex-col gap-6">
          <NavBtn icon={<Home size={22} />} active={currentView === 'dashboard'} onClick={() => handleNavigate('dashboard')} label="Dashboard" />
          <NavBtn icon={<Layers size={22} />} active={currentView === 'year'} onClick={() => handleNavigate('year')} label="Năm" />
          <NavBtn icon={<Calendar size={22} />} active={currentView === 'month'} onClick={() => handleNavigate('month')} label="Tháng" />
          <NavBtn icon={<Columns size={22} />} active={currentView === 'week'} onClick={() => handleNavigate('week')} label="Tuần" />
          <NavBtn icon={<Layout size={22} />} active={currentView === 'day'} onClick={() => handleNavigate('day', new Date())} label="Ngày" />
          <NavBtn icon={<LayoutDashboard size={22} />} active={currentView === 'vision'} onClick={() => handleNavigate('vision')} label="Tầm nhìn" />
        </nav>
        <button onClick={triggerRefresh} className="p-2 text-slate-300 hover:text-rose-500"><RefreshCw size={20} className={refreshKey > 0 ? 'animate-spin' : ''} /></button>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-5 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <div className="lg:hidden text-rose-500"><Zap size={22} className="fill-rose-500" /></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">LUMINA PLANNER</span>
              <h1 className="text-sm font-bold flex items-center gap-2 capitalize">
                {getTitle()}
                {['day', 'month', 'week'].includes(currentView) && (
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => navigateDate('prev')} className="p-1 hover:bg-slate-50 rounded text-slate-400"><ChevronLeft size={16} /></button>
                    <button onClick={() => navigateDate('next')} className="p-1 hover:bg-slate-50 rounded text-slate-400"><ChevronRight size={16} /></button>
                  </div>
                )}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 p-2"><Search size={18} /></button>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 lg:p-10 pb-24 lg:pb-10">
            <div className="max-w-6xl mx-auto page-transition" key={refreshKey}>
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
          <nav className="flex items-center justify-around px-4">
            <MobileTab icon={<Home size={22} />} active={currentView === 'dashboard'} onClick={() => handleNavigate('dashboard')} />
            <MobileTab icon={<Calendar size={22} />} active={currentView === 'month'} onClick={() => handleNavigate('month')} />
            <MobileTab icon={<Columns size={22} />} active={currentView === 'week'} onClick={() => handleNavigate('week')} />
            <MobileTab icon={<Layout size={22} />} active={currentView === 'day'} onClick={() => handleNavigate('day', new Date())} />
            <MobileTab icon={<LayoutDashboard size={22} />} active={currentView === 'vision'} onClick={() => handleNavigate('vision')} />
          </nav>
        </div>
      </div>
    </div>
  );
}
