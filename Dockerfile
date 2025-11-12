# --- 阶段 1：构建器 (Builder) ---
# 使用 Node.js v22-alpine 来匹配您的本地环境
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# 安装所有依赖
RUN npm install

# 复制所有剩余的源代码
COPY . .

# 运行 Next.js 生产构建
RUN npm run build

# --- 阶段 2：生产 (Production) ---
# 同样使用 Node.js v22-alpine
FROM node:22-alpine AS production

# 设置工作目录
WORKDIR /app

# 设置环境变量为 production
ENV NODE_ENV=production

# 从 'builder' 阶段复制必要的文件
# 1. 复制 public 文件夹
COPY --from=builder /app/public ./public

# 2. 复制独立的服务器和 node_modules
COPY --from=builder /app/.next/standalone ./

# 3. 复制 Next.js 的静态构建资源
COPY --from=builder /app/.next/static ./.next/static

# 暴露 3000 端口
EXPOSE 3000

# 运行应用的命令 (standalone 模式会生成 server.js)
CMD ["node", "server.js"]