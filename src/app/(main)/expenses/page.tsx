"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import type { SavedTrip, TripPlan } from "@/lib/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, DollarSign, PlusCircle } from "lucide-react";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseStats } from "@/components/expenses/expense-stats";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// 定义 Expense 类型
export interface Expense {
    id: string;
    trip_id: string;
    amount: number;
    category: string;
    expense_date: string;
    notes?: string;
}

export default function ExpensesPage() {
    const { session } = useAuth();
    const [trips, setTrips] = useState<SavedTrip[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<SavedTrip | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // 1. 获取用户的所有已保存行程，用于下拉选择
    useEffect(() => {
        if (!session) return;
        setIsLoading(true);
        const fetchTrips = async () => {
            const { data, error } = await supabase
                .from('trips')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setTrips(data as SavedTrip[]);
                // 默认选中第一个行程
                if (data.length > 0) {
                    handleTripChange(data[0].id);
                } else {
                    setIsLoading(false);
                }
            }
        };
        fetchTrips();
    }, [session]);

    // 2. 当行程改变时，获取该行程的支出
    const fetchExpenses = async (tripId: string) => {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('trip_id', tripId)
            .order('expense_date', { ascending: false });

        if (data) {
            setExpenses(data as Expense[]);
        }
    };

    // 3. 处理行程选择器变化
    const handleTripChange = (tripId: string) => {
        const trip = trips.find(t => t.id === tripId) || null;
        setSelectedTrip(trip);
        if (trip) {
            fetchExpenses(trip.id);
        }
        setIsLoading(false);
    };

    // 4. 当添加或删除了支出时，刷新列表
    const onExpenseUpdate = () => {
        if (selectedTrip) {
            fetchExpenses(selectedTrip.id);
        }
        setIsFormOpen(false); // 关闭表单
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">费用管理</h1>
                {/* 行程选择器 */}
                {trips.length > 0 ? (
                    <Select
                        onValueChange={handleTripChange}
                        defaultValue={selectedTrip?.id}
                    >
                        <SelectTrigger className="w-full sm:w-[300px]">
                            <SelectValue placeholder="请选择一个行程..." />
                        </SelectTrigger>
                        <SelectContent>
                            {trips.map(trip => (
                                <SelectItem key={trip.id} value={trip.id}>
                                    {trip.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <p className="text-muted-foreground">请先去“智能规划”保存一个行程</p>
                )}
            </div>

            {selectedTrip ? (
                <div className="space-y-8">
                    {/* M2.2.4 统计图表 */}
                    <ExpenseStats
                        budget={selectedTrip.plan_data.budget}
                        expenses={expenses}
                    />

                    {/* 记账表单 (M2.2.1) */}
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                记一笔
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>添加一笔新支出</DialogTitle>
                            </DialogHeader>
                            <ExpenseForm
                                tripId={selectedTrip.id}
                                onExpenseAdded={onExpenseUpdate}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* M2.2.3 支出列表 */}
                    <ExpenseList expenses={expenses} onExpenseDeleted={onExpenseUpdate} />
                </div>
            ) : (
                <div className="text-center py-16">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mt-4">
                        {trips.length > 0 ? "请选择一个行程开始记账" : "没有可管理的行程"}
                    </h3>
                </div>
            )}
        </div>
    );
}