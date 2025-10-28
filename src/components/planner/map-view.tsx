"use client";

// 1. 只导入 React hooks 和辅助工具
import { useState, useEffect, useRef } from "react";
import { BAIDU_MAP_AK_STORAGE_KEY } from "@/app/(main)/settings/page";
import { Loader2 } from "lucide-react";

// 2. 不再导入 'react-bmapgl'
import type { TripPlan, Activity } from "@/lib/types";

interface MapViewProps {
    plan: TripPlan | null;
}

export function MapView({ plan }: MapViewProps) {
    // 3. 使用 Refs
    const mapContainerRef = useRef<HTMLDivElement>(null); // 指向地图容器 div
    const mapInstanceRef = useRef<any>(null); // 存储 BMapGL.Map 实例

    const [ak, setAk] = useState<string | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. 加载 AK
    useEffect(() => {
        const storedAk = localStorage.getItem(BAIDU_MAP_AK_STORAGE_KEY);
        if (storedAk) {
            setAk(storedAk);
        } else {
            setError("AK 未设置，请在设置页面配置");
        }
    }, []);

    // 2. 加载百度地图 WebGL 脚本
    useEffect(() => {
        if (!ak) return; // 没有 AK 则不加载

        // 如果已加载，则直接设置
        if ((window as any).BMapGL) {
            setScriptLoaded(true);
            return;
        }

        // 防止重复加载
        if (document.getElementById("baidu-map-script")) return;

        const CALLBACK_NAME = "baiduMapScriptLoaded";
        (window as any)[CALLBACK_NAME] = () => {
            setScriptLoaded(true);
            delete (window as any)[CALLBACK_NAME];
        };

        const script = document.createElement("script");
        script.id = "baidu-map-script";
        script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${ak}&callback=${CALLBACK_NAME}`;
        script.onerror = () => setError("百度地图脚本加载失败，请检查AK或网络");
        document.body.appendChild(script);

    }, [ak]); // 依赖 AK

    // 3. 初始化地图 (脚本加载后 & div 渲染后)
    useEffect(() => {
        // 必须等待脚本加载、div 渲染，并且地图未被初始化
        if (scriptLoaded && mapContainerRef.current && !mapInstanceRef.current) {
            const BMapGL = (window as any).BMapGL;
            const map = new BMapGL.Map(mapContainerRef.current); // 关键：手动初始化
            map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 11); // 默认北京
            map.enableScrollWheelZoom(true);
            mapInstanceRef.current = map; // 保存地图实例
        }
    }, [scriptLoaded]); // 依赖脚本加载

    // 4. 更新地图上的覆盖物 (当 plan 改变时)
    useEffect(() => {
        // 必须等待地图实例存在
        if (!mapInstanceRef.current || !scriptLoaded) return;

        const map = mapInstanceRef.current;
        const BMapGL = (window as any).BMapGL;
        map.clearOverlays(); // 清空旧标记

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
                    map.addOverlay(marker); // 添加标记

                    // 创建信息窗口
                    const infoWindow = new BMapGL.InfoWindow(
                        `<strong style="color: #333">${act.name}</strong><p style="color: #666">${act.description}</p>`,
                        { title: act.type }
                    );
                    // 添加点击事件
                    marker.addEventListener("click", () => {
                        map.openInfoWindow(infoWindow, point);
                    });
                });

                // 自动缩放地图以包含所有点
                map.setViewport(points);
            } else {
                // 如果没有活动，重置回默认视图
                map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 11);
            }
        }
    }, [plan, scriptLoaded]); // 依赖 plan 和 脚本加载


    // --- 渲染逻辑 ---
    // 我们只渲染一个 div (或加载/错误状态)
    // 这个 div 必须始终占满父容器

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-destructive-foreground p-4 text-center">{error}</p>
            </div>
        );
    }

    if (!ak || !scriptLoaded) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">地图加载中...</span>
            </div>
        );
    }

    // 5. 渲染地图容器
    // 这个 div 将被 BMapGL.Map() 接管
    // 它的 w-full 和 h-full 继承自 planner/page.tsx 的父 div
    return <div ref={mapContainerRef} className="w-full h-full" />;
}