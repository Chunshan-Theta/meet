# Shared Calendar 頁面實作規格

## 目標與範圍
* **目標檔案**：`app/shared-calendar/page.tsx`
* **核心功能**：團隊內部全公開的共用行事曆，支援動態時間跨度（雙週至單月），提供預約狀態與對象的即時篩選。
* **技術限制**：使用純 React + Tailwind CSS 實作 Grid，不依賴第三方行事曆套件，確保最高客製化彈性。

## 介面與互動設計

### 1. 視圖佈局 (Grid Layout)
* **預設視圖**：2-Week Grid View (14天)。
* **動態擴充**：透過 Filter 切換至 Month View。
* **版面配置**：
    * Top Bar：篩選器 (Filter Bar) 與時間切換控制項。
    * Main：基於 `grid-cols-7` 的 Tailwind CSS 網格系統。

### 2. 時段區塊 (Slot Blocks) 狀態與行為
*註：基於內部資訊全公開原則，所有狀態皆無隱私屏蔽。*

| 狀態 | 視覺定義 (Tailwind) | 互動與行為 |
| :--- | :--- | :--- |
| **可預約** (Available) | `bg-emerald-100 border-emerald-300 text-emerald-800` | 點擊開啟 `CreateBookingModal`，自動帶入該時段與對象。 |
| **本人預約** (Booked by Me) | `bg-blue-100 border-blue-300 text-blue-800` | 點擊開啟 `BookingDetailModal`，顯示預約詳情與管理選項。 |
| **他人預約/不可用** (Booked by Others) | `bg-red-100 border-red-300 text-red-800` | 點擊開啟 `BookingDetailModal`，完整顯示他人預約資訊。 |

### 3. 篩選器 (Filter Bar) 與狀態同步
* **URL 同步**：所有篩選條件必須即時更新至 URL Search Params (Optimistic UI)，支援連結分享與重載。
* **篩選維度**：
    1.  **時間跨度 (View Range)**：Toggle 或 Select (2 Weeks / 1 Month)。
    2.  **預約對象 (Host)**：下拉選單 (特定 Host / All)。
    3.  **狀態過濾 (Status)**：Checkbox (可選隱藏「不可預約」時段，降低畫面雜訊)。

## 執行項目 (Implementation Guidelines)

1.  **URL State & 框架建置**：
    * 在 `page.tsx` 建立 Client Component (`"use client"`).
    * 使用 Next.js `useSearchParams`, `useRouter`, `usePathname` 管理 Filter 狀態，確保與 URL 同步。
2.  **動態網格生成器 (Grid Generator)**：
    * 實作 `generateCalendarDays(startDate, viewType)` 輔助函式，根據 viewType 產出 14 或 35/42 個日期物件陣列。
    * 使用 `<div className="grid grid-cols-7 gap-px bg-muted">` 作為外框。
3.  **Slot 元件封裝**：
    * 建立 `<CalendarSlot slot={slotData} onClick={handleSlotClick} />`。
    * 使用 `clsx` 或 `tailwind-merge` 根據 `slotData.status` 動態套用上述定義的顏色。
4.  **整合 Modals**：
    * 引入 (或預留) `<CreateBookingModal />` 與 `<BookingDetailModal />`。
    * 建立 Modal 狀態管理 `const [activeModal, setActiveModal] = useState<'create' | 'detail' | null>(null)`。

## 下一步動作

* **Task 1**: 實作 URL Search Params hook 與 Filter Bar UI 元件。
* **Task 2**: 開發 `generateCalendarDays` 邏輯與基礎 Tailwind `grid-cols-7` 版面。
* **Task 3**: 實作 Slot 元件、套入 Mock Data，並綁定對應的 Modal 開啟事件。