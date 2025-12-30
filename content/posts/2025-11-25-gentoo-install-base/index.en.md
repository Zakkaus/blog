---
title: "Gentoo Linux Installation Guide (Base)"
slug: gentoo-install
aliases:
  - /posts/gentoo-install/
translationKey: gentoo-install
date: 2025-11-30
summary: "Gentoo Linux base system installation tutorial, covering partitioning, Stage3, kernel compilation, bootloader configuration, etc. Also covers LUKS full disk encryption."
description: "2025 Latest Gentoo Linux Installation Guide (Base), detailing UEFI installation, kernel compilation, and more. Suitable for advanced Linux users and Gentoo beginners. Includes LUKS full disk encryption guide."
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

This article aims to provide a complete Gentoo installation process demonstration and **intensively provides references for learning**. The guide contains numerous official Wiki links and technical documents to help readers deeply understand the principles and configuration details of each step.

**This is not just a simple step-by-step tutorial, but a guiding learning resource** — the first step in using Gentoo is learning to read the Wiki and solve problems yourself, and making good use of Google or AI tools to find answers. When encountering problems or needing in-depth understanding, please be sure to consult the official handbook and the reference links provided in this article.

If you have questions or find issues during reading, welcome to raise them through the following channels:
- **Gentoo Community**: [Gentoo Forums](https://forums.gentoo.org/) | IRC: #gentoo @ Libera.Chat

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
- **Learning Curve**: Requires some basic Linux knowledge

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94);">

**Who is it for?**
- Tech enthusiasts who want to learn Linux deeply
- Users pursuing system performance and customization
- Geeks who enjoy the DIY process

</div>

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11);">

**Who is it not for?**
- Beginners who update want to install and use quickly (Recommended to try Ubuntu, Fedora first)
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
- Have some basic Linux command line knowledge
- Prepared another device to consult documentation (Or use GUI LiveCD)

</details>

---

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

### Guide Content Overview

This guide will lead you to install Gentoo Linux on x86_64 UEFI platform.

**This article will teach you**:
- Install Gentoo base system from scratch (Partitioning, Stage3, Kernel, Bootloader)
- Configure Portage and optimize compilation flags (make.conf, USE flags, CPU flags)
- Enable Binary Package Host (Significantly reduce installation time)
- Install Desktop Environment (KDE Plasma, GNOME, Hyprland)
- Configure Localization (language, fonts, input method)
- Optional Advanced Configuration (LUKS full disk encryption, Secure Boot, LTO optimization, Kernel tuning, RAID)
- System Maintenance (SSD TRIM, Power Management, Flatpak, System Update)

</div>

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important Reminder**

**Please Disable Secure Boot First**: Before starting installation, be sure to enter BIOS settings and temporarily disable **Secure Boot**. Enabling Secure Boot may cause installation media unable to boot, or installed system unable to boot. You can reconfigure and enable Secure Boot after system installation is complete.

**Backup All Important Data!**: This guide involves disk partitioning operations, please be sure to backup all important data before starting!

</div>

---

## 0. Prepare Installation Media {#step-0-prepare}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Choosing Installation Media](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Media)

</div>

### 0.1 Download Gentoo ISO

