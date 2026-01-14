# ☕ 河狸咖啡 (Heli Coffee) 官方網站

> **SheetOps Serverless 架構範例**
> 結合 Nuxt 4 與 Google Ecosystem 的現代化咖啡廳形象與預約官網。

## 📖 專案簡介

本專案採用 **"Serverless"** 與 **"Headless CMS"** 概念。不使用傳統後端資料庫（如 SQL），而是利用 **Google Sheets** 作為資料庫，配合 **Google Apps Script (GAS)** 作為 API 中介層，實現輕量、低成本且易於維護的網站架構。

### 核心技術堆疊 (Tech Stack)

* **前端框架**: [Nuxt 4](https://nuxt.com) (Vue 3)
* **樣式系統**: [Tailwind CSS v3](https://tailwindcss.com)
* **狀態管理**: [Pinia](https://pinia.vuejs.org)
* **後端 API**: Google Apps Script (GAS)
* **資料庫**: Google Sheets
* **圖片託管**: Cloudinary (解決 Google Drive 流量限制與破圖問題)
* **地圖整合**: Google Maps Embed API

---

## 🏗️ 系統架構 (Architecture)

### 資料流向 (Data Flow)

1.  **讀取 (Read)**: Client (Nuxt) -> `GET` Request -> GAS -> Google Sheets -> JSON Response.
2.  **寫入 (Write)**: Client (Checkout) -> `POST` Request -> GAS -> Google Sheets (Orders/Reservations).

### 目錄結構

```bash
root
├── app
│   ├── components  # UI 元件 (AppNavbar, HomeCarousel, HomeNews, HomeVisit...)
│   ├── layouts     # 佈局 (default.vue)
│   ├── pages       # 路由頁面 (index, menu, shop, checkout...)
│   ├── stores      # Pinia 狀態管理 (cart.ts, news.ts, product.ts)
│   └── assets      # 靜態資源 (css/tailwind.css)
├── public          # 公開資源 (favicon, logos)
├── nuxt.config.ts  # Nuxt 設定 (Head, Modules)
└── README.md       # 專案說明文件
```

## 📊 資料庫結構 (Database Schema)

本專案高度依賴 Google Sheets 的欄位定義。請勿隨意更動 Sheet 中的 標題列 (Header) 名稱。

### **1. 產品資料 (Products)**

用於「線上商店」頁面。 
| 欄位 (Key) | 說明 | 範例 |
| :--- | :--- | :--- |
| id | 唯一識別碼 | p001 |
| name | 商品名稱 | 河狸特調拿鐵 | 
| category | 分類 | coffee / cake | 
| price | 價格 (數值) | 150 | 
| description | 商品描述 | 濃郁奶香 | 
| image_url | 圖片連結 | `https://res.cloudinary.com/... `| 
| is_active | 是否上架 | TRUE |
| is_new_arrival| 是否為新品 | FALSE |

### **2. 最新消息 (Home_News)**
用於首頁「最新消息」區塊。 

| 欄位 (Key) | 說明 | 範例 | 
| :--- | :--- | :--- | 
| id | 唯一識別碼 | n01 | 
| date | 日期 | 2023-10-20 | 
| title | 標題 | 內部整修公告 | 
| content | 內容 | 10/25 店休一日 | 
| tag | 標籤 | 公告 / 新品 / 優惠 | 
| is_active | 是否顯示 | TRUE |

## 🔌 後端 API (Google Apps Script)
### 部署設定  
後端邏輯位於 Google Apps Script 的 doGet 與 doPost 函式中。
  * 權限: 必須設定為「執行身分：我 (Me)」、「存取權：任何人 (Anyone)」。

### API 介面 (Endpoints)  
Base URL: https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec

### GET 請求 (讀取資料)  
透過 Query String type 區分資料來源。
  - 取得產品： GET ?type=products
  - 取得新聞： GET ?type=news
  - 取得輪播： GET ?type=carousel
  - 取得菜單： GET ?type=menu_images

* 回傳格式 (JSON):
``` JSON
{
  "status": "success",
  "type": "products",
  "data": [ ... ]
}
```
## 🚀 開發環境建置 (Local Development)
### 1. 安裝依賴
``` Bash
npm install
```
### 2. 環境變數設定
雖為純前端專案，建議將 API URL 統一管理 (可選)。

### 3. 啟動開發伺服器
``` Bash
npm run dev
```
瀏覽器開啟 http://localhost:3000。

## 💡 技術決策紀錄 (ADR)
### 1. 圖片託管 (Image Hosting)
- **決策**： 放棄使用 Google Drive 直接連結，改用 Cloudinary。
- **原因**： Google Drive 的公開連結會有 403 Rate Limit 限制，且讀取速度慢，不適合做為 CDN 使用。Cloudinary 提供更穩定的圖片優化與 CDN 服務。

### 2. 狀態管理 (State Management)
- **決策**： 使用 Pinia 配合簡易快取策略 (Simple Caching)。
- **原因**： GAS API 回應速度約 1~2 秒。為了優化 UX，Store 內實作了 lastFetched 檢查，5 分鐘內不重複打 API，實現「類靜態」的瀏覽體驗。

### 3. CSS 架構
- **決策**： Tailwind CSS Utility-first。
- **原因**： 快速切版，且配合 Nuxt 的 PostCSS 建置流程能極小化 CSS 檔案體積。