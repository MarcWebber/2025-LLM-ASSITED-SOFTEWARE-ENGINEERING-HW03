import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "./prompt-template"; // 导入我们刚创建的 Prompt
import type { TripPlan } from "@/lib/types"; // 导入我们的类型

// 阿里云灵积 (DashScope) API 的调用地址
// 我们选用 qwen-plus，这是一个性能和质量均衡的强大模型
const ALI_DASHSCOPE_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
const MODEL_NAME = "qwen-plus"; // 您也可以换成 "qwen-max" 或 "qwen-turbo"

export async function POST(req: NextRequest) {
    try {
        // 1. 解析来自前端的请求体
        const { prompt: userInput, apiKey } = await req.json();
        console.log("收到的用户输入:", userInput);

        if (!userInput) {
            return NextResponse.json({ message: "Prompt 缺失" }, { status: 400 });
        }
        if (!apiKey) {
            return NextResponse.json({ message: "API Key 缺失" }, { status: 400 });
        }

        // 2. 构建结构化的 Prompt
        const structuredPrompt = buildPrompt(userInput);

        // 3. 构建发送给阿里云的请求体
        const requestBody = {
            model: MODEL_NAME,
            input: {
                prompt: structuredPrompt,
            },
            parameters: {
                // DashScope 支持 "json_object" 模式，这能极大提高 JSON 输出的稳定性
                result_format: "json_object",
            },
            "debug":{}
        };

        // 4. 发起 fetch 请求
        const response = await fetch(ALI_DASHSCOPE_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // API Key 通过 Bearer Token 方式传递
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            // 如果 API 返回了错误状态 (例如 401, 500)
            const errorBody = await response.json();
            console.error("阿里云 API 请求失败:", errorBody);
            throw new Error(`API 请求失败: ${errorBody.message || response.statusText}`);
        }

        // 5. 解析 API 的成功响应
        const data = await response.json();

        if (data.output && data.output.choices) {
            // 提取 AI 生成的核心文本内容
            const aiResponseText = data.output.choices[0].message.content;

            // 6. 将 AI 返回的 JSON 字符串解析为 JavaScript 对象
            try {
                // 因为我们使用了 result_format: "json_object"，理论上 aiResponseText
                // 应该是一个能被直接解析的 JSON 字符串
                const tripPlan: TripPlan = JSON.parse(aiResponseText);

                // 7. 成功！将解析后的 JSON 对象返回给前端
                return NextResponse.json(tripPlan);

            } catch (parseError) {
                // 如果 AI 没有返回严格的 JSON，我们会在这里失败
                console.error("AI 返回的 JSON 解析失败:", parseError);
                console.error("AI 返回的原始文本:", aiResponseText);
                throw new Error("AI 返回了无效的 JSON 格式，无法解析。");
            }

        } else {
            // 如果 API 响应结构不符合预期
            console.error("阿里云 API 响应格式不正确:", data);
            throw new Error("AI 返回了空的或无效的响应数据。");
        }

    } catch (error: any) {
        // 统一处理所有错误
        console.error("plan-trip API 捕获到错误:", error);
        return NextResponse.json(
            { message: error.message || "服务器内部错误" },
            { status: 500 }
        );
    }
}