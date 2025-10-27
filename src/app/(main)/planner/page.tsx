"use client";

import { useState } from "react";
import { TripInput } from "@/components/planner/trip-input";
import { MapView } from "@/components/planner/map-view";
import { TimelineView } from "@/components/planner/timeline-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal } from "lucide-react";
// 确保您已经更新了 settings 页面，使其导出 BAIDU_MAP_AK_STORAGE_KEY
import { API_KEY_STORAGE_KEY, BAIDU_MAP_AK_STORAGE_KEY } from "@/app/(main)/settings/page";
import type { TripPlan } from "@/lib/types";

export default function PlannerPage() {
    // --- 关键修改在这里 ---
    const [prompt, setPrompt] = useState(""); // 1. 将 prompt 状态提升到父组件
    // -------------------------

    const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePlan = async (currentPrompt: string) => {
        setIsLoading(true);
        setError(null);
        setTripPlan(null);

        const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        // 检查 AI Key
        if (!apiKey) {
            setError("AI Key 未设置。请前往“设置”页面进行配置。");
            setIsLoading(false);
            return;
        }
        // 检查 百度 AK
        const baiduAk = localStorage.getItem(BAIDU_MAP_AK_STORAGE_KEY);
        if (!baiduAk) {
            setError("百度地图 AK 未设置。请前往“设置”页面进行配置。");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/plan-trip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: currentPrompt, // 使用传入的 prompt
                    apiKey: apiKey,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "行程生成失败");
            }

            const data = await response.json();
            setTripPlan(data);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 在大屏幕上使用 3:2 的比例，地图更大
        <div className="grid h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-5 gap-4 p-4">

            {/* --- 左侧面板：输入和时间线 (占 2 份) --- */}
            <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto">
                <h2 className="text-2xl font-bold">1. 告诉 AI 您的需求</h2>

                {/* --- 关键修改在这里 --- */}
                <TripInput
                    onGenerate={() => handleGeneratePlan(prompt)}
                    isLoading={isLoading}
                    prompt={prompt}      // 2. 传入 prompt
                    setPrompt={setPrompt}  // 3. 传入 setPrompt 函数
                />
                {/* ------------------------- */}

                <hr />

                {/* M1.2.2 加载状态 */}
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-muted-foreground">
              AI 正在为您定制专属行程...
            </span>
                    </div>
                )}

                {/* M1.2.3 错误处理 */}
                {error && (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>发生错误</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* M1.2.5 & M2.1 时间线与预算 */}
                {tripPlan && !isLoading && !error && (
                    <TimelineView plan={tripPlan} />
                )}
            </div>

            {/* --- 右侧面板：地图 (占 3 份) --- */}
            <div className="lg:col-span-3 bg-muted rounded-lg overflow-hidden">
                <MapView plan={tripPlan} />
            </div>
        </div>
    );
}