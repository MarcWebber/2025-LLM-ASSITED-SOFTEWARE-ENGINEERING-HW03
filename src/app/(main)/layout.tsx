"use client"; // 关键：这个布局现在必须是客户端组件，因为它需要使用 hooks

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context"; // 1. 导入 useAuth
import { useRouter } from "next/navigation";
import { MainNav } from "@/components/shared/main-nav";
import { UserNav } from "@/components/shared/user-nav"; // 2. 导入 UserNav
import { Loader2 } from "lucide-react";

export default function MainLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const { session, isLoading } = useAuth(); // 3. 获取认证状态
    const router = useRouter();

    // 4. 路由保护逻辑
    useEffect(() => {
        // 如果加载完成，但 session 为空 (未登录)
        if (!isLoading && !session) {
            router.push("/login"); // 强制跳转到登录页
        }
    }, [isLoading, session, router]);

    // 5. 如果正在加载认证状态，显示全局加载中
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-4 text-lg text-muted-foreground">
          正在加载用户会话...
        </span>
            </div>
        );
    }

    // 6. 如果已登录，才显示主应用布局
    if (session) {
        return (
            <div className="flex flex-col h-screen">
                <header className="sticky top-0 z-40 border-b bg-background h-16">
                    <div className="container flex items-center justify-between h-full py-4">
                        <MainNav />
                        <UserNav /> {/* 7. 在导航栏右侧添加 UserNav */}
                    </div>
                </header>
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
        );
    }

    // 如果 session 为空 (在跳转到 /login 之前)，不渲染任何东西
    return null;
}