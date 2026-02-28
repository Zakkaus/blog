---
title: "Gentoo Linux Installation Guide (Advanced Optimization)"
date: 2025-11-25
weight: 3
summary: "Gentoo Linux advanced optimization guide, covering make.conf optimization, LTO, Tmpfs, ccache, kernel compilation, RAID, and system maintenance."
description: "The latest 2025 Gentoo Linux installation guide (Advanced Optimization), covering make.conf optimization, LTO, Tmpfs, kernel compilation with LLVM/Clang, RAID, and system maintenance."
keywords:
  - Gentoo Linux
  - make.conf
  - LTO
  - Tmpfs
  - System Maintenance
  - Compilation Optimization
  - Clang
  - Kernel Compilation
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

<div>

### Article Overview

This is Part 3 of the **Gentoo Linux Installation Guide** series: **Advanced Optimization**.

**Series Navigation**:
1. [Basic Installation](/posts/2025-11-25-gentoo-install-base/): Installing Gentoo base system from scratch
2. [Desktop Configuration](/posts/2025-11-25-gentoo-install-desktop/): Graphics drivers, desktop environment, input methods
3. **Advanced Optimization (This Article)**: make.conf optimization, LTO, system maintenance

**Previous**: [Desktop Configuration](/posts/2025-11-25-gentoo-install-desktop/)

</div>

## 13. Advanced make.conf Configuration Guide

<div>

