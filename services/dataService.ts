
import { Task, VisionItem } from '../types';
import { supabase } from './supabaseClient';
import { format } from 'date-fns';

const STORAGE_KEYS = {
  TASKS: 'lumina_tasks_2026',
  VISION: 'lumina_vision_2026'
};

export const dataService = {
  async getTasks(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return (data || []) as Task[];
    } catch (e) {
      console.error('Supabase fetch tasks error:', e);
      const local = localStorage.getItem(STORAGE_KEYS.TASKS);
      return local ? JSON.parse(local) : [];
    }
  },

  async createTask(task: Partial<Task>): Promise<Task | null> {
    const taskDate = task.date || format(new Date(), 'yyyy-MM-dd');
    const newTaskData = {
      ...task,
      id: crypto.randomUUID(),
      date: taskDate,
      completed: task.completed ?? false,
      priority: task.priority ?? 'medium'
    };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTaskData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Create task error:', e);
      const current = await this.getTasks();
      const updated = [...current, newTaskData as Task];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
      return newTaskData as Task;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Update task error:', e);
      const current = await this.getTasks();
      const updated = current.map(t => t.id === id ? { ...t, ...updates } : t);
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
      return updated.find(t => t.id === id) || null;
    }
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Delete task error:', e);
      const current = await this.getTasks();
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(current.filter(t => t.id !== id)));
      return true;
    }
  },

  async getVisionItems(): Promise<VisionItem[]> {
    try {
      const { data, error } = await supabase
        .from('vision_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as VisionItem[];
    } catch (e) {
      console.error('Fetch vision error:', e);
      const local = localStorage.getItem(STORAGE_KEYS.VISION);
      return local ? JSON.parse(local) : [];
    }
  },

  async saveVisionItem(item: Partial<VisionItem>): Promise<VisionItem | null> {
    const newItem = { 
      ...item, 
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('vision_items')
        .insert([newItem])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      const current = await this.getVisionItems();
      localStorage.setItem(STORAGE_KEYS.VISION, JSON.stringify([newItem, ...current]));
      return newItem as VisionItem;
    }
  },

  async deleteVisionItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('vision_items').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      const current = await this.getVisionItems();
      localStorage.setItem(STORAGE_KEYS.VISION, JSON.stringify(current.filter(v => v.id !== id)));
      return true;
    }
  }
};
