"use client";

import { useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import {
    Utensils,
    Camera,
    Bed,
    MapPin,
    Bus,
    ShoppingBag,
} from "lucide-react";

import type { TripPlan, Activity } from "@/lib/types";

// 1. 更新 Props 接口
interface TimelineViewProps {
    plan: TripPlan | null;
    onActivityClick: (activity: Activity) => void; // 新增
}

// 图标映射 (保持不变)
const iconMap: { [key: string]: React.ElementType } = {
    Attraction: Camera,
    Restaurant: Utensils,
    Hotel: Bed,
    Transportation: Bus,
    Shopping: ShoppingBag,
    Other: MapPin,
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// 2. 接收新的 prop
export function TimelineView({ plan, onActivityClick }: TimelineViewProps) {
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    if (!plan) return null;

    const budgetData = plan.budget?.breakdown.map((item) => ({
        name: item.category,
        value: item.amount,
    })) || [];

    const handleActivityClick = (activity: Activity) => {
        setSelectedActivity(activity);
    };

    return (
        <div className="space-y-6">

            {/* 预算分析卡片 (保持不变) */}
            <Card>
                {/* ... (内部代码保持不变) ... */}
                <CardHeader>
                    <CardTitle>AI 预算分析 (M2.1)</CardTitle>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl font-bold mb-2">
                        总预算估算: ￥{plan.budget?.total.toLocaleString() || "N/A"}
                    </h3>
                    <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={budgetData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={(entry) => `${entry.name} (￥${entry.value})`}
                                >
                                    {budgetData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `￥${value.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 每日行程 */}
            <h2 className="text-2xl font-bold">每日行程 (M1.2.5)</h2>
            <Accordion type="multiple" defaultValue={["day-0"]} className="w-full">
                {plan.days.map((day, index) => (
                    <AccordionItem value={`day-${index}`} key={index}>
                        <AccordionTrigger>
                            <h3 className="text-xl font-semibold">
                                第 {day.day} 天: {day.theme}
                            </h3>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                {day.activities.map((activity, actIndex) => {
                                    const Icon = iconMap[activity.type] || MapPin;
                                    return (
                                        <Card
                                            key={actIndex}
                                            className="cursor-pointer hover:shadow-md transition-shadow"
                                            // 3. 关键修改：同时触发内部弹窗和外部地图聚焦
                                            onClick={() => {
                                                handleActivityClick(activity); // 触发弹窗
                                                onActivityClick(activity);    // 触发地图
                                            }}
                                        >
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                    <span>{activity.time}: {activity.name}</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p>{activity.description}</p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {/* 弹窗 (保持不变) */}
            <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
                {/* ... (内部代码保持不变) ... */}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedActivity?.name}</DialogTitle>
                        <DialogDescription>
                            {selectedActivity?.time} - {selectedActivity?.type}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <p>{selectedActivity?.description}</p>
                        <p className="text-sm text-muted-foreground">
                            地点: {selectedActivity?.location.lat}, {selectedActivity?.location.lng} (模拟坐标)
                        </p>
                        <p className="text-sm text-muted-foreground">
                            (更多详情，如开放时间、票价等将在这里显示)
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}