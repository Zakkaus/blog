# Cloudflare Pages 部署配置

## ⚠️ 重要：必須設置環境變量

Cloudflare Pages 需要在項目設置中手動配置環境變量以使用 Hugo Extended 版本。

### 設置步驟：

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Workers & Pages** > 選擇你的 Pages 項目
3. 點擊 **Settings** 標籤
4. 找到 **Environment variables** 部分
5. 分別為 **Production** 和 **Preview** 環境添加以下變量：

#### Production（生產環境）：
```
變量名: HUGO_VERSION
值: 0.151.0
```

#### Preview（預覽環境）：
```
變量名: HUGO_VERSION
值: 0.151.0
```

### 為什麼需要這樣做？

- Blowfish 主題需要 **Hugo Extended** 版本來處理圖片（Resize、WebP 等功能）
- `.tool-versions` 文件只能指定版本號，無法直接指定 Extended 變體
- Cloudflare Pages 的 `asdf` 工具需要通過環境變量來下載 Extended 版本

### 構建設置：

確保構建命令設置為：
```bash
hugo --gc --minify --enableGitInfo
```

根目錄：
```
/
```

輸出目錄：
```
public
```

### 版本要求：

- **最低版本**: Hugo v0.141.0
- **推薦版本**: Hugo v0.151.0 (Blowfish 主題最新支持版本)
- **必須**: Extended 版本

### 故障排除：

如果看到錯誤 "this feature is not available in your current Hugo version"：
1. 確認已設置 `HUGO_VERSION` 環境變量
2. 確認版本號為 `0.151.0`（不要帶 v 前綴）
3. 觸發重新部署
