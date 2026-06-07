# 學術排程系統 (Academic Scheduler MVP)

一個專為學術環境設計的極簡排程與預約系統。旨在讓教師能高效管理開放時段，並讓學生能直覺地發起面談、追蹤進度與完成會後反饋。

## 功能特色

### 教師端
- **時段管理**：建立週期性或單次開放時段，設定名額上限
- **預約審核**：審核學生的預約申請，可核准或拒絕並說明原因
- **會議管理**：標記會議完成狀態，查看學生反饋

### 學生端
- **行事曆檢視**：查看教師的開放時段與即時名額
- **發起預約**：選擇時段並填寫會面目的與期望
- **預約追蹤**：查看所有預約的狀態（待審核、已核准、已完成等）
- **反饋填寫**：為完成的會議填寫反饋以解除預約限制

### 共用功能
- **全公開行事曆**：所有使用者可查看教師的開放時段與名額狀態
- **即時名額顯示**：動態計算剩餘名額與待審核人數

## 技術棧

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: SQLite + Prisma ORM
- **Authentication**: NextAuth.js v5 (Credentials Provider)
- **Styling**: Tailwind CSS + Radix UI

## 安裝與執行

### 1. 安裝依賴

```bash
npm install
```

### 2. 初始化資料庫

```bash
npx prisma db push
npx prisma generate
```

### 3. 建立測試數據（選用）

```bash
npm run seed
```

這會建立兩個測試帳號：
- **教師**: teacher@example.com / password123
- **學生**: student@example.com / password123

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 專案結構

```
meet/
├── app/                          # Next.js App Router 頁面
│   ├── login/                   # 登入頁面
│   ├── register/                # 註冊頁面
│   ├── shared-calendar/         # 全公開行事曆
│   └── dashboard/               # Dashboard 路由
│       ├── schedule/           # 教師時段管理
│       ├── requests/           # 教師審核預約
│       ├── bookings/           # 預約紀錄（教師/學生共用）
│       └── feedbacks/          # 學生填寫反饋
├── components/                  # React 元件
│   ├── ui/                     # 基礎 UI 元件 (shadcn/ui)
│   └── modals/                 # 對話框元件
├── lib/                        # 工具函式與邏輯
│   ├── actions/                # Server Actions
│   │   ├── auth.ts            # 認證相關
│   │   ├── user.ts            # 使用者相關
│   │   ├── scheduling.ts      # 時段管理
│   │   ├── booking.ts         # 預約管理
│   │   └── feedback.ts        # 反饋管理
│   ├── constants.ts            # 類型常數定義
│   └── utils.ts                # 工具函式
├── prisma/                     # Prisma 配置
│   ├── schema.prisma          # 資料庫 Schema
│   └── seed.ts                # 種子數據腳本
└── .spec/                      # 專案規格書
    ├── db-schema.md           # 資料層規格
    ├── api-complete-list.md   # 邏輯層規格
    └── page-execution-list.md # 表現層規格
```

## 開發守則

本專案由三份核心規格書驅動，對應 MVC 架構：

1. **資料層** (`.spec/db-schema.md`)：定義 Prisma Schema 與型別安全策略
2. **邏輯層** (`.spec/api-complete-list.md`)：定義 Server Actions 與業務邏輯
3. **表現層** (`.spec/page-execution-list.md`)：定義頁面路由與互動邏輯

進行開發時，請務必參考這些規格書以確保一致性。

## 資料庫 Schema

### User (使用者)
- 支援教師 (TEACHER) 與學生 (STUDENT) 兩種角色
- 使用 bcrypt 進行密碼雜湊

### Availability (開放時段)
- 支援週期性（每週）和單次時段
- 可設定名額上限

### Booking (預約)
- 狀態流轉：PENDING → APPROVED/REJECTED → COMPLETED/CANCELLED
- 記錄詳細的預約內容（類別、主題、進度、期望結果）

### Feedback (反饋)
- 學生為完成的會議填寫
- 包含會議摘要、行動事項、後續目標

## 防呆機制

1. **學生預約限制**：若有已完成但未填寫反饋的預約，將無法發起新預約
2. **時段刪除保護**：有已核准預約的時段無法刪除
3. **名額控制**：核准預約前會檢查剩餘名額

## 授權

MIT License

## 作者

Theta Wang
