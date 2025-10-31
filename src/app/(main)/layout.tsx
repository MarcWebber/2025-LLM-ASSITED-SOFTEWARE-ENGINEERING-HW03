"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { MainNav } from "@/components/shared/main-nav";
import { UserNav } from "@/components/shared/user-nav";
import { Loader2, Bot } from "lucide-react";
import Link from "next/link";

export default function MainLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const { session, isLoading } = useAuth();
    const router = useRouter();

    // (认证和加载逻辑保持不变)
    useEffect(() => {
        if (!isLoading && !session) {
            router.push("/login");
        }
    }, [isLoading, session, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (session) {
        return (
            <div className="flex flex-col h-screen">

                <header className="sticky top-0 z-40 border-b bg-background h-16">
                    <div className="container flex items-center justify-between h-full py-4">
                        <Link href="/planner" className="flex items-center gap-2 font-bold">
                            <Bot className="h-8 w-8" />
                            <span className="hidden sm:inline-block">AI 旅行规划</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <MainNav />
                            <UserNav />
                        </div>
                    </div>
                </header>

                {/* --- 关键修改：Main 区域 --- */}
                <main className="flex-1 overflow-auto">
                    <div className="mx-auto h-full px-4">
                        {children}
                    </div>
                </main>

            </div>
        );
    }

    return null;
}