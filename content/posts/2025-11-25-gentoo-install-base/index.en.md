---
title: "Gentoo Linux Installation Guide (Base)"
slug: gentoo-install
aliases:
  - /posts/gentoo-install/
translationKey: gentoo-install
date: 2025-11-30
summary: "Gentoo Linux base system installation tutorial, covering partitioning, Stage3, kernel compilation, bootloader configuration, etc. Also highlights LUKS full disk encryption tutorial."
description: "2025 Latest Gentoo Linux Installation Guide (Base), explaining UEFI installation process, kernel compilation, etc. in detail. Suitable for Linux advanced users and Gentoo beginners. Also highlights LUKS full disk encryption tutorial."
article:
  showHero: true
  heroStyle: background
featureImage: feature-gentoo-chan.webp
featureImageAlt: "Gentoo Chan"
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

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

### Special Note

This article is the first part of the **Gentoo Linux Installation Guide** series: **Base Installation**.

**Series Navigation**:
1. **Base Installation (This Article)**: Install Gentoo base system from scratch
2. [Desktop Configuration](/posts/gentoo-install-desktop/): Graphics drivers, Desktop Environments, Input methods, etc.
3. [Advanced Optimization](/posts/gentoo-install-advanced/): make.conf optimization, LTO, System maintenance

**Recommended Reading Path**:
- Read as needed: Base Installation (Sections 0-11) → Desktop Configuration (Section 12) → Advanced Optimization (Sections 13-17)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

### About This Guide

This article aims to provide a complete Gentoo installation process demonstration and **intensively provides references for learning**. The article contains a large number of official Wiki links and technical documents to help readers deeply understand the principles and configuration details of each step.

**This is not a simple dummy tutorial, but a guiding learning resource** — the first step in using Gentoo is to learn to read the Wiki and solve problems yourself, and make good use of Google or even AI tools to find answers. When encountering problems or needing to understand in depth, please be sure to consult the official handbook and the reference links provided in this article.

If you have questions or find issues during reading, welcome to raise them through the following channels:
- **Gentoo Chinese Community**: [Telegram Group](https://t.me/gentoo_zh) | [Telegram Channel](https://t.me/gentoocn) | [GitHub](https://github.com/Gentoo-zh)
- **Official Community**: [Gentoo Forums](https://forums.gentoo.org/) | IRC: #gentoo @ Libera.Chat

**Highly recommended to follow the official handbook**:
- [Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)

<p style="opacity: 0.8; margin-top: 1rem;">✓ Verified as of November 25, 2025</p>

</div>

## What is Gentoo?

Gentoo Linux is a source-based Linux distribution known for its **high customizability** and **performance optimization**. Unlike other distributions, Gentoo lets you compile all software from source code, which means:

- **Extreme Performance**: All software is optimized and compiled for your hardware
- **Total Control**: You decide what the system contains and what it doesn't
- **Deep Learning**: Deeply understand Linux by building the system yourself
- **Compilation Time**: Initial installation takes a long time (Recommended to reserve 3-6 hours)
- **Learning Curve**: Requires some Linux basic knowledge

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94);">

**Who is it for?**
- Tech enthusiasts who want to learn Linux deeply
- Users pursuing system performance and customization
- Geeks who enjoy the DIY process

</div>

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11);">

**Who is it not for?**
- Beginners who just want to install and use quickly (Recommended to try Ubuntu, Fedora first)
- Users who don't have time to tinker with the system

</div>

</div>

<details>
<summary><b>Core Concepts at a Glance (Click to expand)</b></summary>

Before starting installation, understand a few core concepts:

