# Zeabur 部署指南

## 部署步骤

### 1. 准备数据库

**重要：** 本项目默认使用 SQLite，但在 Zeabur 生产环境建议使用 PostgreSQL。

#### 选项 A：继续使用 SQLite（简单但不推荐生产环境）

环境变量设置：
```env
DATABASE_URL=file:./dev.db
```

#### 选项 B：使用 PostgreSQL（推荐）

1. 在 Zeabur 控制台创建 PostgreSQL 服务
2. 修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. 重新生成 Prisma Client 和迁移：
```bash
npx prisma generate
npx prisma migrate dev --name init_postgres
```

### 2. 设置环境变量

**⚠️ 重要：在 Zeabur 控制台设置环境变量（不是在代码中）**

在 Zeabur 项目设置 → 环境变量中添加：

```env
# 数据库连接（根据你的选择）
DATABASE_URL=file:./dev.db
# 或使用 PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database

# Auth.js 配置（必须设置）
AUTH_SECRET=你生成的32字符随机字符串
NEXTAUTH_URL=https://meetus.zeabur.app
AUTH_TRUST_HOST=true
```

**生成 AUTH_SECRET：**
```bash
openssl rand -base64 32
```
**示例輸出：** `r8K3x9mP2nQ5vW7yA1bC4dE6fG8hI0jK1lM3nO5pQ7r=`

**⚠️ 重要提醒：**
- `AUTH_SECRET` 生成後必須保持不變
- 如果更改 `AUTH_SECRET`，所有用戶的 session 都會失效
- 部署前確保已在 Zeabur 上設置所有環境變數

### 3. 部署到 Zeabur

1. 将代码推送到 GitHub/GitLab
2. 在 Zeabur 中连接你的仓库
3. Zeabur 会自动检测 Dockerfile 并构建
4. 等待部署完成

**注意：** Dockerfile 中已配置在启动时自动运行 `prisma migrate deploy`

### 4. 验证部署

1. 访问 `https://your-domain.zeabur.app`
2. 尝试注册新用户
3. 检查 Zeabur 日志确认没有错误

## 快速檢查清單

在部署前，確認以下事項：

### Zeabur 環境變數（必須設置）
```bash
✓ DATABASE_URL         # 數據庫連接字符串
✓ AUTH_SECRET          # 32+ 字符的隨機字符串
✓ NEXTAUTH_URL         # 你的完整域名 URL
✓ AUTH_TRUST_HOST=true # 信任主機
```

### 驗證環境變數是否正確
在 Zeabur 控制台運行：
```bash
echo $AUTH_SECRET
echo $NEXTAUTH_URL
echo $DATABASE_URL
```

確保輸出不為空。

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

## 故障排除

### 错误：`JWTSessionError: no matching decryption secret`

**原因：** AUTH_SECRET 環境變數未設置或不一致

**解決方案：**
1. **確認在 Zeabur 上設置了 `AUTH_SECRET` 環境變數**
   - 進入 Zeabur 專案 → 設置 → 環境變數
   - 確保 `AUTH_SECRET` 存在且不為空
   
2. **生成並設置新的 AUTH_SECRET：**
   ```bash
   openssl rand -base64 32
   ```
   
3. **重新部署應用**
   
4. **清除瀏覽器 Cookies：**
   - 開啟瀏覽器開發者工具（F12）
   - Application → Cookies → 刪除 `authjs.session-token` 相關的 cookie
   - 重新整理頁面

**⚠️ 注意：** 更改 AUTH_SECRET 會使所有現有用戶的 session 失效，需要重新登入

### 错误：`UntrustedHost: Host must be trusted`

**解决方案：**
- 确保设置了 `AUTH_TRUST_HOST=true` 环境变量
- 确保 `NEXTAUTH_URL` 与你的域名匹配

### 错误：`The table main.User does not exist`

**原因：** 数据库迁移未运行

**解决方案：**
1. 检查 Zeabur 日志，确认迁移是否成功运行
2. 如果使用 PostgreSQL，确保已重新生成迁移文件
3. 手动在 Zeabur 控制台运行：
   ```bash
   npx prisma migrate deploy
   ```

### 错误：`Cannot find module 'effect'` 或其他模块错误

**解决方案：**
1. 确保 Dockerfile 正确复制了 `node_modules`
2. 重新构建镜像：
   ```bash
   docker build -t meet --no-cache .
   ```
3. 在 Zeabur 上触发重新部署

### 数据库连接问题

**检查清单：**
- [ ] `DATABASE_URL` 格式正确
- [ ] 数据库服务正在运行
- [ ] 网络连接正常
- [ ] 使用 PostgreSQL 时，确保已更新 schema.prisma
