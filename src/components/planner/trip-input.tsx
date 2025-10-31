"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Sparkles, Square } from "lucide-react";
import { toast } from "sonner";

// 浏览器端的 SpeechRecognition API
let recognition: any = null;
if (typeof window !== "undefined") {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false; // 只识别一句
        recognition.lang = 'zh-CN'; // 设置为中文
        recognition.interimResults = false;
    }
}

interface TripInputProps {
    onGenerate: (prompt: string) => void;
    isLoading: boolean;
    // 允许父组件设置 prompt (例如语音识别)
    prompt: string;
    setPrompt: (prompt: string) => void;
}

const quickTags = ["亲子", "穷游", "情侣", "美食", "动漫", "购物", "自然风光"];

export function TripInput({ onGenerate, isLoading, prompt, setPrompt }: TripInputProps) {
    const [isListening, setIsListening] = useState(false);

    const handleTagClick = (tag: string) => {
        setPrompt((prev) => (prev ? `${prev}, ${tag}` : tag));
    };

    // M1.1.2 语音输入
    const handleSpeechInput = () => {
        if (!recognition) {
            toast.error("您的浏览器不支持语音识别功能。");
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }

        recognition.start();
        setIsListening(true); // 开始收听，提供视觉反馈

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            toast.error("语音识别出错", { description: event.error });
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">


            <div className="flex flex-wrap gap-2">
                {quickTags.map((tag) => (
                    <Badge
                        key={tag}
                        variant="outline"
                        onClick={() => handleTagClick(tag)}
                        className="cursor-pointer"
                        aria-disabled={isLoading}
                    >
                        {tag}
                    </Badge>
                ))}
            </div>

            <Textarea
                placeholder="例如：“我想去日本，5天，预算 1 万元，喜欢美食和动漫，带孩子”"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                disabled={isLoading}
            />

            <div className="flex justify-between items-center gap-2">
                <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"} // 正在收听时变色
                    size="icon"
                    onClick={handleSpeechInput}
                    disabled={isLoading}
                    aria-label={isListening ? "停止收听" : "语音输入"}
                >
                    {isListening ? (
                        <Square className="h-4 w-4 animate-pulse" /> // 视觉反馈
                    ) : (
                        <Mic className="h-4 w-4" />
                    )}
                </Button>

                <Button
                    type="submit"
                    disabled={isLoading || !prompt || !prompt.trim()}
                    className="flex items-center gap-2"
                >
                    <Sparkles className="" />
                    {isLoading ? "AI 正在规划中..." : "生成智能行程"}
                </Button>
            </div>
        </form>
    );
}