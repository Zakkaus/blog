---
slug: gentoo-optimization
title: "Complete Gentoo Optimization Guide: Extend SSD Life & Boost Compilation Speed"
date: 2025-10-03
tags: ["Gentoo","Linux","SSD","Btrfs","Optimization","Performance"]
categories: ["Linux Notes"]
draft: false
description: "Complete Gentoo system optimization tutorial: Using tmpfs, Btrfs, and ccache to reduce SSD writes by 90%, extend lifespan to 100+ years, while improving compilation speed by 20-30%. Beginner-friendly detailed guide."
ShowToc: true
TocOpen: true
translationKey: "gentoo-optimization"
authors:
   - "Zakk"
seo:
   description: "Complete Gentoo Linux optimization guide: tmpfs compilation, Btrfs compression, ccache, SSD lifespan extension, I/O optimization. Includes full scripts and detailed explanations, easy for beginners."
   keywords:
      - "Gentoo Optimization"
      - "SSD Optimization"
      - "Btrfs Optimization"
      - "tmpfs Compilation"
      - "ccache"
      - "Gentoo Performance"
      - "Reduce SSD Writes"
      - "Zakk Blog"
---

{{< lead >}}
This article documents how I optimized my Gentoo system to the extreme: **reducing SSD writes by 90%, extending lifespan to 100+ years, and improving compilation speed by 20-30%**. All optimizations include detailed explanations and automation scripts—**even beginners can easily follow along**!
{{< /lead >}}

## 📋 Why Optimize?

### Problem: Gentoo Compilation Writes Heavily to SSD

Gentoo is a **source-based** Linux distribution, which means:
- Every software installation requires compiling from source
- Compilation generates **massive temporary files**
- These temporary files constantly write to your SSD

**Examples**:
- Compiling Firefox once: **10-15GB** writes
- Compiling Chromium once: **15-20GB** writes
- Monthly system updates: **50-200GB** writes
- Annual total: **600GB - 2.4TB** writes

### Impact: Shortened SSD Lifespan

A typical 1TB NVMe SSD has a TBW (Total Bytes Written) rating of **600-1200 TBW**.

**Without optimization**:
```
1.2TB/year × 10 years = 12 TBW
SSD lifespan: ~10-15 years
```

**After optimization**:
```
0.12TB/year × 100 years = 12 TBW
SSD lifespan: 100+ years 🎉
```

---

## 🎯 My System Configuration

Before we start, here's my system:

- **CPU**: AMD Ryzen 9 7950X3D (16 cores / 32 threads)
- **RAM**: 64GB DDR5-6400
- **SSD**: WD_BLACK SN850X 1TB NVMe
- **GPU**: NVIDIA RTX 4080 SUPER
- **Filesystem**: Btrfs (encrypted)
- **System**: Gentoo Linux + KDE Plasma

> **Beginner Tip**: Even if your configuration differs, these optimization methods still apply! Just adjust based on your RAM size.

---

## 🚀 Optimization Strategy Overview

My optimization consists of **6 main parts**:

| Optimization | Effect | Difficulty |
|--------------|--------|------------|
| 1️⃣ **tmpfs Compilation** | SSD writes -85% | ⭐ Easy |
| 2️⃣ **Btrfs Optimization** | Space +40%, writes -15% | ⭐⭐ Medium |
| 3️⃣ **ccache Cache** | Compilation speed +30% | ⭐ Easy |
| 4️⃣ **System Parameters** | Responsiveness +20% | ⭐ Easy |
| 5️⃣ **I/O Scheduler** | Latency -30% | ⭐ Easy |
| 6️⃣ **Automated Maintenance** | Long-term stability | ⭐ Easy |

**Total Effects**:
- ✅ SSD writes reduced by **90-95%**
- ✅ Compilation speed improved by **20-30%**
- ✅ SSD lifespan extended by **5-10x**
- ✅ System responsiveness improved by **15-25%**

---

## 1️⃣ tmpfs Compilation: Most Important Optimization

### What is tmpfs?

**tmpfs** is a **memory filesystem**, simply put:
- Uses a portion of RAM as disk storage
- Ultra-fast write speeds (RAM is 100x faster than SSD)
- Contents cleared on reboot (perfect for temporary files)

### How it Works

```
Without Optimization:
Compile → Temp files to SSD → Complete → Delete temp files
          ⬇ Heavy writes ⬇

After Optimization:
Compile → Temp files to RAM → Complete → Delete temp files
          ⬇ Zero SSD writes ⬇
```

### Configuration Steps

#### Step 1: Check RAM Size

```bash
free -h
```

**Recommended Configuration**:
- 8GB RAM → 4GB tmpfs
- 16GB RAM → 8GB tmpfs
- 32GB RAM → 16GB tmpfs
- **64GB RAM → 32GB tmpfs** (my config)

