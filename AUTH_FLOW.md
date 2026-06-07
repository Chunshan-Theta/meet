# AUTH_SECRET 使用流程說明

## 📍 AUTH_SECRET 在哪裡被使用？

`AUTH_SECRET` 是 **Next.js Auth.js (NextAuth v5)** 框架**自動讀取**的環境變數，**不需要在代碼中明確引用**。

## 🔄 完整流程

### 1️⃣ 環境變數設置

**本地開發：** `.env` 文件
```env
AUTH_SECRET="your-secret-key-change-this-in-production"
```

**生產環境（Zeabur）：** 在 Zeabur 控制台設置
```env
AUTH_SECRET=r8K3x9mP2nQ5vW7yA1bC4dE6fG8hI0jK1lM3nO5pQ7r=
```

### 2️⃣ Auth.js 框架自動讀取

**文件：** `auth.ts`
```typescript
import NextAuth from 'next-auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [...],
});
```

**⚠️ 注意：** 
- NextAuth 會**自動**從 `process.env.AUTH_SECRET` 讀取密鑰
- **不需要**手動傳遞 `secret` 參數
- 這是 Auth.js v5 的內建行為

### 3️⃣ 中間件使用 Auth

**文件：** `middleware.ts`
```typescript
import { auth } from '@/auth';
export { auth as middleware } from '@/auth';
```

這個 middleware 會：
- 在每個請求中驗證用戶的 session
- 使用 `AUTH_SECRET` 解密 JWT token
- 保護需要登入的路由

### 4️⃣ Session 管理流程

```
用戶登入
  ↓
Next.js Auth.js 使用 AUTH_SECRET 加密用戶資料
  ↓
生成 JWT token 存入 cookie (authjs.session-token)
  ↓
用戶訪問頁面
  ↓
middleware.ts 攔截請求
  ↓
使用 AUTH_SECRET 解密 JWT token
  ↓
驗證用戶身份 → 允許/拒絕訪問
```

## 🔍 在代碼中的使用位置

### 直接使用 auth 的地方：

1. **`middleware.ts`** - 保護路由
   ```typescript
   export { auth as middleware } from '@/auth';
   ```

2. **`app/layout.tsx`** - 獲取用戶資訊
   ```typescript
   import { auth } from '@/auth';
   
   export default async function RootLayout() {
     const session = await auth();
     // session 包含用戶資訊
   }
   ```

3. **Server Actions** - 驗證用戶
   ```typescript
   import { auth } from '@/auth';
   
   export async function someAction() {
     const session = await auth();
     if (!session) throw new Error('Unauthorized');
   }
   ```

## ❓ 為什麼會有 JWT 解密錯誤？

### 錯誤訊息：
```
JWTSessionError: no matching decryption secret
```

### 原因：
1. **環境變數未設置** - Zeabur 上沒有設置 `AUTH_SECRET`
2. **密鑰不一致** - 登入時用的 `AUTH_SECRET` 與現在不同
3. **環境變數未生效** - 部署後沒有重啟服務

### 解決方法：

```bash
# 1. 生成新的密鑰
openssl rand -base64 32

# 2. 在 Zeabur 設置環境變數
AUTH_SECRET=<生成的密鑰>

# 3. 重新部署

# 4. 清除瀏覽器 cookie
# F12 → Application → Cookies → 刪除 authjs.session-token
```

## 🔐 安全性最佳實踐

### ✅ 正確做法：
- 在 Zeabur/Vercel 等平台的環境變數設置中配置
- 使用 `openssl rand -base64 32` 生成強隨機密鑰
- 每個環境（開發、生產）使用不同的密鑰
- **絕不要**把 AUTH_SECRET 提交到 Git

### ❌ 錯誤做法：
- 使用簡單的字符串如 "your-secret-key"
- 在代碼中硬編碼密鑰
- 將 `.env` 文件提交到 Git
- 在多個環境共用同一個密鑰

## 📚 相關文件

- **官方文檔：** https://authjs.dev/reference/core#authconfig
- **環境變數：** https://authjs.dev/guides/environment-variables
- **JWT 配置：** https://authjs.dev/guides/jwt

## 🧪 驗證 AUTH_SECRET 是否生效

### 在 Docker 容器中：
```bash
docker exec -it <container-id> sh
echo $AUTH_SECRET
```

### 在 Zeabur 控制台：
```bash
echo $AUTH_SECRET
# 應該輸出你設置的密鑰
```

如果輸出為空，表示環境變數未設置。
