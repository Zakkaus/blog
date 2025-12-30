#!/usr/bin/env python3
"""
同步 gentoo-zh.github.com 的文章到主 blog
保留主 blog 的frontmatter，更新內容主體
"""

import re
import sys
from pathlib import Path

# 定義文章列表
ARTICLES = [
    "2025-11-25-gentoo-install-base",
    "2025-11-25-gentoo-install-desktop",
    "2025-11-25-gentoo-install-advanced",
    "2025-10-02-gentoo-m-series-mac"
]

# URL 映射：gentoo-zh URL → blog URL
URL_MAPPINGS = {
    "/posts/2025-11-25-gentoo-install-base/": "/zh-cn/posts/gentoo-install/",
    "/posts/2025-11-25-gentoo-install-desktop/": "/zh-cn/posts/gentoo-install-desktop/",
    "/posts/2025-11-25-gentoo-install-advanced/": "/zh-cn/posts/gentoo-install-advanced/",
}


def extract_frontmatter(content: str) -> tuple[str, str]:
    """提取 frontmatter 和正文"""
    # 匹配 --- ... --- 之間的內容
    match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if match:
        return match.group(1), match.group(2)
    return "", content


def replace_internal_links(content: str) -> str:
    """替換內部鏈接格式"""
    for old_url, new_url in URL_MAPPINGS.items():
        content = content.replace(old_url, new_url)
    return content


def sync_article(article_name: str, blog_root: Path, gentoo_zh_root: Path):
    """同步單篇文章"""
    print(f"\n處理: {article_name}")
    
    # 文件路徑
    blog_zh_cn = blog_root / "content/posts" / article_name / "index.zh-cn.md"
    gentoo_zh_cn = gentoo_zh_root / "content/posts" / article_name / "index.zh-cn.md"
    
    # 讀取文件
    blog_content = blog_zh_cn.read_text(encoding='utf-8')
    gentoo_content = gentoo_zh_cn.read_text(encoding='utf-8')
    
    # 提取 frontmatter 和內容
    blog_frontmatter, _ = extract_frontmatter(blog_content)
    _, gentoo_body = extract_frontmatter(gentoo_content)
    
    # 替換內部鏈接
    gentoo_body = replace_internal_links(gentoo_body)
    
    # 合併：blog frontmatter + gentoo content
    new_content = f"---\n{blog_frontmatter}\n---\n{gentoo_body}"
    
    # 寫回文件
    blog_zh_cn.write_text(new_content, encoding='utf-8')
    print(f"  ✓ 已更新: {blog_zh_cn.relative_to(blog_root)}")


def main():
    blog_root = Path("/Users/zakk/blog")
    gentoo_zh_root = blog_root / "gentoo-zh.github.com"
    
    print("開始同步 Gentoo 文章...")
    print(f"Blog 根目錄: {blog_root}")
    print(f"Gentoo-ZH 根目錄: {gentoo_zh_root}")
    
    for article in ARTICLES:
        try:
            sync_article(article, blog_root, gentoo_zh_root)
        except Exception as e:
            print(f"  ✗ 錯誤: {e}")
            continue
    
    print("\n同步完成！")
    print("\n接下來需要:")
    print("1. 使用 convert-zh-tw.sh 重新生成繁體中文版本")
    print("2. 驗證更新結果")


if __name__ == "__main__":
    main()
