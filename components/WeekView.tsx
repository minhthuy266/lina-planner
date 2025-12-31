
import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, isSameDay, eachDayOfInterval } from 'date-fns';
import { dataService } from '../services/dataService';
import { Task, DayReflection } from '../types';
import { Check, Clock, Plus, X, Trash2, Battery, Smile, Frown, Meh, Zap, Target } from 'lucide-react';

interface WeekViewProps {
  date: Date;
  onSelectDate: (date: Date) => void;
  onUpdate?: () => void;
  refreshKey?: number;
}

const WeekView: React.FC<WeekViewProps> = ({ date, onSelectDate, onUpdate, refreshKey }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reflections, setReflections] = useState<DayReflection[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCell, setActiveCell] = useState<{day: string, hour: string} | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - date.getDay());
  startDate.setHours(0, 0, 0, 0);

  const days = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, 6)
  });

  const hours = Array.from({ length: 17 }, (_, i) => i + 6); 

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

  useEffect(() => {
    if (activeCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeCell]);

  const toggleTask = async (task: Task) => {
    const updatedStatus = !task.completed;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t));
    const result = await dataService.updateTask(task.id, { completed: updatedStatus });
    if (result) {
      if (onUpdate) onUpdate();
    } else {
      await fetchData();
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, id: string) => {
     e.stopPropagation();
     setTasks(prev => prev.filter(t => t.id !== id));
     await dataService.deleteTask(id);
     if (onUpdate) onUpdate();
  };

  const handleSaveQuickTask = async () => {
    if (!activeCell || !quickTitle.trim()) {
      setActiveCell(null);
      return;
    }
    
    const newTaskData: Partial<Task> = {
      title: quickTitle.trim(),
      completed: false,
      priority: 'medium',
      date: activeCell.day,
      startTime: activeCell.hour
    };
    
    setActiveCell(null);
    setQuickTitle('');
    
    const saved = await dataService.createTask(newTaskData);
    if (saved) {
      setTasks(prev => [...prev, saved]);
      if (onUpdate) onUpdate();
    } else {
      await fetchData();
    }
  };

  const getMoodIcon = (mood?: string) => {
    switch(mood) {
      case 'Happy': return <Smile size={14} className="text-emerald-500" />;
      case 'Sad': return <Frown size={14} className="text-rose-500" />;
      case 'Productive': return <Zap size={14} className="text-indigo-500" fill="currentColor" />;
      default: return <Meh size={14} className="text-slate-300" />;
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="premium-card rounded-[2.5rem] bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 mb-20">
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[1100px]">
          {/* Header Row */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-rose-50 bg-rose-50/30 sticky top-0 z-20 backdrop-blur-md">
            <div className="p-6 flex flex-col items-center justify-center border-r border-rose-50">
               <Clock size={16} className="text-rose-400 mb-2" />
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">TIME LINE</span>
            </div>
            {days.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const reflection = reflections.find(r => r.date === dayStr);
              const isCurrent = isSameDay(day, date);

              return (
                <div
                  key={day.toISOString()}
                  className={`p-4 transition-all border-r border-rose-50 last:border-r-0 flex flex-col gap-3 ${
                    isCurrent ? 'bg-white shadow-inner' : ''
                  }`}
                >
                  <button 
                    onClick={() => onSelectDate(day)}
                    className="flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{format(day, 'EEE')}</div>
                      <div className={`text-xl font-black w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                        isCurrent ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-900 group-hover:text-rose-600'
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                    {reflection && (
                      <div className="flex flex-col items-end gap-1.5">
                         <div className="flex items-center gap-1.5">
                            {getMoodIcon(reflection.mood)}
                            <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                               <Battery size={10} className={reflection.energyLevel > 7 ? 'text-emerald-500' : 'text-rose-500'} />
                               <span className="text-[9px] font-black">{reflection.energyLevel}</span>
                            </div>
                         </div>
                         <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">UP: {reflection.wakeUpTime}</div>
                      </div>
                    )}
                  </button>

                  {reflection?.focus && (
                    <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100 flex items-start gap-1.5">
                       <Target size={10} className="text-amber-500 mt-0.5 shrink-0" />
                       <span className="text-[9px] font-bold text-amber-900 leading-tight line-clamp-2 uppercase italic">{reflection.focus}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Rows */}
          <div className="relative">
            {hours.map(hour => {
              const hourLabel = hour.toString().padStart(2, '0');
              const timeStr = `${hourLabel}:00`;
              
              return (
                <div key={hour} className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-rose-50/50 min-h-[110px]">
                  <div className="p-4 text-right text-[10px] font-black text-slate-300 border-r border-rose-50 bg-white sticky left-0 z-10 flex flex-col justify-start">
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                  
                  {days.map(day => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const tasksAtHour = tasks.filter(t => 
                      t.date === dayStr && 
                      t.startTime?.startsWith(hourLabel)
                    );
                    const isCellEditing = activeCell?.day === dayStr && activeCell?.hour === timeStr;

                    return (
                      <div 
                        key={`${dayStr}-${hour}`} 
                        className="p-2 border-r border-rose-50 last:border-r-0 hover:bg-rose-50/10 transition-colors flex flex-col gap-1.5 relative group min-h-[110px]"
                      >
                        {tasksAtHour.length > 0 ? (
                          tasksAtHour.map(task => (
                            <div 
                              key={task.id}
                              onClick={() => toggleTask(task)}
                              className={`p-2.5 rounded-xl border text-[10px] font-bold leading-tight cursor-pointer transition-all hover:scale-[1.03] shadow-sm relative group/item ${
                                task.completed 
                                  ? 'bg-slate-50 border-transparent opacity-40 text-slate-400' 
                                  : task.priority === 'high' 
                                    ? 'bg-rose-600 border-rose-700 text-white' 
                                    : 'bg-white border-rose-100 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                 <span className="opacity-70">{task.startTime}</span>
                                 <div className="flex items-center gap-1">
                                    <button onClick={(e) => handleDeleteTask(e, task.id)} className="opacity-0 group-hover/item:opacity-100 hover:text-rose-400 p-0.5"><Trash2 size={10}/></button>
                                    {task.completed && <Check size={10} />}
                                 </div>
                              </div>
                              <div className={`truncate ${task.completed ? 'line-through' : ''}`}>
                                {task.title}
                              </div>
                            </div>
                          ))
                        ) : isCellEditing ? (
                          <div className="flex flex-col gap-2 p-1 bg-white rounded-xl shadow-xl z-10 border border-rose-200">
                            <input 
                              ref={inputRef}
                              type="text"
                              className="w-full text-[10px] font-bold p-2 outline-none"
                              placeholder="Title..."
                              value={quickTitle}
                              onChange={(e) => setQuickTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveQuickTask();
                                if (e.key === 'Escape') setActiveCell(null);
                              }}
                            />
                            <div className="flex justify-end gap-1 px-1 pb-1">
                               <button onClick={handleSaveQuickTask} className="p-1 bg-rose-600 text-white rounded"><Check size={12} /></button>
                               <button onClick={() => setActiveCell(null)} className="p-1 text-slate-400"><X size={12} /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <button 
                              onClick={() => {
                                setActiveCell({ day: dayStr, hour: timeStr });
                                setQuickTitle('');
                              }}
                              className="w-full h-full flex items-center justify-center text-rose-200 opacity-20 group-hover:opacity-100 hover:text-rose-600 transition-all active:scale-95"
                            >
                              <Plus size={24} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
