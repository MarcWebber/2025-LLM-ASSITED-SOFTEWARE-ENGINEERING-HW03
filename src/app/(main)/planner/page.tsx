"use client";

// 1. 导入必要的 hooks 和组件
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { TripInput } from "@/components/planner/trip-input";
import { TimelineView } from "@/components/planner/timeline-view";
import { MapView } from "@/components/planner/map-view"; // 保持您的静态导入
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Save } from "lucide-react"; // 导入 Save 图标
import { Button } from "@/components/ui/button"; // 导入 Button
import { toast } from "sonner"; // 导入 toast
import { API_KEY_STORAGE_KEY, BAIDU_MAP_AK_STORAGE_KEY } from "@/app/(main)/settings/page";
import type { TripPlan, SavedTrip } from "@/lib/types"; // 导入 SavedTrip

export default function PlannerPage() {
    const [prompt, setPrompt] = useState("");
    const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 2. 新增保存状态
    const [isSaving, setIsSaving] = useState(false);

    // 3. 导入 useAuth, useRouter, useSearchParams
    const { session } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // 4. 新增 useEffect 用于加载行程 (M3.2.2 - 加载部分)
    useEffect(() => {
        const tripId = searchParams.get('trip_id');

        // 仅在 session 加载后且 URL 中有 trip_id 时执行
        if (tripId && session) {
            const loadTrip = async () => {
                setIsLoading(true);
                setError(null);
                setTripPlan(null);

                const { data, error } = await supabase
                    .from('trips')
                    .select('plan_data') // 只选择 plan_data
                    .eq('id', tripId)
                    .eq('user_id', session.user.id) // 确保只能加载自己的
                    .single();

                if (error) {
                    setError("加载行程失败：" + error.message);
                } else if (data) {
                    setTripPlan(data.plan_data as TripPlan);
                    toast.success("行程已成功加载！");
                }
                setIsLoading(false);
            };
            loadTrip();
        }
        // 清理函数：当组件卸载或依赖变化时，取消正在进行的加载
        return () => {
            // 如果有需要中断的 fetch 请求，可以在这里处理
        };
    }, [searchParams, session]); // 依赖 searchParams 和 session


    // handleGeneratePlan (M1.2.1 - 生成部分，添加了清除 trip_id 的逻辑)
    const handleGeneratePlan = async (currentPrompt: string) => {
        setIsLoading(true);
        setError(null);
        setTripPlan(null);
        // 清除 URL 中的 trip_id，因为这是一个新生成的行程
        router.replace('/planner');

        const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (!apiKey) {
            setError("AI Key 未设置...");
            setIsLoading(false); return;
        }
        const baiduAk = localStorage.getItem(BAIDU_MAP_AK_STORAGE_KEY);
        if (!baiduAk) {
            setError("百度地图 AK 未设置...");
            setIsLoading(false); return;
        }

        try {
            const response = await fetch('/api/plan-trip', { /* ... */
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentPrompt, apiKey: apiKey }),
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

    // 5. 新增 handleSaveTrip 函数 (M1.3.2 - 保存部分)
    const handleSaveTrip = async () => {
        if (!tripPlan || !session) {
            toast.error("没有可保存的行程或用户未登录。");
            return;
        }

        setIsSaving(true);

        const { error } = await supabase.from('trips').insert({
            user_id: session.user.id,
            title: tripPlan.title, // 保存标题
            plan_data: tripPlan, // 保存完整的 JSON
        });

        if (error) {
            toast.error("保存失败：" + error.message);
        } else {
            toast.success("行程已成功保存！");
        }
        setIsSaving(false);
    };

    // 保持您成功的 Flexbox 布局
    return (
        <div className="flex flex-col lg:flex-row h-full w-full">
            {/* 左侧面板 */}
            <div className="w-full lg:w-2/5 h-full flex flex-col gap-4 overflow-y-auto p-4">
                <h2 className="text-2xl font-bold">1. 告诉 AI 您的需求</h2>
                <TripInput
                    onGenerate={() => handleGeneratePlan(prompt)}
                    isLoading={isLoading}
                    prompt={prompt}
                    setPrompt={setPrompt}
                />
                <hr />
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-muted-foreground">
                          {searchParams.get('trip_id') ? "正在加载行程..." : "AI 正在..."}
                        </span>
                    </div>
                )}
                {error && (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>发生错误</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* 6. 行程结果显示区域，添加保存按钮 */}
                {tripPlan && !isLoading && !error && (
                    <div className="space-y-4">
                        {/* 保存按钮 */}
                        <Button
                            onClick={handleSaveTrip}
                            disabled={isSaving}
                            className="w-full"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "保存中..." : "保存这个行程"}
                        </Button>
                        <TimelineView plan={tripPlan} />
                    </div>
                )}
            </div>

            {/* 右侧地图面板 */}
            <div className="flex-1 h-full rounded-lg overflow-hidden relative">
                <MapView plan={tripPlan} />
            </div>
        </div>
    );
}