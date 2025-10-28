/**
 * 这个文件用于构建发送给 AI 的详细提示词。
 */

// JSON 格式的文本描述，告诉 AI 我们需要什么。
// 这是根据 /lib/types.ts 中的类型定义转换而来的。
const JSON_SCHEMA = `
{
  "title": "string (旅行计划的标题，例如 '日本5日美食动漫之旅')",
  "budget": {
    "total": "number (总预算金额, 人民币)",
    "breakdown": [
      {
        "category": "string (必须是 'Transportation', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Other' 之一)",
        "amount": "number (该分类的估算金额)"
      }
    ]
  },
  "days": [
    {
      "day": "number (第几天, 从 1 开始)",
      "theme": "string (当天的主题, e.g., '东京动漫圣地巡礼')",
      "activities": [
        {
          "time": "string (活动时间, 格式 'HH:MM', e.g., '09:00')",
          "type": "string (必须是 'Attraction', 'Restaurant', 'Transportation', 'Hotel', 'Shopping', 'Other' 之一)",
          "name": "string (活动或地点的名称)",
          "description": "string (活动的简要描述，1-2句话)",
          "location": {
            "lat": "number (必需, 地点的百度 BD-09 纬度坐标)",
            "lng": "number (必需, 地点的百度 BD-09 经度坐标)"
          },
          "details": {
            "address": "string (可选, 详细地址)",
            "openingHours": "string (可选, 开放时间, e.g., '10:00 - 20:00')",
            "ticketPrice": "string (可选, 票价, e.g., '500 JPY')"
          }
        }
      ]
    }
  ]
}
`;

/**
 * 构建发送给 LLM 的最终提示词
 * @param userInput 用户的原始输入
 * @returns 结构化的完整提示词
 */
export function buildPrompt(userInput: string): string {
    return `
你是一个专业的 AI 旅行规划助手。请根据用户的需求，生成一份详细的旅行计划。

用户的需求是："${userInput}"

你的任务是**严格**按照以下 JSON 格式返回一份完整的旅行计划。
**除了 JSON 对象本身，不要返回任何其他文本、解释、前言、结语或 markdown 标记（例如 \`\`\`json ... \`\`\`）。**
你的回复必须是一个可以直接被 JSON.parse() 解析的字符串。

JSON 格式定义：
${JSON_SCHEMA}

请确保：
1.  返回的内容是一个**完整且语法正确**的 JSON 对象。
2.  所有的地理坐标 (lat, lng) **必须**是**百度地图 (BD-09) 坐标系**。这对地图功能至关重要。
3.  所有文本都使用中文。
4.  为预算和活动提供合理、真实的估算。
`;
}