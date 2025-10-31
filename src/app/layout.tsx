import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
// 我们不再需要在这里导入 Mapbox CSS 了
// import "mapbox-gl/dist/mapbox-gl.css";

import { AuthProvider } from "@/context/auth-context"; // 1. 导入 AuthProvider

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
            {/* --- 关键添加 --- */}
            {/* 为百度地图 WebGL API (v1.0) 加载必需的 CSS 样式。
              这能确保地图缩放控件、信息窗口和 Logo 正确显示。
            */}
            <link
                rel="stylesheet"
                href="https://api.map.baidu.com/api?v=1.0&type=webgl&ak=您的AK&s=1"
            />
            {/* 注意：请将上面的 "您的AK" 替换为您在 settings 页面使用的同一个百度地图 AK。
              虽然 AK 暴露在 HTML 中是百度地图的正常做法，
              但更好的做法是将其配置为环境变量（如果百度支持）。
              不过，对于本项目，直接填入 AK 是最快的方法。
              （或者，我们可以暂时忽略它，因为 JS 已经加载了 AK，
               但添加这个 link 是最保险的。）

               一个更“干净”的 CSS 加载方式是（不带 AK）：
            */}
            <link
                rel="stylesheet"
                href="https://api.map.baidu.com/res/webgl/1.0/bmap.css"
            />

        </head>
        <body
            className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}
        >
        {/* AuthProvider 包裹器是正确的 */}
        <AuthProvider>
            {children}
            <Toaster richColors />
        </AuthProvider>
        </body>
        </html>
    );
}