"use client";

// 这是一个最小化的页面组件，以确保 'next build' 能够成功
// 我们尚未实现查看单个行程的功能，但这足以让构建通过

import { Loader2 } from "lucide-react";
import { useParams } from 'next/navigation'; // 导入 useParams

// 必须有一个默认导出
export default function SingleTripPage() {
    const params = useParams();
    const tripId = params.tripId; // 从 URL 中获取 tripId

    return (
        // 我们使用和 trips 页面一致的布局（h-full, overflow-y-auto, py-8）
        <div className="h-full overflow-y-auto py-8">
            <h1 className="text-2xl font-bold">正在加载行程详情...</h1>
            <p className="text-muted-foreground">行程 ID: {tripId}</p>

            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-4">功能正在建设中...</p>
            </div>
        </div>
    );
}