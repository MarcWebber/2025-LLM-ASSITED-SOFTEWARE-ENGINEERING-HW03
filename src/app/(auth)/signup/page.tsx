"use client";

import { useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // M3.1.1 注册
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Supabase 会发送一封确认邮件
                emailRedirectTo: `${window.location.origin}/`,
            },
        });

        if (error) {
            setError(error.message);
        } else {
            // 注册成功，提示用户检查邮箱
            setMessage(
                "注册成功！已向您的邮箱发送一封确认邮件，请点击邮件中的链接以激活您的账户。"
            );
        }
        setIsLoading(false);
    };

    return (
        <Card>
            <form onSubmit={handleSignUp}>
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">创建账户</CardTitle>
                    <CardDescription>
                        输入您的邮箱和密码以注册
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>注册失败</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {message && (
                        <Alert variant="default">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>注册成功</AlertTitle>
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
                            minLength={6}
                            placeholder="至少6位"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "注册中..." : "注 册"}
                    </Button>
                    <Button asChild variant="link" size="sm" className="w-full">
                        <Link href="/login">已经有账户了？去登录</Link>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}