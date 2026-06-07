# Zeabur 部署指南

## 部署步骤

### 1. 准备数据库

由于本项目使用 SQLite，建议在 Zeabur 上改用 PostgreSQL 或 MySQL。

在 Zeabur 上创建数据库服务后，更新 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"  // 或 "mysql"
  url      = env("DATABASE_URL")
}
```

### 2. 设置环境变量

在 Zeabur 项目设置中添加以下环境变量：

```env
DATABASE_URL=postgresql://user:password@host:port/database
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.zeabur.app
```

生成 AUTH_SECRET：
```bash
openssl rand -base64 32
```

### 3. 部署到 Zeabur

1. 将代码推送到 GitHub/GitLab
2. 在 Zeabur 中连接你的仓库
3. Zeabur 会自动检测 Dockerfile 并构建
4. 等待部署完成

### 4. 初始化数据库

部署完成后，运行种子数据（如需要）：

```bash
# 在 Zeabur 控制台执行
npx prisma migrate deploy
npm run seed
```

## 本地测试 Docker

构建镜像：
```bash
docker build -t meet-app .
```

运行容器：
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./prisma/dev.db" \
  -e AUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  meet-app
```

## 注意事项

- SQLite 不适合生产环境，建议使用 PostgreSQL
- 确保所有环境变量都已正确设置
- Prisma 迁移会在容器启动时自动运行
- 如果需要持久化数据，使用 Zeabur 的数据库服务
