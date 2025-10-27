import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // <-- 1. 导入 Sonner

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
        <body
            className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}
        >
        {children}
        <Toaster richColors /> {/* <-- 2. 添加在这里, richColors 提供更好看的样式 */}
        </body>
        </html>
    );
}