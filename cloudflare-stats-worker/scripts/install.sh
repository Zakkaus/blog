#!/bin/bash

# Cloudflare Stats Worker 一鍵安裝腳本
# 支持完整的 KV + D1 配置和部署

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() { echo -e "${BLUE}ℹ ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# 橫幅
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     Cloudflare Stats Worker 自動安裝腳本 v1.5.0          ║
║                                                           ║
║     GitHub: https://github.com/Zakkaus/cloudflare-stats-worker  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# 步驟 1: 檢查 Wrangler CLI
log_info "檢查 Wrangler CLI..."
if ! command -v wrangler &> /dev/null; then
    log_warning "Wrangler CLI 未安裝"
    log_info "正在安裝 Wrangler..."
    npm install -g wrangler
    log_success "Wrangler 安裝成功"
else
    WRANGLER_VERSION=$(wrangler --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    log_success "Wrangler 已安裝 (版本 $WRANGLER_VERSION)"
fi

# 步驟 2: 登錄 Cloudflare
log_info "檢查 Cloudflare 登錄狀態..."
if ! wrangler whoami &> /dev/null; then
    log_warning "未登錄 Cloudflare"
    log_info "請在瀏覽器中完成登錄..."
    wrangler login
    log_success "Cloudflare 登錄成功"
else
    ACCOUNT=$(wrangler whoami 2>&1 | grep "Account Name:" | cut -d':' -f2 | xargs)
    log_success "已登錄 Cloudflare (帳戶: $ACCOUNT)"
fi

# 步驟 3: 創建 KV 命名空間
log_info "創建 KV 命名空間..."

# 檢查是否已經有 KV 配置
if grep -q "kv_namespaces" wrangler.toml && grep -q "PAGE_STATS" wrangler.toml; then
    log_warning "wrangler.toml 中已存在 KV 配置"
    read -p "是否覆蓋現有配置？(y/N): " OVERWRITE_KV
    if [[ "$OVERWRITE_KV" != "y" && "$OVERWRITE_KV" != "Y" ]]; then
        log_info "跳過 KV 創建"
        KV_SKIP=true
    fi
fi

if [[ "$KV_SKIP" != true ]]; then
    # 創建生產 KV
    KV_OUTPUT=$(wrangler kv namespace create PAGE_STATS 2>&1)
    KV_ID=$(echo "$KV_OUTPUT" | grep -oE 'id = "[a-f0-9]+"' | cut -d'"' -f2)
    
    # 創建預覽 KV
    KV_PREVIEW_OUTPUT=$(wrangler kv namespace create PAGE_STATS --preview 2>&1)
    KV_PREVIEW_ID=$(echo "$KV_PREVIEW_OUTPUT" | grep -oE 'preview_id = "[a-f0-9]+"' | cut -d'"' -f2)
    
    log_success "KV 命名空間創建成功"
    log_info "  - 生產環境 ID: $KV_ID"
    log_info "  - 預覽環境 ID: $KV_PREVIEW_ID"
    
    # 更新 wrangler.toml
    log_info "更新 wrangler.toml 配置..."
    
    # 備份原配置
    cp wrangler.toml wrangler.toml.backup
    
    # 移除舊的 KV 配置
    sed -i.bak '/\[\[kv_namespaces\]\]/,/preview_id.*PAGE_STATS/d' wrangler.toml
    
    # 添加新的 KV 配置
    cat >> wrangler.toml << EOF

[[kv_namespaces]]
binding = "PAGE_STATS"
id = "$KV_ID"
preview_id = "$KV_PREVIEW_ID"
EOF
    
    log_success "KV 配置已更新"
fi

# 步驟 4: 創建 D1 數據庫
log_info "創建 D1 數據庫..."

# 檢查是否已經有 D1 配置
if grep -q "d1_databases" wrangler.toml && grep -q "cloudflare-stats-top" wrangler.toml; then
    log_warning "wrangler.toml 中已存在 D1 配置"
    read -p "是否重新創建 D1 數據庫？(y/N): " RECREATE_D1
    if [[ "$RECREATE_D1" != "y" && "$RECREATE_D1" != "Y" ]]; then
        log_info "跳過 D1 創建"
        D1_SKIP=true
    fi
fi

if [[ "$D1_SKIP" != true ]]; then
    # 嘗試創建 D1 數據庫
    D1_OUTPUT=$(wrangler d1 create cloudflare-stats-top 2>&1 || true)
    
    if echo "$D1_OUTPUT" | grep -q "already exists"; then
        log_warning "D1 數據庫已存在，使用現有數據庫"
        # 獲取現有數據庫 ID
        D1_ID=$(wrangler d1 list | grep cloudflare-stats-top | awk '{print $1}')
    else
        D1_ID=$(echo "$D1_OUTPUT" | grep -oE 'database_id = "[a-f0-9-]+"' | cut -d'"' -f2)
        log_success "D1 數據庫創建成功"
    fi
    
    log_info "  - 數據庫 ID: $D1_ID"
    
    # 更新 wrangler.toml
    log_info "更新 D1 配置..."
    
    # 移除舊的 D1 配置註釋
    sed -i.bak '/# \[\[d1_databases\]\]/,/# database_id.*cloudflare-stats-top/d' wrangler.toml
    sed -i.bak '/\[\[d1_databases\]\]/,/database_id.*cloudflare-stats-top/d' wrangler.toml
    
    # 添加新的 D1 配置
    cat >> wrangler.toml << EOF

[[d1_databases]]
binding = "DB"
database_name = "cloudflare-stats-top"
database_id = "$D1_ID"
EOF
    
    log_success "D1 配置已更新"
    
    # 初始化 D1 數據表
    log_info "初始化 D1 數據表..."
    if [ -f "schema.sql" ]; then
        wrangler d1 execute cloudflare-stats-top --file=schema.sql --remote
        log_success "D1 數據表初始化成功"
    else
        log_warning "未找到 schema.sql，跳過數據表初始化"
        log_info "請手動執行: wrangler d1 execute cloudflare-stats-top --file=schema.sql --remote"
    fi
fi

# 步驟 5: 部署 Worker
log_info "部署 Cloudflare Worker..."
wrangler deploy

log_success "Worker 部署成功！"

# 步驟 6: 獲取部署信息
log_info "獲取部署信息..."

WORKER_NAME=$(grep '^name' wrangler.toml | cut -d'"' -f2 | cut -d"'" -f2)
WORKER_URL=$(wrangler deployments list 2>&1 | grep -oE 'https://[a-z0-9\-]+\.workers\.dev' | head -1)

if [ -z "$WORKER_URL" ]; then
    # 如果沒有獲取到，使用預設格式
    ACCOUNT_SUBDOMAIN=$(wrangler whoami 2>&1 | grep "Account ID:" | cut -d':' -f2 | xargs | cut -c1-8)
    WORKER_URL="https://${WORKER_NAME}.${ACCOUNT_SUBDOMAIN}.workers.dev"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║                🎉 部署成功！                              ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
log_success "Worker 名稱: $WORKER_NAME"
log_success "Worker URL: $WORKER_URL"
echo ""
log_info "可用端點："
echo -e "  ${BLUE}•${NC} 儀表板:     ${WORKER_URL}/"
echo -e "  ${BLUE}•${NC} 健康檢查:   ${WORKER_URL}/health"
echo -e "  ${BLUE}•${NC} 統計查詢:   ${WORKER_URL}/api/stats?url=/"
echo -e "  ${BLUE}•${NC} 計數增加:   ${WORKER_URL}/api/count?url=/&action=pv"
echo -e "  ${BLUE}•${NC} 批量查詢:   ${WORKER_URL}/api/batch"
echo -e "  ${BLUE}•${NC} 熱門頁面:   ${WORKER_URL}/api/top?limit=10"
echo ""
log_info "下一步："
echo -e "  ${BLUE}1.${NC} 設置自定義域名（可選）"
echo -e "     ${YELLOW}wrangler custom-domains add stats.yourdomain.com${NC}"
echo ""
echo -e "  ${BLUE}2.${NC} 在博客中集成統計代碼"
echo -e "     詳見: ${BLUE}HUGO_INTEGRATION.md${NC}"
echo ""
echo -e "  ${BLUE}3.${NC} 訪問儀表板查看統計數據"
echo -e "     ${BLUE}$WORKER_URL${NC}"
echo ""
log_success "安裝完成！"
