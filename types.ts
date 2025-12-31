
export type ViewType = 'dashboard' | 'day' | 'week' | 'month' | 'year' | 'vision' | 'wellness';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  lastCompleted?: string; // YYYY-MM-DD
  icon?: string;
  color: string;
}

export interface VisionItem {
  id: string;
  content: string; // URL hoặc base64
  category: string;
  label?: string;
  created_at?: string;
}

export interface DayReflection {
  date: string;
  energyLevel: number; // 1-10
  wakeUpTime: string;
  focus: string; // The One Thing
  gratitude: string[]; // 3 things
  mood: string; // Emoji or category
  journal?: string;
}

export interface DayPlan {
  date: string;
  gratitude: string;
  focus: string;
  tasks: Task[];
}
