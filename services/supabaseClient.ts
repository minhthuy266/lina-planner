
import { createClient } from '@supabase/supabase-js';

// Ưu tiên lấy giá trị từ environment variables do người dùng cung cấp
const supabaseUrl = process.env.SUPABASE_URL || 'https://rzbbdwbjzkjbbpdyzmrf.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6YmJkd2JqemtqYmJwZHl6bXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMTE2NjksImV4cCI6MjA4MjY4NzY2OX0.U2SSrhn1UwgHSVhyT0B-HqZo7Y57CZy3C9ctZXcwLZs';

export const isSupabaseConfigured = () => {
  // Chỉ kiểm tra xem URL có hợp lệ không, không chặn dựa trên giá trị cụ thể
  return supabaseUrl && supabaseUrl.startsWith('https://');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
