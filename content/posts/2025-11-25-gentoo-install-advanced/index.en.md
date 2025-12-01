---
title: "Gentoo Linux Installation Guide (Advanced Optimization)"
slug: gentoo-install-advanced
aliases:
  - /posts/gentoo-optimization/
translationKey: gentoo-install-advanced
date: 2025-11-30
summary: "Gentoo Linux advanced optimization tutorial, covering make.conf optimization, LTO, system maintenance, etc."
description: "2025 Latest Gentoo Linux Installation Guide (Advanced Optimization), covering make.conf optimization, LTO, system maintenance, etc."
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

This article is the third part of the **Gentoo Linux Installation Guide** series: **Advanced Optimization**.

**Series Navigation**:
1. [Base Installation](/posts/gentoo-install/): Install Gentoo base system from scratch
2. [Desktop Configuration](/posts/gentoo-install-desktop/): Graphics drivers, Desktop Environments, Input methods, etc.
3. [Advanced Optimization](/posts/gentoo-install-advanced/): make.conf optimization, LTO, System maintenance

**Previous Step**: [Desktop Configuration](/posts/gentoo-install-desktop/)

</div>

## 13. make.conf Advanced Configuration Guide

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

</div>

`/etc/portage/make.conf` is Gentoo's global configuration file, controlling compiler, optimization flags, USE flags, etc.

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
MAKEOPTS="-j<core_count> -l<load_limit>"
EMERGE_DEFAULT_OPTS="--jobs=<parallel_package_count> --load-average=<load>"
```

**Recommended Values**:
- **4 Cores/8 Threads**: `MAKEOPTS="-j8 -l8"`, `EMERGE_DEFAULT_OPTS="--jobs=2"`
- **8 Cores/16 Threads**: `MAKEOPTS="-j16 -l16"`, `EMERGE_DEFAULT_OPTS="--jobs=4"`
- **16 Cores/32 Threads**: `MAKEOPTS="-j32 -l32"`, `EMERGE_DEFAULT_OPTS="--jobs=6"`

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
| **Internationalization** | `cjk`, `nls`, `icu` | Chinese support |
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

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**See also**: [5.3 CPU Instruction Set Optimization (CPU_FLAGS_X86)](/posts/gentoo-install/#step-5-portage)

</div>

#### 6. Portage Features

```bash
FEATURES="parallel-fetch parallel-install candy ccache"
```

**Common FEATURES**:
- `parallel-fetch`: Parallel download
- `parallel-install`: Parallel install
- `candy`: Beautify output
- `ccache`: Compilation cache (Need to install `dev-build/ccache`)

#### 7. Complete Configuration Example

**Beginner Recommended Config**:
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

### 13.1 Daily Maintenance: How to be a Qualified System Administrator

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Upgrading Gentoo](https://wiki.gentoo.org/wiki/Upgrading_Gentoo) · [Gentoo Cheat Sheet](https://wiki.gentoo.org/wiki/Gentoo_Cheat_Sheet)

</div>

Gentoo is a rolling release distribution, maintaining the system is an important part of the user experience.

**1. Keep System Updated**
Recommended to update system once every one or two weeks, to avoid accumulating too many updates causing dependency conflicts.
```bash
emerge --sync              # Sync software repository
emerge -avuDN @world       # Update all software
```

**2. Follow Official News (Important)**
Before updating or encountering problems, be sure to check if there are official news pushes.
```bash
eselect news list          # List news
eselect news read          # Read news
```

**3. Handle Configuration File Updates**
After software updates, configuration files may also update. **Do not ignore** `etc-update` or `dispatch-conf` prompts.
```bash
dispatch-conf              # Interactive merge config files (Recommended)
# Or
etc-update
```

**4. Clean Up Unused Dependencies**
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Remove orphaned packages](https://wiki.gentoo.org/wiki/Knowledge_Base:Remove_orphaned_packages)

</div>

```bash
emerge --ask --depclean    # Remove orphaned dependencies no longer needed
```

**5. Regularly Clean Up Source Packages**
```bash
emerge --ask app-portage/gentoolkit # Install toolkit
eclean-dist                         # Clean up downloaded old source packages
```

**6. Automatically Handle USE Changes**
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Autounmask-write](https://wiki.gentoo.org/wiki/Knowledge_Base:Autounmask-write) · [Dispatch-conf](https://wiki.gentoo.org/wiki/Dispatch-conf)

</div>

When installing or updating software prompts "The following USE changes are necessary":
1.  **Let Portage automatically write config**: `emerge --ask --autounmask-write <package_name>`
2.  **Confirm and update config**: `dispatch-conf` (Press u to confirm, q to quit)
3.  **Try operation again**: `emerge --ask <package_name>`

**7. Handle Software Conflicts (Blocked Packages)**
If encountering "Error: The above package list contains packages which cannot be installed at the same time...":
- **Solution**: Follow prompts, manually uninstall conflicting software (`emerge --deselect <package_name>` then `emerge --depclean`).

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
    tail -f /var/log/messages # View system logs (Need to install syslog-ng etc.)
    ```
