
import React, { useState, useEffect } from 'react';
import { 
  format, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday
} from 'date-fns';
import { dataService } from '../services/dataService';
import { Task, DayReflection } from '../types';
import { Smile, Frown, Meh, Zap, Target } from 'lucide-react';

interface MonthViewProps {
  date: Date;
  onSelectDate: (date: Date) => void;
  refreshKey?: number;
  onUpdate?: () => void;
}

const MonthView: React.FC<MonthViewProps> = ({ date, onSelectDate, refreshKey, onUpdate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reflections, setReflections] = useState<DayReflection[]>([]);
  const [loading, setLoading] = useState(false);
  
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);
  const startDate = new Date(monthStart);
  startDate.setDate(monthStart.getDate() - monthStart.getDay());
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const fetchData = async () => {
    setLoading(true);
    const [allTasks, allRefs] = await Promise.all([
      dataService.getTasks(),
      dataService.getAllReflections()
    ]);
    setTasks(allTasks);
    setReflections(allRefs);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [date, refreshKey]);

  const handleToggleTask = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const status = !task.completed;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: status } : t));
    await dataService.updateTask(task.id, { completed: status });
    if (onUpdate) onUpdate();
  };

  const getMoodIcon = (mood?: string) => {
    switch(mood) {
      case 'Happy': return <Smile size={12} className="text-emerald-500" />;
      case 'Sad': return <Frown size={12} className="text-rose-500" />;
      case 'Productive': return <Zap size={12} className="text-indigo-500" fill="currentColor" />;
      default: return <Meh size={12} className="text-slate-300 dark:text-slate-600" />;
    }
  };

  const getEnergyColor = (level: number) => {
    if (level >= 8) return 'bg-emerald-500';
    if (level >= 5) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] p-4 md:p-10 shadow-sm border border-slate-50 dark:border-white/5 animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-7 mb-8">
        {weekDays.map((day, i) => (
          <div key={i} className="py-2 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em]">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = isSameDay(day, date);
          const isTodayDate = isToday(day);
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.date === dayStr);
          const reflection = reflections.find(r => r.date === dayStr);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`aspect-square md:aspect-auto md:min-h-[140px] p-2 md:p-4 rounded-2xl transition-all flex flex-col items-center md:items-start relative group border-2 ${
                !isCurrentMonth ? 'opacity-20 pointer-events-none' : 'hover:border-rose-200 dark:hover:border-rose-500/30 hover:bg-rose-50/30 dark:hover:bg-rose-500/5'
              } ${isSelected ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-400 dark:border-rose-500 ring-4 ring-rose-100 dark:ring-rose-500/20' : 'bg-white dark:bg-[#2C2C2E]/30 border-slate-50 dark:border-white/5'}`}
            >
              <div className="flex items-start justify-between w-full">
                <span className={`text-xs md:text-lg font-black w-7 h-7 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all ${
                  isTodayDate ? 'bg-rose-600 text-white shadow-lg' : isSelected ? 'text-rose-700 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {format(day, 'd')}
                </span>
                {reflection && (
                  <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                    {getMoodIcon(reflection.mood)}
                    <div className={`w-1 h-3 rounded-full ${getEnergyColor(reflection.energyLevel)}`}></div>
                  </div>
                )}
              </div>
              
              <div className="mt-3 hidden md:flex flex-col gap-1 w-full overflow-hidden">
                {reflection?.focus && (
                  <div className="flex items-center gap-1 mb-1">
                    <Target size={10} className="text-amber-500" />
                    <span className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-400 truncate">{reflection.focus}</span>
                  </div>
                )}
                {dayTasks.slice(0, 3).map((task) => (
                  <div 
                    key={task.id} 
                    onClick={(e) => handleToggleTask(e, task)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-bold uppercase transition-all ${
                      task.completed ? 'bg-slate-50 dark:bg-black/20 border-transparent opacity-40 text-slate-400 line-through' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-rose-200'
                    }`}
                  >
                    <div className={`w-1 h-1 rounded-full shrink-0 ${task.completed ? 'bg-slate-300' : 'bg-rose-500'}`}></div>
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
              </div>
              
              {/* Mobile Indicators */}
              <div className="md:hidden flex gap-0.5 mt-auto pb-1">
                {reflection && <div className={`w-1.5 h-1.5 rounded-full ${getEnergyColor(reflection.energyLevel)}`}></div>}
                {dayTasks.slice(0, 2).map(t => (
                  <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'bg-slate-200 dark:bg-slate-700' : 'bg-rose-500'}`}></div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