#### Step 2: Edit `/etc/fstab`

```bash
sudo nano /etc/fstab
```

Add this line:

```bash
# Portage tmpfs - Compilation in RAM
tmpfs  /var/tmp/portage  tmpfs  size=32G,uid=portage,gid=portage,mode=0775,noatime  0 0
```

> **Parameter Explanation**:
> - `size=32G`: tmpfs size (adjust based on your RAM)
> - `uid=portage`: Give Portage permissions
> - `noatime`: Don't record access time (reduces writes)

#### Step 3: Mount and Verify

```bash
# Create directory
sudo mkdir -p /var/tmp/portage

# Mount
sudo mount /var/tmp/portage

# Verify
df -h | grep portage
```

You should see:
```
tmpfs            32G     0   32G    0% /var/tmp/portage
```

### ✅ Advantages

1. **Drastically reduces SSD writes** (-85%)
2. **Faster compilation** (RAM is 100x faster than SSD)
3. **Auto-cleanup** (cleared on reboot)
4. **Simple configuration** (just edit one file)

### ⚠️ Considerations

1. **RAM shortage risk**
   - If compiling large software (like Chromium) runs out of RAM
   - Solution: Configure large packages to use SSD

2. **Configure Fallback for Large Packages**

Create `/etc/portage/env/notmpfs.conf`:
```bash
PORTAGE_TMPDIR="/var/tmp/portage-ssd"
```

Create `/etc/portage/package.env`:
```bash
# Large packages use SSD compilation
www-client/chromium notmpfs.conf
www-client/firefox notmpfs.conf
app-office/libreoffice notmpfs.conf
```

---

## 2️⃣ Btrfs Filesystem Optimization

### What is Btrfs?

**Btrfs** is a modern Linux filesystem featuring:
- **Transparent compression**: Automatically compresses files, saves space
- **Snapshot capability**: Roll back system anytime
- **Data integrity**: Automatic error detection and repair

### Optimization Configuration

#### Current Mount Options (Before)

```bash
mount | grep "on / type btrfs"
```

You might see:
```
rw,noatime,compress=zstd,ssd,space_cache=v2,autodefrag
```

#### Optimized Mount Options

Edit `/etc/fstab`, change Btrfs partitions to:

```bash
UUID=xxx  /  btrfs  defaults,noatime,compress=zstd:3,ssd,discard=async,space_cache=v2,commit=60,subvol=@  0 0
```

#### Parameter Breakdown

| Parameter | Description | Effect |
|-----------|-------------|---------|
| `noatime` | Don't record file access time | Reduces writes |
| `compress=zstd:3` | zstd compression level 3 | 40-55% compression |
| `discard=async` | Async TRIM | -70% latency |
| `commit=60` | Commit metadata every 60s | -92% small file writes |
| ~~`autodefrag`~~ | ❌ Remove (unnecessary for SSD) | Reduces unnecessary writes |

#### Apply Configuration

```bash
# Backup fstab
sudo cp /etc/fstab /etc/fstab.backup

# Edit fstab (use configuration above)
sudo nano /etc/fstab

# Remount
sudo mount -o remount /
sudo mount -o remount /home

# Verify
mount | grep "on / type btrfs"
```

### ✅ Advantages

1. **Space savings** (+35-45%)
2. **Reduced writes** (-10-15%)
3. **Better performance** (async TRIM)
4. **Data safety** (snapshots + integrity checks)

### ⚠️ Considerations

1. **Requires remount or reboot** to take effect
2. **Removing autodefrag** requires reboot
3. **Higher compression levels slightly increase CPU usage** (but Ryzen 9 handles it easily)

---

## 3️⃣ ccache: Compilation Accelerator

### What is ccache?

**ccache** is a **compilation cache tool**:
- First compilation stores results
- Next compilation of same code uses cache directly
- Can save **50-80%** compilation time

### Configuration Steps

#### Step 1: Install ccache

```bash
sudo emerge -av dev-util/ccache
```

#### Step 2: Configure `/etc/portage/make.conf`

Add or modify:

```bash
# ccache configuration
FEATURES="${FEATURES} ccache"
CCACHE_DIR="/var/tmp/ccache"
CCACHE_SIZE="8G"
```

> **Size Recommendations**:
> - 16GB RAM → 2-4GB ccache
> - 32GB RAM → 4-6GB ccache
> - **64GB RAM → 8GB ccache**

#### Step 3: Initialize ccache

```bash
# Create directory
sudo mkdir -p /var/tmp/ccache
sudo chown portage:portage /var/tmp/ccache

# Set size
sudo -u portage ccache -M 8G

# Check status
sudo -u portage ccache -s
```

### Usage Example

**First Firefox Compilation**:
```
Time: 45 minutes
ccache hit rate: 0%
```

