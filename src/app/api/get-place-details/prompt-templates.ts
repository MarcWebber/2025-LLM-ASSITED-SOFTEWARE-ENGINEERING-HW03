/**
 * 提示词：只获取一个地点的详细信息
 */

// 1. 这是输出的 Schema (对应 lib/types.ts 中的 PlaceDetails)
const JSON_SCHEMA = `
{
  "description": "string (该地点的简要描述，1-2句话)",
  "location": {
    "lat": "number (必需, 百度 BD-09 纬度坐标)",
    "lng": "number (必需, 百度 BD-09 经度坐标)"
  },
  "details": {
    "address": "string (必需, 详细地址)",
    "openingHours": "string (可选, 开放时间)",
    "ticketPrice": "string (可选, 票价或人均消费)"
  }
}
`;

export function buildDetailsPrompt(activityName: string, context: string): string {
    return `
你是一个 AI 地理信息查询助手。
你的任务是查询一个特定地点的详细信息，并以 JSON 格式返回。

地点名称: "${activityName}"
地点上下文 (城市/国家): "${context}"

请**严格**按照以下 JSON 格式返回该地点的详细信息：
${JSON_SCHEMA}

确保：
1.  只返回 JSON 对象，没有其他文本。
2.  坐标 (lat, lng) **必须**是**百度地图 (BD-09) 坐标系**。
3.  'address' 字段必须填写。
`;
}