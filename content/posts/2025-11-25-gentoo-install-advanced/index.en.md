---
title: "Gentoo Linux Installation Guide (Advanced Optimization)"
slug: gentoo-install-advanced
aliases:
  - /posts/gentoo-install-advanced/
translationKey: gentoo-install-advanced
date: 2025-11-30
summary: "Gentoo Linux advanced optimization tutorial, covering make.conf optimization, LTO, Tmpfs, system maintenance, etc."
description: "2025 Latest Gentoo Linux Installation Guide (Advanced Optimization), covering make.conf optimization, LTO, Tmpfs, system maintenance, etc."
article:
  showHero: true
  heroStyle: background
featureImage: feature-gentoo-chan.webp
featureImageAlt: "Gentoo Chan"
keywords:
  - Gentoo Linux
  - make.conf
  - LTO
  - Tmpfs
  - System Maintenance
  - Compilation Optimization
tags:
  - Gentoo
  - Linux
  - Tutorial
  - System Optimization
categories:
  - tutorial
authors:
  - zakkaus
---

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

### Special Note

This article is Part 3 of the **Gentoo Linux Installation Guide** series: **Advanced Optimization**.

**Series Navigation**:
1. [Base Installation](/posts/gentoo-install/): Installing Gentoo base system from scratch
2. [Desktop Configuration](/posts/gentoo-install-desktop/): Graphics drivers, desktop environments, input methods, etc.
3. **Advanced Optimization (This Article)**: make.conf optimization, LTO, system maintenance

**Previous Step**: [Desktop Configuration](/posts/gentoo-install-desktop/)

</div>

