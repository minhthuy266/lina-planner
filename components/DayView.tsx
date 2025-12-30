
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Heart, Sparkles, Zap, Trash2, Loader2 } from 'lucide-react';
import { Task } from '../types';
import { dataService } from '../services/dataService';
import { format } from 'date-fns';

interface DayViewProps {
  date: Date;
  onUpdate?: () => void;
}

const DayView: React.FC<DayViewProps> = ({ date, onUpdate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    const savedTasks = await dataService.getTasks();
    const targetDateStr = format(date, 'yyyy-MM-dd');
    const filtered = savedTasks.filter(t => t.date.startsWith(targetDateStr));
    setTasks(filtered);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const toggleTask = async (task: Task) => {
    const updatedStatus = !task.completed;
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t));
    await dataService.updateTask(task.id, { completed: updatedStatus });
    if (onUpdate) onUpdate();
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const tempTask: Partial<Task> = { 
      title: newTask, 
      completed: false, 
      priority: 'medium',
      date: dateStr
    };
    
    setNewTask(''); // Clear input immediately
    const savedTask = await dataService.createTask(tempTask);
    if (savedTask) {
      setTasks(prev => [...prev, savedTask]);
      if (onUpdate) onUpdate();
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await dataService.deleteTask(id);
    if (onUpdate) onUpdate();
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-slate-400 text-sm font-medium">Connecting to Cloud...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Zap size={20} className="text-amber-500" />
              Focus Tasks for {format(date, 'MMMM do')}
            </h3>
          </div>

          <form onSubmit={addTask} className="mb-6">
            <input 
              type="text"
              placeholder="What's your next priority?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
          </form>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-slate-400 text-sm italic">No tasks found for this date.</p>
                <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest font-bold">Add one to get started</p>
              </div>
            ) : tasks.map(task => (
              <div 
                key={task.id}
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                  task.completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task)}>
                  <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                    {task.completed ? <CheckCircle2 className="text-indigo-600" /> : <Circle />}
                  </button>
                  <span className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {task.title}
                  </span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-indigo-500" />
            Cloud Strategy
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 italic">
            "Your database is live. Found {tasks.length} active records for {format(date, 'yyyy-MM-dd')}. Every task saved is a step toward your vision."
          </p>
        </section>
      </div>

      <div className="space-y-6">
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Heart size={20} className="text-rose-500" />
            Daily Gratitude
          </h3>
          <textarea 
            placeholder="Today I am grateful for..."
            className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all text-sm italic text-slate-600 resize-none font-medium"
          />
        </section>
      </div>
    </div>
  );
};

export default DayView;
