
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
  AlertTriangle,
  Info,
  Columns
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
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${active ? 'text-rose-500 bg-rose-50' : 'text-slate-400'}`}>{icon}</button>
);

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const handleNavigate = (view: ViewType, date?: Date) => {
    if (date) {
      setCurrentDate(new Date(date));
    }
    setCurrentView(view);
  };

  useEffect(() => {
    const hasPrompted = localStorage.getItem('lumina_notif_prompted');
    if ("Notification" in window) {
      if (Notification.permission === "default" && !hasPrompted) {
        const timer = setTimeout(() => setShowNotificationPrompt(true), 1500);
        return () => clearTimeout(timer);
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
    setNotifError(null);
    if (!("Notification" in window)) {
      setNotifError("Trình duyệt này không hỗ trợ thông báo má ơi!");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem('lumina_notif_prompted', 'true');
      if (permission === "granted") {
        setShowNotificationPrompt(false);
        checkDiscipline();
      } else if (permission === "denied") {
        setNotifError("Má đã chặn thông báo rồi. Hãy bật lại trong cài đặt trình duyệt nhé!");
      } else {
        setShowNotificationPrompt(false);
      }
    } catch (error) { setNotifError("Có lỗi xảy ra khi xin quyền."); }
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
    <div className="flex h-screen w-full bg-[#fcfcfd] text-slate-900 overflow-hidden flex-col lg:flex-row">
      {showNotificationPrompt && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bell size={32} className="animate-bounce" />
            </div>
            <h3 className="text-xl font-black mb-2">Bật Nhắc nhở Kỷ luật?</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Lumina sẽ nhắc má khi má quên thực hiện thói quen.</p>
            {notifError && (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-[10px] font-bold uppercase mb-6 flex items-start gap-2 text-left">
                <Info size={14} className="shrink-0" /> {notifError}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button onClick={requestNotificationPermission} className="bg-rose-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Kích hoạt ngay</button>
              <button onClick={() => { setShowNotificationPrompt(false); localStorage.setItem('lumina_notif_prompted', 'true'); }} className="text-slate-400 font-black py-2 text-[10px] uppercase tracking-widest">Để sau</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
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
        <button onClick={triggerRefresh} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
          <RefreshCw size={20} className={refreshKey > 0 ? 'animate-spin' : ''} />
        </button>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-5 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <div className="lg:hidden text-rose-500"><Zap size={22} className="fill-rose-500" /></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">PLANNER CHUYỂN GIAO</span>
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
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 lg:p-10">
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
          <nav className="flex items-center justify-around px-4 pt-3">
            <MobileTab icon={<Home size={24} />} active={currentView === 'dashboard'} onClick={() => handleNavigate('dashboard')} />
            <MobileTab icon={<Calendar size={24} />} active={currentView === 'month'} onClick={() => handleNavigate('month')} />
            <MobileTab icon={<Columns size={24} />} active={currentView === 'week'} onClick={() => handleNavigate('week')} />
            <MobileTab icon={<Layout size={24} />} active={currentView === 'day'} onClick={() => handleNavigate('day', new Date())} />
            <MobileTab icon={<LayoutDashboard size={24} />} active={currentView === 'vision'} onClick={() => handleNavigate('vision')} />
          </nav>
        </div>
      </div>
    </div>
  );
}
