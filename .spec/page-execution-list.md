# UI 路由與頁面規格書 (Page Routing & Execution Spec - V2)

**架構規範**：本專案採用 Next.js 14 App Router。頁面元件 (Page Components) 負責讀取 Server Actions 進行 SSR/RSC 渲染，並將互動委託給 Client Components (表單、Modal、按鈕)。

---

## 1. 授權與公開路由 (Auth & Public Routes)

| 路由路徑 | 頁面職責 | 支援行動 (Actions & Interactions) |
| :--- | :--- | :--- |
| `/` | **Landing Page** | 系統介紹。根據登入狀態自動重導向 (已登入 -> `/dashboard`，未登入 -> `/login`)。 |
| `/login` | **登入頁** | 1. 提交帳密表單 (Client 驗證)。<br>2. 呼叫 `loginUser` 進行驗證並寫入 Session。 |
| `/register` | **註冊頁** | 1. 提交註冊表單 (切換 TEACHER/STUDENT 角色)。<br>2. 呼叫 `registerUser`。 |

---

## 2. 團隊共用檢視 (Shared Views)

全團隊資訊公開流動的核心樞紐，所有登入使用者皆可存取。

| 路由路徑 | 頁面職責 | 支援行動 (Actions & Interactions) |
| :--- | :--- | :--- |
| `/shared-calendar` | **全公開行事曆** | 1. **URL 同步篩選**：切換日期區間與特定 Teacher。<br>2. **動態渲染**：呼叫 `getAvailabilities`，渲染🟩剩餘名額、🟦本人預約、🟥他人明細。<br>3. **發起預約 (Student)**：點擊時段呼叫 `checkBookingEligibility`，若通過則開啟 `CreateBookingModal`，送出呼叫 `createBooking`。<br>4. **查看明細 (All)**：點擊已預約時段開啟 `BookingDetailModal` 查看他人/自身申請進度。<br>5. 呼叫 `getTeachers` 以渲染篩選下拉選單 |

---

## 3. 老師專屬後台 (Teacher Dashboard)

受 `middleware.ts` 與 Layout 保護，僅限 `Role === 'TEACHER'` 存取。

| 路由路徑 | 頁面職責 | 支援行動 (Actions & Interactions) |
| :--- | :--- | :--- |
| `/dashboard/schedule` | **開放時間管理** | 1. **檢視**：呼叫 `getHostSchedule` 列表呈現已開放的時段。<br>2. **新增**：開啟表單設定週期/單次時段與名額，呼叫 `createAvailability`。<br>3. **刪除**：點擊刪除，呼叫 `deleteAvailability` (若觸發強防呆則顯示 Error Toast)。 |
| `/dashboard/requests` | **預約審核中心** | 1. **檢視**：呼叫 `getHostPendingRequests` 呈現待處理清單。<br>2. **審核**：點擊 Approve/Reject，填寫退回理由 (選填)，呼叫 `resolveBooking`。 |
| `/dashboard/bookings` | **會議紀錄與管理** | 1. **檢視**：呼叫 `getHostBookings` 呈現已核准/已完成清單。<br>2. **狀態推進**：面談結束後點擊「標記完成」，呼叫 `completeBooking`。<br>3. **特例取消**：臨時無法出席，呼叫 `resolveBooking(status: CANCELLED)`。<br>4. **查看反饋**：呼叫 `getFeedbackByBookingId` 檢視學生檢討。 |

---

## 4. 學生專屬後台 (Student Dashboard)

受 `middleware.ts` 與 Layout 保護，僅限 `Role === 'STUDENT'` 存取。

| 路由路徑 | 頁面職責 | 支援行動 (Actions & Interactions) |
| :--- | :--- | :--- |
| `/dashboard/bookings` | **個人申請進度追蹤** | 1. **檢視**：呼叫 `getStudentBookings` 列表呈現個人歷史與未來預約。<br>2. **主動取消**：針對 PENDING/APPROVED 狀態，呼叫 `cancelBooking` 撤回。<br>3. **查看反饋**：呼叫 `getFeedbackByBookingId` 檢視歷史紀錄。 |
| `/dashboard/feedbacks` | **反饋待辦事項** | 1. **檢視待辦**：呼叫 `getPendingFeedbacks` 渲染已被老師標記 COMPLETED 但尚未填寫反饋的會議。<br>2. **提交反饋**：開啟表單填寫 Summary/Action Items/Goals，呼叫 `submitFeedback` 解除預約封鎖限制。 |

---

## 5. 核心共用元件 (Shared UI Components)

這些元件跨頁面使用，需獨立於 `components/modals/` 封裝：

* **`CreateBookingModal`**：學生發起預約的表單，包含 Category 下拉選單與 DoD 必填欄位。
* **`BookingDetailModal`**：唯讀視窗，展示預約細節 (Topic, Progress, DoD)、目前狀態，以及 (若已完成) 顯示 Feedback 內容。
* **`FeedbackFormModal`**：學生填寫反饋的專用表單。
