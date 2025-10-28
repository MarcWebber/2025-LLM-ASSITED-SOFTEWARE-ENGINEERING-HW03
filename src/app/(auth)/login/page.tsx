"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null); // 用于密码重置提示

    // M3.1.2 登录
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            toast.success("登录成功！");
            // 登录成功后，Supabase 会触发一个 auth 状态变更
            // 我们的全局 Context (下一步创建) 会监听到
            // 并自动重定向到 /planner
            // 为了保险起见，我们也可以手动跳转
            router.push("/planner");
            router.refresh(); // 确保刷新布局
        }
        setIsLoading(false);
    };

    // M3.1.3 密码重置
    const handlePasswordReset = async () => {
        setError(null);
        setMessage(null);
        if (!email) {
            setError("请输入您的邮箱地址以重置密码。");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback`, // Supabase 需要一个重定向地址
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage("密码重置邮件已发送，请检查您的邮箱。");
        }
    };

    return (
        <Card>
            <form onSubmit={handleLogin}>
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">登录</CardTitle>
                    <CardDescription>
                        使用您的邮箱和密码登录
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>登录失败</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {message && (
                        <Alert variant="default">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>提示</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">邮箱</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">密码</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "登录中..." : "登 录"}
                    </Button>
                    <div className="flex justify-between w-full">
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={handlePasswordReset}
                        >
                            忘记密码?
                        </Button>
                        <Button asChild variant="link" size="sm">
                            <Link href="/signup">还没有账户？去注册</Link>
                        </Button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}