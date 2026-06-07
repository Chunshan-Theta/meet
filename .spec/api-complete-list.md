
# 完整 API & Server Actions 規格書 (V2.3 最終開發版)

**架構規範**：本專案採用 Next.js 14 App Router。以下「API」皆為封裝於 `lib/actions/` 中的 Server Actions。所有 Action 必須在內部呼叫 `auth()` 取得 Session，並嚴格驗證執行者的 `Role`。

---

## 1. 共用資料型別定義 (Shared Types)



```typescript
type Result<T> = T & { error?: string };

type AvailabilityWithCapacity = {
  id: string;
  date: string;              // 展開後的具體日期 (YYYY-MM-DD)
  startTime: string;         // HH:mm
  endTime: string;           // HH:mm
  capacity: number;          // 總名額上限
  remainingCapacity: number; // 剩餘名額 = capacity - (Bookings WHERE status == 'APPROVED')
  pendingCount: number;      // 待審核人數 (僅供 UI 提示，不扣除名額)
};

type PublicBookingInfo = {
  id: string;
  guestName: string;         // 關聯 User 取得的名字
  status: string;            // "PENDING" | "APPROVED"
  category: string;
  topic: string;
  currentProgress: string;   // 預約內容
  expectedOutcome: string;   // 預約內容
};

```

---

## 2. 認證與用戶服務 (`lib/actions/auth.ts`, `lib/actions/user.ts`)

| Action 名稱 | 執行權限 | 核心邏輯與說明 | 輸入 (Input) | 輸出 (Output) |
| --- | --- | --- | --- | --- |
| `registerUser` | 訪客 | 註冊新帳號，密碼強制使用 `bcryptjs` 進行 Hash 處理。寫入資料庫後可自動登入或導向登入頁。 | `{ email, password, name, role: "TEACHER" \| "STUDENT" }` | `Result<{ success: boolean }>` |
| `loginUser` | 訪客 | 接收表單憑證，呼叫 NextAuth 的 `signIn("credentials")` 進行驗證。失敗回傳錯誤，成功則由系統重導向至 Dashboard。 | `{ email, password }` | `Result<{ success: boolean, error?: string }>` |
| `logoutUser` | All | 呼叫 NextAuth 的 `signOut()` 清除 Session，並強制重導向至首頁 `/` 或登入頁 `/login`。 | - | `void` (執行後重導向) |
| `getTeachers` | All | 撈取系統中所有 `Role === 'TEACHER'` 的使用者列表，供預約選單使用。 | - | `Array<{ id: string, name: string }>` |

---

## 3. 排程服務 (`lib/actions/scheduling.ts`)

| Action 名稱 | 執行權限 | 核心邏輯與說明 | 輸入 (Input) | 輸出 (Output) |
| --- | --- | --- | --- | --- |
| `getAvailabilities` | All | 撈取指定區間內的開放時段與動態名額。需關聯撈取該時段下狀態為 PENDING 與 APPROVED 的 bookings (包含 Guest 姓名與預約內容)，以支援全公開行事曆的明細檢視。 | `hostId: string`, `startDate: string`, `endDate: string` | `Array<AvailabilityWithCapacity>` |
| `createAvailability` | TEACHER | 新增單次或週期性開放時段。 | `{ isRecurring: boolean, dayOfWeek?: number, specificDate?: string, startTime: string, endTime: string, capacity: number }` | `Result<{ success: boolean }>` |
| `deleteAvailability` | TEACHER | 刪除時段。**強防呆**：若該時段關聯任何 `APPROVED` 的預約，拋出錯誤阻擋刪除。 | `availabilityId: string` | `Result<{ success: boolean }>` |
| `getHostSchedule` | TEACHER | (後台用) 撈取老師建立的原始 Availability 列表，以供管理。 | `hostId: string` | `Array<Availability>` |

---

## 4. 預約服務 (`lib/actions/booking.ts`)

| Action 名稱 | 執行權限 | 核心邏輯與說明 | 輸入 (Input) | 輸出 (Output) |
| --- | --- | --- | --- | --- |
| `checkBookingEligibility` | STUDENT | (攔截器) 檢查是否有 `status === 'COMPLETED'` 但無 Feedback 的紀錄，若有則阻擋。 | `guestId: string` | `{ isEligible: boolean, blockReason?: string }` |
| `createBooking` | STUDENT | 發出申請(狀態 `PENDING`)。必須帶入展開後的具體日期以對應週期性時段。寫入前需呼叫 Eligibility 檢查。寫入 DB 時，需查詢並直接繼承目標 Availability 的 startTime 與 endTime | `{ hostId: string, availabilityId: string, date: string, category: string, topic: string, currentProgress: string, expectedOutcome: string }` | `Result<{ success: boolean, bookingId?: string }>` |
| `cancelBooking` | STUDENT | 學生主動取消申請，狀態轉為 `CANCELLED`。 | `bookingId: string` | `Result<{ success: boolean }>` |
| `resolveBooking` | TEACHER | 審核申請 (轉為 `APPROVED` / `REJECTED`)，或臨時取消已排定面談 (轉為 `CANCELLED`)。核准前需檢查 `remainingCapacity > 0`。 | `{ bookingId: string, status: "APPROVED"|"REJECTED"|"CANCELLED", rejectionReason?: string }` | `Result<{ success: boolean }>` |
| `completeBooking` | TEACHER | 面談結束後手動標記完成，狀態轉為 `COMPLETED`。 | `bookingId: string` | `Result<{ success: boolean }>` |
| `getStudentBookings` | STUDENT | (後台用) 撈取學生的個人預約紀錄列表。 | `guestId: string` | `Array<Booking>` |
| `getHostPendingRequests` | TEACHER | (後台用) 撈取老師所有狀態為 `PENDING` 的待審核申請。 | `hostId: string` | `Array<Booking>` |
| `getHostBookings` | TEACHER | (後台用) 撈取老師所有 `APPROVED`, `COMPLETED`, `CANCELLED` 的歷史/確認清單。 | `hostId: string` | `Array<Booking>` |

---

## 5. 反饋服務 (`lib/actions/feedback.ts`)

| Action 名稱 | 執行權限 | 核心邏輯與說明 | 輸入 (Input) | 輸出 (Output) |
| --- | --- | --- | --- | --- |
| `getPendingFeedbacks` | STUDENT | (後台用) 撈取狀態為 `COMPLETED` 但尚未填寫 feedback 的 Booking。 | `guestId: string` | `Array<Booking>` |
| `submitFeedback` | STUDENT | 寫入 Feedback 實體。 | `{ bookingId: string, summary: string, actionItems: string, goals: string }` | `Result<{ success: boolean }>` |
| `getFeedbackByBookingId` | All | 檢視特定面談的反饋。需驗證操作者身分為該面談的 Host 或 Guest。 | `bookingId: string` | `Result<{ success: boolean, feedback?: Feedback }>` |
