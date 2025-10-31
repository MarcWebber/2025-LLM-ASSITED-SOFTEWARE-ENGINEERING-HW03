// 标记为客户端组件
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// 定义 Key 的常量
export const API_KEY_STORAGE_KEY = "APP_LLM_API_KEY";
export const BAIDU_MAP_AK_STORAGE_KEY = "APP_BAIDU_MAP_AK";

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState("");
    const [baiduMapAk, setBaiduMapAk] = useState(""); // <-- 修改

    // 在组件加载时，尝试从 localStorage 读取已保存的 Key
    useEffect(() => {
        const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
        const storedBaiduAk = localStorage.getItem(BAIDU_MAP_AK_STORAGE_KEY); // <-- 修改
        if (storedBaiduAk) {
            setBaiduMapAk(storedBaiduAk); // <-- 修改
        }
    }, []);

    // 保存按钮的点击事件处理
    const handleSaveKeys = () => {
        // 保存到 localStorage
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        localStorage.setItem(BAIDU_MAP_AK_STORAGE_KEY, baiduMapAk); // <-- 修改

        toast.success("保存成功", {
            description: "您的 API Key 和百度地图 AK 已被保存。",
        });
    };

    return (
        <div className="py-8">
            <h1 className="text-3xl font-bold mb-6">应用设置</h1>

            <div className="space-y-6">
                {/* AI Key 输入 */}
                <div className="space-y-2">
                    <Label htmlFor="api-key">AI 服务 API Key</Label>
                    <p className="text-sm text-muted-foreground">
                        (针对助教：请在此处输入您的阿里云百炼平台 Key)
                    </p>
                    <Input
                        id="api-key"
                        type="password"
                        placeholder="请输入您的 AI API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                </div>

                {/* 百度地图 AK 输入 */}
                <div className="space-y-2">
                    <Label htmlFor="baidu-ak">百度地图 Access Key (AK)</Label>
                    <p className="text-sm text-muted-foreground">
                        地图功能需要百度地图 AK。(针对助教：请在此处输入您的百度地图 AK)
                    </p>
                    <Input
                        id="baidu-ak"
                        type="password"
                        placeholder="请输入您的百度地图 AK"
                        value={baiduMapAk}
                        onChange={(e) => setBaiduMapAk(e.target.value)} // <-- 修改
                    />
                </div>

                <Button onClick={handleSaveKeys}>
                    保存所有 Key
                </Button>
            </div>
        </div>
    );
}