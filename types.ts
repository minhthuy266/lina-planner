
export type ViewType = 'day' | 'week' | 'month' | 'vision';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
}

export interface VisionItem {
  id: string;
  content: string; // URL hoặc base64
  category: string;
  label?: string;
  created_at?: string;
}

export interface DayPlan {
  date: string;
  gratitude: string;
  focus: string;
  tasks: Task[];
}