**Stage3** ([Wiki](https://wiki.gentoo.org/wiki/Stage_file))
A minimal Gentoo base system archive. It contains the basic toolchain (compiler, libraries, etc.) for building a complete system. You will unpack it to the hard drive as the "foundation" of the new system.

**Portage** ([Wiki](https://wiki.gentoo.org/wiki/Portage))
Gentoo's package management system. It doesn't install pre-compiled packages directly, but downloads source code, compiles it according to your configuration, and then installs it. The core command is `emerge`.

**USE Flags** ([Wiki](https://wiki.gentoo.org/wiki/USE_flag))
Switches that control software features. For example, `USE="bluetooth"` will enable Bluetooth functionality during compilation for all software that supports it. This is the core of Gentoo customization.

**Profile** ([Wiki](https://wiki.gentoo.org/wiki/Profile_(Portage)))
Default system configuration template. For example, `desktop/plasma/systemd` profile will automatically enable default USE flags suitable for KDE Plasma desktop.

**Emerge** ([Wiki](https://wiki.gentoo.org/wiki/Emerge))
Portage's command-line tool. Common commands:
- `emerge --ask <package_name>` - Install software
- `emerge --sync` - Sync software repository
- `emerge -avuDN @world` - Update the entire system

</details>

<details>
<summary><b>Installation Time Estimate (Click to expand)</b></summary>

| Step | Estimated Time |
|---|----------|
| Prepare Installation Media | 10-15 mins |
| Disk Partitioning & Formatting | 15-30 mins |
| Download & Unpack Stage3 | 5-10 mins |
| Configure Portage & Profile | 15-20 mins |
| **Compile Kernel** (Most time-consuming) | **30 mins - 2 hours** |
| Install System Tools | 20-40 mins |
| Configure Bootloader | 10-15 mins |
| **Install Desktop Environment** (Optional) | **1-3 hours** |
| **Total** | **3-6 hours** (Depends on hardware performance) |

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Using pre-compiled kernels and binary packages can significantly reduce time, but will sacrifice some customizability.

</div>

</details>

<details>
<summary><b>Disk Space Requirements & Pre-start Checklist (Click to expand)</b></summary>

### Disk Space Requirements

- **Minimal Install**: 10 GB (No desktop environment)
- **Recommended Space**: 30 GB (Lightweight desktop)
- **Comfortable Space**: 80 GB+ (Full desktop + compilation cache)

### Pre-start Checklist

- Backed up all important data
- Prepared an 8GB+ USB flash drive
- Confirmed stable network connection (Wired is best)
- Reserved enough time (Recommended a full half-day)
- Have some Linux command line basics
- Prepared another device to consult documentation (Or use GUI LiveCD)

</details>

---

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

### Guide Content Overview

This guide will lead you to install Gentoo Linux on x86_64 UEFI platform.

**This article will teach you**:
- Install Gentoo base system from scratch (Partitioning, Stage3, Kernel, Bootloader)
- Configure Portage and optimize compilation flags (make.conf, USE flags, CPU flags)
- Install Desktop Environment (KDE Plasma, GNOME, Hyprland)
- Configure Chinese Environment (locale, fonts, Fcitx5 input method)
- Optional Advanced Configuration (LUKS full disk encryption, LTO optimization, Kernel tuning, RAID)
- System Maintenance (SSD TRIM, Power Management, Flatpak, System Update)

</div>

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important Reminder**

**Please Disable Secure Boot First**
Before starting installation, please be sure to enter BIOS settings and temporarily disable **Secure Boot**. Enabling Secure Boot may cause installation media unable to boot, or installed system unable to boot. You can reconfigure and enable Secure Boot after system installation is complete and successfully booted, referring to later sections of this guide.

**Backup All Important Data!**
This guide involves disk partitioning operations, please be sure to backup all important data before starting!

</div>

---

## 0. Prepare Installation Media {#step-0-prepare}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Choosing Installation Media](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Media)

</div>

### 0.1 Download Gentoo ISO

Get download link according to [**Download Page**](/download/)

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

The dates in the following links (e.g., `20251123T...`) are for reference only, please be sure to select the **latest date** file in the mirror site.

</div>

Download Minimal ISO (Using official mirror as example):
```bash
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/20251123T153051Z/install-amd64-minimal-20251123T153051Z.iso
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/20251123T153051Z/install-amd64-minimal-20251123T153051Z.iso.asc
```

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Beginner Recommendation: Use LiveGUI USB Image**

If you hope to use a browser directly or connect Wi-Fi more conveniently during installation, you can choose **LiveGUI USB Image**.

**Recommended for beginners to use weekly built KDE desktop environment Live ISO**: <https://iso.gig-os.org/>
(From Gig-OS <https://github.com/Gig-OS> project)

**Live ISO Login Credentials**:
- Account: `live`
- Password: `live`
- Root Password: `live`

**System Support**:
- Supports Chinese display and Chinese input method (fcitx5), flclash etc.

</div>

Verify Signature (Optional):
```bash
# Get Gentoo Release Signing Key from keyserver
gpg --keyserver hkps://keys.openpgp.org --recv-keys 0xBB572E0E2D1829105A8D0F7CF7A88992
# --keyserver: Specify keyserver address
# --recv-keys: Receive and import public key
# 0xBB...992: Gentoo Release Media Signing Key Fingerprint

# Verify ISO file digital signature
gpg --verify install-amd64-minimal-20251123T153051Z.iso.asc install-amd64-minimal-20251123T153051Z.iso
# --verify: Verify signature file
# .iso.asc: Signature file (ASCII armored)
# .iso: ISO file to be verified
```

### 0.2 Create USB Installation Drive

**Linux:**
```bash
sudo dd if=install-amd64-minimal-20251123T153051Z.iso of=/dev/sdX bs=4M status=progress oflag=sync
# if=Input File of=Output Device bs=Block Size status=Show Progress
```
<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Please replace `sdX` with your USB device name, e.g., `/dev/sdb`.

</div>

**Windows:** Recommended to use [Rufus](https://rufus.ie/) → Select ISO → Select DD mode when writing.

---

## 1. Enter Live Environment and Connect Network {#step-1-network}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Configuring the Network](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Networking)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Gentoo installation process relies completely on network to download source packages (Stage3) and software repository (Portage). Configuring network in Live environment is the first step of installation.

</div>

### 1.1 Wired Network

```bash
ip link        # View network interface names (e.g. eno1, wlan0)
dhcpcd eno1    # Enable DHCP for wired interface to auto-get IP
ping -c3 gentoo.org # Test connectivity
```

### 1.2 Wireless Network
Use net-setup:
```bash
net-setup
```

**wpa_supplicant:**
```bash
wpa_passphrase "SSID" "PASSWORD" | tee /etc/wpa_supplicant/wpa_supplicant.conf
wpa_supplicant -B -i wlp0s20f3 -c /etc/wpa_supplicant/wpa_supplicant.conf
dhcpcd wlp0s20f3
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

If WPA3 is unstable, please fallback to WPA2.

</div>

<details>
<summary><b>Advanced Setting: Start SSH for Remote Operation (Click to expand)</b></summary>

```bash
passwd                      # Set root password (required for remote login)
rc-service sshd start       # Start SSH service
rc-update add sshd default  # Set SSH auto-start (Optional in Live environment)
ip a | grep inet            # View current IP address
# On another device: ssh root@<IP>
```

</details>


## 2. Plan Disk Partitioning {#step-2-partition}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Preparing the Disks](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

We need to divide independent storage space for Linux system. UEFI systems usually need an ESP partition (Boot) and a Root partition (System). Reasonable planning makes future maintenance easier.

### What is EFI System Partition (ESP)?

When installing Gentoo on a system booted by UEFI (instead of BIOS), creating an EFI System Partition (ESP) is necessary. ESP must be a FAT variant (sometimes shown as vfat on Linux systems). Official UEFI specification states UEFI firmware will recognize FAT12, 16 or 32 filesystems, but FAT32 is recommended.

</div>

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Warning**
If ESP is not formatted using a FAT variant, the system's UEFI firmware will not find the bootloader (or Linux kernel) and will likely fail to boot the system!

</div>

### Recommended Partition Scheme (UEFI)

The table below provides a recommended default partition table for Gentoo trial installation.

| Device Path | Mount Point | Filesystem | Description |
| :--- | :--- | :--- | :--- |
| `/dev/nvme0n1p1` | `/efi` | vfat | EFI System Partition (ESP) |
| `/dev/nvme0n1p2` | `swap` | swap | Swap Partition |
| `/dev/nvme0n1p3` | `/` | xfs | Root Partition |

### cfdisk Practical Example (Recommended)

`cfdisk` is a graphical partition tool, simple and intuitive to operate.

```bash
cfdisk /dev/nvme0n1
```

**Operation Tips**:
1.  Select **GPT** label type.
2.  **Create ESP**: New partition -> Size `1G` -> Type select `EFI System`.
3.  **Create Swap**: New partition -> Size `4G` -> Type select `Linux swap`.
4.  **Create Root**: New partition -> Remaining space -> Type select `Linux filesystem` (Default).
5.  Select **Write** to write changes, type `yes` to confirm.
6.  Select **Quit** to exit.

```text
                                                                 Disk: /dev/nvme0n1
                                              Size: 931.51 GiB, 1000204886016 bytes, 1953525168 sectors
                                            Label: gpt, identifier: 9737D323-129E-4B5F-9049-8080EDD29C02

    Device                                     Start                   End                  Sectors               Size Type
    /dev/nvme0n1p1                                34                  32767                 32734                16M Microsoft reserved
    /dev/nvme0n1p2                             32768              879779839             879747072             419.5G Microsoft basic data
    /dev/nvme0n1p3                        1416650752             1418747903               2097152                 1G EFI System
    /dev/nvme0n1p4                        1418747904             1437622271              18874368                 9G Linux swap
    /dev/nvme0n1p5                        1437622272             1953523711             515901440               246G Linux filesystem
>>  /dev/nvme0n1p6                         879779840             1416650751             536870912               256G Linux filesystem

 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │  Partition UUID: F2F1EF58-82EA-46A6-BF49-896AA40C6060                                                                                           │
 │  Partition type: Linux filesystem (0FC63DAF-8483-4772-8E79-3D69D8477DE4)                                                                        │
 │ Filesystem UUID: b4b0b42d-20be-4cf8-be81-9775efa6c151                                                                                           │
 │Filesystem LABEL: crypthomevar                                                                                                                   │
 │      Filesystem: crypto_LUKS                                                                                                                    │
 └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                   [ Delete ]  [Resize]  [ Quit ]  [ Type ]  [ Help ]  [ Sort ]  [ Write ]  [ Dump ]


                                                        Quit program without writing changes
```

<details>
<summary><b>Advanced Setting: fdisk Command Line Partitioning Tutorial (Click to expand)</b></summary>

`fdisk` is a powerful command line partition tool.

```bash
fdisk /dev/nvme0n1
```

**1. View current partition layout**

Use `p` key to show disk current partition configuration.

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

Press `g` key to immediately delete all existing disk partitions and create a new GPT disk label:

```text
Command (m for help): g
Created a new GPT disklabel (GUID: ...).
```

Or, to keep existing GPT disk label, use `d` key to delete existing partitions one by one.

**3. Create EFI System Partition (ESP)**

Type `n` to create a new partition, select partition number 1, start sector default (2048), end sector type `+1G`:

```text
Command (m for help): n
Partition number (1-128, default 1): 1
First sector (2048-..., default 2048): <Enter>
Last sector, +/-sectors or +/-size{K,M,G,T,P} (...): +1G

Created a new partition 1 of type 'Linux filesystem' and of size 1 GiB.
Partition #1 contains a vfat signature.

Do you want to remove the signature? [Y]es/[N]o: Y
The signature will be removed by a write command.
```

Mark partition as EFI System Partition (Type code 1):

```text
Command (m for help): t
Selected partition 1
Partition type or alias (type L to list all): 1
Changed type of partition 'Linux filesystem' to 'EFI System'.
```

**4. Create Swap Partition**

Create 4GB Swap partition:

```text
Command (m for help): n
Partition number (2-128, default 2): 2
First sector (...): <Enter>
Last sector (...): +4G

Created a new partition 2 of type 'Linux filesystem' and of size 4 GiB.

Command (m for help): t
Partition number (1,2, default 2): 2
Partition type or alias (type L to list all): 19
Changed type of partition 'Linux filesystem' to 'Linux swap'.
```
*(Note: Type 19 is Linux swap)*

**5. Create Root Partition**

Allocate remaining space to Root partition:

```text
Command (m for help): n
Partition number (3-128, default 3): 3
First sector (...): <Enter>
Last sector (...): <Enter>

Created a new partition 3 of type 'Linux filesystem' and of size 926.5 GiB.
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

Setting root partition type to "Linux root (x86-64)" is not mandatory. System works fine if set to "Linux filesystem". This filesystem type is only needed when using a bootloader that supports it (i.e., systemd-boot) and not requiring fstab file.

</div>

Set partition type to "Linux root (x86-64)" (Type code 23):

```text
Command (m for help): t
Partition number (1-3, default 3): 3
Partition type or alias (type L to list all): 23
Changed type of partition 'Linux filesystem' to 'Linux root (x86-64)'.
```

**6. Write Changes**

After checking, type `w` to write changes and exit:

```text
Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

</details>

---

## 3. Create Filesystem and Mount {#step-3-filesystem}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Preparing the Disks](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks) · [Ext4](https://wiki.gentoo.org/wiki/Ext4) · [XFS](https://wiki.gentoo.org/wiki/XFS) · [Btrfs](https://wiki.gentoo.org/wiki/Btrfs)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Disk partitioning only divides space, but cannot store data yet. Creating filesystem (like ext4, Btrfs) allows OS to manage and access these spaces. Mounting connects these filesystems to specific locations in Linux file tree.

</div>

### 3.1 Formatting

```bash
mkfs.fat -F 32 /dev/nvme0n1p1  # Format ESP partition as FAT32
mkswap /dev/nvme0n1p2          # Format Swap partition
mkfs.xfs /dev/nvme0n1p3        # Format Root partition as XFS
```

If using Btrfs:
```bash
mkfs.btrfs -L gentoo /dev/nvme0n1p3
```

If using ext4:
```bash
mkfs.ext4 /dev/nvme0n1p3
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Other Filesystems**

For others like [F2FS](https://wiki.gentoo.org/wiki/F2FS) or [ZFS](https://wiki.gentoo.org/wiki/ZFS), please refer to relevant Wiki.

</div>

### 3.2 Mounting (XFS Example)

```bash
mount /dev/nvme0n1p3 /mnt/gentoo        # Mount Root partition
mkdir -p /mnt/gentoo/efi                # Create ESP mount point
mount /dev/nvme0n1p1 /mnt/gentoo/efi    # Mount ESP partition
swapon /dev/nvme0n1p2                   # Enable Swap partition
```

<details>
<summary><b>Advanced Setting: Btrfs Subvolume Example (Click to expand)</b></summary>

**1. Formatting**

```bash
mkfs.fat -F 32 /dev/nvme0n1p1  # Format ESP
mkswap /dev/nvme0n1p2          # Format Swap
mkfs.btrfs -L gentoo /dev/nvme0n1p3 # Format Root (Btrfs)
```

**2. Create Subvolumes**

```bash
mount /dev/nvme0n1p3 /mnt/gentoo
btrfs subvolume create /mnt/gentoo/@
btrfs subvolume create /mnt/gentoo/@home
umount /mnt/gentoo
```

**3. Mount Subvolumes**

```bash
mount -o compress=zstd,subvol=@ /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/{efi,home}
mount -o subvol=@home /dev/nvme0n1p3 /mnt/gentoo/home
mount /dev/nvme0n1p1 /mnt/gentoo/efi    # Note: ESP must be FAT32 format
swapon /dev/nvme0n1p2
```

**4. Verify Mount**

```bash
lsblk
```

Output Example:
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
nvme0n1          259:1    0 931.5G  0 disk  
├─nvme0n1p1      259:7    0     1G  0 part  /mnt/gentoo/efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  /mnt/gentoo/home
                                            /mnt/gentoo
```

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Btrfs Snapshot Recommendation**

Recommended to use [Snapper](https://wiki.gentoo.org/wiki/Snapper) to manage snapshots. Reasonable subvolume planning (like separating `@` and `@home`) makes system rollback easier.

</div>

</details>

<details>
<summary><b>Advanced Setting: Encrypted Partition (LUKS) (Click to expand)</b></summary>

**1. Create Encrypted Container**

```bash
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p3
```

**2. Open Encrypted Container**

```bash
cryptsetup luksOpen /dev/nvme0n1p3 gentoo-root
```

**3. Formatting**

```bash
mkfs.fat -F 32 /dev/nvme0n1p1       # Format ESP
mkswap /dev/nvme0n1p2               # Format Swap
mkfs.btrfs --label root /dev/mapper/gentoo-root # Format Root (Btrfs)
```

**4. Mounting**

```bash
mount /dev/mapper/gentoo-root /mnt/gentoo
mkdir -p /mnt/gentoo/efi
mount /dev/nvme0n1p1 /mnt/gentoo/efi
swapon /dev/nvme0n1p2
```

**5. Verify Mount**

```bash
lsblk
```

Output Example:
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
nvme0n1          259:1    0 931.5G  0 disk  
├─nvme0n1p1      259:7    0     1G  0 part  /mnt/gentoo/efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  
  └─gentoo-root  253:0    0 926.5G  0 crypt /mnt/gentoo
```

</details>

---

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Recommendation**

After mounting, recommended to use `lsblk` to confirm mount points are correct.

```bash
lsblk
```

**Output Example** (Similar to below):
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
 nvme0n1          259:1    0 931.5G  0 disk  
├─nvme0n1p1      259:7    0     1G  0 part  /efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  /
```

</div>

## 4. Download Stage3 and Enter chroot {#step-4-stage3}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Installing the Gentoo Installation Files](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage) · [Stage file](https://wiki.gentoo.org/wiki/Stage_file)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Stage3 is a minimal Gentoo base system environment. We will unpack it to the hard drive as the "foundation" of the new system, and then enter this new environment via `chroot` for subsequent configuration.

</div>

### 4.1 Select Stage3

- **OpenRC**: `stage3-amd64-openrc-*.tar.xz`
- **systemd**: `stage3-amd64-systemd-*.tar.xz`
- Desktop variants just pre-enable some USE flags, standard version is more flexible.

### 4.2 Download and Unpack

```bash
cd /mnt/gentoo
# Use links browser to visit mirror site to download Stage3
links https://distfiles.gentoo.org/releases/amd64/autobuilds/20251123T153051Z/ # Using official mirror as example
# Unpack Stage3 archive
# x:extract p:preserve permissions v:verbose f:file --numeric-owner:use numeric IDs
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

If downloaded `.DIGESTS` or `.CONTENTS` as well, can verify with `openssl` or `gpg`.

### 4.3 Copy DNS and Mount Pseudo-filesystems

```bash
cp --dereference /etc/resolv.conf /mnt/gentoo/etc/ # Copy DNS config
mount --types proc /proc /mnt/gentoo/proc          # Mount process info
mount --rbind /sys /mnt/gentoo/sys                 # Bind mount system info
mount --rbind /dev /mnt/gentoo/dev                 # Bind mount device nodes
mount --rbind /run /mnt/gentoo/run                 # Bind mount runtime info
mount --make-rslave /mnt/gentoo/sys                # Set as slave mount (prevent unmount affecting host)
mount --make-rslave /mnt/gentoo/dev
mount --make-rslave /mnt/gentoo/run
```

> Using OpenRC can omit `/run` step.

### 4.4 Enter chroot

```bash
chroot /mnt/gentoo /bin/bash    # Switch root directory to new system
source /etc/profile             # Load environment variables
export PS1="(chroot) ${PS1}"    # Modify prompt to distinguish environment
```

---

## 5. Initialize Portage and make.conf {#step-5-portage}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Installing the Gentoo Base System](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
Partition number (1,2, default 2): 2
Partition type or alias (type L to list all): 19
Changed type of partition 'Linux filesystem' to 'Linux swap'.
```
*(Note: Type 19 is Linux swap)*

**5. Create Root Partition**

Allocate remaining space to Root partition:

```text
Command (m for help): n
Partition number (3-128, default 3): 3
First sector (...): <Enter>
Last sector (...): <Enter>

Created a new partition 3 of type 'Linux filesystem' and of size 926.5 GiB.
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

Setting root partition type to "Linux root (x86-64)" is not mandatory. System works fine if set to "Linux filesystem". This filesystem type is only needed when using a bootloader that supports it (i.e., systemd-boot) and not requiring fstab file.

</div>

Set partition type to "Linux root (x86-64)" (Type code 23):

```text
Command (m for help): t
Partition number (1-3, default 3): 3
Partition type or alias (type L to list all): 23
Changed type of partition 'Linux filesystem' to 'Linux root (x86-64)'.
```

**6. Write Changes**

After checking, type `w` to write changes and exit:

```text
Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

</details>

---

## 3. Create Filesystem and Mount {#step-3-filesystem}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Preparing the Disks](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks) · [Ext4](https://wiki.gentoo.org/wiki/Ext4) · [XFS](https://wiki.gentoo.org/wiki/XFS) · [Btrfs](https://wiki.gentoo.org/wiki/Btrfs)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Disk partitioning only divides space, but cannot store data yet. Creating filesystem (like ext4, Btrfs) allows OS to manage and access these spaces. Mounting connects these filesystems to specific locations in Linux file tree.

</div>

### 3.1 Formatting

```bash
mkfs.fat -F 32 /dev/nvme0n1p1  # Format ESP partition as FAT32
mkswap /dev/nvme0n1p2          # Format Swap partition
mkfs.xfs /dev/nvme0n1p3        # Format Root partition as XFS
```

If using Btrfs:
```bash
mkfs.btrfs -L gentoo /dev/nvme0n1p3
```

If using ext4:
```bash
mkfs.ext4 /dev/nvme0n1p3
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Other Filesystems**

For others like [F2FS](https://wiki.gentoo.org/wiki/F2FS) or [ZFS](https://wiki.gentoo.org/wiki/ZFS), please refer to relevant Wiki.

</div>

### 3.2 Mounting (XFS Example)

```bash
mount /dev/nvme0n1p3 /mnt/gentoo        # Mount Root partition
mkdir -p /mnt/gentoo/efi                # Create ESP mount point
mount /dev/nvme0n1p1 /mnt/gentoo/efi    # Mount ESP partition
swapon /dev/nvme0n1p2                   # Enable Swap partition
```

<details>
<summary><b>Advanced Setting: Btrfs Subvolume Example (Click to expand)</b></summary>

**1. Formatting**

```bash
mkfs.fat -F 32 /dev/nvme0n1p1  # Format ESP
mkswap /dev/nvme0n1p2          # Format Swap
mkfs.btrfs -L gentoo /dev/nvme0n1p3 # Format Root (Btrfs)
```

**2. Create Subvolumes**

```bash
mount /dev/nvme0n1p3 /mnt/gentoo
btrfs subvolume create /mnt/gentoo/@
btrfs subvolume create /mnt/gentoo/@home
umount /mnt/gentoo
```

**3. Mount Subvolumes**

```bash
mount -o compress=zstd,subvol=@ /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/{efi,home}
mount -o subvol=@home /dev/nvme0n1p3 /mnt/gentoo/home
mount /dev/nvme0n1p1 /mnt/gentoo/efi    # Note: ESP must be FAT32 format
swapon /dev/nvme0n1p2
```

**4. Verify Mount**

```bash
lsblk
```

Output Example:
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
nvme0n1          259:1    0 931.5G  0 disk  
├─nvme0n1p1      259:7    0     1G  0 part  /mnt/gentoo/efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  /mnt/gentoo/home
                                            /mnt/gentoo
```

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Btrfs Snapshot Recommendation**

Recommended to use [Snapper](https://wiki.gentoo.org/wiki/Snapper) to manage snapshots. Reasonable subvolume planning (like separating `@` and `@home`) makes system rollback easier.

</div>

</details>

<details>
<summary><b>Advanced Setting: Encrypted Partition (LUKS) (Click to expand)</b></summary>

**1. Create Encrypted Container**

```bash
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p3
```

**2. Open Encrypted Container**

```bash
cryptsetup luksOpen /dev/nvme0n1p3 gentoo-root
```

**3. Formatting**

```bash
mkfs.fat -F 32 /dev/nvme0n1p1       # Format ESP
mkswap /dev/nvme0n1p2               # Format Swap
mkfs.btrfs --label root /dev/mapper/gentoo-root # Format Root (Btrfs)
```

**4. Mounting**

```bash
mount /dev/mapper/gentoo-root /mnt/gentoo
mkdir -p /mnt/gentoo/efi
mount /dev/nvme0n1p1 /mnt/gentoo/efi
swapon /dev/nvme0n1p2
```

**5. Verify Mount**

```bash
lsblk
```

Output Example:
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
nvme0n1          259:1    0 931.5G  0 disk  
├─nvme0n1p1      259:7    0     1G  0 part  /mnt/gentoo/efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  
  └─gentoo-root  253:0    0 926.5G  0 crypt /mnt/gentoo
```

</details>

---

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Recommendation**

After mounting, recommended to use `lsblk` to confirm mount points are correct.

```bash
lsblk
```

**Output Example** (Similar to below):
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
 nvme0n1          259:1    0 931.5G  0 disk  
├─nvme0n1p1      259:7    0     1G  0 part  /efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  /
```

</div>

## 4. Download Stage3 and Enter chroot {#step-4-stage3}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Installing the Gentoo Installation Files](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage) · [Stage file](https://wiki.gentoo.org/wiki/Stage_file)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Stage3 is a minimal Gentoo base system environment. We will unpack it to the hard drive as the "foundation" of the new system, and then enter this new environment via `chroot` for subsequent configuration.

</div>

### 4.1 Select Stage3

- **OpenRC**: `stage3-amd64-openrc-*.tar.xz`
- **systemd**: `stage3-amd64-systemd-*.tar.xz`
- Desktop variants just pre-enable some USE flags, standard version is more flexible.

### 4.2 Download and Unpack

```bash
cd /mnt/gentoo
# Use links browser to visit mirror site to download Stage3
links https://distfiles.gentoo.org/releases/amd64/autobuilds/20251123T153051Z/ # Using official mirror as example
# Unpack Stage3 archive
# x:extract p:preserve permissions v:verbose f:file --numeric-owner:use numeric IDs
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

If downloaded `.DIGESTS` or `.CONTENTS` as well, can verify with `openssl` or `gpg`.

### 4.3 Copy DNS and Mount Pseudo-filesystems

```bash
cp --dereference /etc/resolv.conf /mnt/gentoo/etc/ # Copy DNS config
mount --types proc /proc /mnt/gentoo/proc          # Mount process info
mount --rbind /sys /mnt/gentoo/sys                 # Bind mount system info
mount --rbind /dev /mnt/gentoo/dev                 # Bind mount device nodes
mount --rbind /run /mnt/gentoo/run                 # Bind mount runtime info
mount --make-rslave /mnt/gentoo/sys                # Set as slave mount (prevent unmount affecting host)
mount --make-rslave /mnt/gentoo/dev
mount --make-rslave /mnt/gentoo/run
```

> Using OpenRC can omit `/run` step.

### 4.4 Enter chroot

```bash
chroot /mnt/gentoo /bin/bash    # Switch root directory to new system
source /etc/profile             # Load environment variables
export PS1="(chroot) ${PS1}"    # Modify prompt to distinguish environment
```

---

## 5. Initialize Portage and make.conf {#step-5-portage}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Installing the Gentoo Base System](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Portage is Gentoo's package management system and its core feature. Initializing Portage and configuring `make.conf` is like setting the "building blueprint" for your new system, deciding how software is compiled, what features to use, and where to download from.

</div>

### 5.1 Sync Tree

```bash
emerge-webrsync   # Get latest Portage snapshot (faster than rsync)
emerge --sync     # Sync Portage tree (get latest ebuilds)
emerge --ask app-editors/vim # Install Vim editor (Recommended)
eselect editor list          # List available editors
eselect editor set vi        # Set Vim as default editor (vi is usually a symlink to vim)
```

Set mirror (Choose one):
```bash
mirrorselect -i -o >> /etc/portage/make.conf
# Or manually:
# Using official mirror as example
echo 'GENTOO_MIRRORS="https://distfiles.gentoo.org/"' >> /etc/portage/make.conf
```

### 5.2 make.conf Example

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - USE flags](https://wiki.gentoo.org/wiki/Handbook:AMD64/Working/USE) · [/etc/portage/make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

</div>

Edit `/etc/portage/make.conf`:
```bash
vim /etc/portage/make.conf
```

**Lazy/Beginner Config (Copy Paste)**:
<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Please modify the `-j` parameter in `MAKEOPTS` according to your CPU core count (e.g., 8-core CPU use `-j8`).

</div>

```conf
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"

# Please modify number after -j according to CPU core count
MAKEOPTS="-j8"

# Language Setting
LC_MESSAGES=C
L10N="en en-US"
LINGUAS="en en_US"

# Mirror Source (Official)
GENTOO_MIRRORS="https://distfiles.gentoo.org/"

# Common USE flags (Recommended for systemd users)
USE="systemd udev dbus policykit networkmanager bluetooth git dist-kernel"
ACCEPT_LICENSE="*"
```

<details>
<summary><b>Detailed Config Example (Recommended to read and adjust) (Click to expand)</b></summary>

```conf
# vim: set language=bash;  # Tell Vim to use bash syntax highlighting
CHOST="x86_64-pc-linux-gnu"  # Target system architecture (Do not modify manually)

# ========== Compilation Optimization Flags ==========
# -march=native: Optimize for current CPU (Recommended, best performance)
# -O2: Optimization level 2 (Balance performance and stability, Recommended)
# -pipe: Use pipes to pass data, speed up compilation (Does not affect final program)
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"    # C program compilation flags
CXXFLAGS="${COMMON_FLAGS}"  # C++ program compilation flags
FCFLAGS="${COMMON_FLAGS}"   # Fortran program compilation flags
FFLAGS="${COMMON_FLAGS}"    # Fortran 77 program compilation flags

# CPU Instruction Set Optimization (See section 5.3 below, run cpuid2cpuflags to generate automatically)
# CPU_FLAGS_X86="aes avx avx2 ..."

# ========== Language and Localization Settings ==========
# Keep build output in English (Easier for troubleshooting and searching solutions)
LC_MESSAGES=C

# L10N: Localization support (Affects documentation, translations, etc.)
L10N="en en-US"
# LINGUAS: Legacy localization variable (Still needed by some software)
LINGUAS="en en_US"

# ========== Parallel Compilation Settings ==========
# Number after -j = CPU thread count (e.g. 32 core CPU use -j32)
# Recommended value: CPU thread count (Check via nproc command)
MAKEOPTS="-j32"  # Please adjust according to actual hardware

# ========== Mirror Source Settings ==========
# Gentoo software package download mirror (Recommended to choose appropriate mirror for acceleration)
GENTOO_MIRRORS="https://distfiles.gentoo.org/"

# ========== Emerge Default Options ==========
# --ask: Ask for confirmation before execution
# --verbose: Show detailed info (USE flag changes etc.)
# --with-bdeps=y: Include build-time dependencies
# --complete-graph=y: Complete dependency graph analysis
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"

# ========== USE Flags (Global Feature Switches) ==========
# systemd: Use systemd as init system (If using OpenRC change to -systemd)
# udev: Device management support
# dbus: Inter-process communication (Required for desktop environment)
# policykit: Permission management (Required for desktop environment)
# networkmanager: Network Manager (Recommended)
# bluetooth: Bluetooth support
# git: Git version control
# dist-kernel: Use distribution kernel (Recommended for beginners, can use pre-compiled kernel)
USE="systemd udev dbus policykit networkmanager bluetooth git dist-kernel"

# ========== License Acceptance ==========
# "*" means accept all licenses (including non-free software licenses)
# Optionally accept: ACCEPT_LICENSE="@FREE" (Only free software)
ACCEPT_LICENSE="*"

# Keep newline at end of file! Important!
```

</details>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Beginner Tip**

- The number in `MAKEOPTS="-j32"` should be your CPU thread count, check via `nproc` command
- If memory is insufficient during compilation, reduce parallel task count (e.g. change to `-j16`)
- USE flags are Gentoo's core feature, deciding what features are included when compiling software

</div>

<details>
<summary><b>Advanced Setting: CPU Instruction Set Optimization (CPU_FLAGS_X86) (Click to expand)</b></summary>

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [CPU_FLAGS_*](https://wiki.gentoo.org/wiki/CPU_FLAGS_*)

</div>

To let Portage know which specific instruction sets your CPU supports (like AES, AVX, SSE4.2 etc.), we need to configure `CPU_FLAGS_X86`.

Install detection tool:
```bash
emerge --ask app-portage/cpuid2cpuflags # Install detection tool
```

Run detection and write to config:
```bash
cpuid2cpuflags >> /etc/portage/make.conf # Append detection result to config file
```

Check end of `/etc/portage/make.conf`, you should see a line similar to this:
```conf
CPU_FLAGS_X86="aes avx avx2 f16c fma3 mmx mmxext pclmul popcnt rdrand sse sse2 sse3 sse4_1 sse4_2 ssse3"
```

</details>

---

## 6. Profile, System Settings and Localization {#step-6-system}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Installing the Gentoo Base System](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Profile defines system base configuration and default USE flags, embodying Gentoo's flexibility. Configuring timezone, language and network basic system parameters is key to making your Gentoo system work properly and fit personal usage habits.

</div>

### 6.1 Select Profile

```bash
eselect profile list          # List all available Profiles
eselect profile set <number>    # Set selected Profile
emerge -avuDN @world          # Update system to match new Profile (a:ask v:verbose u:update D:deep N:newUSE)
```
Common options:
- `default/linux/amd64/23.0/desktop/plasma/systemd`
- `default/linux/amd64/23.0/desktop/gnome/systemd`
- `default/linux/amd64/23.0/desktop` (OpenRC desktop)

### 6.2 Timezone and Locale

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Wiki: Localization/Guide](https://wiki.gentoo.org/wiki/Localization/Guide)

</div>

```bash
echo "Asia/Shanghai" > /etc/timezone
emerge --config sys-libs/timezone-data

echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
echo "zh_CN.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen                      # Generate selected locales
eselect locale set en_US.utf8   # Set system default locale (Recommended to use English to avoid garbled text)

# Reload environment
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

### 6.3 Hostname and Network Settings

**Set Hostname**:
```bash
echo "gentoo" > /etc/hostname
```

**Network Management Tool Selection**:

**Option A: NetworkManager (Recommended, General Purpose)**
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

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

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Configuration Tip**

**GUI**: Run `nm-connection-editor`
**Command Line**: Use `nmtui` (Graphical wizard) or `nmcli`

</div>

<details>
<summary><b>Advanced Tip: Use iwd backend (Click to expand)</b></summary>

NetworkManager supports using `iwd` as backend (faster than wpa_supplicant).

```bash
echo "net-misc/networkmanager iwd" >> /etc/portage/package.use/networkmanager
emerge --ask --newuse net-misc/networkmanager
```
Then edit `/etc/NetworkManager/NetworkManager.conf`, add `wifi.backend=iwd` under `[device]`.

</details>

<details>
<summary><b>Option B: Lightweight Solution (Click to expand)</b></summary>

If you don't want to use NetworkManager, you can choose the following lightweight solutions:

1. **Wired Network (dhcpcd)**
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [dhcpcd](https://wiki.gentoo.org/wiki/Dhcpcd)

</div>

   ```bash
   emerge --ask net-misc/dhcpcd
   # OpenRC:
   rc-update add dhcpcd default
   # systemd:
   systemctl enable dhcpcd
   ```

2. **Wireless Network (iwd)**
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

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
<summary><b>Option 3: Native Solution (Click to expand)</b></summary>

Use init system's built-in network management features, suitable for servers or minimal environments.

**OpenRC Network Service**:
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [OpenRC](https://wiki.gentoo.org/wiki/OpenRC) · [OpenRC: Network Management](https://wiki.gentoo.org/wiki/OpenRC#Network_management)

</div>

```bash
vim /etc/conf.d/net
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

Please replace `enp5s0` below with your actual network interface name (check via `ip link`).

</div>

Write the following content:
```conf
config_enp5s0="dhcp"
```

```bash
ln -s /etc/init.d/net.lo /etc/init.d/net.enp5s0 # Create network service symlink
rc-update add net.enp5s0 default                # Set auto-start
```

---

**Systemd Native Network Service**:
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [systemd-networkd](https://wiki.gentoo.org/wiki/Systemd/systemd-networkd) · [systemd-resolved](https://wiki.gentoo.org/wiki/Systemd/systemd-resolved) · [Systemd](https://wiki.gentoo.org/wiki/Systemd) · [Systemd: Network](https://wiki.gentoo.org/wiki/Systemd#Network)

</div>

Systemd comes with built-in network management features, suitable for servers or minimal environments:
```bash
systemctl enable systemd-networkd
systemctl enable systemd-resolved
```
*Note: Need to manually write .network config files.*

</details>



### 6.4 Configure fstab

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - fstab](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/System) · [Gentoo Wiki: /etc/fstab](https://wiki.gentoo.org/wiki//etc/fstab)

</div>

Get UUID:
```bash
blkid
```

**Method A: Auto Generate (Recommended for LiveGUI users)**
<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

`genfstab` tool is usually included in `arch-install-scripts` package. If you are using Gig-OS or other Arch-based LiveISO, you can use it directly. Official Minimal ISO may need manual installation or use Method B.

</div>

```bash
emerge --ask sys-fs/genfstab # If command not found
genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab
```
Check generated file:
```bash
cat /mnt/gentoo/etc/fstab
```

**Method B: Manual Edit**

Edit `/etc/fstab`:
```bash
vim /etc/fstab
```

```fstab
# <fs>                                     <mountpoint> <type> <opts>            <dump/pass>
UUID=7E91-5869                             /efi         vfat   defaults,noatime  0 2
UUID=7fb33b5d-4cff-47ff-ab12-7b461b5d6e13  none         swap   sw                0 0
UUID=8c08f447-c79c-4fda-8c08-f447c79ce690  /            xfs    defaults,noatime  0 1
```

<details>
<summary><b>Advanced Setting: Btrfs fstab Example (Click to expand)</b></summary>

```fstab
# Root Subvolume
UUID=7b44c5eb-caa0-413b-9b7e-a991e1697465  /            btrfs  defaults,noatime,compress=zstd:3,discard=async,space_cache=v2,commit=60,subvol=@              0 0

# Home Subvolume
UUID=7b44c5eb-caa0-413b-9b7e-a991e1697465  /home        btrfs  defaults,noatime,compress=zstd:3,discard=async,space_cache=v2,commit=60,subvol=@home          0 0

# Swap
UUID=7fb33b5d-4cff-47ff-ab12-7b461b5d6e13  none         swap   sw                                                      0 0

# ESP (UEFI)
UUID=7E91-5869                             /efi         vfat   defaults,noatime,fmask=0022,dmask=0022                  0 2
```

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Note**

Please be sure to use `blkid` command to get your actual UUID and replace the example values above.

</div>

</details>

<details>
<summary><b>Advanced Setting: LUKS Encrypted Partition fstab Example (Click to expand)</b></summary>

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Key Point**

In `fstab`, you MUST use the UUID of the **Decrypted Mapped Device**, not the UUID of the Physical Partition (LUKS Container).

</div>

**1. Check UUID Difference**

```bash
blkid
```

Output Example (Note difference between `crypto_LUKS` and `btrfs`):

```text
# This is physical partition (LUKS container), DO NOT use this UUID in fstab!
/dev/nvme0n1p5: UUID="562d0251-..." TYPE="crypto_LUKS" ...

# This is decrypted mapped device (filesystem), fstab should use this UUID!
/dev/mapper/cryptroot: UUID="7b44c5eb-..." TYPE="btrfs" ...
```

**2. fstab Config Example**

```fstab
# Root (Btrfs inside LUKS) - Use UUID of /dev/mapper/cryptroot
UUID=7b44c5eb-caa0-413b-9b7e-a991e1697465  /            btrfs  defaults,noatime,compress=zstd:3,discard=async,space_cache=v2,commit=60,subvol=@              0 0

# Home (Btrfs inside LUKS) - Use UUID of /dev/mapper/crypthomevar
UUID=4ad44bb7-9843-470b-9a88-f008367b63a3  /home        btrfs  defaults,noatime,compress=zstd:3,discard=async,space_cache=v2,commit=60,subvol=@home          0 0

# Swap
UUID=7fb33b5d-4cff-47ff-ab12-7b461b5d6e13  none         swap   sw                                                      0 0

# ESP (UEFI)
UUID=7E91-5869                             /efi         vfat   defaults,noatime,fmask=0022,dmask=0022                  0 2
```

</details>

---

## 7. Kernel and Firmware {#step-7-kernel}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Configuring the Linux Kernel](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Kernel)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

The kernel is the core of the operating system, responsible for managing hardware. Gentoo allows you to manually tailor the kernel, keeping only the drivers you need, thus obtaining extreme performance and minimal size. Beginners can also choose pre-compiled kernels to get started quickly.

</div>

### 7.1 Quick Solution: Pre-compiled Kernel

```bash
emerge --ask sys-kernel/gentoo-kernel-bin
```

Remember to regenerate bootloader configuration after kernel upgrade.

<details>
<summary><b>Advanced Setting: Manual Kernel Compilation (Gentoo Kernel Experience) (Click to expand)</b></summary>

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Beginner Tip**

Compiling kernel is complex and time-consuming. If you want to experience Gentoo as soon as possible, you can skip this section first and use pre-compiled kernel in 7.1.

</div>

Manual kernel compilation allows you to fully control system features, remove unneeded drivers, and get a leaner, more efficient kernel.

**Quick Start** (Using Genkernel automation):
```bash
emerge --ask sys-kernel/gentoo-sources sys-kernel/genkernel
genkernel --install all  # Automatically compile and install kernel, modules and initramfs
# --install: Automatically install to /boot directory after compilation
# all: Full build (kernel + modules + initramfs)
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Advanced Content**

If you want to deeply understand kernel configuration, use LLVM/Clang to compile kernel, enable LTO optimization and other advanced options, please refer to **[Section 16.0 Kernel Compilation Advanced Guide](/posts/gentoo-install-advanced/#section-16-kernel-advanced)**.

</div>

</details>

### 7.3 Install Firmware and Microcode

```bash
mkdir -p /etc/portage/package.license
# Accept Linux firmware license terms
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' > /etc/portage/package.license/linux-firmware
echo 'sys-kernel/installkernel dracut' > /etc/portage/package.use/installkernel
emerge --ask sys-kernel/linux-firmware
emerge --ask sys-firmware/intel-microcode  # Intel CPU
```

---

## 8. Base Tools {#step-8-base-packages}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Installing Necessary System Tools](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Tools)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Stage3 only has the most basic commands. We need to supplement system logger, network management, filesystem tools and other necessary components so that the system can work properly after reboot.

</div>

### 8.1 System Service Tools

**OpenRC Users** (Required):

**1. System Logger**
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Syslog-ng](https://wiki.gentoo.org/wiki/Syslog-ng)

</div>

```bash
emerge --ask app-admin/syslog-ng
rc-update add syslog-ng default
```

**2. Cron Job**
```bash
emerge --ask sys-process/cronie
rc-update add cronie default
```

**3. Time Sync**
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [System Time](https://wiki.gentoo.org/wiki/System_time) · [System Time (OpenRC)](https://wiki.gentoo.org/wiki/System_time#OpenRC)

</div>

```bash
emerge --ask net-misc/chrony
rc-update add chronyd default
```

**systemd Users**:
systemd has built-in logger and time sync services.

**Time Sync**
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [System Time](https://wiki.gentoo.org/wiki/System_time) · [System Time (systemd)](https://wiki.gentoo.org/wiki/System_time#systemd)

</div>

```bash
systemctl enable --now systemd-timesyncd
```

### 8.3 Filesystem Tools

Install corresponding tools according to the filesystem you use (Required):
```bash
emerge --ask sys-fs/e2fsprogs  # ext4
emerge --ask sys-fs/xfsprogs   # XFS
emerge --ask sys-fs/dosfstools # FAT/vfat (Required for EFI partition)
emerge --ask sys-fs/btrfs-progs # Btrfs
```

## 9. Create User and Permissions {#step-9-users}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Finalizing](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Finalizing)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Linux does not recommend using root account for daily use. We need to create a normal user and grant it permission to use `sudo` to improve system security.

</div>

```bash
passwd root # Set root password
useradd -m -G wheel,video,audio,plugdev zakk # Create user and add to common groups
passwd zakk # Set user password
emerge --ask app-admin/sudo
echo "%wheel ALL=(ALL) ALL" > /etc/sudoers.d/wheel # Allow wheel group to use sudo
```

If using systemd, can add account to `network`, `lp` groups as needed.

---




## 10. Install Bootloader {#step-10-bootloader}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Configuring the Bootloader](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Bootloader)

</div>

### 10.1 GRUB

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [GRUB](https://wiki.gentoo.org/wiki/GRUB)

</div>

```bash
emerge --ask sys-boot/grub:2
mkdir -p /efi/EFI/Gentoo
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=Gentoo # Install GRUB to ESP
# Install os-prober to support multi-system detection
emerge --ask sys-boot/os-prober

# Enable os-prober (For detecting Windows and other OS)
echo 'GRUB_DISABLE_OS_PROBER=false' >> /etc/default/grub

# Generate GRUB config file
grub-mkconfig -o /boot/grub/grub.cfg
```

<details>
<summary><b>Advanced Setting: systemd-boot (UEFI Only) (Click to expand)</b></summary>

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [systemd-boot](https://wiki.gentoo.org/wiki/Systemd/systemd-boot)

</div>

```bash
bootctl --path=/efi install # Install systemd-boot
# 1. Create Gentoo Boot Entry
vim /efi/loader/entries/gentoo.conf
```

Write the following content (**Note to replace UUID**):
```conf
title   Gentoo Linux
linux   /vmlinuz-6.6.62-gentoo-dist
initrd  /initramfs-6.6.62-gentoo-dist.img
options root=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx rw quiet
```
<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

If you used LUKS encryption, options line needs to add `rd.luks.uuid=...` and other parameters.

</div>

**2. Update Boot Entry**:
After every kernel update, need to manually update version number in `gentoo.conf`, or use script to automate.

**2. Create Windows Boot Entry (Dual Boot)**

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

If you created a new EFI partition, please remember to copy original Windows EFI files (EFI/Microsoft) to the new partition.

</div>

```bash
vim /efi/loader/entries/windows.conf
```

Write the following content:
```ini
title      Windows 11
sort-key   windows-01
efi        /EFI/Microsoft/Boot/bootmgfw.efi
```

# 3. Configure Default Boot
```bash
vim /efi/loader/loader.conf
```

Write the following content:

```ini
default gentoo.conf
timeout 3
console-mode auto
```

</details>

<details>
<summary><b>Advanced Setting: Encryption Support (Encrypted Users Only) (Click to expand)</b></summary>

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Dm-crypt](https://wiki.gentoo.org/wiki/Dm-crypt)

</div>

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

Only execute this step if you selected encrypted partition in Step 3.4.

</div>

**Step 1: Enable systemd cryptsetup support**

```bash
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde

# Recompile systemd to enable cryptsetup support
emerge --ask --oneshot sys-apps/systemd
```

**Step 2: Get UUID of LUKS Partition**

```bash
# Get UUID of LUKS encrypted container (Not the filesystem inside)
blkid /dev/nvme0n1p3
```

Output Example:
```text
/dev/nvme0n1p3: UUID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" TYPE="crypto_LUKS" ...
```
Note down this **LUKS UUID** (e.g.: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).

**Step 3: Configure GRUB Kernel Parameters**

```bash
vim /etc/default/grub
```

Add or modify the following content (**Replace UUID with actual value**):

```bash
# Full Example (Replace UUID with your actual UUID)
GRUB_CMDLINE_LINUX="rd.luks.uuid=<LUKS-UUID> rd.luks.allow-discards root=UUID=<ROOT-UUID> rootfstype=btrfs"
```

**Parameter Explanation**:
- `rd.luks.uuid=<UUID>`: UUID of LUKS encrypted partition (Get via `blkid /dev/nvme0n1p3`)
- `rd.luks.allow-discards`: Allow SSD TRIM command to pass through encryption layer (Improve SSD performance)
- `root=UUID=<UUID>`: UUID of decrypted btrfs filesystem (Get via `blkid /dev/mapper/gentoo-root`)
- `rootfstype=btrfs`: Root filesystem type (Change to `ext4` if using ext4)

<details>
<summary><b>Step 3.1 (Alternative): Configure Kernel Parameters (systemd-boot Solution) (Click to expand)</b></summary>

If you use systemd-boot instead of GRUB, please edit config files under `/boot/loader/entries/` (e.g. `gentoo.conf`):

```conf
title      Gentoo Linux
version    6.6.13-gentoo
options    rd.luks.name=<LUKS-UUID>=cryptroot root=/dev/mapper/cryptroot rootfstype=btrfs rd.luks.allow-discards init=/lib/systemd/systemd
linux      /vmlinuz-6.6.13-gentoo
initrd     /initramfs-6.6.13-gentoo.img
```

**Parameter Explanation**:
- `rd.luks.name=<LUKS-UUID>=cryptroot`: Specify LUKS partition UUID and map as `cryptroot`.
- `root=/dev/mapper/cryptroot`: Specify decrypted root partition device.
- `rootfstype=btrfs`: Specify root filesystem type.

</details>

**Step 4: Install and Configure dracut**

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Dracut](https://wiki.gentoo.org/wiki/Dracut) · [Initramfs](https://wiki.gentoo.org/wiki/Initramfs)

</div>

```bash
# Install dracut (If not installed)
emerge --ask sys-kernel/dracut
```

**Step 5: Configure dracut for LUKS Decryption**

Create dracut config file:

```bash
vim /etc/dracut.conf.d/luks.conf
```

Add following content:

```conf
# Do not set kernel_cmdline here, GRUB will override it
kernel_cmdline=""
# Add necessary modules to support LUKS + btrfs
add_dracutmodules+=" btrfs systemd crypt dm "
# Add necessary tools
install_items+=" /sbin/cryptsetup /bin/grep "
# Specify filesystem (Modify if using other filesystem)
filesystems+=" btrfs "
```

**Configuration Explanation**:
- `crypt` and `dm` modules provide LUKS decryption support
- `systemd` module used for systemd boot environment
- `btrfs` module supports btrfs filesystem (Change to `ext4` if using ext4)

### Step 6: Configure /etc/crypttab (Optional but Recommended)

```bash
vim /etc/crypttab
```

Add following content (**Replace UUID with your LUKS UUID**):
```conf
gentoo-root UUID=<LUKS-UUID> none luks,discard
```
With this configuration, system will automatically recognize and prompt to unlock encrypted partition.

### Step 7: Regenerate initramfs

```bash
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
# --kver: Specify kernel version
# $(make -C /usr/src/linux -s kernelrelease): Automatically get current kernel version
# --force: Force overwrite existing initramfs file
```

> **Important**: After every kernel update, also need to execute this command to generate new initramfs!

### Step 8: Update GRUB Config

```bash
grub-mkconfig -o /boot/grub/grub.cfg

# Verify initramfs is correctly referenced
grep initrd /boot/grub/grub.cfg
```

</details>



---

## 11. Pre-reboot Checklist and Reboot {#step-11-reboot}

1. `emerge --info` executes normally without error
2. UUID in `/etc/fstab` is correct (Confirm with `blkid` again)
3. Root and normal user passwords set
4. `grub-mkconfig` executed or `bootctl` configuration completed
5. If using LUKS, confirm initramfs contains `cryptsetup`

Leave chroot and reboot:
```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
swapoff -a
reboot
```

---

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Congratulations!** You have completed Gentoo base installation.

**Next Step**: [Desktop Configuration](/posts/gentoo-install-desktop/)

</div>
