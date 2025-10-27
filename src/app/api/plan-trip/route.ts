import { NextRequest, NextResponse } from "next/server";
import type { TripPlan } from "@/lib/types"; // 导入类型

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
    try {
        const { prompt, apiKey } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ message: "API Key 缺失" }, { status: 400 });
        }

        // TODO: 调用阿里云百炼 LLM API
        // 确保你的 Prompt 要求 LLM 严格按照 lib/types.ts 的 JSON 格式返回
        // 并且为每个地点提供真实的 (lat, lng) 坐标 (BD-09 百度坐标系)

        await delay(2000); // 模拟 AI 处理

        // 返回一个更逼真的模拟结果 (使用百度坐标系)
        const mockPlan: TripPlan = {
            title: `关于 "日本5天美食动漫" 的旅行计划 (模拟)`,
            budget: {
                total: 10000,
                breakdown: [
                    { category: "Accommodation", amount: 3000 },
                    { category: "Food", amount: 2500 },
                    { category: "Transportation", amount: 2000 },
                    { category: "Activities", amount: 1500 },
                    { category: "Shopping", amount: 1000 },
                ],
            },
            days: [
                {
                    day: 1,
                    theme: "东京：动漫与美食",
                    activities: [
                        {
                            time: "09:00",
                            type: "Attraction",
                            name: "秋叶原",
                            description: "动漫和电子产品的天堂。",
                            // 注意：这里使用百度 BD-09 坐标系
                            location: { lat: 35.70321, lng: 139.77976 },
                            details: {
                                address: "日本东京都台东区秋叶原",
                                openingHours: "10:00 - 20:00",
                            }
                        },
                        {
                            time: "12:30",
                            type: "Restaurant",
                            name: "一兰拉面 (秋叶原店)",
                            description: "体验经典的豚骨拉面。",
                            // 注意：这里使用百度 BD-09 坐标系
                            location: { lat: 35.7035, lng: 139.7802 }
                        },
                        {
                            time: "18:00",
                            type: "Hotel",
                            name: "新宿格拉斯丽酒店",
                            description: "入住著名的“哥斯拉酒店”。",
                            // 注意：这里使用百度 BD-09 坐标系
                            location: { lat: 35.6989, lng: 139.7072 }
                        },
                    ],
                },
                {
                    day: 2,
                    theme: "东京：传统与现代",
                    activities: [
                        {
                            time: "10:00",
                            type: "Attraction",
                            name: "浅草寺",
                            description: "体验东京最古老的寺庙。",
                            // 注意：这里使用百度 BD-09 坐标系
                            location: { lat: 35.71879, lng: 139.80287 }
                        },
                        {
                            time: "14:00",
                            type: "Shopping",
                            name: "涩谷十字路口",
                            description: "感受世界上最繁忙的十字路口和周边购物区。",
                            // 注意：这里使用百度 BD-09 坐标系
                            location: { lat: 35.6635, lng: 139.707 }
                        },
                    ],
                },
            ],
        };

        return NextResponse.json(mockPlan);

    } catch (error: any) {
        return NextResponse.json({ message: error.message || "服务器内部错误" }, { status: 500 });
    }
}