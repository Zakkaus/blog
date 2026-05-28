#!/usr/bin/env bash
#
# sync_to_tw.sh — generate a zh-tw post from a zh-cn post.
#
# Pipeline:
#   1. OpenCC s2twp (Simplified → Traditional with Taiwan phrase mapping)
#   2. Apply the Mainland → Taiwan terminology table
#   3. Apply Taiwan infrastructure substitutions (mirror URLs, timezone)
#   4. Preserve YAML frontmatter and fenced code blocks — bash/conf/ini/fstab
#      contents stay byte-for-byte identical EXCEPT for the documented infra
#      axes (mirror URL, timezone string). Code comments stay simplified Chinese
#      if the user wrote them that way; the script does not touch them.
#
# Usage:
#   scripts/sync_to_tw.sh content/posts/<post>/index.zh-cn.md
#
# Dependencies:
#   - python3 ≥ 3.8
#   - opencc (preferred — `pip install opencc` or distro package)
#
# Idempotent. Re-running produces the same output.

set -Eeuo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path/to/index.zh-cn.md>" >&2
  exit 1
fi

SRC=$1
if [[ ! -f "$SRC" ]]; then
  echo "Source file not found: $SRC" >&2
  exit 1
fi
if [[ "$SRC" != *index.zh-cn.md ]]; then
  echo "Expected input to end with index.zh-cn.md, got: $SRC" >&2
  exit 1
fi

DST=${SRC/index.zh-cn.md/index.zh-tw.md}
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

python3 - "$SRC" "$TMP" <<'PYEOF'
"""Convert a zh-cn Markdown article to zh-tw."""
import re, sys

src_path, dst_path = sys.argv[1], sys.argv[2]

# -------- OpenCC --------
def _make_opencc():
    try:
        from opencc import OpenCC
        return OpenCC('s2twp').convert
    except Exception:
        pass
    try:
        import subprocess
        subprocess.run(['opencc', '--version'], check=True, capture_output=True)
        def run(text):
            r = subprocess.run(['opencc', '-c', 's2twp.json'],
                               input=text, text=True,
                               capture_output=True, check=True)
            return r.stdout
        return run
    except Exception:
        sys.exit("OpenCC not available. Install with: pip install opencc")

opencc = _make_opencc()

# -------- Terminology table (post-OpenCC) --------
# OpenCC s2twp catches most things. These are the residuals we have caught
# in past reviews; they apply to PROSE only.
PROSE_REPLACEMENTS = [
    # OpenCC bug: 包 → 套件 turning 包含 → 套件含
    ('套件含', '包含'),
    # Mainland vocab → Taiwan vocab
    ('網絡', '網路'),
    ('內核', '核心'),
    ('內存', '記憶體'),
    ('數據', '資料'),
    ('軟件', '軟體'),
    ('視頻', '影片'),
    ('字體', '字型'),
    ('鼠標', '滑鼠'),
    ('屏幕', '螢幕'),
    ('窗口', '視窗'),
    ('登錄', '登入'),
    ('信息', '訊息'),
    ('黑屏', '黑畫面'),
    ('教程', '教學'),
    ('視訊', '影片'),
    ('視頻', '影片'),
    # 程式碼 → 原始碼 is the canonical TW term
    ('程式碼', '原始碼'),
    # Doubled-character OpenCC artefacts caught in past reviews
    ('使用者名稱稱', '使用者名稱'),
    # OpenCC sometimes mis-routes 開機/啟動; keep as-is
]

# -------- Infrastructure substitutions --------
# Applied in both prose and code (because code references mirror URLs etc.)
INFRA_REPLACEMENTS = [
    # Mainland mirrors → TWAREN
    ('https://mirrors.bfsu.edu.cn/gentoo/',
     'https://ftp.twaren.net/Linux/Gentoo/'),
    ('https://mirrors.bfsu.edu.cn/git/gentoo-portage.git',
     'https://ftp.twaren.net/git/Gentoo/gentoo-portage.git'),
    ('https://mirrors.tuna.tsinghua.edu.cn/gentoo/',
     'https://ftp.twaren.net/Linux/Gentoo/'),
    ('https://mirrors.ustc.edu.cn/gentoo/',
     'https://ftp.twaren.net/Linux/Gentoo/'),
    ('mirrors.bfsu.edu.cn/gentoo',
     'ftp.twaren.net/Linux/Gentoo'),
    # Timezone
    ('Asia/Shanghai', 'Asia/Taipei'),
]

