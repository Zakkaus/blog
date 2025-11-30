---
title: "Gentoo Linux Installation Guide (Advanced Optimization)"
slug: gentoo-install-advanced
aliases:
  - /posts/gentoo-optimization/
translationKey: gentoo-install-advanced
date: 2025-11-25
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

> **Special Note**
> 
> This article is Part 3 of the **Gentoo Linux Installation Guide**: **Advanced Optimization**.
> 
> **Series Navigation**:
> 1. [Base Installation](/posts/gentoo-install/): Installing Gentoo base system from scratch
> 2. [Desktop Configuration](/posts/gentoo-install-desktop/): Graphics drivers, desktop environments, input methods, etc.
> 3. **Advanced Optimization (This Article)**: make.conf optimization, LTO, system maintenance
>
> **Previous Step**: [Desktop Configuration](/posts/gentoo-install-desktop/)

> **Image Credit**: [Pixiv](https://www.pixiv.net/artworks/115453639)

## 13. make.conf Advanced Configuration Guide

> **Reference**: [make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

`/etc/portage/make.conf` is Gentoo's global configuration file, controlling compiler, optimization parameters, USE flags, etc.

#### 1. Compiler Configuration

**Basic Configuration (Recommended)**
```bash
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"   # Fortran
FFLAGS="${COMMON_FLAGS}"    # Fortran 77
```

**Parameter Explanation**:
- `-march=native`: Optimize for current CPU (Recommended)
- `-O2`: Optimization level 2 (Balance performance and stability)
- `-pipe`: Use pipes to speed up compilation

#### 2. Parallel Compilation Configuration

```bash
MAKEOPTS="-j<Cores> -l<LoadLimit>"
EMERGE_DEFAULT_OPTS="--jobs=<ParallelPackages> --load-average=<Load>"
```

**Recommended Values**:
- **4 Cores / 8 Threads**: `MAKEOPTS="-j8 -l8"`, `EMERGE_DEFAULT_OPTS="--jobs=2"`
- **8 Cores / 16 Threads**: `MAKEOPTS="-j16 -l16"`, `EMERGE_DEFAULT_OPTS="--jobs=4"`
- **16 Cores / 32 Threads**: `MAKEOPTS="-j32 -l32"`, `EMERGE_DEFAULT_OPTS="--jobs=6"`

#### 3. USE Flags Configuration

```bash
# Basic USE Example
USE="systemd dbus policykit"
USE="${USE} wayland X gtk qt6"
USE="${USE} pulseaudio alsa"
USE="${USE} -doc -test"
```

**Common USE Flags**:
| Category | USE Flag | Description |
| ---- | -------- | ---- |
| **System** | `systemd` / `openrc` | init system |
| **Desktop** | `wayland`, `X`, `gtk`, `qt6` | Desktop protocols and toolkits |
| **Audio** | `pipewire`, `pulseaudio`, `alsa` | Audio system |
| **Video** | `ffmpeg`, `x264`, `vpx` | Video codecs |
| **I18n** | `nls`, `icu` | Localization support |
| **Disable** | `-doc`, `-test`, `-examples` | Disable unnecessary features |


#### 4. Language Configuration

```bash
L10N="en en-US"
LINGUAS="en en_US"
```

#### 5. Hardware Configuration

```bash
# Graphics Card
VIDEO_CARDS="nvidia"        # NVIDIA
# VIDEO_CARDS="amdgpu"      # AMD
# VIDEO_CARDS="intel"       # Intel

# Input Devices
INPUT_DEVICES="libinput"

# CPU Features (Auto detect, run: emerge --ask app-portage/cpuid2cpuflags)
CPU_FLAGS_X86="<cpuid2cpuflags output>"
```

> See: [5.3 CPU Instruction Set Optimization (CPU_FLAGS_X86)](/posts/gentoo-install/#step-5-portage)

#### 6. Portage Features

```bash
FEATURES="parallel-fetch parallel-install candy ccache"
```

**Common FEATURES**:
- `parallel-fetch`: Parallel download
- `parallel-install`: Parallel install
- `candy`: Beautify output
- `ccache`: Compilation cache (Requires `dev-build/ccache`)

#### 7. Complete Configuration Example

**Newcomer Recommended Config**:
```bash
# /etc/portage/make.conf
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"

MAKEOPTS="-j4 -l4"  # Adjust according to CPU

USE="systemd wayland pipewire -doc -test"


L10N="en en-US"
VIDEO_CARDS="intel"  # Or nvidia/amdgpu

FEATURES="parallel-fetch candy"
ACCEPT_LICENSE="*"
```

### 13.1 Daily Maintenance: How to be a Qualified Sysadmin

> **Reference**: [Upgrading Gentoo](https://wiki.gentoo.org/wiki/Upgrading_Gentoo) and [Gentoo Cheat Sheet](https://wiki.gentoo.org/wiki/Gentoo_Cheat_Sheet)

Gentoo is a rolling release distribution, maintaining the system is an important part of the user experience.

**1. Keep System Updated**
Recommended to update system every one to two weeks to avoid accumulating too many updates causing dependency conflicts.
```bash
emerge --sync              # Sync software repository
emerge -avuDN @world       # Update all software
```

**2. Check Official News (Important)**
Before updating or when encountering issues, be sure to check if there are official news pushes.
```bash
eselect news list          # List news
eselect news read          # Read news
```

**3. Handle Config File Updates**
After software updates, configuration files might also update. **Do not ignore** `etc-update` or `dispatch-conf` prompts.
```bash
dispatch-conf              # Interactive config merge (Recommended)
# Or
etc-update
```

**4. Clean Unused Dependencies**
> **Reference**: [Remove orphaned packages](https://wiki.gentoo.org/wiki/Knowledge_Base:Remove_orphaned_packages)

```bash
emerge --ask --depclean    # Remove orphaned dependencies no longer needed
```

**5. Regularly Clean Source Packages**
```bash
emerge --ask app-portage/gentoolkit # Install toolkit
eclean-dist                         # Clean old downloaded source packages
```

**6. Automatically Handle USE Changes**
> **Reference**: [Autounmask-write](https://wiki.gentoo.org/wiki/Knowledge_Base:Autounmask-write) and [Dispatch-conf](https://wiki.gentoo.org/wiki/Dispatch-conf)

When install or update prompts "The following USE changes are necessary":
1.  **Let Portage auto-write config**: `emerge --ask --autounmask-write <package>`
2.  **Confirm and update config**: `dispatch-conf` (Press u to confirm, q to exit)
3.  **Try operation again**: `emerge --ask <package>`

**7. Handle Software Conflicts (Blocked Packages)**
If encountering "Error: The above package list contains packages which cannot be installed at the same time...":
- **Solution**: According to prompt, manually uninstall conflicting software (`emerge --deselect <package>` then `emerge --depclean`).

**8. Security Check (GLSA)**
Gentoo publishes Security Announcements (GLSA) to notify users of potential security vulnerabilities.
```bash
glsa-check -l      # List all unfixed security announcements
glsa-check -t all  # Test all affected packages
```

**9. System Logs and Service Status**
Regularly check system logs and service status to ensure system health.
- **OpenRC**:
    ```bash
    rc-status      # View service status
    tail -f /var/log/messages # View system log (Need syslog-ng etc.)
    ```
- **Systemd (Journalctl Common Commands)**:
    | Command | Effect |
    | ---- | ---- |
    | `systemctl --failed` | View failed services |
    | `journalctl -b` | View logs of this boot |
    | `journalctl -b -1` | View logs of last boot |
    | `journalctl -f` | Follow latest logs (Like tail -f) |
    | `journalctl -p err` | Show only Error level logs |
    | `journalctl -u <service>` | View logs of specific service |
    | `journalctl --since "1 hour ago"` | View logs of last 1 hour |
    | `journalctl --disk-usage` | View disk usage of logs |
    | `journalctl --vacuum-time=2weeks` | Clean logs older than 2 weeks |

### 13.2 Portage Tips and Directory Structure

> **Reference**: [Portage](https://wiki.gentoo.org/wiki/Portage) and [/etc/portage](https://wiki.gentoo.org/wiki//etc/portage)

**1. Core Directory Structure (`/etc/portage/`)**
Gentoo configuration is very flexible, recommended to use **directories** instead of single files to manage config:

| File/Directory | Usage |
| --------- | ---- |
| `make.conf` | Global compilation parameters (CFLAGS, MAKEOPTS, USE, GENTOO_MIRRORS) |
| `package.use/` | USE flag config for specific software |
| `package.accept_keywords/` | Allow installing testing version (keyword) software |
| `package.mask/` | Mask specific version software |
| `package.unmask/` | Unmask specific version software |
| `package.license/` | Accept specific software licenses |
| `package.env/` | Environment variables for specific software (e.g., use different compiler flags) |

**2. Common Emerge Command Cheat Sheet**
> Full manual please run `man emerge`

| Parameter (Abbr) | Effect | Example |
| ----------- | ---- | ---- |
| `--ask` (`-a`) | Ask confirmation before execution | `emerge -a vim` |
| `--verbose` (`-v`) | Show detailed info (USE flags etc.) | `emerge -av vim` |
| `--oneshot` (`-1`) | Install but don't add to World file | `emerge -1 rust` |
| `--update` (`-u`) | Update package | `emerge -u vim` |
| `--deep` (`-D`) | Deep dependency calculation | `emerge -uD @world` |
| `--newuse` (`-N`) | Recompile when USE flags change | `emerge -uDN @world` |
| `--depclean` (`-c`) | Clean unused orphaned dependencies | `emerge -c` |
| `--deselect` | Remove from World file (Don't uninstall) | `emerge --deselect vim` |
| `--search` (`-s`) | Search package (Recommend eix) | `emerge -s vim` |
| `--info` | Show Portage environment info (Debug) | `emerge --info` |

**3. Fast Package Search (Eix)**
> **Reference**: [Eix](https://wiki.gentoo.org/wiki/Eix)
> `emerge --search` is slow, recommended to use `eix` for millisecond-level search.

1.  **Install and Update Index**:
    ```bash
    emerge --ask app-portage/eix
    eix-update # Execute after install or sync
    ```
2.  **Search Software**:
    ```bash
    eix <keyword>        # Search all software
    eix -I <keyword>     # Search installed software only
    eix -R <keyword>     # Search remote Overlay (Need eix-remote config)
    ```

---

## 14. Advanced Compilation Optimization [Optional]

To improve subsequent compilation speed, recommended to configure tmpfs and ccache.

### 14.1 Configure tmpfs (In-memory Compilation)

> **Reference**: [Tmpfs](https://wiki.gentoo.org/wiki/Tmpfs)

Mount compilation temp directory to memory, reducing SSD wear and speeding up compilation.

<details>
<summary><b>Tmpfs Configuration Guide (Click to Expand)</b></summary>

> **Note**: `size` should not exceed your physical memory size (recommended half of memory), otherwise system might become unstable.

Edit `/etc/fstab`, add following line (size recommended half of memory, e.g., 16G):
```fstab
tmpfs   /var/tmp/portage   tmpfs   size=16G,uid=portage,gid=portage,mode=775,noatime   0 0
```
Mount directory:
```bash
mount /var/tmp/portage
```
</details>

### 14.2 Configure ccache (Compilation Cache)

> **Reference**: [Ccache](https://wiki.gentoo.org/wiki/Ccache)

Cache compilation intermediates, speeding up recompilation.
```bash
emerge --ask dev-build/ccache
ccache -M 20G  # Set cache size to 20GB
```

### 14.3 Handle Large Software Compilation (Avoid tmpfs full)

Large software like Firefox, LibreOffice might exhaust tmpfs space during compilation. We can configure Portage to let these specific software use hard disk for compilation.

<details>
<summary><b>Notmpfs Configuration Guide (Click to Expand)</b></summary>

1. Create config directory:
   ```bash
   mkdir -p /etc/portage/env
   mkdir -p /var/tmp/notmpfs
   ```

2. Create `notmpfs.conf`:
   ```bash
   echo 'PORTAGE_TMPDIR="/var/tmp/notmpfs"' > /etc/portage/env/notmpfs.conf
   ```

3. Apply config to specific software:
   Edit `/etc/portage/package.env` (Create file if it's a directory):
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

Detailed configuration please refer to **Section 15 Advanced Compilation Optimization**.

---

## 15. LTO and Clang Compilation Optimization (Optional)

> **Risk Warning**: LTO will significantly increase compilation time and memory consumption, and may cause some software compilation failures. **Strongly not recommended to enable globally**, only recommended for specific software (like browsers).

### 15.1 Link Time Optimization (LTO)
> **Reference**: [LTO](https://wiki.gentoo.org/wiki/LTO)

LTO (Link Time Optimization) defers optimization to linking stage, bringing performance improvement and size reduction.

<details>
<summary><b>LTO Pros & Cons Detailed Analysis (Click to Expand)</b></summary>

**Pros**:
- Performance improvement (Usually double digits)
- Binary size reduction
- Startup time improvement

**Cons**:
- Compilation time increases 2-3 times
- Huge memory consumption
- Stability risks
- Troubleshooting difficulties

</details>

> **Newcomer Tip**: If your system is 4-core CPU with 4GB RAM, time spent on compilation might far exceed performance gain from optimization. Please weigh pros and cons based on hardware config.

**1. Enable via USE Flag (Most Recommended)**

For large software like Firefox and Chromium, official ebuilds usually provide tested `lto` and `pgo` USE flags:

Enable in `/etc/portage/package.use/browser`:
```text
www-client/firefox lto pgo
www-client/chromium lto pgo  # Note: PGO might not work under Wayland environment
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

> **Warning**: Global LTO will cause massive package compilation failures, requiring frequent maintenance of exclusion list, **not recommended for beginners**.

Edit `/etc/portage/make.conf`:
```bash
# These warnings indicate runtime issues LTO might cause, promote to error
# -Werror=odr: One Definition Rule violation (Multiple definition of same symbol)
# -Werror=lto-type-mismatch: LTO type mismatch
# -Werror=strict-aliasing: Strict aliasing violation
WARNING_FLAGS="-Werror=odr -Werror=lto-type-mismatch -Werror=strict-aliasing"

# -O2: Optimization level 2 (Recommended)
# -pipe: Use pipes to speed up compilation
# -march=native: Optimize for current CPU
# -flto: Enable Link Time Optimization (Full LTO)
# Note: GCC's -flto defaults to Full LTO, suitable for GCC systems
COMMON_FLAGS="-O2 -pipe -march=native -flto ${WARNING_FLAGS}"
CFLAGS="${COMMON_FLAGS}"          # C compiler flags
CXXFLAGS="${COMMON_FLAGS}"        # C++ compiler flags
FCFLAGS="${COMMON_FLAGS}"         # Fortran compiler flags
FFLAGS="${COMMON_FLAGS}"          # Fortran 77 compiler flags
LDFLAGS="${COMMON_FLAGS} ${LDFLAGS}"  # Linker flags

USE="lto"  # Enable USE flag for LTO support
```

**4. Enable LTO Globally (LLVM/Clang System - Recommend ThinLTO)**

> **Default Recommendation**: If using Clang, strongly recommend using ThinLTO (`-flto=thin`) instead of Full LTO (`-flto`). ThinLTO is faster, uses less memory, supports parallelization.

> **Warning**: If `clang-common` does not enable `default-lld` USE flag, must add `-fuse-ld=lld` to `LDFLAGS`.

Edit `/etc/portage/make.conf`:
```bash
# Clang has not fully implemented these diagnostics yet, but keep flags for future use
# -Werror=odr: One Definition Rule violation detection (Clang partially supports)
# -Werror=strict-aliasing: Strict aliasing violation detection (Clang developing)
WARNING_FLAGS="-Werror=odr -Werror=strict-aliasing"

# -O2: Optimization level 2 (Balance performance and stability)
# -pipe: Use pipes to speed up compilation
# -march=native: Optimize for current CPU
# -flto=thin: Enable ThinLTO (Recommended, fast and parallel)
COMMON_FLAGS="-O2 -pipe -march=native -flto=thin ${WARNING_FLAGS}"
CFLAGS="${COMMON_FLAGS}"          # C compiler flags
CXXFLAGS="${COMMON_FLAGS}"        # C++ compiler flags
FCFLAGS="${COMMON_FLAGS}"         # Fortran compiler flags
FFLAGS="${COMMON_FLAGS}"          # Fortran 77 compiler flags
LDFLAGS="${COMMON_FLAGS} ${LDFLAGS}"  # Linker flags

USE="lto"  # Enable USE flag for LTO support
```

**ThinLTO vs Full LTO (Recommended for Newcomers)**:

| Type | Flag | Pros | Cons | Recommended Scenario |
|------|------|------|------|----------|
| **ThinLTO** | `-flto=thin` | • Fast<br>• Low memory usage<br>• Supports parallelization<br>• Compilation speed up 2-3x | • Only Clang/LLVM supports | **Default Recommended** (Clang Users) |
| Full LTO | `-flto` | • Deeper optimization<br>• Both GCC and Clang support | • Slow<br>• High memory usage<br>• Serial processing | GCC Users or need extreme optimization |

> **Newcomer Tip**: If you use Clang, please be sure to use `-flto=thin`. This is current best practice, significantly reducing compilation time while ensuring performance.

**5. Rust LTO Configuration**

**On LLVM System**:
```bash
# Add to /etc/portage/make.conf
RUSTFLAGS="${RUSTFLAGS} -Clinker-plugin-lto"
```

**On GCC System** (Need to use Clang to compile Rust code):
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

Specify for Rust packages in `/etc/portage/package.env`:
```text
dev-lang/rust llvm-lto.conf
```

### 15.3 Advanced Package Environment Configuration (package.env)

For special configuration of specific packages (like disabling LTO or low memory mode), use `package.env` for fine-grained control.

<details>
<summary><b>Config 1: Packages with LTO Disabled (no-lto) - Click to Expand</b></summary>

Some packages are known to be incompatible with LTO. Recommended to create `/etc/portage/env/nolto.conf`:

```bash
# Disable LTO and related warnings
DISABLE_LTO="-Wno-error=odr -Wno-error=lto-type-mismatch -Wno-error=strict-aliasing -fno-lto"
CFLAGS="${CFLAGS} ${DISABLE_LTO}"
CXXFLAGS="${CXXFLAGS} ${DISABLE_LTO}"
FCFLAGS="${FCFLAGS} ${DISABLE_LTO}"
FFLAGS="${FFLAGS} ${DISABLE_LTO}"
LDFLAGS="${LDFLAGS} ${DISABLE_LTO}"
```

Create `/etc/portage/package.env/no-lto` file (Containing known issue packages):

```bash
# Packages known to have compatibility issues with LTO
# Still compile with Clang, but disable LTO

app-misc/jq no-lto.conf
app-shells/zsh no-lto.conf
dev-build/ninja no-lto.conf
dev-cpp/abseil-cpp no-lto.conf
dev-lang/perl no-lto.conf
dev-lang/spidermonkey no-lto.conf
dev-lang/tcl no-lto.conf
dev-libs/jemalloc no-lto.conf
dev-libs/libportal no-lto.conf
dev-python/jq no-lto.conf
dev-qt/qtbase no-lto.conf
dev-qt/qtdeclarative no-lto.conf
dev-tcltk/expect no-lto.conf
dev-util/dejagnu no-lto.conf
gnome-base/gnome-shell no-lto.conf
gui-libs/libadwaita no-lto.conf
llvm-core/clang no-lto.conf
llvm-core/llvm no-lto.conf
media-libs/clutter no-lto.conf
media-libs/libsdl2 no-lto.conf
media-libs/libsdl3 no-lto.conf
media-libs/libsdl no-lto.conf
media-libs/webrtc-audio-processing no-lto.conf
media-video/ffmpeg no-lto.conf
media-video/pipewire no-lto.conf
net-libs/libnma no-lto.conf
net-print/cups no-lto.conf
sys-devel/clang no-lto.conf
sys-devel/llvm no-lto.conf
x11-drivers/nvidia-drivers no-lto.conf
x11-libs/cairo no-lto.conf
dev-python/pillow no-lto.conf
media-libs/gexiv2 no-lto.conf
x11-wm/mutter no-lto.conf
```
</details>

<details>
<summary><b>Config 2: Low Memory Compilation Mode (low-memory) - Click to Expand</b></summary>

For large projects (like Chromium, Rust), recommended to use low memory config to prevent OOM.

Create `/etc/portage/env/low-memory.conf`:
```bash
# Reduce parallel tasks, e.g., change to -j2 or -j4
MAKEOPTS="-j4"
# Optional: Remove some memory-consuming optimization flags
COMMON_FLAGS="-O2 -pipe"
```

Create `/etc/portage/package.env/low-memory`:
```bash
# Large packages prone to causing system freeze
# Use low memory compilation settings

# Browsers (Very large projects)
www-client/chromium low-memory.conf
mail-client/thunderbird low-memory.conf

# Office Suites
app-office/libreoffice low-memory.conf

# Virtualization
app-emulation/qemu low-memory.conf

# Rust Large Projects
dev-lang/rust low-memory.conf
virtual/rust low-memory.conf
```
</details>

> **Tip**: If encountering other LTO related linking errors, please try disabling LTO for that package first. Also check Gentoo Bugzilla for related reports.](https://bugs.gentoo.org) Search if related report exists (Search "package_name lto"). If it's a new issue, welcome to submit bug report to help improve Gentoo.

### 15.2 Compile with Clang
> **Reference**: [Clang](https://wiki.gentoo.org/wiki/Clang)

**Prerequisites**: Install Clang and LLD
```bash
emerge --ask llvm-core/clang llvm-core/lld
```

> **Important Note**:
> - Some packages (like `sys-libs/glibc`, `app-emulation/wine`) cannot compile with Clang, still need GCC.
> - Gentoo maintains [bug #408963](https://bugs.gentoo.org/408963) to track packages failing to compile with Clang.

**1. Enable for Specific Software (Recommended)**

Create environment config file `/etc/portage/env/clang.conf`:
```bash
CC="clang"
CXX="clang++"
CPP="clang-cpp"  # Some packages (like xorg-server) need this
AR="llvm-ar"
NM="llvm-nm"
RANLIB="llvm-ranlib"
```

Apply to specific software (e.g., `app-editors/neovim`), add in `/etc/portage/package.env`:
```text
app-editors/neovim clang.conf
```



**3. PGO Support (Profile Guided Optimization)**

> **Note**: If PGO support is needed (e.g., `dev-lang/python[pgo]`), need to install following packages:

```bash
emerge --ask llvm-core/clang-runtime
emerge --ask llvm-runtimes/compiler-rt-sanitizers
```

Enable relevant USE flags in `/etc/portage/package.use`:
```text
llvm-core/clang-runtime sanitize
llvm-runtimes/compiler-rt-sanitizers profile orc
```

> **Warning**:
> - If `profile` and `orc` USE flags are not enabled, packages with `pgo` USE flag (like `dev-lang/python[pgo]`) will fail to compile.
> - Compilation log might report error: `ld.lld: error: cannot open /usr/lib/llvm/18/bin/../../../../lib/clang/18/lib/linux/libclang_rt.profile-x86_64.a`

**4. Enable Globally (Not Recommended for Beginners)**

Switching globally to Clang requires most system software support, and handling lots of compatibility issues, **only recommended for advanced users**.

To enable globally, add in `/etc/portage/make.conf`:
```bash
CC="clang"
CXX="clang++"
CPP="clang-cpp"
AR="llvm-ar"
NM="llvm-nm"
RANLIB="llvm-ranlib"
```

**GCC Fallback Environment**

For packages unable to compile with Clang, create `/etc/portage/env/gcc.conf`:
```bash
CC="gcc"
CXX="g++"
CPP="gcc -E"
AR="ar"
NM="nm"
RANLIB="ranlib"
```

Specify GCC usage for specific software in `/etc/portage/package.env`:
```text
sys-libs/glibc gcc.conf
app-emulation/wine gcc.conf
```



---

## 16. Kernel Compilation Advanced Guide (Optional) {#section-16-kernel-advanced}

> Reference: [Kernel](https://wiki.gentoo.org/wiki/Kernel), [Kernel/Configuration](https://wiki.gentoo.org/wiki/Kernel/Configuration), [Genkernel](https://wiki.gentoo.org/wiki/Genkernel)

This section is for advanced users wishing to deeply control kernel compilation, including using LLVM/Clang compilation, enabling LTO optimization, automated configuration, etc.

### 16.1 Preparation

Install necessary tools:
```bash
# Install kernel source and build tools
emerge --ask sys-kernel/gentoo-sources

# (Optional) Install Genkernel for automation
emerge --ask sys-kernel/genkernel

# (Optional) Needed for LLVM/Clang compilation
emerge --ask llvm-core/llvm \
    llvm-core/clang llvm-core/lld
```

### 16.2 View System Info (Hardware Detection)

Before configuring kernel, understanding your hardware is very important:

**View CPU Info**:
```bash
lscpu  # View CPU model, cores, architecture etc.
cat /proc/cpuinfo | grep "model name" | head -1  # CPU Model
```

**View PCI Devices (Graphics, Network, etc.)**:
```bash
lspci -k  # List all PCI devices and currently used drivers
lspci | grep -i vga  # View Graphics Card
lspci | grep -i network  # View Network Card
```

**View USB Devices**:
```bash
lsusb  # List all USB devices
```

**View Loaded Kernel Modules**:
```bash
lsmod  # List all currently loaded modules
lsmod | wc -l  # Module count
```

### 16.3 Auto Configure Kernel Based on Current Modules

If you want to keep all working hardware support from current system (like LiveCD):

```bash
cd /usr/src/linux

# Method 1: Create minimal config based on currently loaded modules
make localmodconfig
# This will only enable kernel options corresponding to currently loaded modules (Strongly Recommended!)

# Method 2: Create based on currently running kernel config
zcat /proc/config.gz > .config  # If current kernel supports
make olddefconfig  # Update config using defaults
```

> **Newcomer Tip**: `localmodconfig` is the safest method, ensuring your hardware works while removing unneeded drivers.

### 16.4 Manually Configure Kernel Options

**Enter Config Interface**:
```bash
cd /usr/src/linux
make menuconfig  # Text interface (Recommended)
```

```text
  ┌────────────── Linux/x86 6.17.9-gentoo Kernel Configuration ──────────────┐
  │  Arrow keys navigate the menu.  <Enter> selects submenus ---> (or empty  │  
  │  submenus ----).  Highlighted letters are hotkeys.  Pressing <Y>         │  
  │  includes, <N> excludes, <M> modularizes features.  Press <Esc><Esc> to  │  
  │  exit, <?> for Help, </> for Search.  Legend: [*] built-in  [ ] excluded │  
  │ ┌──────────────────────────────────────────────────────────────────────┐ │  
  │ │        General setup  --->                                           │ │  
  │ │    [*] 64-bit kernel                                                 │ │  
  │ │        Processor type and features  --->                             │ │  
  │ │    [ ] Mitigations for CPU vulnerabilities  ----                     │ │  
  │ │        Power management and ACPI options  --->                       │ │  
  │ │        Bus options (PCI etc.)  --->                                  │ │  
  │ │        Binary Emulations  --->                                       │ │  
  │ │    [*] Virtualization  --->                                          │ │  
  │ │        General architecture-dependent options  --->                  │ │  
  │ │    [*] Enable loadable module support  --->                          │ │  
  │ │    -*- Enable the block layer  --->                                  │ │  
  │ │        Executable file formats  --->                                 │ │  
  │ │        Memory Management options  --->                               │ │  
  │ │    -*- Networking support  --->                                      │ │  
  │ │        Device Drivers  --->                                          │ │  
  │ │        File systems  --->                                            │ │  
  │ │        Security options  --->                                        │ │  
  │ │    -*- Cryptographic API  --->                                       │ │  
  │ │        Library routines  --->                                        │ │  
  │ │        Kernel hacking  --->                                          │ │  
  │ │        Gentoo Linux  --->                                            │ │  
  │ │                                                                      │ │  
  │ │                                                                      │ │  
  │ └──────────────────────────────────────────────────────────────────────┘ │  
  ├──────────────────────────────────────────────────────────────────────────┤  
  │         <Select>    < Exit >    < Help >    < Save >    < Load >         │  
  └──────────────────────────────────────────────────────────────────────────┘  
```

**Common Options Reference**:

| English Option | Description | Key Config |
| :--- | :--- | :--- |
| **General setup** | General setup | Local hostname, Systemd/OpenRC support |
| **Processor type and features** | Processor type and features | CPU model selection, Microcode loading |
| **Power management and ACPI options** | Power management and ACPI | Laptop power management, Suspend/Hibernate |
| **Bus options (PCI etc.)** | Bus options | PCI support (lspci) |
| **Virtualization** | Virtualization | KVM, VirtualBox Host/Guest support |
| **Enable loadable module support** | Enable loadable module support | Allow using kernel modules (*.ko) |
| **Networking support** | Networking support | TCP/IP stack, Firewall (Netfilter) |
| **Device Drivers** | Device Drivers | Graphics, Network, Sound, USB, NVMe drivers |
| **File systems** | File systems | ext4, btrfs, vfat, ntfs support |
| **Security options** | Security options | SELinux, AppArmor |
| **Gentoo Linux** | Gentoo specific options | Portage dependency auto-select (Recommended) |

> **Important Suggestion**: For manual compilation, recommended to compile **critical drivers** (like filesystem, disk controller, network card) directly into kernel (Select `[*]` or `<*>` i.e., `=y`), instead of as modules (`<M>` i.e., `=m`). This avoids issues where initramfs missing modules causes boot failure.

**Essential Options to Enable** (Based on your system):

1. **Processor Support**:
   - `General setup → Gentoo Linux support`
   - `Processor type and features → Processor family` (Select your CPU)

2. **File Systems**:
   - `File systems → The Extended 4 (ext4) filesystem` (If using ext4)
   - `File systems → Btrfs filesystem` (If using Btrfs)

3. **Device Drivers**:
   - `Device Drivers → Network device support` (Network card driver)
   - `Device Drivers → Graphics support` (Graphics card driver)

4. **Systemd Users Required**:
   - `General setup → Control Group support`
   - `General setup → Namespaces support`

5. **Gentoo Linux Specific Options** (Recommended to enable all):
   
   Enter `Gentoo Linux --->` menu:
   
   ```
   [*] Gentoo Linux support
       Enable Gentoo specific kernel feature support
   
   [*] Linux dynamic and persistent device naming (userspace devfs) support
       Enable udev dynamic device management support (Required)
   
   [*] Select options required by Portage features
       Automatically enable kernel options required by Portage (Strongly Recommended)
       This automatically configures necessary filesystems and kernel features
   
   Support for init systems, system and service managers --->
       ├─ [*] OpenRC support  # If using OpenRC
       └─ [*] systemd support # If using systemd
   
   [*] Kernel Self Protection Project
       Enable kernel self protection mechanisms (Improve security)
   
   [*] Print firmware information that the kernel attempts to load
       Print firmware loading info at boot (Easier for debugging)
   ```

   > **Newcomer Tip**: Enabling "Select options required by Portage features" can automatically configure most essential options, highly recommended!

> **Tip**: In menuconfig, press `/` to search options, press `?` to view help.

### 16.5 Auto Enable Recommended Options

Gentoo provides automation scripts to enable common hardware and features:

```bash
cd /usr/src/linux

# Use Genkernel's default config (Contains most hardware support)
genkernel --kernel-config=/usr/share/genkernel/arch/x86_64/kernel-config all

# Or use distro default config as base
make defconfig  # Kernel default config
# Then adjust as needed
make menuconfig
```

### 16.6 Compile Kernel with LLVM/Clang

Compiling kernel with LLVM/Clang can get better optimization and faster compilation speed (Supports ThinLTO).

**Method 1: Specify Compiler** (One-time):
```bash
cd /usr/src/linux

# Compile with Clang
make LLVM=1 -j$(nproc)

# Compile with Clang + LTO (Recommended)
make LLVM=1 LLVM_IAS=1 -j$(nproc)
```

**Method 2: Set Environment Variables** (Permanent):
Add in `/etc/portage/make.conf` (Only affects kernel compilation):
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

> **Important Warning**: **Strongly NOT recommended to use Full LTO** for kernel compilation!
> - Full LTO causes extremely slow compilation (Might take hours)
> - Consumes huge memory (Might need 16GB+ RAM)
> - Prone to linking errors
> - **Please be sure to use ThinLTO**, it's faster, more stable, uses less memory

### 16.7 Kernel Compilation Option Optimization

<details>
<summary><b>Advanced Compilation Optimization (Click to Expand)</b></summary>

**Enable in `menuconfig`**:

```
General setup
  → Compiler optimization level
     → [*] Optimize for performance (-O2)  # Or -O3, but might be unstable

  → Link Time Optimization (LTO)
     → [*] Clang ThinLTO                   # Requires LLVM=1

Kernel hacking
  → Compile-time checks and compiler options
     → [*] Optimize harder
```

**Kernel Compression Mode** (Affects boot speed and size):

```
General setup
  → Kernel compression mode
     → [*] ZSTD  # Recommended: High compression ratio and fast decompression
     # Other options: LZ4 (Fastest), XZ (Smallest), GZIP (Best compatibility)
```

</details>

### 16.8 Compile and Install Kernel

**Manual Compile**:
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

**Using Genkernel Automation**:
```bash
# Basic Usage
genkernel --install all

# Use LLVM/Clang
genkernel --kernel-cc=clang --utils-cc=clang --install all

# Enable LTO (Need manual .config)
genkernel --kernel-make-opts="LLVM=1" --install all
```

### 16.9 Kernel Statistics and Analysis

After compilation, use following script to view kernel statistics:

```bash
cd /usr/src/linux

echo "=== Kernel Stats ==="
echo "Built-in: $(grep -c '=y$' .config)"
echo "Modules: $(grep -c '=m$' .config)"
echo "Total Config: $(wc -l < .config)"
echo "Kernel Size: $(ls -lh arch/x86/boot/bzImage 2>/dev/null | awk '{print $5}')"
echo "Compression: $(grep '^CONFIG_KERNEL_' .config | grep '=y' | sed 's/CONFIG_KERNEL_//;s/=y//')"
```

**Example Output**:
```
=== Kernel Stats ===
Built-in: 1723
Modules: 201
Total Config: 6687
Kernel Size: 11M
Compression: ZSTD
```

**Interpretation**:
- **Built-in (1723)**: Number of features compiled into kernel binary
- **Modules (201)**: Number of drivers as loadable modules
- **Kernel Size (11M)**: Final kernel file size (Compressed with ZSTD)

> **Optimization Suggestion**:
> - Kernel Size < 15MB: Excellent (Lean config)
> - Kernel Size 15-30MB: Good (Standard config)
> - Kernel Size > 30MB: Consider disabling unneeded features

### 16.10 Common Troubleshooting

<details>
<summary><b>Compilation Errors and Solutions (Click to Expand)</b></summary>

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

**Error 2: LTO Compilation Failure**
```
ld.lld: error: undefined symbol
```
Solution: Some modules incompatible with LTO, disable LTO or set problematic module to `=y` (instead of `=m`)

**Error 3: clang version too old**
```
error: unknown argument: '-mretpoline-external-thunk'
```
Solution: Upgrade LLVM/Clang or use GCC to compile

</details>

### 16.11 Kernel Config Best Practices

1. **Save Config**:
   ```bash
   # Save current config to external file
   cp .config ~/kernel-config-backup
   
   # Restore config
   cp ~/kernel-config-backup /usr/src/linux/.config
   make olddefconfig
   ```

2. **View Config Diff**:
   ```bash
   # Compare two config files
   scripts/diffconfig .config ../old-kernel/.config
   ```

3. **Minimize Config** (Only include essential features):
   ```bash
   make tinyconfig  # Create minimal config
   make localmodconfig  # Then add current hardware support
   ```

---

## 17. Server and RAID Configuration (Optional) {#section-17-server-raid}

> **Reference**: [Gentoo Wiki: Mdadm](https://wiki.gentoo.org/wiki/Mdadm)

This section applies to server users needing to configure Soft RAID (mdadm).

### 17.1 Kernel Configuration (Required for Manual Compile)

If you compile kernel manually, must enable following options (**Note: Must compile into kernel `<*>` i.e., `=y`, cannot be module `<M>`**):

```
Device Drivers  --->
    <*> Multiple devices driver support (RAID and LVM)
        <*> RAID support
            [*] Autodetect RAID arrays during kernel boot

            # Select based on your RAID level (Must select Y):
            <*> Linear (append) mode                   # Linear mode
            <*> RAID-0 (striping) mode                 # RAID 0
            <*> RAID-1 (mirroring) mode                # RAID 1
            <*> RAID-10 (mirrored striping) mode       # RAID 10
            <*> RAID-4/RAID-5/RAID-6 mode              # RAID 5/6
```

### 17.2 Configure Dracut to Load RAID Modules (Required for dist-kernel)

If you use `dist-kernel` (Distribution Kernel) or compiled RAID drivers as modules, **must** force load RAID drivers via Dracut, otherwise cannot boot.

<details>
<summary><b>Dracut RAID Configuration Guide (Click to Expand)</b></summary>

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

**3. Configure Kernel Command Line Parameters (UUID)**
You need to find RAID array UUID and add to kernel parameters.
Create `/etc/dracut.conf.d/mdraid-cmdline.conf`:
```bash
# Kernel command line parameters for RAID arrays
# Please replace with your actual RAID UUID (Check via mdadm --detail --scan)
kernel_cmdline="rd.md.uuid=68b53b0a:c6bd2ca0:caed4380:1cd75aeb rd.md.uuid=c8f92d69:59d61271:e8ffa815:063390ed"
```

**4. Regenerate initramfs**
```bash
dracut --force
```

> **Tip**: After config, be sure to check if `/boot/initramfs-*.img` contains RAID modules:
> `lsinitrd /boot/initramfs-*.img | grep raid`

</details>

---

## References {#reference}

### Official Documentation

- **[Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)** Official Latest Guide
- [Gentoo Wiki](https://wiki.gentoo.org/)
- [Portage Documentation](https://wiki.gentoo.org/wiki/Portage)

### Community Support

**Gentoo Chinese Community**:
- Telegram Group: [@gentoo_zh](https://t.me/gentoo_zh)
- Telegram Channel: [@gentoocn](https://t.me/gentoocn)
- [GitHub](https://github.com/gentoo-zh)

**Official Community**:
- [Gentoo Forums](https://forums.gentoo.org/)
- IRC: `#gentoo` @ [Libera.Chat](https://libera.chat/)

## Conclusion

**Wish you enjoy freedom and flexibility on Gentoo!**

This guide is based on official [Handbook:AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64) and simplified the process, marking optional steps, allowing more people to try easily.
