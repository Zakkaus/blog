---
title: "Gentoo Linux Installation Guide (Base)"
slug: gentoo-install
aliases:
  - /posts/gentoo-install/
translationKey: gentoo-install
date: 2025-11-25
summary: "Gentoo Linux base system installation tutorial, covering partitioning, Stage3, kernel compilation, bootloader configuration, etc. Also features LUKS full disk encryption tutorial."
description: "2025 Latest Gentoo Linux Installation Guide (Base), detailing UEFI installation process, kernel compilation, etc. Suitable for Linux advanced users and Gentoo beginners. Also features LUKS full disk encryption tutorial."
article:
  showHero: true
  heroStyle: background
featureImage: feature-gentoo-chan.webp
featureImageAlt: "Gentoo Chan"
keywords:
  - Gentoo Linux
  - Linux Install
  - Source Compilation
  - systemd
  - OpenRC
  - Portage
  - make.conf
  - Kernel Compilation
  - UEFI Install
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

> **Special Note**
>
> This article is Part 1 of the **Gentoo Linux Installation Guide**: **Base Installation**.
>
> **Series Navigation**:
> 1. **Base Installation (This Article)**: Installing Gentoo base system from scratch
> 2. [Desktop Configuration](/posts/gentoo-install-desktop/): Graphics drivers, desktop environments, input methods, etc.
> 3. [Advanced Optimization](/posts/gentoo-install-advanced/): make.conf optimization, LTO, system maintenance
>
> **Recommended Reading Path**:
> - Read as needed: Base Installation (Sections 0-11) → Desktop Configuration (Section 12) → Advanced Optimization (Sections 13-17)
>
> ---
>
> ### About This Guide
>
> This article aims to provide a complete Gentoo installation walkthrough and **intensively provides references for learning**. The article contains numerous official Wiki links and technical documents to help readers deeply understand the principles and configuration details of each step.
>
> **This is not a simple spoon-fed tutorial, but a guiding learning resource**—the first step in using Gentoo is learning to read the Wiki and solve problems yourself, and making good use of Google or even AI tools to find answers. When encountering problems or needing in-depth understanding, please be sure to consult the official handbook and the reference links provided in this article.
>
> If you encounter questions or find issues during reading, you are welcome to raise them through the following channels:
> - **Official Community**: [Gentoo Forums](https://forums.gentoo.org/) | IRC: #gentoo @ Libera.Chat
>
> **Highly recommended to follow the official handbook**:
> - [Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)
>
> This article is newly migrated content, please forgive any deficiencies.
>
> ---

## What is Gentoo?

Gentoo Linux is a source-based Linux distribution known for its **high customizability** and **performance optimization**. Unlike other distributions, Gentoo lets you compile all software from source code, which means:

- **Extreme Performance**: All software is optimized and compiled for your hardware
- **Total Control**: You decide what the system contains and what it doesn't
- **Deep Learning**: Deeply understand Linux by building the system yourself
- **Compilation Time**: Initial installation takes a long time (recommended to reserve 3-6 hours)
- **Learning Curve**: Requires some Linux basic knowledge

**Who is it for?**
- Tech enthusiasts who want to learn Linux deeply
- Users pursuing system performance and customization
- Geeks who enjoy the DIY process

**Who is it not for?**
- Beginners who just want to install and use quickly (recommended to try Ubuntu, Fedora first)
- Users who don't have time to tinker with the system

<details>
<summary><b>Core Concepts at a Glance (Click to Expand)</b></summary>

Before starting installation, understand a few core concepts:

**Stage3** ([Wiki](https://wiki.gentoo.org/wiki/Stage_file))
A minimal Gentoo base system archive. It contains the basic toolchain (compiler, libraries, etc.) for building a complete system. You will unpack it to the hard drive as the "foundation" of the new system.

**Portage** ([Wiki](https://wiki.gentoo.org/wiki/Portage))
Gentoo's package management system. It doesn't directly install pre-compiled packages but downloads source code, compiles according to your configuration, and then installs. The core command is `emerge`.

**USE Flags** ([Wiki](https://wiki.gentoo.org/wiki/USE_flag))
Switches that control software features. For example, `USE="bluetooth"` will enable Bluetooth functionality for all software that supports it during compilation. This is the core of Gentoo customization.

**Profile** ([Wiki](https://wiki.gentoo.org/wiki/Profile_(Portage)))
Preset system configuration templates. For example, `desktop/plasma/systemd` profile will automatically enable default USE flags suitable for KDE Plasma desktop.

**Emerge** ([Wiki](https://wiki.gentoo.org/wiki/Emerge))
Portage's command-line tool. Common commands:
- `emerge --ask <package>` - Install software
- `emerge --sync` - Sync software repository
- `emerge -avuDN @world` - Update the entire system

</details>

<details>
<summary><b>Installation Time Estimate (Click to Expand)</b></summary>

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
| **Total** | **3-6 hours** (Depends on hardware performance)|

> **Tip**: Using pre-compiled kernels and binary packages can significantly reduce time but will sacrifice some customizability.

</details>

<details>
<summary><b>Disk Space Requirements & Pre-start Checklist (Click to Expand)</b></summary>

### Disk Space Requirements

- **Minimal Install**: 10 GB (No desktop environment)
- **Recommended Space**: 30 GB (Lightweight desktop)
- **Comfortable Space**: 80 GB+ (Full desktop + compilation cache)

### Pre-start Checklist

- Backed up all important data
- Prepared an 8GB+ USB flash drive
- Confirmed stable network connection (Wired network best)
- Reserved sufficient time (Recommended a full half-day)
- Have some Linux command line basics
- Prepared another device to check documentation (or use GUI LiveCD)

</details>

---

**Introduction**

This guide will lead you to install Gentoo Linux on x86_64 UEFI platform.

**This article will teach you**:
- Install Gentoo base system from scratch (Partitioning, Stage3, Kernel, Bootloader)
- Configure Portage and optimize compilation parameters (make.conf, USE flags, CPU flags)
- Install Desktop Environment (KDE Plasma, GNOME, Hyprland)
- Configure Chinese environment (locale, fonts, Fcitx5 input method)
- Optional advanced configurations (LUKS full disk encryption, LTO optimization, Kernel tuning, RAID)
- System maintenance (SSD TRIM, Power management, Flatpak, System update)

> **Please Disable Secure Boot First**
> Before starting installation, please be sure to enter BIOS settings and temporarily disable **Secure Boot**.
> Enabling Secure Boot may cause installation media unable to boot, or the installed system unable to boot. You can re-configure and enable Secure Boot referring to later chapters in this guide after system installation is complete and successfully booted.

> **Important**: Please backup all important data before starting! This guide involves disk partitioning operations.

Verified up to November 25, 2025.

---

## 0. Prepare Installation Media {#step-0-prepare}

> **Reference**: [Gentoo Handbook: AMD64 - Choosing Installation Media](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Media)

### 0.1 Download Gentoo ISO

Get download links according to the [**Download Page**](/download/)

> **Note**: Dates in the links below (e.g., `20251123T...`) are for reference only, please be sure to select the **latest date** file in the mirror site.

Download Minimal ISO (Using Global Mirror as example):
```bash
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/20251123T153051Z/install-amd64-minimal-20251123T153051Z.iso
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/20251123T153051Z/install-amd64-minimal-20251123T153051Z.iso.asc
```

> If you wish to use a browser directly or connect to Wi-Fi more conveniently during installation, you can choose **LiveGUI USB Image**.
>
> **Newcomer Recommendation: Use Weekly Built KDE Desktop Live ISO**: <https://iso.gig-os.org/>
> (From Gig-OS <https://github.com/Gig-OS> project)
>
> **Live ISO Login Credentials**:
> - Account: `live`
> - Password: `live`
> - Root Password: `live`
>
> **System Support**:
> - Supports modern hardware and comes with necessary tools.

Verify Signature (Optional):
```bash
# Fetch Gentoo Release signing public key from keyserver
gpg --keyserver hkps://keys.openpgp.org --recv-keys 0xBB572E0E2D1829105A8D0F7CF7A88992
# --keyserver: Specify keyserver address
# --recv-keys: Receive and import public key
# 0xBB...992: Gentoo Release Media signing key fingerprint

# Verify ISO file digital signature
gpg --verify install-amd64-minimal-20251123T153051Z.iso.asc install-amd64-minimal-20251123T153051Z.iso
# --verify: Verify signature file
# .iso.asc: Signature file (ASCII armored)
# .iso: ISO file being verified
```

### 0.2 Create USB Installation Drive

**Linux:**
```bash
sudo dd if=install-amd64-minimal-20251123T153051Z.iso of=/dev/sdX bs=4M status=progress oflag=sync
# if=Input file of=Output device bs=Block size status=Show progress
```
> Please replace `sdX` with USB device name, e.g., `/dev/sdb`.

**Windows:** Recommended to use [Rufus](https://rufus.ie/) → Select ISO → Select DD mode when writing.

---

## 1. Enter Live Environment and Connect Network {#step-1-network}

> **Reference**: [Gentoo Handbook: AMD64 - Configuring Network](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Networking)
>
> **Why this step?**
> Gentoo installation process completely relies on network to download source packages (Stage3) and software repository (Portage). Configuring network in Live environment is the first step of installation.

### 1.1 Wired Network

```bash
ip link        # View network interface name (e.g., eno1, wlan0)
dhcpcd eno1    # Enable DHCP for wired card to auto get IP
ping -c3 gentoo.org # Test network connectivity
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

> If WPA3 is unstable, please revert to WPA2 first.

<details>
<summary><b>Advanced Setting: Start SSH for Remote Operation (Click to Expand)</b></summary>

```bash
passwd                      # Set root password (required for remote login)
rc-service sshd start       # Start SSH service
rc-update add sshd default  # Set SSH auto-start (Optional in Live environment)
ip a | grep inet            # View current IP address
# On another device: ssh root@<IP>
```

</details>


## 2. Plan Disk Partitioning {#step-2-partition}

> **Reference**: [Gentoo Handbook: AMD64 - Preparing Disks](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks)
>
> **Why this step?**
> We need to divide independent storage space for Linux system. UEFI systems usually need an ESP partition (Boot) and a Root partition (System). Reasonable planning makes future maintenance easier.

### What is EFI System Partition (ESP)?

When installing Gentoo on OS booted by UEFI (instead of BIOS), creating EFI System Partition (ESP) is necessary. ESP must be a FAT variant (sometimes shown as vfat on Linux systems). Official UEFI spec states UEFI firmware will recognize FAT12, 16 or 32 filesystems, but FAT32 is recommended.

> **Warning**: If ESP is not formatted using FAT variant, system's UEFI firmware won't find bootloader (or Linux kernel) and likely won't boot!

### Recommended Partition Scheme (UEFI)

The table below provides a recommended default partition table for Gentoo trial installation.

| Device Path | Mount Point | Filesystem | Description |
| :--- | :--- | :--- | :--- |
| `/dev/nvme0n1p1` | `/efi` | vfat | EFI System Partition (ESP) |
| `/dev/nvme0n1p2` | `swap` | swap | Swap Partition |
| `/dev/nvme0n1p3` | `/` | xfs | Root Partition |

### cfdisk Practical Example (Recommended)

`cfdisk` is a graphical partitioning tool, simple and intuitive.

```bash
cfdisk /dev/nvme0n1
```

**Operation Tips**:
1.  Select **GPT** label type.
2.  **Create ESP**: New Partition -> Size `1G` -> Type select `EFI System`.
3.  **Create Swap**: New Partition -> Size `4G` -> Type select `Linux swap`.
4.  **Create Root**: New Partition -> Remaining Space -> Type select `Linux filesystem` (Default).
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
<summary><b>Advanced Setting: fdisk Command Line Partitioning Tutorial (Click to Expand)</b></summary>

`fdisk` is a powerful command line partitioning tool.

```bash
fdisk /dev/nvme0n1
```

**1. View Current Partition Layout**

Use `p` key to display disk current partition config.

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

**2. Create a New Disk Label**

Press `g` key to immediately delete all existing disk partitions and create a new GPT disk label:

```text
Command (m for help): g
Created a new GPT disklabel (GUID: ...).
```

Or, to keep existing GPT disk label, use `d` key to delete existing partitions one by one.

**3. Create EFI System Partition (ESP)**

Input `n` to create a new partition, select partition number 1, start sector default (2048), end sector input `+1G`:

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

> **Note**: Setting root partition type to "Linux root (x86-64)" is not mandatory. If set to "Linux filesystem" type, system works fine too. Only when using bootloader supporting it (i.e., systemd-boot) and not needing fstab file, this filesystem type is needed.

Set partition type to "Linux root (x86-64)" (Type code 23):

```text
Command (m for help): t
Partition number (1-3, default 3): 3
Partition type or alias (type L to list all): 23
Changed type of partition 'Linux filesystem' to 'Linux root (x86-64)'.
```

**6. Write Changes**

Check correctness, input `w` to write changes and exit:

```text
Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

</details>

---

## 3. Create Filesystem and Mount {#step-3-filesystem}

> **Reference**: [Gentoo Handbook: AMD64 - Preparing Disks](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks)
> **Reference**: [Ext4](https://wiki.gentoo.org/wiki/Ext4) and [XFS](https://wiki.gentoo.org/wiki/XFS) and [Btrfs](https://wiki.gentoo.org/wiki/Btrfs)
>
> **Why this step?**
> Disk partitioning only divided space, but cannot store data yet. Creating filesystem (like ext4, Btrfs) allows OS to manage and access these spaces. Mounting connects these filesystems to specific locations in Linux file tree.

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

> Others like [F2FS](https://wiki.gentoo.org/wiki/F2FS) or [ZFS](https://wiki.gentoo.org/wiki/ZFS) please refer to relevant Wiki.

### 3.2 Mount (XFS Example)

```bash
mount /dev/nvme0n1p3 /mnt/gentoo        # Mount Root partition
mkdir -p /mnt/gentoo/efi                # Create ESP mount point
mount /dev/nvme0n1p1 /mnt/gentoo/efi    # Mount ESP partition
swapon /dev/nvme0n1p2                   # Enable Swap partition
```

<details>
<summary><b>Advanced Setting: Btrfs Subvolume Example (Click to Expand)</b></summary>

**1. Format**

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

> **Btrfs Snapshot Suggestion**:
> Recommended to use [Snapper](https://wiki.gentoo.org/wiki/Snapper) to manage snapshots. Reasonable subvolume planning (like separating `@` and `@home`) makes system rollback easier.

</details>

<details>
<summary><b>Advanced Setting: Encrypted Partition (LUKS) (Click to Expand)</b></summary>

**1. Create Encrypted Container**

```bash
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p3
```

**2. Open Encrypted Container**

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

> **Suggestion**: After mounting, recommended to use `lsblk` to confirm mount points are correct.
>
> ```bash
> lsblk
> ```
>
> **Output Example** (Similar to below):
> ```text
> NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
>  nvme0n1          259:1    0 931.5G  0 disk  
> ├─nvme0n1p1      259:7    0     1G  0 part  /efi
> ├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
> └─nvme0n1p3      259:9    0 926.5G  0 part  /
> ```

## 4. Download Stage3 and Enter Chroot {#step-4-stage3}

> **Reference**: [Gentoo Handbook: AMD64 - Installing Stage3](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage)
> **Reference**: [Stage file](https://wiki.gentoo.org/wiki/Stage_file)
>
> **Why this step?**
> Stage3 is a minimal Gentoo base system environment. We unpack it to hard drive as the "foundation" of new system, then enter this new environment via `chroot` for subsequent configuration.

### 4.1 Select Stage3

- **OpenRC**: `stage3-amd64-openrc-*.tar.xz`
- **systemd**: `stage3-amd64-systemd-*.tar.xz`
- Desktop variants only preset some USE flags, standard version is more flexible.

### 4.2 Download and Unpack

```bash
cd /mnt/gentoo
# Use links browser to access mirror site to download Stage3
links https://distfiles.gentoo.org/releases/amd64/autobuilds/20251123T153051Z/ #Using Global mirror as example
# Unpack Stage3 archive
# x:extract p:preserve permissions v:verbose f:file --numeric-owner:use numeric ID
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
mount --make-rslave /mnt/gentoo/sys                # Set as slave mount (Prevent affecting host when unmounting)
mount --make-rslave /mnt/gentoo/dev
mount --make-rslave /mnt/gentoo/run
```

> Using OpenRC can omit `/run` step.

### 4.4 Enter Chroot

```bash
chroot /mnt/gentoo /bin/bash    # Switch root directory to new system
source /etc/profile             # Load environment variables
export PS1="(chroot) ${PS1}"    # Modify prompt to distinguish environment
```

---

## 5. Initialize Portage and make.conf {#step-5-portage}

> **Reference**: [Gentoo Handbook: AMD64 - Installing Gentoo Base System](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base)
>
> **Why this step?**
> Portage is Gentoo's package management system and its core feature. Initializing Portage and configuring `make.conf` is like setting the "blueprint" for your new system, deciding how software is compiled, what features to use, and where to download from.

### 5.1 Sync Tree

```bash
emerge-webrsync   # Get latest Portage snapshot (Faster than rsync)
emerge --sync     # Sync Portage tree (Get latest ebuilds)
emerge --ask app-editors/vim # Install Vim editor (Recommended)
eselect editor list          # List available editors
eselect editor set vi        # Set Vim as default editor (vi is usually symlink to vim)
```

Set mirrors (Choose one):
```bash
mirrorselect -i -o >> /etc/portage/make.conf
# Or manually:
# Using Global mirror as example
echo 'GENTOO_MIRRORS="https://distfiles.gentoo.org/"' >> /etc/portage/make.conf
```

### 5.2 make.conf Example

> **Reference**: [Gentoo Handbook: AMD64 - USE flags](https://wiki.gentoo.org/wiki/Handbook:AMD64/Working/USE) and [/etc/portage/make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

Edit `/etc/portage/make.conf`:
```bash
vim /etc/portage/make.conf
```

**Lazy/Newcomer Config (Copy Paste)**:
> **Tip**: Please modify `-j` parameter in `MAKEOPTS` according to your CPU core count (e.g., 8 core CPU use `-j8`).

```conf
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"

# Please modify number after -j according to CPU core count
MAKEOPTS="-j8"

# Language Settings
LC_MESSAGES=C
L10N="en en-US"
LINGUAS="en en_US"

# Mirror (Global)
GENTOO_MIRRORS="https://distfiles.gentoo.org/"

# Common USE flags (Recommended for systemd users)
USE="systemd udev dbus policykit networkmanager bluetooth git dist-kernel"
ACCEPT_LICENSE="*"
```

<details>
<summary><b>Detailed Config Example (Recommended to read and adjust) (Click to Expand)</b></summary>

```conf
# vim: set language=bash;  # Tell Vim to use bash syntax highlighting
CHOST="x86_64-pc-linux-gnu"  # Target system architecture (Do not modify manually)

# ========== Compilation Optimization Parameters ==========
# -march=native: Optimize for current CPU (Recommended, best performance)
# -O2: Optimization level 2 (Balance performance and stability, recommended)
# -pipe: Use pipes to pass data, speed up compilation (Does not affect final program)
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"    # C program compilation options
CXXFLAGS="${COMMON_FLAGS}"  # C++ program compilation options
FCFLAGS="${COMMON_FLAGS}"   # Fortran program compilation options
FFLAGS="${COMMON_FLAGS}"    # Fortran 77 program compilation options

# CPU Instruction Set Optimization (See 5.3 below, run cpuid2cpuflags to auto generate)
# CPU_FLAGS_X86="aes avx avx2 ..."

# ========== Language and Localization Settings ==========
# Keep build output in English (Easier for troubleshooting and searching solutions)
LC_MESSAGES=C

# L10N: Localization support (Affects docs, translations, etc.)
L10N="en en-US"
# LINGUAS: Legacy localization variable (Some software still needs it)
LINGUAS="en en_US"

# ========== Parallel Compilation Settings ==========
# Number after -j = CPU thread count (e.g., 32 core CPU use -j32)
# Recommended value: CPU thread count (Check via nproc command)
MAKEOPTS="-j32"  # Please adjust according to actual hardware

# ========== Mirror Settings ==========
# Gentoo package download mirror (Recommended to choose a nearby mirror for acceleration)
GENTOO_MIRRORS="https://distfiles.gentoo.org/"

# ========== Emerge Default Options ==========
# --ask: Ask confirmation before executing
# --verbose: Show detailed info (USE flag changes etc.)
# --with-bdeps=y: Include build-time dependencies
# --complete-graph=y: Complete dependency graph analysis
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"

# ========== USE Flags (Global Feature Switches) ==========
# systemd: Use systemd as init system (If using OpenRC change to -systemd)
# udev: Device management support
# dbus: Inter-process communication (Required for desktop environment)
# policykit: Permission management (Required for desktop environment)
# networkmanager: Network manager (Recommended)
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

> **Newcomer Tips**:
> - Number in `MAKEOPTS="-j32"` should be your CPU thread count, check via `nproc` command
> - If memory is insufficient during compilation, reduce parallel tasks (e.g., change to `-j16`)
> - USE flags are Gentoo's core feature, deciding what features software includes when compiled
---

<details>
<summary><b>Advanced Setting: CPU Instruction Set Optimization (CPU_FLAGS_X86) (Click to Expand)</b></summary>

> **Reference**: [CPU_FLAGS_*](https://wiki.gentoo.org/wiki/CPU_FLAGS_*)

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

> **Reference**: [Gentoo Handbook: AMD64 - Installing Gentoo Base System](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base)
>
> **Why this step?**
> Profile defines system's base configuration and preset USE flags, embodying Gentoo's flexibility. Configuring timezone, language, and network basic system parameters is key to making your Gentoo system work properly and fit personal usage habits.

### 6.1 Select Profile

```bash
eselect profile list          # List all available Profiles
eselect profile set <number>  # Set selected Profile
emerge -avuDN @world          # Update system to match new Profile (a:ask v:verbose u:update D:deep N:newuse)
```

Common Options:
- `default/linux/amd64/23.0/desktop/plasma/systemd`
- `default/linux/amd64/23.0/desktop/gnome/systemd`
- `default/linux/amd64/23.0/desktop` (OpenRC Desktop)

### 6.2 Timezone and Language

> **Reference**: [Gentoo Wiki: Localization/Guide](https://wiki.gentoo.org/wiki/Localization/Guide)

```bash
echo "Asia/Shanghai" > /etc/timezone
emerge --config sys-libs/timezone-data

echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
echo "zh_CN.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen                      # Generate selected locales
eselect locale set en_US.utf8   # Set system default language (Recommended English to avoid garbled text)

# Reload environment
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

### 6.3 Hostname and Network Settings

**Set Hostname**:
```bash
echo "gentoo" > /etc/hostname
```

**Network Management Tool Selection**:

**Option A: NetworkManager (Recommended, General)**
> **Reference**: [NetworkManager](https://wiki.gentoo.org/wiki/NetworkManager)

Suitable for most desktop users, supports both OpenRC and systemd.
```bash
emerge --ask net-misc/networkmanager
# OpenRC:
rc-update add NetworkManager default
# systemd:
systemctl enable NetworkManager
```

> **Config Tips**:
> - **GUI**: Run `nm-connection-editor`
> - **CLI**: Use `nmtui` (Graphical wizard) or `nmcli`

<details>
<summary><b>Advanced Tip: Use iwd Backend (Click to Expand)</b></summary>

NetworkManager supports using `iwd` as backend (faster than wpa_supplicant).

```bash
echo "net-misc/networkmanager iwd" >> /etc/portage/package.use/networkmanager
emerge --ask --newuse net-misc/networkmanager
```
Then edit `/etc/NetworkManager/NetworkManager.conf`, add `wifi.backend=iwd` under `[device]`.

</details>

<details>
<summary><b>Option B: Lightweight Scheme (Click to Expand)</b></summary>

If you don't want to use NetworkManager, you can choose lightweight schemes below:

1. **Wired Network (dhcpcd)**
   > **Reference**: [dhcpcd](https://wiki.gentoo.org/wiki/Dhcpcd)
   ```bash
   emerge --ask net-misc/dhcpcd
   # OpenRC:
   rc-update add dhcpcd default
   # systemd:
   systemctl enable dhcpcd
   ```

2. **Wireless Network (iwd)**
   > **Reference**: [iwd](https://wiki.gentoo.org/wiki/Iwd)
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
<summary><b>Option 3: Native Scheme (Click to Expand)</b></summary>

Use init system built-in network management functions, suitable for servers or minimal environments.

**OpenRC Network Service**:
> **Reference**: [OpenRC](https://wiki.gentoo.org/wiki/OpenRC) and [OpenRC: Network Management](https://wiki.gentoo.org/wiki/OpenRC#Network_management)

```bash
vim /etc/conf.d/net
```

> **Note**: Please replace `enp5s0` below with your actual network interface name (check via `ip link`).

Write following content:
```conf
config_enp5s0="dhcp"
```

```bash
ln -s /etc/init.d/net.lo /etc/init.d/net.enp5s0 # Create network service symlink
rc-update add net.enp5s0 default                # Set auto-start
```

---

**Systemd Native Network Service**:
> **Reference**: [systemd-networkd](https://wiki.gentoo.org/wiki/Systemd/systemd-networkd), [systemd-resolved](https://wiki.gentoo.org/wiki/Systemd/systemd-resolved), [Systemd](https://wiki.gentoo.org/wiki/Systemd), [Systemd: Network](https://wiki.gentoo.org/wiki/Systemd#Network)

Systemd comes with network management functions, suitable for servers or minimal environments:
```bash
systemctl enable systemd-networkd
systemctl enable systemd-resolved
```
*Note: Need to manually write .network config file.*

</details>



### 6.4 Configure fstab

> **Reference**: [Gentoo Handbook: AMD64 - fstab](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/System) and [Gentoo Wiki: /etc/fstab](https://wiki.gentoo.org/wiki//etc/fstab)

Get UUID:
```bash
blkid
```

**Method A: Auto Generate (Recommended for LiveGUI Users)**
> **Note**: `genfstab` tool is usually included in `arch-install-scripts` package. If using Gig-OS or other Arch-based LiveISO, can use directly. Official Minimal ISO might need manual install or use Method B.

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
<summary><b>Advanced Setting: Btrfs fstab Example (Click to Expand)</b></summary>

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

> **Note**: Please ensure to use `blkid` command to get your actual UUID and replace example values above.

</details>

<details>
<summary><b>Advanced Setting: Encrypted Partition (LUKS) fstab Example (Click to Expand)</b></summary>

> **Key Point**: In `fstab`, must use UUID of **Decrypted Mapped Device**, not the UUID of Physical Partition (LUKS Container).

**1. View UUID Difference**

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

> **Reference**: [Gentoo Handbook: AMD64 - Configuring the Linux Kernel](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Kernel)
>
> **Why this step?**
> Kernel is the core of OS, managing hardware. Gentoo allows you to manually tailor kernel, keeping only needed drivers, thus achieving extreme performance and minimal size. Beginners can also choose pre-compiled kernel to get started quickly.

### 7.1 Fast Scheme: Pre-compiled Kernel

```bash
emerge --ask sys-kernel/gentoo-kernel-bin
```

Remember to regenerate bootloader config after kernel upgrade.

<details>
<summary><b>Advanced Setting: Manual Kernel Compilation (Gentoo Core Experience) (Click to Expand)</b></summary>

> **Newcomer Tip**:
> Compiling kernel is complex and time-consuming. If you want to experience Gentoo ASAP, skip this section and use pre-compiled kernel in 7.1.

Manual kernel compilation gives you full control over system features, removing unneeded drivers for a leaner, more efficient kernel.

**Quick Start** (Using Genkernel automation):
```bash
emerge --ask sys-kernel/gentoo-sources sys-kernel/genkernel
genkernel --install all  # Automatically compile and install kernel, modules and initramfs
# --install: Automatically install to /boot directory after compilation
# all: Full build (Kernel + Modules + initramfs)
```

> **Advanced Content**: If you want to dive deep into kernel configuration, use LLVM/Clang to compile kernel, enable LTO optimization etc., please refer to **[Section 16.0 Kernel Compilation Advanced Guide](/posts/gentoo-install-advanced/#section-16-kernel-advanced)**.

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

> **Reference**: [Gentoo Handbook: AMD64 - Installing Necessary System Tools](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Tools)
>
> **Why this step?**
> Stage3 only has most basic commands. We need to supplement system logger, network management, filesystem tools etc. necessary components, so system can work properly after reboot.

### 8.1 System Service Tools

**OpenRC Users** (Required):

**1. System Logger**
> **Reference**: [Syslog-ng](https://wiki.gentoo.org/wiki/Syslog-ng)
```bash
emerge --ask app-admin/syslog-ng
rc-update add syslog-ng default
```

**2. Cron Daemon**
```bash
emerge --ask sys-process/cronie
rc-update add cronie default
```

**3. Time Synchronization**
> **Reference**: [System Time](https://wiki.gentoo.org/wiki/System_time) and [System Time (OpenRC)](https://wiki.gentoo.org/wiki/System_time#OpenRC)
```bash
emerge --ask net-misc/chrony
rc-update add chronyd default
```

**systemd Users**:
systemd has built-in logger and time sync services.

**Time Synchronization**
> **Reference**: [System Time](https://wiki.gentoo.org/wiki/System_time) and [System Time (systemd)](https://wiki.gentoo.org/wiki/System_time#systemd)
```bash
systemctl enable --now systemd-timesyncd
```

### 8.3 Filesystem Tools

Install corresponding tools based on filesystem used (Required):
```bash
emerge --ask sys-fs/e2fsprogs  # ext4
emerge --ask sys-fs/xfsprogs   # XFS
emerge --ask sys-fs/dosfstools # FAT/vfat (Required for EFI partition)
emerge --ask sys-fs/btrfs-progs # Btrfs
```

## 9. Create User and Permissions {#step-9-users}

> **Reference**: [Gentoo Handbook: AMD64 - Finalizing](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Finalizing)
>
> **Why this step?**
> Linux does not recommend using root account for daily use. We need to create a normal user and grant `sudo` permission to improve system security.

```bash
passwd root # Set root password
useradd -m -G wheel,video,audio,plugdev zakk # Create user and add to common groups
passwd zakk # Set user password
emerge --ask app-admin/sudo
echo "%wheel ALL=(ALL) ALL" > /etc/sudoers.d/wheel # Allow wheel group to use sudo
```

If using systemd, add account to `network`, `lp` etc. groups as needed.

---




## 10. Install Bootloader {#step-10-bootloader}

> **Reference**: [Gentoo Handbook: AMD64 - Configuring Bootloader](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Bootloader)

### 10.1 GRUB

> **Reference**: [GRUB](https://wiki.gentoo.org/wiki/GRUB)

```bash
emerge --ask sys-boot/grub:2
mkdir -p /efi/EFI/Gentoo
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=Gentoo # Install GRUB to ESP
# Install os-prober to support multi-system detection
emerge --ask sys-boot/os-prober

# Enable os-prober (For detecting Windows etc. other OS)
echo 'GRUB_DISABLE_OS_PROBER=false' >> /etc/default/grub

# Generate GRUB config file
grub-mkconfig -o /boot/grub/grub.cfg
```

<details>
<summary><b>Advanced Setting: systemd-boot (UEFI Only) (Click to Expand)</b></summary>

> **Reference**: [systemd-boot](https://wiki.gentoo.org/wiki/Systemd/systemd-boot)

```bash
bootctl --path=/efi install # Install systemd-boot

# 1. Create Gentoo Boot Entry
vim /efi/loader/entries/gentoo.conf
```

Write following content (**Note replace UUID**):
```conf
title   Gentoo Linux
linux   /vmlinuz-6.6.62-gentoo-dist
initrd  /initramfs-6.6.62-gentoo-dist.img
options root=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx rw quiet
```
> **Note**: If using LUKS encryption, options line needs to add `rd.luks.uuid=...` etc. parameters.

**2. Update Boot Entry**:
After every kernel update, need to manually update version number in `gentoo.conf`, or use script to automate.

**2. Create Windows Boot Entry (Dual Boot)**

> If you created new EFI partition, remember to copy original Windows EFI files (EFI/Microsoft) to new partition.

```bash
vim /efi/loader/entries/windows.conf
```

Write following content:
```ini
title      Windows 11
sort-key   windows-01
efi        /EFI/Microsoft/Boot/bootmgfw.efi
```

# 3. Configure Default Boot
```bash
vim /efi/loader/loader.conf
```

Write following content:

```ini
default gentoo.conf
timeout 3
console-mode auto
```

</details>

<details>
<summary><b>Advanced Setting: Encryption Support (Encrypted Users Only) (Click to Expand)</b></summary>

> **Reference**: [Dm-crypt](https://wiki.gentoo.org/wiki/Dm-crypt)

> **Note**: Only execute this step if you chose encrypted partition in Step 3.4.

**Step 1: Enable systemd cryptsetup support**

```bash
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde

# Recompile systemd to enable cryptsetup support
emerge --ask --oneshot sys-apps/systemd
```

**Step 2: Get LUKS Partition UUID**

```bash
# Get LUKS encrypted container UUID (Not filesystem UUID inside)
blkid /dev/nvme0n1p3
```

Output Example:
```text
/dev/nvme0n1p3: UUID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" TYPE="crypto_LUKS" ...
```
Note down this **LUKS UUID** (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).

**Step 3: Configure GRUB Kernel Parameters**

```bash
vim /etc/default/grub
```

Add or modify following content (**Replace UUID with actual value**):

```bash
# Full Example (Replace UUID with your actual UUID)
GRUB_CMDLINE_LINUX="rd.luks.uuid=<LUKS-UUID> rd.luks.allow-discards root=UUID=<ROOT-UUID> rootfstype=btrfs"
```

**Parameter Explanation**:
- `rd.luks.uuid=<UUID>`: LUKS encrypted partition UUID (Get via `blkid /dev/nvme0n1p3`)
- `rd.luks.allow-discards`: Allow SSD TRIM commands to pass through encryption layer (Improve SSD performance)
- `root=UUID=<UUID>`: Decrypted btrfs filesystem UUID (Get via `blkid /dev/mapper/gentoo-root`)
- `rootfstype=btrfs`: Root filesystem type (If using ext4 change to `ext4`)

<details>
<summary><b>Step 3.1 (Alternative): Configure Kernel Parameters (systemd-boot Scheme) (Click to Expand)</b></summary>

If using systemd-boot instead of GRUB, please edit config files under `/boot/loader/entries/` (e.g., `gentoo.conf`):

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

> **Reference**: [Dracut](https://wiki.gentoo.org/wiki/Dracut) and [Initramfs](https://wiki.gentoo.org/wiki/Initramfs)

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

**Config Explanation**:
- `crypt` and `dm` modules provide LUKS decryption support
- `systemd` module used for systemd boot environment
- `btrfs` module supports btrfs filesystem (If using ext4 change to `ext4`)

### Step 6: Configure /etc/crypttab (Optional but Recommended)

```bash
vim /etc/crypttab
```

Add following content (**Replace UUID with your LUKS UUID**):
```conf
gentoo-root UUID=<LUKS-UUID> none luks,discard
```
With this config, system will automatically identify and prompt to unlock encrypted partition.

### Step 7: Regenerate initramfs

```bash
# Regenerate initramfs (Containing LUKS decryption modules)
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
# --kver: Specify kernel version
# $(make -C /usr/src/linux -s kernelrelease): Auto get current kernel version
# --force: Force overwrite existing initramfs file
```

> **Important**: After every kernel update, also need to re-run this command to generate new initramfs!

### Step 8: Update GRUB Config

```bash
grub-mkconfig -o /boot/grub/grub.cfg

# Verify initramfs is correctly referenced
grep initrd /boot/grub/grub.cfg
```

</details>



---

## 11. Pre-Reboot Checklist and Reboot {#step-11-reboot}

1. `emerge --info` executes normally without error
2. UUIDs in `/etc/fstab` are correct (Confirm with `blkid` again)
3. Root and normal user passwords set
4. `grub-mkconfig` executed or `bootctl` config completed
5. If using LUKS, confirm initramfs contains `cryptsetup`

Exit chroot and reboot:
```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
swapoff -a
reboot
```

---


> **Congratulations!** You have completed Gentoo base installation.
>
> **Next Step**: [Desktop Configuration](/posts/gentoo-install-desktop/)

> **Image Credit**: [Pixiv](https://www.pixiv.net/artworks/115453639)