Get download links from the [**Download Page**](https://www.gentoo.org/downloads/) and [**Mirror List**](https://www.gentoo.org/downloads/mirrors/).

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

The dates in the following links (e.g., `20251123T...`) are for reference only, please be sure to select the **latest date** file in the mirror site.

</div>

**Download Minimal ISO (Select a mirror near you):**

Visit a mirror site to find the latest ISO (select directory with latest date):

```bash
# Global / Generic Mirror:
# http://distfiles.gentoo.org/releases/amd64/autobuilds/

# Or select a mirror close to your location from:
# https://www.gentoo.org/downloads/mirrors/
```

Download example (replace `YYYYMMDDTHHMMSSZ` with the latest date found):

```bash
# Download ISO and Signature:
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/YYYYMMDDTHHMMSSZ/install-amd64-minimal-YYYYMMDDTHHMMSSZ.iso
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/YYYYMMDDTHHMMSSZ/install-amd64-minimal-YYYYMMDDTHHMMSSZ.iso.asc
```

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Beginner Recommendation: Use LiveGUI USB Image**

If you prefer using a browser directly or connecting to Wi-Fi more conveniently during installation, you can choose **LiveGUI USB Image**.

**Recommended for beginners: Weekly built KDE desktop Live ISO**: <https://iso.gig-os.org/>
(From Gig-OS <https://github.com/Gig-OS> project)

**Live ISO Login Credentials**:
- Account: `live`
- Password: `live`
- Root Password: `live`

</div>

Verify Signature (Optional):
```bash
# Get Gentoo Release Signing Key
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

Gentoo installation process relies completely on network to download source packages (Stage3) and software repository (Portage). Configuring network in Live environment is the first step.

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

We need to divide independent storage space for the Linux system. UEFI systems usually need an ESP partition (Boot) and a Root partition (System). Reasonable planning makes future maintenance easier.

### What is EFI System Partition (ESP)?

When installing Gentoo on a system booted by UEFI (instead of BIOS), creating an EFI System Partition (ESP) is necessary. ESP must be a FAT variant. Official UEFI specification states UEFI firmware will recognize FAT12, 16 or 32 filesystems, but FAT32 is recommended.

</div>

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Warning**
If ESP is not formatted using a FAT variant, the system's UEFI firmware will not find the bootloader (or Linux kernel) and will likely fail to boot the system!

</div>

### Recommended Partition Scheme (UEFI)

The table below provides a recommended default partition table for Gentoo installation.

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

More mirrors available at: [Mirror List](https://www.gentoo.org/downloads/mirrors/)

```bash
cd /mnt/gentoo

# Use links browser to visit mirror site to download Stage3:
links http://distfiles.gentoo.org/releases/amd64/autobuilds/

# In links browser:
# 1. Select the directory with latest date (Format: YYYYMMDDTHHMMSSZ)
# 2. Download stage3-*.tar.xz file

# Unpack Stage3 archive:
# x:extract p:preserve permissions v:verbose f:file --numeric-owner:use numeric IDs
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

If downloaded `.DIGESTS` or `.CONTENTS`, can verify with `openssl` or `gpg`.

### 4.3 Copy DNS and Mount Pseudo-filesystems

```bash
cp --dereference /etc/resolv.conf /mnt/gentoo/etc/ # Copy DNS config
mount --types proc /proc /mnt/gentoo/proc          # Mount process info
mount --rbind /sys /mnt/gentoo/sys                 # Bind mount system info
mount --rbind /dev /mnt/gentoo/dev                 # Bind mount device nodes
mount --rbind /run /mnt/gentoo/run                 # Bind mount runtime info
mount --make-rslave /mnt/gentoo/sys                # Set as slave mount
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

Portage is Gentoo's package management system and core feature. Initializing Portage and configuring `make.conf` is like setting the "blueprint" for your new system, deciding how software is compiled, what features to use, and where to download from.

</div>

### 5.1 Sync Tree

```bash
emerge-webrsync   # Get latest Portage snapshot (faster than rsync)
emerge --sync     # Sync Portage tree (get latest ebuilds)
emerge --ask app-editors/vim # Install Vim editor (Recommended)
eselect editor list          # List available editors
eselect editor set vi        # Set Vim as default editor (vi usually symlinks to vim)
```

Set Mirrors (See [Mirror List](https://www.gentoo.org/downloads/mirrors/) for more):
```bash
mirrorselect -i -o >> /etc/portage/make.conf

# Or manually select (Example: Global):
# echo 'GENTOO_MIRRORS="http://distfiles.gentoo.org/"' >> /etc/portage/make.conf
```

### 5.2 make.conf Example {#52-makeconf-example}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - USE flags](https://wiki.gentoo.org/wiki/Handbook:AMD64/Working/USE) · [/etc/portage/make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

</div>

Edit `/etc/portage/make.conf`:
```bash
vim /etc/portage/make.conf
```

**Newbie Configuration (Copy & Paste)**:
<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Please modify `-j` parameter in `MAKEOPTS` according to your CPU cores (e.g. 8 cores use `-j8`).

</div>

```conf
# ========== Compilation Optimization ==========
# -march=native: Optimize for current CPU architecture
# -O2: Recommended optimization level
# -pipe: Use pipes to speed up compilation
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"    # C compiler flags
CXXFLAGS="${COMMON_FLAGS}"  # C++ compiler flags
FCFLAGS="${COMMON_FLAGS}"   # Fortran compiler flags
FFLAGS="${COMMON_FLAGS}"    # Fortran 77 compiler flags

# ========== Parallel Compilation ==========
# Number after -j = CPU threads (run nproc to check)
# Decrease if memory is low (e.g. -j4)
MAKEOPTS="-j8"

# ========== Language & Localization ==========
# LC_MESSAGES=C: Keep compilation output in English
LC_MESSAGES=C
# L10N/LINGUAS: Supported languages
L10N="en en-US zh zh-CN zh-TW"
LINGUAS="en en_US zh zh_CN zh_TW"

# ========== Mirrors ==========
# Generated by mirrorselect or manually added

# ========== USE Flags ==========
# systemd: Use systemd as init (Change to -systemd if using OpenRC)
# dist-kernel: Use distribution kernel, recommended for beginners
# networkmanager: Network management tool
# bluetooth: Bluetooth support (Remove if not needed)
USE="systemd udev dbus policykit networkmanager bluetooth git dist-kernel"

# ========== License Setting ==========
# "*" Accept all licenses (including proprietary)
# Warning: This means you agree to install closed-source software
# Change to "@FREE" for FOSS only
ACCEPT_LICENSE="*"
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Detailed Configuration**

For a fully commented `make.conf` example, please see [Advanced Section 13.11](/posts/gentoo-install-advanced/#1311-detailed-makeconf-example).

This example includes:
- Detailed explanation and recommended values for each setting
- Adjustments for different hardware
- USE flags explanation
- FEATURES and logging settings

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Newbie Tips**

- `MAKEOPTS="-j32"` number should be your CPU thread count, check with `nproc`.
- Decrease parallel jobs (e.g. `-j16`) if running out of memory.
- USE flags are Gentoo's core feature, deciding what features to include during compilation.

</div>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Advanced Settings**

- **ACCEPT_LICENSE**: See [Advanced Section 13.12](/posts/gentoo-install-advanced/#1312-accept_license)
- **CPU Flags (CPU_FLAGS_X86)**: See [Advanced Section 13.13](/posts/gentoo-install-advanced/#1313-cpu-instruction-set-optimization-cpu_flags_x86)

</div>

### 5.3 Configure CPU Flags {#53-configure-cpu-flags}

To let Portage know what specific instruction sets your CPU supports (AES, AVX, SSE4.2, etc.), we need to set `CPU_FLAGS_X86`.

Install detection tool:
```bash
emerge --ask app-portage/cpuid2cpuflags
```

Run detection and append to config:
```bash
cpuid2cpuflags >> /etc/portage/make.conf
```

Check end of `/etc/portage/make.conf`, you should see something like:
```conf
CPU_FLAGS_X86="aes avx avx2 f16c fma3 mmx mmxext pclmul popcnt rdrand sse sse2 sse3 sse4_1 sse4_2 ssse3"
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Note**

For more details on CPU flags optimization, refer to [Advanced Section 13.13](/posts/gentoo-install-advanced/#1313-cpu-instruction-set-optimization-cpu_flags_x86).

</div>

---

### 5.4 Optional: Enable Binary Package Host

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: Binary Package Host](https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation#Optional:_Adding_a_binary_package_host) · [Binary package guide](https://wiki.gentoo.org/wiki/Binary_package_guide)

</div>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why use Binary Package Host?**

Since December 2023, Gentoo [officially provides a binary package host](https://www.gentoo.org/news/2023/12/29/Gentoo-binary.html) (binhost), which can drastically reduce installation time:
- **LLVM / Clang**: From 2-3 hours to 5 minutes
- **Rust**: From 1-2 hours to 3 minutes
- **Firefox / Chromium**: From hours to 10 minutes

All binary packages are verified with **cryptographic signatures** to ensure security.

</div>

#### Configure Binary Package Host

**Step 1: Configure Repository**

Create binhost config:
```bash
mkdir -p /etc/portage/binrepos.conf
vim /etc/portage/binrepos.conf/gentoobinhost.conf
```

Add the following content:

```conf
# /etc/portage/binrepos.conf/gentoobinhost.conf
[binhost]
priority = 9999
sync-uri = https://distfiles.gentoo.org/releases/amd64/binpackages/23.0/x86-64/
```

**Step 2: Enable Binary Features**

Edit `/etc/portage/make.conf`, add:
```bash
# Enable binary package download and signature verification
FEATURES="${FEATURES} getbinpkg binpkg-request-signature"

# Default to binary packages (Optional, recommended for beginners)
EMERGE_DEFAULT_OPTS="${EMERGE_DEFAULT_OPTS} --getbinpkg"
```

**Step 3: Get Signature Keys**
Run:
```bash
getuto
```

#### Verify Configuration
Test:
```bash
emerge --pretend --getbinpkg sys-apps/portage
```

If output contains `[binary]`, it is successful:
```
[ebuild   R    ] sys-apps/portage-3.0.61::gentoo [binary]
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Usage Tips**

- **Prefer Binary**: With above keys, emerge will automatically prefer binaries.
- **Force Source**: `emerge --usepkg=n <package>`
- **Binary Only**: `emerge --usepkgonly <package>`
- **Browse Packages**: [Gentoo Binhost Browser](https://distfiles.gentoo.org/releases/amd64/binpackages/)

</div>
---

## 6. Profile, System Configuration, and Localization {#step-6-system}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Installing the Gentoo Base System](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Profiles define basic system settings and default USE flags, embodying Gentoo's flexibility. Configuring timezone, locale, and network are key to making your Gentoo system function correctly and suit your usage habits.

</div>

### 6.1 Select Profile

```bash
eselect profile list          # List all available profiles
eselect profile set <number>  # Set selected profile
emerge -avuDN @world          # Update system to match new profile
```

Common options:
- `default/linux/amd64/23.0/desktop/plasma/systemd`
- `default/linux/amd64/23.0/desktop/gnome/systemd`
- `default/linux/amd64/23.0/desktop` (OpenRC Desktop)

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
eselect locale set en_US.utf8   # Set default system locale (Recommended English to avoid mojibake)

# Reload environment
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

### 6.3 Hostname and Network Configuration

**Set Hostname**:
```bash
echo "gentoo" > /etc/hostname
```

**Network Manager Selection**:

**Option A: NetworkManager (Recommended, Universal)**
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [NetworkManager](https://wiki.gentoo.org/wiki/NetworkManager)

</div>

Suitable for most desktop users, supporting both OpenRC and systemd.
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
**CLI**: Use `nmtui` (Graphical wizard) or `nmcli`

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

If you don't want to use NetworkManager, you can choose:

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

</details>

<details>
<summary><b>Option C: Native Solution (Click to expand)</b></summary>

Use init system's native network management, suitable for servers or minimal environments.

**OpenRC Network Scripts**:
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [OpenRC](https://wiki.gentoo.org/wiki/OpenRC) · [OpenRC: Network Management](https://wiki.gentoo.org/wiki/OpenRC#Network_management)

</div>

```bash
vim /etc/conf.d/net
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

Please replace `enp5s0` below with your actual interface name (check with `ip link`).

</div>

Add:
```conf
config_enp5s0="dhcp"
```

```bash
ln -s /etc/init.d/net.lo /etc/init.d/net.enp5s0 # Create symlink
rc-update add net.enp5s0 default                # Enable on boot
```

---

**Systemd Networkd**:
<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [systemd-networkd](https://wiki.gentoo.org/wiki/Systemd/systemd-networkd) · [systemd-resolved](https://wiki.gentoo.org/wiki/Systemd/systemd-resolved)

</div>

```bash
systemctl enable systemd-networkd
systemctl enable systemd-resolved
```
*Note: Requires manual `.network` configuration files.*

</details>

### 6.4 Configure fstab

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - fstab](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/System) · [Gentoo Wiki: /etc/fstab](https://wiki.gentoo.org/wiki//etc/fstab)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

The system needs to know which partitions to mount at boot. `/etc/fstab` tells the system:
- Which partitions to mount automatically
- Where to mount each partition
- Which filesystem type to use

**Recommend using UUID**: Device paths (like `/dev/sda1`) change, but UUIDs are unique descriptors for filesystems.

</div>

---

#### Method A: Auto-generate with genfstab (Recommended)

<details>
<summary><b>Click to expand detailed steps</b></summary>

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Install genfstab**

`genfstab` is in `sys-fs/genfstab` package.
- **Gig-OS / Arch LiveISO**: Pre-installed.
- **Gentoo Minimal ISO**: Install via `emerge --ask sys-fs/genfstab`.

</div>

**Standard Usage (Execute outside chroot):**

```bash
# 1. Verify all partitions mounted
lsblk
mount | grep /mnt/gentoo

# 2. Generate fstab (Use UUID)
genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab

# 3. Check generated file
cat /mnt/gentoo/etc/fstab
```

<details>
<summary><b>Alternatives inside chroot</b></summary>

**Method 1: Inside chroot (Simplest)**
```bash
emerge --ask sys-fs/genfstab
genfstab -U / >> /etc/fstab
vim /etc/fstab # Clean up entries like /proc, /sys
```

**Method 2: New Terminal (LiveGUI)**
Open new terminal:
```bash
genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab
```

</details>

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**genfstab Compatibility**

[`genfstab`](https://wiki.archlinux.org/title/Genfstab) supports:
- **Btrfs Subvolumes**: Auto-detects `subvol=`
- **LUKS**: Auto-uses decrypted device UUID
- **Standard**: ext4, xfs, vfat

</div>

</details>

---

#### Method B: Manual Editing

<details>
<summary><b>Click to expand manual steps</b></summary>

**1. Get UUIDs**
```bash
blkid
```

**2. Edit fstab**
```bash
vim /etc/fstab
```

**Basic Example (ext4/xfs):**
```fstab
# <UUID>                                   <Mountpoint> <Type> <Options>             <dump> <fsck>
UUID=7E91-5869                             /efi         vfat   defaults,noatime      0      2
UUID=7fb33b5d-4cff-47ff-ab12-7b461b5d6e13  none         swap   sw                    0      0
UUID=8c08f447-c79c-4fda-8c08-f447c79ce690  /            xfs    defaults,noatime      0      1
```

</details>

---

<details>
<summary><b>Btrfs Subvolume Configuration</b></summary>

**genfstab:**
`genfstab -U` works automatically if subvolumes are mounted.

**Manual Example:**
```fstab
# Root Subvolume
UUID=7b44c5eb-caa0-413b-9b7e-a991e1697465  /       btrfs  defaults,noatime,compress=zstd:3,discard=async,space_cache=v2,subvol=@       0 0

# Home Subvolume
UUID=7b44c5eb-caa0-413b-9b7e-a991e1697465  /home   btrfs  defaults,noatime,compress=zstd:3,discard=async,space_cache=v2,subvol=@home   0 0

# Swap
UUID=7fb33b5d-4cff-47ff-ab12-7b461b5d6e13  none    swap   sw                                                                            0 0

# EFI
UUID=7E91-5869                             /efi    vfat   defaults,noatime,fmask=0022,dmask=0022                                        0 2
```

</details>

<details>
<summary><b>LUKS Encrypted Partition</b></summary>

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Key Point**

fstab must use the **Decrypted Mapped Device** UUID (`/dev/mapper/xxx`), NOT the LUKS container UUID.

</div>

**genfstab:**
Automatically detects decrypted device UUID.

**Manual:**
Use `blkid`.
- Use UUID from `TYPE="btrfs"` (or ext4), **not** `TYPE="crypto_LUKS"`.

</details>

---

## 7. Kernel and Firmware {#step-7-kernel}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Configuring the Kernel](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Kernel)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

The kernel is the core of the OS. Gentoo allows you to manually tailor the kernel for extreme performance and minimal size, but beginners can also use pre-compiled kernels.

</div>

### 7.1 Fast Track: Distribution Kernel

```bash
emerge --ask sys-kernel/gentoo-kernel-bin
```

Remember to regenerate bootloader config after kernel updates.

<details>
<summary><b>Advanced: Manual Compilation (Gentoo Experience) (Click to expand)</b></summary>

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Newbie Tip**

Manual compilation is complex. If you want to try Gentoo quickly, skip this section and use 7.1.

</div>

**Quick Start with Genkernel:**
```bash
emerge --ask sys-kernel/gentoo-sources sys-kernel/genkernel
genkernel --install all  # Auto compile and install kernel/initramfs
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Advanced Content**

For deep configuration, LLVM/Clang compilation, LTO, etc., see **[Section 16.0 Advanced Kernel Guide](/posts/gentoo-install-advanced/#section-16-kernel-advanced)**.

</div>

</details>

### 7.3 Firmware and Microcode

```bash
mkdir -p /etc/portage/package.license
# Accept license for linux-firmware
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' > /etc/portage/package.license/linux-firmware
echo 'sys-kernel/installkernel dracut' > /etc/portage/package.use/installkernel
emerge --ask sys-kernel/linux-firmware
emerge --ask sys-firmware/intel-microcode  # Intel CPU
```

<div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0; border-left: 3px solid rgb(251, 191, 36);">

**About package.license**

Explicitly creating a license file is best practice in Gentoo, even if default is set to accept all, ensuring better maintenance and auditability.

</div>

---

## 8. Base Tools {#step-8-base-packages}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Installing System Tools](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Tools)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Stage3 only has basic commands. We need to add system logger, network management, and filesystem tools.

</div>

### 8.1 System Services

<details>
<summary><b>OpenRC User Configuration (Click to expand)</b></summary>

**1. System Logger**
```bash
emerge --ask app-admin/syslog-ng
rc-update add syslog-ng default
```

**2. Cron Daemon**
```bash
emerge --ask sys-process/cronie
rc-update add cronie default
```

**3. Time Sync**
```bash
emerge --ask net-misc/chrony
rc-update add chronyd default
```

</details>

<details>
<summary><b>systemd User Configuration (Click to expand)</b></summary>

systemd has built-in journal and timers.

**Time Sync**
```bash
systemctl enable --now systemd-timesyncd
```

</details>

### 8.2 Filesystem Tools

Install tools for your filesystem:

```bash
emerge --ask sys-fs/e2fsprogs  # ext4
emerge --ask sys-fs/xfsprogs   # XFS
emerge --ask sys-fs/dosfstools # FAT/vfat (For EFI)
emerge --ask sys-fs/btrfs-progs # Btrfs
```
## 9. Create User and Permissions {#step-9-users}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Finalizing](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Finalizing)

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Why this step?**

Using root account for daily tasks is discouraged. We need to create a normal user and grant `sudo` privileges for better security.

</div>

```bash
passwd root # Set root password
useradd -m -G wheel,video,audio,plugdev zakk # Create user (replace 'zakk') and add to groups
passwd zakk # Set user password
emerge --ask app-admin/sudo
echo "%wheel ALL=(ALL) ALL" > /etc/sudoers.d/wheel # Allow wheel group to use sudo
```

If using systemd, add user to `network`, `lp` groups if needed.

---

## 10. Install Bootloader {#step-10-bootloader}

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Gentoo Handbook: AMD64 - Bootloader](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Bootloader)

</div>

### 10.1 GRUB

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [GRUB](https://wiki.gentoo.org/wiki/GRUB)

</div>

```bash
emerge --ask sys-boot/grub:2
mkdir -p /efi/EFI/Gentoo
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=Gentoo # Install GRUB to ESP
# Install os-prober for multi-boot support
emerge --ask sys-boot/os-prober

# Enable os-prober (To detect Windows, etc.)
echo 'GRUB_DISABLE_OS_PROBER=false' >> /etc/default/grub

# Generate Config
grub-mkconfig -o /boot/grub/grub.cfg
```

<details>
<summary><b>Advanced: systemd-boot (UEFI Only)</b></summary>

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [systemd-boot](https://wiki.gentoo.org/wiki/Systemd/systemd-boot)

</div>

```bash
bootctl --path=/efi install # Install systemd-boot

# 1. Create Gentoo Entry
vim /efi/loader/entries/gentoo.conf
```

Content (**Replace UUIDs**):
```conf
title   Gentoo Linux
linux   /vmlinuz-6.6.62-gentoo-dist
initrd  /initramfs-6.6.62-gentoo-dist.img
options root=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx rw quiet
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**
If using LUKS, options line needs `rd.luks.uuid=...`.

</div>

**2. Create Windows Entry**:
```bash
vim /efi/loader/entries/windows.conf
```
```ini
title      Windows 11
sort-key   windows-01
efi        /EFI/Microsoft/Boot/bootmgfw.efi
```

**3. Set Default**:
```bash
vim /efi/loader/loader.conf
```
```ini
default gentoo.conf
timeout 3
console-mode auto
```

</details>

<details>
<summary><b>Advanced: Encryption Support (LUKS Only)</b></summary>

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Dm-crypt](https://wiki.gentoo.org/wiki/Dm-crypt)

</div>

**Step 1: Enable systemd cryptsetup**
```bash
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde
emerge --ask --oneshot sys-apps/systemd
```

**Step 2: Get LUKS UUID**
```bash
blkid /dev/nvme0n1p3
# Note the UUID where TYPE="crypto_LUKS"
```

**Step 3: Kernel Parameters (GRUB)**
Edit `/etc/default/grub` (**Replace UUIDs**):
```bash
GRUB_CMDLINE_LINUX="rd.luks.uuid=<LUKS-UUID> rd.luks.allow-discards root=UUID=<ROOT-UUID> rootfstype=btrfs"
```
*Note: `root=UUID` here is the decrypted filesystem UUID.*

**Step 4: Install dracut**
```bash
emerge --ask sys-kernel/dracut
```

**Step 5: Dracut Config**
Edit `/etc/dracut.conf.d/luks.conf`:
```conf
kernel_cmdline=""
add_dracutmodules+=" btrfs systemd crypt dm "
install_items+=" /sbin/cryptsetup /bin/grep "
filesystems+=" btrfs "
```

**Step 6: /etc/crypttab**
Edit `/etc/crypttab` (**Use LUKS UUID**):
```conf
gentoo-root UUID=<LUKS-UUID> none luks,discard
```

**Step 7: Regenerate initramfs**
```bash
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
```

**Step 8: Update GRUB**
```bash
grub-mkconfig -o /boot/grub/grub.cfg
grep initrd /boot/grub/grub.cfg
```

</details>

---

## 11. Final Reboot {#step-11-reboot}

Checklist:
1. `emerge --info` runs fine
2. `/etc/fstab` is correct (`blkid` to verify)
3. User and Root passwords set
4. Bootloader configured
5. Initramfs has `cryptsetup` (if LUKS)

Exit and Reboot:
```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
swapoff -a
reboot
```

---

## 12. Maintenance: Becoming a System Admin

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Upgrading Gentoo](https://wiki.gentoo.org/wiki/Upgrading_Gentoo) · [Gentoo Cheat Sheet](https://wiki.gentoo.org/wiki/Gentoo_Cheat_Sheet)

</div>

### 12.1 Routine Maintenance

**1. Update System** (Bi-weekly recommended):
```bash
emerge --sync
emerge -avuDN @world
```

**2. Check News** (Important):
```bash
eselect news list
eselect news read
```

**3. Config Updates**:
```bash
dispatch-conf  # Recommended interactive tool
```

**4. Clean Dependencies**:
```bash
emerge --ask --depclean
```

**5. Clean Source Files**:
```bash
emerge --ask app-portage/gentoolkit
eclean-dist
```

**6. Handle Blocked Packages**:
Deselect conflicting packages (`emerge --deselect <pkg>`) then `emerge --depclean`.

**7. Security Checks (GLSA)**:
```bash
glsa-check -l
```

**8. Logs and Status**:
- **OpenRC**: `rc-status`, `tail -f /var/log/messages`
- **Systemd**: `journalctl -b`, `journalctl -xe`

### 12.2 Portage Tips

**1. File Structure (`/etc/portage/`)**:
Use directories!
- `make.conf`
- `package.use/`
- `package.accept_keywords/`
- `package.license/`

**2. Emerge Flags**:
- `--ask` (`-a`): Confirm
- `--verbose` (`-v`): Details
- `--update` (`-u`) `--deep` (`-D`) `--newuse` (`-N`): Full update

**3. Search (Eix)**:
Recommended over `emerge -s`.
```bash
emerge --ask app-portage/eix
eix-update
eix <keyword>
```

---

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

**Congratulations!** You have completed the Gentoo Base Installation.

**Next Step**: [Desktop Configuration](/posts/gentoo-install-desktop/)

</div>
