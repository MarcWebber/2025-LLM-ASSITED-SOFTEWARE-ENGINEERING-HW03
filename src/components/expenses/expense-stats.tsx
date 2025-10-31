"use client";

import type { Expense } from "@/app/(main)/expenses/page";
import type { Budget } from "@/lib/types";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseStatsProps {
    budget: Budget;
    expenses: Expense[];
}

// --- 1. 新增：创建一个翻译映射 ---
const categoryMap: { [key: string]: string } = {
    "Food": "餐饮",
    "Transportation": "交通",
    "Accommodation": "住宿",
    "Activities": "活动",
    "Shopping": "购物",
    "Other": "其他",
};

// M2.2.4 消费统计
export function ExpenseStats({ budget, expenses }: ExpenseStatsProps) {
    // 1. 计算总花费 (保持不变)
    const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // 2. 准备图表数据
    const data = budget.breakdown.map(budgetCategory => {
        // 计算该类别的总支出 (保持不变)
        const spentInCategory = expenses
            .filter(exp => exp.category === budgetCategory.category)
            .reduce((acc, exp) => acc + exp.amount, 0);

        return {
            // --- 2. 关键修改：在这里翻译 category ---
            name: categoryMap[budgetCategory.category] || budgetCategory.category,
            "预算": budgetCategory.amount,
            "花费": spentInCategory,
        };
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>预算 vs 花费</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <h3 className="text-2xl font-bold">
                        总花费: ￥{totalSpent.toLocaleString()}
                    </h3>
                    <p className="text-lg text-muted-foreground">
                        总预算: ￥{budget.total.toLocaleString()}
                    </p>
                    {totalSpent > budget.total && (
                        <p className="text-destructive font-bold">
                            您已超支 ￥{(totalSpent - budget.total).toLocaleString()}！
                        </p>
                    )}
                </div>

                <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={data}>
                            {/* XAxis 现在将显示 "餐饮", "交通" 等中文 */}
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `￥${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="预算" fill="#8884d8" />
                            <Bar dataKey="花费" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}