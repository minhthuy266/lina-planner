
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

      const insight = await getDailyInsight(tasks.filter(t => !t.completed && t.date < systemTodayStr).length > 0 ? "Cần xử lý việc trễ!" : "Hôm nay tuyệt vời.");
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

  const enduranceData = [5.5, 7.5, 4.0, 9.5, 8.0, 7.2, 8.5];
  const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), 6 - i), 'EEE', { locale: vi }));

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
      <div className="w-10 h-10 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* 1. Header Card */}
      <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-50 flex items-center gap-4">
         <div className="w-14 h-14 bg-[#FFF8E7] rounded-2xl flex items-center justify-center text-[#D97706] shrink-0">
            <Coffee size={28} />
         </div>
         <div className="flex-1">
            <h2 className="text-[20px] font-black text-slate-900 leading-tight">Buổi tối an yên, má nghỉ ngơi nhé!</h2>
            <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1.5 mt-1 uppercase tracking-wide">
               <Zap size={10} className="fill-rose-500" /> {aiInsight || "Mỗi bước nhỏ đều dẫn tới thành công lớn. Cố lên má nhé!"}
            </p>
         </div>
      </section>

      {/* 2. Status Pill - Centered */}
      <div className="flex justify-center">
        <div className="bg-white px-8 py-3 rounded-full border border-slate-100 shadow-sm text-center">
           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">TRẠNG THÁI</p>
           <p className="text-[11px] font-black text-slate-900 uppercase">CẦN XỬ LÝ</p>
        </div>
      </div>

      {/* 3. Hero Stack for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Time Card */}
        <div className="lg:col-span-4 bg-white rounded-[3rem] p-8 shadow-sm border border-slate-50 flex flex-col justify-between min-h-[340px]">
           <div>
              <div className="flex items-center gap-2 mb-4">
                 <Clock size={16} className="text-rose-400" />
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">THỜI KHẮC HIỆN TẠI</span>
              </div>
              <h3 className="text-[80px] font-black text-slate-950 tracking-tighter leading-none">{format(currentTime, 'HH:mm')}</h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{format(currentTime, 'eeee, dd MMMM yyyy', { locale: vi })}</p>
           </div>
           
           <div className="relative mt-10">
              <input 
                type="text" 
                placeholder="Thêm nhanh việc..."
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] py-5 px-8 text-sm font-bold outline-none focus:border-rose-200 transition-all placeholder:text-slate-300 shadow-inner"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              />
              <button onClick={handleQuickAdd} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center active:scale-95 transition-transform">
                 <Plus size={24} />
              </button>
           </div>
        </div>

        {/* Overdue Red Card */}
        <div className="lg:col-span-8 bg-[#EF233C] rounded-[3rem] p-10 text-white shadow-2xl shadow-rose-200 flex flex-col justify-between gap-8 relative overflow-hidden group min-h-[340px]">
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
                    "{overdueTasks[0]?.title || "Anh không"}"
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

      {/* 4. Secondary Row: Sức bền & Thành quả */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Purple Card */}
        <div className="lg:col-span-8 bg-[#5851DB] rounded-[3.5rem] p-10 text-white shadow-xl shadow-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-10">
           <div>
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">SỨC BỀN 7 NGÀY QUA</span>
                 </div>
                 <div className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black">AVG: 7.4</div>
              </div>
              <div className="flex items-end justify-between h-40 gap-2 mb-8">
                 {enduranceData.map((val, i) => (
                   <div key={i} className="flex flex-col items-center gap-3 flex-1">
                      <div className="w-full bg-white/20 rounded-t-xl relative h-full flex items-end">
                         <div className="w-full bg-white/40 rounded-t-xl transition-all duration-1000" style={{ height: `${val * 10}%` }} />
                      </div>
                      <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">{last7Days[i]}</span>
                   </div>
                 ))}
              </div>
              <p className="text-[10px] font-bold opacity-50 leading-relaxed italic">Biểu đồ giúp má nhận diện các ngày mệt mỏi để điều chỉnh khối lượng việc.</p>
           </div>

           <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <Flame size={18} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">KỶ LUẬT HÔM NAY</span>
                 </div>
                 <ArrowRight size={18} className="opacity-40" />
              </div>
              <div className="space-y-6">
                 {habits.slice(0, 4).map(h => {
                    const isDone = h.lastCompleted === systemTodayStr;
                    return (
                      <div key={h.id} className="flex items-center gap-5">
                        <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center border-2 ${isDone ? 'bg-white border-white text-[#5851DB]' : 'border-white/20 text-white/20'}`}>
                           <CheckCircle2 size={20} strokeWidth={3} />
                        </div>
                        <div className="flex flex-col">
                           <p className={`text-[13px] font-black ${isDone ? 'opacity-40 line-through' : ''}`}>{h.title}</p>
                           <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest mt-0.5">🔥 {h.streak} NGÀY</p>
                        </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>

        {/* Dark Result Card */}
        <div className="lg:col-span-4 bg-[#0D1117] rounded-[3.5rem] p-10 text-white shadow-2xl flex flex-col justify-between min-h-[460px]">
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
                 <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${habitPercent}%` }} />
                 </div>
              </div>

              <div className="bg-[#161B22] rounded-[2.5rem] p-8 border border-slate-800 flex items-center gap-8">
                 <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">CHUỖI ĐỈNH</p>
                    <p className="text-5xl font-black text-amber-500 tracking-tighter">{maxStreak}</p>
                 </div>
                 <div className="w-px h-16 bg-slate-800"></div>
                 <p className="text-[12px] font-bold text-slate-400 italic leading-relaxed">"Tuyệt vời má ơi! Kỷ luật là chìa khóa của tự do."</p>
              </div>
           </div>
           
           <button onClick={() => onNavigate('day')} className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.25em] transition-all active:scale-95">CHI TIẾT THÀNH TỰU</button>
        </div>
      </div>

      {/* 5. Vision Board & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-50">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <Heart size={24} className="text-rose-500 fill-rose-500" />
                 <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">HÌNH HÀI 2026 MONG ĐỢI</h3>
              </div>
              <button onClick={() => onNavigate('vision')} className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 flex items-center gap-2">
                 VÀO MANIFESTATION LAB <ArrowRight size={14} />
              </button>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {visionItems.slice(0, 3).map(item => (
                <div key={item.id} className="aspect-[3/4] rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 group">
                   <img src={item.content} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
              ))}
              <button 
                onClick={() => onNavigate('vision')}
                className="aspect-[3/4] rounded-[2rem] border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-200 hover:text-rose-300 hover:border-rose-100 transition-all"
              >
                 <Plus size={32} />
              </button>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
              <div className="flex items-center gap-3 mb-8">
                 <Target size={20} className="text-rose-500" />
                 <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400">GHI CHÚ VẬN HÀNH</h3>
              </div>
              <div className="space-y-4">
                 <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex items-start gap-4">
                    <AlertCircle size={24} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                       <h4 className="text-[13px] font-black text-rose-900 uppercase mb-2">Ưu tiên xử lý việc trễ</h4>
                       <p className="text-[11px] font-bold text-rose-700 leading-relaxed opacity-80">Đừng để nợ cũ làm nặng lòng. Nhanh chóng hoàn thành task từ hôm trước nhé.</p>
                    </div>
                 </div>
                 <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[1rem] bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-100">
                       <Zap size={20} />
                    </div>
                    <div>
                       <h4 className="text-[13px] font-black text-emerald-900 uppercase mb-2">Ngày hoàn hảo!</h4>
                       <p className="text-[11px] font-bold text-emerald-700 leading-relaxed opacity-80">Má đã làm chủ 100% thói quen. Phần thưởng là một giấc ngủ thật ngon.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
