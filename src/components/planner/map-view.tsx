"use client";

import { useState, useEffect, useRef } from "react";
import { BAIDU_MAP_AK_STORAGE_KEY } from "@/app/(main)/settings/page";
import { Loader2 } from "lucide-react";
import type { TripPlan, Activity } from "@/lib/types";

// 1. 更新 Props 接口
interface MapViewProps {
    plan: TripPlan | null;
    focusedLocation: { lat: number, lng: number } | null; // 新增
}

// 加载脚本 Hook (保持不变)
function useBaiduMapScript(ak: string | null) {
    // ... (内部代码保持不变) ...
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!ak) return;

        if ((window as any).BMapGL) {
            setScriptLoaded(true);
            return;
        }

        if (document.getElementById("baidu-map-script")) return;

        const CALLBACK_NAME = "baiduMapScriptLoaded";
        (window as any)[CALLBACK_NAME] = () => {
            setScriptLoaded(true);
            delete (window as any)[CALLBACK_NAME];
        };

        const script = document.createElement("script");
        script.id = "baidu-map-script";
        script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${ak}&callback=${CALLBACK_NAME}`;
        script.onerror = () => setError(true);
        document.body.appendChild(script);

    }, [ak]);

    return { scriptLoaded, error };
}


// 2. 接收新的 prop
export function MapView({ plan, focusedLocation }: MapViewProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    const [ak, setAk] = useState<string | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 加载 AK (保持不变)
    useEffect(() => {
        const storedAk = localStorage.getItem(BAIDU_MAP_AK_STORAGE_KEY);
        if (storedAk) {
            setAk(storedAk);
        } else {
            setError("AK 未设置，请在设置页面配置");
        }
    }, []);

    const { scriptLoaded: sdkLoaded, error: sdkError } = useBaiduMapScript(ak);
    // 合并两种加载状态
    const isScriptLoaded = scriptLoaded || sdkLoaded;
    const scriptError = error || sdkError;

    // 初始化地图 (保持不变)
    useEffect(() => {
        if (isScriptLoaded && mapContainerRef.current && !mapInstanceRef.current) {
            const BMapGL = (window as any).BMapGL;
            const map = new BMapGL.Map(mapContainerRef.current);
            map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 11);
            map.enableScrollWheelZoom(true);
            mapInstanceRef.current = map;
        }
    }, [isScriptLoaded]);

    // 更新地图覆盖物 (保持不变)
    useEffect(() => {
        if (!mapInstanceRef.current || !isScriptLoaded) return;

        const map = mapInstanceRef.current;
        const BMapGL = (window as any).BMapGL;
        map.clearOverlays();

        if (plan && plan.days) {
            const allActivities = plan.days.flatMap(day =>
                day.activities.filter(act => act.location)
            );

            if (allActivities.length > 0) {
                const points = allActivities.map(act =>
                    new BMapGL.Point(act.location.lng, act.location.lat)
                );

                allActivities.forEach((act, index) => {
                    const point = points[index];
                    const marker = new BMapGL.Marker(point);
                    map.addOverlay(marker);

                    const infoWindow = new BMapGL.InfoWindow(
                        `<strong style="color: #333">${act.name}</strong><p style="color: #666">${act.description}</p>`,
                        { title: act.type }
                    );
                    marker.addEventListener("click", () => {
                        map.openInfoWindow(infoWindow, point);
                    });
                });

                map.setViewport(points);
            } else {
                map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 11);
            }
        }
    }, [plan, isScriptLoaded]);

    // --- 3. 新增：监听 focusedLocation 变化 ---
    useEffect(() => {
        // 必须等待地图实例存在
        if (!mapInstanceRef.current || !focusedLocation || !isScriptLoaded) return;

        const map = mapInstanceRef.current;
        const BMapGL = (window as any).BMapGL;

        // 创建新点
        const point = new BMapGL.Point(focusedLocation.lng, focusedLocation.lat);

        // 使用 flyTo 平滑移动并放大
        // 16 是一个适合查看具体地点的缩放级别
        map.flyTo(point, 16, {
            duration: 1000 // 1秒钟动画
        });

    }, [focusedLocation, isScriptLoaded]); // 依赖 focusedLocation 和脚本加载状态


    // --- 渲染逻辑 (保持不变) ---
    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-destructive-foreground p-4 text-center">{error}</p>
            </div>
        );
    }

    if (!ak || !isScriptLoaded) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">地图加载中...</span>
            </div>
        );
    }

    return <div ref={mapContainerRef} className="w-full h-full" />;
}