- **Systemd (Journalctl Common Commands)**:
    | Command | Function |
    | ---- | ---- |
    | `systemctl --failed` | View failed services |
    | `journalctl -b` | View logs of this boot |
    | `journalctl -b -1` | View logs of last boot |
    | `journalctl -f` | Follow latest logs in real-time (Like tail -f) |
    | `journalctl -p err` | Show only Error level logs |
    | `journalctl -u <service_name>` | View logs of specific service |
    | `journalctl --since "1 hour ago"` | View logs from last 1 hour |
    | `journalctl --disk-usage` | View disk usage of logs |
    | `journalctl --vacuum-time=2weeks` | Clean up logs older than 2 weeks |

### 13.2 Portage Tips and Directory Structure

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Portage](https://wiki.gentoo.org/wiki/Portage) · [/etc/portage](https://wiki.gentoo.org/wiki//etc/portage)

</div>

**1. Core Directory Structure (`/etc/portage/`)**
Gentoo's configuration is very flexible, recommended to use **directories** instead of single files to manage configuration:

| File/Directory | Usage |
| --------- | ---- |
| `make.conf` | Global compilation flags (CFLAGS, MAKEOPTS, USE, GENTOO_MIRRORS) |
| `package.use/` | USE flag configuration for specific software |
| `package.accept_keywords/` | Allow installing testing (keyword) software |
| `package.mask/` | Mask specific versions of software |
| `package.unmask/` | Unmask specific versions of software |
| `package.license/` | Accept licenses for specific software |
| `package.env/` | Environment variables for specific software (e.g. use different compiler flags) |

**2. Common Emerge Command Cheat Sheet**
> For full manual run `man emerge`

| Parameter (Abbr.) | Function | Example |
| ----------- | ---- | ---- |
| `--ask` (`-a`) | Ask for confirmation before execution | `emerge -a vim` |
| `--verbose` (`-v`) | Show detailed info (USE flags etc.) | `emerge -av vim` |
| `--oneshot` (`-1`) | Install but don't add to World file (Not as system dependency) | `emerge -1 rust` |
| `--update` (`-u`) | Update software packages | `emerge -u vim` |
| `--deep` (`-D`) | Deep dependency calculation (Update dependencies of dependencies) | `emerge -uD @world` |
| `--newuse` (`-N`) | Recompile when USE flags change | `emerge -uDN @world` |
| `--depclean` (`-c`) | Clean up orphaned dependencies no longer needed | `emerge -c` |
| `--deselect` | Remove from World file (Don't uninstall) | `emerge --deselect vim` |
| `--search` (`-s`) | Search software packages (Recommended to use eix) | `emerge -s vim` |
| `--info` | Show Portage environment info (For debugging) | `emerge --info` |

**3. Quick Package Search (Eix)**
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Eix](https://wiki.gentoo.org/wiki/Eix)

</div>
> `emerge --search` is slow, recommended to use `eix` for millisecond-level search.

1.  **Install and Update Index**:
    ```bash
    emerge --ask app-portage/eix
    eix-update # Execute after install or sync
    ```
2.  **Search Software**:
    ```bash
    eix <keyword>        # Search all software
    eix -I <keyword>     # Search only installed software
    eix -R <keyword>     # Search remote Overlay (Need to configure eix-remote)
    ```

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

Global LTO will cause massive package compilation failures, requiring frequent maintenance of exclusion lists, **NOT recommended for beginners to try**.

</div>

Edit `/etc/portage/make.conf`:
```bash
# These warnings indicate runtime issues potentially caused by LTO, promote them to errors
# -Werror=odr: One Definition Rule violation (Multiple definitions of same symbol)
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
# Clang currently does not fully implement these diagnostics, but keep these flags for future use
# -Werror=odr: One Definition Rule violation detection (Clang partially supports)
# -Werror=strict-aliasing: Strict aliasing violation detection (Clang developing)
WARNING_FLAGS="-Werror=odr -Werror=strict-aliasing"

# -O2: Optimization level 2 (Balance performance and stability)
# -pipe: Use pipes to speed up compilation
# -march=native: Optimize for current CPU
# -flto=thin: Enable ThinLTO (Recommended, fast and parallelizable)
COMMON_FLAGS="-O2 -pipe -march=native -flto=thin ${WARNING_FLAGS}"
CFLAGS="${COMMON_FLAGS}"          # C compiler flags
CXXFLAGS="${COMMON_FLAGS}"        # C++ compiler flags
FCFLAGS="${COMMON_FLAGS}"         # Fortran compiler flags
FFLAGS="${COMMON_FLAGS}"          # Fortran 77 compiler flags
LDFLAGS="${COMMON_FLAGS} ${LDFLAGS}"  # Linker flags

USE="lto"  # Enable USE flag for LTO support
```

**ThinLTO vs Full LTO (Recommended for beginners to read)**:

| Type | Flag | Pros | Cons | Recommended Scenario |
|------|------|------|------|----------|
| **ThinLTO** | `-flto=thin` | • Fast<br>• Low memory usage<br>• Supports parallelization<br>• Compilation speedup 2-3x | • Only Clang/LLVM supports | **Default Recommendation** (Clang Users) |
| Full LTO | `-flto` | • Deeper optimization<br>• Both GCC and Clang support | • Slow<br>• High memory usage<br>• Serial processing | GCC Users or need extreme optimization |

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Beginner Tip**

If you use Clang, please be sure to use `-flto=thin`. This is currently the best practice, significantly reducing compilation time while ensuring performance.

</div>

**5. Rust LTO Configuration**

**On LLVM System**:
```bash
# Add in /etc/portage/make.conf
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
<summary><b>Config 1: Package List Disabling LTO (no-lto) - Click to expand</b></summary>

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
# Still compile using Clang, but disable LTO

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
<summary><b>Config 2: Low Memory Compilation Mode (low-memory) - Click to expand</b></summary>

For large projects (like Chromium, Rust), recommended to use low memory configuration to prevent OOM.

Create `/etc/portage/env/low-memory.conf`:
```bash
# Reduce parallel task count, e.g. change to -j2 or -j4
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

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

If encountering other LTO related link errors, please try disabling LTO for that package first. You can also check [Gentoo Bugzilla](https://bugs.gentoo.org) to search if there are related reports (Search "package_name lto"). If it is a new issue, welcome to submit bug report to help improve Gentoo.

</div>

### 15.2 Compile with Clang
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Clang](https://wiki.gentoo.org/wiki/Clang)

</div>

**Prerequisites**: Install Clang and LLD
```bash
emerge --ask llvm-core/clang llvm-core/lld
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Important Tip**

- Some packages (like `sys-libs/glibc`, `app-emulation/wine`) cannot be compiled with Clang, still need GCC.
- Gentoo maintains [bug #408963](https://bugs.gentoo.org/408963) to track packages failing to compile with Clang.

</div>

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

Apply to specific software (e.g. `app-editors/neovim`), add in `/etc/portage/package.env`:
```text
app-editors/neovim clang.conf
```



**3. PGO Support (Profile Guided Optimization)**

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

If PGO support is needed (e.g. `dev-lang/python[pgo]`), need to install following packages:

</div>

```bash
emerge --ask llvm-core/clang-runtime
emerge --ask llvm-runtimes/compiler-rt-sanitizers
```

Enable related USE flags in `/etc/portage/package.use`:
```text
llvm-core/clang-runtime sanitize
llvm-runtimes/compiler-rt-sanitizers profile orc
```

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Warning**

- If `profile` and `orc` USE flags are not enabled, packages with `pgo` USE flag (like `dev-lang/python[pgo]`) will fail to compile.
- Compilation log may report error: `ld.lld: error: cannot open /usr/lib/llvm/18/bin/../../../../lib/clang/18/lib/linux/libclang_rt.profile-x86_64.a`

</div>

**4. Enable Globally (Not Recommended for Beginners)**

Switching to Clang globally requires most system software support, and needs to handle a large number of compatibility issues, **only recommended for advanced users to try**.

If need to enable globally, add in `/etc/portage/make.conf`:
```bash
CC="clang"
CXX="clang++"
CPP="clang-cpp"
AR="llvm-ar"
NM="llvm-nm"
RANLIB="llvm-ranlib"
```

**GCC Fallback Environment**

For packages that cannot be compiled with Clang, create `/etc/portage/env/gcc.conf`:
```bash
CC="gcc"
CXX="g++"
CPP="gcc -E"
AR="ar"
NM="nm"
RANLIB="ranlib"
```

Specify GCC for specific software in `/etc/portage/package.env`:
```text
sys-libs/glibc gcc.conf
app-emulation/wine gcc.conf
```



---

## 16. Kernel Compilation Advanced Guide (Optional) {#section-16-kernel-advanced}

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Kernel](https://wiki.gentoo.org/wiki/Kernel)、[Kernel/Configuration](https://wiki.gentoo.org/wiki/Kernel/Configuration)、[Genkernel](https://wiki.gentoo.org/wiki/Genkernel)

</div>

This section is for advanced users who want to deeply control kernel compilation, including using LLVM/Clang compilation, enabling LTO optimization, automated configuration, etc.

### 16.1 Preparation

Install necessary tools:
```bash
# Install kernel source and build tools
emerge --ask sys-kernel/gentoo-sources

# (Optional) Install Genkernel for automation
emerge --ask sys-kernel/genkernel

# (Optional) Required for compiling with LLVM/Clang
emerge --ask llvm-core/llvm \
    llvm-core/clang llvm-core/lld
```

### 16.2 View System Info (Hardware Detection)

Before configuring kernel, understanding your hardware is very important:

**View CPU Info**:
```bash
lscpu  # View CPU model, core count, architecture etc.
cat /proc/cpuinfo | grep "model name" | head -1  # CPU model
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

If you want to keep hardware support for all currently working hardware (like LiveCD):

```bash
cd /usr/src/linux

# Method 1: Create minimal config based on currently loaded modules
make localmodconfig
# This will only enable kernel options corresponding to currently loaded modules (Strongly Recommended!)

# Method 2: Create based on currently running kernel config
zcat /proc/config.gz > .config  # If current kernel supports
make olddefconfig  # Update config using defaults
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Beginner Tip**

`localmodconfig` is the safest method, it ensures your hardware works properly while removing unneeded drivers.

</div>

### 16.4 Manual Kernel Option Configuration

**Enter Configuration Interface**:
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

| English Option | Description | Key Configuration |
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
| **Gentoo Linux** | Gentoo Linux | Portage dependency auto-selection (Recommended) |

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Important Recommendation**

For manual compilation, recommended to compile **critical drivers** (like filesystem, disk controller, network card) directly into kernel (Select `[*]` or `<*>` i.e. `=y`), instead of as modules (`<M>` i.e. `=m`). This avoids issues where initramfs missing modules causes boot failure.

</div>

**Required Options** (Depending on your system):

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
       Enable kernel self-protection mechanisms (Improve security)
   
   [*] Print firmware information that the kernel attempts to load
       Show firmware loading info at boot (For debugging)
   ```

 <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Beginner Tip**

Enabling "Select options required by Portage features" can automatically configure most required options, highly recommended!

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

In menuconfig, press `/` to search options, press `?` to view help.

</div>

### 16.5 Auto Enable Recommended Options

Gentoo provides automation scripts to enable common hardware and features:

```bash
cd /usr/src/linux

# Use Genkernel default config (Includes most hardware support)
genkernel --kernel-config=/usr/share/genkernel/arch/x86_64/kernel-config all

# Or use distribution default config as base
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

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important Warning: Strongly NOT recommended to use Full LTO for kernel compilation!**

*   Full LTO causes extremely slow compilation (may take hours)
*   Consumes massive memory (may need 16GB+ RAM)
*   Prone to link errors
*   **Please be sure to use ThinLTO**, it is faster, more stable, uses less memory

</div>

### 16.7 Kernel Compilation Option Optimization

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

**Kernel Compression Mode** (Affects boot speed and size):

```
General setup
  → Kernel compression mode
     → [*] ZSTD  # Recommended: High compression ratio and fast decompression
     # Other options: LZ4 (Fastest), XZ (Smallest), GZIP (Best compatibility)
```

</details>

### 16.8 Compile and Install Kernel

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
# Basic Usage
genkernel --install all

# Use LLVM/Clang
genkernel --kernel-cc=clang --utils-cc=clang --install all

# Enable LTO (Need manual config .config)
genkernel --kernel-make-opts="LLVM=1" --install all
```

### 16.9 Kernel Statistics and Analysis

After compilation, use the following script to view kernel statistics:

```bash
cd /usr/src/linux

echo "=== Kernel Statistics ==="
echo "Built-in: $(grep -c '=y$' .config)"
echo "Modules: $(grep -c '=m$' .config)"
echo "Total Config: $(wc -l < .config)"
echo "Kernel Size: $(ls -lh arch/x86/boot/bzImage 2>/dev/null | awk '{print $5}')"
echo "Compression: $(grep '^CONFIG_KERNEL_' .config | grep '=y' | sed 's/CONFIG_KERNEL_//;s/=y//')"
```

**Example Output**:
```
=== Kernel Statistics ===
Built-in: 1723
Modules: 201
Total Config: 6687
Kernel Size: 11M
Compression: ZSTD
```

**Interpretation**:
- **Built-in (1723)**: Number of features compiled into kernel binary
- **Modules (201)**: Number of drivers as loadable modules
- **Kernel Size (11M)**: Final kernel file size (After ZSTD compression)

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Optimization Recommendation**

*   Kernel Size < 15MB: Excellent (Minimal config)
*   Kernel Size 15-30MB: Good (Standard config)
*   Kernel Size > 30MB: Consider disabling unneeded features

</div>

### 16.10 Common Troubleshooting

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

**Error 2: LTO Compilation Failure**
```
ld.lld: error: undefined symbol
```
Solution: Some modules are incompatible with LTO, disable LTO or set problematic module to `=y` (instead of `=m`)

**Error 3: clang version too old**
```
error: unknown argument: '-mretpoline-external-thunk'
```
Solution: Upgrade LLVM/Clang or use GCC to compile

</details>

### 16.11 Kernel Configuration Best Practices

1. **Save Configuration**:
   ```bash
   # Save current config to external file
   cp .config ~/kernel-config-backup
   
   # Restore config
   cp ~/kernel-config-backup /usr/src/linux/.config
   make olddefconfig
   ```

2. **View Config Differences**:
   ```bash
   # Compare two config files
   scripts/diffconfig .config ../old-kernel/.config
   ```

3. **Minimal Configuration** (Only include required features):
   ```bash
   make tinyconfig  # Create minimal config
   make localmodconfig  # Then add current hardware support
   ```

---

## 17. Server and RAID Configuration (Optional) {#section-17-server-raid}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Wiki: Mdadm](https://wiki.gentoo.org/wiki/Mdadm)

</div>

This section applies to server users who need to configure software RAID (mdadm).

### 17.1 Kernel Configuration (Manual Compilation Required)

If you manually compile kernel, MUST enable following options (**Note: MUST compile into kernel `<*>` i.e. `=y`, cannot be module `<M>`**):

```
Device Drivers  --->
    <*> Multiple devices driver support (RAID and LVM)
        <*> RAID support
            [*] Autodetect RAID arrays during kernel boot

            # Select according to your RAID level (MUST select Y):
            <*> Linear (append) mode                   # Linear mode
            <*> RAID-0 (striping) mode                 # RAID 0
            <*> RAID-1 (mirroring) mode                # RAID 1
            <*> RAID-10 (mirrored striping) mode       # RAID 10
            <*> RAID-4/RAID-5/RAID-6 mode              # RAID 5/6
```

### 17.2 Configure Dracut to Load RAID Modules (dist-kernel Required)

If you use `dist-kernel` (Distribution Kernel) or compiled RAID drivers as modules, **MUST** force load RAID drivers via Dracut, otherwise cannot boot.

<details>
<summary><b>Dracut RAID Configuration Guide (Click to expand)</b></summary>

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
# Please replace with your actual RAID UUID (View via mdadm --detail --scan)
kernel_cmdline="rd.md.uuid=68b53b0a:c6bd2ca0:caed4380:1cd75aeb rd.md.uuid=c8f92d69:59d61271:e8ffa815:063390ed"
```

**4. Regenerate initramfs**
```bash
dracut --force
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

After configuration, be sure to check if `/boot/initramfs-*.img` contains RAID modules:

</div>
> `lsinitrd /boot/initramfs-*.img | grep raid`

</details>

---

## References {#reference}

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Official Documentation

- **[Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)** Official Latest Guide
- [Gentoo Wiki](https://wiki.gentoo.org/)
- [Portage Documentation](https://wiki.gentoo.org/wiki/Portage)

</div>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Community Support

**Gentoo Chinese Community**:
- Telegram Group: [@gentoo_zh](https://t.me/gentoo_zh)
- Telegram Channel: [@gentoocn](https://t.me/gentoocn)
- [GitHub](https://github.com/gentoo-zh)

**Official Community**:
- [Gentoo Forums](https://forums.gentoo.org/)
- IRC: `#gentoo` @ [Libera.Chat](https://libera.chat/)

</div>

</div>

## Conclusion

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; text-align: center;">

### Wish you enjoy freedom and flexibility on Gentoo!

This guide is based on official [Handbook:AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64) and simplified the process, marking optional steps, to let more people try easily.

</div>
