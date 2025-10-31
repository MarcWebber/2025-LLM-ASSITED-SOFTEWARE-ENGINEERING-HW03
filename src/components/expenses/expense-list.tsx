"use client";

import { supabase } from "@/lib/supabase/client";
import type { Expense } from "@/app/(main)/expenses/page";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

interface ExpenseListProps {
    expenses: Expense[];
    onExpenseDeleted: () => void;
}

// M2.2.3 支出列表
export function ExpenseList({ expenses, onExpenseDeleted }: ExpenseListProps) {

    const handleDelete = async (expenseId: string) => {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', expenseId);

        if (error) {
            toast.error("删除失败：" + error.message);
        } else {
            toast.success("支出已删除");
            onExpenseDeleted(); // 通知父组件刷新
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>支出明细</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>日期</TableHead>
                            <TableHead>类别</TableHead>
                            <TableHead>备注</TableHead>
                            <TableHead className="text-right">金额</TableHead>
                            <TableHead className="w-[50px]">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    暂无支出记录
                                </TableCell>
                            </TableRow>
                        )}
                        {expenses.map(expense => (
                            <TableRow key={expense.id}>
                                <TableCell>{expense.expense_date}</TableCell>
                                <TableCell>{expense.category}</TableCell>
                                <TableCell>{expense.notes || '-'}</TableCell>
                                <TableCell className="text-right">
                                    ￥{expense.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>确认删除？</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    您确定要删除这笔支出吗？此操作无法撤销。
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>取消</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(expense.id)}>
                                                    确认
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}