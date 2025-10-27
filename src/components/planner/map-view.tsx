"use client";

import { useState, useEffect } from "react";
import { Map, Marker, InfoWindow } from "react-bmapgl";
import { BAIDU_MAP_AK_STORAGE_KEY } from "@/app/(main)/settings/page";

import type { TripPlan, Activity } from "@/lib/types";

interface MapViewProps {
    plan: TripPlan | null;
}

// 动态加载百度地图 JS SDK 的 Hook
function useBaiduMapScript(ak: string | null) {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!ak) return; // 如果没有 AK，则不加载

        // 检查脚本是否已加载
        if (window.BMapGL) {
            setScriptLoaded(true);
            return;
        }

        // 检查是否已在加载中
        if (document.getElementById("baidu-map-script")) return;

        const script = document.createElement("script");
        script.id = "baidu-map-script";
        script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${ak}&callback=baiduMapScriptLoaded`;
        script.onerror = () => setError(true);

        // 百度地图 JS SDK 需要一个全局回调函数
        (window as any).baiduMapScriptLoaded = () => {
            setScriptLoaded(true);
            delete (window as any).baiduMapScriptLoaded; // 清理
        };

        document.body.appendChild(script);

    }, [ak]); // 依赖 AK

    return { scriptLoaded, error };
}

export function MapView({ plan }: MapViewProps) {
    const [ak, setAk] = useState<string | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedPin, setSelectedPin] = useState<Activity | null>(null);
    const [center, setCenter] = useState({ lng: 116.404, lat: 39.915 }); // 默认北京
    const [zoom, setZoom] = useState(11);

    // 1. 加载百度地图 AK
    useEffect(() => {
        const storedAk = localStorage.getItem(BAIDU_MAP_AK_STORAGE_KEY);
        setAk(storedAk);
    }, []);

    // 2. 加载 JS SDK
    const { scriptLoaded, error: scriptError } = useBaiduMapScript(ak);

    // 3. 当行程计划更新时，提取所有活动点并更新视口
    useEffect(() => {
        if (plan && plan.days) {
            const allActivities = plan.days.flatMap(day =>
                day.activities.filter(act => act.location)
            );
            setActivities(allActivities);

            if (allActivities.length > 0) {
                // 将地图视口居中到第一个活动点
                setCenter({
                    lng: allActivities[0].location.lng,
                    lat: allActivities[0].location.lat,
                });
                setZoom(12);
            }
        } else {
            setActivities([]);
        }
    }, [plan]);

    if (!ak) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground p-4 text-center">
                    百度地图 Access Key (AK) 未设置。
                    <br />
                    请前往“设置”页面进行配置以显示地图。
                </p>
            </div>
        );
    }

    if (scriptError) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-destructive-foreground p-4 text-center">
                    百度地图 JS SDK 加载失败，请检查网络或 AK 是否正确。
                </p>
            </div>
        );
    }

    if (!scriptLoaded) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground p-4 text-center">
                    百度地图组件加载中...
                </p>
            </div>
        );
    }

    // 脚本加载成功后，才渲染地图
    return (
        <Map
            center={center}
            zoom={zoom}
            enableScrollWheelZoom
            style={{ width: "100%", height: "100%" }}
            // BMapGL 需要一个唯一的 'key' 才能在 AK 变化时重渲染
            key={ak}
        >
            {activities.map((act, index) => (
                <Marker
                    key={`marker-${index}`}
                    position={{ lng: act.location.lng, lat: act.location.lat }}
                    onClick={() => setSelectedPin(act)}
                />
            ))}

            {selectedPin && (
                <InfoWindow
                    position={{ lng: selectedPin.location.lng, lat: selectedPin.location.lat }}
                    title={selectedPin.name}
                    text={selectedPin.description}
                    onClose={() => setSelectedPin(null)}
                />
            )}
        </Map>
    );
}