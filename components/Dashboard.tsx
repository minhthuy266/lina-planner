
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
  ChevronRight,
  Target
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { getDailyInsight } from '../services/geminiService';
import { Task, VisionItem, ViewType, Habit, DayReflection } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewType, date?: Date) => void;
  onUpdate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onUpdate }) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [reflections, setReflections] = useState<DayReflection[]>([]);
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
      const [tasks, savedHabits, visions, refs] = await Promise.all([
        dataService.getTasks(),
        dataService.getHabits(),
        dataService.getVisionItems(),
        dataService.getAllReflections()
      ]);
      setAllTasks(tasks);
      setHabits(savedHabits);
      setVisionItems(visions);
      setReflections(refs);

      const insight = await getDailyInsight(`Má đang có ${tasks.filter(t => !t.completed && t.date === systemTodayStr).length} việc.`);
      setAiInsight(insight);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const overdueTasks = allTasks.filter(t => !t.completed && t.date < systemTodayStr);
  const todayTasks = allTasks.filter(t => t.date === systemTodayStr);
  const completedHabitsToday = habits.filter(h => h.lastCompleted === systemTodayStr).length;
  const disciplinePercent = habits.length > 0 ? Math.round((completedHabitsToday / habits.length) * 100) : 0;

  // Giả lập dữ liệu sức bền 7 ngày (hoặc tính từ reflections nếu có)
  const enduranceData = [7.2, 8.5, 5.0, 9.2, 8.8, 7.5, 8.0];
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
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* Top Header Row */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 px-6 rounded-[2rem] border border-white/40 shadow-sm flex-1">
           <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
              <Coffee size={20} />
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Buổi tối an yên, má nghỉ ngơi nhé!</h2>
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                 <Zap size={10} className="fill-rose-500" /> {aiInsight || "Mỗi bước nhỏ đều dẫn tới thành công lớn. Cố lên má nhé!"}
              </p>
           </div>
        </div>
        <div className="bg-white/80 p-3 px-6 rounded-[2rem] border border-white/40 shadow-sm text-center">
           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">TRẠNG THÁI</p>
           <p className="text-[11px] font-black text-slate-900 uppercase">CẦN XỬ LÝ</p>
        </div>
      </section>

      {/* Hero Grid: Time & Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Time Card */}
        <div className="lg:col-span-4 bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-100/50 border border-slate-50 flex flex-col justify-between min-h-[320px]">
           <div>
              <div className="flex items-center gap-2 mb-4">
                 <Clock size={14} className="text-rose-400" />
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">THỜI KHẮC HIỆN TẠI</span>
              </div>
              <h3 className="text-7xl font-black text-slate-950 tracking-tighter">{format(currentTime, 'HH:mm')}</h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{format(currentTime, 'eeee, dd MMMM yyyy', { locale: vi })}</p>
           </div>
           
           <div className="relative mt-8">
              <input 
                type="text" 
                placeholder="Thêm nhanh việc..."
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 text-sm font-bold outline-none focus:border-rose-200 transition-all placeholder:text-slate-300"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              />
              <button onClick={handleQuickAdd} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                 <Plus size={20} />
              </button>
           </div>
        </div>

        {/* Overdue Urgent Card */}
        <div className="lg:col-span-8 bg-rose-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-rose-200 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group min-h-[320px]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
           <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-6 opacity-80">
                 <AlertCircle size={16} />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">ƯU TIÊN CẤP BÁCH</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
                Cần xử lý {overdueTasks.length} việc trễ!
              </h3>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 max-w-md">
                 <p className="text-sm font-bold opacity-90 italic">
                    "{overdueTasks[0]?.title || "Anh không"}"
                 </p>
              </div>
           </div>
           <button 
             onClick={() => onNavigate('day')}
             className="relative z-10 bg-white text-rose-600 px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-slate-50 transition-all active:scale-95 shrink-0"
           >
              XỬ LÝ NGAY <ChevronRight size={16} />
           </button>
        </div>
      </div>

      {/* Main Stats Row: Endurance & Discipline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endurance & Daily Discipline (Purple Card) */}
        <div className="lg:col-span-8 bg-indigo-600 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-indigo-200 grid grid-cols-1 md:grid-cols-2 gap-10">
           {/* Graph Side */}
           <div>
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">SỨC BỀN 7 NGÀY QUA</span>
                 </div>
                 <div className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black">AVG: 7.4</div>
              </div>
              <div className="flex items-end justify-between h-40 gap-2 mb-6">
                 {enduranceData.map((val, i) => (
                   <div key={i} className="flex flex-col items-center gap-3 flex-1">
                      <div 
                        className="w-full bg-white/20 rounded-t-xl relative group"
                        style={{ height: `${val * 10}%` }}
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-indigo-600 text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {val}
                         </div>
                      </div>
                      <span className="text-[8px] font-black uppercase opacity-60">{last7Days[i]}</span>
                   </div>
                 ))}
              </div>
              <p className="text-[10px] font-bold opacity-60 leading-relaxed italic">Biểu đồ giúp má nhận diện các ngày mệt mỏi để điều chỉnh khối lượng việc.</p>
           </div>

           {/* Habit Checklist Side */}
           <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                      <Flame size={16} className="text-amber-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">KỶ LUẬT HÔM NAY</span>
                  </div>
                  <button onClick={() => onNavigate('day')}><ArrowRight size={16} className="opacity-60" /></button>
                </div>
                <div className="space-y-4">
                  {habits.slice(0, 4).map(h => {
                    const isDone = h.lastCompleted === systemTodayStr;
                    return (
                      <div key={h.id} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 ${isDone ? 'bg-white border-white text-indigo-600' : 'border-white/20 text-white/20'}`}>
                           <CheckCircle2 size={16} strokeWidth={3} />
                        </div>
                        <div>
                           <p className={`text-xs font-black ${isDone ? 'opacity-40 line-through' : ''}`}>{h.title}</p>
                           <p className="text-[9px] font-bold opacity-60">🔥 {h.streak} NGÀY</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
           </div>
        </div>

        {/* Discipline Result (Dark Card) */}
        <div className="lg:col-span-4 bg-slate-950 rounded-[3.5rem] p-10 text-white shadow-2xl flex flex-col justify-between min-h-[450px]">
           <div>
              <div className="flex items-center gap-3 mb-10">
                 <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                    <Award size={20} />
                 </div>
                 <h3 className="text-xs font-black uppercase tracking-widest">THÀNH QUẢ KỶ LUẬT</h3>
              </div>
              
              <div className="mb-10">
                 <div className="flex items-end justify-between mb-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TIẾN ĐỘ HÔM NAY</span>
                    <span className="text-3xl font-black">{disciplinePercent}%</span>
                 </div>
                 <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-1000" 
                      style={{ width: `${disciplinePercent}%` }}
                    />
                 </div>
              </div>

              <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800 flex items-center gap-6">
                 <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">CHUỖI ĐỈNH</p>
                    <p className="text-4xl font-black text-amber-500">{Math.max(...habits.map(h => h.streak), 0)}</p>
                 </div>
                 <div className="w-px h-12 bg-slate-800"></div>
                 <p className="text-[10px] font-bold text-slate-400 italic">"Tuyệt vời má ơi! Kỷ luật là chìa khóa của tự do."</p>
              </div>
           </div>
           
           <button onClick={() => onNavigate('day')} className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">CHI TIẾT THÀNH TỰU</button>
        </div>
      </div>

      {/* Vision & Notes Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vision Board Preview */}
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-50">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                 <Heart size={20} className="text-rose-500 fill-rose-500" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">HÌNH HÀI 2026 MONG ĐỢI</h3>
              </div>
              <button onClick={() => onNavigate('vision')} className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                 VÀO MANIFESTATION LAB <ChevronRight size={14} />
              </button>
           </div>
           <div className="grid grid-cols-4 gap-4">
              {visionItems.slice(0, 3).map(item => (
                <div key={item.id} className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 group">
                   <img src={item.content} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
              ))}
              <button 
                onClick={() => onNavigate('vision')}
                className="aspect-[4/5] rounded-[2rem] border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-200 hover:text-rose-300 hover:border-rose-100 transition-all"
              >
                 <Plus size={32} />
              </button>
           </div>
        </div>

        {/* Notes Sidebar */}
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-50">
              <div className="flex items-center gap-3 mb-6">
                 <Target size={18} className="text-rose-500" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">GHI CHÚ VẬN HÀNH</h3>
              </div>
              
              <div className="space-y-4">
                 <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 flex items-start gap-4">
                    <AlertCircle size={20} className="text-rose-500 shrink-0" />
                    <div>
                       <h4 className="text-[11px] font-black text-rose-900 uppercase mb-1">Ưu tiên xử lý việc trễ</h4>
                       <p className="text-[10px] font-bold text-rose-700 leading-relaxed">Đừng để nợ cũ làm nặng lòng. Nhanh chóng hoàn thành task từ hôm trước nhé.</p>
                    </div>
                 </div>

                 <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                       <Zap size={16} />
                    </div>
                    <div>
                       <h4 className="text-[11px] font-black text-emerald-900 uppercase mb-1">Ngày hoàn hảo!</h4>
                       <p className="text-[10px] font-bold text-emerald-700 leading-relaxed">Má đã làm chủ 100% thói quen. Phần thưởng là một giấc ngủ thật ngon.</p>
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
