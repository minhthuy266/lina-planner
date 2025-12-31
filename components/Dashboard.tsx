
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
  Star,
  RefreshCw,
  Database
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Task, VisionItem, ViewType, Habit, DayReflection } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
  onUpdate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onUpdate }) => {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [reflection, setReflection] = useState<DayReflection | null>(null);
  const [allReflections, setAllReflections] = useState<DayReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      // Kiểm tra kết nối database
      const [tasks, savedHabits, visions, ref, refs] = await Promise.all([
        dataService.getTasks(),
        dataService.getHabits(),
        dataService.getVisionItems(),
        dataService.getReflection(todayStr),
        dataService.getAllReflections()
      ]);

      // Nếu không có dữ liệu nào trả về và không phải do bảng trống, có thể là lỗi fetch
      if (tasks.length === 0 && savedHabits.length === 0 && visions.length === 0 && !ref) {
        // Đây là một phỏng đoán, nhưng giúp người dùng biết có vấn đề
        console.warn("Dữ liệu trống, kiểm tra Supabase Dashboard của má nhé!");
      }

      setTodayTasks(tasks.filter(t => t.date === todayStr));
      setHabits(savedHabits);
      setVisionItems(visions);
      setReflection(ref);
      setAllReflections(refs);
    } catch (e: any) {
      console.error("Lỗi Dashboard:", e);
      if (e.message?.includes('fetch')) {
        setError("Không thể kết nối tới Database. Má hãy kiểm tra xem Supabase có bị Paused không nhé!");
      } else {
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHabit = async (id: string) => {
    const updated = await dataService.toggleHabit(id);
    setHabits(updated);
    onUpdate();
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const undoneTasks = todayTasks.filter(t => !t.completed);
  const completedTasksCount = todayTasks.filter(t => t.completed).length;
  
  const nowStr = format(currentTime, 'HH:mm');
  const activeTask = todayTasks.find(t => t.startTime && t.startTime <= nowStr && !t.completed);
  const overdueTasks = todayTasks.filter(t => {
    if (!t.startTime || t.completed) return false;
    return t.startTime < nowStr;
  });

  const undoneHabits = habits.filter(h => h.lastCompleted !== today);

  const energyData = Array.from({ length: 7 }, (_, i) => {
    const targetDate = format(addDays(new Date(), -(6 - i)), 'yyyy-MM-dd');
    const found = allReflections.find(r => r.date === targetDate);
    return {
      val: found ? found.energyLevel : 5,
      date: targetDate,
      label: format(addDays(new Date(), -(6 - i)), 'EE', { locale: vi })
    };
  });

  const avgEnergy = (energyData.reduce((acc, d) => acc + d.val, 0) / 7).toFixed(1);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang đồng bộ dữ liệu Lumina...</p>
    </div>
  );

  if (error) return (
    <div className="h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[3rem] widget-shadow max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
        <Database size={40} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4">Lỗi kết nối Database</h3>
      <p className="text-slate-500 mb-8 font-medium leading-relaxed">
        {error} <br/>
        <span className="text-[10px] text-slate-400 uppercase mt-4 block">Gợi ý: Kiểm tra Supabase URL và Anon Key trong Environment Variables</span>
      </p>
      <button 
        onClick={fetchData}
        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl active:scale-95"
      >
        <RefreshCw size={18} /> Thử kết nối lại
      </button>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      {/* Real-time Status & Alert */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white widget-shadow rounded-[3rem] p-8 flex flex-col justify-between overflow-hidden relative border-l-[6px] border-rose-500">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
               <Clock size={16} className="text-rose-500" />
               <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Thời gian thực tế</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">
              {format(currentTime, 'HH:mm')}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {format(currentTime, 'eeee, dd MMMM', { locale: vi })}
            </p>
          </div>
          <div className="mt-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tiến độ nhiệm vụ</p>
              <span className="text-xs font-black text-rose-600">{completedTasksCount}/{todayTasks.length}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-1000 ease-out" 
                style={{ width: `${todayTasks.length > 0 ? (completedTasksCount / todayTasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className={`lg:col-span-8 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 transition-all duration-500 ${
          overdueTasks.length > 0 ? 'bg-rose-600 text-white shadow-2xl shadow-rose-200' : 'bg-slate-900 text-white shadow-2xl'
        }`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 opacity-80">
              {overdueTasks.length > 0 ? <AlertTriangle size={20} className="animate-pulse" /> : <Zap size={20} className="text-amber-400 fill-amber-400" />}
              <span className="text-[11px] font-black uppercase tracking-widest">
                {overdueTasks.length > 0 ? 'HÀNH ĐỘNG KHẨN CẤP' : 'TIÊU ĐIỂM HIỆN TẠI'}
              </span>
            </div>
            
            {overdueTasks.length > 0 ? (
              <div>
                <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">Má ơi, có {overdueTasks.length} việc bị trễ!</h3>
                <p className="text-sm font-medium opacity-90 max-w-lg leading-relaxed">
                  Đừng để trì hoãn làm mờ tầm nhìn của má. Hãy bắt đầu với: <span className="underline decoration-2 underline-offset-4">"{overdueTasks[0].title}"</span> ngay!
                </p>
              </div>
            ) : activeTask ? (
              <div>
                <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">{activeTask.title}</h3>
                <p className="text-sm font-medium opacity-80">Công việc đang trong tiến trình (bắt đầu từ {activeTask.startTime}). Tập trung cao độ má nhé!</p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">Vùng xanh hiệu suất</h3>
                <p className="text-sm font-medium opacity-80">Má đang kiểm soát tốt mọi thứ. Hãy tận hưởng 1 tách trà hoặc xem lại bảng tầm nhìn.</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => onNavigate('day')}
            className={`px-8 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl ${
              overdueTasks.length > 0 ? 'bg-white text-rose-600 hover:bg-rose-50' : 'bg-rose-500 text-white hover:bg-rose-600'
            }`}
          >
            {overdueTasks.length > 0 ? 'Xử lý ngay' : 'Xem chi tiết'} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Main Insight Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Focus: Habits & Energy */}
        <div className="xl:col-span-8 space-y-8">
           {/* Energy & Focus Hero */}
           <section className="bg-indigo-600 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Energy Chart Info */}
                <div>
                   <div className="flex items-center gap-2 mb-4 opacity-80">
                      <TrendingUp size={18} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Năng lượng 7 ngày</span>
                   </div>
                   <div className="flex items-end gap-3 h-32 mb-6">
                      {energyData.map((d, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                           <div 
                             className="w-full bg-white/20 rounded-t-lg transition-all hover:bg-white/40 group relative"
                             style={{ height: `${(d.val / 10) * 100}%` }}
                           >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-indigo-600 px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                {d.val}
                              </div>
                           </div>
                           <span className="text-[9px] font-black opacity-60">{d.label}</span>
                        </div>
                      ))}
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                         <span className="text-[9px] font-black uppercase opacity-60 block">Trung bình</span>
                         <span className="text-xl font-black">{avgEnergy}</span>
                      </div>
                      <p className="text-xs font-medium opacity-70">Duy trì mức năng lượng ổn định giúp má đạt mục tiêu nhanh hơn.</p>
                   </div>
                </div>

                {/* Focus Habits */}
                <div className="bg-white/10 rounded-[2rem] p-6 border border-white/10 backdrop-blur-sm">
                   <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[11px] font-black uppercase tracking-widest">Thói quen hôm nay</h4>
                      <button onClick={() => onNavigate('day')} className="text-[10px] font-black uppercase text-white/60 hover:text-white transition-colors">Xem hết</button>
                   </div>
                   <div className="space-y-4">
                      {habits.length > 0 ? habits.slice(0, 3).map(habit => {
                         const isDone = habit.lastCompleted === today;
                         return (
                           <div key={habit.id} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${isDone ? 'bg-white text-indigo-600 border-white' : 'border-white/20 text-white/40'}`}>
                                    <CheckCircle2 size={16} />
                                 </div>
                                 <span className={`text-sm font-bold truncate max-w-[120px] ${isDone ? 'opacity-60 line-through' : ''}`}>{habit.title}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                 <Flame size={12} className="text-orange-400" />
                                 <span className="text-[10px] font-black">{habit.streak}</span>
                              </div>
                           </div>
                         );
                      }) : (
                        <p className="text-[10px] text-white/40 italic">Chưa có thói quen nào...</p>
                      )}
                   </div>
                </div>
              </div>
           </section>

           {/* Vision Board Preview */}
           <section className="bg-white widget-shadow rounded-[3rem] p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <Heart size={20} className="text-rose-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tầm nhìn 2026</h3>
                 </div>
                 <button onClick={() => onNavigate('vision')} className="text-rose-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                    Tất cả tầm nhìn <ArrowRight size={14} />
                 </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {visionItems.slice(0, 4).map(item => (
                   <div key={item.id} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 group relative cursor-pointer" onClick={() => onNavigate('vision')}>
                      <img src={item.content} alt={item.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                         <span className="text-[8px] font-black text-white uppercase truncate">{item.label}</span>
                      </div>
                   </div>
                 ))}
                 {visionItems.length < 4 && Array.from({ length: 4 - visionItems.length }).map((_, i) => (
                   <div key={i} className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-2 hover:border-rose-100 hover:text-rose-200 transition-all" onClick={() => onNavigate('vision')}>
                      <Star size={20} />
                      <span className="text-[8px] font-black uppercase">Thêm</span>
                   </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Right Sidebar: Quick Stats */}
        <div className="xl:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-8 text-white">
              <div className="flex items-center gap-2 mb-6">
                 <Award size={20} className="text-amber-400" />
                 <h3 className="text-[11px] font-black uppercase tracking-widest">Thành tích kỷ luật</h3>
              </div>
              <div className="space-y-6">
                 <div>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase text-white/60">Thói quen hôm nay</span>
                       <span className="text-xs font-black">{habits.length - undoneHabits.length}/{habits.length}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-amber-400" 
                         style={{ width: `${habits.length > 0 ? ((habits.length - undoneHabits.length) / habits.length) * 100 : 0}%` }}
                       />
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400">
                       <Flame size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-white/40">Chuỗi cao nhất</p>
                       <p className="text-xl font-black">{habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0} ngày</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white widget-shadow rounded-[3rem] p-8 border border-slate-50">
              <div className="flex items-center gap-2 mb-6">
                 <ShieldAlert size={20} className="text-rose-500" />
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Nhắc nhở</h3>
              </div>
              <div className="space-y-4">
                 {undoneHabits.length > 0 ? (
                   <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                      <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                      <div>
                         <p className="text-xs font-bold text-rose-900">Còn {undoneHabits.length} thói quen chưa xong</p>
                         <p className="text-[10px] font-medium text-rose-600 mt-1">Má nhớ hoàn thành để duy trì chuỗi nhé!</p>
                      </div>
                   </div>
                 ) : habits.length > 0 ? (
                   <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                         <p className="text-xs font-bold text-emerald-900">Kỷ luật tuyệt vời!</p>
                         <p className="text-[10px] font-medium text-emerald-600 mt-1">Má đã hoàn thành tất cả thói quen hôm nay.</p>
                      </div>
                   </div>
                 ) : null}
                 {undoneTasks.length > 0 && (
                   <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <Zap size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                         <p className="text-xs font-bold text-indigo-900">{undoneTasks.length} nhiệm vụ đang chờ</p>
                         <p className="text-[10px] font-medium text-indigo-600 mt-1">Sắp xếp thời gian để xử lý nốt má ơi.</p>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
