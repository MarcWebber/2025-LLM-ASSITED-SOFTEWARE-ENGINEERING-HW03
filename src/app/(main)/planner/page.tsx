"use client";

// ... (所有 imports 保持不变)
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { TripInput } from "@/components/planner/trip-input";
import { TimelineView } from "@/components/planner/timeline-view";
import { MapView } from "@/components/planner/map-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Save, PanelLeft, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_KEY_STORAGE_KEY, BAIDU_MAP_AK_STORAGE_KEY } from "@/app/(main)/settings/page";
import type { TripPlan, SavedTrip, Activity } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatedTitle } from "@/components/planner/animated-title"; // 确保导入您的打字机标题

export default function PlannerPage() {
    // ... (所有 hooks: useState, useAuth, etc. 保持不变)
    const [prompt, setPrompt] = useState("");
    const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(true);
    const [focusedLocation, setFocusedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const { session } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // ... (所有函数: useEffect[loadTrip], handleGeneratePlan, handleSaveTrip, handleActivityClick 保持不变)
    // useEffect[loadTrip]
    useEffect(() => {
        const tripId = searchParams.get('trip_id');
        if (tripId && session) {
            const loadTrip = async () => {
                setIsLoading(true);
                setError(null);
                setTripPlan(null);

                const { data, error } = await supabase
                    .from('trips')
                    .select('plan_data')
                    .eq('id', tripId)
                    .eq('user_id', session.user.id)
                    .single();

                if (error) {
                    setError("加载行程失败：" + error.message);
                } else if (data) {
                    const plan = data.plan_data as TripPlan;
                    setTripPlan(plan);
                    if (plan.days[0]?.activities[0]?.location) {
                        setFocusedLocation(plan.days[0].activities[0].location);
                    }
                    toast.success("行程已成功加载！");
                }
                setIsLoading(false);
            };
            loadTrip();
        }
    }, [searchParams, session]);

    // handleGeneratePlan
    const handleGeneratePlan = async (currentPrompt: string) => {
        setIsLoading(true);
        setError(null);
        setTripPlan(null);
        router.replace('/planner');

        const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (!apiKey) {
            setError("AI Key 未设置..."); setIsLoading(false); return;
        }
        const baiduAk = localStorage.getItem(BAIDU_MAP_AK_STORAGE_KEY);
        if (!baiduAk) {
            setError("百度地图 AK 未设置..."); setIsLoading(false); return;
        }

        try {
            const response = await fetch('/api/plan-trip', {
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

    // handleSaveTrip
    const handleSaveTrip = async () => {
        if (!tripPlan || !session) {
            toast.error("没有可保存的行程或用户未登录。"); return;
        }
        setIsSaving(true);
        const { error } = await supabase.from('trips').insert({
            user_id: session.user.id,
            title: tripPlan.title,
            plan_data: tripPlan,
        });
        if (error) {
            toast.error("保存失败：" + error.message);
        } else {
            toast.success("行程已成功保存！");
        }
        setIsSaving(false);
    };

    // handleActivityClick
    const handleActivityClick = (activity: Activity) => {
        if (activity.location) {
            setFocusedLocation(activity.location);
            if (!isMapVisible) {
                setIsMapVisible(true);
            }
        }
    };


    // --- 关键布局修复 ---
    return (
        // 1. 添加一个 'container' 作为最外层包装器
        // - 'container': 自动居中并设置 max-width，解决 4K 屏过宽和对齐问题
        // - 'h-full': 继承来自 (main)/layout.tsx 的 <main> 的高度
        // - 'py-4': 添加一点垂直内边距 (可按需调整)
        <div className="h-full py-4">

            {/* 2. 内部的 Flexbox 布局现在 100% 占满 'container' 的高度 */}
            <div className="flex flex-col lg:flex-row h-full w-full">

                {/* 3. 左侧面板：(布局类名不变) */}
                <div
                    className={cn(
                        "h-full flex flex-col gap-4 overflow-y-auto p-4 transition-all duration-300",
                        // p-4 是为了让内容和左右面板的边缘有空隙
                        isMapVisible ? "w-full lg:w-2/5" : "w-full"
                    )}
                >
                    <div className="flex justify-between items-center">
                        <AnimatedTitle />
                        <Button
                            onClick={() => setIsMapVisible(!isMapVisible)}
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex"
                        >
                            {isMapVisible ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
                        </Button>
                    </div>

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

                    {tripPlan && !isLoading && !error && (
                        <div className="space-y-4">
                            <TimelineView
                                plan={tripPlan}
                                onActivityClick={handleActivityClick}
                            />
                            <Button
                                onClick={handleSaveTrip}
                                disabled={isSaving}
                                className="w-full"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? "保存中..." : "保存这个行程"}
                            </Button>
                        </div>
                    )}
                </div>

                {/* 4. 右侧地图面板：(布局类名不变) */}
                <div
                    className={cn(
                        "h-full rounded-lg overflow-hidden relative transition-all duration-300",
                        isMapVisible ? "flex-1" : "w-0 hidden"
                    )}
                >
                    <MapView plan={tripPlan} focusedLocation={focusedLocation} />
                </div>

            </div>
        </div>
    );
}