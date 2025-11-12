"use client";

import {useState} from "react";
import {supabase} from "@/lib/supabase/client";
import {useAuth} from "@/context/auth-context";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {format} from "date-fns";
import {Calendar as CalendarIcon, Loader2, Mic} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {toast} from "sonner";

// 定义表单验证规则
const formSchema = z.object({
    amount: z.coerce.number().min(0.01, "金额必须大于 0"),
    category: z.string().min(1, "请选择一个类别"),
    // 1. 将 z.date() 替换为 z.coerce.date()
    // 2. 这使得 { required_error: ... } 语法可以被正确识别
    expense_date: z.coerce.date({}),
    notes: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

// M2.2.1 手动记账
export function ExpenseForm({tripId, onExpenseAdded}: { tripId: string, onExpenseAdded: () => void }) {
    const {session} = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
            category: "",
            expense_date: new Date(),
            notes: "",
        },
    });

    const onSubmit = async (values: FormSchema) => {
        if (!session) {
            toast.error("用户未登录");
            return;
        }
        setIsLoading(true);

        const {error} = await supabase.from('expenses').insert({
            user_id: session.user.id,
            trip_id: tripId,
            amount: values.amount,
            category: values.category,
            expense_date: format(values.expense_date, 'yyyy-MM-dd'),
            notes: values.notes,
        });

        if (error) {
            toast.error("添加失败：" + error.message);
        } else {
            toast.success("支出已添加！");
            form.reset();
            onExpenseAdded(); // 通知父组件刷新
        }
        setIsLoading(false);
    };

    // M2.2.2 语音记账 (占位符)
    const handleSpeechExpense = () => {
        toast.info("语音记账功能正在开发中...");
        // TODO: 实现 Web Speech API
        // 1. 语音识别
        // 2. 解析 "打车 30 块" -> amount: 30, category: 'Transportation'
        // 3. form.setValue(...)
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* 金额 */}
                <FormField
                    control={form.control}
                    name="amount"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>金额 (￥)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                {/* 类别 */}
                <FormField
                    control={form.control}
                    name="category"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>类别</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择一个支出类别"/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Food">餐饮</SelectItem>
                                    <SelectItem value="Transportation">交通</SelectItem>
                                    <SelectItem value="Accommodation">住宿</SelectItem>
                                    <SelectItem value="Activities">活动</SelectItem>
                                    <SelectItem value="Shopping">购物</SelectItem>
                                    <SelectItem value="Other">其他</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                {/* 日期 */}
                <FormField
                    control={form.control}
                    name="expense_date"
                    render={({field}) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>日期</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "yyyy-MM-dd")
                                            ) : (
                                                <span>选择日期</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                {/* 备注 */}
                <FormField
                    control={form.control}
                    name="notes"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>备注 (可选)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="例如：和朋友一起吃的晚餐..." {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <div className="flex justify-between gap-2">
                    {/* M2.2.2 语音记账按钮 (占位符) */}
                    <Button type="button" variant="outline" size="icon" onClick={handleSpeechExpense}>
                        <Mic className="h-4 w-4"/>
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isLoading ? "保存中..." : "保存支出"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}