#!/usr/bin/env python3
"""
修正繁體中文版本的鏈接：將 /zh-cn/ 改為 /zh-tw/
"""

import re
from pathlib import Path

ARTICLES = [
    "2025-11-25-gentoo-install-base",
    "2025-11-25-gentoo-install-desktop",
    "2025-11-25-gentoo-install-advanced",
    "2025-10-02-gentoo-m-series-mac"
]

def fix_zh_tw_links(file_path: Path):
    """修正繁體版本中的簡體鏈接"""
    content = file_path.read_text(encoding='utf-8')
    
    # 替換所有 /zh-cn/ 為 /zh-tw/
    content = content.replace('/zh-cn/posts/', '/zh-tw/posts/')
    
    # 修正 aliases 中的語言代碼（如果在 frontmatter 中）
    content = re.sub(
        r'(aliases:\s*\n\s*- )/zh-cn/',
        r'\1/zh-tw/',
        content
    )
    
    file_path.write_text(content, encoding='utf-8')
    print(f"  ✓ 已修正: {file_path.name}")


def main():
    blog_root = Path("/Users/zakk/blog")
    
    print("修正繁體中文版本的鏈接...")
    
    for article in ARTICLES:
        zh_tw_file = blog_root / "content/posts" / article / "index.zh-tw.md"
        try:
            fix_zh_tw_links(zh_tw_file)
        except Exception as e:
            print(f"  ✗ 錯誤 ({article}): {e}")
    
    print("\n修正完成！")


if __name__ == "__main__":
    main()
