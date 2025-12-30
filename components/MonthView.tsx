
import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday
} from 'date-fns';
import { dataService } from '../services/dataService';
import { Task } from '../types';

interface MonthViewProps {
  date: Date;
  onSelectDate: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ date, onSelectDate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const fetchTasks = async () => {
    const allTasks = await dataService.getTasks();
    setTasks(allTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, [date]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-400';
      case 'medium': return 'bg-indigo-400';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {weekDays.map((day, i) => (
          <div key={i} className="py-3 text-center text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = isSameDay(day, date);
          const isTodayDate = isToday(day);
          const dayStr = format(day, 'yyyy-MM-dd');
          
          // Lọc task khớp với ngày hiện tại (chuẩn YYYY-MM-DD)
          const dayTasks = tasks.filter(t => t.date && t.date.startsWith(dayStr));

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`min-h-[70px] md:min-h-[120px] p-1 md:p-3 border-r border-b border-slate-50 transition-all flex flex-col items-center md:items-start hover:bg-slate-50 relative ${
                !isCurrentMonth ? 'opacity-25' : ''
              }`}
            >
              <span className={`text-xs md:text-sm font-semibold w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-colors ${
                isTodayDate 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : isSelected 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600'
              }`}>
                {format(day, 'd')}
              </span>
              
              <div className="mt-1 flex flex-wrap gap-1 justify-center md:justify-start w-full overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="w-full flex items-center gap-1">
                    {/* Mobile: Chấm màu */}
                    <div className={`md:hidden w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityColor(task.priority)}`}></div>
                    {/* Desktop: Label */}
                    <div className={`hidden md:block w-full text-[9px] px-1.5 py-0.5 rounded truncate font-medium text-left ${
                      task.completed ? 'bg-slate-100 text-slate-400 line-through' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                      {task.title}
                    </div>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[8px] text-slate-400 font-bold ml-1 hidden md:block">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