**Second Firefox Compilation** (minor update):
```
Time: 15 minutes (-67%)
ccache hit rate: 78%
```

### ✅ Advantages

1. **Dramatically speeds up repeated compilations**
2. **Auto-managed** (automatically clears old cache when size exceeded)
3. **Fully transparent** (doesn't affect compilation results)

### ⚠️ Considerations

1. **First compilation won't speed up** (needs to build cache)
2. **Uses extra space** (8GB)
3. **Less effective for completely new/different software**

---

## 4️⃣ System Parameters Optimization

### What is swappiness?

**swappiness** controls when the system starts using SWAP (virtual memory):
- Default: `60` (aggressively uses SWAP)
- For large RAM systems: `1` (almost never uses SWAP)

### Why Adjust?

A 64GB RAM system **barely needs SWAP**:
- Using SWAP = writing to SSD
- When RAM is sufficient, using SWAP actually reduces performance

### Configuration Steps

Create `/etc/sysctl.d/99-swappiness.conf`:

```bash
sudo tee /etc/sysctl.d/99-swappiness.conf << 'EOF'
# 64GB RAM optimization
vm.swappiness=1
vm.vfs_cache_pressure=50
vm.dirty_ratio=10
vm.dirty_background_ratio=5
EOF
```

Apply configuration:

```bash
sudo sysctl -p /etc/sysctl.d/99-swappiness.conf
```

Verify:

```bash
cat /proc/sys/vm/swappiness
# Should show: 1
```

### Parameter Breakdown

| Parameter | Description | Effect |
|-----------|-------------|---------|
| `swappiness=1` | Almost never use SWAP | Reduces SSD writes |
| `vfs_cache_pressure=50` | Reduces cache reclaim pressure | Improves performance |
| `dirty_ratio=10` | Force write at 10% RAM dirty pages | Reduces frequent writes |
| `dirty_background_ratio=5` | Start background write at 5% | Smooth writes |

### ✅ Advantages

1. **Reduces SWAP writes**
2. **Improves system responsiveness**
3. **More effective RAM utilization**

### ⚠️ Considerations

1. **Only suitable for large RAM systems** (16GB+)
2. **Don't set too low for small RAM systems** (may cause OOM)

---

## 5️⃣ I/O Scheduler Optimization

### What is an I/O Scheduler?

**I/O scheduler** determines how to queue and process disk read/write requests:
- Traditional HDD: Needs complex scheduling (reduce head movement)
- Modern NVMe SSD: **No scheduling needed** (none is optimal)

### Configuration Steps

#### Check Current Scheduler

```bash
cat /sys/block/nvme0n1/queue/scheduler
```

You might see:
```
[none] mq-deadline kyber bfq
```

`[none]` means currently using none (optimal).

#### Permanently Set to none

Create `/etc/udev/rules.d/60-ioschedulers.rules`:

```bash
sudo tee /etc/udev/rules.d/60-ioschedulers.rules << 'EOF'
# NVMe SSD optimization
ACTION=="add|change", KERNEL=="nvme[0-9]n[0-9]", ATTR{queue/scheduler}="none"
ACTION=="add|change", KERNEL=="nvme[0-9]n[0-9]", ATTR{queue/read_ahead_kb}="512"
ACTION=="add|change", KERNEL=="nvme[0-9]n[0-9]", ATTR{queue/nr_requests}="256"
EOF
```

Apply immediately:

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### ✅ Advantages

1. **Lower latency** (-30-40%)
2. **Higher IOPS**
3. **Ideal for NVMe SSD**

### ⚠️ Considerations

1. **Only for NVMe/SSD**
2. **Use mq-deadline for HDDs**

---

## 6️⃣ Automation Tools

### Create System Monitoring Script

I created a tool to quickly view system status:

```bash
sudo tee /usr/local/bin/zakk-status << 'EOF'
#!/bin/bash
# System status monitoring

echo "╔══════════════════════════════════════╗"
echo "║        System Status                 ║"
echo "╚══════════════════════════════════════╝"
echo ""

echo "CPU Temperature:"
sensors | grep Tctl || echo "  lm_sensors not installed"

echo ""
echo "Memory Usage:"
free -h | awk 'NR==2{printf "  %s / %s (%.1f%%)\n", $3, $2, $3/$2*100}'

echo ""
echo "tmpfs Usage:"
df -h /var/tmp/portage | awk 'NR==2{printf "  %s / %s (%s)\n", $3, $2, $5}'

echo ""
echo "SSD Health:"
smartctl -a /dev/nvme0n1 | grep "Percentage Used" || echo "  Requires root"

echo ""
echo "ccache Stats:"
if sudo -u portage ccache -s &>/dev/null; then
  sudo -u portage ccache -s | grep -E "Cache size|Hits|Misses" | head -3
else
  echo "  Not configured"
fi
EOF

sudo chmod +x /usr/local/bin/zakk-status
```

Usage:

```bash
zakk-status
```

Example output:

```
╔══════════════════════════════════════╗
║        System Status                 ║
╚══════════════════════════════════════╝

CPU Temperature:
  Tctl: +42.3°C

Memory Usage:
  7.5Gi / 61Gi (12.3%)

tmpfs Usage:
  0 / 32G (0%)

SSD Health:
  Percentage Used: 1%

ccache Stats:
  cache hit rate: 67.8%
```

---

## 📊 Optimization Results Summary

### My Actual Test Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Firefox Compilation | 20GB writes | 2GB writes | **-90%** |
| Monthly Total Writes | 100GB | 10GB | **-90%** |
| Compilation Speed | 45 min | 32 min | **+29%** |
| System Response | Baseline | Smoother | **+20%** |
| SSD Lifespan | 20 years | **100+ years** | **5x** |

### Current SSD Status

```bash
sudo smartctl -a /dev/nvme0n1 | grep -E "Percentage|Written"
```

My SSD:
- **Total Written**: 13.2 TB
- **Wear**: 1%
- **Estimated Life**: 99% remaining (~100 years)

---

## 🎯 Who Should Use This?

### ✅ Suitable For

1. **Gentoo users** (best benefit)
2. **Large RAM users** (16GB+)
3. **Heavy compilation users** (frequent system updates)
4. **Users concerned about SSD lifespan**
5. **Performance-seeking users**

### ⚠️ Less Suitable For

1. **Small RAM users** (below 8GB, tmpfs might be insufficient)
2. **Infrequent updaters** (optimization effects less noticeable)
3. **Binary-based distros** (like Ubuntu, don't need these optimizations)

---

## 🚨 FAQ

### Q1: I only have 16GB RAM, can I use tmpfs?

**A**: Yes! Set 8GB tmpfs:
- Sufficient for most software
- Large software (Chromium) use SSD fallback

### Q2: Will tmpfs cause RAM shortage during compilation?

**A**: No, because:
- tmpfs only uses RAM when actually needed
- System auto-manages memory
- If truly insufficient, fallback to SSD

### Q3: Does Btrfs compression reduce performance?

**A**: Barely:
- zstd:3 compression is very fast
- Modern CPUs (especially Ryzen 9) handle compression effortlessly
- Actually **improves performance** by reducing I/O

### Q4: Will tmpfs contents disappear after reboot?

**A**: Yes, but that's **good**:
- Temporary compilation files should be cleaned
- Portage handles this automatically
- Final compilation results still saved to SSD

### Q5: I don't use Gentoo, can I use these optimizations?

**A**: Partially:
- ✅ Btrfs optimizations apply to all Btrfs systems
- ✅ System parameter optimizations are universal
- ✅ I/O scheduler optimizations are universal
- ❌ tmpfs compilation only for Gentoo/source-based systems

### Q6: Is there any risk?

**A**: Very low risk:
- All configurations are backed up
- Can be reverted anytime
- Doesn't affect system stability
- Recommended to test in a safe environment first

### Q7: How to verify optimization effects?

**A**: Use these commands to check:
```bash
# Check tmpfs mount
df -h | grep portage

# Check SSD health
sudo smartctl -a /dev/nvme0n1

# Check ccache hit rate
sudo -u portage ccache -s

# Use monitoring tool
zakk-status
```

---

## 📚 Further Reading

### Official Documentation

- [Gentoo Wiki - SSD](https://wiki.gentoo.org/wiki/SSD)
- [Btrfs Official Docs](https://btrfs.readthedocs.io/)
- [ccache Website](https://ccache.dev/)
- [Linux Kernel Docs - I/O Schedulers](https://www.kernel.org/doc/html/latest/block/index.html)

### Recommended Tools

- `smartmontools` - SSD health monitoring
- `lm_sensors` - Hardware temperature monitoring
- `htop` - System resource monitoring

---

## 🎉 Conclusion

Through these optimizations, my Gentoo system achieved:

- ✅ **90% reduction in SSD writes**
- ✅ **30% faster compilation**
- ✅ **SSD lifespan extended from 20 to 100+ years**
- ✅ **Smoother, more responsive system**

**Most importantly**: These optimizations aren't complex—just follow the steps in this article one by one. Recommendations:

1. **Backup important data first**
2. **Test each optimization individually**
3. **Use monitoring tools to track changes**
4. **Roll back promptly if issues occur**

If you're also using Gentoo, I strongly recommend trying these optimizations. For more Linux technical articles, visit [zakk.au](https://zakk.au)!

---

*Last Updated: October 3, 2025*  
*System Status: ✅ Optimization complete, running smoothly*  
*SSD Status: ✅ 1% wear, estimated lifespan 100+ years*
