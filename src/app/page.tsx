import Link from "next/link";

export default function HomePage() {
  return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-10 text-center">

          {/* 主标题 */}
          <h1 className="text-4xl font-extrabold tracking-tighter md:text-5xl lg:text-6xl">
            欢迎使用 AI 旅行规划助手
          </h1>

          {/* 副标题 */}
          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
            只需告诉我们您的目的地、预算和偏好，
            <br />
            AI 即可为您生成详细的每日行程、预算分析和地图路线。
          </p>

          {/* 行为召唤 (Call to Action) */}
          <div className="flex gap-4">
            <Link
                href="/planner"
                className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium text-primary-foreground transition-colors bg-primary rounded-md shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              开始规划
            </Link>
            <Link
                href="https://github.com/your-repo/ai-trip-planner" // TODO: 记得替换成你的 GitHub 仓库地址
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium transition-colors border rounded-md shadow-sm border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              查看源码
            </Link>
          </div>
        </div>
      </main>
  );
}