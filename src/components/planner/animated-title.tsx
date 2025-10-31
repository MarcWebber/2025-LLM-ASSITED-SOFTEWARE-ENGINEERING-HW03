"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils"; // 导入 cn 工具

// 1. 定义要循环的词组
const rotatingWords = [
    "去哪儿？",
    "玩几天？",
    "和谁一起？",
    "预算多少？",
    "有什么偏好？"
];

// 2. 定义打字速度
const TYPE_SPEED = 100; // 打字速度 (ms)
const DELETE_SPEED = 50; // 删除速度 (ms)
const PAUSE_DURATION = 2000; // 词组间暂停 (ms)

export function AnimatedTitle() {
    const [staticText] = useState("1. 告诉 AI 您的需求: ");
    const [dynamicText, setDynamicText] = useState("");
    const [wordIndex, setWordIndex] = useState(0); // 当前词组的索引
    const [charIndex, setCharIndex] = useState(0); // 当前字符的索引
    const [isDeleting, setIsDeleting] = useState(false); // 是否正在删除

    useEffect(() => {
        const currentWord = rotatingWords[wordIndex];

        const timer = setTimeout(() => {
            if (isDeleting) {
                // --- 删除逻辑 ---
                setDynamicText(currentWord.substring(0, charIndex - 1));
                setCharIndex(charIndex - 1);

                if (charIndex === 0) {
                    setIsDeleting(false);
                    // 切换到下一个词
                    setWordIndex((prev) => (prev + 1) % rotatingWords.length);
                }
            } else {
                // --- 打字逻辑 ---
                setDynamicText(currentWord.substring(0, charIndex + 1));
                setCharIndex(charIndex + 1);

                // 如果单词打完了
                if (charIndex === currentWord.length) {
                    // 等待 PAUSE_DURATION 毫秒后开始删除
                    setTimeout(() => setIsDeleting(true), PAUSE_DURATION);
                }
            }
        }, isDeleting ? DELETE_SPEED : TYPE_SPEED);

        // 清理定时器
        return () => clearTimeout(timer);

    }, [charIndex, isDeleting, wordIndex]);

    return (
        <h2 className="text-2xl font-bold font-mono">
            {/* 静态标题部分 */}
            <span>{staticText}</span>

            {/* 动态词组部分 */}
            <span className="text-primary">{dynamicText}</span>

            {/* 模拟的光标闪烁效果 */}
            <span className="animate-blink border-r-2 border-current" aria-hidden="true"></span>
        </h2>
    );
}