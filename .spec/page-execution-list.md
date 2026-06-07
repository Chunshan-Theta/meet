# 頁面執行清單

這份文件只整理頁面層級的實作順序，不新增多餘路由；原則是先補齊既有頁面，再把流程串完整。

## 目前頁面地圖

- `/login`：登入入口
- `/shared-calendar`：共用行事曆與分類篩選入口
- `/book/[hostId]`：學生預約頁
- `/dashboard`：登入後導頁
- `/dashboard/schedule`：開放時段管理
- `/dashboard/requests`：預約審核
- `/dashboard/students`：學生統計
- `/dashboard/feedbacks`：反饋提交與反饋分類
- `/dashboard/bookings`：學生預約列表與狀態

## 目前缺口判定
### 缺少模組
- header / footer：目前頁面都還沒有統一的 header 與 footer，後續可以先做簡單版本來協助導覽。

### 已有頁面，但需要補強

- `/shared-calendar`：目前是表格型呈現，尚未完全符合「當週 + 下週網格視圖」的規格。
- `/book/[hostId]`：已有預約表單，但還需要把時段選擇、空狀態、錯誤提示與提交流程整理得更完整。
- `/dashboard/schedule`：已有新增/刪除開放時段，但需要更清楚地支援「每週固定 / 單次開放」的切換與驗證。
- `/dashboard/requests`：已有 Approve / Reject，但仍需要補強空狀態與拒絕理由的操作體驗。
- `/dashboard/bookings`：已有預約列表與未完成反饋提示，但需要把導向反饋表單的流程再收斂。
- `/dashboard/feedbacks`：目前同時承載學生端提交與管理端分類統計，功能可用，但頁面責任混在一起，後續要決定是否拆分或強化區塊化呈現。

### 尚未需要新增的頁面

- 目前規格中的主要操作頁都已存在，不先新增其他 route。
- 優先做的是內容補強與流程串接，而不是擴張頁面數量。

## 執行順序
### 0. header / footer 基礎架構
目標：建立統一的頁面架構，方便後續導覽與功能擴充。
完成標準：
- 所有頁面都包含統一的 header 與 footer。
- header 包含導覽連結與使用者資訊。
- footer 包含版權資訊與聯絡方式。

### 1. 共用行事曆先完成

目標：讓使用者進站就能看懂可預約時段。

完成標準：

- 顯示當週與下週的網格視圖。
- 顯示開放狀態、容量、已預約學生、分類標籤。
- 可用分類 Filter 篩選共學時段。

### 2. 預約頁補齊閉環

目標：學生可以完成一次完整預約。

完成標準：

- 時段選擇清楚可用。
- 必填 category、currentProgress、expectedOutcome。
- 若對應時段已滿或缺少資格，能正確阻擋並顯示原因。

### 3. 學生端預約列表與反饋入口

目標：學生能看懂自己的狀態，並被正確導向反饋。

完成標準：

- 列表顯示狀態與退回理由。
- 若有未填反饋的 COMPLETED 會議，畫面需明確導向反饋表單。
- 已完成反饋的紀錄能正常查閱。

### 4. 管理端審核與排程

目標：老師 / 助教能管理開放時段與審核請求。

完成標準：

- 可新增 / 刪除開放時段。
- 可一鍵 Approve / Reject。
- Reject 時必填 rejectionReason。
- 排程表單能正確表達 recurring 與 specificDate。

### 5. 統計與反饋分類整理

目標：管理端能看懂學生與反饋概況。

完成標準：

- 學生統計可反映總預約、完成數、反饋數。
- 反饋分類列表可用於快速檢視類別分布。
- 若後續要拆頁，需先維持既有資料來源一致。

## 頁面級 DoD

- `login`：能登入並依角色導向正確入口。
- `shared-calendar`：網格清楚、可篩選、資訊完整。
- `book/[hostId]`：能成功送出預約，且限制條件生效。
- `dashboard/bookings`：學生能看到狀態與反饋提示。
- `dashboard/requests`：管理者能完成審核決策。
- `dashboard/schedule`：管理者能維護時段。
- `dashboard/students`：可查看學生統計。
- `dashboard/feedbacks`：學生可提交反饋，管理端可看分類。

## 實作原則

- 先補現有頁面，不先加新 route。
- 先做資料流完整，再做視覺優化。
- 所有頁面都要對齊 Prisma 與 Server Actions 的實際資料結構。
- 任何表單若會影響 booking / feedback / availability，都要保留明確錯誤狀態。
