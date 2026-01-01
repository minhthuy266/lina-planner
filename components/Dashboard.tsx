
import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Heart, 
  TrendingUp, 
  Award, 
  ArrowRight,
  Plus,
  AlertCircle,
  Coffee,
  Target
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { getDailyInsight } from '../services/geminiService';
import { Task, VisionItem, ViewType, Habit } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewType, date?: Date) => void;
  onUpdate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onUpdate }) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const systemTodayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchData();
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasks, savedHabits, visions] = await Promise.all([
        dataService.getTasks(),
        dataService.getHabits(),
        dataService.getVisionItems()
      ]);
      setAllTasks(tasks);
      setHabits(savedHabits);
      setVisionItems(visions);
      const insight = await getDailyInsight(tasks.filter(t => !t.completed && t.date < systemTodayStr).length > 0 ? "Việc trễ" : "Ngày mới");
      setAiInsight(insight);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const overdueTasks = allTasks.filter(t => !t.completed && t.date < systemTodayStr);
  const habitsDoneToday = habits.filter(h => h.lastCompleted === systemTodayStr).length;
  const habitPercent = habits.length > 0 ? Math.round((habitsDoneToday / habits.length) * 100) : 0;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0;

  const handleQuickAdd = async () => {
    if (!quickTaskTitle.trim()) return;
    const newTask = await dataService.createTask({ title: quickTaskTitle, date: systemTodayStr });
    if (newTask) {
      setAllTasks(prev => [...prev, newTask]);
      setQuickTaskTitle("");
      onUpdate();
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      
      {/* 1. Header Card */}
      <section className="bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] p-6 shadow-sm border border-slate-50 dark:border-white/5 flex items-center gap-4 transition-colors">
         <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
            <Coffee size={28} />
         </div>
         <div className="flex-1">
            <h2 className="text-[20px] font-black leading-tight">Buổi tối an yên, má nghỉ ngơi nhé!</h2>
            <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1.5 mt-1 uppercase tracking-wide">
               <Zap size={10} className="fill-rose-500" /> {aiInsight}
            </p>
         </div>
      </section>

      {/* 2. Status Pill */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-[#1C1C1E] px-8 py-3 rounded-full border border-slate-100 dark:border-white/5 shadow-sm text-center">
           <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">TRẠNG THÁI</p>
           <p className="text-[11px] font-black uppercase">CẦN XỬ LÝ</p>
        </div>
      </div>

      {/* 3. Hero Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white dark:bg-[#1C1C1E] rounded-[3rem] p-8 shadow-sm border border-slate-50 dark:border-white/5 flex flex-col justify-between min-h-[340px]">
           <div>
              <div className="flex items-center gap-2 mb-4">
                 <Clock size={16} className="text-rose-400" />
                 <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">THỜI KHẮC HIỆN TẠI</span>
              </div>
              <h3 className="text-[80px] font-black tracking-tighter leading-none dark:text-white">{format(currentTime, 'HH:mm')}</h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{format(currentTime, 'eeee, dd MMMM yyyy', { locale: vi })}</p>
           </div>
           
           <div className="relative mt-10">
              <input 
                type="text" 
                placeholder="Thêm nhanh việc..."
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold outline-none focus:border-rose-200 transition-all placeholder:text-slate-300 dark:text-white"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              />
              <button onClick={handleQuickAdd} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 dark:bg-rose-600 text-white rounded-[1.2rem] flex items-center justify-center active:scale-95 transition-transform">
                 <Plus size={24} />
              </button>
           </div>
        </div>

        <div className="lg:col-span-8 bg-[#EF233C] rounded-[3rem] p-10 text-white shadow-2xl shadow-rose-200 dark:shadow-rose-900/10 flex flex-col justify-between gap-8 relative overflow-hidden group min-h-[340px]">
           <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 opacity-70">
                 <AlertCircle size={20} />
                 <span className="text-[11px] font-black uppercase tracking-[0.4em]">ƯU TIÊN CẤP BÁCH</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">
                Cần xử lý {overdueTasks.length || 1} việc trễ!
              </h3>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 max-w-md">
                 <p className="text-[15px] font-bold opacity-90 italic">
                    "{overdueTasks[0]?.title || "Anh chưa hoàn thành mục tiêu sáng..."}"
                 </p>
              </div>
           </div>
           <button 
             onClick={() => onNavigate('day')}
             className="relative z-10 w-full md:w-auto bg-white text-[#EF233C] px-10 py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
           >
              XỬ LÝ NGAY <ArrowRight size={20} />
           </button>
        </div>
      </div>

      {/* 4. Achievement Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-[#0D1117] dark:bg-[#1C1C1E] rounded-[3.5rem] p-10 text-white shadow-2xl flex flex-col justify-between min-h-[460px] lg:col-span-4">
           <div>
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-12 h-12 bg-amber-500/10 rounded-[1.2rem] flex items-center justify-center text-amber-500">
                    <Award size={24} />
                 </div>
                 <h3 className="text-[12px] font-black uppercase tracking-widest">THÀNH QUẢ KỶ LUẬT</h3>
              </div>
              
              <div className="mb-12">
                 <div className="flex items-end justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TIẾN ĐỘ HÔM NAY</span>
                    <span className="text-4xl font-black">{habitPercent}%</span>
                 </div>
                 <div className="h-2.5 bg-slate-900 dark:bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${habitPercent}%` }} />
                 </div>
              </div>

              <div className="bg-[#161B22] dark:bg-black/40 rounded-[2.5rem] p-8 border border-slate-800 dark:border-white/5 flex items-center gap-8">
                 <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">CHUỖI ĐỈNH</p>
                    <p className="text-5xl font-black text-amber-500 tracking-tighter">{maxStreak}</p>
                 </div>
                 <div className="w-px h-16 bg-slate-800"></div>
                 <p className="text-[12px] font-bold text-slate-400 italic leading-relaxed">"Tuyệt vời má ơi! Kỷ luật là chìa khóa của tự do."</p>
              </div>
           </div>
           
           <button onClick={() => onNavigate('day')} className="w-full mt-8 py-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.25em] transition-all active:scale-95">CHI TIẾT THÀNH TỰU</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
