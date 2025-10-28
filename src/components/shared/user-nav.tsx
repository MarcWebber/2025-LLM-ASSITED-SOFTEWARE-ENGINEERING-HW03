"use client";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

export function UserNav() {
    const { session } = useAuth(); // 从 Context 获取会话
    const router = useRouter();

    // M3.1.2 登出
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("登出失败", { description: error.message });
        } else {
            toast.success("您已成功登出");
            // 登出后，(main) 布局会自动将我们踢回 /login
            router.push("/login");
            router.refresh();
        }
    };

    if (!session) {
        // 理论上不应该在 (main) 布局中看到这个，但作为保险
        return (
            <Button variant="outline" onClick={() => router.push("/login")}>
                登录
            </Button>
        );
    }

    // 从会话中获取邮箱和首字母
    const email = session.user.email || "用户";
    const fallback = email.charAt(0).toUpperCase() || <User className="h-4 w-4" />;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        {/* Supabase 暂不提供头像 URL，我们使用 Fallback */}
                        {/* <AvatarImage src="/avatars/01.png" alt="@shadcn" /> */}
                        <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">已登录</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>登出</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}