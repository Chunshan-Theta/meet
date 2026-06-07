
# Academic Scheduler MVP

一個專為學術環境設計的極簡排程與預約系統。旨在讓教師能高效管理開放時段，並讓學生能直覺地發起面談、追蹤進度與完成會後反饋。

## 技術棧 (Tech Stack)

* **Framework**: Next.js 14 (App Router) + TypeScript
* **Database**: SQLite (單一檔案 `dev.db`) + Prisma ORM
* **Authentication**: NextAuth.js v5 (Auth.js) - 憑證登入 (Credentials Provider)
* **Styling & UI**: Tailwind CSS + shadcn/ui

---

## 系統規格書定位 (Specifications)

本專案由三份核心規格書驅動，分別對應 MVC 架構中的 Model、Controller (Server Actions) 與 View，彼此緊密耦合：

### 1. 資料層：`.spec/db-schema.md`
**定位：系統的物理基底與防腐邊界。**
* 負責定義 Prisma Schema 的實體欄位 (Physical Fields) 與虛擬關聯 (Virtual Relations)。
* 規範 SQLite 限制下的型別安全策略，強制依賴 `lib/constants.ts` 來取代資料庫 Enum，確保資料一致性。

### 2. 邏輯層：`.spec/api-complete-list.md`
**定位：領域邏輯 (Domain Logic) 與狀態機轉移。**
* 採用 Domain-Driven Design (DDD) 概念，將所有的 Server Actions 封裝於 `lib/actions/`。
* 明確規範排程運算（時段展開與名額精算）、預約審核狀態流轉，以及權限控管機制。

### 3. 表現層：`.spec/page-execution-list.md`
**定位：使用者介面路由與互動綁定。**
* 定義前端頁面職責、權限保護邊界 (Public / Teacher / Student)。
* 詳述 Client Components (按鈕、表單、Modals) 如何與 Server Actions 進行互動與資料交握。

---

## 執行項目 (Action Items)

若要啟動或重置本專案，請依序執行以下項目：

1. **環境配置**：安裝依賴並建立 `.env` 檔案。
2. **資料庫初始化**：
   ```bash
   npx prisma db push
   npx prisma generate

```

3. **防腐層建置**：依照 `db-schema.md` 建立 `lib/constants.ts`。
4. **開發啟動**：
```bash
npm run dev

```



## 開發協作守則 (For AI Assistants / Copilot)

進行程式碼生成時，**必須**將上述三份 `.spec` 檔案納入上下文 (Context)，並嚴格遵循規格書內的型別定義、Server Actions 介面與防呆邏輯進行實作，禁止擅自發明未定義的欄位或路由。
