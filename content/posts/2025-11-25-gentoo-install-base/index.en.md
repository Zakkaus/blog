---
title: "Gentoo Linux Installation Guide (Basic)"
date: 2025-11-25
summary: "Gentoo Linux basic system installation tutorial, covering partitioning, Stage3, kernel compilation, bootloader configuration, and more. Also includes LUKS full-disk encryption."
description: "The latest 2025 Gentoo Linux installation guide (Basic), covering UEFI installation process, kernel compilation, and more. Suitable for advanced Linux users and Gentoo beginners. Also includes LUKS full-disk encryption guide."
keywords:
  - Gentoo Linux
  - Linux Installation
  - Source Compilation
  - systemd
  - OpenRC
  - Portage
  - make.conf
  - Kernel Compilation
  - UEFI Installation
tags:
  - Gentoo
  - Linux
  - Tutorial
  - System Installation
categories:
  - tutorial
authors:
  - zakkaus
---

<div>

### Article Overview

This is Part 1 of the **Gentoo Linux Installation Guide** series: **Basic Installation**.

**Series Navigation**:
1. **Basic Installation (This Article)**: Installing Gentoo base system from scratch
2. [Desktop Configuration](/posts/2025-11-25-gentoo-install-desktop/): Graphics drivers, desktop environment, input methods
3. [Advanced Optimization](/posts/2025-11-25-gentoo-install-advanced/): make.conf optimization, LTO, system maintenance

**Recommended Reading Path**:
- As needed: Basic Installation (Sections 0-11) → Desktop Configuration (Section 12) → Advanced Optimization (Sections 13-17)

</div>

<div>

### About This Guide

This guide aims to provide a complete Gentoo installation walkthrough while **densely providing reference materials for learning**. The article contains numerous official Wiki links and technical documentation to help readers understand the principles and configuration details behind each step.

**This is not a simple copy-paste tutorial, but a guided learning resource** — the first step in using Gentoo is learning to read the Wiki yourself and solve problems. Make good use of search engines or even AI tools to find answers. When you encounter issues or need deeper understanding, please refer to the official handbook and the reference links provided in this article.

