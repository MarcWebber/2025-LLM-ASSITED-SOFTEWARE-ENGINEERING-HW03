"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SupabaseClient, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// 定义 Context 中存储的数据结构
type AuthContextType = {
    session: Session | null;
    isLoading: boolean;
};

// 创建 Context
const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: true, // 默认加载中
});

// 创建 Provider (提供者) 组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. 立即获取当前会话
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setIsLoading(false);
        };

        getInitialSession();

        // 2. 监听认证状态变化 (登录、登出)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setIsLoading(false);
            }
        );

        // 3. 在组件卸载时清除监听器
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. 创建自定义 Hook 以方便使用
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth 必须在 AuthProvider 内部使用");
    }
    return context;
}