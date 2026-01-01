
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Check, 
  Trash2, 
  Clock, 
  Target, 
  Flame,
  Zap,
  Sun,
  Moon,
  Smile,
  Frown,
  Meh,
  Battery,
  Settings2,
  X,
  BookOpen
} from 'lucide-react';
import { Task, Habit, DayReflection } from '../types';
import { dataService } from '../services/dataService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';

interface DayViewProps {
  date: Date;
  onUpdate?: () => void;
  refreshKey?: number;
}

const DayView: React.FC<DayViewProps> = ({ date, onUpdate, refreshKey }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [reflection, setReflection] = useState<DayReflection>({
    date: format(date, 'yyyy-MM-dd'),
    energyLevel: 5,
    wakeUpTime: '06:00',
    focus: '',
    gratitude: ['', '', ''],
    mood: 'Neutral',
    journal: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeHour, setActiveHour] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [isManagingHabits, setIsManagingHabits] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

  const loadData = async () => {
    setIsLoading(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    const allTasks = await dataService.getTasks();
    setTasks(allTasks.filter(t => t.date === dateStr));
    
    const savedHabits = await dataService.getHabits();
    setHabits(savedHabits);

    const savedReflection = await dataService.getReflection(dateStr);
    if (savedReflection) {
      setReflection({
        ...savedReflection,
        gratitude: Array.isArray(savedReflection.gratitude) ? savedReflection.gratitude : ['', '', '']
      });
    } else {
      setReflection({
        date: dateStr,
        energyLevel: 5,
        wakeUpTime: '06:00',
        focus: '',
        gratitude: ['', '', ''],
        mood: 'Neutral',
        journal: ''
      });
    }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [date, refreshKey]);

  useEffect(() => {
    if (activeHour && inputRef.current) inputRef.current.focus();
  }, [activeHour]);

  const saveReflectionToDB = async (updatedRef: DayReflection) => {
    await dataService.saveReflection(updatedRef);
    if (onUpdate) onUpdate();
  };

  const updateReflectionLocally = (updates: Partial<DayReflection>) => {
    setReflection(prev => ({ ...prev, ...updates }));
  };

  const handleToggleHabit = async (id: string) => {
    const updated = await dataService.toggleHabit(id);
    setHabits(updated);
    if (onUpdate) onUpdate();
  };

  const handleAddHabit = async () => {
    if (!newHabitTitle.trim()) return;
    const colors = ['bg-rose-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newHabit = await dataService.createHabit({
      title: newHabitTitle,
      streak: 0,
      color: randomColor
    });
    if (newHabit) {
      setHabits(prev => [...prev, newHabit]);
      setNewHabitTitle('');
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (confirm('Má chắc chắn muốn xóa thói quen này?')) {
      await dataService.deleteHabit(id);
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const handleAddTask = async (title: string, time?: string) => {
    if (!title.trim()) { setActiveHour(null); return; }
    const newTask = await dataService.createTask({
      title,
      date: format(date, 'yyyy-MM-dd'),
      startTime: time,
      priority: 'medium'
    });
    if (newTask) {
      setTasks(prev => [...prev, newTask]);
      if (onUpdate) onUpdate();
    }
    setActiveHour(null);
    setInputValue('');
  };

  const handleToggleTask = async (task: Task) => {
    const status = !task.completed;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: status } : t));
    await dataService.updateTask(task.id, { completed: status });
    if (onUpdate) onUpdate();
  };

  const handleUpdateTaskTitle = async (id: string, newTitle: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
    await dataService.updateTask(id, { title: newTitle });
    if (onUpdate) onUpdate();
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await dataService.deleteTask(id);
    if (onUpdate) onUpdate();
  };

  if (isLoading) return (
    <div className="h-96 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between px-2 gap-4">
         <div>
            <div className="flex items-center gap-2 mb-1">
               <Zap size={14} className="text-amber-500 fill-amber-500" />
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">LifeFlow Terminal</p>
            </div>
            <h2 className="text-4xl font-serif italic text-slate-900 dark:text-white">{format(date, 'eeee, dd/MM', { locale: vi })}</h2>
         </div>
         <div className="bg-white dark:bg-[#1C1C1E] px-6 py-4 rounded-[1.5rem] shadow-sm border border-slate-50 dark:border-white/5 flex items-center gap-6">
            <div className="flex flex-col items-center">
               <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase mb-1">Năng lượng</span>
               <div className="flex items-center gap-2">
                  <Battery size={16} className={reflection.energyLevel > 7 ? 'text-emerald-500' : 'text-rose-500'} />
                  <span className="text-xl font-black dark:text-white">{reflection.energyLevel}/10</span>
               </div>
            </div>
            <div className="h-8 w-px bg-slate-100 dark:bg-white/10"></div>
            <div className="flex flex-col items-center">
               <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase mb-1">Thức dậy</span>
               <input 
                  type="text" 
                  className="text-xl font-black w-16 text-center bg-transparent outline-none focus:text-rose-500 dark:text-white border-b border-transparent focus:border-rose-100"
                  value={reflection.wakeUpTime}
                  onChange={(e) => updateReflectionLocally({ wakeUpTime: e.target.value })}
                  onBlur={() => saveReflectionToDB(reflection)}
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <section className="bg-indigo-600 dark:bg-indigo-900/50 rounded-[2.5rem] p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden">
              <Sun className="absolute -right-4 -top-4 w-24 h-24 text-white/10" />
              <div className="relative z-10">
                 <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sun size={14} /> Ý định buổi sáng
                 </h3>
                 <div className="space-y-4">
                    <div>
                       <label className="text-[9px] font-black uppercase text-white/60 mb-1 block">Tiêu điểm hôm nay</label>
                       <input 
                         type="text"
                         value={reflection.focus}
                         onChange={(e) => updateReflectionLocally({ focus: e.target.value })}
                         onBlur={() => saveReflectionToDB(reflection)}
                         placeholder="Một việc quan trọng nhất..."
                         className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/40 outline-none focus:bg-white/20 transition-all"
                       />
                    </div>
                    <div>
                       <label className="text-[9px] font-black uppercase text-white/60 mb-1 block">Năng lượng ({reflection.energyLevel}/10)</label>
                       <input 
                         type="range" min="1" max="10" 
                         value={reflection.energyLevel}
                         onChange={(e) => updateReflectionLocally({ energyLevel: parseInt(e.target.value) })}
                         onMouseUp={() => saveReflectionToDB(reflection)}
                         className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                       />
                    </div>
                 </div>
              </div>
           </section>

           <div className="bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] p-6 shadow-sm border border-slate-50 dark:border-white/5">
              <div className="flex items-center justify-between mb-6 border-b border-slate-50 dark:border-white/5 pb-3">
                 <div className="flex items-center gap-2">
                    <Flame size={16} className="text-rose-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Chuỗi Kỷ luật</h3>
                 </div>
                 <button onClick={() => setIsManagingHabits(!isManagingHabits)} className="text-slate-300 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {isManagingHabits ? <X size={16} /> : <Settings2 size={16} />}
                 </button>
              </div>
              
              <div className="space-y-4">
                 {isManagingHabits && (
                    <div className="flex gap-2 mb-4">
                       <input 
                          type="text" 
                          placeholder="Thói quen mới..." 
                          className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-rose-200 dark:text-white"
                          value={newHabitTitle}
                          onChange={(e) => setNewHabitTitle(e.target.value)}
                       />
                       <button onClick={handleAddHabit} className="bg-rose-500 text-white p-2 rounded-xl"><Plus size={16}/></button>
                    </div>
                 )}
                 {habits.map(habit => {
                    const isDone = habit.lastCompleted === format(date, 'yyyy-MM-dd');
                    return (
                      <div key={habit.id} className="flex items-center justify-between group">
                        <button 
                          onClick={() => handleToggleHabit(habit.id)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                              isDone ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-200 dark:text-slate-700 hover:border-rose-200'
                           }`}>
                              <Check size={18} strokeWidth={3} />
                           </div>
                           <div className="flex flex-col items-start">
                              <span className={`text-[8px] font-black uppercase tracking-widest ${isDone ? 'text-slate-300 dark:text-slate-700' : 'text-slate-400 dark:text-slate-600'}`}>
                                 STREAK: {habit.streak} NGÀY
                              </span>
                              <span className={`text-xs font-bold ${isDone ? 'text-slate-300 dark:text-slate-700 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{habit.title}</span>
                           </div>
                        </button>
                        {isManagingHabits && (
                           <button onClick={() => handleDeleteHabit(habit.id)} className="p-2 text-rose-200 dark:text-rose-900 hover:text-rose-500"><Trash2 size={14}/></button>
                        )}
                      </div>
                    );
                 })}
              </div>
           </div>

           <section className="bg-slate-900 dark:bg-black/80 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden">
              <Moon className="absolute -right-4 -top-4 w-24 h-24 text-white/5" />
              <div className="relative z-10">
                 <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Moon size={14} /> Đúc kết buổi tối
                 </h3>
                 <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-white/60 block">3 Điều biết ơn hôm nay</label>
                    {reflection.gratitude.map((g, idx) => (
                      <input 
                        key={idx}
                        type="text"
                        value={g}
                        onChange={(e) => {
                          const newGrat = [...reflection.gratitude];
                          newGrat[idx] = e.target.value;
                          updateReflectionLocally({ gratitude: newGrat });
                        }}
                        onBlur={() => saveReflectionToDB(reflection)}
                        placeholder={`${idx + 1}. Tôi biết ơn vì...`}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold placeholder:text-white/20 outline-none focus:bg-white/10 transition-all"
                      />
                    ))}
                    <div className="pt-2 flex justify-between items-center">
                       <span className="text-[9px] font-black uppercase text-white/40">Tâm trạng</span>
                       <div className="flex gap-2">
                          {[
                            { icon: <Frown size={16}/>, key: 'Sad' },
                            { icon: <Meh size={16}/>, key: 'Neutral' },
                            { icon: <Smile size={16}/>, key: 'Happy' },
                            { icon: <Zap size={16}/>, key: 'Productive' }
                          ].map(m => (
                            <button 
                              key={m.key}
                              onClick={() => {
                                const updated = { ...reflection, mood: m.key };
                                setReflection(updated);
                                saveReflectionToDB(updated);
                              }}
                              className={`p-2 rounded-lg transition-all ${reflection.mood === m.key ? 'bg-rose-500 text-white' : 'text-white/30 hover:text-white'}`}
                            >
                              {m.icon}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </section>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-white/5 overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-black/10">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                    <Clock size={16} />
                 </div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Nhật ký Thực thi</h3>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-600">Tiến độ việc</span>
                     <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-indigo-500 transition-all duration-500" 
                       style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
                     />
                  </div>
               </div>
            </div>
            
            <div className="p-8 space-y-8 flex-1">
               <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border-2 border-slate-50 dark:border-white/5 shadow-sm focus-within:border-indigo-100 dark:focus-within:border-indigo-500/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-black/20 flex items-center justify-center text-slate-400 dark:text-slate-600"><Plus size={20} /></div>
                  <input 
                    type="text"
                    placeholder="Đặt mục tiêu thực thi mới cho hôm nay..."
                    className="bg-transparent text-sm font-bold outline-none w-full placeholder:text-slate-300 dark:text-slate-700 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTask((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
               </div>

               <div className="relative pl-12 space-y-4 mb-10">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-indigo-100 dark:via-indigo-900 to-transparent"></div>
                  {hours.map((hour) => {
                    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
                    const tasksAtHour = tasks.filter(t => t.startTime === timeLabel);
                    const isEditing = activeHour === timeLabel;

                    return (
                      <div key={hour} className={`flex items-start gap-6 group relative`}>
                        <div className="absolute left-[-28px] top-1 w-2.5 h-2.5 rounded-full border-2 border-indigo-500 bg-white dark:bg-black z-10 group-hover:scale-150 transition-all"></div>
                        <div className="w-16 shrink-0 pt-0.5">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-tighter">
                            {hour > 12 ? `${hour-12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                          </span>
                        </div>
                        <div className="flex-1">
                          {tasksAtHour.length > 0 ? (
                            tasksAtHour.map(task => (
                              <div key={task.id} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border-2 border-slate-50 dark:border-white/5 shadow-sm mb-3 last:mb-0 group/task hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-4 flex-1 text-left">
                                  <button onClick={() => handleToggleTask(task)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'border-slate-100 dark:border-white/10 dark:bg-white/5 hover:border-indigo-300'}`}>
                                    <Check size={14} strokeWidth={3} />
                                  </button>
                                  <input 
                                    className={`text-sm font-bold bg-transparent outline-none w-full ${task.completed ? 'text-slate-300 dark:text-slate-700 line-through' : 'text-slate-800 dark:text-white'}`}
                                    value={task.title}
                                    onChange={(e) => {
                                       const val = e.target.value;
                                       setTasks(prev => prev.map(t => t.id === task.id ? {...t, title: val} : t));
                                    }}
                                    onBlur={(e) => handleUpdateTaskTitle(task.id, e.target.value)}
                                  />
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover/task:opacity-100 transition-all">
                                   <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-slate-200 dark:text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                </div>
                              </div>
                            ))
                          ) : isEditing ? (
                            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/30">
                               <input 
                                ref={inputRef}
                                className="w-full bg-transparent text-sm font-bold outline-none text-indigo-600 dark:text-indigo-400 placeholder:text-indigo-200 dark:placeholder:text-indigo-800"
                                placeholder="Viết hành động cụ thể..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask(inputValue, timeLabel)}
                              />
                            </div>
                          ) : (
                            <button 
                              onClick={() => setActiveHour(timeLabel)} 
                              className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all py-2"
                            >
                               + Dành thời gian
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
               </div>

               <div className="mt-12 bg-slate-50/50 dark:bg-black/20 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3 mb-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white/10 text-white flex items-center justify-center">
                       <BookOpen size={20} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Viết Tự do / Nhật ký</h3>
                  </div>
                  <textarea 
                    className="w-full h-40 bg-transparent text-sm font-medium leading-relaxed outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-700 dark:text-slate-300"
                    placeholder="Hôm nay má cảm thấy thế nào? Có bài học nào đáng nhớ không?"
                    value={reflection.journal || ''}
                    onChange={(e) => updateReflectionLocally({ journal: e.target.value })}
                    onBlur={() => saveReflectionToDB(reflection)}
                  />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