If you have questions or find any issues while reading, feel free to reach out through:
- **Gentoo Community**: [Gentoo Forums](https://forums.gentoo.org/) | IRC: #gentoo @ Libera.Chat

**Highly recommend following the official handbook**:
- [Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)
- [Gentoo Handbook: AMD64 (Simplified Chinese)](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn)

<p>✓ Last verified: November 25, 2025</p>

</div>

## What is Gentoo?

Gentoo Linux is a source-based Linux distribution known for its **high customizability** and **performance optimization**. Unlike other distributions, Gentoo lets you compile all software from source, which means:

- **Ultimate Performance**: All software is compiled and optimized for your hardware
- **Full Control**: You decide what your system includes and doesn't include
- **Deep Learning**: Gain deeper understanding of Linux by building the system yourself
- **Compilation Time**: Initial installation takes a long time (expect 3-6 hours)
- **Learning Curve**: Requires some Linux basics

<div>

<div>

**Who is it for?**
- Tech enthusiasts who want to learn Linux deeply
- Users who pursue system performance and customization
- Geeks who enjoy the DIY process

</div>

<div>

**Who is it NOT for?**
- Beginners who just want a quick install (try Ubuntu, Fedora first)
- Users who don't have time to tinker with their system

</div>

</div>

<details>
<summary><b>Core Concepts Overview (Click to Expand)</b></summary>

Before starting the installation, let's understand some core concepts:

**Stage3** ([Wiki](https://wiki.gentoo.org/wiki/Stage_file))
A minimal Gentoo base system tarball. It contains the basic toolchain (compiler, libraries, etc.) needed to build a complete system. You'll extract it to your hard drive as the "foundation" of your new system.

**Portage** ([Wiki](https://wiki.gentoo.org/wiki/Portage))
Gentoo's package manager. Rather than installing pre-compiled packages, it downloads source code, compiles it according to your configuration, and installs it. The core command is `emerge`.

**USE Flags** ([Wiki](https://wiki.gentoo.org/wiki/USE_flag))
Feature switches that control software functionality. For example, `USE="bluetooth"` enables Bluetooth support in all software that supports it during compilation. This is the core of Gentoo customization.

**Profile** ([Wiki](https://wiki.gentoo.org/wiki/Profile_(Portage)))
A default system configuration template. For example, the `desktop/plasma/systemd` profile automatically enables default USE flags suitable for a KDE Plasma desktop.

**Emerge** ([Wiki](https://wiki.gentoo.org/wiki/Emerge))
Portage's command-line tool. Common commands:
- `emerge --ask <package>` - Install software
- `emerge --sync` - Sync software repository
- `emerge -avuDN @world` - Update the entire system

</details>

<details>
<summary><b>Installation Time Estimate (Click to Expand)</b></summary>

| Step | Estimated Time |
|---|------------|
| Prepare installation media | 10-15 min |
| Disk partitioning & formatting | 15-30 min |
| Download & extract Stage3 | 5-10 min |
| Configure Portage & Profile | 15-20 min |
| **Compile kernel** (most time-consuming) | **30 min - 2 hours** |
| Install system tools | 20-40 min |
| Configure bootloader | 10-15 min |
| **Install desktop environment** (optional) | **1-3 hours** |
| **Total** | **3-6 hours** (depending on hardware) |

<div>

**Tip**

Using pre-compiled kernels and binary packages can significantly reduce time, but at the cost of some customization.

</div>

</details>

<details>
<summary><b>Disk Space Requirements & Pre-Installation Checklist (Click to Expand)</b></summary>

### Disk Space Requirements

- **Minimal installation**: 10 GB (no desktop environment)
- **Recommended**: 30 GB (lightweight desktop)
- **Comfortable**: 80 GB+ (full desktop + compilation cache)

### Pre-Installation Checklist

- All important data has been backed up
- An 8GB+ USB flash drive is prepared
- Stable network connection (wired is best)
- Sufficient time reserved (recommend a full half-day)
- Some Linux command-line experience
- Another device available to reference documentation (or use a GUI LiveCD)

</details>

---

<div>

### Guide Overview

This guide will walk you through installing Gentoo Linux on an x86_64 UEFI platform.

**This guide will teach you**:
- Installing the Gentoo base system from scratch (partitioning, Stage3, kernel, bootloader)
- Configuring Portage and optimizing compilation parameters (make.conf, USE flags, CPU flags)
- Installing a desktop environment (KDE Plasma, GNOME, Hyprland)
- Configuring multilingual support (locale, fonts, Fcitx5 input method)
- Optional advanced configuration (LUKS full-disk encryption, LTO optimization, kernel tuning)
- System maintenance (SSD TRIM, power management, Flatpak, system updates)

</div>

<div>

**Important Notice**

**Please disable Secure Boot first**
Before starting the installation, enter your BIOS settings and temporarily disable **Secure Boot**. Enabling Secure Boot may prevent the installation media from booting, or prevent the installed system from booting. You can re-enable Secure Boot after installation is complete and the system is successfully booting.

**Back up all important data!**
This guide involves disk partitioning operations. Please back up all important data before starting!

</div>

---

## 0. Prepare Installation Media {#step-0-prepare}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Choosing the Installation Media](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Media)

</div>

### 0.1 Download Gentoo ISO

Obtain the download link from the [**downloads page**](https://www.gentoo.org/downloads/)

<div>

**Note**

The date in the links below (e.g. `20251123T...`) is for reference only. Always select the **latest dated** file from the mirror.

</div>

Download the Minimal ISO (using official Gentoo mirrors):
```bash
# Use mirrorselect to find the closest mirror
emerge --ask app-portage/mirrorselect
mirrorselect -i -r -D

# Or download directly from the official mirror list:
# https://www.gentoo.org/downloads/mirrors/
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/20251123T153051Z/install-amd64-minimal-20251123T153051Z.iso
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/20251123T153051Z/install-amd64-minimal-20251123T153051Z.iso.asc
```

<div>

**Beginners: Use the LiveGUI USB Image**

If you want to use a browser during installation or connect to Wi-Fi more easily, choose the **LiveGUI USB Image** from the [official downloads page](https://www.gentoo.org/downloads/).

The official Gentoo LiveGUI image includes:
- KDE Plasma desktop environment
- Browser and Wi-Fi support
- Multiple terminal support
- Login credentials: `live` / `live` / `live`

</div>

Verify signature (optional):
```bash
# Get the Gentoo release signing key
gpg --keyserver hkps://keys.openpgp.org --recv-keys 0xBB572E0E2D1829105A8D0F7CF7A88992

# Verify the ISO signature
gpg --verify install-amd64-minimal-20251123T153051Z.iso.asc install-amd64-minimal-20251123T153051Z.iso
```

### 0.2 Create Bootable USB

**Linux:**
```bash
sudo dd if=install-amd64-minimal-20251123T153051Z.iso of=/dev/sdX bs=4M status=progress oflag=sync
# Replace sdX with your USB device name (e.g., /dev/sdb)
```

**Windows:** Use [Rufus](https://rufus.ie/) → Select ISO → Choose DD mode when writing.

---

## 1. Enter Live Environment and Connect to Network {#step-1-network}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Configuring the Network](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Networking)

</div>

<div>

**Why is this step needed?**

Gentoo's installation process relies entirely on the network to download source packages (Stage3) and the software repository (Portage). Configuring the network in the Live environment is the first step of installation.

</div>

### 1.1 Wired Network

```bash
ip link        # View network interface names (e.g., eno1, eth0)
dhcpcd eno1    # Enable DHCP on the wired interface
ping -c3 gentoo.org # Test network connectivity
```

### 1.2 Wireless Network
Using net-setup:
```bash
net-setup
```

**wpa_supplicant:**
```bash
wpa_passphrase "SSID" "PASSWORD" | tee /etc/wpa_supplicant/wpa_supplicant.conf
wpa_supplicant -B -i wlp0s20f3 -c /etc/wpa_supplicant/wpa_supplicant.conf
dhcpcd wlp0s20f3
```

<div>

**Note**

If WPA3 is unstable, try falling back to WPA2.

</div>

<details>
<summary><b>Advanced Settings: Enable SSH for Remote Access (Click to Expand)</b></summary>

```bash
passwd                      # Set root password (required for remote login)
rc-service sshd start       # Start SSH service
rc-update add sshd default  # Enable SSH on boot (optional in Live environment)
ip a | grep inet            # View current IP address
# From another device: ssh root@<IP>
```

</details>


## 2. Plan Disk Partitioning {#step-2-partition}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Preparing the Disks](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks)

</div>

<div>

**Why is this step needed?**

We need to allocate dedicated storage space for the Linux system. UEFI systems typically need an ESP partition (boot) and a root partition (system). Proper planning makes future maintenance easier.

### What is the EFI System Partition (ESP)?

When installing Gentoo on a system that boots via UEFI (rather than BIOS), creating an EFI System Partition (ESP) is required. The ESP must be a FAT variant (sometimes displayed as vfat on Linux systems). The official UEFI specification states that UEFI firmware recognizes FAT12, 16, or 32 file systems, but FAT32 is recommended.

</div>

<div>

**Warning**
If the ESP is not formatted with a FAT variant, the system's UEFI firmware will not find the bootloader (or Linux kernel) and will likely be unable to boot the system!

</div>

### Recommended Partition Scheme (UEFI)

The table below provides a recommended default partition layout for a Gentoo installation.

| Device Path | Mount Point | Filesystem | Description |
| :--- | :--- | :--- | :--- |
| `/dev/nvme0n1p1` | `/efi` | vfat | EFI System Partition (ESP) |
| `/dev/nvme0n1p2` | `swap` | swap | Swap partition |
| `/dev/nvme0n1p3` | `/` | xfs | Root partition |

### cfdisk Practical Example (Recommended)

`cfdisk` is a graphical partitioning tool with a simple, intuitive interface.

```bash
cfdisk /dev/nvme0n1
```

**Operation tips**:
1. Select **GPT** label type.
2. **Create ESP**: New partition → size `1G` → type `EFI System`.
3. **Create Swap**: New partition → size `4G` → type `Linux swap`.
4. **Create Root**: New partition → remaining space → type `Linux filesystem` (default).
5. Select **Write** to write changes, type `yes` to confirm.
6. Select **Quit** to exit.

<details>
<summary><b>Advanced Settings: fdisk Command-Line Partitioning (Click to Expand)</b></summary>

`fdisk` is a powerful command-line partitioning tool.

```bash
fdisk /dev/nvme0n1
```

**1. View current partition layout**

Use the `p` key to display the current disk partition configuration.

```text
Command (m for help): p
Disk /dev/nvme0n1: 931.51 GiB, 1000204886016 bytes, 1953525168 sectors
Disk model: NVMe SSD
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: gpt
Disk identifier: 3E56EE74-0571-462B-A992-9872E3855D75

Device           Start        End    Sectors   Size Type
/dev/nvme0n1p1    2048    2099199    2097152     1G EFI System
/dev/nvme0n1p2 2099200   10487807    8388608     4G Linux swap
/dev/nvme0n1p3 10487808 1953523711 1943035904 926.5G Linux root (x86-64)
```

**2. Create a new disk label**

Press `g` to immediately delete all existing partitions and create a new GPT disk label:

```text
Command (m for help): g
Created a new GPT disklabel (GUID: ...).
```

**3. Create EFI System Partition (ESP)**

Enter `n` to create a new partition, select partition number 1, accept the default first sector (2048), and enter `+1G` for the last sector:

```text
Command (m for help): n
Partition number (1-128, default 1): 1
First sector (2048-..., default 2048): <Enter>
Last sector, +/-sectors or +/-size{K,M,G,T,P} (...): +1G

Created a new partition 1 of type 'Linux filesystem' and of size 1 GiB.
```

Mark the partition as EFI System (type code 1):

```text
Command (m for help): t
Selected partition 1
Partition type or alias (type L to list all): 1
Changed type of partition 'Linux filesystem' to 'EFI System'.
```

**4. Create Swap partition**

```text
Command (m for help): n
Partition number (2-128, default 2): 2
First sector (...): <Enter>
Last sector (...): +4G

Command (m for help): t
Partition number (1,2, default 2): 2
Partition type or alias (type L to list all): 19
Changed type of partition 'Linux filesystem' to 'Linux swap'.
```
*(Note: Type 19 is Linux swap)*

**5. Create root partition**

```text
Command (m for help): n
Partition number (3-128, default 3): 3
First sector (...): <Enter>
Last sector (...): <Enter>

Created a new partition 3 of type 'Linux filesystem' and of size 926.5 GiB.
```

**6. Write changes**

After verifying, enter `w` to write changes and exit:

```text
Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

</details>

---

## 3. Create Filesystems and Mount {#step-3-filesystem}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Preparing the Disks](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks) · [Ext4](https://wiki.gentoo.org/wiki/Ext4) · [XFS](https://wiki.gentoo.org/wiki/XFS) · [Btrfs](https://wiki.gentoo.org/wiki/Btrfs)

</div>

<div>

**Why is this step needed?**

Disk partitioning only allocates space, but doesn't enable data storage yet. Creating a filesystem (such as ext4, Btrfs) allows the operating system to manage and access that space. Mounting connects these filesystems to specific locations in the Linux file tree.

</div>

### 3.1 Format

```bash
mkfs.fat -F 32 /dev/nvme0n1p1  # Format ESP partition as FAT32
mkswap /dev/nvme0n1p2          # Format Swap partition
mkfs.xfs /dev/nvme0n1p3        # Format Root partition as XFS
```

For Btrfs:
```bash
mkfs.btrfs -L gentoo /dev/nvme0n1p3
```

For ext4:
```bash
mkfs.ext4 /dev/nvme0n1p3
```

### 3.2 Mount (XFS example)

```bash
mount /dev/nvme0n1p3 /mnt/gentoo        # Mount root partition
mkdir -p /mnt/gentoo/efi                # Create ESP mount point
mount /dev/nvme0n1p1 /mnt/gentoo/efi    # Mount ESP partition
swapon /dev/nvme0n1p2                   # Enable Swap partition
```

<details>
<summary><b>Advanced Settings: Btrfs Subvolume Example (Click to Expand)</b></summary>

**1. Format**

```bash
mkfs.fat -F 32 /dev/nvme0n1p1  # Format ESP
mkswap /dev/nvme0n1p2          # Format Swap
mkfs.btrfs -L gentoo /dev/nvme0n1p3 # Format Root (Btrfs)
```

**2. Create subvolumes**

```bash
mount /dev/nvme0n1p3 /mnt/gentoo
btrfs subvolume create /mnt/gentoo/@
btrfs subvolume create /mnt/gentoo/@home
umount /mnt/gentoo
```

**3. Mount subvolumes**

```bash
mount -o compress=zstd,subvol=@ /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/{efi,home}
mount -o subvol=@home /dev/nvme0n1p3 /mnt/gentoo/home
mount /dev/nvme0n1p1 /mnt/gentoo/efi    # Note: ESP must be FAT32
swapon /dev/nvme0n1p2
```

**4. Verify mounts**

```bash
lsblk
```

Output example:
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
nvme0n1          259:1    0 931.5G  0 disk
├─nvme0n1p1      259:7    0     1G  0 part  /mnt/gentoo/efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  /mnt/gentoo/home
                                            /mnt/gentoo
```

<div>

**Btrfs Snapshot Recommendation**

It is recommended to use [Snapper](https://wiki.gentoo.org/wiki/Snapper) to manage snapshots. A proper subvolume layout (e.g., separating `@` and `@home`) makes system rollback much easier.

</div>

</details>

<details>
<summary><b>Advanced Settings: Encrypted Partition (LUKS) (Click to Expand)</b></summary>

**1. Create encrypted container**

```bash
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p3
```

**2. Open encrypted container**

```bash
cryptsetup luksOpen /dev/nvme0n1p3 gentoo-root
```

**3. Format**

```bash
mkfs.fat -F 32 /dev/nvme0n1p1       # Format ESP
mkswap /dev/nvme0n1p2               # Format Swap
mkfs.btrfs --label root /dev/mapper/gentoo-root # Format Root (Btrfs)
```

**4. Mount**

```bash
mount /dev/mapper/gentoo-root /mnt/gentoo
mkdir -p /mnt/gentoo/efi
mount /dev/nvme0n1p1 /mnt/gentoo/efi
swapon /dev/nvme0n1p2
```

</details>

---

<div>

**Recommendation**

After mounting, use `lsblk` to verify mount points are correct.

```bash
lsblk
```

**Output example**:
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
 nvme0n1          259:1    0 931.5G  0 disk
├─nvme0n1p1      259:7    0     1G  0 part  /efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  /
```

</div>

## 4. Download Stage3 and Enter chroot {#step-4-stage3}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Installing the Gentoo Installation Files](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage) · [Stage file](https://wiki.gentoo.org/wiki/Stage_file)

</div>

<div>

**Why is this step needed?**

Stage3 is a minimal Gentoo base system environment. We extract it to the hard drive as the "foundation" of the new system, then use `chroot` to enter this new environment for subsequent configuration.

</div>

### 4.1 Choose Stage3

- **OpenRC**: `stage3-amd64-openrc-*.tar.xz`
- **systemd**: `stage3-amd64-systemd-*.tar.xz`
- Desktop variants just have some USE flags pre-enabled; the standard version is more flexible.

### 4.2 Download and Extract

```bash
cd /mnt/gentoo

# Gentoo provides a txt file with the latest Stage3 path — use it to auto-detect:
# For OpenRC:
STAGE3=$(wget -qO- https://distfiles.gentoo.org/releases/amd64/autobuilds/latest-stage3-amd64-openrc.txt | grep -v '^#' | cut -d' ' -f1)
# For systemd:
# STAGE3=$(wget -qO- https://distfiles.gentoo.org/releases/amd64/autobuilds/latest-stage3-amd64-systemd.txt | grep -v '^#' | cut -d' ' -f1)

wget "https://distfiles.gentoo.org/releases/amd64/autobuilds/${STAGE3}"
wget "https://distfiles.gentoo.org/releases/amd64/autobuilds/${STAGE3}.asc"
```

> **Alternative**: Visit [https://www.gentoo.org/downloads/](https://www.gentoo.org/downloads/), right-click your chosen Stage3 variant → "Copy link address", then paste after `wget`.

```bash
# Verify signature (recommended)
gpg --verify stage3-*.tar.xz.asc stage3-*.tar.xz

# Extract Stage3
# x:extract p:preserve permissions v:verbose f:specify file --numeric-owner:use numeric IDs
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```


### 4.3 Copy DNS and Mount Pseudo-Filesystems

```bash
cp --dereference /etc/resolv.conf /mnt/gentoo/etc/ # Copy DNS configuration
mount --types proc /proc /mnt/gentoo/proc          # Mount process information
mount --rbind /sys /mnt/gentoo/sys                 # Bind mount system information
mount --rbind /dev /mnt/gentoo/dev                 # Bind mount device nodes
mount --rbind /run /mnt/gentoo/run                 # Bind mount runtime information
mount --make-rslave /mnt/gentoo/sys                # Set as slave mount (prevents affecting host on unmount)
mount --make-rslave /mnt/gentoo/dev
mount --make-rslave /mnt/gentoo/run
```

> OpenRC users can omit the `/run` step.

### 4.4 Enter chroot

```bash
chroot /mnt/gentoo /bin/bash    # Switch root directory to new system
source /etc/profile             # Load environment variables
export PS1="(chroot) ${PS1}"    # Modify prompt to distinguish environment
```

---

## 5. Initialize Portage and make.conf {#step-5-portage}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Installing the Gentoo Base System](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base)

</div>

<div>

**Why is this step needed?**

Portage is Gentoo's package management system and its core feature. Initializing Portage and configuring `make.conf` is like setting the "build blueprint" for your new system, determining how software is compiled, what features are included, and where to download from.

</div>

### 5.1 Sync Tree

```bash
emerge-webrsync   # Get the latest Portage snapshot (faster than rsync)
emerge --sync     # Sync Portage tree (get latest ebuilds)
emerge --ask app-editors/vim # Install Vim editor (recommended)
eselect editor list          # List available editors
eselect editor set vi        # Set Vim as default editor
```

Configure mirror (choose one):
```bash
mirrorselect -i -o >> /etc/portage/make.conf
# Or manually set a mirror from the official list:
# https://www.gentoo.org/downloads/mirrors/
```

### 5.2 make.conf Example

<div>

**Reference**: [Gentoo Handbook: AMD64 - USE Flags](https://wiki.gentoo.org/wiki/Handbook:AMD64/Working/USE) · [/etc/portage/make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

</div>

Edit `/etc/portage/make.conf`:
```bash
vim /etc/portage/make.conf
```

**Quick/beginner configuration (copy-paste ready)**:
<div>

**Tip**

Adjust the `-j` value in `MAKEOPTS` to match your CPU core count (e.g., use `-j8` for an 8-core CPU).

</div>

```conf
# ========== Compilation Optimization Flags ==========
# -march=native: Optimize for the current CPU architecture
# -O2: Recommended optimization level, balancing performance and compile time
# -pipe: Use pipes to speed up compilation
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"    # C compiler flags
CXXFLAGS="${COMMON_FLAGS}"  # C++ compiler flags
FCFLAGS="${COMMON_FLAGS}"   # Fortran compiler flags
FFLAGS="${COMMON_FLAGS}"    # Fortran 77 compiler flags

# ========== Parallel Compilation Settings ==========
# The number after -j = CPU thread count (run nproc to check)
# Reduce if running low on memory (e.g., -j4)
MAKEOPTS="-j8"

# ========== Language & Localization ==========
# LC_MESSAGES=C: Keep build output in English for easier searching
LC_MESSAGES=C
# L10N/LINGUAS: Supported languages (affects software translations and docs)
L10N="en en-US"
LINGUAS="en en_US"

# ========== Mirror Configuration ==========
# Use mirrorselect to pick the nearest mirror automatically
# Official mirror list: https://www.gentoo.org/downloads/mirrors/

# ========== USE Flags ==========
# systemd: Use systemd as init (change to -systemd for OpenRC)
# dist-kernel: Use distribution kernel (recommended for beginners)
# Others: dbus/policykit required for desktop, networkmanager for network management
USE="systemd udev dbus policykit networkmanager bluetooth git dist-kernel"

# ========== License Configuration ==========
# "*" accepts all licenses; "@FREE" accepts only free software
ACCEPT_LICENSE="*"
```

<details>
<summary><b>Detailed Configuration Example (Recommended Reading) (Click to Expand)</b></summary>

```conf
# vim: set filetype=bash  # Tell Vim to use bash syntax highlighting

# ========== System Architecture (do not modify manually) ==========
CHOST="x86_64-pc-linux-gnu"

# ========== Compilation Optimization Flags ==========
# -march=native    Optimize for current CPU architecture
#                  Note: compiled programs may not run on other CPUs
# -O2              Recommended optimization level, balanced performance and stability
#                  Avoid -O3, which may cause some software to fail to compile
# -pipe            Use pipes instead of temp files, speeds up compilation
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"      # C compiler flags
CXXFLAGS="${COMMON_FLAGS}"    # C++ compiler flags
FCFLAGS="${COMMON_FLAGS}"     # Fortran compiler flags
FFLAGS="${COMMON_FLAGS}"      # Fortran 77 compiler flags

# CPU instruction set optimization (run cpuid2cpuflags to auto-generate)
# CPU_FLAGS_X86="aes avx avx2 f16c fma3 mmx mmxext pclmul popcnt sse sse2 ..."

# ========== Parallel Compilation Settings ==========
MAKEOPTS="-j8"  # Adjust to your actual CPU thread count

# ========== Language & Localization ==========
LC_MESSAGES=C
L10N="en en-US"
LINGUAS="en en_US"

# ========== Mirror Configuration ==========
# Use mirrorselect to automatically choose the best mirror:
# mirrorselect -i -o >> /etc/portage/make.conf
# Official mirror list: https://www.gentoo.org/downloads/mirrors/

# ========== Emerge Default Options ==========
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"

# ========== USE Flags (global feature switches) ==========
USE="systemd udev dbus policykit networkmanager bluetooth git dist-kernel"

# ========== License Configuration ==========
ACCEPT_LICENSE="*"

# ========== Video Card Configuration (optional) ==========
# Choose based on your GPU:
# VIDEO_CARDS="intel"
# VIDEO_CARDS="amdgpu radeonsi"
# VIDEO_CARDS="nvidia"

# ========== Portage Logging (recommended) ==========
PORTAGE_ELOG_CLASSES="warn error log"
PORTAGE_ELOG_SYSTEM="save"
```

</details>

<div>

**Beginner Tips**

- The number in `MAKEOPTS="-j8"` should match your CPU thread count, check with `nproc`
- If you run out of memory during compilation, reduce parallel jobs (e.g., change to `-j4`)
- USE flags are Gentoo's core feature, determining which features are compiled into software

</div>

<details>
<summary><b>Advanced Settings: CPU Instruction Set Optimization (CPU_FLAGS_X86) (Click to Expand)</b></summary>

<div>

**Reference**: [CPU_FLAGS_*](https://wiki.gentoo.org/wiki/CPU_FLAGS_*)

</div>

To let Portage know which CPU instruction sets your processor supports (e.g., AES, AVX, SSE4.2), configure `CPU_FLAGS_X86`.

Install detection tool:
```bash
emerge --ask app-portage/cpuid2cpuflags
```

Run detection and write to config:
```bash
cpuid2cpuflags >> /etc/portage/make.conf
```

Check the end of `/etc/portage/make.conf`, you should see something like:
```conf
CPU_FLAGS_X86="aes avx avx2 f16c fma3 mmx mmxext pclmul popcnt rdrand sse sse2 sse3 sse4_1 sse4_2 ssse3"
```

</details>

---

## 6. Profile, System Settings & Localization {#step-6-system}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Installing the Gentoo Base System](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base)

</div>

### 6.1 Choose Profile

```bash
eselect profile list          # List all available profiles
eselect profile set <number>  # Set the selected profile
emerge -avuDN @world          # Update system to match new profile
```

Common options:
- `default/linux/amd64/23.0/desktop/plasma/systemd`
- `default/linux/amd64/23.0/desktop/gnome/systemd`
- `default/linux/amd64/23.0/desktop` (OpenRC desktop)

### 6.2 Timezone and Locale

<div>

**Reference**: [Gentoo Wiki: Localization/Guide](https://wiki.gentoo.org/wiki/Localization/Guide)

</div>

```bash
# Set timezone (use your actual timezone)
# List available timezones:
ls /usr/share/zoneinfo/
# Examples: UTC, America/New_York, Europe/London, Asia/Tokyo, Australia/Sydney

echo "UTC" > /etc/timezone
emerge --config sys-libs/timezone-data

echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
locale-gen                      # Generate selected locales
eselect locale set en_US.utf8   # Set system default locale
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

### 6.3 Hostname and Network Configuration

**Set hostname**:
```bash
echo "gentoo" > /etc/hostname
```

**Network manager options**:

**Option A: NetworkManager (recommended, universal)**
<div>

**Reference**: [NetworkManager](https://wiki.gentoo.org/wiki/NetworkManager)

</div>

Suitable for most desktop users, supports both OpenRC and systemd.
```bash
emerge --ask net-misc/networkmanager
# OpenRC:
rc-update add NetworkManager default
# systemd:
systemctl enable NetworkManager
```

<div>

**Configuration Tips**

**GUI**: Run `nm-connection-editor`
**CLI**: Use `nmtui` (graphical wizard) or `nmcli`

</div>

<details>
<summary><b>Advanced: Use iwd backend (Click to Expand)</b></summary>

NetworkManager supports using `iwd` as the backend (faster than wpa_supplicant).

```bash
echo "net-misc/networkmanager iwd" >> /etc/portage/package.use/networkmanager
emerge --ask --newuse net-misc/networkmanager
```
Then edit `/etc/NetworkManager/NetworkManager.conf`, and add `wifi.backend=iwd` under `[device]`.

</details>

<details>
<summary><b>Option B: Lightweight Options (Click to Expand)</b></summary>

1. **Wired network (dhcpcd)**
<div>

**Reference**: [dhcpcd](https://wiki.gentoo.org/wiki/Dhcpcd)

</div>

   ```bash
   emerge --ask net-misc/dhcpcd
   # OpenRC:
   rc-update add dhcpcd default
   # systemd:
   systemctl enable dhcpcd
   ```

2. **Wireless network (iwd)**
<div>

**Reference**: [iwd](https://wiki.gentoo.org/wiki/Iwd)

</div>

   ```bash
   emerge --ask net-wireless/iwd
   # OpenRC:
   rc-update add iwd default
   # systemd:
   systemctl enable iwd
   ```

> **Tip**: iwd is a modern, lightweight wireless daemon.

</details>

<details>
<summary><b>Option C: Native Network Management (Click to Expand)</b></summary>

Use the init system's built-in network management, suitable for servers or minimal environments.

**OpenRC network interface service**:
<div>

**Reference**: [OpenRC](https://wiki.gentoo.org/wiki/OpenRC) · [OpenRC: Network Management](https://wiki.gentoo.org/wiki/OpenRC#Network_management)

</div>

```bash
vim /etc/conf.d/net
```

<div>

**Note**

Replace `enp5s0` below with your actual network interface name (check with `ip link`).

</div>

Write the following:
```conf
config_enp5s0="dhcp"
```

```bash
ln -s /etc/init.d/net.lo /etc/init.d/net.enp5s0 # Create symlink for network service
rc-update add net.enp5s0 default                # Enable at boot
```

---

**Systemd native network management**:
<div>

**Reference**: [systemd-networkd](https://wiki.gentoo.org/wiki/Systemd/systemd-networkd) · [systemd-resolved](https://wiki.gentoo.org/wiki/Systemd/systemd-resolved)

</div>

systemd includes built-in network management, suitable for servers or minimal environments:
```bash
systemctl enable systemd-networkd
systemctl enable systemd-resolved
```
*Note: Requires manually writing `.network` configuration files.*

</details>



### 6.4 Configure fstab

<div>

**Reference**: [Gentoo Handbook: AMD64 - fstab](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/System) · [Gentoo Wiki: /etc/fstab](https://wiki.gentoo.org/wiki//etc/fstab)

</div>

<div>

**Why is this step needed?**

The system needs to know which partitions to mount at boot. The `/etc/fstab` file is like a "partition list" that tells the system:

- Which partitions to automatically mount at boot
- Where each partition is mounted
- What filesystem type to use

**Use UUID**: Device paths (e.g., `/dev/sda1`) may change with hardware changes, but UUIDs are unique filesystem identifiers that never change.

</div>

---

#### Method A: Auto-generate with genfstab (Recommended)

<details>
<summary><b>Click to Expand for Detailed Steps</b></summary>

<div>

**Installing genfstab**

`genfstab` is included in the `sys-fs/genfstab` package.

- **Gentoo LiveGUI / Arch LiveISO**: Pre-installed, can be used directly
- **Gentoo Minimal ISO**: Install first with `emerge --ask sys-fs/genfstab`

</div>

**Standard usage (run outside chroot):**

```bash
# 1. Confirm all partitions are correctly mounted
lsblk
mount | grep /mnt/gentoo

# 2. Generate fstab (using UUID)
genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab

# 3. Check the generated file
cat /mnt/gentoo/etc/fstab
```

<details>
<summary><b>Alternative if already in chroot</b></summary>

If you've already chrooted into the new system, you can:

**Method 1: Run inside chroot (simplest)**

```bash
emerge --ask sys-fs/genfstab
genfstab -U / >> /etc/fstab
vim /etc/fstab  # Check and clean up extra entries (e.g., /proc, /sys, /dev)
```

**Method 2: Open a new terminal window (LiveGUI)**

If using a Live environment with a GUI (like the official Gentoo LiveGUI), open a new terminal:

```bash
genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab
```

**Method 3: TTY switch (Minimal ISO)**

1. Press `Ctrl+Alt+F2` to switch to a new TTY (Live environment)
2. Install and run:
   ```bash
   emerge --ask sys-fs/genfstab
   genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab
   ```
3. Press `Ctrl+Alt+F1` to return to chroot

</details>

</details>

---

#### Method B: Manual Edit

<details>
<summary><b>Click to Expand for Manual Configuration</b></summary>

**1. Get partition UUIDs**

```bash
blkid
```

Output example:
```text
/dev/nvme0n1p1: UUID="7E91-5869" TYPE="vfat" PARTLABEL="EFI"
/dev/nvme0n1p2: UUID="7fb33b5d-..." TYPE="swap" PARTLABEL="swap"
/dev/nvme0n1p3: UUID="8c08f447-..." TYPE="xfs" PARTLABEL="root"
```

**2. Edit fstab**

```bash
vim /etc/fstab
```

**Basic configuration example (ext4/xfs):**

```fstab
# <UUID>                                   <Mount>      <Type> <Options>         <dump> <fsck>
UUID=7E91-5869                             /efi         vfat   defaults,noatime  0      2
UUID=7fb33b5d-4cff-47ff-ab12-7b461b5d6e13  none         swap   sw                0      0
UUID=8c08f447-c79c-4fda-8c08-f447c79ce690  /            xfs    defaults,noatime  0      1
```

</details>

---

## 7. Kernel and Firmware {#step-7-kernel}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Configuring the Linux Kernel](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Kernel)

</div>

<div>

**Why is this step needed?**

The kernel is the core of the operating system, responsible for managing hardware. Gentoo allows you to manually trim the kernel, keeping only the drivers you need, for maximum performance and a lean system. Beginners can also choose a pre-compiled kernel to get started quickly.

</div>

### 7.1 Quick Option: Pre-compiled Kernel

```bash
emerge --ask sys-kernel/gentoo-kernel-bin
```

Remember to regenerate the bootloader configuration after kernel upgrades.

<details>
<summary><b>Advanced Settings: Manual Kernel Compilation (Click to Expand)</b></summary>
<br>

<div>

**Beginner Tip**

Kernel compilation is complex and time-consuming. If you want to experience Gentoo quickly, you can skip this section and use the pre-compiled kernel from 7.1.

</div>

Manual kernel compilation gives you full control over system features, removing unneeded drivers for a leaner, more efficient kernel customized for your hardware.

**Quick start** (using Genkernel for automation):
```bash
emerge --ask sys-kernel/gentoo-sources sys-kernel/genkernel
cd /usr/src/linux
genkernel --install all  # Auto-compile and install kernel, modules, and initramfs
                         # --install: Auto-install to /boot upon completion
                         # all: Full build (kernel + modules + initramfs)
```

<div>

**Advanced Content**

If you want to delve into kernel configuration, compile the kernel using LLVM/Clang, or enable LTO optimizations, please refer to the [Advanced Guide: Kernel Compilation](../2025-11-25-gentoo-install-advanced/#section-16-kernel-advanced).

</div>

</details>

---

### 7.2 Install Firmware and Microcode

```bash
mkdir -p /etc/portage/package.license
# Accept the Linux firmware license terms
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' > /etc/portage/package.license/linux-firmware
echo 'sys-kernel/installkernel dracut' > /etc/portage/package.use/installkernel
emerge --ask sys-kernel/linux-firmware
emerge --ask sys-firmware/intel-microcode  # Intel CPU users
```

---

## 8. Base Tools {#step-8-base-packages}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Installing the Necessary System Tools](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Tools)

</div>

<div>

**Why is this step needed?**

Stage3 only has the most basic commands. We need to add essential components like system logging, network management, and filesystem tools to make the system work correctly after rebooting.

</div>

### 8.1 System Service Tools

<details>
<summary><b>OpenRC User Configuration (Click to Expand)</b></summary>

**1. System logging**

<div>

**Reference**: [Syslog-ng](https://wiki.gentoo.org/wiki/Syslog-ng)

</div>

```bash
emerge --ask app-admin/syslog-ng
rc-update add syslog-ng default
```

**2. Cron (scheduled tasks)**

```bash
emerge --ask sys-process/cronie
rc-update add cronie default
```

**3. Time synchronization**

<div>

**Reference**: [System Time](https://wiki.gentoo.org/wiki/System_time) · [System Time (OpenRC)](https://wiki.gentoo.org/wiki/System_time#OpenRC)

</div>

```bash
emerge --ask net-misc/chrony
rc-update add chronyd default
```

</details>

<details>
<summary><b>systemd User Configuration (Click to Expand)</b></summary>

systemd includes built-in logging and scheduled task services, no additional installation needed.

**Time synchronization**

<div>

**Reference**: [System Time](https://wiki.gentoo.org/wiki/System_time) · [System Time (systemd)](https://wiki.gentoo.org/wiki/System_time#systemd)

</div>

```bash
systemctl enable --now systemd-timesyncd
```

</details>

### 8.2 Filesystem Tools

Install tools for your chosen filesystem (required):

```bash
emerge --ask sys-fs/e2fsprogs  # ext4
emerge --ask sys-fs/xfsprogs   # XFS
emerge --ask sys-fs/dosfstools # FAT/vfat (required for EFI partition)
emerge --ask sys-fs/btrfs-progs # Btrfs
```

## 9. Create Users and Permissions {#step-9-users}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Finalizing](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Finalizing)

</div>

<div>

**Why is this step needed?**

Linux does not recommend using the root account daily. We need to create a regular user and grant them `sudo` privileges to improve system security.

</div>

```bash
passwd root # Set root password
useradd -m -G wheel,video,audio,plugdev username # Create user and add to common groups
passwd username # Set user password
emerge --ask app-admin/sudo
```

Allow users in the `wheel` group to execute commands as root by editing the sudoers file:

```bash
visudo
```

Uncomment the following line (remove the `# ` at the beginning):
```text
%wheel ALL=(ALL:ALL) ALL
```

If using systemd, add the account to `network`, `lp`, and other groups as needed.

---




## 10. Install Bootloader {#step-10-bootloader}

<div>

**Reference**: [Gentoo Handbook: AMD64 - Configuring the Bootloader](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Bootloader)

</div>

> **Important Warning for Windows Dual Boot Users**:
>
> Windows updates often scan and forcibly overwrite `/EFI/BOOT/bootx64.efi` (the default boot path).
> **Consequence**: If you used this default path, Linux will fail to boot.
> **Solution**:
> 1. **Use an independent filename/directory**: Don't install the bootloader only as `bootx64.efi`.
> 2. **Manually register the boot entry**: Use `efibootmgr` to register the new file in the UEFI boot list.
>
> **All tutorials below (GRUB/systemd-boot/Limine) are already configured to use independent paths to avoid this issue**.
>
> *Note: Windows updates may also change the UEFI boot order (placing Windows first). If this happens, enter BIOS and adjust the order.*

### 10.1 Option A: GRUB (Recommended/Standard)

GRUB is the most feature-complete bootloader with the best compatibility, and supports automatic Windows detection.

<div>

**Reference**: [GRUB](https://wiki.gentoo.org/wiki/GRUB)

</div>

**1. Install and configure**

```bash
emerge --ask sys-boot/grub:2
# Install to ESP (--bootloader-id=Gentoo automatically creates a separate directory, avoiding conflicts)
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=Gentoo
```

**2. Multi-OS configuration (Windows/Linux/other)**

If you have Windows or other Linux distributions installed, enable `os-prober` to automatically detect them:

```bash
emerge --ask sys-boot/os-prober
# Enable os-prober (disabled by default for security)
echo 'GRUB_DISABLE_OS_PROBER=false' >> /etc/default/grub
```

**3. Generate configuration file**

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```
*(For multi-OS users only) Check the output to confirm it contains "Found Windows Boot Manager..." or other OS boot entries*

---

### 10.2 Option B: systemd-boot (Minimal/Fast)

systemd-boot (formerly Gummiboot) is lightweight and simply configured, suitable for UEFI systems.

<div>

**Reference**: [systemd-boot](https://wiki.gentoo.org/wiki/Systemd/systemd-boot)

</div>

**1. Install**

*   **systemd users**:
    For **systemd version >= 254**, you must enable the `boot` USE flag to use `bootctl`:

    ```bash
    mkdir -p /etc/portage/package.use
    echo "sys-apps/systemd boot" >> /etc/portage/package.use/systemd
    emerge --ask --oneshot --verbose sys-apps/systemd
    ```

    Then install the bootloader:
    ```bash
    bootctl --path=/efi install
    ```

    <details>
    <summary><b>OpenRC Users (systemd-utils) - Click to Expand</b></summary>

    OpenRC users need to install `sys-apps/systemd-utils` with `boot` and `kernel-install` USE flags:

    ```bash
    mkdir -p /etc/portage/package.use
    echo "sys-apps/systemd-utils boot kernel-install" >> /etc/portage/package.use/systemd-utils
    emerge --ask --oneshot --verbose sys-apps/systemd-utils
    bootctl --path=/efi install
    ```

    </details>

**2. Configure loader**

Edit `/efi/loader/loader.conf`:
```ini
default gentoo.conf
timeout 3
console-mode auto
```

**3. Create Gentoo boot entry**

Get root partition UUID: `blkid -s UUID -o value /dev/nvme0n1p3` (assuming this is your root partition)
Edit `/efi/loader/entries/gentoo.conf`:

```conf
title   Gentoo Linux
linux   /vmlinuz-6.6.62-gentoo-dist
initrd  /initramfs-6.6.62-gentoo-dist.img
options root=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx rw quiet
```
*Note: The version number must match the actual file `/efi/vmlinuz-...`.*

**4. Windows dual boot configuration**

systemd-boot will **automatically detect** the Windows boot manager located on the same ESP (`/efi/EFI/Microsoft/Boot/bootmgfw.efi`), usually requiring **no additional configuration**.

If your Windows installation is on a **different disk's ESP**, or automatic detection fails, manually create `/efi/loader/entries/windows.conf`:

```conf
title      Windows 11
efi        /EFI/Microsoft/Boot/bootmgfw.efi
```

---

### 10.3 Option C: Limine (Modern/Flexible)

Limine has flexible configuration and supports dynamic menus.

<div>

**Reference**: [Limine](https://wiki.gentoo.org/wiki/Limine)

</div>

**1. Install**

```bash
echo 'sys-boot/limine ~amd64' >> /etc/portage/package.accept_keywords/limine
emerge --ask sys-boot/limine
```

**2. Deploy boot files (critical step)**

To prevent Windows from overwriting, we deploy Limine as a `Gentoo`-specific boot entry, rather than the default `BOOTX64.EFI`.

```bash
mkdir -p /efi/EFI/Gentoo
cp -v /usr/share/limine/BOOTX64.EFI /efi/EFI/Gentoo/limine.efi
cp -v /usr/share/limine/limine-bios.sys /boot/ # (optional) only needed for BIOS
```

**3. Configure Limine**

Edit `/boot/limine.conf` (Limine automatically looks for this file on the ESP or /boot):

```ini
TIMEOUT: 5
DEFAULT_ENTRY: 1

: Gentoo Linux
    PROTOCOL: linux
    KERNEL_PATH: boot/vmlinuz-6.6.62-gentoo-dist
    INITRD_PATH: boot/initramfs-6.6.62-gentoo-dist.img
    CMDLINE: root=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx rw quiet

: Windows 11
    PROTOCOL: chainload
    PATH: /EFI/Microsoft/Boot/bootmgfw.efi
```

**4. Register UEFI boot entry**

Because we're not using the default path, we must tell the motherboard where to boot Limine via `efibootmgr`:

```bash
emerge --ask sys-boot/efibootmgr
# Create a boot entry named "Gentoo Limine"
# -d: disk device (e.g., /dev/nvme0n1)
# -p: partition number (e.g., 1)
# -L: label name
# -l: loader path (Windows-style backslash)
efibootmgr --create --disk /dev/nvme0n1 --part 1 --label "Gentoo Limine" --loader '\EFI\Gentoo\limine.efi'
```

---

<details>
<summary><b>Advanced Settings: Encryption Support (Encrypted Users Only) - Click to Expand</b></summary>


**Step 1: Enable systemd cryptsetup support**

```bash
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde

# Recompile systemd to enable cryptsetup support
emerge --ask --oneshot sys-apps/systemd sys-kernel/dracut
```

**Step 2: Generate initramfs with crypt module**

Edit `/etc/dracut.conf.d/luks.conf`:

> Note: Change `btrfs` to `xfs` or `ext4` based on your root filesystem.
```conf
add_dracutmodules+=" btrfs systemd crypt dm "
```
Regenerate initramfs:
```bash
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
```

**Step 3: Get LUKS partition UUID**

```bash
# Get the UUID of the LUKS encrypted container (NOT the filesystem UUID inside it)
blkid /dev/nvme0n1p3
```
**Output example** (look for the line with `TYPE="crypto_LUKS"`):
```text
/dev/nvme0n1p3: UUID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" TYPE="crypto_LUKS" ...
```
Note this LUKS UUID (e.g., `a1b2c3d4...`).

**Step 4: Configure boot kernel parameters**

*   **GRUB (`/etc/default/grub`)**:

    ```bash
    # Full example (replace UUID with your actual UUID)
    GRUB_CMDLINE_LINUX="rd.luks.uuid=a1b2c3d4-e5f6-7890-abcd-ef1234567890 rd.luks.allow-discards root=UUID=b4b0b4... rootfstype=btrfs"
    ```
    **Parameter explanation**:
    *   `rd.luks.uuid=<UUID>`: UUID of the LUKS encrypted partition (get with `blkid /dev/nvme0n1p3`).
    *   `rd.luks.allow-discards`: Allow SSD TRIM commands through the encryption layer (improves SSD performance).
    *   `root=UUID=<UUID>`: UUID of the decrypted root filesystem (get with `blkid /dev/mapper/cryptroot`).
    *   `rootfstype=btrfs`: **Modify as appropriate** (e.g., `xfs`, `ext4`).

    *Remember to run `grub-mkconfig -o /boot/grub/grub.cfg` after modifying.*

*   **systemd-boot (`gentoo.conf`)**:

    ```text
    title      Gentoo Linux
    version    6.6.62-gentoo
    options    rd.luks.name=a1b2c3d4-e5f6-7890-abcd-ef1234567890=cryptroot root=/dev/mapper/cryptroot rootfstype=btrfs rd.luks.allow-discards init=/lib/systemd/systemd
    linux      /vmlinuz-6.6.62-gentoo-dist
    initrd     /initramfs-6.6.62-gentoo-dist.img
    ```
    **Parameter explanation**:
    *   `rd.luks.name=<LUKS-UUID>=cryptroot`: Specify the LUKS partition UUID and map it as `cryptroot`.
    *   `root=/dev/mapper/cryptroot`: Specify the decrypted root partition device.
    *   `rootfstype=btrfs`: **Modify as appropriate** (e.g., `xfs`, `ext4`).

*   **Limine (`limine.conf`)**:

    ```ini
    : Gentoo Linux
        PROTOCOL: linux
        KERNEL_PATH: boot/vmlinuz-6.6.62-gentoo-dist
        INITRD_PATH: boot/initramfs-6.6.62-gentoo-dist.img
        CMDLINE: rd.luks.name=a1b2c3d4-e5f6-7890-abcd-ef1234567890=cryptroot root=/dev/mapper/cryptroot rootfstype=btrfs rd.luks.allow-discards init=/lib/systemd/systemd
    ```
    **Parameter explanation**:
    *   `rd.luks.name`: Same as above, specifies the LUKS partition UUID.
    *   `root`: Specifies the decrypted root partition device.
    *   `rootfstype=btrfs`: **Modify as appropriate** (e.g., `xfs`, `ext4`).

</details>

> *Note: You only need this step if you chose an encrypted partition in step 3.*

---

### 11.1 Final Checklist

1. `emerge --info` runs without errors
2. UUIDs in `/etc/fstab` are correct (verify again with `blkid`)
3. Root and regular user passwords have been set
4. `grub-mkconfig` has been run or `bootctl`/Limine configuration is complete
5. If using LUKS, confirm initramfs includes `cryptsetup`

### 11.2 Exit Chroot and Reboot

After confirming everything is correct, exit the chroot environment and unmount:

```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
swapoff -a
reboot
```

---

<div>

**Congratulations!** You have completed the basic Gentoo installation.

**Next step**: [Desktop Configuration](/posts/2025-11-25-gentoo-install-desktop/)

</div>
