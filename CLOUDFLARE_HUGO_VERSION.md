# Cloudflare Pages Hugo 版本配置

## 方法 1: 使用環境變量（推薦）

在 Cloudflare Pages 項目設置中添加環境變量：

1. 進入 Cloudflare Dashboard
2. 選擇你的 Pages 項目
3. 進入 **Settings** > **Environment variables**
4. 添加以下環境變量：

```
HUGO_VERSION = 0.151.0
```

或者使用完整版本號：

```
HUGO_VERSION = 0.151.0
```

## 方法 2: 使用配置文件

項目根目錄已包含以下文件：
- `.hugo-version` - 指定 Hugo 版本
- `.tool-versions` - asdf 工具版本管理文件

## 當前版本

- **Blowfish 主題支持**: Hugo v0.151.0
- **你的本地版本**: Hugo v0.147.7

## 注意事項

Cloudflare Pages 會按以下優先級選擇 Hugo 版本：
1. 環境變量 `HUGO_VERSION`
2. `.hugo-version` 文件
3. `.tool-versions` 文件
4. 默認版本（通常較舊）

建議同時使用環境變量和配置文件以確保版本一致性。
