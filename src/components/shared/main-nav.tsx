"use client"; // 1. 需要 'use client' 来使用 hook

import Link from "next/link";
import { usePathname } from "next/navigation"; // 2. 导入 usePathname
import { cn } from "@/lib/utils"; // 3. 导入 cn 工具 (shadcn/ui 已自动安装)

// 4. 将路由定义为数组，方便管理
const routes = [
    { href: "/planner", label: "智能规划" },
    { href: "/trips", label: "我的行程" },
    { href: "/expenses", label: "费用管理" },
    { href: "/settings", label: "设置" },
];

export function MainNav() {
    const pathname = usePathname(); // 5. 获取当前路径

    return (
        // 6. 在小屏幕 (md 以下) 隐藏导航栏，只在 md 及以上显示
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    // 7. 动态设置 className
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        // 如果路径匹配，则使用默认颜色 (text-primary)
                        // 如果不匹配，则使用 text-muted-foreground
                        pathname === route.href
                            ? "text-primary"
                            : "text-muted-foreground"
                    )}
                >
                    {route.label}
                </Link>
            ))}
        </nav>
    );
}