
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Layout, 
  RefreshCw,
  LayoutDashboard,
  Home,
  Zap,
  Columns,
  Moon,
  Sun,
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
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleNavigate = (view: ViewType, date?: Date) => {
    if (date) setCurrentDate(new Date(date));
    setCurrentView(view);
  };

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
    <div className="flex h-full w-full flex-col lg:flex-row overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-24 flex-col items-center py-12 bg-white dark:bg-[#1C1C1E] border-r border-slate-100 dark:border-white/5 z-50">
        <div className="mb-16"><Zap size={32} className="text-rose-500 fill-rose-500" /></div>
        <nav className="flex-1 flex flex-col gap-8">
          <NavItem icon={<Home />} active={currentView === 'dashboard'} onClick={() => handleNavigate('dashboard')} />
          <NavItem icon={<Calendar />} active={currentView === 'month'} onClick={() => handleNavigate('month')} />
          <NavItem icon={<Columns />} active={currentView === 'week'} onClick={() => handleNavigate('week')} />
          <NavItem icon={<Layout />} active={currentView === 'day'} onClick={() => handleNavigate('day', new Date())} />
          <NavItem icon={<LayoutDashboard />} label="VISION" active={currentView === 'vision'} onClick={() => handleNavigate('vision')} />
        </nav>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-4 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors">
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Mobile Header */}
        <header className="lg:hidden shrink-0 apple-glass px-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between sticky top-0 z-[100]" 
                style={{ height: 'calc(54px + var(--sat))', paddingTop: 'var(--sat)' }}>
          <div className="flex items-center gap-2">
            <Zap size={22} className="text-rose-500 fill-rose-500" />
            <h1 className="text-[16px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{getTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 ios-tap">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button onClick={() => setRefreshKey(k => k+1)} className="p-2 text-slate-400 ios-tap">
                <RefreshCw size={20} />
             </button>
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden border border-black/5">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
          <div className="scroll-container custom-scrollbar">
            <div className="max-w-6xl mx-auto px-4 pt-6 lg:p-12" key={refreshKey}>
              {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} onUpdate={() => setRefreshKey(k => k+1)} />}
              {currentView === 'month' && <MonthView date={currentDate} onSelectDate={(d) => { setCurrentDate(d); handleNavigate('day'); }} refreshKey={refreshKey} onUpdate={() => setRefreshKey(k => k+1)} />}
              {currentView === 'week' && <WeekView date={currentDate} onSelectDate={(d) => { setCurrentDate(d); handleNavigate('day'); }} onUpdate={() => setRefreshKey(k => k+1)} refreshKey={refreshKey} />}
              {currentView === 'day' && <DayView date={currentDate} onUpdate={() => setRefreshKey(k => k+1)} refreshKey={refreshKey} />}
              {currentView === 'vision' && <VisionBoard />}
              {currentView === 'year' && <YearView onSelectDate={(d) => { setCurrentDate(d); handleNavigate('month'); }} refreshKey={refreshKey} />}
            </div>
          </div>
        </main>

        {/* Tab Bar - Fixed Padding Bottom for iOS Bookmark */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[150] px-4 pb-[calc(12px + var(--sab))]">
           <nav className="apple-glass rounded-[2.5rem] h-[72px] flex items-center justify-around px-2 shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-white/50 dark:border-white/10 ring-1 ring-black/5">
              <MobileTab icon={<Home />} label="HOME" active={currentView === 'dashboard'} onClick={() => handleNavigate('dashboard')} />
              <MobileTab icon={<Calendar />} label="MONTH" active={currentView === 'month'} onClick={() => handleNavigate('month')} />
              <MobileTab icon={<Columns />} label="WEEK" active={currentView === 'week'} onClick={() => handleNavigate('week')} />
              <MobileTab icon={<Layout />} label="DAY" active={currentView === 'day'} onClick={() => handleNavigate('day', new Date())} />
              <MobileTab icon={<LayoutDashboard />} label="VISION" active={currentView === 'vision'} onClick={() => handleNavigate('vision')} />
           </nav>
        </div>
      </div>
    </div>
  );
}

// Fix: cast icon to React.ReactElement<any> to resolve TypeScript errors with unknown props in cloneElement
const NavItem = ({ icon, active, onClick }: any) => (
  <button onClick={onClick} className={`p-4 rounded-[1.5rem] transition-all ${active ? 'bg-rose-500 text-white shadow-xl shadow-rose-200 dark:shadow-rose-900/20' : 'text-slate-300 dark:text-slate-600 hover:text-rose-500'}`}>
    {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
  </button>
);

// Fix: cast icon to React.ReactElement<any> to resolve TypeScript errors with unknown props in cloneElement
const MobileTab = ({ icon, active, onClick, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex-1 flex flex-col items-center justify-center transition-all ios-tap ${active ? 'text-rose-500' : 'text-slate-400 dark:text-slate-600'}`}
  >
    <div className="mb-0.5">
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
