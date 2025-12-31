
import React, { useState, useEffect } from 'react';
import { format, eachMonthOfInterval, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { dataService } from '../services/dataService';
import { Task } from '../types';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';

interface YearViewProps {
  onSelectDate: (date: Date) => void;
  refreshKey?: number;
}

const YearView: React.FC<YearViewProps> = ({ onSelectDate, refreshKey }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const year2026 = new Date(2026, 0, 1);
  const months = eachMonthOfInterval({
    start: year2026,
    end: new Date(2026, 11, 31)
  });

  const loadTasks = async () => {
    setLoading(true);
    const allTasks = await dataService.getTasks();
    setTasks(allTasks);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">2026 Roadmap</h2>
          <p className="text-rose-600 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Annual Perspective</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-rose-50">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-[10px] font-black uppercase text-slate-400">Total Tasks</span>
           </div>
           <div className="text-xl font-black text-slate-950">{tasks.length}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {months.map(month => {
          const days = eachDayOfInterval({ start: month, end: endOfMonth(month) });
          const monthTasks = tasks.filter(t => t.date && format(new Date(t.date), 'M') === format(month, 'M'));

          return (
            <div key={month.toISOString()} className="premium-card p-6 rounded-[2rem] bg-white group hover:border-rose-300 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{format(month, 'MMMM')}</h3>
                <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">{monthTasks.length}</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} className="text-[8px] font-black text-slate-300 text-center mb-1">{d}</div>
                ))}
                {Array.from({ length: days[0].getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {days.map(day => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const hasTasks = tasks.some(t => t.date === dayStr);
                  const isCurrentToday = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => onSelectDate(day)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all hover:bg-rose-50 ${
                        isCurrentToday ? 'bg-rose-600 text-white shadow-md' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{format(day, 'd')}</span>
                      {hasTasks && !isCurrentToday && (
                        <div className="absolute bottom-1 w-1 h-1 bg-rose-400 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => onSelectDate(month)}
                className="w-full mt-6 py-3 border-t border-rose-50 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-600 flex items-center justify-center gap-2 transition-all"
              >
                View Month <ChevronRight size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearView;
