Academic Scheduler MVP - 絕對最小化規格書

1. 核心技術棧 (Tech Stack)

Framework: Next.js 14 (App Router)

Language: TypeScript

Database: SQLite (單一本地檔案 dev.db，確保 One Dockerfile 零相依)

ORM: Prisma

Authentication: NextAuth.js v5 (僅實作 Credentials Provider，無外部 OAuth)

UI/Styling: Tailwind CSS + shadcn/ui (僅取用 Button, Form, Select, Table, Dialog, Card)

Deployment: 單一 Dockerfile (包含 npm run build 與 SQLite 環境)

2. 資料庫綱要 (Prisma Schema)

原則：導入 DoD (預期產出) 欄位，並擴充 Availability 支援「每週固定」或「特定日期單次開放」。新增 category 分類標籤以利共學檢索。
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // "file:./dev.db"
}

enum Role {
  TEACHER
  TA
  STUDENT
}

enum BookingStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED 
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    
  name          String
  role          Role      @default(STUDENT)
  
  teacherTAs    TeacherTA[] @relation("Teacher")
  taTeachers    TeacherTA[] @relation("TA")
  availabilities Availability[]
  bookingsHost  Booking[]   @relation("Host")
  bookingsGuest Booking[]   @relation("Guest")
}

model TeacherTA {
  teacherId String
  taId      String
  teacher   User   @relation("Teacher", fields: [teacherId], references: [id])
  ta        User   @relation("TA", fields: [taId], references: [id])
  @@id([teacherId, taId])
}

model Availability {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  
  // 彈性時間設定
  isRecurring  Boolean  @default(true) // true=每週固定, false=單次開放
  dayOfWeek    Int?     // 0-6，isRecurring=true 時必填
  specificDate String?  // "YYYY-MM-DD"，isRecurring=false 時必填
  
  startTime    String   // "HH:mm"
  endTime      String   // "HH:mm"
  capacity     Int      @default(1) 
}

model Booking {
  id              String        @id @default(cuid())
  hostId          String
  guestId         String
  host            User          @relation("Host", fields: [hostId], references: [id])
  guest           User          @relation("Guest", fields: [guestId], references: [id])
  
  date            String        // "YYYY-MM-DD"
  startTime       String        // "HH:mm"
  endTime         String        // "HH:mm"
  status          BookingStatus @default(PENDING)
  
  // 預約詳情 (DoD 強制化與標籤化)
  category        String        // 會議分類 (如: Code Review, 論文進度, 職涯請益)
  topic           String        // 會議主題
  currentProgress String        // 目前進度/卡關點
  expectedOutcome String        // 本次會議的預期產出 (DoD)
  attachmentUrl   String?       // 參考附件
  
  rejectionReason String?       
  createdAt       DateTime      @default(now())
  feedback        Feedback?
}

model Feedback {
  id          String   @id @default(cuid())
  bookingId   String   @unique
  booking     Booking  @relation(fields: [bookingId], references: [id])
  
  summary     String   // 總結
  actionItems String   // 預期行動
  goals       String   // 目標
  
  createdAt   DateTime @default(now())
}

```
3. 核心邏輯定義 (Server Actions)

- getAvailableSlots(hostId: string, dateString: string)

Logic: 
1. 取得 Availability：聯集符合 dayOfWeek (且 isRecurring=true) 與 specificDate = dateString (且 isRecurring=false) 的設定。
2. 以 30 分鐘切割，扣除已滿載 (>= capacity) 的 Booking 時段後釋出。

- checkBookingEligibility(guestId: string)

Logic: 檢查是否有狀態為 COMPLETED 且 Feedback 為空的紀錄。若有，阻擋預約。

- createBooking(data)

Logic: 驗證 category 與 DoD (currentProgress, expectedOutcome) 必填。驗證容量與 Eligibility。寫入 DB (PENDING)。

- resolveBooking(bookingId, status, reviewerId, rejectionReason?)

Logic: 更新審核狀態。拒絕時強制作答 rejectionReason。

- submitFeedback(bookingId, guestId, feedbackData)

Logic: 驗證身分，寫入反饋。

4. UI 路由與介面 (App Router)

app/
├── login/                     
├── shared-calendar/           # 提供分類 Filter (如: Code Review, 論文進度) 篩選共學時段
├── dashboard/
│   ├── layout.tsx             
│   ├── schedule/              # 提供 [每週固定 / 單次開放] 切換的設定表單
│   ├── requests/              
│   ├── students/              
│   ├── feedbacks/             
│   └── bookings/              
└── book/[hostId]/             # 預約表單強制選擇 [分類] 並填寫 [目前進度] 與 [預期產出]


5. 執行項目與 DoD (Action Items & Definition of Done)

[ ] Action 1: 專案基建 (Setup)

DoD: Next.js + shadcn/ui 專案可透過 npm run dev 正常啟動；SQLite dev.db 建置成功，且能以 npx prisma studio 存取空表。

[ ] Action 2: 身分認證與資料播種 (Auth & Seed)

DoD: 成功執行 seed.ts 建立基礎測試資料（包含不同 category 的預約）；能透過測試帳密登入系統；登入後能依據 Role 導向對應的預設儀表板。

[ ] Action 3: 共用行事曆視圖 (Shared Calendar)

DoD: 進入 /shared-calendar 頁面能正確渲染當週與下週的網格視圖；視圖能精準呈現時段的開放狀態、容量上限、已預約學生與分類標籤；具備分類篩選器 (Filter) 能精準顯示特定類別的時段。

[ ] Action 4: 核心排程邏輯 (Core Scheduling)

DoD: Server Action 能精確計算 30 分鐘切分時段；送出預約時若該時段已達 capacity 上限會報錯；表單未填寫 category, currentProgress 或 expectedOutcome 時會阻擋寫入。

[ ] Action 5: 學生端流程 (Student Flow)

DoD: 學生能成功發起預約（包含下拉選擇 category）；在 /dashboard/bookings 中可見預約狀態與退回理由；若有未填寫 Feedback 的 COMPLETED 會議，系統會強制攔截新預約，並引導至反饋表單。

[ ] Action 6: 管理端流程 (Admin Flow)

DoD: 老師/助教能成功新增/刪除開放時段；能於列表一鍵 Approve/Reject 請求；能正常檢視學生數據統計與反饋分類列表。

[ ] Action 7: 容器化部署 (Dockerization)

DoD: 執行 docker build 及 docker run 後，能透過瀏覽器 localhost:3000 完整操作上述所有功能，且資料庫持久化寫入容器內 SQLite，無外部相依。
