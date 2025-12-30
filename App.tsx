
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Layout, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Target,
  Clock,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { ViewType } from './types';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import VisionBoard from './components/VisionBoard';
import { format, addMonths, subMonths } from 'date-fns';
import { supabase } from './services/supabaseClient';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const checkConnection = useCallback(async () => {
    try {
      const { error } = await supabase.from('tasks').select('count', { count: 'exact', head: true });
      setIsOnline(!error);
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const handleQuickAdd = async () => {
    const title = window.prompt(`New task for ${format(currentDate, 'MMM do')}:`);
    if (title && title.trim()) {
      await dataService.createTask({
        title,
        date: format(currentDate, 'yyyy-MM-dd'),
        priority: 'medium'
      });
      triggerRefresh();
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (currentView === 'month') {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    } else if (currentView === 'week') {
      const days = direction === 'next' ? 7 : -7;
      setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + days);
        return d;
      });
    } else {
      const days = direction === 'next' ? 1 : -1;
      setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + days);
        return d;
      });
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'month': return <MonthView key={`month-${refreshKey}`} date={currentDate} onSelectDate={(d) => { setCurrentDate(d); setCurrentView('day'); }} />;
      case 'week': return <WeekView key={`week-${refreshKey}`} date={currentDate} onSelectDate={(d) => { setCurrentDate(d); setCurrentView('day'); }} />;
      case 'day': return <DayView key={`day-${refreshKey}`} date={currentDate} onUpdate={triggerRefresh} />;
      case 'vision': return <VisionBoard key={`vision-${refreshKey}`} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full bg-[#fcfcfd] text-slate-900 overflow-hidden font-sans flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-slate-200 bg-white flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
            <Target size={20} />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight text-slate-800">Lumina</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<Calendar size={20} />} label="Month" active={currentView === 'month'} onClick={() => setCurrentView('month')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Layout size={20} />} label="Week" active={currentView === 'week'} onClick={() => setCurrentView('week')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Clock size={20} />} label="Day" active={currentView === 'day'} onClick={() => setCurrentView('day')} collapsed={!isSidebarOpen} />
          <NavItem icon={<ImageIcon size={20} />} label="Vision" active={currentView === 'vision'} onClick={() => setCurrentView('vision')} collapsed={!isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <button onClick={triggerRefresh} className="w-full flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
             <RefreshCw size={20} className={refreshKey > 0 ? 'animate-spin' : ''} />
             {isSidebarOpen && <span className="text-sm font-medium">Sync Now</span>}
           </button>
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400">
             {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="pt-safe border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
              <h1 className="text-base md:text-xl font-bold text-slate-800 truncate">
                {currentView === 'vision' ? '2026 Vision' : format(currentDate, currentView === 'month' ? 'MMM yyyy' : 'MMM d, yyyy')}
              </h1>
              {currentView !== 'vision' && (
                <div className="flex items-center bg-slate-100/50 rounded-lg p-0.5 border border-slate-200/50">
                  <button onClick={() => navigateDate('prev')} className="p-1 hover:bg-white rounded transition-all"><ChevronLeft size={16} /></button>
                  <button onClick={() => navigateDate('next')} className="p-1 hover:bg-white rounded transition-all"><ChevronRight size={16} /></button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
               <div className="md:hidden">
                  {isOnline ? <Cloud size={18} className="text-emerald-500" /> : <CloudOff size={18} className="text-slate-300" />}
               </div>
              <button 
                onClick={handleQuickAdd}
                className="flex items-center justify-center bg-indigo-600 text-white w-9 h-9 md:w-auto md:px-5 md:py-2.5 rounded-full md:rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
              >
                <Plus size={20} />
                <span className="hidden md:inline ml-2">New Task</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scroll-container custom-scrollbar p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center px-4 pt-3 pb-safe z-50">
          <MobileTab icon={<Calendar size={22} />} active={currentView === 'month'} onClick={() => setCurrentView('month')} />
          <MobileTab icon={<Layout size={22} />} active={currentView === 'week'} onClick={() => setCurrentView('week')} />
          <MobileTab icon={<Clock size={22} />} active={currentView === 'day'} onClick={() => setCurrentView('day')} />
          <MobileTab icon={<ImageIcon size={22} />} active={currentView === 'vision'} onClick={() => setCurrentView('vision')} />
        </nav>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void; collapsed: boolean }> = ({ icon, label, active, onClick, collapsed }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
    <div className={active ? 'text-indigo-600' : ''}>{icon}</div>
    {!collapsed && <span className="font-semibold text-sm">{label}</span>}
  </button>
);

const MobileTab: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-2 transition-all flex flex-col items-center justify-center ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
    {icon}
    <div className={`w-1 h-1 rounded-full mt-1 ${active ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
  </button>
);

export default App;
