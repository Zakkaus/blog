# 儀表板部署指南

## 已完成的工作

### 1. 創建數據儀表板
- ✅ `dashboard/index.html` - 完整的統計查看介面
- ✅ `dashboard/README.md` - 部署說明
- ✅ `dashboard/_headers` - 安全標頭配置

### 2. 更新文檔
- ✅ README.md - 添加儀表板說明和 Workers Paid 方案詳情
- ✅ README.zh-TW.md - 繁中版本
- ✅ 線上示例鏈接

### 3. Git 提交
- ✅ Blog 倉庫：3 個新提交
- ✅ Worker 倉庫：2 個新提交

---

## 部署步驟（stats.zakk.au）

### 方法 1: Cloudflare Pages Dashboard（推薦）

1. **登入 Cloudflare Dashboard**
   - 訪問：https://dash.cloudflare.com
   - 選擇你的帳號

2. **創建 Pages 項目**
   - 左側選單：**Workers & Pages**
   - 點擊 **Create application**
   - 選擇 **Pages** 標籤
   - 點擊 **Connect to Git**

3. **連接 GitHub 倉庫**
   - 選擇：`Zakkaus/cloudflare-stats-worker`
   - 授權 Cloudflare 訪問（如果首次使用）

4. **配置建置設定**
   ```
   Project name: stats-dashboard
   Production branch: main
   Framework preset: None
   Build command: (留空)
   Build output directory: dashboard
   ```

5. **部署**
   - 點擊 **Save and Deploy**
   - 等待 1-2 分鐘完成部署
   - 記下自動分配的 URL：`https://stats-dashboard.pages.dev`

6. **綁定自訂域名**
   - 在 Pages 項目頁面，選擇 **Custom domains**
   - 點擊 **Set up a custom domain**
   - 輸入：`stats.zakk.au`
   - Cloudflare 會自動配置 DNS
   - 等待 SSL 證書生效（通常 1-5 分鐘）

7. **更新 API URL**
   - 回到 GitHub 編輯 `dashboard/index.html`
   - 第 335 行改為：
     ```javascript
     const API_BASE = 'https://cloudflare-stats-worker.zakkauu.workers.dev';
     ```
   - 提交並推送（自動觸發重新部署）

### 方法 2: Wrangler CLI

```bash
# 進入 dashboard 目錄
cd cloudflare-stats-worker/dashboard

# 部署
wrangler pages deploy . --project-name=stats-dashboard

# 綁定自訂域名（在 Dashboard 手動操作更簡單）
```

---

## 驗證部署

### 1. 檢查健康狀態
訪問：https://stats.zakk.au

應該看到：
- ✅ 全站 PV/UV 數字載入
- ✅ API 狀態顯示 "✅ 正常"
- ✅ 搜尋框可以查詢

### 2. 測試搜尋功能
在搜尋框輸入：`/`
應該看到首頁的統計數據

### 3. 檢查熱門頁面
如果配置了 D1：
- ✅ 顯示 Top 10 頁面列表

如果沒有 D1：
- ⚠️ 顯示 "暫無數據或 D1 未配置"

---

## 常見問題

### Q1: 儀表板顯示 "網絡錯誤"
**原因**：API_BASE URL 不正確或 Worker 未部署

**解決**：
1. 檢查 `dashboard/index.html` 第 335 行的 API_BASE
2. 確認 Worker 已部署：`curl https://your-worker-url/health`
3. 檢查 CORS 設定

### Q2: 熱門頁面不顯示
**原因**：D1 未配置

**解決**：
```bash
# 創建 D1
wrangler d1 create cloudflare-stats-top

# 應用 schema
wrangler d1 execute cloudflare-stats-top --file=schema.sql

# 更新 wrangler.toml 取消註解 d1_databases 區塊

# 重新部署 Worker
wrangler deploy
```

### Q3: 自訂域名 SSL 錯誤
**原因**：DNS 未生效或 SSL 證書生成中

**解決**：
- 等待 5-10 分鐘
- 檢查 DNS 記錄是否正確
- 清除瀏覽器緩存

### Q4: 數字一直顯示 "-"
**原因**：
1. Worker API 返回錯誤
2. JavaScript 控制台有錯誤

**解決**：
1. F12 打開開發者工具
2. 查看 Console 錯誤訊息
3. 查看 Network 請求是否成功
4. 確認 Worker API 可以訪問

---

## 功能說明

### 已實現
- ✅ 實時全站統計（PV/UV）
- ✅ API 健康檢查（狀態 + 版本）
- ✅ 單頁統計搜尋
- ✅ 熱門頁面 Top 10（需 D1）
- ✅ 深色模式設計
- ✅ 響應式佈局（手機友善）
- ✅ 數字格式化（千位分隔符）
- ✅ 錯誤處理和提示

### 可選增強（未來）
- ⏳ 歷史趨勢圖表
- ⏳ 日期範圍篩選
- ⏳ 多語言切換（EN/ZH-TW/ZH-CN）
- ⏳ 導出 CSV 功能
- ⏳ 實時更新（WebSocket）

---

## 維護

### 更新儀表板
1. 編輯 `dashboard/index.html`
2. 提交並推送到 GitHub
3. Cloudflare Pages 自動重新部署

### 監控
- Cloudflare Dashboard → Pages → stats-dashboard → Analytics
- 查看訪問量、錯誤率、帶寬使用

---

## 成本

### Cloudflare Pages 免費方案
- ✅ 500 次建置/月
- ✅ 無限請求
- ✅ 無限帶寬
- ✅ 自訂域名 + SSL

**對於這個靜態儀表板**：完全免費 ✅

---

## 倉庫鏈接

- **Worker 倉庫**: https://github.com/Zakkaus/cloudflare-stats-worker
- **Blog 倉庫**: https://github.com/Zakkaus/blog
- **線上示例**: https://stats.zakk.au（部署後可用）

---

**最後更新**: 2025-10-07  
**狀態**: ✅ 所有文件已創建並提交到 GitHub
