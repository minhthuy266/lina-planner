
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Task, VisionItem, Habit, DayReflection } from '../types';

export const dataService = {
  checkConfig() {
    if (!isSupabaseConfigured()) {
      console.warn("Lumina: Supabase chưa được cấu hình qua biến môi trường. Một số tính năng lưu trữ sẽ không hoạt động.");
      return false;
    }
    return true;
  },

  async getReflection(date: string): Promise<DayReflection | null> {
    try {
      if (!this.checkConfig()) return null;
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('date', date)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (e: any) {
      console.error(`Lỗi tải reflection (${date}):`, e.message);
      return null;
    }
  },

  async saveReflection(reflection: DayReflection): Promise<void> {
    try {
      if (!this.checkConfig()) return;
      const { error } = await supabase
        .from('reflections')
        .upsert({
          date: reflection.date,
          energyLevel: reflection.energyLevel,
          wakeUpTime: reflection.wakeUpTime,
          focus: reflection.focus,
          gratitude: reflection.gratitude,
          mood: reflection.mood,
          journal: reflection.journal
        });
      
      if (error) throw error;
    } catch (e: any) {
      console.error("Lỗi lưu reflection:", e.message);
      throw e;
    }
  },

  async getAllReflections(): Promise<DayReflection[]> {
    try {
      if (!this.checkConfig()) return [];
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (e: any) {
      console.error("Lỗi tải toàn bộ reflections:", e.message);
      return [];
    }
  },

  async getTasks(): Promise<Task[]> {
    try {
      if (!this.checkConfig()) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('date', { ascending: true })
        .order('startTime', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (e: any) {
      if (e.message === 'Failed to fetch') {
        console.error("Không thể kết nối tới Database. Có thể Project Supabase đang bị Paused hoặc sai URL.");
      }
      console.error("Lỗi tải danh sách nhiệm vụ:", e.message);
      return [];
    }
  },

  async createTask(task: Partial<Task>): Promise<Task | null> {
    try {
      if (!this.checkConfig()) return null;
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: task.title,
          completed: task.completed ?? false,
          date: task.date,
          startTime: task.startTime,
          priority: task.priority ?? 'medium'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e: any) {
      console.error("Lỗi tạo nhiệm vụ:", e.message);
      return null;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      if (!this.checkConfig()) return null;
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e: any) {
      console.error("Lỗi cập nhật nhiệm vụ:", e.message);
      return null;
    }
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      if (!this.checkConfig()) return false;
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.error("Lỗi xóa nhiệm vụ:", e.message);
      return false;
    }
  },

  async getHabits(): Promise<Habit[]> {
    try {
      if (!this.checkConfig()) return [];
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (e: any) {
      if (e.message === 'Failed to fetch') {
        console.error("CRITICAL: Không thể tải thói quen. Database không phản hồi.");
      }
      console.error("Lỗi tải thói quen:", e.message);
      return [];
    }
  },

  async createHabit(habit: Partial<Habit>): Promise<Habit | null> {
    try {
      if (!this.checkConfig()) return null;
      const { data, error } = await supabase
        .from('habits')
        .insert([{
          title: habit.title,
          streak: 0,
          color: habit.color ?? 'bg-rose-500',
          icon: habit.icon ?? 'zap'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e: any) {
      console.error("Lỗi tạo thói quen:", e.message);
      return null;
    }
  },

  async deleteHabit(id: string): Promise<boolean> {
    try {
      if (!this.checkConfig()) return false;
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.error("Lỗi xóa thói quen:", e.message);
      return false;
    }
  },

  async toggleHabit(id: string): Promise<Habit[]> {
    try {
      if (!this.checkConfig()) return [];
      const { data: habit, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;

      const today = new Date().toISOString().split('T')[0];
      let updates: any = {};

      if (habit.lastCompleted === today) {
        updates = {
          lastCompleted: null,
          streak: Math.max(0, (habit.streak || 0) - 1)
        };
      } else {
        updates = {
          lastCompleted: today,
          streak: (habit.streak || 0) + 1
        };
      }

      const { error: updateError } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id);
      
      if (updateError) throw updateError;

      return this.getHabits();
    } catch (e: any) {
      console.error("Lỗi thay đổi trạng thái thói quen:", e.message);
      return this.getHabits();
    }
  },

  async getVisionItems(): Promise<VisionItem[]> {
    try {
      if (!this.checkConfig()) return [];
      const { data, error } = await supabase
        .from('vision_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (e: any) {
      console.error("Lỗi tải bảng tầm nhìn:", e.message);
      return [];
    }
  },

  async saveVisionItem(item: Partial<VisionItem>): Promise<VisionItem | null> {
    try {
      if (!this.checkConfig()) return null;
      const { data, error } = await supabase
        .from('vision_items')
        .insert([{
          content: item.content,
          category: item.category ?? 'Dream',
          label: item.label
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e: any) {
      console.error("Lỗi lưu mục tầm nhìn:", e.message);
      return null;
    }
  },

  async deleteVisionItem(id: string): Promise<boolean> {
    try {
      if (!this.checkConfig()) return false;
      const { error } = await supabase
        .from('vision_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.error("Lỗi xóa mục tầm nhìn:", e.message);
      return false;
    }
  }
};