## 13. make.conf Advanced Configuration Guide

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Official Documentation**: [make.conf - Gentoo Wiki](https://wiki.gentoo.org/wiki//etc/portage/make.conf) · [Base Part Section 5.2: make.conf Example](/posts/gentoo-install/#52-makeconf-example)

</div>

`/etc/portage/make.conf` is the core configuration file of Gentoo, controlling software package compilation methods, system features, and optimization parameters. This chapter will explain the meaning and best practices of each setting item in depth.

---

### 13.1 Compiler Optimization Parameters

These parameters determine how packages are compiled, directly affecting system performance.

#### COMMON_FLAGS: General Compiler Flags

```bash
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
```

**Parameter Explanation**:

| Parameter | Description | Note |
|------|------|----------|
| `-march=native` | Optimize for current CPU architecture | Compiled programs may not run on other CPUs |
| `-O2` | Optimization Level 2 (Recommended) | Balances performance, stability, and compilation time |
| `-O3` | Aggressive optimization (Not recommended) | May cause some software compilation failures or runtime anomalies |
| `-pipe` | Use pipes for data transfer | Speeds up compilation, slightly increases memory usage |

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Recommended Setting**

For most users, using `-march=native -O2 -pipe` is sufficient. Unless you clearly know what you are doing, do not use `-O3` or other aggressive optimization parameters.

</div>

#### CPU Instruction Set Optimization (CPU_FLAGS_X86)

CPU instruction set flags are recommended to be automatically detected and written to `CPU_FLAGS_X86` using `app-portage/cpuid2cpuflags`.

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Quick Start**: Refer to [Base Part Section 5.3: CPU Instruction Set Optimization](/posts/gentoo-install/#53-configure-cpu-instruction-set-optimization)

**Full Explanation (Recommended)**: Refer to [Section 13.13: CPU Instruction Set Optimization (CPU_FLAGS_X86)](#1313-cpu-instruction-set-optimization-cpu_flags_x86)

</div>

---

### 13.2 Parallel Compilation Settings

Controls the degree of parallelization in the compilation process; reasonable settings can significantly speed up package installation.

#### MAKEOPTS: Parallel Compilation for Single Package

```bash
MAKEOPTS="-j<threads> -l<load_limit>"
```

**Recommended Settings** (Based on CPU threads and memory capacity):

| Hardware Config | MAKEOPTS | Description |
|---------|----------|------|
| 4 Cores 8 Threads + 16GB RAM | `-j8 -l8` | Standard setting |
| 8 Cores 16 Threads + 32GB RAM | `-j16 -l16` | Mainstream setting |
| 16 Cores 32 Threads + 64GB RAM | `-j32 -l32` | Advanced setting |
| Insufficient Memory (< 8GB) | `-j<threads/2>` | Halve to avoid running out of memory |

**Parameter Explanation**:
- `-j<N>`: Number of compilation tasks running simultaneously (Recommended = CPU threads)
- `-l<N>`: System load limit, pauses new tasks if exceeded

#### EMERGE_DEFAULT_OPTS: Multi-package Parallel Compilation

```bash
EMERGE_DEFAULT_OPTS="--ask --verbose --jobs=<parallel_packages> --load-average=<load>"
```

**Recommended Settings**:

| CPU Threads | --jobs Value | Description |
|-----------|----------|------|
| 4-8 Threads | 2 | Compile 2 packages simultaneously |
| 12-16 Threads | 3-4 | Compile 3-4 packages simultaneously |
| 24+ Threads | 4-6 | Compile 4-6 packages simultaneously |

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Notes**

- `--jobs` will significantly increase memory usage; use with caution if memory is insufficient.
- Recommended to use default single-package compilation first, and enable multi-package parallelization after stabilization.
- Large packages like Chrome, LLVM already consume huge memory when compiling alone.

</div>

---

### 13.3 USE Flags Management

USE flags control software feature toggles, which is the core of Gentoo customization.

#### Global USE Flags

```bash
USE="systemd dbus policykit networkmanager bluetooth"
USE="${USE} wayland X gtk qt6"
USE="${USE} pipewire pulseaudio alsa"
USE="${USE} -doc -test -examples"
```

**Category Explanation**:

<details>
<summary><b>System and Initialization (Click to expand)</b></summary>

| USE Flag | Description | Recommendation |
|---------|------|------|
| `systemd` | Use systemd init system | Recommended for beginners |
| `openrc` | Use OpenRC init system | Traditional users |
| `udev` | Modern device management | Required |
| `dbus` | Inter-process communication (Desktop required) | Desktop required |
| `policykit` | Permission management (Desktop required) | Desktop required |

</details>

<details>
<summary><b>Desktop Environment and Display (Click to expand)</b></summary>

| USE Flag | Description | Recommendation |
|---------|------|------|
| `wayland` | Wayland display protocol | Recommended for modern desktop |
| `X` | X11 display protocol | Good compatibility |
| `gtk` | GTK+ toolkit (GNOME/Xfce) | GNOME users |
| `qt6` / `qt5` | Qt toolkit (KDE Plasma) | KDE users |
| `kde` | KDE integration | KDE users |
| `gnome` | GNOME integration | GNOME users |

</details>

<details>
<summary><b>Multimedia and Audio (Click to expand)</b></summary>

| USE Flag | Description | Recommendation |
|---------|------|------|
| `pipewire` | Modern audio/video server | Recommended for modern desktop |
| `pulseaudio` | PulseAudio audio server | Traditional desktop |
| `alsa` | ALSA audio support | Low-level required |
| `ffmpeg` | FFmpeg codec support | Recommended |
| `x264` / `x265` | H.264/H.265 video encoding | Video processing |
| `vaapi` / `vdpau` | Hardware video acceleration | Recommended with GPU |

</details>

<details>
<summary><b>Network and Connectivity (Click to expand)</b></summary>

| USE Flag | Description | Recommendation |
|---------|------|------|
| `networkmanager` | Graphical network management | Recommended for desktop users |
| `bluetooth` | Bluetooth support | Enable when needed |
| `wifi` | Wireless network support | Laptop required |

</details>

<details>
<summary><b>Internationalization and Documentation (Click to expand)</b></summary>

| USE Flag | Description | Recommendation |
|---------|------|------|
| `cjk` | CJK fonts and input method support | Required for Chinese users |
| `nls` | Native Language Support (Software translation) | Recommended |
| `icu` | Unicode support | Recommended |
| `-doc` | Disable documentation installation | Save space |
| `-test` | Disable test suites | Speed up compilation |
| `-examples` | Disable example files | Save space |

</details>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**USE Flag Strategy Suggestions**

1. **Minimization Principle**: Only enable features you need, disable unwanted ones (use `-` prefix).
2. **Category Management**: Add by category using `USE="${USE} ......"` for easier maintenance.
3. **Single Package Override**: Put USE flags for specific packages in `/etc/portage/package.use/`.

</div>

---

### 13.4 Language and Localization

```bash
# Software translation and documentation support
L10N="en en-US zh zh-CN zh-TW"

# Legacy localization variable (Some software still needs it)
LINGUAS="en en_US zh zh_CN zh_TW"

# Keep compilation output in English (Easier for searching errors)
LC_MESSAGES=C
```

---

### 13.5 License Management (ACCEPT_LICENSE)

Controls which software licenses the system can install.

#### Common Configuration Methods

```bash
# Method 1: Accept all licenses (Recommended for beginners)
ACCEPT_LICENSE="*"

# Method 2: Only Free Software
ACCEPT_LICENSE="@FREE"

# Method 3: Free Software + Redistributable Binaries
ACCEPT_LICENSE="@FREE @BINARY-REDISTRIBUTABLE"

# Method 4: Strict Control (Reject all, then explicitly allow)
ACCEPT_LICENSE="-* @FREE @BINARY-REDISTRIBUTABLE"
```

#### License Group Explanation

| License Group | Description |
|---------|------|
| `@FREE` | All Free Software (OSI/FSF approved) |
| `@BINARY-REDISTRIBUTABLE` | Binary software permitted for redistribution |
| `@GPL-COMPATIBLE` | GPL compatible licenses |

#### Single Package License Setting (Recommended Method)

```bash
# /etc/portage/package.license/firmware
sys-kernel/linux-firmware linux-fw-redistributable
sys-firmware/intel-microcode intel-ucode

# /etc/portage/package.license/nvidia
x11-drivers/nvidia-drivers NVIDIA-r2
```

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**See also**: [Section 13.12: ACCEPT_LICENSE Software License Details](#1312-accept_license-software-license-details)

</div>

---

### 13.6 Portage Feature Enhancement (FEATURES)

```bash
FEATURES="parallel-fetch candy"
```

**Common FEATURES**:

| Feature | Description | Recommendation |
|-----|------|------|
| `parallel-fetch` | Parallel download source packages | Recommended |
| `candy` | Beautify emerge output (Color progress bar) | Recommended |
| `ccache` | Compilation cache (Requires `dev-build/ccache`) | Recommended for frequent recompilation |
| `parallel-install` | Parallel install (Experimental) | Not recommended |
| `splitdebug` | Split debug info | Use when debugging |

---

### 13.7 Mirror Setting (GENTOO_MIRRORS)

```bash
# For more mirrors see: https://www.gentoo.org/downloads/mirrors/
# Recommended to choose based on location (One or more, space separated)

# Taiwan Mirrors (Recommended)
GENTOO_MIRRORS="http://ftp.twaren.net/Linux/Gentoo/"

# Or use other mirrors:
# Mainland China:
#   GENTOO_MIRRORS="https://mirrors.ustc.edu.cn/gentoo/"            # USTC
#   GENTOO_MIRRORS="https://mirrors.tuna.tsinghua.edu.cn/gentoo/"   # Tsinghua
#   GENTOO_MIRRORS="https://mirrors.zju.edu.cn/gentoo/"             # ZJU
# Hong Kong:
#   GENTOO_MIRRORS="https://hk.mirrors.cicku.me/gentoo/"            # CICKU
# Taiwan:
#   GENTOO_MIRRORS="http://ftp.twaren.net/Linux/Gentoo/"            # NCHC
#   GENTOO_MIRRORS="https://tw.mirrors.cicku.me/gentoo/"            # CICKU
# Singapore:
#   GENTOO_MIRRORS="https://mirror.freedif.org/gentoo/"             # Freedif
#   GENTOO_MIRRORS="https://sg.mirrors.cicku.me/gentoo/"            # CICKU
```

---

### 13.8 Compilation Log Settings

```bash
# Which levels of logs to record
PORTAGE_ELOG_CLASSES="warn error log qa"

# Log saving method
PORTAGE_ELOG_SYSTEM="save"  # Save to /var/log/portage/elog/
```

**Log Level Explanation**:
- `warn`: Warning info (Configuration issues)
- `error`: Error info (Compilation failure)
- `log`: Normal log
- `qa`: QA warning (Security issues)

---

### 13.9 Graphics Cards and Input Devices

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Important Note**

`VIDEO_CARDS` and `INPUT_DEVICES` are **NOT recommended** to be set globally in make.conf.

Recommended to use `/etc/portage/package.use/` to set for specific packages, see [Desktop Configuration Section 12.1](/posts/gentoo-install-desktop/#121-global-configuration).

</div>

---

### 13.10 Complete Configuration Example

<details>
<summary><b>Beginner Recommended Config (Click to expand)</b></summary>

```bash
# /etc/portage/make.conf
# vim: set filetype=bash

# ========== Compiler Optimization ==========
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"

# ========== Parallel Compilation ==========
MAKEOPTS="-j8"  # Adjust according to CPU threads

# ========== USE Flags ==========
USE="systemd dbus policykit networkmanager bluetooth"
USE="${USE} wayland pipewire"
USE="${USE} -doc -test"

# ========== Language and Localization ==========
L10N="en zh zh-CN"
LINGUAS="en zh_CN"
LC_MESSAGES=C

# ========== Mirrors ==========
# Recommended to choose based on location (One or more, space separated):
GENTOO_MIRRORS="http://ftp.twaren.net/Linux/Gentoo/"  # NCHC (Recommended)
# More mirrors: https://www.gentoo.org/downloads/mirrors/

# ========== Portage Config ==========
FEATURES="parallel-fetch candy"
EMERGE_DEFAULT_OPTS="--ask --verbose"

# ========== Licenses ==========
ACCEPT_LICENSE="*"

# ========== Compilation Logs ==========
PORTAGE_ELOG_CLASSES="warn error log"
PORTAGE_ELOG_SYSTEM="save"
```

</details>

<details>
<summary><b>High Performance Config (Click to expand)</b></summary>

```bash
# /etc/portage/make.conf
# vim: set filetype=bash

# ========== Compiler Optimization ==========
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"

# ========== Parallel Compilation (Advanced Hardware) ==========
MAKEOPTS="-j32 -l32"
EMERGE_DEFAULT_OPTS="--ask --verbose --jobs=4 --load-average=32"

# ========== USE Flags (Full Desktop) ==========
USE="systemd udev dbus policykit"
USE="${USE} networkmanager bluetooth wifi"
USE="${USE} wayland X gtk qt6 kde"
USE="${USE} pipewire pulseaudio alsa"
USE="${USE} ffmpeg x264 x265 vaapi vulkan"
USE="${USE} cjk nls icu"
USE="${USE} -doc -test -examples"

# ========== Language and Localization ==========
L10N="en en-US zh zh-CN zh-TW"
LINGUAS="en en_US zh zh_CN zh_TW"
LC_MESSAGES=C

# ========== Mirrors ==========
GENTOO_MIRRORS="http://ftp.twaren.net/Linux/Gentoo/"  # NCHC (Recommended)

# ========== Portage Config ==========
FEATURES="parallel-fetch candy ccache"
CCACHE_DIR="/var/cache/ccache"

# ========== Licenses ==========
ACCEPT_LICENSE="*"

# ========== Compilation Logs ==========
PORTAGE_ELOG_CLASSES="warn error log qa"
PORTAGE_ELOG_SYSTEM="save"
```

</details>

---

### 13.11 Detailed Configuration Example (Annotated)

<details>
<summary><b>Detailed Configuration Example (Recommended to read and adjust) (Click to expand)</b></summary>

```conf
# vim: set filetype=bash  # Tell Vim to use bash syntax highlighting

# ========== System Architecture (Do not modify manually) ==========
# Default by Stage3, indicates target system architecture (Usually no need to modify)
CHOST="x86_64-pc-linux-gnu"

# ========== Compiler Optimization Parameters ==========
# -march=native    Optimize for current CPU architecture, best performance
#                  Note: Compiled programs may not run on other CPUs
# -O2              Recommended optimization level (Balances performance, stability, compilation time)
#                  Note: Avoid -O3, may cause compilation failure or runtime anomalies
# -pipe            Use pipes instead of temp files, speeds up compilation
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"      # C compiler options
CXXFLAGS="${COMMON_FLAGS}"    # C++ compiler options
FCFLAGS="${COMMON_FLAGS}"     # Fortran compiler options
FFLAGS="${COMMON_FLAGS}"      # Fortran 77 compiler options

# CPU Instruction Set Optimization (Auto generated, see Section 13.13 below)
# Run: emerge --ask app-portage/cpuid2cpuflags && cpuid2cpuflags >> /etc/portage/make.conf
# CPU_FLAGS_X86="aes avx avx2 f16c fma3 mmx mmxext pclmul popcnt sse sse2 sse3 sse4_1 sse4_2 ssse3"

# ========== Parallel Compilation Settings ==========
# MAKEOPTS: Controls parallel task count for make
#   -j<N>   Number of concurrent compilation tasks, Recommended = CPU Threads (Run nproc to check)
#   -l<N>   System load limit, prevents system overload (Optional, usually same as -j)
MAKEOPTS="-j8"  # Example: 8 Thread CPU

# Recommendation for insufficient memory:
#    16GB RAM + 8 Core CPU → MAKEOPTS="-j4 -l8"  (Halve parallel count)
#    32GB RAM + 16 Core CPU → MAKEOPTS="-j16 -l16"

# ========== Language and Localization Settings ==========
# LC_MESSAGES: Keep compilation output in English, easier for searching errors and community help
LC_MESSAGES=C

# L10N: Localization support (Affects software translation, docs, spell check etc.)
L10N="en en-US zh zh-CN zh-TW"

# LINGUAS: Legacy localization variable (Some software still depends on it)
LINGUAS="en en_US zh zh_CN zh_TW"

# ========== Mirror Settings ==========
# Taiwan Mirrors (Choose one):
#   NCHC (Taiwan): http://ftp.twaren.net/Linux/Gentoo/
GENTOO_MIRRORS="http://ftp.twaren.net/Linux/Gentoo/"

# ========== Emerge Default Options ==========
# --ask              Ask confirmation before run (Recommended keep, prevents misoperation)
# --verbose          Show detailed info (USE flag changes, dependencies etc.)
# --with-bdeps=y     Check build-time dependencies when updating (Avoid stale deps)
# --complete-graph=y Complete dependency graph analysis (Resolve complex conflicts)
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"

# Advanced User Optional Settings (Requires sufficient memory):
#    --jobs=N           Parallel compile multiple packages (Recommended 2-4 if memory sufficient)
#    --load-average=N   System load limit (Recommended same as CPU cores)
# EMERGE_DEFAULT_OPTS="--ask --verbose --jobs=2 --load-average=8"

# ========== USE Flags (Global Feature Toggles) ==========
# Controls compilation options for all packages, affecting feature availability and dependencies
#
# System Base:
#   systemd        Use systemd init system (If using OpenRC change to -systemd)
#   udev           Modern device management (Recommended keep)
#   dbus           Inter-process communication (Required for desktop)
#   policykit      Permission management (Required for desktop)
#
# Network and Hardware:
#   networkmanager Graphical network management (Recommended for desktop)
#   bluetooth      Bluetooth support
#
# Development Tools:
#   git            Git version control (Must-have for developers)
#
# Kernel Selection:
#   dist-kernel    Use distribution default kernel (Strongly recommended for beginners)
#                  If not using this flag, need to manually configure kernel (See Chapter 7)
#
USE="systemd udev dbus policykit networkmanager bluetooth git dist-kernel"

# Common Optional USE Flags:
#   Audio: pulseaudio / pipewire (Audio server, choose one)
#   Display: wayland / X (Display protocol, required for desktop)
#   Graphics: vulkan, opengl (Modern graphics API)
#   Video: vaapi, vdpau (Hardware video acceleration)
#   Print: cups (Printing system)
#   Container: flatpak, appimage (Third-party app support)
#   Disable: -doc, -test, -examples (Save compilation time and disk space)

# ========== License Settings ==========
# ACCEPT_LICENSE: Controls allowed software license types
#
# Common Settings:
#   "*"                Accept all licenses (Recommended for beginners to avoid license blocks)
#   "@FREE"            Only Free Software (Strict open source policy)
#   "@BINARY-REDISTRIBUTABLE"  Software allowed for free binary redistribution
#   "-* @FREE"         Reject all then explicitly allow (Strictest control)
#
# Recommended Strategy:
#   - Beginner/Desktop: Use "*" to avoid license issues
#   - Open Source Purist: Use "@FREE", set individual packages if closed source needed
#   - Detailed explanation see "13.12 ACCEPT_LICENSE Details" below
ACCEPT_LICENSE="*"

# Specific package license setting (Recommended method):
#    Create /etc/portage/package.license/ directory and add config files
#    See "13.12 ACCEPT_LICENSE Details" below for example

# ========== Portage Feature Settings (Optional) ==========
# FEATURES: Activate advanced Portage features
#   parallel-fetch    Parallel download source packages (Speed up update)
#   parallel-install  Parallel install multiple packages (Experimental, maybe unstable)
#   candy             Beautify emerge output (Color progress bar)
#   ccache            Compilation cache (Requires dev-build/ccache, speeds up recompilation)
#   splitdebug        Split debug info to separate files (Save space, easier debug)
# FEATURES="parallel-fetch candy"

# ========== Compilation Log Settings (Recommended Enable) ==========
# PORTAGE_ELOG_CLASSES: Log levels to record
#   info     General info (Success messages etc.)
#   warn     Warning info (Configuration issues, deprecated operations)
#   error    Error info (Compilation failures, dependency issues)
#   log      Normal log (All output)
#   qa       QA warning (ebuild issues, security warnings)
PORTAGE_ELOG_CLASSES="warn error log qa"

# PORTAGE_ELOG_SYSTEM: Log output method
#   save          Save to /var/log/portage/elog/ (Recommended, for later review)
#   echo          Display in terminal after compilation
#   mail          Send via email (Requires mail system config)
#   syslog        Send to system log
#   custom        Custom handling script
PORTAGE_ELOG_SYSTEM="save"

# Note: File must end with empty line (POSIX standard requirement)
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Configuration Notes**

This is a fully annotated `make.conf` example. In actual use:
1. **Must Adjust**: `MAKEOPTS` (According to your CPU threads), `GENTOO_MIRRORS` (Choose nearby mirror)
2. **Recommended Adjust**: `USE` flags (According to needed desktop environment and features)
3. **Optional Settings**: `FEATURES`, Log settings etc. (Enable as needed)
4. **VIDEO_CARDS / INPUT_DEVICES** moved to [Desktop Configuration](/posts/gentoo-install-desktop/)

</div>

</details>

---

### 13.12 ACCEPT_LICENSE Software License Details

<details>
<summary><b>ACCEPT_LICENSE Software License Management (Click to expand)</b></summary>

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: ACCEPT_LICENSE](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation#Optional:_Configure_the_ACCEPT_LICENSE_variable) · [GLEP 23](https://www.gentoo.org/glep/glep-0023.html) · [License Groups](https://gitweb.gentoo.org/proj/portage.git/tree/cnf/license_groups)

</div>

#### What is ACCEPT_LICENSE?

According to [GLEP 23](https://www.gentoo.org/glep/glep-0023.html), Gentoo allows system administrators to "control the license types of software they install". `ACCEPT_LICENSE` variable determines which licenses Portage allows.

**Why do we need this?**
- Gentoo repository contains thousands of packages involving hundreds of different licenses.
- You might only want to use Free Software (OSI approved) or need to accept certain closed source licenses.
- No need to approve each license one by one —— GLEP 23 introduced **License Groups**.

#### Common License Groups

License groups use `@` prefix to distinguish from individual licenses:

| License Group | Description |
|---------|------|
| `@GPL-COMPATIBLE` | FSF approved GPL compatible licenses |
| `@FSF-APPROVED` | FSF approved free software licenses |
| `@OSI-APPROVED` | OSI approved open source licenses |
| `@FREE` | **All Free Software and Documentation** |
| `@BINARY-REDISTRIBUTABLE` | Licenses allowing binary redistribution (Includes `@FREE`) |
| `@EULA` | End User License Agreements (Often strictly proprietary) |

#### Check Current System Setting

```bash
portageq envvar ACCEPT_LICENSE
```

Output example (Default):
```
@FREE
```

This means system defaults to only allowing `@FREE` group software.

#### Set ACCEPT_LICENSE

Can be set in:

**1. System Global Setting (`/etc/portage/make.conf`)**

```conf
# Accept all licenses (Including closed source)
ACCEPT_LICENSE="*"

# Or: Only Free Software + Redistributable Binaries
ACCEPT_LICENSE="-* @FREE @BINARY-REDISTRIBUTABLE"

# Or: Only Free Software (Default)
ACCEPT_LICENSE="@FREE"
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Recommendation**

- **Beginner/Desktop**: Use `ACCEPT_LICENSE="*"` to avoid license issues.
- **Pure Free Software User**: Use `ACCEPT_LICENSE="@FREE"`, set individual packages if needed.

</div>

**2. Single Package Setting (`/etc/portage/package.license`)**

Some packages may require specific licenses (e.g. Firmware, Graphics Drivers):

```bash
mkdir -p /etc/portage/package.license
```

Edit `/etc/portage/package.license/kernel`:
```conf
# unrar tool
app-arch/unrar unRAR

# Linux Firmware (Contains non-free firmware)
sys-kernel/linux-firmware linux-fw-redistributable

# Intel Microcode
sys-firmware/intel-microcode intel-ucode
```

#### Practical Application

In our `make.conf` example, we used `ACCEPT_LICENSE="*"` (Accept all). If you want strict control:

1. Change `make.conf` to `ACCEPT_LICENSE="@FREE"`
2. When installing software, if blocked by license, Portage will prompt which license is needed.
3. Add exception in `/etc/portage/package.license/` as needed.

Example (Installing proprietary NVIDIA driver):
```
The following license changes are necessary to proceed:
 x11-drivers/nvidia-drivers NVIDIA-r2
```

Solution:
```bash
echo "x11-drivers/nvidia-drivers NVIDIA-r2" >> /etc/portage/package.license/nvidia
```

</details>

---

### 13.13 CPU Instruction Set Optimization (CPU_FLAGS_X86)

<details>
<summary><b>CPU Instruction Set Optimization (CPU_FLAGS_X86) (Click to expand)</b></summary>

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**See also**: [CPU_FLAGS_*](https://wiki.gentoo.org/wiki/CPU_FLAGS_*)

</div>

`CPU_FLAGS_X86` is used by Gentoo to describe "which x86 instruction sets your CPU actually supports". Some packages use it to enable (or disable) corresponding optimizations like AES, AVX, SSE4.2 etc.

- **Quick Setup**: Please follow [Base Part 5.3](/posts/gentoo-install/#53-configure-cpu-instruction-set-optimization).

After completion, you usually see a line in `/etc/portage/make.conf`:
```conf
CPU_FLAGS_X86="aes avx avx2 f16c fma3 mmx mmxext pclmul popcnt rdrand sse sse2 sse3 sse4_1 sse4_2 ssse3"
```

#### Notes

1. **Avoid Duplicate Appends**: `cpuid2cpuflags >> ...` appends to end of file. Remove duplicates if ran multiple times.
2. **Portability**: Do not copy `CPU_FLAGS_X86` across different machines. Run detection on each machine.
3. **Architecture Specific**: Only for x86/amd64.
   - **ARM/RISC-V**: Do NOT set `CPU_FLAGS_X86`. Refer to Wiki for corresponding flags.

</details>

---

### 13.14 Further Reading

- [Gentoo Wiki: make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)
- [Gentoo Wiki: ACCEPT_LICENSE](https://wiki.gentoo.org/wiki/ACCEPT_LICENSE)
- [Gentoo Wiki: USE flag](https://wiki.gentoo.org/wiki/USE_flag)
- [Desktop Config 12.1: VIDEO_CARDS](/posts/gentoo-install-desktop/#121-global-configuration)

---

## 14. Advanced Compilation Optimization [Optional]

To improve subsequent compilation speed, recommended to configure tmpfs and ccache.

### 14.1 Configure tmpfs (In-memory Compilation)

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Tmpfs](https://wiki.gentoo.org/wiki/Tmpfs)

</div>

Mount compilation temporary directory to memory, reducing SSD wear and speeding up compilation.

<details>
<summary><b>Tmpfs Configuration Guide (Click to expand)</b></summary>

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

`size` should not exceed your physical memory size (Recommended to set to half of memory), otherwise may cause system instability.

</div>

Edit `/etc/fstab`, add the following line (size recommended to be half of memory, e.g. 16G):
```fstab
tmpfs   /var/tmp/portage   tmpfs   size=16G,uid=portage,gid=portage,mode=775,noatime   0 0
```
Mount directory:
```bash
mount /var/tmp/portage
```
</details>

### 14.2 Configure ccache (Compilation Cache)

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Ccache](https://wiki.gentoo.org/wiki/Ccache)

</div>

Cache compilation intermediates, speeding up recompilation.
```bash
emerge --ask dev-build/ccache
ccache -M 20G  # Set cache size to 20GB
```

### 14.3 Handle Large Software Compilation (Avoid tmpfs full)

Large software like Firefox, LibreOffice may exhaust tmpfs space during compilation. We can configure Portage to let these specific software use hard disk for compilation.

<details>
<summary><b>Notmpfs Configuration Guide (Click to expand)</b></summary>

1. Create config directories:
   ```bash
   mkdir -p /etc/portage/env
   mkdir -p /var/tmp/notmpfs
   ```

2. Create `notmpfs.conf`:
   ```bash
   echo 'PORTAGE_TMPDIR="/var/tmp/notmpfs"' > /etc/portage/env/notmpfs.conf
   ```

3. Apply config to specific software:
   Edit `/etc/portage/package.env` (Create file if it is a directory):
   ```bash
   vim /etc/portage/package.env
   ```
   Write:
   ```conf
   www-client/chromium notmpfs.conf
   app-office/libreoffice notmpfs.conf
   dev-qt/qtwebengine notmpfs.conf
   ```

</details>

### 14.4 LTO and Clang Optimization

For detailed configuration please refer to **Section 15 Advanced Compilation Optimization**.

---

## 15. LTO and Clang Compilation Optimization (Optional)

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Risk Warning**

LTO will significantly increase compilation time and memory consumption, and may cause some software compilation failures. **Strongly NOT recommended to enable globally**, only recommended to enable for specific software (like browsers).

</div>

### 15.1 Link Time Optimization (LTO)
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [LTO](https://wiki.gentoo.org/wiki/LTO)

</div>

LTO (Link Time Optimization) defers optimization to the linking stage, bringing performance improvements and size reduction.

<details style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; border: 1px solid rgba(59, 130, 246, 0.2);">
<summary style="cursor: pointer; font-weight: bold; color: #1d4ed8;">LTO Pros and Cons Detailed Analysis (Click to expand)</summary>

<div style="margin-top: 1rem;">

**Pros**:
*   Performance improvement (Usually double digits)
*   Binary size reduction
*   Startup time improvement

**Cons**:
*   Compilation time increases 2-3 times
*   Huge memory consumption
*   Stability risk
*   Troubleshooting difficulty

</div>

</details>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Beginner Tip**

If your system is 4-core CPU with 4GB memory, then time spent on compilation may far exceed performance improvement brought by optimization. Please weigh pros and cons according to hardware configuration.

</div>

**1. Enable using USE flags (Most Recommended)**

For large software like Firefox and Chromium, official ebuilds usually provide tested `lto` and `pgo` USE flags:

Enable in `/etc/portage/package.use/browser`:
```text
www-client/firefox lto pgo
www-client/chromium lto pgo  # Note: PGO may not be usable in Wayland environment
```

**USE="lto" Flag Explanation**: Some packages need special fixes to support LTO, can enable `lto` USE flag globally or for specific packages:
```bash
# Enable globally in /etc/portage/make.conf
USE="lto"
```

**2. Enable LTO for Specific Packages (Recommended)**

Create `/etc/portage/env/lto.conf`:
```bash
CFLAGS="${CFLAGS} -flto"
CXXFLAGS="${CXXFLAGS} -flto"
```

Apply in `/etc/portage/package.env`:
```text
www-client/firefox lto.conf
app-editors/vim lto.conf
```

**3. Enable LTO Globally (GCC System)**

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Warning**

Global LTO will cause massive package compilation failures, requiring frequent maintenance of exclusion lists, **NOT recommended for beginners**.

</div>

Edit `/etc/portage/make.conf`:
```bash
# Warnings indicating LTO issues, promote to error
WARNING_FLAGS="-Werror=odr -Werror=lto-type-mismatch -Werror=strict-aliasing"

COMMON_FLAGS="-O2 -pipe -march=native -flto ${WARNING_FLAGS}"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
LDFLAGS="${COMMON_FLAGS} ${LDFLAGS}"

USE="lto"
```

**4. Enable LTO Globally (LLVM/Clang System - Recommend ThinLTO)**

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Default Recommendation**

If using Clang, strongly recommend using ThinLTO (`-flto=thin`) instead of Full LTO (`-flto`). ThinLTO is faster, uses less memory, and supports parallelization.

</div>

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Warning**

If `clang-common` does not have `default-lld` USE flag enabled, MUST add `-fuse-ld=lld` in `LDFLAGS`.

</div>

Edit `/etc/portage/make.conf`:
```bash
WARNING_FLAGS="-Werror=odr -Werror=strict-aliasing"

COMMON_FLAGS="-O2 -pipe -march=native -flto=thin ${WARNING_FLAGS}"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
LDFLAGS="${COMMON_FLAGS} ${LDFLAGS}"

USE="lto"
```

**ThinLTO vs Full LTO**:

| Type | Flag | Pros | Cons | Recommended |
|------|------|------|------|----------|
| **ThinLTO** | `-flto=thin` | Fast, Low Memory, Parallel | Only Clang/LLVM | **Default** (Clang Users) |
| Full LTO | `-flto` | Deeper Optimization | Slow, High Memory, Serial | GCC Users / Extreme Optimization |

**5. Rust LTO Configuration**

**On LLVM System**:
```bash
# Add to /etc/portage/make.conf
RUSTFLAGS="${RUSTFLAGS} -Clinker-plugin-lto"
```

**On GCC System** (Compile Rust with Clang):
Create `/etc/portage/env/llvm-lto.conf`:
```bash
WARNING_FLAGS="-Werror=odr -Werror=strict-aliasing"
COMMON_FLAGS="-march=native -O2 -flto=thin -pipe ${WARNING_FLAGS}"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"

RUSTFLAGS="-C target-cpu=native -C strip=debuginfo -C opt-level=3 \
-Clinker=clang -Clinker-plugin-lto -Clink-arg=-fuse-ld=lld"

LDFLAGS="${COMMON_FLAGS} ${LDFLAGS} -fuse-ld=lld"
CC="clang"
CXX="clang++"
CPP="clang-cpp"
AR="llvm-ar"
NM="llvm-nm"
RANLIB="llvm-ranlib"

USE="lto"
```

Specify for Rust in `/etc/portage/package.env`:
```text
dev-lang/rust llvm-lto.conf
```

### 15.2 Compile with Clang

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Clang](https://wiki.gentoo.org/wiki/Clang)

</div>

**Prerequisite**: Install Clang and LLD
```bash
emerge --ask llvm-core/clang llvm-core/lld
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Important Tip**

- Some packages (like `sys-libs/glibc`, `app-emulation/wine`) cannot compile with Clang and need GCC.
- Gentoo maintains [bug #408963](https://bugs.gentoo.org/408963) tracking packages failing to compile with Clang.

</div>

**1. Enable for Specific Software (Recommended)**

Create environment config `/etc/portage/env/clang.conf`:
```bash
CC="clang"
CXX="clang++"
CPP="clang-cpp"  # Needed by some packages like xorg-server
AR="llvm-ar"
NM="llvm-nm"
RANLIB="llvm-ranlib"
```

Apply to specific software (e.g. `app-editors/neovim`) in `/etc/portage/package.env`:
```text
app-editors/neovim clang.conf
```

**2. PGO Support (Profile Guided Optimization)**

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

If PGO support is needed (e.g. `dev-lang/python[pgo]`), install:

</div>

```bash
emerge --ask llvm-core/clang-runtime
emerge --ask llvm-runtimes/compiler-rt-sanitizers
```

Enable USE flags in `/etc/portage/package.use`:
```text
llvm-core/clang-runtime sanitize
llvm-runtimes/compiler-rt-sanitizers profile orc
```

**3. Enable Globally (Not Recommended for Beginners)**

Globally switching to Clang requires solving many compatibility issues. **Recommended only for advanced users.**

If enabling globally, add to `/etc/portage/make.conf`:
```bash
CC="clang"
CXX="clang++"
CPP="clang-cpp"
AR="llvm-ar"
NM="llvm-nm"
RANLIB="llvm-ranlib"
```

**GCC Fallback Environment**

For packages that fail with Clang, create `/etc/portage/env/gcc.conf`:
```bash
CC="gcc"
CXX="g++"
CPP="gcc -E"
AR="ar"
NM="nm"
RANLIB="ranlib"
```

Specify GCC usage in `/etc/portage/package.env`:
```text
sys-libs/glibc gcc.conf
app-emulation/wine gcc.conf
```

### 15.3 Advanced Package Environment Configuration (package.env)

For package-specific settings (like disabling LTO or low memory mode), `package.env` offers fine-grained control.

<details>
<summary><b>Config 1: Disable LTO List (no-lto) - Click to expand</b></summary>

Some packages are known to be incompatible with LTO. Create `/etc/portage/env/nolto.conf`:

```bash
# Disable LTO and related warnings
DISABLE_LTO="-Wno-error=odr -Wno-error=lto-type-mismatch -Wno-error=strict-aliasing -fno-lto"
CFLAGS="${CFLAGS} ${DISABLE_LTO}"
CXXFLAGS="${CXXFLAGS} ${DISABLE_LTO}"
FCFLAGS="${FCFLAGS} ${DISABLE_LTO}"
FFLAGS="${FFLAGS} ${DISABLE_LTO}"
LDFLAGS="${LDFLAGS} ${DISABLE_LTO}"
```

Create `/etc/portage/package.env/no-lto`:

```bash
# Packages incompatible with LTO
# Still use Clang but disable LTO

app-misc/jq no-lto.conf
app-shells/zsh no-lto.conf
dev-build/ninja no-lto.conf
dev-cpp/abseil-cpp no-lto.conf
# ... (Add more packages as needed)
x11-drivers/nvidia-drivers no-lto.conf
```
</details>

<details>
<summary><b>Config 2: Low Memory Optimization (low-memory) - Click to expand</b></summary>

Create `/etc/portage/env/low-memory.conf`:
```bash
# Reduce parallel tasks
MAKEOPTS="-j4"
COMMON_FLAGS="-O2 -pipe"
```

Create `/etc/portage/package.env/low-memory`:
```bash
# Browsers
www-client/chromium low-memory.conf
# Large projects
dev-lang/rust low-memory.conf
```
</details>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

If encountering LTO link errors, try disabling LTO for that package first. Check [Gentoo Bugzilla](https://bugs.gentoo.org) for existing reports.

</div>

---

## 16. Kernel Compilation Advanced Guide (Optional) {#section-16-kernel-advanced}

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Kernel](https://wiki.gentoo.org/wiki/Kernel) · [Kernel/Configuration](https://wiki.gentoo.org/wiki/Kernel/Configuration) · [Genkernel](https://wiki.gentoo.org/wiki/Genkernel)

</div>

This section is for advanced users who want to deeply control kernel compilation, including using LLVM/Clang compilation, enabling LTO optimization, automation configuration etc.

### 16.1 Preparation

Install necessary tools:
```bash
# Install kernel sources and build tools
emerge --ask sys-kernel/gentoo-sources

# (Optional) Install Genkernel for automation
emerge --ask sys-kernel/genkernel

# (Optional) Required for LLVM/Clang compilation
emerge --ask llvm-core/llvm \
    llvm-core/clang llvm-core/lld
```

### 16.2 Check System Info (Hardware Detection)

Before configuring kernel, understanding your hardware is crucial:

**Check CPU Info**:
```bash
lscpu  # Check CPU model, cores, architecture
cat /proc/cpuinfo | grep "model name" | head -1  # CPU Model
```

**Check PCI Devices (Graphics, Network etc.)**:
```bash
lspci -k  # List all PCI devices and current drivers
lspci | grep -i vga  # Graphics card
lspci | grep -i network  # Network card
```

**Check USB Devices**:
```bash
lsusb  # List all USB devices
```

**Check Loaded Kernel Modules**:
```bash
lsmod  # List currently loaded modules
lsmod | wc -l  # Module count
```

### 16.3 Auto Configure Kernel Based on Current Modules

If you want to keep all hardware support working in current system (e.g. LiveCD):

```bash
cd /usr/src/linux

# Method 1: Create minimal config based on loaded modules
make localmodconfig
# This only enables kernel options for currently loaded modules (Strongly Recommended!)

# Method 2: Create based on running kernel config
zcat /proc/config.gz > .config  # If current kernel supports it
make olddefconfig  # Update config with defaults
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Beginner Tip**

`localmodconfig` is the safest method, ensuring all your hardware works while removing unnecessary drivers.

</div>

### 16.4 Manual Kernel Configuration

**Enter Configuration Interface**:
```bash
cd /usr/src/linux
make menuconfig  # Text interface (Recommended)
```

**Common Options Reference**:

| Option | Description | Key Settings |
| :--- | :--- | :--- |
| **General setup** | General settings | Hostname, Systemd/OpenRC support |
| **Processor type and features** | CPU setup | CPU model, Microcode |
| **Power management and ACPI options** | Power management | Laptop power, Suspend/Hibernate |
| **Bus options (PCI etc.)** | Bus options | PCI support (lspci) |
| **Virtualization** | Virtualization | KVM, VirtualBox Host/Guest |
| **Enable loadable module support** | Module support | Enable kernel modules (*.ko) |
| **Networking support** | Network | TCP/IP stack, Firewall (Netfilter) |
| **Device Drivers** | Device Drivers | GPU, NIC, Sound, USB, NVMe |
| **File systems** | File systems | ext4, btrfs, vfat, ntfs |
| **Security options** | Security | SELinux, AppArmor |
| **Gentoo Linux** | Gentoo specific | Portage dependency auto selection (Recommended) |

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Important Suggestion**

For manual compilation, recommended to compile **critical drivers** (Filesystem, Disk Controller, Network Card) directly into kernel (`[*]` or `<*>` i.e. `=y`), instead of as modules (`<M>` i.e. `=m`). This avoids unbootable issues due to missing modules in initramfs.

</div>

**Required Options** (Depends on your system):

1. **Processor Support**:
   - `General setup → Gentoo Linux support`
   - `Processor type and features → Processor family` (Select your CPU)

2. **File Systems**:
   - `File systems → The Extended 4 (ext4) filesystem` (If using ext4)
   - `File systems → Btrfs filesystem` (If using Btrfs)

3. **Device Drivers**:
   - `Device Drivers → Network device support` (NIC drivers)
   - `Device Drivers → Graphics support` (Graphics drivers)

4. **Systemd Users Required**:
   - `General setup → Control Group support`
   - `General setup → Namespaces support`

5. **Gentoo Linux Specific Options** (Recommend Enable All):
     Enter `Gentoo Linux --->` menu:
     ```
   [*] Gentoo Linux support
       Enable Gentoo specific kernel features
     [*] Linux dynamic and persistent device naming (userspace devfs) support
       Enable udev support (Required)
     [*] Select options required by Portage features
       Auto enable kernel options required by Portage (Strongly Recommended)
       This auto configures required filesystems and features
     Support for init systems, system and service managers --->
       ├─ [*] OpenRC support  # If using OpenRC
       └─ [*] systemd support # If using systemd
     [*] Kernel Self Protection Project
       Enable kernel self protection mechanisms
     [*] Print firmware information that the kernel attempts to load
       Show firmware load info at boot (For debugging)
   ```

 <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Beginner Tip**

Enabling "Select options required by Portage features" automatically configures most required options, highly recommended!

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

In menuconfig, press `/` to search options, press `?` for help.

</div>

### 16.5 Auto Enable Recommended Options

Gentoo provides scripts to auto configure common hardware and features:

```bash
cd /usr/src/linux

# Use Genkernel default config (Includes most hardware support)
genkernel --kernel-config=/usr/share/genkernel/arch/x86_64/kernel-config all

# Or use distro default as base
make defconfig  # Kernel default config
# Then adjust as needed
make menuconfig
```

### 16.6 Compile Kernel with LLVM/Clang

Using LLVM/Clang to compile kernel can get better optimization and faster build speed (Supports ThinLTO).

**Method 1: Specify Compiler** (One-time):
```bash
cd /usr/src/linux

# Compile with Clang
make LLVM=1 -j$(nproc)

# Compile with Clang + LTO (Recommended)
make LLVM=1 LLVM_IAS=1 -j$(nproc)
```

**Method 2: Environment Variables** (Permanent):
Add to `/etc/portage/make.conf` (Only affects kernel build):
```bash
# Compile kernel with LLVM/Clang
KERNEL_CC="clang"
KERNEL_LD="ld.lld"
```

**Enable Kernel LTO Support**:
In `make menuconfig`:
```
General setup
  → Compiler optimization level → Optimize for performance  # Select -O2 (Recommended)
  → Link Time Optimization (LTO) → Clang ThinLTO (NEW)      # Enable ThinLTO (Strongly Recommended)
```

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important Warning: Strongly Do NOT use Full LTO for Kernel!**

*   Full LTO causes extremely slow compilation (Hours)
*   Massive memory usage (Needs 16GB+ RAM)
*   Prone to link errors
*   **Must use ThinLTO**, faster, more stable, less memory

</div>

### 16.7 Kernel Compilation Optimization

<details>
<summary><b>Advanced Compilation Optimization (Click to expand)</b></summary>

**Enable in `menuconfig`**:

```
General setup
  → Compiler optimization level
     → [*] Optimize for performance (-O2)  # Or -O3, but may be unstable

  → Link Time Optimization (LTO)
     → [*] Clang ThinLTO                   # Requires LLVM=1

Kernel hacking
  → Compile-time checks and compiler options
     → [*] Optimize harder
```

**Kernel Compression** (Affects boot speed and size):

```
General setup
  → Kernel compression mode
     → [*] ZSTD  # Recommended: High compression ratio and fast decompression
     # Others: LZ4 (Fastest), XZ (Smallest), GZIP (Best compatibility)
```

</details>

### 16.8 Build and Install Kernel

**Manual Compilation**:
```bash
cd /usr/src/linux

# Compile kernel and modules
make -j$(nproc)         # Use all CPU cores
make modules_install    # Install modules to /lib/modules/
make install            # Install kernel to /boot/

# (Optional) Use LLVM/Clang + LTO
make LLVM=1 -j$(nproc)
make LLVM=1 modules_install
make LLVM=1 install
```

**Use Genkernel Automation**:
```bash
# Basic usage
genkernel --install all

# Use LLVM/Clang
genkernel --kernel-cc=clang --utils-cc=clang --install all

# Enable LTO (Needs manual .config)
genkernel --kernel-make-opts="LLVM=1" --install all
```

### 16.9 Kernel Statistics and Analysis

After compilation, use script to check stats:

```bash
cd /usr/src/linux

echo "=== Kernel Stats ==="
echo "Built-in: $(grep -c '=y$' .config)"
echo "Modules: $(grep -c '=m$' .config)"
echo "Total Configs: $(wc -l < .config)"
echo "Kernel Size: $(ls -lh arch/x86/boot/bzImage 2>/dev/null | awk '{print $5}')"
echo "Compression: $(grep '^CONFIG_KERNEL_' .config | grep '=y' | sed 's/CONFIG_KERNEL_//;s/=y//')"
```

**Example Output**:
```
=== Kernel Stats ===
Built-in: 1723
Modules: 201
Total Configs: 6687
Kernel Size: 11M
Compression: ZSTD
```

**Interpretation**:
- **Built-in**: Number of features compiled into kernel
- **Modules**: Number of drivers as loadable modules
- **Kernel Size**: Final kernel file size (After ZSTD compression)

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Optimization Suggestion**

*   Kernel Size < 15MB: Excellent (Minimal config)
*   Kernel Size 15-30MB: Good (Standard config)
*   Kernel Size > 30MB: Consider disabling unused features

</div>

### 16.10 Troubleshooting

<details>
<summary><b>Compilation Errors and Solutions (Click to expand)</b></summary>

**Error 1: Missing Dependency**
```
*** No rule to make target 'debian/canonical-certs.pem'
```
Solution: Disable signing keys
```bash
scripts/config --disable SYSTEM_TRUSTED_KEYS
scripts/config --disable SYSTEM_REVOCATION_KEYS
make olddefconfig
```

**Error 2: LTO Compilation Fail**
```
ld.lld: error: undefined symbol
```
Solution: Some modules usually incompatible with LTO, disable LTO or set problematic module to `=y` (instead of `=m`)

**Error 3: Clang version too old**
```
error: unknown argument: '-mretpoline-external-thunk'
```
Solution: Upgrade LLVM/Clang or use GCC

</details>

### 16.11 Kernel Config Best Practices

1. **Backup Config**:
   ```bash
   # Backup current config
   cp .config ~/kernel-config-backup
     # Restore
   cp ~/kernel-config-backup /usr/src/linux/.config
   make olddefconfig
   ```

2. **Diff Configs**:
   ```bash
   # Compare two configs
   scripts/diffconfig .config ../old-kernel/.config
   ```

3. **Minimize Config** (Only essential features):
   ```bash
   make tinyconfig  # Create minimal config
   make localmodconfig  # Add current hardware support
   ```

---

## 17. Server and RAID Configuration (Optional) {#section-17-server-raid}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Wiki: Mdadm](https://wiki.gentoo.org/wiki/Mdadm)

</div>

This section is for server users needing Soft RAID (mdadm).

### 17.1 Kernel Configuration (Manual Compile Required)

If manually compiling, MUST enable: (**Note: MUST compile into kernel `<*>` i.e. `=y`, NOT module `<M>`**)

```
Device Drivers  --->
    <*> Multiple devices driver support (RAID and LVM)
        <*> RAID support
            [*] Autodetect RAID arrays during kernel boot

            # Select based on your RAID level (Must be Y):
            <*> Linear (append) mode                   # Linear
            <*> RAID-0 (striping) mode                 # RAID 0
            <*> RAID-1 (mirroring) mode                # RAID 1
            <*> RAID-10 (mirrored striping) mode       # RAID 10
            <*> RAID-4/RAID-5/RAID-6 mode              # RAID 5/6
```

### 17.2 Configure Dracut to Load RAID Modules (Dist-kernel Required)

If using `dist-kernel` (Distribution Kernel) or RAID drivers as modules, **MUST** force load RAID drivers via Dracut, otherwise boot will fail.

<details>
<summary><b>Dracut RAID Config Guide (Click to expand)</b></summary>

**1. Enable mdraid support**
Create `/etc/dracut.conf.d/mdraid.conf`:
```bash
# Enable mdraid support for RAID arrays
add_dracutmodules+=" mdraid "
mdadmconf="yes"
```

**2. Force Load RAID Drivers**
Create `/etc/dracut.conf.d/raid-modules.conf`:
```bash
# Ensure RAID modules are included and loaded
add_drivers+=" raid1 raid0 raid10 raid456 "
force_drivers+=" raid1 "
# Install modprobe configuration
install_items+=" /usr/lib/modules-load.d/ /etc/modules-load.d/ "
```

**3. Configure Kernel Command Line (UUID)**
Need to find RAID UUID and add to kernel args.
Create `/etc/dracut.conf.d/mdraid-cmdline.conf`:
```bash
# Kernel command line parameters for RAID arrays
# Replace with your actual RAID UUID (Check via mdadm --detail --scan)
kernel_cmdline="rd.md.uuid=68b53b0a:c6bd2ca0:caed4380:1cd75aeb rd.md.uuid=c8f92d69:59d61271:e8ffa815:063390ed"
```

**4. Regenerate initramfs**
```bash
dracut --force
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Check if `/boot/initramfs-*.img` contains RAID modules:

</div>
> `lsinitrd /boot/initramfs-*.img | grep raid`

</details>

---

## 18. Secure Boot Configuration (Optional) {#section-18-secure-boot}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: Secure Boot](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation#Alternative:_Secure_Boot) · [Signed kernel module support](https://wiki.gentoo.org/wiki/Signed_kernel_module_support)

</div>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**What is Secure Boot?**

Secure Boot is a UEFI firmware security feature that prevents unauthorized code execution at boot time by verifying digital signatures of bootloader and kernel.

**Why configure it?**

Gentoo default installation **does not support Secure Boot**. If your motherboard has Secure Boot enabled, system will not boot. This section introduces how to configure Secure Boot.

</div>

### 18.1 Manage using sbctl (Recommended) {#sbctl}

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**sbctl** is a Secure Boot management tool, automating key generation, signing, and enrollment.

</div>

**Step 1: Install sbctl**

```bash
emerge --ask app-crypt/sbctl
```

**Step 2: Check current status**

```bash
sbctl status
```

Expected (Before install):
```
Installed:	✘ Sbctl is not installed
Setup Mode:	✘ Enabled
Secure Boot:	✘ Disabled
```

<details>
<summary><b>What if Setup Mode is Disabled?</b></summary>

**Setup Mode** allows modifying Secure Boot keys. If `Disabled`:

**Method 1: Clear existing keys (Recommended)**
In BIOS/UEFI settings find:
- **Clear Secure Boot Keys**
- **Reset to Setup Mode**
- **Delete All Keys**

**Verify Setup Mode**
Reboot and check again:
```bash
sbctl status
```
Confirm `Setup Mode: ✘ Enabled`.

</details>

**Step 3: Generate Keys (Auto)**

```bash
sbctl create-keys
```

**Step 4: Enroll Keys to UEFI**

```bash
sbctl enroll-keys -m
```

- `-m`: **Keep Microsoft Vendor Keys** (Recommended for Windows/Other OS compatibility)

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1rem 0;">

**Warning**

If using iGPU (Integrated Graphics) without discrete GPU option ROM requiring MS signature (rare nowadays but possible), verify compatibility. Usually `-m` is safe.
If NO iGPU and NO Windows, you can omit `-m` for strict mode (Not recommended for beginners).

</div>

**Step 5: Configure Portage Auto Signing**

Edit `/etc/portage/make.conf`:

```bash
# Secure Boot: Auto sign with sbctl keys
USE="${USE} secureboot modules-sign"

MODULES_SIGN_KEY="/var/lib/sbctl/keys/db/db.key"
MODULES_SIGN_CERT="/var/lib/sbctl/keys/db/db.pem"
SECUREBOOT_SIGN_KEY="/var/lib/sbctl/keys/db/db.key"
SECUREBOOT_SIGN_CERT="/var/lib/sbctl/keys/db/db.pem"
```

**Step 6: Recompile Kernel**

```bash
emerge --ask sys-kernel/gentoo-kernel-bin
```

**Step 7: Sign Bootloader**

Depending on your bootloader:

<details>
<summary><b>GRUB</b></summary>

```bash
sbctl sign -s /efi/EFI/gentoo/grubx64.efi
```
</details>

<details>
<summary><b>systemd-boot</b></summary>

```bash
sbctl sign -s /efi/EFI/systemd/systemd-bootx64.efi
```
</details>

<details>
<summary><b>Unified Kernel Image (UKI)</b></summary>

```bash
sbctl sign -s /efi/EFI/Linux/gentoo-*.efi
```
</details>

**Step 8: Verify Signatures**

```bash
sbctl verify
```

**Step 9: Enable Secure Boot**

1. Reboot into BIOS/UEFI
2. Set **Secure Boot** to **Enabled**
3. Save and Reboot

**Step 10: Confirm Status**

```bash
sbctl status
```
Success output: `Secure Boot: ✓ Enabled`

---

### 18.2 Advanced: Manual OpenSSL Method (Optional)

<details>
<summary><b>Expand to view Manual Config (For Advanced/Enterprise Users)</b></summary>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Use Case**
- Custom certificate parameters
- Enterprise PKI integration
- Learning internals

**Skip if using sbctl.**

</div>

#### 18.2.1 Generate Self-Signed Cert

**Step 1: Install tools**
```bash
emerge --ask app-crypt/sbsigntools sys-apps/kmod[openssl]
```

**Step 2: Generate Certs**
```bash
mkdir -p /etc/kernel/certs
cd /etc/kernel/certs

# Generate Private Key
openssl req -new -x509 -newkey rsa:2048 -keyout MOK.key -out MOK.crt \
  -days 36500 -nodes -subj "/CN=My Kernel Signing Key/"

# Convert to DER
openssl x509 -in MOK.crt -outform DER -out MOK.der

# Permissions
chmod 600 MOK.key
```

#### 18.2.2 Configure Kernel Module Signing

**Step 1: Enable Support**
`/etc/portage/package.use/kernel`:
```bash
virtual/dist-kernel modules-sign
sys-kernel/installkernel dracut
```

**Step 2: Configure Paths**
`/etc/portage/make.conf`:
```bash
MODULES_SIGN_KEY="/etc/kernel/certs/MOK.key"
MODULES_SIGN_CERT="/etc/kernel/certs/MOK.der"
MODULES_SIGN_HASH="sha512"
```

**Step 3: Recompile**
```bash
emerge --ask @module-rebuild
emerge --ask sys-kernel/gentoo-kernel-bin
```

#### 18.2.4 Enroll MOK (Machine Owner Key)

**Step 1: Install Shim**
```bash
emerge --ask sys-boot/shim
```

**Step 2: Copy Shim**
```bash
cp /usr/share/shim/shimx64.efi /efi/EFI/gentoo/
cp /usr/share/shim/mmx64.efi /efi/EFI/gentoo/
```

**Step 3: Import Cert**
```bash
mokutil --import /etc/kernel/certs/MOK.der
```
Set temporary password.

**Step 4: Create Boot Entry**
Use `efibootmgr` to point to `shimx64.efi`.

**Step 5: Reboot and Enroll**
In MOK Manager (Blue screen after reboot):
**Enroll MOK** → **Continue** → **Yes** → Enter password → **Reboot**.

</details>

---

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Secure Boot Summary**

- **Beginners**: Use **sbctl** (Section 18.1)
- **Advanced**: Use **Manual OpenSSL** (Section 18.2)

</div>

---

## References {#reference}

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Official Docs

- **[Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)**
- [Gentoo Wiki](https://wiki.gentoo.org/)
- [Portage Documentation](https://wiki.gentoo.org/wiki/Portage)

</div>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Community Support

**Gentoo Chinese Community**:
- Telegram: [@gentoo_zh](https://t.me/gentoo_zh)
- Telegram Channel: [@gentoocn](https://t.me/gentoocn)
- [GitHub](https://github.com/gentoo-zh)

**Official Community**:
- [Gentoo Forums](https://forums.gentoo.org/)
- IRC: `#gentoo` @ [Libera.Chat](https://libera.chat/)

</div>

</div>

## Conclusion

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; text-align: center;">

### Enjoy Freedom and Flexibility in Gentoo!

This guide is based on official Handbook and simplifies the process, marking optional steps so more users can try it easily.

</div>
