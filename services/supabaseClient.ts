
import { createClient } from '@supabase/supabase-js';

// Má đã dán key ở đây rồi, con sẽ dùng trực tiếp luôn
const supabaseUrl = 'https://rzbbdwbjzkjbbpdyzmrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6YmJkd2JqemtqYmJwZHl6bXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMTE2NjksImV4cCI6MjA4MjY4NzY2OX0.U2SSrhn1UwgHSVhyT0B-HqZo7Y57CZy3C9ctZXcwLZs';

export const isSupabaseConfigured = () => {
  // Kiểm tra xem 2 biến trên có dữ liệu thật không (không phải placeholder)
  return !!(supabaseUrl && supabaseKey && supabaseUrl.includes('supabase.co'));
};

// Khởi tạo client với các biến đã có dữ liệu
export const supabase = createClient(supabaseUrl, supabaseKey);
