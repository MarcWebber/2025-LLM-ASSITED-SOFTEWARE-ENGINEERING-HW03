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

// 导入我们在 lib/types.ts 中定义的类型
import type { TripPlan, Activity } from "@/lib/types";

interface TimelineViewProps {
    plan: TripPlan | null;
}

// 图标映射
const iconMap: { [key: string]: React.ElementType } = {
    Attraction: Camera,
    Restaurant: Utensils,
    Hotel: Bed,
    Transportation: Bus,
    Shopping: ShoppingBag,
    Other: MapPin,
};

// 饼图颜色
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function TimelineView({ plan }: TimelineViewProps) {
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    if (!plan) return null;

    // 格式化预算数据以适应 PieChart
    const budgetData = plan.budget?.breakdown.map((item) => ({
        name: item.category,
        value: item.amount,
    })) || [];

    const handleActivityClick = (activity: Activity) => {
        setSelectedActivity(activity);
    };

    return (
        <div className="space-y-6">

            {/* M2.1 AI 预算分析 */}
            <Card>
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

            {/* M1.2.5 时间线视图 */}
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
                                            onClick={() => handleActivityClick(activity)} // M1.3.1
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

            {/* M1.3.1 查看详情弹窗 */}
            <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
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