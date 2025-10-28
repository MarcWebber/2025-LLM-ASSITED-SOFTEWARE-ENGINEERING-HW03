import { createClient } from "@supabase/supabase-js";

// 从环境变量中读取 Supabase 凭证
// 我们将在 .env.local 文件中设置这些值
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL 和 Anon Key 必须在 .env.local 中设置");
}

// 创建并导出一个 Supabase 客户端实例
// 这个实例可以在所有“客户端组件” ("use client") 中安全使用
export const supabase = createClient(supabaseUrl, supabaseAnonKey);