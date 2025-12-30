
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, eachDayOfInterval } from 'date-fns';
import { dataService } from '../services/dataService';
import { Task } from '../types';
import { Check } from 'lucide-react';

interface WeekViewProps {
  date: Date;
  onSelectDate: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ date, onSelectDate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const startDate = startOfWeek(date);
  const days = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, 6)
  });

  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  const fetchTasks = async () => {
    const allTasks = await dataService.getTasks();
    setTasks(allTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, [date]);

  const toggleTask = async (task: Task) => {
    const updatedStatus = !task.completed;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t));
    await dataService.updateTask(task.id, { completed: updatedStatus });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar bg-slate-50/30">
        <div className="grid grid-cols-8 min-w-[700px] border-b border-slate-100">
          <div className="p-4 border-r border-slate-100 sticky left-0 bg-white z-20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-300 uppercase vertical-text">Time</span>
          </div>
          {days.map(day => (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`p-3 text-center transition-colors border-r border-slate-100 last:border-r-0 ${
                isSameDay(day, date) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{format(day, 'EEE')}</div>
              <div className={`text-base font-bold w-9 h-9 flex items-center justify-center rounded-full mx-auto transition-all ${
                isSameDay(day, date) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-700'
              }`}>
                {format(day, 'd')}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[60vh] md:max-h-[600px] custom-scrollbar overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-8 sticky top-0 bg-white/50 backdrop-blur-sm z-10 border-b border-slate-100">
             <div className="p-3 border-r border-slate-100"></div>
             {days.map(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayTasks = tasks.filter(t => t.date.startsWith(dayStr));
                return (
                  <div key={day.toISOString()} className="p-2 border-r border-slate-50 last:border-r-0 min-h-[120px] space-y-2">
                    {dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => toggleTask(task)}
                        className={`text-[10px] p-2 rounded-xl font-bold border leading-tight cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-start gap-2 ${
                          task.completed 
                            ? 'bg-slate-100 text-slate-400 border-transparent opacity-60' 
                            : task.priority === 'high' 
                              ? 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm'
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 w-3 h-3 rounded-full border flex items-center justify-center ${task.completed ? 'bg-indigo-500 border-transparent' : 'border-current'}`}>
                          {task.completed && <Check size={8} className="text-white" />}
                        </div>
                        <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                );
             })}
          </div>

          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-50 group">
              <div className="p-3 text-right text-[10px] font-bold text-slate-400 border-r border-slate-100 sticky left-0 bg-white z-10 w-full">
                {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              {days.map(day => (
                <div 
                  key={`${day.toISOString()}-${hour}`} 
                  className="p-1 border-r border-slate-50 min-h-[50px] last:border-r-0 hover:bg-slate-50/50 transition-colors"
                >
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
