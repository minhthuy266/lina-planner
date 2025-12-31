
import { createClient } from '@supabase/supabase-js';

// Lấy giá trị từ biến môi trường
const supabaseUrl = process.env.SUPABASE_URL || 'https://rzbbdwbjzkjbbpdyzmrf.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6YmJkd2JqemtqYmJwZHl6bXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMTE2NjksImV4cCI6MjA4MjY4NzY2OX0.U2SSrhn1UwgHSVhyT0B-HqZo7Y57CZy3C9ctZXcwLZs';

// Kiểm tra xem đã cấu hình chưa
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Khởi tạo an toàn: Nếu thiếu key thì không gọi createClient để tránh crash app
// Thay vào đó, chúng ta export một instance rỗng hoặc báo lỗi khi sử dụng
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
      get: (target, prop) => {
        return () => {
          console.error(`Supabase Error: Bạn chưa cấu hình SUPABASE_URL hoặc SUPABASE_ANON_KEY trong môi trường. Hành động '${String(prop)}' bị từ chối.`);
          return {
            from: () => ({
              select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }) }),
              insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
              update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
              delete: () => ({ eq: () => Promise.resolve({ error: null }) })
            })
          };
        };
      }
    });

if (!isSupabaseConfigured()) {
  console.warn("⚠️ Lumina Warning: Thiếu cấu hình Supabase. Vui lòng thêm SUPABASE_URL và SUPABASE_ANON_KEY vào Environment Variables.");
}
