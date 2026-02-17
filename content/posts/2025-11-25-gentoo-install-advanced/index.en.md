---
title: "Gentoo Linux Installation Guide (Advanced Optimization)"
date: 2025-11-25
weight: 3
summary: "Gentoo Linux advanced optimization guide, covering make.conf optimization, LTO, Tmpfs, system maintenance, and more."
description: "The latest 2025 Gentoo Linux installation guide (Advanced Optimization), covering make.conf optimization, LTO, Tmpfs, system maintenance, and more."
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

**Reference**: [make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

</div>

`/etc/portage/make.conf` is Gentoo's global configuration file that controls compiler settings, optimization parameters, USE flags, and more.

### 1. Compiler Configuration

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

### 2. Parallel Compilation Configuration

```bash
MAKEOPTS="-j<core count> -l<load limit>"
EMERGE_DEFAULT_OPTS="--jobs=<parallel packages> --load-average=<load>"
```

**Recommended Values**:
- **4 cores / 8 threads**: `MAKEOPTS="-j8 -l8"`, `EMERGE_DEFAULT_OPTS="--jobs=2"`
- **8 cores / 16 threads**: `MAKEOPTS="-j16 -l16"`, `EMERGE_DEFAULT_OPTS="--jobs=4"`
- **16 cores / 32 threads**: `MAKEOPTS="-j32 -l32"`, `EMERGE_DEFAULT_OPTS="--jobs=6"`

### 3. USE Flag Configuration

```bash
# Basic USE examples

# System
USE="systemd udev dbus policykit acl"

# Desktop
USE="X wayland pulseaudio alsa"

# Performance
USE="tokyo cabinet zstd lz4 lzo zlib"

# Development
USE="git"

# Compression
USE="bzip2 gzip zstd lz4 lzma xz"
```

> **Note**: After changing USE flags, rebuild affected packages:
> ```bash
> emerge --ask --newuse --deep @world
> ```

### 4. Portage Directories

```bash
# Parallel compilation for Portage
EMERGE_DEFAULT_OPTS="--jobs=4 --load-average=8"

# Cache settings
PORTDIR="/var/db/repos/gentoo"
DISTDIR="/var/cache/distfiles"
PKGDIR="/var/cache/binpkgs"
```

### 5. Distcc (Distributed Compilation)

<div>

**Reference**: [Distcc](https://wiki.gentoo.org/wiki/Distcc)

</div>

For multiple machines:

```bash
emerge --ask dev-util/distcc

# Configure in /etc/conf.d/distccd
# Add hosts: --allow 192.168.1.0/24
```

## 14. LTO (Link Time Optimization)

<div>

**Reference**: [LTO](https://wiki.gentoo.org/wiki/LTO)

</div>

LTO (Link Time Optimization) provides significant performance improvements across the entire system.

### 14.1 Enable LTO

Edit `/etc/portage/make.conf`:

```makefile
# LTO configuration
COMMON_FLAGS="${COMMON_FLAGS} -flto"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
ARFLAGS="-X"
LDFLAGS="-Wl,-O1 -Wl,--sort-common -Wl,--as-needed -Wl,-z,now"

# Prevent known incompatible packages from breaking
# Add to /etc/portage/package.env
# media-video/ffmpeg lto.conf
```

Create `/etc/portage/package.env/lto.conf`:

```
# Packages that don't work well with LTO
media-video/ffmpeg lto.conf
app-arch/p7zip lto.conf
app-emulation/wine lto.conf
```

Create `/etc/portage/package.env/lto.conf`:

```properties
# Disable LTO for these packages
[package.env]
no-lto = gcc-confpicker.lto

[no-lto]
CFLAGS=-O2 -pipe
CXXFLAGS=-O2 -pipe
```

### 14.2 Rebuild System with LTO

```bash
# First, update system
emerge --sync
emerge --ask --update --deep --newuse @world

# Then rebuild with new flags
emerge --ask --oneshot sys-devel/gcc
emerge --ask --oneshot @world
```

> **Note**: LTO may cause compilation failures in some packages. Check the [LTO wiki](https://wiki.gentoo.org/wiki/LTO) for the latest compatibility list.

## 15. Tmpfs (RAM Disk)

<div>

**Reference**: [tmpfs](https://wiki.gentoo.org/wiki/Tmpfs)

</div>

Using RAM disk for compilation can significantly speed up the build process.

### 15.1 Use tmpfs for Portage

Edit `/etc/fstab`:

```
# Portage tmpfs
tmpfs           /var/tmp/portage  tmpfs   size=30G,uid=portage,gid=portage,mode=775,noatime   0 0
```

Or mount manually:

```bash
mount -t tmpfs -o size=30G,uid=portage,gid=portage,mode=775,noatime tmpfs /var/tmp/portage
```

### 15.2 Use tmpfs for Compile Cache

```bash
# Install ccache
emerge --ask dev-util/ccache

# Configure
export CCACHE_DIR=/tmp/ccache
export CCACHE_SIZE=30G
export CCACHE_TMPFS=/tmp
```

Add to `/etc/portage/make.conf`:

```makefile
FEATURES="ccache"
CCACHE_DIR="/var/cache/ccache"
```

## 16. System Maintenance

### 16.1 Regular Updates

```bash
# Daily/Weekly update routine
emerge --sync
emerge --ask --update --deep --newuse @world

# Clean up
eclean-dist -d
eclean-pkg -a
```

### 16.2 Check for Issues

```bash
# Check for broken dependencies
emerge --check-ins @world

# Rebuild broken packages
emerge --ask @preserved-rebuild

# Check configuration files
etc-update
```

### 16.3 Kernel Maintenance

```bash
# List installed kernels
eselect kernel list

# Remove old kernels
emerge --ask app-portage/gentoolkit
eclean-kernel --all

# Clean old kernel sources
emerge --depclean
```

### 16.4 Log Management

```bash
# Rotate logs
emerge --ask app-admin/logrotate

# Configure /etc/logrotate.conf
# See: /etc/logrotate.d/
```

## 17. Performance Tuning

### 17.1 Preemption

For desktop use, enable preemption:

```bash
# Edit /etc/portage/make.conf
USE="preempt"
```

Then rebuild kernel:

```bash
emerge --ask sys-kernel/gentoo-sources
cd /usr/src/linux
make menuconfig
# Enable Preemptible Kernel (CONFIG_PREEMPT)
make -j$(nproc) && make modules_install && make install
```

### 17.2 CPU Frequency Scaling

```bash
# Install cpupower
emerge --ask sys-power/cpupower

# Configure
cpupower frequency-info
cpupower frequency-set -g performance
```

### 17.3 I/O Scheduler

```bash
# For SSD
echo "none" > /sys/block/sda/queue/scheduler

# For HDD
echo "mq-deadline" > /sys/block/sda/queue/scheduler

# Make persistent
echo "none" > /etc/conf.d/io-scheduler
```

### 17.4 Network Tuning

```bash
# TCP congestion control
sysctl -w net.ipv4.tcp_congestion_control=bbr

# Make persistent in /etc/sysctl.d/99-custom.conf
net.ipv4.tcp_congestion_control = bbr
```

## Summary

Gentoo offers unlimited customization possibilities. This guide covers basic to advanced optimization techniques:

- **Basic**: Profile, USE flags, emerge options
- **Intermediate**: make.conf optimization, parallel compilation
- **Advanced**: LTO, tmpfs, system tuning

Remember:
- Always backup before major changes
- Test changes incrementally
- Refer to official Wiki for latest information

## What's Next?

- **Previous**: [Desktop Configuration](/posts/2025-11-25-gentoo-install-desktop/)
- **Related**: Explore Portage features, experiment with different profiles

---

> **Footnote**: This article is part of the **Gentoo Linux Installation Guide** series.