> **Reference**: [make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

</div>

`/etc/portage/make.conf` is Gentoo's global configuration file that controls compiler settings, optimization parameters, USE flags, and more.

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
- `-march=native`: Optimize for current CPU (recommended)
- `-O2`: Optimization level 2 (balance between performance and stability)
- `-pipe`: Use pipes to speed up compilation

#### 2. Parallel Compilation Configuration
```bash
MAKEOPTS="-j<core count> -l<load limit>"
EMERGE_DEFAULT_OPTS="--jobs=<parallel packages> --load-average=<load>"
```

**Recommended Values**:
- **4 cores / 8 threads**: `MAKEOPTS="-j8 -l8"`, `EMERGE_DEFAULT_OPTS="--jobs=2"`
- **8 cores / 16 threads**: `MAKEOPTS="-j16 -l16"`, `EMERGE_DEFAULT_OPTS="--jobs=4"`
- **16 cores / 32 threads**: `MAKEOPTS="-j32 -l32"`, `EMERGE_DEFAULT_OPTS="--jobs=6"`

#### 3. USE Flag Configuration

```bash
# Basic USE examples
USE="systemd dbus policykit"
USE="${USE} wayland X gtk qt6"
USE="${USE} pipewire pulseaudio alsa"
USE="${USE} -doc -test"
```

**Common USE Flags**:
| Category | USE Flag | Description |
| ---- | -------- | ---- |
| **System** | `systemd` / `openrc` | Init system |
| **Desktop** | `wayland`, `X`, `gtk`, `qt6` | Display protocols and toolkits |
| **Audio** | `pipewire`, `pulseaudio`, `alsa` | Audio systems |
| **Video** | `ffmpeg`, `x264`, `vpx` | Video codecs |
| **i18n** | `cjk`, `nls`, `icu` | Multilingual support |
| **Disable** | `-doc`, `-test`, `-examples` | Disable unnecessary features |

#### 4. Language Configuration
```bash
L10N="en en-US"
LINGUAS="en en_US"
```

#### 5. Hardware Configuration

```bash
# GPU
VIDEO_CARDS="nvidia"        # NVIDIA
# VIDEO_CARDS="amdgpu"      # AMD
# VIDEO_CARDS="intel"       # Intel
# Input devices
INPUT_DEVICES="libinput"
# CPU features (auto-detect, run: emerge --ask app-portage/cpuid2cpuflags)
CPU_FLAGS_X86="<cpuid2cpuflags output>"
```

<div>

**See**: [5.3 CPU Instruction Set Optimization (CPU_FLAGS_X86)](/posts/2025-11-25-gentoo-install-base/#step-5-portage)

</div>

#### 6. Portage Features
```bash
FEATURES="parallel-fetch parallel-install candy ccache"
```

**Common FEATURES**:
- `parallel-fetch`: Parallel downloads
- `parallel-install`: Parallel installation
- `candy`: Enhanced output
- `ccache`: Compilation cache (requires `dev-build/ccache`)

#### 7. Full Configuration Example

**Recommended beginner configuration**:

```bash
# /etc/portage/make.conf
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
MAKEOPTS="-j8"  # Adjust to CPU thread count
USE="systemd wayland pipewire -doc -test"
L10N="en en-US"
VIDEO_CARDS="intel"  # or nvidia/amdgpu
FEATURES="parallel-fetch candy"
ACCEPT_LICENSE="*"
```

### 13.1 Daily Maintenance: How to Be a Good System Administrator

<div>

> **Reference**: [Upgrading Gentoo](https://wiki.gentoo.org/wiki/Upgrading_Gentoo) · [Gentoo Cheat Sheet](https://wiki.gentoo.org/wiki/Gentoo_Cheat_Sheet)

</div>

Gentoo is a rolling release distribution, and system maintenance is an important part of the experience.

**1. Keep the system updated**

It is recommended to update the system every week or two to avoid accumulated updates causing dependency conflicts.

```bash
emerge --sync              # Sync software repository
emerge -avuDN @world       # Update all software
```

**2. Follow official news (important)**

Before updating or when encountering issues, always check for official news announcements.

```bash
eselect news list          # List news
eselect news read          # Read news
```

**3. Handle configuration file updates**

After software updates, configuration files may also be updated. **Do not ignore** `etc-update` or `dispatch-conf` prompts.

```bash
dispatch-conf              # Interactive config file merge (recommended)
# or
etc-update
```

**4. Clean up unused dependencies**

<div>

> **Reference**: [Remove orphaned packages](https://wiki.gentoo.org/wiki/Knowledge_Base:Remove_orphaned_packages)

</div>

```bash
emerge --ask --depclean    # Remove orphaned dependencies no longer needed
```

**5. Regularly clean source packages**

```bash
emerge --ask app-portage/gentoolkit # Install toolkit
eclean-dist                         # Clean downloaded old source packages
```

**6. Automatically handle USE changes**

<div>

> **Reference**: [Autounmask-write](https://wiki.gentoo.org/wiki/Knowledge_Base:Autounmask-write) · [Dispatch-conf](https://wiki.gentoo.org/wiki/Dispatch-conf)

</div>

When installing or updating software shows "The following USE changes are necessary":
1. **Let Portage auto-write config**: `emerge --ask --autounmask-write <package>`
2. **Confirm and update config**: `dispatch-conf` (press u to accept, q to quit)
3. **Try the operation again**: `emerge --ask <package>`

**7. Handle package conflicts (Blocked Packages)**

If you encounter "Error: The above package list contains packages which cannot be installed at the same time...":
- **Solution**: Follow the prompts, manually uninstall the conflicting package (`emerge --deselect <package>` then `emerge --depclean`).

**8. Security check (GLSA)**

Gentoo publishes security advisories (GLSA) to inform users of potential vulnerabilities.

```bash
glsa-check -l      # List all unresolved security advisories
glsa-check -t all  # Test all affected packages
```

**9. System logs and service status**

Regularly check system logs and service status to ensure the system is healthy.
- **OpenRC**:

    ```bash
    rc-status      # View service status
    tail -f /var/log/messages # View system log (requires syslog-ng etc.)
    ```
- **systemd (journalctl common commands)**:

    | Command | Purpose |
    | ---- | ---- |
    | `systemctl --failed` | View services that failed to start |
    | `journalctl -b` | View logs from this boot |
    | `journalctl -b -1` | View logs from the previous boot |
    | `journalctl -f` | Follow latest logs in real time |
    | `journalctl -p err` | Show only Error-level logs |
    | `journalctl -u <service>` | View logs for a specific service |
    | `journalctl --since "1 hour ago"` | View logs from the last hour |
    | `journalctl --disk-usage` | View disk space used by logs |
    | `journalctl --vacuum-time=2weeks` | Clean logs older than 2 weeks |

### 13.2 Portage Tips and Directory Structure

<div>

> **Reference**: [Portage](https://wiki.gentoo.org/wiki/Portage) · [/etc/portage](https://wiki.gentoo.org/wiki//etc/portage)

</div>

**1. Core directory structure (`/etc/portage/`)**

Gentoo's configuration is very flexible. It is recommended to use **directories** rather than single files to manage configuration:

| File/Directory | Purpose |
| --------- | ---- |
| `make.conf` | Global compilation parameters (CFLAGS, MAKEOPTS, USE, GENTOO_MIRRORS) |
| `package.use/` | USE flag configuration for specific packages |
| `package.accept_keywords/` | Allow installation of testing (keyword) packages |
| `package.mask/` | Mask specific package versions |
| `package.unmask/` | Unmask specific package versions |
| `package.license/` | Accept licenses for specific packages |
| `package.env/` | Environment variables for specific packages (e.g., different compiler flags) |

**2. Quick emerge command reference**

> For the full manual run `man emerge`

| Flag (short) | Purpose | Example |
| ----------- | ---- | ---- |
| `--ask` (`-a`) | Ask for confirmation before executing | `emerge -a vim` |
| `--verbose` (`-v`) | Show detailed information (USE flags, etc.) | `emerge -av vim` |
| `--oneshot` (`-1`) | Install without adding to World file | `emerge -1 rust` |
| `--update` (`-u`) | Update packages | `emerge -u vim` |
| `--deep` (`-D`) | Deep dependency calculation | `emerge -uD @world` |
| `--newuse` (`-N`) | Recompile when USE flags change | `emerge -uDN @world` |
| `--depclean` (`-c`) | Clean orphaned dependencies | `emerge -c` |
| `--deselect` | Remove from World file (don't uninstall) | `emerge --deselect vim` |
| `--search` (`-s`) | Search packages (use eix for speed) | `emerge -s vim` |
| `--info` | Show Portage environment info (for debugging) | `emerge --info` |

**3. Fast package search (Eix)**

<div>

> **Reference**: [Eix](https://wiki.gentoo.org/wiki/Eix)

</div>

> Tip: `emerge --search` is slow. Use `eix` for millisecond-speed searches.

1. **Install and update index**:
    ```bash
    emerge --ask app-portage/eix
    eix-update # Run after installation or after syncing
    ```
2. **Search packages**:
    ```bash
    eix <keyword>        # Search all packages
    eix -I <keyword>     # Search only installed packages
    eix -R <keyword>     # Search remote overlays (requires eix-remote config)
    ```

---

## 14. Advanced Compilation Optimization [Optional]

To improve compilation speed, it is recommended to configure tmpfs and ccache.

### 14.1 Configure tmpfs (In-Memory Compilation)

<div>

> **Reference**: [Tmpfs](https://wiki.gentoo.org/wiki/Tmpfs)

</div>

Mount the compilation temp directory to memory to reduce SSD wear and speed up compilation.

<details>
<summary><b>Tmpfs Configuration Guide (Click to Expand)</b></summary>

<div>

**Note**

The `size` must not exceed your physical memory (recommended: half of RAM), otherwise the system may become unstable.

</div>

Edit `/etc/fstab`, add the following line (set size to half your RAM, e.g., 16G):

```fstab
tmpfs   /var/tmp/portage   tmpfs   size=16G,uid=portage,gid=portage,mode=775,noatime   0 0
```
Mount the directory:

```bash
mount /var/tmp/portage
```
</details>

### 14.2 Configure ccache (Compilation Cache)

<div>

> **Reference**: [Ccache](https://wiki.gentoo.org/wiki/Ccache)

</div>

Cache compilation artifacts to speed up recompilation.

```bash
emerge --ask dev-build/ccache
ccache -M 20G  # Set cache size to 20GB
```

### 14.3 Handling Large Software Compilation (Preventing tmpfs Overflow)

Large software like Firefox or LibreOffice may exhaust tmpfs space during compilation. Configure Portage to use disk storage for those specific packages.

<details>
<summary><b>Notmpfs Configuration Guide (Click to Expand)</b></summary>

1. Create config directories:
   ```bash
   mkdir -p /etc/portage/env
   mkdir -p /var/tmp/notmpfs
   ```

2. Create `notmpfs.conf`:
   ```bash
   echo 'PORTAGE_TMPDIR="/var/tmp/notmpfs"' > /etc/portage/env/notmpfs.conf
   ```

3. Apply to specific packages:
   Edit `/etc/portage/package.env`:
   ```conf
   www-client/chromium notmpfs.conf
   app-office/libreoffice notmpfs.conf
   dev-qt/qtwebengine notmpfs.conf
   ```

</details>

### 14.4 LTO and Clang Optimization

See **Section 15. LTO and Clang Compilation Optimization** for detailed configuration.

---

## 15. LTO and Clang Compilation Optimization [Optional]

<div>

**Risk Notice**

LTO significantly increases compilation time and memory consumption, and may cause some software to fail to compile. **Strongly not recommended globally**. Only recommended for specific software (such as browsers).

</div>

### 15.1 Link Time Optimization (LTO)

<div>

> **Reference**: [LTO](https://wiki.gentoo.org/wiki/LTO)

</div>

LTO (Link Time Optimization) defers optimization to the link stage, providing performance improvements and size reduction.

<details>
<summary>LTO Pros and Cons Analysis (Click to Expand)</summary>

<div>

**Advantages**:
*   Performance improvement (typically double digits %)
*   Smaller binary size
*   Improved startup time

**Disadvantages**:
*   Compilation time increases 2-3×
*   Huge memory consumption
*   Stability risks
*   Difficult to troubleshoot

</div>

</details>

<div>

**Beginner Tip**

If your system has a 4-core CPU with 4GB RAM, the time spent compiling may far exceed the performance gains from optimization. Weigh the pros and cons based on your hardware.

</div>

**1. Enable via USE flag (most recommended)**

For large software like Firefox and Chromium, official ebuilds usually provide tested `lto` and `pgo` USE flags:

Enable in `/etc/portage/package.use/browser`:

```text
www-client/firefox lto pgo
www-client/chromium lto pgo  # Note: PGO may not work under Wayland
```

**USE="lto" flag note**: Some packages require special fixes to support LTO. You can enable the `lto` USE flag globally or per-package:

```bash
# Enable globally in /etc/portage/make.conf
USE="lto"
```

**2. Enable LTO for specific packages (recommended)**

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

**3. Enable LTO globally (GCC system)**

<div>

**Warning**

Global LTO causes many packages to fail compilation, requiring frequent maintenance of exclusion lists. **Not recommended for beginners**.

</div>

Edit `/etc/portage/make.conf`:

```bash
# These warnings indicate runtime issues LTO may cause, elevate them to errors
# -Werror=odr: One Definition Rule violation (multiple definitions of the same symbol)
# -Werror=lto-type-mismatch: LTO type mismatch
# -Werror=strict-aliasing: Strict aliasing violation
WARNING_FLAGS="-Werror=odr -Werror=lto-type-mismatch -Werror=strict-aliasing"

# -O2: Optimization level 2 (recommended)
# -pipe: Use pipes to speed up compilation
# -march=native: Optimize for the current CPU
# -flto: Enable Link Time Optimization (Full LTO)
# Note: GCC's -flto defaults to Full LTO, suitable for GCC systems
COMMON_FLAGS="-O2 -pipe -march=native -flto ${WARNING_FLAGS}"

CFLAGS="${COMMON_FLAGS}"          # C compiler flags
CXXFLAGS="${COMMON_FLAGS}"        # C++ compiler flags
FCFLAGS="${COMMON_FLAGS}"         # Fortran compiler flags
FFLAGS="${COMMON_FLAGS}"          # Fortran 77 compiler flags

LDFLAGS="${COMMON_FLAGS} ${LDFLAGS}"  # Linker flags

USE="lto"  # USE flag to enable LTO support
```

**4. Enable LTO globally (LLVM/Clang system - ThinLTO recommended)**

<div>

**Default Recommendation**

If using Clang, strongly recommend using ThinLTO (`-flto=thin`) rather than Full LTO (`-flto`). ThinLTO is faster, uses less memory, and supports parallelism.

</div>

<div>

**Warning**

If `clang-common` does not have the `default-lld` USE flag enabled, you must add `-fuse-ld=lld` to `LDFLAGS`.

</div>

Edit `/etc/portage/make.conf`:

```bash
# Clang has not fully implemented these diagnostics yet, but keep them for future use
# -Werror=odr: One Definition Rule violation detection (partially supported in Clang)
# -Werror=strict-aliasing: Strict aliasing violation detection (in development for Clang)
WARNING_FLAGS="-Werror=odr -Werror=strict-aliasing"

# -O2: Optimization level 2 (balances performance and stability)
# -pipe: Use pipes to speed up compilation
# -march=native: Optimize for the current CPU
# -flto=thin: Enable ThinLTO (recommended, faster and parallelized)
COMMON_FLAGS="-O2 -pipe -march=native -flto=thin ${WARNING_FLAGS}"

CFLAGS="${COMMON_FLAGS}"          # C compiler flags
CXXFLAGS="${COMMON_FLAGS}"        # C++ compiler flags
FCFLAGS="${COMMON_FLAGS}"         # Fortran compiler flags
FFLAGS="${COMMON_FLAGS}"          # Fortran 77 compiler flags

LDFLAGS="${COMMON_FLAGS} ${LDFLAGS}"  # Linker flags

USE="lto"  # USE flag to enable LTO support
```

**ThinLTO vs Full LTO (recommended reading for beginners)**:

| Type | Flag | Advantages | Disadvantages | Recommended Use |
|------|------|------|------|----------|
| **ThinLTO** | `-flto=thin` | Fast, low memory, parallelism, 2-3× faster compilation | Clang/LLVM only | **Default recommendation** (Clang users) |
| Full LTO | `-flto` | Deeper optimization, supported by GCC and Clang | Slow, high memory, sequential | GCC users or when maximum optimization needed |

<div>

**Beginner Tip**

If you use Clang, always use `-flto=thin`. This is the current best practice, greatly reducing compilation time while maintaining performance.

</div>

**5. Rust LTO Configuration**

**On LLVM system**:

```bash
# Add to /etc/portage/make.conf
RUSTFLAGS="${RUSTFLAGS} -Clinker-plugin-lto"
```

**On GCC system** (requires using Clang to compile Rust code):
Create `/etc/portage/env/llvm-lto.conf`:

```bash
# Common flags with Clang optimization and ThinLTO
WARNING_FLAGS="-Werror=odr -Werror=strict-aliasing"
COMMON_FLAGS="-march=native -O2 -flto=thin -pipe ${WARNING_FLAGS}"
CFLAGS="${COMMON_FLAGS}"          # C flags
CXXFLAGS="${COMMON_FLAGS}"        # C++ flags
FCFLAGS="${COMMON_FLAGS}"         # Fortran flags
FFLAGS="${COMMON_FLAGS}"          # Fortran 77 flags

# Rust compiler flags
RUSTFLAGS="-C target-cpu=native -C strip=debuginfo -C opt-level=3 \
-Clinker=clang -Clinker-plugin-lto -Clink-arg=-fuse-ld=lld"

# Linker flags pointing to LLD
LDFLAGS="${COMMON_FLAGS} ${LDFLAGS} -fuse-ld=lld"

# Compiler explicit definitions
CC="clang"
CXX="clang++"
CPP="clang-cpp"
AR="llvm-ar"
NM="llvm-nm"
RANLIB="llvm-ranlib"
USE="lto"
```

In `/etc/portage/package.env`, specify for Rust packages:

```text
dev-lang/rust llvm-lto.conf
```

### 15.2 Advanced Package Environment Configuration (package.env)

For special configuration per-package (e.g., disable LTO or use low-memory mode), use `package.env` for fine-grained control.

<details>
<summary><b>Config 1: Packages that disable LTO (no-lto) - Click to Expand</b></summary>

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

Create `/etc/portage/package.env/no-lto` (containing known problematic packages):

```bash
# Packages with known LTO compatibility issues
app-misc/jq no-lto.conf
app-shells/zsh no-lto.conf
dev-build/ninja no-lto.conf
dev-cpp/abseil-cpp no-lto.conf
dev-lang/perl no-lto.conf
dev-lang/spidermonkey no-lto.conf
dev-lang/tcl no-lto.conf
dev-libs/jemalloc no-lto.conf
dev-libs/libportal no-lto.conf
dev-qt/qtbase no-lto.conf
dev-qt/qtdeclarative no-lto.conf
gnome-base/gnome-shell no-lto.conf
gui-libs/libadwaita no-lto.conf
llvm-core/clang no-lto.conf
llvm-core/llvm no-lto.conf
media-libs/libsdl2 no-lto.conf
media-libs/libsdl3 no-lto.conf
media-libs/webrtc-audio-processing no-lto.conf
media-video/ffmpeg no-lto.conf
media-video/pipewire no-lto.conf
net-print/cups no-lto.conf
x11-drivers/nvidia-drivers no-lto.conf
x11-libs/cairo no-lto.conf
x11-wm/mutter no-lto.conf
```
</details>

<details>
<summary><b>Config 2: Low-memory compilation mode (low-memory) - Click to Expand</b></summary>

For large projects (e.g., Chromium, Rust), use low-memory config to prevent OOM.

Create `/etc/portage/env/low-memory.conf`:

```bash
# Reduce parallel jobs, e.g., -j2 or -j4
MAKEOPTS="-j4"
# Optionally remove memory-intensive optimization flags
COMMON_FLAGS="-O2 -pipe"
```

Create `/etc/portage/package.env/low-memory`:

```bash
# Large packages that may cause system freeze
www-client/chromium low-memory.conf
mail-client/thunderbird low-memory.conf
app-office/libreoffice low-memory.conf
app-emulation/qemu low-memory.conf
dev-lang/rust low-memory.conf
virtual/rust low-memory.conf
```
</details>

<div>

If you encounter other LTO-related link errors, first try disabling LTO for that package. You can also check [Gentoo Bugzilla](https://bugs.gentoo.org) for existing reports (search "package name lto"). If it's a new issue, consider filing a bug report to help improve Gentoo.

</div>

### 15.3 Compiling with Clang

<div>

> **Reference**: [Clang](https://wiki.gentoo.org/wiki/Clang)

</div>

**Prerequisites**: Install Clang and LLD

```bash
emerge --ask llvm-core/clang llvm-core/lld
```

<div>

> **Important Note**

> - Some packages (e.g., `sys-libs/glibc`, `app-emulation/wine`) cannot be compiled with Clang and still require GCC.
> - Gentoo maintains [bug #408963](https://bugs.gentoo.org/408963) to track packages that fail to compile with Clang.

</div>

**1. Enable for specific packages (recommended)**

Create environment config file `/etc/portage/env/clang.conf`:

```bash
CC="clang"
CXX="clang++"
CPP="clang-cpp"  # Some packages (e.g., xorg-server) need this
AR="llvm-ar"
NM="llvm-nm"
RANLIB="llvm-ranlib"
```

Apply to specific packages (e.g., `app-editors/neovim`), add to `/etc/portage/package.env`:

```text
app-editors/neovim clang.conf
```

**2. PGO support (Profile-Guided Optimization)**

<div>

**Note**

If PGO support is needed (e.g., `dev-lang/python[pgo]`), install these packages:

</div>

```bash
emerge --ask llvm-core/clang-runtime
emerge --ask llvm-runtimes/compiler-rt-sanitizers
```

Enable in `/etc/portage/package.use`:

```text
llvm-core/clang-runtime sanitize
llvm-runtimes/compiler-rt-sanitizers profile orc
```

<div>

**Warning**

- Without `profile` and `orc` USE flags, packages with `pgo` USE flag (e.g., `dev-lang/python[pgo]`) will fail to compile.

</div>

**3. Enable globally (not recommended for beginners)**

Switching to Clang globally requires most system software to support it, and requires handling many compatibility issues. **Only recommended for advanced users**.

If needed, add to `/etc/portage/make.conf`:

```bash
CC="clang"
CXX="clang++"
CPP="clang-cpp"
AR="llvm-ar"
NM="llvm-nm"
RANLIB="llvm-ranlib"
```

**GCC fallback environment**

For packages that cannot compile with Clang, create `/etc/portage/env/gcc.conf`:

```bash
CC="gcc"
CXX="g++"
CPP="gcc -E"
AR="ar"
NM="nm"
RANLIB="ranlib"
```

Specify GCC for specific packages in `/etc/portage/package.env`:

```text
sys-libs/glibc gcc.conf
app-emulation/wine gcc.conf
```

---

## 16. Advanced Kernel Compilation Guide [Optional] {#section-16-kernel-advanced}

<div>

> **Reference**: [Kernel](https://wiki.gentoo.org/wiki/Kernel), [Kernel/Configuration](https://wiki.gentoo.org/wiki/Kernel/Configuration), [Genkernel](https://wiki.gentoo.org/wiki/Genkernel)

</div>

This section is for advanced users who want deep control over kernel compilation, including using LLVM/Clang, enabling LTO optimization, and automated configuration.

### 16.1 Preparation

Install required tools:

```bash
# Install kernel sources and build tools
emerge --ask sys-kernel/gentoo-sources
# (Optional) Install Genkernel for automation
emerge --ask sys-kernel/genkernel
# (Optional) Required for LLVM/Clang compilation
emerge --ask llvm-core/llvm \
    llvm-core/clang llvm-core/lld
```

### 16.2 View System Information (Hardware Detection)

Before configuring the kernel, it's important to understand your hardware:

**View CPU information**:

```bash
lscpu  # View CPU model, core count, architecture, etc.
cat /proc/cpuinfo | grep "model name" | head -1  # CPU model
```

**View PCI devices (GPU, NIC, etc.)**:

```bash
lspci -k  # List all PCI devices and their current drivers
lspci | grep -i vga  # View GPU
lspci | grep -i network  # View network card
```

**View USB devices**:

```bash
lsusb  # List all USB devices
```

**View loaded kernel modules**:

```bash
lsmod  # List all currently loaded modules
lsmod | wc -l  # Module count
```

### 16.3 Auto-configure Kernel Based on Current Modules

If you want to preserve all working hardware support from the current system (e.g., LiveCD):

```bash
cd /usr/src/linux
# Method 1: Create minimal config based on currently loaded modules
make localmodconfig
# This only enables kernel options for currently loaded modules (strongly recommended!)
# Method 2: Create config based on currently running kernel
zcat /proc/config.gz > .config  # If current kernel supports it
make olddefconfig  # Update config using default values
```

<div>

**Beginner Tip**

`localmodconfig` is the safest method. It ensures all your hardware works while removing unneeded drivers.

</div>

### 16.4 Manual Kernel Configuration

**Enter the configuration interface**:

```bash
cd /usr/src/linux
make menuconfig  # Text interface (recommended)
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
  │ │        Cryptographic API  --->                                       │ │  
  │ │        Library routines  --->                                        │ │  
  │ │    [ ] Kernel hacking  ----                                          │ │  
  │ └───────────────────────────────────────────────────────────────────────v│  
  ├──────────────────────────────────────────────────────────────────────────┤  
  │          <Select>    < Exit >    < Help >    < Save >    < Load >        │  
  └──────────────────────────────────────────────────────────────────────────┘  
```

**Common configuration options**:

| Menu Option | Description | Key Configuration |
| :--- | :--- | :--- |
| **General setup** | General settings | Hostname, systemd/OpenRC support |
| **Processor type and features** | Processor type and features | CPU model selection, microcode loading |
| **Power management and ACPI options** | Power management and ACPI | Laptop power management, suspend/hibernate |
| **Bus options (PCI etc.)** | Bus options | PCI support (lspci) |
| **Virtualization** | Virtualization | KVM, VirtualBox host/guest support |
| **Enable loadable module support** | Loadable module support | Allow using kernel modules (*.ko) |
| **Networking support** | Network support | TCP/IP stack, firewall (Netfilter) |
| **Device Drivers** | Device drivers | GPU, NIC, sound card, USB, NVMe drivers |
| **File systems** | File systems | ext4, btrfs, vfat, ntfs support |
| **Security options** | Security options | SELinux, AppArmor |
| **Gentoo Linux** | Gentoo-specific options | Auto-selection of Portage dependencies (recommended) |

<div>

**Important Recommendation**

For manual compilation, it is recommended to compile **critical drivers** (such as file systems, disk controllers, network cards) directly into the kernel (select `[*]` or `<*>`, i.e., `=y`), rather than as modules (`<M>`, i.e., `=m`). This avoids boot failures due to missing modules in the initramfs.

</div>

**Required options** (based on your system):

1. **Processor support**:
   - `General setup → Gentoo Linux support`
   - `Processor type and features → Processor family` (select your CPU)

2. **Filesystems**:
   - `File systems → The Extended 4 (ext4) filesystem` (if using ext4)
   - `File systems → Btrfs filesystem` (if using Btrfs)

3. **Device drivers**:
   - `Device Drivers → Network device support` (NIC drivers)
   - `Device Drivers → Graphics support` (GPU drivers)

4. **Required for systemd**:
   - `General setup → Control Group support`
   - `General setup → Namespaces support`

5. **Gentoo Linux specific options** (recommended to enable all):

   Enter `Gentoo Linux --->` menu:

   ```
   [*] Gentoo Linux support
   [*] Linux dynamic and persistent device naming (userspace devfs) support
   [*] Select options required by Portage features
       Support for init systems, system and service managers --->
           ├─ [*] OpenRC support  # If using OpenRC
           └─ [*] systemd support # If using systemd
   [*] Kernel Self Protection Project
   [*] Print firmware information that the kernel attempts to load
   ```

<div>

**Beginner Tip**

Enabling "Select options required by Portage features" automatically configures most required options. Highly recommended!

</div>

<div>

In menuconfig, press `/` to search for options, press `?` for help.

</div>

### 16.5 Auto-enable Recommended Options

Gentoo provides automation scripts to enable common hardware and features:

```bash
cd /usr/src/linux
# Use Genkernel's default config (includes most hardware support)
genkernel --kernel-config=/usr/share/genkernel/arch/x86_64/kernel-config all
# Or use the distribution default config as a base
make defconfig  # Kernel default config
# Then adjust as needed
make menuconfig
```

### 16.6 Compile Kernel with LLVM/Clang

Using LLVM/Clang to compile the kernel provides better optimization and faster compilation (supports ThinLTO).

**Method 1: Specify compiler** (one-time):

```bash
cd /usr/src/linux
# Compile with Clang
make LLVM=1 -j$(nproc)
# Compile with Clang + LTO (recommended)
make LLVM=1 LLVM_IAS=1 -j$(nproc)
```

**Method 2: Set environment variables** (permanent):
Add to `/etc/portage/make.conf` (only affects kernel compilation):

```bash
KERNEL_CC="clang"
KERNEL_LD="ld.lld"
```

**Enable kernel LTO support**:
In `make menuconfig`:

```
General setup
  → Compiler optimization level → Optimize for performance  # Select -O2 (recommended)
  → Link Time Optimization (LTO) → Clang ThinLTO (NEW)      # Enable ThinLTO (strongly recommended)
```

<div>

**Important Warning: Full LTO is strongly NOT recommended for kernel compilation!**

*   Full LTO causes extremely slow compilation (may take hours)
*   Consumes huge amounts of memory (may require 16GB+ RAM)
*   Can cause link errors
*   **Always use ThinLTO**: faster, more stable, less memory usage

</div>

### 16.7 Kernel Compilation Optimization Options

<details>
<summary><b>Advanced Compilation Optimizations (Click to Expand)</b></summary>

**Enable in `menuconfig`**:

```
General setup
  → Compiler optimization level
     → [*] Optimize for performance (-O2)  # or -O3, but may be unstable
  → Link Time Optimization (LTO)
     → [*] Clang ThinLTO                   # Requires LLVM=1
Kernel hacking
  → Compile-time checks and compiler options
     → [*] Optimize harder
```

**Kernel compression** (affects boot speed and size):

```
General setup
  → Kernel compression mode
     → [*] ZSTD  # Recommended: high compression ratio and fast decompression
     # Other options: LZ4 (fastest), XZ (smallest), GZIP (best compatibility)
```

</details>

### 16.8 Compile and Install Kernel

**Manual compilation**:

```bash
cd /usr/src/linux
# Compile kernel and modules
make -j$(nproc)         # Use all CPU cores
make modules_install    # Install modules to /lib/modules/
make install            # Install kernel to /boot/
# (Optional) Using LLVM/Clang + LTO
make LLVM=1 -j$(nproc)
make LLVM=1 modules_install
make LLVM=1 install
```

**Using Genkernel for automation**:

```bash
# Basic usage
genkernel --install all
# Using LLVM/Clang
genkernel --kernel-cc=clang --utils-cc=clang --install all
# Enable LTO (requires manual .config configuration)
genkernel --kernel-make-opts="LLVM=1" --install all
```

### 16.9 Kernel Statistics and Analysis

After compilation, view kernel statistics:

```bash
cd /usr/src/linux
echo "=== Kernel Stats ==="
echo "Built-in: $(grep -c '=y$' .config)"
echo "Modules: $(grep -c '=m$' .config)"
echo "Total configs: $(wc -l < .config)"
echo "Kernel size: $(ls -lh arch/x86/boot/bzImage 2>/dev/null | awk '{print $5}')"
echo "Compression: $(grep '^CONFIG_KERNEL_' .config | grep '=y' | sed 's/CONFIG_KERNEL_//;s/=y//')"
```

**Example output**:

```
=== Kernel Stats ===
Built-in: 1723
Modules: 201
Total configs: 6687
Kernel size: 11M
Compression: ZSTD
```

<div>

**Optimization Guidance**

*   Kernel size < 15MB: Excellent (lean configuration)
*   Kernel size 15-30MB: Good (standard configuration)
*   Kernel size > 30MB: Consider disabling unneeded features

</div>

### 16.10 Troubleshooting Common Issues

<details>
<summary><b>Compilation Errors and Solutions (Click to Expand)</b></summary>

**Error 1: Missing dependency**

```
*** No rule to make target 'debian/canonical-certs.pem'
```
Solution: Disable signing certificates

```bash
scripts/config --disable SYSTEM_TRUSTED_KEYS
scripts/config --disable SYSTEM_REVOCATION_KEYS
make olddefconfig
```

**Error 2: LTO compilation failure**

```
ld.lld: error: undefined symbol
```
Solution: Some modules are incompatible with LTO. Disable LTO or set the problematic module to `=y` (instead of `=m`)

**Error 3: Clang version too old**

```
error: unknown argument: '-mretpoline-external-thunk'
```
Solution: Upgrade LLVM/Clang or compile with GCC

</details>

### 16.11 Kernel Configuration Best Practices

1. **Save configuration**:
   ```bash
   # Save current config to an external file
   cp .config ~/kernel-config-backup
   # Restore configuration
   cp ~/kernel-config-backup /usr/src/linux/.config
   make olddefconfig
   ```

2. **View configuration differences**:
   ```bash
   # Compare two config files
   scripts/diffconfig .config ../old-kernel/.config
   ```

3. **Minimal configuration** (only essential features):
   ```bash
   make tinyconfig  # Create an extremely minimal config
   make localmodconfig  # Then add current hardware support
   ```

---

## 17. Server and RAID Configuration [Optional] {#section-17-server-raid}

<div>

> **Reference**: [Gentoo Wiki: Mdadm](https://wiki.gentoo.org/wiki/Mdadm)

</div>

This section is for server users who need to configure software RAID (mdadm).

### 17.1 Kernel Configuration (Required for Manual Compilation)

If you manually compile the kernel, you must enable the following options (**Note: must be compiled into the kernel `<*>` i.e., `=y`, not modules `<M>`**):

```
Device Drivers  --->
    <*> Multiple devices driver support (RAID and LVM)
        <*> RAID support
            [*] Autodetect RAID arrays during kernel boot
            # Choose based on your RAID level (must select Y):
            <*> Linear (append) mode
            <*> RAID-0 (striping) mode
            <*> RAID-1 (mirroring) mode
            <*> RAID-10 (mirrored striping) mode
            <*> RAID-4/RAID-5/RAID-6 mode
```

### 17.2 Configure Dracut to Load RAID Modules (Required for dist-kernel)

If you use `dist-kernel` (distribution kernel) or compiled RAID drivers as modules, you **must** force Dracut to load RAID drivers, otherwise the system won't boot.

<details>
<summary><b>Dracut RAID Configuration Guide (Click to Expand)</b></summary>

**1. Enable mdraid support**

Create `/etc/dracut.conf.d/mdraid.conf`:

```bash
# Enable mdraid support for RAID arrays
add_dracutmodules+=" mdraid "
mdadmconf="yes"
```

**2. Force load RAID drivers**

Create `/etc/dracut.conf.d/raid-modules.conf`:

```bash
# Ensure RAID modules are included and loaded
add_drivers+=" raid1 raid0 raid10 raid456 "
force_drivers+=" raid1 "
# Install modprobe configuration
install_items+=" /usr/lib/modules-load.d/ /etc/modules-load.d/ "
```

**3. Configure kernel command line parameters (UUID)**

Create `/etc/dracut.conf.d/mdraid-cmdline.conf`:

```bash
# Kernel command line parameters for RAID arrays
# Replace with your actual RAID UUID (view with: mdadm --detail --scan)
kernel_cmdline="rd.md.uuid=68b53b0a:c6bd2ca0:caed4380:1cd75aeb rd.md.uuid=c8f92d69:59d61271:e8ffa815:063390ed"
```

**4. Regenerate initramfs**

```bash
dracut --force
```

<div>

After configuration, verify that `/boot/initramfs-*.img` contains RAID modules:

</div>

> `lsinitrd /boot/initramfs-*.img | grep raid`

</details>

---

## References {#reference}

<div>

<div>

### Official Documentation

- **[Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)** Official latest guide
- [Gentoo Wiki](https://wiki.gentoo.org/)
- [Portage Documentation](https://wiki.gentoo.org/wiki/Portage)

</div>

<div>

### Community Support

- [Gentoo Forums](https://forums.gentoo.org/)
- IRC: `#gentoo` @ [Libera.Chat](https://libera.chat/)

</div>

</div>

## Closing

<div>

### Enjoy the freedom and flexibility of Gentoo!

This guide is based on the official [Handbook:AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64) with a simplified flow and marked optional steps, making it easier for more people to try Gentoo.

</div>
