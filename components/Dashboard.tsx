
import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { 
  Zap,
  CheckCircle2,
  Flame,
  AlertCircle,
  ShieldAlert,
  Heart,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  AlertTriangle,
  Plus,
  Sparkles,
  Coffee
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
  const [allReflections, setAllReflections] = useState<DayReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiInsight, setAiInsight] = useState<string>("");
  const [quickTaskTitle, setQuickTaskTitle] = useState("");

  const systemToday = new Date();
  const systemTodayStr = format(systemToday, 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
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
      setAllReflections(refs);

      // AI Insight logic
      const undone = savedHabits.filter(h => h.lastCompleted !== systemTodayStr).length;
      const overdue = tasks.filter(t => !t.completed && t.date < systemTodayStr).length;
      const statusText = `Có ${overdue} việc trễ, ${undone} thói quen chưa xong.`;
      const insight = await getDailyInsight(statusText);
      setAiInsight(insight);

    } catch (e: any) {
      console.error("Lỗi Dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  const nowTimeStr = format(currentTime, 'HH:mm');

  const overdueTasks = allTasks.filter(t => {
    if (t.completed) return false;
    const isPastDay = t.date < systemTodayStr;
    const isTodayPastHour = t.date === systemTodayStr && t.startTime && t.startTime < nowTimeStr;
    return isPastDay || isTodayPastHour;
  });

  const todayTasks = allTasks.filter(t => t.date === systemTodayStr);
  const undoneHabits = habits.filter(h => h.lastCompleted !== systemTodayStr);
  const activeTask = todayTasks.find(t => t.startTime && t.startTime <= nowTimeStr && !t.completed);

  const energyData = Array.from({ length: 7 }, (_, i) => {
    const targetDate = format(addDays(systemToday, -(6 - i)), 'yyyy-MM-dd');
    const found = allReflections.find(r => r.date === targetDate);
    return {
      val: found ? found.energyLevel : 5,
      label: format(addDays(systemToday, -(6 - i)), 'EE', { locale: vi })
    };
  });

  const avgEnergy = (energyData.reduce((acc, d) => acc + d.val, 0) / 7).toFixed(1);

  const handleQuickAdd = async () => {
    if (!quickTaskTitle.trim()) return;
    const newTask = await dataService.createTask({
      title: quickTaskTitle,
      date: systemTodayStr,
      priority: 'medium'
    });
    if (newTask) {
      setAllTasks(prev => [...prev, newTask]);
      setQuickTaskTitle("");
      onUpdate();
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Chào buổi sáng rạng rỡ, má!";
    if (hour < 18) return "Buổi chiều năng suất nhé má!";
    return "Buổi tối an yên, má nghỉ ngơi nhé!";
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang chuẩn bị lộ trình...</p>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
      {/* AI Greeting Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-[2.5rem] widget-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Sparkles size={120} />
        </div>
        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                 <Coffee size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">{getGreeting()}</h2>
           </div>
           <p className="text-sm font-bold text-rose-500 flex items-center gap-2">
              <Sparkles size={16} className="animate-pulse" />
              {aiInsight || "Đang kết nối trí tuệ ảo..."}
           </p>
        </div>
        <div className="flex gap-2 relative z-10">
           <div className="bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">TRẠNG THÁI</span>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full animate-ping ${overdueTasks.length > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                 <span className="text-sm font-black uppercase tracking-widest">{overdueTasks.length > 0 ? 'Cần xử lý' : 'Ổn định'}</span>
              </div>
           </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white widget-shadow rounded-[3rem] p-8 flex flex-col justify-between overflow-hidden relative group hover:border-rose-200 transition-all border border-transparent">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
               <Clock size={16} className="text-rose-500" />
               <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Thời khắc hiện tại</span>
            </div>
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-1 group-hover:scale-105 transition-transform origin-left">
              {format(currentTime, 'HH:mm')}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
              {format(systemToday, 'eeee, dd MMMM yyyy', { locale: vi })}
            </p>
          </div>
          <div className="mt-10 bg-slate-50 p-4 rounded-3xl border border-slate-100 focus-within:border-rose-300 transition-all">
            <div className="flex items-center gap-3">
               <input 
                 type="text" 
                 placeholder="Thêm nhanh việc..."
                 className="bg-transparent text-sm font-bold outline-none flex-1 placeholder:text-slate-300"
                 value={quickTaskTitle}
                 onChange={(e) => setQuickTaskTitle(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
               />
               <button 
                 onClick={handleQuickAdd}
                 className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-rose-500 transition-colors shadow-lg"
               >
                 <Plus size={16} />
               </button>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-8 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 transition-all duration-700 ${
          overdueTasks.length > 0 ? 'bg-rose-600 text-white shadow-2xl shadow-rose-100 ring-4 ring-rose-50' : 'bg-slate-900 text-white shadow-2xl'
        }`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 opacity-80">
              {overdueTasks.length > 0 ? <AlertTriangle size={20} className="animate-bounce" /> : <Zap size={20} className="text-amber-400 fill-amber-400" />}
              <span className="text-[11px] font-black uppercase tracking-widest">
                {overdueTasks.length > 0 ? 'ƯU TIÊN CẤP BÁCH' : 'NHIỆM VỤ ĐANG DIỄN RA'}
              </span>
            </div>
            
            {overdueTasks.length > 0 ? (
              <div>
                <h3 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Cần xử lý {overdueTasks.length} việc trễ!</h3>
                <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                   <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                   <p className="text-sm font-bold truncate max-w-sm italic">"{overdueTasks[0].title}"</p>
                </div>
              </div>
            ) : activeTask ? (
              <div>
                <h3 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">{activeTask.title}</h3>
                <p className="text-sm font-medium opacity-80 italic">Đang trong khung giờ thực hiện. Cố gắng hoàn thành má nhé!</p>
              </div>
            ) : (
              <div>
                <h3 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Mọi thứ trong tầm tay</h3>
                <p className="text-sm font-medium opacity-80 italic">Không có việc trễ. Má đang làm chủ thời gian tuyệt vời!</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => {
              if (overdueTasks.length > 0) {
                 const oldestDate = overdueTasks.sort((a, b) => a.date.localeCompare(b.date))[0].date;
                 onNavigate('day', new Date(oldestDate));
              } else {
                 onNavigate('day', systemToday);
              }
            }}
            className={`px-10 py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-2xl group ${
              overdueTasks.length > 0 ? 'bg-white text-rose-600 hover:shadow-rose-300' : 'bg-rose-500 text-white hover:bg-rose-400 hover:shadow-rose-400/50'
            }`}
          >
            {overdueTasks.length > 0 ? 'Xử lý ngay' : 'Vào Planner'} 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
           <section className="bg-indigo-600 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 opacity-80">
                        <TrendingUp size={18} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Sức bền 7 ngày qua</span>
                      </div>
                      <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/10 text-[10px] font-black">AVG: {avgEnergy}</div>
                   </div>
                   <div className="flex items-end gap-3 h-32 mb-6">
                      {energyData.map((d, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                           <div 
                             className="w-full bg-white/20 rounded-t-xl transition-all hover:bg-white/50 group relative"
                             style={{ height: `${(d.val / 10) * 100}%` }}
                           >
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-indigo-600 px-2 py-1.5 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20">
                                {d.val}/10
                              </div>
                           </div>
                           <span className="text-[9px] font-black opacity-60 uppercase tracking-tighter">{d.label}</span>
                        </div>
                      ))}
                   </div>
                   <p className="text-xs font-medium opacity-70 leading-relaxed italic">Biểu đồ giúp má nhận diện các ngày mệt mỏi để điều chỉnh khối lượng việc.</p>
                </div>

                <div className="bg-white/10 rounded-[2.5rem] p-8 border border-white/10 backdrop-blur-md">
                   <div className="flex items-center justify-between mb-8">
                      <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Flame size={16} className="text-orange-400" /> Kỷ luật hôm nay
                      </h4>
                      <button onClick={() => onNavigate('day', systemToday)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <ArrowRight size={16} />
                      </button>
                   </div>
                   <div className="space-y-5">
                      {habits.length > 0 ? habits.slice(0, 4).map(habit => {
                         const isDone = habit.lastCompleted === systemTodayStr;
                         return (
                           <div key={habit.id} className="flex items-center justify-between gap-4 group">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${isDone ? 'bg-white text-indigo-600 border-white shadow-lg' : 'border-white/20 text-white/30'}`}>
                                    <CheckCircle2 size={18} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className={`text-sm font-black truncate max-w-[140px] ${isDone ? 'opacity-40 line-through' : ''}`}>{habit.title}</span>
                                    <div className="flex items-center gap-1 opacity-40">
                                       <Flame size={10} />
                                       <span className="text-[8px] font-black uppercase tracking-widest">{habit.streak} NGÀY</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                         );
                      }) : (
                        <div className="py-6 text-center border-2 border-dashed border-white/10 rounded-2xl">
                           <p className="text-[10px] text-white/40 italic">Chưa lập thói quen...</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>
           </section>

           <section className="bg-white widget-shadow rounded-[3rem] p-8 md:p-10 border border-slate-50">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <Heart size={20} className="text-rose-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Hình hài 2026 mong đợi</h3>
                 </div>
                 <button onClick={() => onNavigate('vision')} className="group flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest">
                    Vào Manifestation Lab <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {visionItems.slice(0, 4).map(item => (
                   <div key={item.id} className="aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 group relative cursor-pointer shadow-sm hover:shadow-xl transition-all" onClick={() => onNavigate('vision')}>
                      <img src={item.content} alt={item.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                         <span className="text-white text-[8px] font-black uppercase truncate">{item.label}</span>
                      </div>
                   </div>
                 ))}
                 {visionItems.length < 4 && Array.from({ length: 4 - visionItems.length }).map((_, i) => (
                    <button key={i} onClick={() => onNavigate('vision')} className="aspect-[4/5] rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-200 hover:border-rose-200 hover:text-rose-200 transition-all">
                       <Plus size={24} />
                    </button>
                 ))}
              </div>
           </section>
        </div>

        <div className="xl:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-500/10 rounded-full blur-[60px]"></div>
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <Award size={24} />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-widest">Thành quả Kỷ luật</h3>
              </div>
              <div className="space-y-8">
                 <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-[10px] font-black uppercase text-white/60">Tiến độ hôm nay</span>
                       <span className="text-xl font-black">{habits.length > 0 ? Math.round(((habits.length - undoneHabits.length) / habits.length) * 100) : 0}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                       <div 
                         className="h-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-1000" 
                         style={{ width: `${habits.length > 0 ? ((habits.length - undoneHabits.length) / habits.length) * 100 : 0}%` }}
                       />
                    </div>
                 </div>
                 <div className="flex items-center gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all">
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase text-white/40 mb-1">Chuỗi đỉnh</p>
                       <p className="text-3xl font-black text-amber-400">{habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0}</p>
                    </div>
                    <div className="h-10 w-px bg-white/10"></div>
                    <div className="flex-1">
                       <p className="text-[10px] font-bold text-white/60 leading-tight">Tuyệt vời má ơi! Kỷ luật là chìa khóa của tự do.</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white widget-shadow rounded-[3rem] p-10 border border-slate-50">
              <div className="flex items-center gap-2 mb-8">
                 <ShieldAlert size={20} className="text-rose-500" />
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Ghi chú vận hành</h3>
              </div>
              <div className="space-y-5">
                 {overdueTasks.length > 0 && (
                   <div className="flex items-start gap-4 p-5 bg-rose-50 rounded-3xl border border-rose-100 group hover:scale-[1.02] transition-transform">
                      <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                         <p className="text-sm font-black text-rose-900">Ưu tiên xử lý việc trễ</p>
                         <p className="text-[11px] font-bold text-rose-600 mt-1 leading-relaxed">Đừng để nợ cũ làm nặng lòng. Nhanh chóng hoàn thành task từ hôm trước nhé.</p>
                      </div>
                   </div>
                 )}
                 {undoneHabits.length > 0 ? (
                   <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-3xl border border-amber-100 group hover:scale-[1.02] transition-transform">
                      <Flame size={20} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                         <p className="text-sm font-black text-amber-900">Lửa kỷ luật đang cháy</p>
                         <p className="text-[11px] font-bold text-amber-600 mt-1 leading-relaxed">Má còn {undoneHabits.length} thói quen chưa tích. Dành 5 phút để hoàn thành ngay!</p>
                      </div>
                   </div>
                 ) : habits.length > 0 ? (
                   <div className="flex items-start gap-4 p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                         <Award size={20} />
                      </div>
                      <div>
                         <p className="text-sm font-black text-emerald-900">Ngày hoàn hảo!</p>
                         <p className="text-[11px] font-bold text-emerald-600 mt-1 leading-relaxed">Má đã làm chủ 100% thói quen. Phần thưởng là một giấc ngủ thật ngon.</p>
                      </div>
                   </div>
                 ) : (
                   <p className="text-[11px] text-slate-300 italic text-center py-4">Chưa có thông báo vận hành mới...</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
