import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
// import "mapbox-gl/dist/mapbox-gl.css"; // 如果您切换回了 Mapbox
// 导入百度地图 CSS（如果您使用百度地图）
// 注意：百度地图 JS 是动态加载的，但 CSS 可以先导入（如果需要）


import { AuthProvider } from "@/context/auth-context"; // <-- 1. 导入

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "AI 旅行规划助手",
    description: "通过 AI 智能生成您的专属旅行计划",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN" suppressHydrationWarning>
        <head>
            {/* 如果使用百度地图，JS SDK 是在 map-view.tsx 中动态加载的 */}
        </head>
        <body
            className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}
        >
        {/* 2. 将 AuthProvider 包裹在所有内容外部 */}
        <AuthProvider>
            {children}
            <Toaster richColors />
        </AuthProvider>
        </body>
        </html>
    );
}