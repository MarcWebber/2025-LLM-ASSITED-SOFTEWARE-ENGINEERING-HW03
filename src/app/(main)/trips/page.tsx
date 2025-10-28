"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import type { SavedTrip } from "@/lib/types"; // 导入新类型
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash, Eye, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function TripsPage() {
    const { session } = useAuth();
    const [trips, setTrips] = useState<SavedTrip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // M3.2.1: 获取行程列表
    useEffect(() => {
        if (!session) return; // 等待 session 加载

        const fetchTrips = async () => {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('trips')
                .select('*') // 获取所有列
                .eq('user_id', session.user.id) // 只获取当前用户的
                .order('created_at', { ascending: false }); // 按创建时间排序

            if (error) {
                setError(error.message);
                toast.error("获取行程列表失败：" + error.message);
            } else {
                setTrips(data as SavedTrip[]);
            }
            setIsLoading(false);
        };

        fetchTrips();
    }, [session]); // 当 session 可用时触发

    // M3.2.2: 删除行程
    const handleDeleteTrip = async (tripId: string) => {
        const { error } = await supabase
            .from('trips')
            .delete()
            .eq('id', tripId);

        if (error) {
            toast.error("删除失败：" + error.message);
        } else {
            // 从本地状态中移除，实现 UI 实时更新
            setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
            toast.success("行程已删除。");
        }
    };

    // --- 渲染逻辑 ---

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-4 text-lg text-muted-foreground">
          正在加载您的行程...
        </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>加载失败</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">我的行程</h1>
                <Button asChild>
                    <Link href="/planner">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        创建新行程
                    </Link>
                </Button>
            </div>

            {trips.length === 0 ? (
                <div className="text-center py-16">
                    <h3 className="text-xl font-semibold">您还没有保存任何行程</h3>
                    <p className="text-muted-foreground mt-2">
                        前往“智能规划”页面，创建您的第一次旅行吧！
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {trips.map((trip) => (
                        <Card key={trip.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{trip.title}</CardTitle>
                                <CardDescription>
                                    创建于: {new Date(trip.created_at).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                {/* 可以在这里显示一个小的预览，例如总天数 */}
                                <p>
                                    总天数：{trip.plan_data.days.length} 天
                                </p>
                                <p>
                                    总预算：￥{trip.plan_data.budget.total.toLocaleString()}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">

                                {/* 删除按钮 (M3.2.2) */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            <Trash className="mr-1 h-4 w-4" /> 删除
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>确认删除？</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                您确定要删除行程 "{trip.title}" 吗？此操作无法撤销。
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>取消</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeleteTrip(trip.id)}
                                            >
                                                确认删除
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                {/* 查看/加载按钮 (M3.2.2) */}
                                <Button asChild size="sm">
                                    {/* 点击查看，跳转到 planner 并带上 trip_id 参数 */}
                                    <Link href={`/planner?trip_id=${trip.id}`}>
                                        <Eye className="mr-1 h-4 w-4" /> 查看
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}