def apply_replacements(text, pairs):
    for old, new in pairs:
        text = text.replace(old, new)
    return text

def _convert_chunk(text):
    """OpenCC + manual replacements. Preserves trailing newlines explicitly
    because some OpenCC bindings strip them."""
    text = opencc(text)
    text = apply_replacements(text, PROSE_REPLACEMENTS)
    text = apply_replacements(text, INFRA_REPLACEMENTS)
    return text

def convert_prose(text):
    if not text:
        return text
    # Preserve newline structure: convert per-line and rejoin.
    # OpenCC operates on word boundaries within a single line just fine.
    lines = text.split('\n')
    converted = [opencc(l) if l else l for l in lines]
    converted = [apply_replacements(l, PROSE_REPLACEMENTS) for l in converted]
    converted = [apply_replacements(l, INFRA_REPLACEMENTS) for l in converted]
    return '\n'.join(converted)

def convert_code(text):
    # Code stays byte-for-byte except infra axes.
    return apply_replacements(text, INFRA_REPLACEMENTS)

def convert_frontmatter(text):
    lines = text.split('\n')
    converted = [opencc(l) if l else l for l in lines]
    converted = [apply_replacements(l, PROSE_REPLACEMENTS) for l in converted]
    return '\n'.join(converted)

# -------- Streaming parser (state machine) --------
# Reliable for nested constructs. Handles:
#   - YAML frontmatter (--- ... ---)
#   - fenced code blocks (```label ... ```)
#   - everything else as prose
#
# A fence line is exactly three backticks at column 0 followed by an optional
# language label (only [a-zA-Z0-9_+-]*) and trailing whitespace.

FENCE_RE = re.compile(r'^```([a-zA-Z0-9_+\-]*)\s*$')

def main():
    with open(src_path, encoding='utf-8') as f:
        lines = f.readlines()

    out = []
    i = 0
    n = len(lines)

    # Frontmatter handling: opens with `---\n` at the start of the file
    if n > 0 and lines[0].rstrip('\r\n') == '---':
        end = -1
        for j in range(1, n):
            if lines[j].rstrip('\r\n') == '---':
                end = j
                break
        if end != -1:
            fm = ''.join(lines[0:end + 1])
            out.append(convert_frontmatter(fm))
            i = end + 1

    in_fence = False
    fence_buf = []
    prose_buf = []

    def flush_prose():
        if prose_buf:
            out.append(convert_prose(''.join(prose_buf)))
            prose_buf.clear()

    def flush_fence():
        if fence_buf:
            out.append(convert_code(''.join(fence_buf)))
            fence_buf.clear()

    while i < n:
        line = lines[i]
        if in_fence:
            # Close fence on a bare ``` at column 0
            if line.rstrip('\r\n') == '```':
                flush_fence()
                out.append(line)  # closing fence kept as-is
                in_fence = False
            else:
                fence_buf.append(line)
        else:
            m = FENCE_RE.match(line.rstrip('\r\n'))
            if m:
                flush_prose()
                out.append(line)  # opening fence kept as-is
                in_fence = True
            else:
                prose_buf.append(line)
        i += 1

    if in_fence:
        # Unterminated fence — leave content as-is to avoid corruption
        flush_fence()
    flush_prose()

    with open(dst_path, 'w', encoding='utf-8') as f:
        f.writelines(out)

main()
PYEOF

mv "$TMP" "$DST"
trap - EXIT
echo "Wrote: $DST"
echo
echo "Reminder: manually verify the new zh-tw file before committing."
echo "Suggested final check:"
echo "  diff <(grep -c '^\`\`\`' $SRC) <(grep -c '^\`\`\`' $DST)"
echo "  → fence counts must match"
